# Disparidades — Faturação (Legado vs Novo)

**Data:** 2026-06-02  
**Âmbito:** núcleo **documentos de faturação** — `TfaturaLst.aspx` / `TfaturaEdt.js` (legado) vs `area-financeira/faturacao` + `DocumentoEmissaoService` (novo).  
**Fora de âmbito neste documento:** stocks, liquidações, ADSE, ficheiro eletrónico, mapas, contas correntes (ver `auditoria-menu-faturacao-legado-vs-novo.md`).

**Documentos relacionados (podem estar desatualizados em detalhe):**

- `Frontend/src/docs/alinhamento-fe-faturacao-legado-vs-novo.md` — plano FE por ecrã
- `Frontend/src/docs/auditoria-menu-faturacao-legado-vs-novo.md` — menu completo Área Financeira

Este ficheiro é a **fonte de disparidades** para as próximas atualizações, de forma incremental e alinhada ao legado.

---

## 1. Resumo executivo

| Camada | Estimativa vs legado (`Tfatura`) | Situação |
|--------|----------------------------------|----------|
| **Backend — emissão e regras** | ~80–85% | Emitir, anular, NC, SAFT/ATCUD, MB, cálculos, sync admissão |
| **Frontend — listagem** | ~55–60% | Grelha + filtros base; falta menu operacional do legado |
| **Frontend — editor** | ~55–65% | Fluxo criar/ver utilizável; lacunas de campos e integrações |
| **Resto do menu Faturação** | ~5% | Rotas placeholder |

**Conclusão:** O **caminho feliz** (novo documento → cliente → linhas → guardar → listar → ver → anular/NC) está coberto. Falta sobretudo **operações pós-emissão** (impressão, email, liquidação), **fluxos em massa** (fatura global, sinistrados) e **paridade fina** de campos do `TfaturaEdt`.

---

## 2. Referências

### Legado (`CliCloud.ASPcli`)

| Função | Ficheiros |
|--------|-----------|
| Listagem | `Client/Faturacao/TfaturaLst.aspx`, `TfaturaLst.js` |
| Editor | `Client/Faturacao/TfaturaEdt.aspx`, `TfaturaEdt.js` |
| API gravação | `Client/Faturacao/Services/TFatura.cs` |
| Regra clínica (invisível no editor) | `window.RegraFaturacao` em `TfaturaEdt.aspx` (config clínica) |
| Descontos | Modal `modalDesconto` — **não** no cabeçalho |
| Linhas | `TFaturaLinha` em `TfaturaEdt.js` (`dados[]` começa **vazio**) |

### Novo

| Função | Ficheiros |
|--------|-----------|
| Listagem FE | `Frontend/src/pages/area-financeira/faturacao/pages/listagem-faturacao-page.tsx` |
| Editor FE | `.../components/documento-editor.tsx` e tabs/modais |
| Emissão BE | `Backend/CliCloud.Application/.../DocumentoEmissaoService/` |
| API | `Backend/CliCloud.WebApi/Controllers/Documentos/DocumentoEmissaoController.cs` |
| Débitos admissão | `AdmissaoAdministrativoController.GetDebitoFaturacao` |

---

## 3. Implementado (paridade aceitável)

### 3.1 Backend

- [x] `POST .../emitir` — documento + linhas + totais
- [x] Numeração, série, ano fiscal
- [x] Validação ATCUD (documentos após 2022)
- [x] Hash SAFT (`GlobalHash`) quando clínica com SAFT
- [x] `DocumentoEmissaoCalculoHelper` — descontos compostos (cliente × cond. pagamento × D1–D3 × global); regra faturação 1/2 **só em cálculo**
- [x] `DocumentoEmissaoPerfilValidator` — GT/GR, NC/DV origem, retenção, MB, consumidor final > 1000€
- [x] `POST emitir/admissao/{id}`, `emitir/consulta/{id}` (atalhos)
- [x] `POST anular/{id}`, `POST nota-credito`
- [x] Referências MB na emissão (`GerarReferenciaMb`)
- [x] `GetDebitoFaturacao` — exclui serviços já em documentos não anulados
- [x] `DocumentoEmissaoClinicaSyncHelper` — flag `Admissao.Faturado` parcial/total
- [x] Listagem documentos paginada (`Documento/paginated`)

### 3.2 Frontend — listagem

- [x] Colunas principais: tipo, n.º exibição, data, cliente, origem, descontos, IVA, total, estado, liquidado
- [x] Filtros: tipo, datas, nome, n.º documento, anulado
- [x] Novo documento, Ver (`/documento/:id`), Anular, Nota de crédito

