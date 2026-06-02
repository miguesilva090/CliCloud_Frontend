# Alinhamento FE — Faturação (Legado → Novo)

**Última atualização:** 2026-05-29  
**Âmbito:** submenu **Faturação → Faturação** e **Faturação → Novo Documento** (não inclui Fases B–F: SNS, ADSE, mapas, etc.)  
**Fontes de verdade legado:** `CliCloud.ASPcli`, `Dados/CliCloud.Dados.Faturacao`  
**Fontes de verdade novo:** `Backend/CliCloud.*`, `Frontend/src/pages/area-financeira/faturacao`

Documento complementar a `plano-area-financeira-legado-vs-novo.md`. Este ficheiro define **como** alinhar o frontend React ao comportamento e à apresentação do legado, por ecrã e por prioridade.

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
| Menu → Faturação → **Novo Documento** | `~/Client/Faturacao/TfaturaEdt.aspx` | `/area-financeira/faturacao/novo-documento` | 🟡 página mínima |
| Menu → Faturação → **Faturação** | `~/Client/Faturacao/TfaturaLst.aspx` | `/area-financeira/faturacao/faturacao` | 🟡 listagem mínima |
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

| Coluna legado (`TfaturaLst.js`) | Campo `TFaturaLst` | Novo `DocumentoTableDTO` | Alinhamento |
|--------------------------------|--------------------|---------------------------|-------------|
| N.º TFatura | `NumeroTFatura` (string composta) | `numeroDocumento` (int) | ⚠️ BE expor `numeroExibicao` na tabela (domínio já tem `Documento.NumeroExibicao`) |
| Data | `Data` | `data` | ✅ |
| Nome | `Nome` | `nomeCliente` / `utenteNome` | 🟡 mostrar como legado (prioridade nome cliente) |
| Origem | `Origem` | — | ⏳ BE+FE |
| Ref. | (coluna sem `Column` nome explícito na lista) | — | ⏳ identificar origem no legado / SP |
| Admissões | `Admissoes` | — | ⏳ BE+FE |
| Total desconto | `TotalDesconto` | — (existe em `DocumentoDTO`) | ⏳ incluir em `DocumentoTableDTO` |
| Total IVA | `TotalIva` | `totalIva` | ✅ (não mostrado na grelha FE atual) |
| Total fatura | `TotalFatura` | `totalDocumento` | ✅ |
| Estado | `Estado` (renderizado) | `estado` (número) | 🟡 FE: texto/badge, não código cru |
| (implícito) | `Abreviatura` | `tipoDocumentoAbreviatura` | ✅ coluna “Tipo” no novo |
| (implícito) | `Anulado` | — | ⏳ BE+FE badge/filtro |
| (implícito) | `Liquidado` (int 0/1/2) | `liquidado` (bool) | 🟡 mapear estados de liquidação legado |

### 3.4 Filtros

| Filtro legado (`TfaturaLst.aspx`) | Par de campos | Novo FE | API BE (`DocumentoSearchTable`) |
|-----------------------------------|---------------|---------|-----------------------------------|
| N.º TFatura | `NumeroTFatura_de` / `_ate` | só `numeroDocumento` único | `numerodocumento` (igualdade) — **sem intervalo** |
| Nome | `Nome_de` / `_ate` | `nomeCliente` único | `nomecliente` (contains) — **sem intervalo** |
| Data | `Data_de` / `_ate` | `data` única | `data` (dia exacto) — **sem intervalo** |
| N.º documento | `NumeroDocumento_de` / `_ate` | — | `numerodocumento` |
| Tipo documento | `TipoDocumento_de` / `_ate` | `tipoDocumentoId` (combo) | `tipodocumentoid` |
| Pesquisa global | caixa `LstSearchBox` | `globalSearchColumnId='numeroDocumento'` | depende coluna |

**Regra de alinhamento:** para paridade visual e funcional com o legado, o painel de filtros do novo deve usar **de / até** onde o legado usa. Isso implica **estender** `DocumentoSearchTable` (ou campos `numerodocumentoDe`/`numerodocumentoAte`, etc.) — não basta alterar só o FE.

**Referência visual FE:** `ordem-entrada-filter-controls.tsx` (labels `text-xs text-muted-foreground`, datas de/até, largura total).

