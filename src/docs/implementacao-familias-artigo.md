# Implementação — Famílias de Artigos (Stocks)

**Última atualização:** 2026-06-18  
**Âmbito:** módulo **Área Financeira → Faturação → Tabelas → Artigos → Famílias de Artigos**  
**Estado:** Backend e Frontend concluídos

**Rota UI:** `/area-financeira/faturacao/tabelas/familias-artigo`

**Relacionado:**

- [`auditoria-artigos-stocks-legado-vs-novo.md`](./auditoria-artigos-stocks-legado-vs-novo.md) — gap analysis global do módulo stocks
- Implementação de referência: **Armazéns** (`Frontend/src/pages/area-financeira/faturacao/tabelas/artigos/armazens/`)

---

## 1. Resumo

| Camada | Estado | Notas |
|--------|--------|-------|
| **Backend** | ✅ Concluído | Entidade, service, controller, EF, migration aplicada |
| **Frontend** | ✅ Concluído | Páginas em `tabelas/familias-artigo/` |
| **Legado** | Referência | `Faturacao.Familia` — árvore 3 níveis (Família → Classe → Subclasse) |

### Paridade funcional com o legado

| Legado (`FamiliaArtigosLst`) | Novo |
|------------------------------|------|
| `codigoClasseFamilia` na URL | `?parentId=` (Guid) |
| Lista raiz = nível 1 | `parentId` ausente → filtro `ParentId == null` |
| Navegar para filhos (nível &lt; 3) | Botão `FolderTree` → mesma rota com `?parentId={id}` |
| Breadcrumb implícito (`nomeFamilia`) | `GET /ancestors?parentId=` + componente `Breadcrumbs` |
| Delete bloqueado com filhos | `temFilhos` + validação no BE |
| Autocomplete com `Path` | `GET /light` com campo `path` calculado |
| `UrlFoto` no formulário | Campo texto URL (upload de ficheiro fica para fase posterior) |

---

## 2. Modelo de dados

### 2.1 Tabela `Stocks.FamiliaArtigo`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Id` | `uniqueidentifier` | PK |
| `ClinicaId` | `uniqueidentifier` | Escopo por clínica |
| `Codigo` | `int` | Código sequencial por clínica (MAX+1) |
| `ParentId` | `uniqueidentifier?` | FK self — pai na hierarquia |
| `Nivel` | `int` | 1 = Família, 2 = Classe, 3 = Subclasse |
| `Descricao` | `nvarchar(50)` | Obrigatório |
| `UrlFoto` | `nvarchar(512)` | Opcional |
| Auditoria | — | `AuditableEntityWithSoftDelete` |

### 2.2 Índices e constraints

- **UK:** `(ClinicaId, Codigo)` com filtro `[DeletedOn] IS NULL`
- **Índice:** `(ClinicaId, ParentId)`
- **FK:** `ParentId` → `FamiliaArtigo.Id` (`DeleteBehavior.Restrict`)

### 2.3 Hierarquia (3 níveis)

```
Nível 1 — Família        (ParentId = null)
  └── Nível 2 — Classe   (ParentId = Família)
        └── Nível 3 — Subclasse (ParentId = Classe)
```

- Criar filho: `Nivel = parent.Nivel + 1`; bloqueado se `parent.Nivel >= 3`
- Eliminar: bloqueado se existirem registos com `ParentId = id`

---

## 3. Backend

### 3.1 Estrutura de ficheiros

```
Backend/
├── CliCloud.Domain/Entities/Stocks/
│   └── FamiliaArtigo.cs
├── CliCloud.Infrastructure/
│   ├── Persistence/Configurations/
│   │   └── FamiliaArtigoConfiguration.cs
│   ├── Persistence/Contexts/
│   │   └── ApplicationDbContext.cs          ← DbSet + ApplyConfiguration
│   ├── Mapper/
│   │   └── MappingProfiles.cs               ← maps AutoMapper
│   └── Persistence/Migrations/
│       └── 20260618145244_S02_Stocks_FamiliaArtigo.cs
├── CliCloud.Application/Services/Stocks/FamiliaArtigoService/
│   ├── IFamiliaArtigoService.cs
│   ├── FamiliaArtigoService.cs
│   ├── DTOs/
│   │   ├── FamiliaArtigoDTO.cs
│   │   ├── FamiliaArtigoTableDTO.cs
│   │   ├── FamiliaArtigoLightDTO.cs
│   │   ├── FamiliaArtigoBreadcrumbDTO.cs
│   │   ├── CreateFamiliaArtigoRequest.cs
│   │   ├── UpdateFamiliaArtigoRequest.cs
│   │   └── DeleteMultipleFamiliaArtigoRequest.cs
│   ├── Filters/
│   │   ├── FamiliaArtigoTableFilter.cs
│   │   └── FamiliaArtigoAllFilter.cs
│   └── Specifications/
│       ├── FamiliaArtigoSearchTable.cs
│       ├── FamiliaArtigoSearchList.cs
│       ├── FamiliaArtigoByClinicaSpec.cs
│       ├── FamiliaArtigoByIdClinicaSpec.cs
│       ├── FamiliaArtigoByParentSpec.cs
│       └── FamiliaArtigoChildrenSpec.cs
└── CliCloud.WebApi/Controllers/Stocks/
    └── FamiliaArtigoController.cs
```