### 3.3 Frontend — editor (`TfaturaEdt`)

- [x] Cabeçalho: tipo, datas, condição/modo pagamento, isento IVA, transporte (perfil), origem NC/DV/RG
- [x] **Sem** regra faturação visível (correto vs legado)
- [x] Modal **Descontos** (cliente, cond. pagamento, acerto) — não no cabeçalho
- [x] Tab **Cliente**: utente/organismo, subsistema, snapshot, consumidor final (badge NIF)
- [x] Tab **Linhas**: grelha vazia inicial, Inserir ▼, modal edição, remover selecionadas
- [x] Tab **Movimentos do Utente** + importação admissões (activo/histórico)
- [x] Tab **Retenção na fonte**, **Ref. MB / MBWay**
- [x] Painel **Totais** + resumo IVA (cálculo alinhado ao BE)
- [x] Perfis por tipo (`documento-tipo-editor-profile.ts`)
- [x] Modo consulta documento emitido

### 3.4 Correções recentes (registo)

| Data | Assunto | Estado |
|------|---------|--------|
| 2026-06 | Regra faturação / desconto pagamento **removidos do cabeçalho** | ✅ |
| 2026-06 | Linha fantasma ao abrir documento (`linhas: []`) | ✅ |
| 2026-06 | Modal linha em formulário vertical (legibilidade) | ✅ |
| 2026-06 | `codigoPostal` em `UtenteDTO` — lookup por `codigoPostalId` | ✅ |

---

## 4. Disparidades — Backend

| ID | Legado | Novo | Prioridade | Notas |
|----|--------|------|------------|-------|
| BE-01 | `ObterDebitoAdmiss` (Dados) | `GetDebitoFaturacao` MVP | **Alta** | Soma/serviços por faturar; não replica toda a lógica legado |
| BE-02 | Emitir desde admissão/consulta com IVA/preço serviço | Linhas com `TaxaIvaPercentagem = 0` em atalhos | **Alta** | Usar mesmo mapeamento que `mapAdmissaoServicoToLinha` |
| BE-03 | Beneficiário no documento | Campo entidade/DTO em falta ou não mapeado | Média | `modFldBeneficiario` no legado |
| BE-04 | Motivo isenção (cabeçalho + linha) | Não validado/gravado na emissão | Média | Legado: `modFldCodigoMotivoIsencao` |
| BE-05 | Global desde/até, n.º sinistrado no doc. | Não em `EmitirDocumentoRequest` | Baixa/Média | Só relevante se negócio exigir persistência |
| BE-06 | Edição de documento emitido (reabrir) | Só criar + anular | Baixa | Legado edita conforme série/estado |
| BE-07 | MBWay (modo 2) com fluxo dedicado | Integração parcial/ambígua no serviço de referências | **Alta** | Rever `ReferenciasMbService` para separar MB vs MBWay corretamente |
| BE-08 | Retenção por taxa sem valor | Não calcula automaticamente valor de retenção | **Alta** | Risco financeiro/fiscal em retenção ativa |
| BE-09 | Numeração concorrente por tipo/ano/série | Cálculo `último + 1` sujeito a colisão sob carga | **Alta** | Reforçar locking/estratégia transacional e testes de concorrência |
| BE-10 | Chave SAFT segura e rotativa | Chave embebida no código utilitário | Média | Migrar para configuração segura por ambiente |

---

## 5. Disparidades — Frontend editor

