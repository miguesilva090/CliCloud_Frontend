# Plano de paridade legado → newCC (operacional)

**Data:** 2026-07-31  
**Exclusões:** reports / Crystal / mapas de impressão; emissão de documentos financeiros (facturas, recibos, NC, liquidações, SAFT, etc.).

---

## 0. Como trabalhamos (obrigatório)

1. O assistente **não escreve** no repo salvo pedido explícito (`implementa tu` / `podes proceder`).
2. Para cada fase, o assistente envia:
   - lista de ficheiros **criar** / **editar**
   - **path absoluto** (a partir da raiz `newCC`)
   - **código completo** de cada ficheiro (ou bloco completo a substituir, se o ficheiro for enorme)
3. Tu copias/aplicas; depois pedes verificação se precisares.
4. Arquitectura: **Luma primeiro**; legado só para regras/mensagens/fluxos.
5. Sem `framer-motion` / `motion.*`.

Este documento é o **roadmap**. O **código completo da fase activa** está na secção da fase (começamos pela **C1**).  
Fases seguintes: inventário aqui; código completo quando disseres *“vamos à fase C2”*.

---

## 1. Já feito (não reimplementar)

| Área | Conteúdo |
|------|----------|
| Consultas admin | Marcações, troca médicos, ordem entrada, LE, GlobalBooking, admissões, fecho, histórico, sinistrados |
| Credenciais | LoteDirect (+ ESP), exames sem papel (admin) |
| Processo clínico | Atendimento, ficha, agenda, atestados, histórico, tabelas |
| Área Comum | Entidades + tabelas mestre + config + utilitários |
| Tratamentos | Lista espera, admissões 3 modos (flags + NFalta + modal local), Fisioterapeutas + `TipoTecnico` |
| UI | Home tratamentos vazia; `PageHead` → title `CliCloud` |

Detalhe UAT B1/B2: `Frontend/src/docs/plano-fecho-b1-b2-tratamentos.md`.

---

## 2. Backlog priorizado (paridade operacional)

| Fase | Nome | Legado (âncora) | Estado |
|------|------|-----------------|--------|
| **C1** | Auxiliares + Terapeutas Ocup./Fala | `AuxiliarLst`, `TerapeutaOcupLst` | **Código abaixo — implementar** |
| **C2** | Tratamentos Marcados / Por Local / Por Utente | `TratamentosLst.aspx` | Inventário |
| **C3** | Marcações Manuais | `MarcacoesManuais.aspx` | Inventário |
| **C4** | Marcações Automáticas | `MarcacoesAutomaticas.aspx` | Inventário |
| **C5** | Planning + Pesquisa Vaga | `Planning.aspx`, `PesquisaPlanning.aspx` | Inventário |
| **C6** | Histórico tratamentos | `HistoricoTratamentosLst.aspx` | Inventário |
| **C7** | Admissões B2+ (editar sessão, desmarcar, chamar) | `AdmissoesLst` / `AdmissoesEdt` | Inventário |
| **C8** | Prescrição electrónica | `Prescricao*` / RSP | Inventário |
| **C9** | Modalidades | `Modalidades/*` | Inventário |
| **C10** | Gestão / Aprovisionamento / CC-Tesouraria (ops) | `Gestao/*`, stocks, tesouraria | Inventário |

---

## 3. Fase C1 — Auxiliares + Terapeutas Ocup./Fala

### Objectivo

Paridade menu **Entidades** tratamentos: listagem/CRUD por `TipoTecnico` (2 Auxiliar, 3 Outro), reutilizando `ListagemTecnicosPage` / `TecnicoEditPage` / `Tecnico` API (igual Fisioterapeutas).

### Legado

- `CliCloud.ASPcli/Services/WSMenus.asmx.cs` — Entidades Tratamentos  
- `~/Client/Tratamentos/AuxiliarLst.aspx`  
- `~/Client/Tratamentos/TerapeutaOcupLst.aspx`

### Nota permissões

GUIDs novos abaixo seguem o padrão `…0115…` / `…0116…`.  
**Têm de existir na licença** (como `listaEsperaTratamentos`). Se ainda não existirem, temporariamente podes apontar as rotas para `fisioterapeutas.id` até o seed/licença estar OK.

---

### C1.1 — CRIAR

#### Path

`Frontend/src/pages/area-comum/tabelas/entidades/tecnicos/constants/tecnico-admin-context.ts`

