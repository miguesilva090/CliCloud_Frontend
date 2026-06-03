# Alinhamento FE — Faturação (Legado → Novo)

**Última atualização:** 2026-06-03  
**Âmbito:** submenu **Faturação → Faturação** e **Faturação → Novo Documento** (não inclui Fases B–F: SNS, ADSE, mapas, etc.)  
**Fontes de verdade legado:** `CliCloud.ASPcli`, `Dados/CliCloud.Dados.Faturacao`  
**Fontes de verdade novo:** `Backend/CliCloud.*`, `Frontend/src/pages/area-financeira/faturacao`

> **Estado de implementação e disparidades:** ver **[`disparidades-faturacao-legado-vs-novo.md`](./disparidades-faturacao-legado-vs-novo.md)** (fonte de verdade).  
> Este ficheiro mantém **princípios de UX**, mapas de ficheiros e padrões visuais — **não** duplicar checklists de «o que falta».

Documento complementar a `plano-area-financeira-legado-vs-novo.md`.

---

## 1. Princípios de alinhamento

1. **Legado primeiro** — cada ecrã novo deve mapear para um `.aspx` + `.js` concreto; não inventar fluxos só porque a API REST existe.
2. **Paridade por camadas** — dados (DTO) → regras (BE) → UI (FE). Sem `Anulado` no DTO, a grelha legado não se replica.
3. **Design system do projeto novo** — visual alinhado ao legado em *informação e fluxo*; componentes React seguem padrões já usados (ex. ordem de entrada, admissões), não o CSS Metronic do ASP.
4. **Entregas incrementais** — cada marco fecha checklist visual + funcional testável contra o legado.
5. **Sem framer-motion** — regra do repositório.

---

## 2. Mapa de navegação

| Legado (`WSMenus.asmx.cs`) | URL legado | Novo (`menu-items.ts` + rotas) | Estado FE |
|----------------------------|------------|--------------------------------|-----------|
| Menu → Faturação → **Novo Documento** | `~/Client/Faturacao/TfaturaEdt.aspx` | `/area-financeira/faturacao/novo-documento` | ✅ editor + modal tipo |
| Menu → Faturação → **Faturação** | `~/Client/Faturacao/TfaturaLst.aspx` | `/area-financeira/faturacao/faturacao` | ✅ listagem operacional |
| Ver documento (lista) | `TfaturaEdt.aspx?oper=ver` | `/area-financeira/faturacao/documento/:id` | ✅ só leitura |
| Permissões | `Faturacao_NovoDoc`, `Faturacao_FaturacaoListagem` | `modules.areaFinanceira.permissions.faturacao` | 🟡 granularidade a validar |

**Nota:** No legado, “Novo Documento” abre o **mesmo editor** (`TfaturaEdt`) que “ver/editar” na listagem. No novo há rota separada `novo-documento` — aceitável se o **conteúdo** do formulário for o equivalente a `TfaturaEdt` em modo inserção.

---

## 3. Ecrã 1 — Listagem (`TfaturaLst`)

### 3.1 Ficheiros legado

| Tipo | Caminho |
|------|---------|
| UI | `CliCloud.ASPcli/Client/Faturacao/TfaturaLst.aspx` |
| Lógica | `CliCloud.ASPcli/Client/Faturacao/TfaturaLst.js` |
| API lista | `Services/WSFaturacao.asmx` → `TfaturaLst` |
| DTO lista | `Dados/CliCloud.Dados.Faturacao/TFatura.cs` → classe `TFaturaLst` |

### 3.2 Ficheiros novo (atual)

| Tipo | Caminho |
|------|---------|
| Página | `Frontend/src/pages/area-financeira/faturacao/pages/listagem-faturacao-page.tsx` |
| Tabela | `.../components/listagem-faturacao-table.tsx` |
| Colunas | `.../components/listagem-faturacao-table.colums.tsx` |
| Filtros | `.../components/listagem-faturacao-filter-controls.tsx` |
| Queries | `.../queries/documento-queries.ts` |
| API | `POST /client/documentos/Documento/paginated` |

### 3.3 Colunas da grelha

**Estado 2026-06-03:** alinhadas em `listagem-faturacao-table.colums.tsx`. Detalhe e lacunas residuais: [`disparidades-faturacao-legado-vs-novo.md`](./disparidades-faturacao-legado-vs-novo.md) §5.