### 3.2 API — rota base

`client/stocks/FamiliaArtigo`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/light?keyword=` | Autocomplete; inclui `path` (`/Família/Classe/...`) |
| `GET` | `/ancestors?parentId=` | Cadeia de ancestrais até ao pai actual |
| `POST` | `/paginated` | Lista paginada; body inclui `parentId` (null = raiz) |
| `POST` | `/all` | Lista completa com filtros |
| `GET` | `/{id}` | Detalhe com `path` |
| `POST` | `/` | Criar (`descricao`, `parentId?`, `urlFoto?`) |
| `PUT` | `/{id}` | Actualizar (`descricao`, `urlFoto?`) |
| `DELETE` | `/{id}` | Eliminar (falha se tiver filhos) |
| `DELETE` | `/bulk` | Eliminação múltipla |

**Autorização:** role `client` em todos os endpoints.

### 3.3 Regras de negócio (service)

- **Clínica:** todos os métodos resolvem `ClinicaId` via `ICurrentClinicaService`
- **Código:** `ObterProximoCodigoAsync` — MAX(`Codigo`) + 1 por clínica
- **Path:** construído recursivamente (`/Desc1/Desc2/Desc3`)
- **Listagem paginada:** sem `parentId` → só raiz (`ParentId == null`); com `parentId` → filhos directos
- **`TemFilhos`:** calculado em runtime na listagem (`FamiliaArtigoChildrenSpec`)
- **Validators FluentValidation:** `CreateFamiliaArtigoRequest`, `UpdateFamiliaArtigoRequest`

### 3.4 Migration

| Migration | Ficheiro | Estado |
|-----------|----------|--------|
| `S02_Stocks_FamiliaArtigo` | `20260618145244_S02_Stocks_FamiliaArtigo.cs` | ✅ Aplicada |

Comandos de referência:

```bash
cd Backend
dotnet ef migrations add S02_Stocks_FamiliaArtigo -c ApplicationDbContext -s CliCloud.WebApi -p CliCloud.Infrastructure -o Persistence/Migrations
dotnet ef database update -c ApplicationDbContext -s CliCloud.WebApi -p CliCloud.Infrastructure
```

### 3.5 Correções aplicadas na revisão (2026-06-18)

| Problema | Correção |
|----------|----------|
| `FamiliaArtigoBreadcrumbDTO.cs` com classe duplicada `FamiliaArtigoLightDTO` | Ficheiro corrigido com `FamiliaArtigoBreadcrumbDTO` |
| `CreateFamiliaArtigoRequest.ParendId` (typo) | Renomeado para `ParentId` |
| `FamiliaArtigoSearchTable` com construtor errado | Passa a receber `FamiliaArtigoTableFilter` |
| `FamiliaArtigoByIdClinicaSpec` ordem de parâmetros | Alinhado com `Armazem`: `(id, clinicaId)` |
| `FamiliaArtigoByParentSpec` namespace errado | `FamiliaArtigoService.Specifications` |
| `FamiliaArtigoConfiguration` sintaxe inválida nos índices | Chain `.IsUnique().HasFilter(...)` corrigida |
| `FamiliaArtigoChildrenSpec.cs` em falta | Ficheiro criado |
| `ApplicationDbContext` / `MappingProfiles` | Registos adicionados |

---

## 4. Legado (referência)

**Ficheiros:**

- `Dados/CliCloud.Dados.Faturacao/FamiliaArtigos.cs`
- `CliCloud.ASPcli/Client/Faturacao/FamiliaArtigosLst.js`
- `CliCloud.ASPcli/Client/Faturacao/Services/FamiliaArtigos.cs`

**Comportamento UI legado:**

- Parâmetros URL: `codigoClasseFamilia`, `nivel`, `nomeFamilia`
- Colunas: Código, Descrição, Nível
- Acções: Ver, Editar, Apagar + menu «Classes» / «Sub-Classes» (se `Nivel !== 3`)
- Ao criar: se há `codigoClasseFamilia`, o filho herda o pai e `nivel` incrementa

**Mapeamento legado → novo:**

| Legado | Novo |
|--------|------|
| `Faturacao.Familia` | `Stocks.FamiliaArtigo` |
| `CodigoFamilia` + `CodigoEmpresa` | `Codigo` + `ClinicaId` |
| `CodigoClasseFamilia` (int, ref. `Codigo`) | `ParentId` (Guid, FK) |
| `Nivel` 1/2/3 | `Nivel` 1/2/3 (igual) |

---

## 5. Frontend — visão geral

Segue o mesmo padrão de **Armazéns**:

- `AreaComumListagemPageShell` + `DataTable`
- Permissões via `useAreaComumEntityListPermissions`
- Service layer `FamiliaArtigoService` → `BaseApiClient`
- Modal CRUD `FamiliaArtigoViewCreateModal`

**Diferenças face a Armazéns:**

- Navegação hierárquica com `?parentId=` na URL
- Breadcrumb dinâmico (`GET /ancestors`)
- Botão extra na grelha para descer níveis (`FolderTree`)
- Título da página muda: Famílias → Classes → Sub-Classes
- Botão «voltar» no shell quando não está na raiz

---

## 6. Frontend — estrutura de ficheiros

```
Frontend/src/
├── types/dtos/stocks/
│   └── familia-artigo.dtos.ts
├── lib/services/stocks/familia-artigo-service/
│   ├── familia-artigo-client.ts
│   └── index.ts
└── pages/area-financeira/faturacao/tabelas/familias-artigo/
    ├── pages/
    │   └── listagem-familias-artigo-page.tsx
    ├── queries/
    │   └── listagem-familias-artigo-queries.ts
    ├── components/
    │   ├── listagem-familias-artigo-table.tsx
    │   ├── listagem-familias-artigo-table.columns.tsx
    │   └── listagem-familias-artigo-filter-controls.tsx
    └── modals/
        └── familia-artigo-view-create-modal.tsx
