# Lista de Espera Tratamentos — funcionalidade por registar na licença

**Data:** 2026-07-14  
**Fase:** A1 — Lista de Espera Tratamentos (Área Administrativa)  
**Estado:** Implementação FE/BE concluída; **permissão ainda não disponível na licença do utilizador de teste**.

---

## Sintoma

No header **Tratamentos → Lista de Espera (Prescrições)** o item **não aparecia** no dropdown (só Marcações Automáticas, Marcações Manuais, etc.).

**Causa:** o menu filtra sub-itens pela permissão `funcionalidadeId`. O GUID no FE tinha de coincidir **exactamente** com o devolvido pela licença (`0014-…005`).

---

## Funcionalidade no projeto novo

| Campo | Valor |
|-------|--------|
| **Nome** | Lista de espera tratamentos |
| **GUID (perm)** | `00000002-0000-0000-0014-000000000005` |
| **Módulo** | Área Administrativa (`00000002-0000-0000-0000-000000000004`) |
| **Definição FE** | `Frontend/src/config/modules/administrativo/area-administrativa-module.ts` → `permissions.listaEsperaTratamentos` |

### Onde é usada

| Camada | Ficheiro / local |
|--------|------------------|
| Menu header | `Frontend/src/config/administrativa-tratamentos-header-menu.ts` — 1.º item em **Tratamentos** |
| Rota | `area-administrativa/tratamentos/lista-espera` em `areaAdministrativa.tsx` |
| Página | `Frontend/src/pages/area-administrativa/tratamentos/lista-espera/` |
| API | `GET/POST …/client/tratamentos/lista-espera-tratamento-administrativo` |
| Backend | `ListaEsperaTratamentoAdministrativoController` + `ListaEsperaTratamentoAdministrativoService` |

### URL directa (quando permissão OK)

```
/area-administrativa/tratamentos/lista-espera
```

---

## Paridade legado

| Legado | Notas |
|--------|--------|
| Ecrã | `CliCloud.ASPcli/Client/Tratamentos/ListEsperaLst.aspx` (+ `ListEsperaEdt`) |
| Menu | `WSMenus.asmx.cs` case `"Tratamentos"` → **Lista de Espera (Prescrições)** |
| Funcionalidade menu legado | `AppControl.Funcionalidades.Tratamentos_Listaesperaconsultas` |
| Dados | `Dados/CliCloud.Dados.Tratamentos/ListaEsperaTratamentos.cs` |

No legado o menu usa `Tratamentos_Listaesperaconsultas`; no novo projecto a permissão dedicada ficou mapeada como **`0114`** (lista de espera **tratamentos**, distinta de `0112` lista de espera **consultas**).

---

## Contorno temporário (dev)

Até a funcionalidade estar registada na licença, foi aplicado fallback para **Consultas** (`0089`):

1. **Menu:** `funcionalidadeFallbackIds: [consultas.id]` no item *Lista de Espera (Prescrições)*.
2. **Rota:** `permissionFallbackIds: [consultas.id]` no `LicenseGuard` da rota `lista-espera`.

Isto **não substitui** o registo formal da funcionalidade — serve só para desenvolvimento/testes quando a licença ainda não inclui `0114`.

---

## O que falta fazer (checklist)

- [ ] **Registar a funcionalidade `0114`** no sistema de licenças / catálogo de funcionalidades (Globalsoft / Luma), módulo Área Administrativa.
- [ ] **Atribuir `0114`** ao perfil/licença dos utilizadores que devem aceder à Lista de Espera Tratamentos (flags mínimas: `AuthVer`; CRUD conforme legado: `AuthAdd`, `AuthChg`, `AuthDel`).
- [ ] **Validar login:** após atribuição, o token/sessão deve incluir `00000002-0000-0000-0014-000000000005` em `permissions` (store `permissions-store`).
- [ ] **Testar menu:** Tratamentos → **Lista de Espera (Prescrições)** visível **sem** depender do fallback `0089`.
- [ ] **(Opcional)** Remover fallbacks temporários em `administrativa-tratamentos-header-menu.ts` e `areaAdministrativa.tsx` quando todas as licenças de cliente tiverem `0114`.

---

## Como verificar se a permissão está activa

No browser (utilizador autenticado):

1. Abrir DevTools → Application / Storage ou inspecionar estado da app.
2. Confirmar que existe entrada para `00000002-0000-0000-0014-000000000005` com `AuthVer: true` (e restantes flags se aplicável).
3. Se **não existir**, o item continua oculto no menu (salvo fallback) e acções na página podem ficar desactivadas (`useAreaComumEntityListPermissions` usa só `0114`).

---

## Referência rápida — permissões relacionadas

| Permissão | GUID | Uso |
|-----------|------|-----|
| Consultas (genérico) | `00000002-0000-0000-0089-000000000004` | Fallback temp.; restantes itens header Tratamentos |
| Lista espera **consultas** | `00000002-0000-0000-0112-000000000004` | Marcações → Lista de Espera (consultas) |
| Lista espera **tratamentos** | `00000002-0000-0000-0014-000000000005` | **Esta funcionalidade (A1)** |