| Coluna legado | Novo `DocumentoTableDTO` / FE | Estado |
|---------------|-------------------------------|--------|
| N.º TFatura | `numeroExibicao` + `getDocumentoNumeroLabel` | ✅ |
| Data, Nome, Origem, Ref., Admissões | `data`, `nomeCliente`, `origemLabel`, `referenciaDocumento`, `admissoesResumo` | ✅ (Ref./Admissões 🟡 regras pós-MVP) |
| Totais desconto / IVA / fatura | `totalDesconto`, `totalIva`, `totalDocumento` | ✅ |
| Estado | `getDocumentoEstadoBadge` | ✅ 🟡 textos legado |
| Anulado / Liquidado (filtros) | colunas ocultas + painel filtros | ✅ |

### 3.4 Filtros

| Filtro legado | Novo FE (`listagem-faturacao-filter-controls.tsx`) | BE `DocumentoSearchTable` |
|---------------|---------------------------------------------------|---------------------------|
| N.º documento de/até | ✅ `numerodocumento_de` / `_ate` | ✅ |
| Data de/até | ✅ `data_de` / `data_ate` | ✅ |
| Nome de/até | 🟡 campo único «Cliente» (`nomeCliente`); BE tem `nomecliente_de/ate` sem UI | ✅ BE; 🟡 FE |
| Tipo documento | ✅ combo `tipoDocumentoId` | ✅ `tipodocumentoid` |
| Anulado / Liquidado | ✅ selects | ✅ |
| Pesquisa global | `globalSearchColumnId='numeroExibicao'` | `numeroexibicao` |

**Referência visual FE:** `ordem-entrada-filter-controls.tsx`.

### 3.5 Toolbar (acções globais)

| Acção legado | Novo atual | Prioridade |
|--------------|------------|------------|
| **Novo** → `selectTipoDocumentoGeral()` | botão → `SelecionarTipoDocumentoDialog` → `/novo-documento` | ✅ tipo; 🟡 série explícita se exigida |
| **Listagens** → Crystal `ListagemTFaturaPage.rpt` | botão sem `onClick` | **P1** — integrar relatórios quando stack de reports existir; até lá ocultar |
| **Atualizar** | ✅ | — |
| **Envio e-mails em série** | — | **P2** |
| **Gerar multi e-faturas** | — | **P2** |

### 3.6 Acções por linha

Legado: ícones rápidos (e-mail, SMS, WhatsApp, ver) + dropdown **Tarefas** (`fa-tasks`).

| Acção legado (condição resumida) | Novo | Prioridade |
|----------------------------------|------|------------|
| Ver | `documento/:id` (editor view) | ✅ |
| Anular / NC | dialogs + regras em `listagem-faturacao-acoes.ts` | ✅ |
| Imprimir / original / e-mail | mutations print + email | ✅ (não Crystal) |
| Pagamento / liquidar | `liquidacao-utente` / `organismo` | 🟡 mínimo |
| Emitir fatura GT/GR | listagem | ✅ |
| Validação transporte | dialog | ✅ |
| E-fatura, SMS, WhatsApp, ARS, ticket, Excel resumo | — | Fora âmbito (disparidades doc) |
| Detalhes admissões | dialog | ✅ |

**Regra visual FE:** substituir ícones soltos na coluna por `DropdownMenu` “Tarefas” (padrão próximo do legado), mantendo no máximo 1–2 ícones de atalho (ex. ver, e-mail) se necessário.

**Referência componente:** `DropdownMenu` + itens condicionais; permissões via `useAreaComumEntityListPermissions` e flags vindas do DTO (`anulado`, `tipoDocumentoAbreviatura`, `emitido`, `liquidado`).

### 3.7 Estado actual (listagem) — 2026-06-03

| Aspeto | Estado |
|--------|--------|
| Shell `AreaComumListagemPageShell` | ✅ |
| Colunas legado | ✅ |
| Filtros nº/data de/até + anulado/liquidado/tipo | ✅ |
| Filtro nome de/até | 🟡 ver disparidades #2 |
| Ver documento | ✅ rota `documento/:id` |
| Ações linha | ✅ ícones (não dropdown legado — por desenho) |

---

## 4. Ecrã 2 — Editor (`TfaturaEdt`)

### 4.1 Ficheiros legado

| Tipo | Caminho |
|------|---------|
| UI | `CliCloud.ASPcli/Client/Faturacao/TfaturaEdt.aspx` |
| Lógica | `CliCloud.ASPcli/Client/Faturacao/TfaturaEdt.js` (~4500+ linhas) |
| Linhas | objeto `TFaturaLinha` + modal `modalTFaturaLinha` |
| Dados | `Dados/CliCloud.Dados.Faturacao/TFatura.cs`, `TFaturaLinha.cs` |

