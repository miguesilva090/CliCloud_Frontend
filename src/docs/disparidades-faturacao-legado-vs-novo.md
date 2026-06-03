# Disparidades — Faturação (Legado vs Novo)

**Última atualização:** 2026-06-03 (auditoria ao código — estado real)  
**Âmbito:** **Faturação → Faturação** — `TfaturaLst` / `TfaturaEdt` vs `area-financeira/faturacao` + `DocumentoEmissaoService`.  
**Não inclui:** resto do menu Faturação (ADSE, mapas, ficheiro eletrónico, etc.) nem **reports / Crystal**.

**Princípio:** paridade **funcional** no fluxo principal — **não** réplica espelhada do ASP (UI, WS, nomes de campos).

> **Fonte de verdade** para este ramo. Os ficheiros `alinhamento-fe-faturacao-legado-vs-novo.md`, `auditoria-menu-faturacao-legado-vs-novo.md` e `plano-area-financeira-legado-vs-novo.md` devem **alinhar-se** a este documento (não duplicar checklists contraditórios).

---

## Hierarquia da documentação

| Documento | Papel |
|-----------|--------|
| **Este ficheiro** | Disparidades reais, MVP fechado, checklist pós-MVP |
| `plano-area-financeira-legado-vs-novo.md` | Roadmap Área Financeira, estrutura de pastas, fases B–H |
| `auditoria-menu-faturacao-legado-vs-novo.md` | Menu completo legado (~55 ecrãs) vs placeholders |
| `alinhamento-fe-faturacao-legado-vs-novo.md` | Padrões FE (form-styles, componentes); **não** usar estados de implementação desatualizados das secções antigas |

---

## FECHADO — Faturação / Faturação (MVP operacional)

**Estado:** ✅ **FECHADO** para uso diário de documentos de faturação, com exclusões e checklist pós-MVP abaixo.

### Fora de âmbito (não conta para este fecho)

| Item | Motivo |
|------|--------|
| Impressão completa (ARS, ticket, todos os modos Crystal) | Reports — épico à parte (`GET .../print` existe; não é paridade Crystal) |
| `TfaturaListagemReport`, Excel resumo FA | Reports |
| SMS / WhatsApp na listagem | Opcional / outro módulo |
| Menu ADSE, mapas, ficheiro eletrónico, stocks, CC global | Outros sub-módulos — ver auditoria menu |
| Paridade espelhada (Metronic, `oper=`, dropdown único «Tarefas») | Stack React + REST por desenho |
| `FaturaGlobalObter` (importar linhas em massa) | ⏳ pós-MVP — ver secção 4 |
| Liquidação profunda vs `LiquidacaoDocumento*` | 🟡 API + páginas mínimas; tesouraria = épico à parte |
| Reabrir / alterar documento já emitido | ⏳ `documento-edicao-page` só `mode=view` |

### Incluído no fecho (confirmado no código, 2026-06-03)

| Área | O quê |
|------|--------|
| **Emissão** | Emitir, anular (mês corrente, exc. FP), NC, desde admissão/consulta |
| **Ver** | `documento-edicao-page.tsx` read-only com `DocumentoEditor` |
| **Listagem** | Colunas legado, filtros ocultos, ações (email, print, print original, liquidar, transporte, emitir fatura GT/GR, detalhes admissões, anular, NC) |
| **Editor** | `documento-editor.tsx` + tabs (cliente, linhas, movimentos, retenção, MB, observações/banco, totais) |
| **A1** | Beneficiário, motivo isenção, tipo série, moeda, observações, banco, CP, datas global no emit |
| **Sinistrados** | `POST .../sinistrados/info-faturacao`, dialog, aplicar linhas, marcar linhas no emit; `CONS-`/`TRAT-`; F09 `ServicoId` |
| **Fatura global** | Apenas **intervalo de datas** (`FaturaGlobalDataInicio/Fim` + `documento-fatura-global-datas-dialog.tsx`) |
| **Novo documento** | `SelecionarTipoDocumentoDialog` + `novo-documento-page` + editor (não `novo-documento-form` mínimo) |
| **BE listagem** | `DocumentoTableDTO`: `Anulado`, `NumeroExibicao`, totais, `ReferenciaDocumento`, `AdmissoesResumo`, `OrigemLabel`; exclusão RC/FR/REC em `DocumentoSearchTable` |
| **BE filtros** | `numerodocumento_de/ate`, `data_de/ate`, `nomecliente` / `nomecliente_de/ate`, `anulado`, `liquidado`, `tipodocumentoid` |