### 3.5 Toolbar (acções globais)

| Acção legado | Novo atual | Prioridade |
|--------------|------------|------------|
| **Novo** → `selectTipoDocumentoGeral()` (modal tipo + série) | botão “Novo Documento” → navega directo para form | **P0** — modal tipo+série antes do editor |
| **Listagens** → Crystal `ListagemTFaturaPage.rpt` | botão sem `onClick` | **P1** — integrar relatórios quando stack de reports existir; até lá ocultar |
| **Atualizar** | ✅ | — |
| **Envio e-mails em série** | — | **P2** |
| **Gerar multi e-faturas** | — | **P2** |

### 3.6 Acções por linha

Legado: ícones rápidos (e-mail, SMS, WhatsApp, ver) + dropdown **Tarefas** (`fa-tasks`).

| Acção legado (condição resumida) | Novo | Prioridade |
|----------------------------------|------|------------|
| Ver → `TfaturaEdt.aspx?oper=ver` | dialog detalhe mínimo | **P0** → página/modal estilo edição ver |
| Anular / ver motivo anulação | dialog anular | **P0** — bloquear se `anulado`; mostrar motivo se anulado |
| Imprimir / imprimir original | — | **P1** (reports) |
| Pagamento (FA/FS liquidada) | — | **P1** |
| Emitir fatura (GT/GR/CM/FP) | — | **P1** |
| Validação transporte (GT/GR) | — | **P2** |
| Nota crédito (no editor; na lista via fluxos NC) | dialog NC na lista | **P0** — regras por `Abreviatura` |
| E-fatura / E-NC | — | **P2** |
| E-mail / SMS / WhatsApp | — | **P2** |
| Resumo FA / Excel | — | **P2** |
| Imprimir ARS / acordo | — | **P2** |
| Detalhes admissões | — | **P1** |
| Ticket | — | **P2** |

**Regra visual FE:** substituir ícones soltos na coluna por `DropdownMenu` “Tarefas” (padrão próximo do legado), mantendo no máximo 1–2 ícones de atalho (ex. ver, e-mail) se necessário.

**Referência componente:** `DropdownMenu` + itens condicionais; permissões via `useAreaComumEntityListPermissions` e flags vindas do DTO (`anulado`, `tipoDocumentoAbreviatura`, `emitido`, `liquidado`).

### 3.7 Estado actual vs alvo (listagem)

| Aspeto | Actual | Alvo alinhado |
|--------|--------|---------------|
| Shell | `AreaComumListagemPageShell` | ✅ manter |
| Filtros | grelha com `max-w` fixos | painel estilo ordem de entrada, de/até |
| Colunas | 6 visíveis | 10+ alinhadas à secção 3.3 |
| Detalhe | dialog 8 campos | modal com tabs ou rota `TfaturaEdt` equivalente |
| Linha opções | Ver + 2 ícones | Dropdown tarefas |

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
| Página | `novo-documento-page.tsx` |
| Form | `novo-documento-form.tsx` |
| Emissão API | `POST .../DocumentoEmissao/emitir` |

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

## 6. Mapa Backend ↔ Legado (pré-requisitos FE)

Endpoints já existentes:

| Operação | Endpoint novo |
|----------|---------------|
| Listagem paginada | `POST /client/documentos/Documento/paginated` |
| Detalhe | `GET /client/documentos/Documento/{id}` |
| Tipos (combo) | `GET /client/documentos/TipoDocumento/light` |
| Emitir | `POST /client/documentos/DocumentoEmissao/emitir` |
| Anular | `POST /client/documentos/DocumentoEmissao/anular/{id}` |
| NC | `POST /client/documentos/DocumentoEmissao/nota-credito` |
| Emitir desde admissão/consulta | `POST .../emitir/admissao/{id}`, `.../consulta/{id}` |

Gaps BE que bloqueiam paridade visual/funcional na listagem:

| Gap | Entidade/DTO | Impacto FE |
|-----|--------------|------------|
| `Anulado`, `MotivoAnulacao`, `DataAnulacao` não em `DocumentoTableDTO` | `Documento` tem `Anulado` | coluna/filtro/regras de acções |
| `NumeroExibicao` não em `DocumentoTableDTO` | `Documento.NumeroExibicao` | coluna “N.º TFatura” |
| `Origem`, totais desconto, resumo admissões na lista | `TFaturaLst` | colunas em falta |
| Listagem inclui **Recibos** (TPT) | `Documento` + `Recibo` | mistura documentos na grelha “Faturação” |
| Filtros só valor único, sem **de/até** | `DocumentoSearchTable` | painel filtros legado |
| Filtro `anulado` | — | checkbox legado implícito |
| `GET Documento/{id}` sem **linhas** no DTO | `DocumentoLinha` | tab linhas no detalhe |
| `TipoSerie` / série documento | tipo documento legado | modal novo documento |

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

## 8. Plano de alinhamento FE (fases)

### Fase V0 — Estabilização (sem mudar UX legado)

- [ ] Corrigir nomenclatura ficheiros (`table.columns.tsx` em vez de `colums`)
- [ ] Remover botões mortos ou marcar `@todo` visível na UI
- [ ] Documentar `idFuncionalidade: 'documentos'` em todos os clients

### Fase V1 — Listagem reconhecível (P0)

**BE (bloqueante):** `Anulado`, `NumeroExibicao`, excluir recibos, filtros de/até ou equivalente.

**FE:**

- [ ] Colunas secção 3.3 (mínimo: n.º exibição, data, nome, tipo, total, IVA, desconto, estado textual, anulado, liquidado)
- [ ] Filtros de/até + NIF opcional
- [ ] Dropdown “Tarefas” com itens P0 (ver, anular/ver motivo, NC condicional)
- [ ] Modal novo: **tipo documento (+ série)**
- [ ] Pesquisa global alinhada ao campo que o utilizador espera (n.º exibição)

**Critério aceite:** utilizador legado identifica o ecrã como “a listagem de faturas” sem treinar.

### Fase V2 — Editor mínimo credível (P0)

- [ ] Página `documento-edicao-page` (create/view) substitui form solto
- [ ] Tabs Cliente + Linhas (A1→A2)
- [ ] `form-styles` em todo o formulário
- [ ] Totais calculados na UI (subtotal, IVA, total) como feedback visual

### Fase V3 — Detalhe e NC/anular completos (P1)

- [ ] Detalhe com linhas (depende BE)
- [ ] NC parcial com grelha de linhas
- [ ] Integração impressão/listagens quando definido stack de reports no novo

### Fase V4 — Paridade alargada (P2)

- [ ] Comunicações (e-mail, SMS, WhatsApp)
- [ ] E-fatura, transporte, conversões GT→FA, etc.

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

## 10. O que o FE actual implementa (baseline 2026-05-29)

| Item | Estado |
|------|--------|
| Rotas `faturacao/faturacao` e `novo-documento` | ✅ ligadas |
| Listagem paginada | ✅ |
| Filtros parciais (5 campos) | 🟡 |
| Colunas reduzidas | 🟡 |
| Detalhe dialog simples | 🟡 |
| Anular / NC dialogs | 🟡 |
| Novo documento form mínimo | 🟡 |
| Paridade legado listagem | ❌ |
| Paridade legado editor | ❌ |
| Paridade visual design system | ❌ |

---

## 11. Decisão registada (equipa)

> **2026-05-29:** Manter implementação actual em produção/dev sem refactor visual imediato.  
> Este documento fica como **contrato de alinhamento** para quando a faturação for retomada.

---

## 12. Referências rápidas

| Tema | Legado | Novo |
|------|--------|------|
| Menu | `WSMenus.asmx.cs` → `case "Faturacao"` | `config/menu-items.ts` → `area-financeira` |
| Lista | `TfaturaLst.*` | `listagem-faturacao-*` |
| Editor | `TfaturaEdt.*` | `novo-documento-*` (provisório) |
| DTO lista | `TFaturaLst` em `TFatura.cs` | `DocumentoTableDTO.cs` |
| Domínio | `TFatura` / `TFaturaLinha` | `Documento` / `DocumentoLinha` |
| Plano geral | — | `plano-area-financeira-legado-vs-novo.md` |

---

## Histórico

| Data | Alteração |
|------|-----------|
| 2026-05-29 | Documento inicial de alinhamento FE legado ↔ novo (Faturação / Faturação) |