### 4.2 Ficheiros novo (atual)

| Tipo | Caminho |
|------|---------|
| Página criar | `novo-documento-page.tsx` + `SelecionarTipoDocumentoDialog` |
| Editor | `documento-editor.tsx` + `hooks/use-documento-editor.ts` + `documento-tab-*.tsx` |
| Página ver | `documento-edicao-page.tsx` |
| Emissão API | `POST .../DocumentoEmissao/emitir` |

`novo-documento-form.tsx` existe mas o fluxo principal é o **editor** — não duplicar form mínimo paralelo.

### 4.3 Estrutura por tabs (legado)

| Tab legado | Conteúdo principal | Novo | Prioridade |
|------------|-------------------|------|------------|
| Dados cliente | utente/organismo, cliente, NIF, morada, CP, localidade | cabeçalho parcial (nome, morada, NIF) | **P0** |
| Linhas documento | grelha + inserir tipos linha + artigo + IVA + descontos + NC linha | lista simples desc/qtd/preço | **P0** evolução faseada |
| Condições | (tab muitas vezes oculta) | — | **P1** |
| Admissões | ligação admissões | — | **P1** |
| Retenção fonte | condicional | — | **P2** |
| Referência MB | condicional | — | **P2** |

### 4.4 Linha de documento (`TFaturaLinha` / modal)

Campos mínimos legado no modal de linha:

- Artigo (autocomplete), descrição, quantidade, preço  
- IVA (taxa, motivo isenção)  
- Preço utente / organismo / margem  
- Descontos 1–3  
- Armazém, lote (stocks)  
- Motivo NC (linhas de nota de crédito)

**Mapeamento BE:** `EmitirDocumentoLinhaRequest` já suporta parte disto; o FE deve evoluir em fases:

| Fase FE | Campos linha |
|---------|----------------|
| **A1** (actual+) | descrição, quantidade, preço, `taxaIvaPercentagem` |
| **A2** | autocomplete artigo, IVA readonly da empresa |
| **A3** | descontos, preços utente/organismo |
| **A4** | armazém, lote, motivo NC |

### 4.5 Fluxo criar documento

```
Legado:
  Listagem → [Novo] → Modal Tipo Documento + Série → TfaturaEdt.aspx?oper=ins&CodigoTipoDocumento=...

Novo (alvo):
  Listagem → [Novo] → Modal tipo (+ série quando BE expuser) → /novo-documento?tipoDocumentoId=... 
           OU página única documento-edicao-page com mode=create|view|edit
```

**Regra:** não usar `AreaComumListagemPageShell` no editor; usar shell de **edição** (card + `form-styles` + footer Gravar/Emitir/Cancelar).

**Referências visuais no projeto:**

- `admissao-view-edit-modal.tsx` — tabs, `form-styles`, secções  
- `admissao-servico-linha-modal.tsx` — linha editável  
- `@/lib/form-styles` — obrigatório em todos os campos

### 4.6 Modos operação

| Modo legado (`oper`) | Novo alvo |
|----------------------|-----------|
| `ins` | create — emitir |
| `ver` | read-only — detalhe |
| `chg` | edit — se BE permitir alteração pós-emissão (validar regras legado) |

---

## 5. Diálogos auxiliares (listagem)

### 5.1 Anular (`modalAnular` legado)

| Campo legado | `AnularDocumentoRequest` BE | FE actual |
|--------------|----------------------------|-----------|
| Motivo (obrigatório) | `motivoAnulacao` | ✅ |
| — | `dataAnulacao` | 🟡 opcional no FE |
| — | `reverterEstadosClinicos` | 🟡 checkbox (legado pode ter lógica diferente) |

**Alinhamento:** se `anulado`, não mostrar “Anular”; mostrar “Ver motivo anulação” (legado `modalAnularReason`).

### 5.2 Nota de crédito

Legado: fluxo complexo no editor (`OnClickSelectMotivoNotaCredito`, linhas com motivo NC).  
Novo: `CriarNotaCreditoRequest` + dialog na listagem.

| Aspecto | Alinhamento |
|---------|-------------|
| Crédito total vs parcial | manter flag `creditoTotal`; parcial exige grelha de linhas |
| Tipo NC | combo tipos — filtrar só abreviaturas NC no FE |
| Motivo | obrigatório ✅ |

### 5.3 Detalhe

| Legado | Novo alvo |
|--------|-----------|
| `verRegisto` → ecrã completo | Modal com tabs: **Cabeçalho \| Linhas \| Totais \| Histórico** |
| Linhas na fatura | `GET Documento/{id}` deve incluir `linhas[]` (BE: spec com include) |