| ID | Legado (`TfaturaEdt`) | Novo | Prioridade | Risco |
|----|----------------------|------|------------|-------|
| FE-E01 | Motivo isenção + autocomplete | Só switch isento IVA | **Alta** | Emissão sem motivo AT |
| FE-E02 | Beneficiário (readonly) | Ausente | Média | |
| FE-E03 | Conta bancária, cheque, pré-datado, 2.ª data venc. | Ausente | Média | Pagamento FS/FA |
| FE-E04 | Tipo série (N/D/M) | Ausente no FE | **Alta** | BE aceita `TipoSerie` |
| FE-E05 | Moeda + câmbio (select dinâmico) | UI EUR/câmbio; **não envia** `MoedaId`/`TaxaCambio` | **Alta** | Dados não gravados |
| FE-E06 | Observações documento | Estado existe; sem campo UI | Média | `observacoes` no request |
| FE-E07 | Tab morada de entrega | Ausente | Baixa | |
| FE-E08 | Modal linha completo (armazém, motivo NC linha, etc.) | Modal simplificado | Média | |
| FE-E09 | Inserir artigos (stock) | Ref. manual / sem armazém | Média | Perfis GT/GR |
| FE-E10 | Fatura Global | Botão placeholder | Baixa (épico) | `modalFaturaGlobal` |
| FE-E11 | Sinistrados | Botão placeholder; campos cliente só texto | Baixa (épico) | `modalSinistrados` |
| FE-E12 | Condição/modo pagamento autocomplete | Listas estáticas `documento-editor-opcoes.ts` | Média | IDs podem não coincidir com BD |
| FE-E13 | Editar rascunho / documento não emitido | Não existe | Baixa | |
| FE-E14 | `codigoPostalTexto` | UI; emissão usa `codigoPostalId` | Média | Resolver CP ao guardar |
| FE-E15 | Global desde/até, sinistrado, limite crédito | UI; **não** em `toEmitirRequest` | **Alta** | **Falso positivo UX** — remover ou persistir |
| FE-E16 | IVA de caixa | Removido da UI (legado também não tem em TfaturaEdt) | — | OK manter só no API se necessário |

---

## 6. Disparidades — Frontend listagem

| ID | Legado (`TfaturaLst`) | Novo | Prioridade |
|----|----------------------|------|------------|
| FE-L01 | Filtros intervalo (data, nome, n.º TFatura) | Intervalo parcial / campos únicos | Média |
| FE-L02 | Coluna Admissões | Ausente | Média |
| FE-L03 | Coluna Ref. | Ausente ou incompleta | Baixa |
| FE-L04 | Imprimir (normal, original, ARS, ticket) | Ausente | **Alta** operacional |
| FE-L05 | Enviar email / SMS / WhatsApp | Ausente | Média |
| FE-L06 | Pagamento / liquidar FS/FA | Ausente | **Alta** |
| FE-L07 | GT/GR → Emitir fatura | Ausente | Média |
| FE-L08 | Atribuir código validação transporte | Ausente | Média |
| FE-L09 | E-Fatura / E-NC | Ausente | Baixa (módulo AT) |
| FE-L10 | Resumo FA / Excel | Ausente | Baixa |
| FE-L11 | Detalhes admissões do documento | Ausente | Média |
| FE-L12 | Listagens/report (`TfaturaListagemReport`) | Toast “em preparação” | Baixa |
| FE-L13 | Tipo série na listagem/filtro | Ausente | Baixa |

---

## 7. Disparidades — Módulos Área Financeira (menu)

O menu novo **espelha** o legado, mas quase tudo excepto **Faturação / Novo documento** é placeholder.

| Grupo menu | Legado (exemplos) | Novo | Gap |
|------------|-------------------|------|-----|
| Faturação | TfaturaLst, TfaturaEdt | Implementado parcial | Ver secções 4–6 |
| Ficheiros eletrónicos | Vários `.aspx` | Placeholder | 100% |
| Credenciais SNS | Listagens | Placeholder | 100% |
| Faturação ADSE | ADSE | Placeholder | 100% |
| Mapas | Mapas | Placeholder | 100% |
| Entidades / Tabelas | CRUD apoio | Placeholder / área comum | — |
| Stocks | Artigo, entradas, saídas | Não no âmbito faturação doc. | Épico separado |
| Liquidações / CC | Liquidacao*Lst | Placeholder tesouraria/CC | Épico separado |

Detalhe: `auditoria-menu-faturacao-legado-vs-novo.md`.

---

## 8. Riscos de regressão (atualização responsável)

1. **Não adicionar campos ao ecrã sem DTO + BE + migração** — evitar repetir FE-E15.
2. **Legado primeiro** — cada tarefa deve citar ficheiro `.aspx`/`.js` e método `TFatura.cs` equivalente.
3. **Uma disparidade por PR** (ou grupo pequeno homogéneo): ex. só FE-E01+BE-04 motivo isenção.
4. **Testar contra clínica real**: ATCUD activo, SAFT, MB mínimo, perfil FA vs GT.
5. **Sem framer-motion** (regra repositório).
6. **Cálculos**: alterações em FE devem manter `documento-editor-calculos.ts` alinhado a `DocumentoEmissaoCalculoHelper.cs`.
7. **Não expor regra faturação** no UI — apenas carregar da clínica em background.
8. **Concorrência de emissão**: qualquer alteração na numeração fiscal deve ser testada com cenários paralelos.
9. **Integrações MB/MBWay**: validar callbacks/idempotência antes de ativar em produção.

---