```tsx
import { modules } from '@/config/modules'
import { TIPO_TECNICO, type TipoTecnicoValue } from './tipo-tecnico'

const BASE = '/area-administrativa/tratamentos/entidades'

export type TecnicoAdminContext = {
  listagemPath: string
  tipoTecnico: TipoTecnicoValue
  entityLabel: string
  pageTitle: string
  permissionId: string
  lockTipoTecnico: true
}

const CTX: Record<string, TecnicoAdminContext> = {
  fisioterapeutas: {
    listagemPath: `${BASE}/fisioterapeutas`,
    tipoTecnico: TIPO_TECNICO.Fisioterapeuta,
    entityLabel: 'Fisioterapeuta',
    pageTitle: 'Fisioterapeutas',
    permissionId: modules.areaAdministrativa.permissions.fisioterapeutas.id,
    lockTipoTecnico: true,
  },
  'tecnicos-auxiliares': {
    listagemPath: `${BASE}/tecnicos-auxiliares`,
    tipoTecnico: TIPO_TECNICO.Auxiliar,
    entityLabel: 'Técnico Auxiliar',
    pageTitle: 'Técnicos Auxiliares',
    permissionId: modules.areaAdministrativa.permissions.tecnicosAuxiliares.id,
    lockTipoTecnico: true,
  },
  'terapeutas-ocupacionais': {
    listagemPath: `${BASE}/terapeutas-ocupacionais`,
    tipoTecnico: TIPO_TECNICO.Outro,
    entityLabel: 'Terapeuta Ocupacional/Fala',
    pageTitle: 'Terapeutas Fala/Ocupacionais',
    permissionId: modules.areaAdministrativa.permissions.terapeutasOcupacionais.id,
    lockTipoTecnico: true,
  },
}

/** Resolve contexto admin tratamentos a partir do pathname. */
export function resolveTecnicoAdminContext(
  pathname: string
): TecnicoAdminContext | null {
  if (pathname.includes(`${BASE}/fisioterapeutas`)) return CTX.fisioterapeutas
  if (pathname.includes(`${BASE}/tecnicos-auxiliares`))
    return CTX['tecnicos-auxiliares']
  if (pathname.includes(`${BASE}/terapeutas-ocupacionais`))
    return CTX['terapeutas-ocupacionais']
  return null
}

export function isTratamentosTecnicoAdminPath(pathname: string): boolean {
  return resolveTecnicoAdminContext(pathname) != null
}
```

---

### C1.2 — EDITAR

#### Path

`Frontend/src/config/modules/administrativo/area-administrativa-module.ts`

**Dentro de `permissions`, depois de `fisioterapeutas`, adicionar:**

```ts
    tecnicosAuxiliares: {
      id: '00000002-0000-0000-0115-000000000004',
      name: 'Técnicos Auxiliares',
    },
    terapeutasOcupacionais: {
      id: '00000002-0000-0000-0116-000000000004',
      name: 'Terapeutas Fala/Ocupacionais',
    },
```

---

### C1.3 — EDITAR

#### Path

`Frontend/src/config/entity-routes.ts`

**Substituir o ficheiro completo por:**