```

### 6.1 Alterações em ficheiros existentes

**`Frontend/src/config/menu-items.ts`** — dentro de **Artigos**, após Armazéns:

```typescript
{
  label: 'Famílias de Artigos',
  href: '/area-financeira/faturacao/tabelas/familias-artigo',
  funcionalidadeId: modules.areaFinanceira.permissions.tabelas.id,
},
```

**`Frontend/src/routes/area-financeira/areaFinanceira.tsx`**

Lazy import:

```typescript
const ListagemFamiliasArtigoPage = lazy(() =>
  import(
    '@/pages/area-financeira/faturacao/tabelas/familias-artigo/pages/listagem-familias-artigo-page'
  ).then((m) => ({ default: m.ListagemFamiliasArtigoPage })),
)
```

Rota:

```typescript
{
  path: 'area-financeira/faturacao/tabelas/familias-artigo',
  element: (
    <LicenseGuard
      requiredModule={modules.areaFinanceira.id}
      requiredPermission={modules.areaFinanceira.permissions.tabelas.id}
      actionType={actionTypes.AuthVer}
    >
      <ListagemFamiliasArtigoPage />
    </LicenseGuard>
  ),
  manageWindow: true,
  windowName: 'Famílias de Artigos',
},
```

---

## 7. Frontend — DTOs TypeScript

Ficheiro: `Frontend/src/types/dtos/stocks/familia-artigo.dtos.ts`

| Interface | Campos principais |
|-----------|-------------------|
| `FamiliaArtigoLightDTO` | `id`, `codigo`, `descricao`, `path`, `autocompleteLabel` |
| `FamiliaArtigoTableDTO` | `id`, `codigo`, `nivel`, `descricao`, `temFilhos`, `createdOn` |
| `FamiliaArtigoDTO` | extends table + `parentId`, `urlFoto`, `path`, `lastModifiedOn` |
| `FamiliaArtigoBreadcrumbDTO` | `id`, `descricao`, `nivel` |
| `FamiliaArtigoSaveBody` | `descricao`, `parentId?`, `urlFoto?` |
| `FamiliaArtigoPaginatedRequest` | paginação + `filters` + `sorting` + `parentId?` |

---

## 8. Frontend — service HTTP

Ficheiro: `Frontend/src/lib/services/stocks/familia-artigo-service/familia-artigo-client.ts`

| Método cliente | HTTP | Path |
|----------------|------|------|
| `getFamiliasArtigoPaginated` | POST | `/client/stocks/FamiliaArtigo/paginated` |
| `getFamiliasArtigoLight` | GET | `/client/stocks/FamiliaArtigo/light` |
| `getAncestors` | GET | `/client/stocks/FamiliaArtigo/ancestors` |
| `getFamiliaArtigoById` | GET | `/client/stocks/FamiliaArtigo/{id}` |
| `createFamiliaArtigo` | POST | `/client/stocks/FamiliaArtigo` |
| `updateFamiliaArtigo` | PUT | `/client/stocks/FamiliaArtigo/{id}` |
| `deleteFamiliaArtigo` | DELETE | `/client/stocks/FamiliaArtigo/{id}` |

Export: `FamiliaArtigoService()` em `index.ts` (padrão `ArmazemService`).

---

## 9. Frontend — página e fluxos

### 9.1 URL e navegação

| URL | Conteúdo |
|-----|----------|
| `/area-financeira/faturacao/tabelas/familias-artigo` | Famílias (nível 1, `parentId` null) |
| `...?parentId={guid}` | Filhos directos do registo indicado |

**Drill-down:** `navigateManagedWindow(navigate, \`${BASE_PATH}?parentId=${row.id}\`)`  
**Voltar:** último ancestral ou raiz (sem `parentId`)

### 9.2 Títulos dinâmicos

| Contexto (`parent.nivel`) | Título da página |
|---------------------------|------------------|
| Raiz | Famílias de Artigos |
| Pai nível 1 | Classes de Artigos |
| Pai nível 2 | Sub-Classes de Artigos |

### 9.3 Breadcrumb

1. Item fixo: «Famílias de Artigos» → link para raiz
2. Um item por ancestral devolvido por `GET /ancestors?parentId=`
3. Último item = página actual (não clicável — comportamento do componente `Breadcrumbs`)

### 9.4 Grelha

| Coluna | Notas |
|--------|-------|
| Código | Ordenável |
| Descrição | Pesquisa global |
| Nível | Ex.: `1 — Família`, `2 — Classe`, `3 — Subclasse` |
| Opções | Ver / Editar / Apagar + `FolderTree` se `nivel < 3` |

### 9.5 Modal CRUD

| Modo | Campos |
|------|--------|
| Criar | Descrição (obrig.), URL foto (opc.); `parentId` vem do URL |
| Editar | Descrição, URL foto |
| Ver | Todos read-only; código e nível só leitura |

### 9.6 Eliminar

- Se `temFilhos === true` → toast de erro (sem abrir diálogo)
- Caso contrário → `AlertDialog` de confirmação → `DELETE /{id}`

### 9.7 React Query — query keys

| Key | Uso |
|-----|-----|
| `['familias-artigo-paginated', params]` | Lista paginada (inclui `parentId`) |
| `['familias-artigo-ancestors', parentId]` | Breadcrumb |
| `['familias-artigo-light']` | Autocomplete (futuro) |

---

## 10. Plano de testes manuais

### Backend

- [ ] `POST /paginated` sem `parentId` → só nível 1
- [ ] `POST /paginated` com `parentId` → filhos directos
- [ ] `POST /` raiz → `nivel = 1`
- [ ] `POST /` com pai nível 1 → `nivel = 2`; com pai nível 2 → `nivel = 3`
- [ ] `POST /` com pai nível 3 → erro
- [ ] `DELETE` com filhos → erro
- [ ] `GET /ancestors?parentId=` → cadeia correcta
- [ ] `GET /light` → `path` preenchido

### Frontend (após copiar ficheiros)

- [ ] Menu **Artigos → Famílias de Artigos** abre listagem raiz
- [ ] Criar família na raiz
- [ ] Drill-down → criar classe e subclasse
- [ ] Breadcrumb e botão voltar funcionam
- [ ] Editar descrição / URL foto
- [ ] Tentar apagar registo com filhos → toast
- [ ] Apagar folha (nível 3) → sucesso
- [ ] Permissões: sem `AuthAdd` / `AuthChg` / `AuthDel` os botões respectivos não aparecem

---

## 11. Próximos passos (fora de âmbito actual)

| Item | Prioridade |
|------|------------|
| Upload de imagem (`UrlFoto`) com serviço de ficheiros | Média |
| Migração de dados `Faturacao.Familia` → `Stocks.FamiliaArtigo` | Alta (se ambiente com dados legado) |
| Autocomplete em formulário de **Artigos** (quando existir) | Após módulo Artigo |
| Eliminação em massa (`DELETE /bulk`) na UI | Baixa |
| **Unidades** e **Artigos** no mesmo módulo stocks | Ver auditoria |

---

## 12. Ordem de implementação Frontend

1. `familia-artigo.dtos.ts`
2. `familia-artigo-service/` (client + index)
3. Pasta `familias-artigo/` (queries → components → modal → page)
4. `menu-items.ts` + `areaFinanceira.tsx`
5. Reiniciar `npm run dev` e executar plano de testes (secção 10)

---

## 13. Referência cruzada — módulo Artigos (stocks)

| Item menu | Backend | Frontend | Migration |
|-----------|---------|----------|-----------|
| Armazéns | ✅ | ✅ | `S01_Stocks_Armazem` |
| **Famílias de Artigos** | ✅ | ✅ | `S02_Stocks_FamiliaArtigo` |
| Unidades | ❌ | ❌ | — |
| Artigos | ❌ | ❌ | — |
| Subsistemas Artigos | ❌ | ❌ | — |