## 9A. Auditoria profunda (02-06-2026)

### Ações legadas críticas ainda sem paridade

- `TfaturaLst.js`: impressão (normal/original/ARS/ticket), envio email/SMS/WhatsApp, pagamento, emissão a partir de GT/GR, validação transporte, detalhes de admissões.
- `TfaturaEdt.aspx/js`: modais reais de **Fatura Global** e **Sinistrados**, motivo de isenção, tipo série e campos avançados de pagamento.
- Serviço legado `TFatura.cs`: regras distribuídas com validações contextuais por sessão/tipo/série.

### Lacunas de dados detectadas

- FE com campos de UI ainda não persistidos (`globalDesde`, `globalAte`, `numeroSinistrado`, `limiteCredito`, parte de moeda/câmbio).
- Falta motivo de isenção no contrato de emissão (header/linha).
- Beneficiário não mapeado ponta-a-ponta.

### Riscos fiscais/contabilísticos prioritários (P0)

1. `BE-02` IVA em emissão por admissão/consulta.
2. `BE-09` colisão de numeração em carga concorrente.
3. `BE-08` retenção ativa com taxa sem cálculo de valor.
4. `BE-07` fluxo MBWay incompleto/ambíguo.

---

## 9. Plano de atualização sugerido (fases)

### Fase A — Integridade emissão (crítico)

| Tarefa | IDs | Entregável |
|--------|-----|------------|
| Motivo isenção | FE-E01, BE-04 | Campo + gravação + validação se isento |
| Moeda/câmbio no payload | FE-E05 | `MoedaId`, `TaxaCambio` no `toEmitirRequest` |
| Tipo série | FE-E04 | Combo + envio `TipoSerie` |
| Observações | FE-E06 | Campo cabeçalho ou tab |
| Limpar ou persistir campos cliente extra | FE-E14, FE-E15, BE-05 | Decisão explícita documentada |
| IVA em emitir admissão/consulta | BE-02 | Testes com admissão real |
| Concorrência de numeração fiscal | BE-09 | Teste de carga + hardening transacional |
| Retenção por taxa/valor | BE-08 | Regra única de cálculo/validação |
| MBWay fim-a-fim | BE-07 | Fluxo dedicado + callback validado |

**Critério de done:** emitir FA de teste com isento+motivo, moeda, série; comparar totais com legado no mesmo cenário.

### Fase B — Editor legado (médio)

| Tarefa | IDs |
|--------|-----|
| Conta bancária / cheque | FE-E03 |
| Beneficiário | FE-E02, BE-03 |
| Autocomplete condição/modo pagamento | FE-E12 |
| Modal linha (armazém / NC linha) | FE-E08, FE-E09 |
| Código postal → `codigoPostalId` ao guardar | FE-E14 |

### Fase C — Listagem operacional

| Tarefa | IDs |
|--------|-----|
| Imprimir | FE-L04 |
| Pagamento / liquidar | FE-L06 |
| Email (se API existir) | FE-L05 |
| GT/GR → fatura | FE-L07 |
| Filtros intervalo | FE-L01 |

### Fase D — Épicos de negócio

| Tarefa | IDs |
|--------|-----|
| Fatura global | FE-E10 + BE novo |
| Sinistrados | FE-E11 + integração consultas |
| Débito admissão completo | BE-01 |

### Fase E — Outros módulos menu

Conforme `auditoria-menu-faturacao-legado-vs-novo.md` (Fases B–F do plano global).

---

## 10. Checklist antes de fechar cada tarefa

- [ ] Identificador disparidade (ex. FE-E05) referenciado no PR/commit
- [ ] Comportamento legado reproduzido ou **diferença documentada** com motivo
- [ ] `dotnet build` / `tsc` sem erros nos módulos tocados
- [ ] Teste manual: criar documento + listar + (se aplicável) anular/NC
- [ ] Sem campos novos “só UI”
- [ ] Atualizar secção 3 ou 4 deste `.md` (estado ✅)

---

## 11. Como usar este documento

1. Escolher **uma fase** (recomendado: **Fase A**).
2. Implementar tarefas na ordem da tabela.
3. Marcar disparidades como resolvidas na secção 3 ou riscar na 4–6.
4. Não misturar Fase C (impressão) com Fase A (payload emissão) no mesmo PR.

Quando avançarmos para código, cada pedido deve indicar: **ID da disparidade** (ex. `FE-E05`) + **ficheiros a alterar**.

---

*Documento gerado para auditoria e planeamento. Atualizar após cada marco de implementação.*