```ts
export type EntityRouteSet = {
  listagem: string
  novo: string
  detail: (id: string) => string
  editar: (id: string) => string
}

export type EntityRoutesMap = {
  utentes: EntityRouteSet
  medicos: EntityRouteSet
  organismos: EntityRouteSet
  fornecedores: EntityRouteSet
  tecnicos: EntityRouteSet
}

const AREA_COMUM_ENTIDADES_BASE = '/area-comum/tabelas/entidades'
const AREA_ADMIN_ENTIDADES_BASE = '/area-administrativa/entidades'
const FATURACAO_ENTIDADES_BASE = '/area-financeira/faturacao/entidades'
const AREA_ADMIN_TRATAMENTOS_ENTIDADES_BASE =
  '/area-administrativa/tratamentos/entidades'

const AREA_ADMIN_TRATAMENTOS_FISIO_BASE = `${AREA_ADMIN_TRATAMENTOS_ENTIDADES_BASE}/fisioterapeutas`
const AREA_ADMIN_TRATAMENTOS_AUX_BASE = `${AREA_ADMIN_TRATAMENTOS_ENTIDADES_BASE}/tecnicos-auxiliares`
const AREA_ADMIN_TRATAMENTOS_TO_BASE = `${AREA_ADMIN_TRATAMENTOS_ENTIDADES_BASE}/terapeutas-ocupacionais`

function buildEntityRoutesForBase(basePath: string): EntityRoutesMap {
  const r = (entity: string): EntityRouteSet => ({
    listagem: `${basePath}/${entity}`,
    novo: `${basePath}/${entity}/novo`,
    detail: (id: string) => `${basePath}/${entity}/${id}`,
    editar: (id: string) => `${basePath}/${entity}/${id}/editar`,
  })

  return {
    utentes: r('utentes'),
    medicos: r('medicos'),
    organismos: r('organismos'),
    fornecedores: r('fornecedores'),
    tecnicos: r('tecnicos'),
  }
}

function buildTecnicosOnlyRoutes(base: string): EntityRouteSet {
  return {
    listagem: base,
    novo: `${base}/novo`,
    detail: (id: string) => `${base}/${id}`,
    editar: (id: string) => `${base}/${id}/editar`,
  }
}

export const tratamentosFisioterapeutasRoutes =
  buildTecnicosOnlyRoutes(AREA_ADMIN_TRATAMENTOS_FISIO_BASE)
export const tratamentosAuxiliaresRoutes =
  buildTecnicosOnlyRoutes(AREA_ADMIN_TRATAMENTOS_AUX_BASE)
export const tratamentosTerapeutasOcupRoutes =
  buildTecnicosOnlyRoutes(AREA_ADMIN_TRATAMENTOS_TO_BASE)

export const entityRoutes = buildEntityRoutesForBase(AREA_COMUM_ENTIDADES_BASE)

export const faturacaoEntityRoutes = buildEntityRoutesForBase(
  FATURACAO_ENTIDADES_BASE
)

function resolvePathnameForEntityRoutes(pathname?: string): string {
  if (pathname?.trim()) return pathname
  if (typeof window !== 'undefined' && window.location?.pathname) {
    return window.location.pathname
  }
  return AREA_COMUM_ENTIDADES_BASE
}

export function resolveEntidadesBasePath(pathname?: string): string {
  const path = resolvePathnameForEntityRoutes(pathname)
  if (path.startsWith(FATURACAO_ENTIDADES_BASE)) {
    return FATURACAO_ENTIDADES_BASE
  }
  if (path.startsWith(AREA_ADMIN_ENTIDADES_BASE)) {
    return AREA_ADMIN_ENTIDADES_BASE
  }
  if (path.startsWith(AREA_ADMIN_TRATAMENTOS_FISIO_BASE)) {
    return AREA_ADMIN_TRATAMENTOS_FISIO_BASE
  }
  if (path.startsWith(AREA_ADMIN_TRATAMENTOS_AUX_BASE)) {
    return AREA_ADMIN_TRATAMENTOS_AUX_BASE
  }
  if (path.startsWith(AREA_ADMIN_TRATAMENTOS_TO_BASE)) {
    return AREA_ADMIN_TRATAMENTOS_TO_BASE
  }
  return AREA_COMUM_ENTIDADES_BASE
}

function withTecnicosOverride(tecnicos: EntityRouteSet): EntityRoutesMap {
  return {
    ...buildEntityRoutesForBase(AREA_COMUM_ENTIDADES_BASE),
    tecnicos,
  }
}

export function getEntityRoutesForPathname(pathname?: string): EntityRoutesMap {
  const path = resolvePathnameForEntityRoutes(pathname)
  if (path.startsWith(AREA_ADMIN_TRATAMENTOS_FISIO_BASE)) {
    return withTecnicosOverride(tratamentosFisioterapeutasRoutes)
  }
  if (path.startsWith(AREA_ADMIN_TRATAMENTOS_AUX_BASE)) {
    return withTecnicosOverride(tratamentosAuxiliaresRoutes)
  }
  if (path.startsWith(AREA_ADMIN_TRATAMENTOS_TO_BASE)) {
    return withTecnicosOverride(tratamentosTerapeutasOcupRoutes)
  }
  return buildEntityRoutesForBase(resolveEntidadesBasePath(pathname))
}

const LEGACY_ENTITY_PREFIXES = [
  '/utentes',
  '/medicos',
  '/organismos',
  '/fornecedores',
] as const

export function isEntityTabelasPath(pathname: string): boolean {
  return (
    pathname.startsWith(`${AREA_COMUM_ENTIDADES_BASE}/`) ||
    LEGACY_ENTITY_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}
```

---

### C1.4 — EDITAR

#### Path

`Frontend/src/config/administrativa-tratamentos-header-menu.ts`

**No topo, junto às perms existentes, adicionar:**