### UAT mínimo (equipa)

1. Emitir FA com organismo + intervalo global → ver documento e confirmar datas/beneficiário.  
2. Anular no mês vs mês anterior.  
3. GT/GR → emitir fatura na listagem.  
4. Importar admissão nas linhas.  
5. Sinistrado → Aplicar → emitir → preços/organismo e linha observação.  
6. Listagem: colunas visíveis; Ref./Admissões quando existirem dados; filtros nº/data de/até no painel.

---

### Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Feito (MVP ou pós-MVP concluído) |
| 🟡 | Parcial — usar com nota do que falta |
| ⏳ | Não implementado / épico futuro |
| — | Não aplicável / fora de âmbito |

---

## 1. Resumo executivo

| Camada | vs legado Tfatura |
|--------|-------------------|
| **Backend emissão** | ✅ núcleo + sinistrados |
| **Backend listagem** | ✅ DTO + filtros + exclui recibos |
| **Frontend editor** | ✅ núcleo; ⏳ import linhas fatura global |
| **Frontend listagem** | ✅ operacional; 🟡 filtro nome (ver #2) |
| **Ver / reabrir emitido** | 🟡 só ver; ⏳ reabrir BE-06 |
| **Resto menu Faturação** | ⏳ placeholders (~95% menu) |

---

## 2. Mapa legado ↔ novo (implementação actual)

### Ecrãs

| Legado | Novo (caminho principal) |
|--------|--------------------------|
| `TfaturaLst.aspx/js` | `pages/.../listagem-faturacao-page.tsx` + `listagem-faturacao-table*.tsx` + `listagem-faturacao-filter-controls.tsx` |
| `TfaturaEdt.aspx/js` (inserção) | `novo-documento-page.tsx` + `documento-editor.tsx` |
| `TfaturaEdt.aspx/js` (ver) | `documento-edicao-page.tsx` (`mode='view'`) |
| `TFatura.cs` / `WSFaturacao` | `DocumentoEmissaoService` + `DocumentoService` |
| `SinistradosInfoFaturacao` | `SinistradosInfoFaturacaoHelper` + `POST .../sinistrados/info-faturacao` |
| `FaturaGlobalObter` | ⏳ — hoje: `documento-fatura-global-datas-dialog.tsx` + campos no emit |

### API REST (Faturação / Faturação)

| Operação | Endpoint |
|----------|----------|
| Listagem | `POST /client/documentos/Documento/paginated` |
| Detalhe | `GET /client/documentos/Documento/{id}` |
| Print / email | `GET .../{id}/print`, `.../print/original`, `POST .../email` |
| Liquidação | `GET .../liquidacao-contexto`, `POST .../liquidar` |
| Emitir / NC / anular | `DocumentoEmissaoController` |
| Tipos | `GET /client/documentos/TipoDocumento/light` |

### Estrutura FE (`pages/area-financeira/faturacao/`)

```
faturacao/
├── pages/          listagem, novo-documento, documento-edicao, liquidacao-*
├── components/     editor, tabs, dialogs (sinistrados, NC, anular, filtros, …)
├── queries/        documento-queries, documento-editor-queries, tipo-documento-queries
├── hooks/          use-documento-editor
├── utils/          cálculos, mappers, acções listagem, display
└── types/          documento-editor.types
```

**Clients:** `lib/services/faturacao/documento-service`, `documento-emissao-service`, `tipo-documento-service`  
**DTOs:** `types/dtos/faturacao/documento*.ts`, `documento-emissao.dtos.ts`  
**Emissão queries partilhadas:** `pages/area-financeira/documentos/queries/documento-emissao-queries.ts`

**Não recriar:** ficheiros acima já existem. Próximo trabalho = **estender** (ex. `FaturaGlobalObter`), não duplicar pasta `faturacao/`.

---

## 3. Implementado (✅) — inventário verificado

### Backend

- `DocumentoEmissaoService`: emitir, anular, NC, ATCUD, SAFT, MB, cálculos, sync admissão/consulta  
- Sinistrados: helper, specs, resolver clínico, `EmitirDocumentoRequest.SinistradoId` + `SinistradoLinhaServicoId` no emit  
- `DocumentoService`: paginated, detalhe, print, email, detalhes-admissões, validação transporte, liquidar  
- `DocumentoTableDTO` + mapping: `ReferenciaDocumento`, `AdmissoesResumo`, `Anulado`, `NumeroExibicao`, totais, `OrigemLabel`, `EstadoDocumentoLabel`  
- `DocumentoSearchTable`: filtros de/até; **exclui** tipos recibo (RC/FR/REC)  
- Migrations relevantes: F06 beneficiário, F08 `CodigoServico`, F09 `ServicoId`  

### Frontend

- Listagem completa + `FATURACAO_HIDDEN_FILTER_COLUMNS`  
- Editor com tabs + toolbar (descontos, fatura global datas, sinistrados)  
- `SelecionarTipoDocumentoDialog` (tipo; série via `numeroSerie` no rótulo do tipo)  
- Integração admissão/consulta: `?admissaoId=` / `?consultaId=` em `novo-documento-page`  
- Liquidação: páginas `liquidacao-utente` / `liquidacao-organismo` (fluxo mínimo)

---

## 4. Disparidades reais (checklist pós-MVP)

**Apenas itens que ainda diferem do legado ou têm lacuna técnica.** Não repetir o que está na secção 3.

### Alta prioridade

| # | Disparidade | Legado | Novo (estado) | Próximo passo |
|---|-------------|--------|---------------|---------------|
| 1 | **Importar linhas fatura global** | `FaturaGlobalObter` (`TFatura.cs`) | ⏳ Só datas no documento | `POST .../fatura-global/obter` + dialog «Aplicar linhas» no editor |
| 2 | **Filtro nome cliente** | `Nome_de` / `Nome_ate` | 🟡 Painel: nº e data de/até ✅; nome: campo único `nomeCliente` — **id pode não chegar ao BE** (`nomecliente`); colunas ocultas `nomecliente_de/ate` **sem UI** | Alinhar id do filtro a `nomecliente` ou expor par de/até no painel |
| 3 | **Liquidação tesouraria** | `LiquidacaoDocumento*` completo | 🟡 `liquidar` + página resumo | Épico tesouraria; não duplicar na listagem |
| 4 | **`Documento.SinistradoId`** | Cabeçalho liga sinistro | ⏳ Só em `EmitirDocumentoRequest` + linhas sinistro | Migration + persistir no emit |

### Média prioridade

| # | Disparidade | Estado | Notas |
|---|-------------|--------|-------|
| 5 | `filtroSinistrado` / ACOR cross-clínica | ⏳ | Legado `TfaturaEdt.js`; API sem parâmetro |
| 6 | Lista `Admissoes` na resposta sinistrados | ⏳ | Campo extra legado |
| 7 | Texto `AdmissoesResumo` vs agregado legado | 🟡 | BE `ResolveDocumentoAdmissoesResumo` — aceitável se negócio validar |
| 8 | Ref. NC e `VerRefNotaCredito` | 🟡 | Hoje sempre `DocumentoOrigem` em `ResolveDocumentoReferenciaListagem` |
| 9 | Estados «Por Descarregar» / «Descarregada» | 🟡 | Badge por `EstadoDocumentoLabel`, não ints legado |
| 10 | Série fiscal explícita antes de criar | 🟡 | Modal de **tipo** ✅; escolha de série separada como legado ⏳ se obrigatório |

### Editor / BE — só se negócio pedir

| # | Item | Estado |
|---|------|--------|
| 11 | Cheque / pré-datado / 2.ª data vencimento | ⏳ |
| 12 | Morada entrega | ⏳ |
| 13 | Linha: armazém, lote, motivo NC linha | 🟡 |
| 14 | Combos condição/modo 100% alinhados BD | 🟡 (`GetOpcoesPagamento`) |
| 15 | Reabrir / alterar emitido | ⏳ BE-06 |

### Backend técnico (não bloqueia MVP)

| ID | Assunto | Estado |
|----|---------|--------|
| BE-01 | Débito admissão completo | 🟡 |
| BE-06 | Reabrir documento emitido | ⏳ |
| BE-07 | MBWay dedicado | 🟡 |
| BE-09 | Locking numeração extra | 🟡 |
| BE-10 | Chave SAFT em config | ⏳ ops |

### Explicitamente fora desta checklist

- Reports Crystal, ticket, ARS, Excel resumo FA  
- SMS / WhatsApp, dropdown único «Tarefas»  
- Sub-menus ADSE, mapas, ficheiro eletrónico, credenciais SNS, etc.

---

## 5. Listagem — colunas (estado)

| Coluna legado | Novo | Estado |
|---------------|------|--------|
| N.º documento | `numeroExibicao` / `getDocumentoNumeroLabel` | ✅ |
| Data | `data` | ✅ |
| Cliente | `nomeCliente` / `utenteNome` | ✅ |
| Origem | `origemLabel` | ✅ |
| Ref. | `referenciaDocumento` | ✅ 🟡 regra NC (#8) |
| Admissões | `admissoesResumo` | ✅ 🟡 texto (#7) |
| Total descontos / imposto / total | DTO | ✅ |
| Estado | `getDocumentoEstadoBadge` | ✅ 🟡 textos (#9) |
| Opções | ícones + acções (não dropdown legado) | ✅ — por desenho |

---

## 6. Sinistrados

| Aspeto | Estado |
|--------|--------|
| API + aplicar linhas + emit | ✅ |
| Preços, `CONS-`/`TRAT-`, F09 `ServicoId`, linha observação | ✅ |
| `filtroSinistrado`, ACOR, `Admissoes` na resposta | ⏳ (#5, #6) |
| `SinistradoId` no `Documento` fiscal | ⏳ (#4) |

---

## 7. Roadmap pós-MVP (ordem sugerida)

1. `FaturaGlobalObter` → endpoint + FE aplicar linhas.  
2. `Documento.SinistradoId` + polish sinistrados (#5–6).  
3. Corrigir filtro nome (#2).  
4. Liquidação — épico tesouraria (#3).  
5. BE-06 / campos editor (#11–15) conforme pedido.

**Menu Faturação completo:** fases B–H em `auditoria-menu-faturacao-legado-vs-novo.md` — **não** misturar com este checklist.

---

## 8. Registo de alterações

| Data | Alteração |
|------|-----------|
| 2026-06-03 | Marco A1 + F06; fecho MVP Tfatura (sem reports). |
| 2026-06-03 | Sinistrados + listagem (colunas, hiddenColumns, Ref./Admissões). |
| 2026-06-03 | **Auditoria código:** secção 4 só com lacunas reais; mapa estrutura; hierarquia docs; corrigidos itens já implementados (filtros nº/data, modal tipo, BE-2, editor, ações listagem). |

---

*Para reabrir o fecho MVP: alterar secção «FECHADO» e registar motivo.*