---

## 6. Mapa Backend ↔ Legado

Endpoints: ver tabela em [`disparidades-faturacao-legado-vs-novo.md`](./disparidades-faturacao-legado-vs-novo.md) §2.

**Gaps BE/FE ainda relevantes (pós-MVP):** `FaturaGlobalObter`, `Documento.SinistradoId`, filtro nome FE, liquidação profunda, reabrir emitido — **não** repetir aqui; ver disparidades §4.

---

## 7. Mapa de dados (resumo)

```
Legado TFatura (int Codigo)     →  Novo Documento (Guid Id)
Legado NumeroTFatura (string)  →  Documento.NumeroExibicao
Legado NumeroDocumento (int)   →  Documento.NumeroDocumento
Legado CodigoTipoDocumento     →  TipoDocumentoId (Guid)
Legado Liquidado (0|1|2)       →  bool Liquidado (+ possível enum futuro)
Legado Anulado (0|1)           →  bool Anulado
```

---

## 8. Plano de alinhamento FE (fases) — histórico

| Fase | Estado 2026-06-03 |
|------|-------------------|
| V1 Listagem | ✅ fechado no MVP (lacunas: disparidades §4) |
| V2 Editor | ✅ `documento-editor` + tabs |
| V3 Detalhe / NC / anular | ✅ dialogs + ver documento |
| V4+ (reports, SMS, e-fatura, dropdown tarefas) | Fora âmbito ou pós-MVP |

**Trabalho FE seguinte:** seguir roadmap em [`disparidades-faturacao-legado-vs-novo.md`](./disparidades-faturacao-legado-vs-novo.md) §7 — não reabrir V1/V2.

---

## 9. Checklist visual (design system novo)

Aplicar em **todos** os ecrãs de faturação quando se retomar o alinhamento:

| Regra | Referência no projeto |
|-------|------------------------|
| Labels `text-xs text-muted-foreground` | `ordem-entrada-filter-controls.tsx` |
| Inputs `inputClass` / `selectTriggerClass` | `@/lib/form-styles` |
| Espaço entre campos `fieldGap` / `formBlockGap` | `admissao-view-edit-modal.tsx` |
| Listagem | `AreaComumListagemPageShell` + `DataTable` |
| Edição | **não** usar shell de listagem; card + tabs |
| Valores monetários | `toLocaleString('pt-PT', { minimumFractionDigits: 2 })` |
| Estados | `Badge` (anulado, liquidado, exportado) |
| Acções linha | `DropdownMenu` agrupado |

---

## 10. Baseline FE (2026-06-03)

Resumo: **MVP Faturação/Faturação fechado** no FE. Detalhe: [`disparidades-faturacao-legado-vs-novo.md`](./disparidades-faturacao-legado-vs-novo.md).

| Item | Estado |
|------|--------|
| Rotas listagem / novo / documento / liquidação | ✅ |
| Listagem + colunas + ações legado (sem Crystal/SMS) | ✅ |
| Editor tabs + sinistrados + fatura global datas | ✅ |
| Filtro nome de/até | 🟡 |
| Fatura global linhas (`FaturaGlobalObter`) | ⏳ |
| Reabrir documento emitido | ⏳ |

---

## 11. Decisão registada (equipa)

> **2026-05-29:** Pausa refactor visual.  
> **2026-06-03:** MVP listagem + editor entregue; este doc = padrões UX; disparidades = lacunas e roadmap.

---

## 12. Referências rápidas

| Tema | Legado | Novo |
|------|--------|------|
| Menu | `WSMenus.asmx.cs` → `case "Faturacao"` | `config/menu-items.ts` → `area-financeira` |
| Lista | `TfaturaLst.*` | `listagem-faturacao-*` |
| Editor | `TfaturaEdt.*` | `documento-editor.tsx`, `novo-documento-page.tsx`, `documento-edicao-page.tsx` |
| DTO lista | `TFaturaLst` em `TFatura.cs` | `DocumentoTableDTO.cs` |
| Domínio | `TFatura` / `TFaturaLinha` | `Documento` / `DocumentoLinha` |
| Plano geral | — | `plano-area-financeira-legado-vs-novo.md` |

---

## Histórico

| Data | Alteração |
|------|-----------|
| 2026-05-29 | Documento inicial de alinhamento FE legado ↔ novo (Faturação / Faturação) |
| 2026-06-03 | Sincronizado com auditoria código; estado MVP; removidas listas obsoletas de gaps BE; referência a disparidades.md |