```ts
const permTecnicosAuxiliares =
  modules.areaAdministrativa.permissions.tecnicosAuxiliares.id
const permTerapeutasOcupacionais =
  modules.areaAdministrativa.permissions.terapeutasOcupacionais.id
```

**Nos items Entidades (Técnicos Auxiliares / Terapeutas…), trocar `funcionalidadeId: perm` por:**

```ts
      {
        label: 'Técnicos Auxiliares',
        href: '/area-administrativa/tratamentos/entidades/tecnicos-auxiliares',
        funcionalidadeId: permTecnicosAuxiliares,
      },
      {
        label: 'Terapeutas Fala/Ocupacionais',
        href: '/area-administrativa/tratamentos/entidades/terapeutas-ocupacionais',
        funcionalidadeId: permTerapeutasOcupacionais,
      },
```

---

### C1.5 — EDITAR

#### Path

`Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`

**Inserir ANTES do catch-all `area-administrativa/tratamentos/*` (e depois das rotas fisioterapeutas), o bloco:**

```tsx
  {
    path: 'area-administrativa/tratamentos/entidades/tecnicos-auxiliares',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.tecnicosAuxiliares.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemTecnicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Técnicos Auxiliares',
  },
  {
    path: 'area-administrativa/tratamentos/entidades/tecnicos-auxiliares/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.tecnicosAuxiliares.id}
        actionType={actionTypes.AuthAdd}
      >
        <TecnicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Novo técnico auxiliar',
  },
  {
    path: 'area-administrativa/tratamentos/entidades/tecnicos-auxiliares/:id',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.tecnicosAuxiliares.id}
        actionType={actionTypes.AuthVer}
      >
        <TecnicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Técnico auxiliar',
  },
  {
    path: 'area-administrativa/tratamentos/entidades/tecnicos-auxiliares/:id/editar',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.tecnicosAuxiliares.id}
        actionType={actionTypes.AuthChg}
      >
        <TecnicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Editar técnico auxiliar',
  },
  {
    path: 'area-administrativa/tratamentos/entidades/terapeutas-ocupacionais',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.terapeutasOcupacionais.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemTecnicosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Terapeutas Fala/Ocupacionais',
  },
  {
    path: 'area-administrativa/tratamentos/entidades/terapeutas-ocupacionais/novo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.terapeutasOcupacionais.id}
        actionType={actionTypes.AuthAdd}
      >
        <TecnicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Novo terapeuta',
  },
  {
    path: 'area-administrativa/tratamentos/entidades/terapeutas-ocupacionais/:id',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.terapeutasOcupacionais.id}
        actionType={actionTypes.AuthVer}
      >
        <TecnicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Terapeuta',
  },
  {
    path: 'area-administrativa/tratamentos/entidades/terapeutas-ocupacionais/:id/editar',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.terapeutasOcupacionais.id}
        actionType={actionTypes.AuthChg}
      >
        <TecnicoEditPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Editar terapeuta',
  },
```

(`ListagemTecnicosPage` e `TecnicoEditPage` já estão importados/lazy no ficheiro.)

---

### C1.6 — EDITAR (listagem)

#### Path

`Frontend/src/pages/area-comum/tabelas/entidades/tecnicos/pages/listagem-tecnicos-page.tsx`

**Substituir** os imports/`const` de contexto no início do componente (desde `const routes = …` até `contextFilters`) por:

```tsx
  const routes = getEntityRoutesForPathname(pathname)
  const adminCtx = resolveTecnicoAdminContext(pathname)
  const entityLabel = adminCtx?.entityLabel ?? 'Técnico'
  const pageTitle = adminCtx?.pageTitle ?? 'Técnicos'
  const tecnicosPermId = useScopedFuncionalidadeId(
    modules.areaComum.permissions.tecnicos.id,
    adminCtx?.permissionId ??
      modules.areaAdministrativa.permissions.fisioterapeutas.id
  )
  const { canView, canAdd, canChange, canDelete } =
    useAreaComumEntityListPermissions(tecnicosPermId)
  // ... estados delete iguais ...

  const contextFilters = adminCtx
    ? [{ id: 'tipoTecnico', value: String(adminCtx.tipoTecnico) }]
    : []
```

**Import a adicionar:**

```tsx
import { resolveTecnicoAdminContext } from '../constants/tecnico-admin-context'
```

**Substituir** `ensureFisioFilter` por:

```tsx
  const ensureTipoFilter = (next: PageFilter[]): PageFilter[] => {
    if (!adminCtx) return next
    const rest = next.filter((f) => f.id !== 'tipoTecnico')
    return [
      ...rest,
      { id: 'tipoTecnico', value: String(adminCtx.tipoTecnico) },
    ]
  }

  const onFiltersChangeSticky = (next: PageFilter[]) => {
    handleFiltersChange(ensureTipoFilter(next))
  }
```

**Toast Listagens** (opcional):

```tsx
      onClick: () =>
        toast.info(`Listagens de ${pageTitle.toLowerCase()} em desenvolvimento.`),
```

Remover referências a `isTratamentosFisioterapeutas` / `ensureFisioFilter`.

---

### C1.7 — EDITAR (edit page)

#### Path

`Frontend/src/pages/area-comum/tabelas/entidades/tecnicos/pages/tecnico-edit-page.tsx`

**Import:**

```tsx
import { resolveTecnicoAdminContext } from '../constants/tecnico-admin-context'
```

**Substituir** o bloco `isTratamentosFisioterapeutas` / `lockTipoTecnico` / `defaultTipoTecnico` / `entityLabel` por:

```tsx
  const adminCtx = resolveTecnicoAdminContext(pathname)
  const lockTipoTecnico = Boolean(adminCtx?.lockTipoTecnico)
  const defaultTipoTecnico =
    adminCtx?.tipoTecnico ?? TIPO_TECNICO.Fisioterapeuta
  const entityLabel = adminCtx?.entityLabel ?? 'Técnico'
```

(Garantir que `pathname` já vem de `useLocation()` como hoje.)

---

### C1 — Checklist de teste

- [ ] Menu Entidades → Técnicos Auxiliares abre listagem (só tipo 2)
- [ ] Menu Entidades → Terapeutas Fala/Ocupacionais (só tipo 3)
- [ ] Novo / editar: tipo locked
- [ ] Limpar filtros: tipo sticky
- [ ] Fisioterapeutas continua OK
- [ ] Licença: GUIDs `0115` / `0116` atribuídos (senão item some do menu)

---

## 4. Fases seguintes (inventário — sem código ainda)

### C2 — Tratamentos Marcados / Por Local / Por Utente

| | |
|--|--|
| Legado | `TratamentosLst.aspx` + `Services/Tratamentos.cs` |
| newCC | Service `TratamentoAdministrativoService` (ou estender existente) + FE `tratamentos/marcados/` |
| Rotas | `/tratamentos/tratamentos-marcados`, `…-por-local`, `…-por-utente` |
| Padrão | Igual lista espera / admissões (Filter + Spec + paginated) |

### C3 — Marcações Manuais

| | |
|--|--|
| Legado | `MarcacoesManuais.aspx` / `.js` |
| newCC | Orquestração sobre `Tratamento` + `SessaoTratamento` + horários |
| Complexidade | Alta — fatias (pesquisa utente → slots → gravar) |

### C4 — Marcações Automáticas

| | |
|--|--|
| Legado | `MarcacoesAutomaticas.aspx` |
| newCC | Executor dedicado se orquestração > ~80 linhas |

### C5 — Planning

| | |
|--|--|
| Legado | `Planning.aspx`, `PesquisaPlanning.aspx`, `Services/Planning*.cs` |
| newCC | Provável gateway/legado temporário se dados ainda em `dbo`/planning; preferir entidade EF se existir |

### C6 — Histórico tratamentos

| | |
|--|--|
| Legado | `HistoricoTratamentosLst.aspx?modo=*` |
| newCC | Listagens read-only por modo (datas, utente, fisio, …) |

### C7 — Admissões B2+

| | |
|--|--|
| Extender | `AdmissaoTratamentoAdministrativoService` + modais FE |
| Fora MVP actual | editar sessão, desmarcar, compensar, chamar utente |

### C8 — Prescrição

| | |
|--|--|
| Legado | `Prescricao*`, RSP |
| newCC | Módulo novo (hoje placeholder área clínica) |

### C9 — Modalidades

| | |
|--|--|
| Legado | `Modalidades/*` |
| newCC | Substituir `AreaAdministrativaTablePlaceholderPage` |

### C10 — Gestão / Aprovisionamento / CC-Tesouraria

| | |
|--|--|
| newCC | Rotas de módulo inexistentes ou placeholder |

---

## 5. Próximo passo

1. Implementar **C1** com o código desta secção.  
2. Validar checklist C1.  
3. Diz **“vamos à fase C2”** → envio ficheiros + código completo dessa fase (mesmo formato).

---

*Documento vivo. Actualizar checkboxes após cada fase.*
