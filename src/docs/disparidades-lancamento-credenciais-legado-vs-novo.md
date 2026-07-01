# Disparidades — Lançamento de Credenciais (Legado vs Novo)

**Última atualização:** 2026-06-25 (P0 admin concluído; roadmap pendente alinhado ao legado)  
**Âmbito:** `LancamentoCredenciaisLst/Edt` (Consultas) vs `area-administrativa/credenciais` (`LoteDirect`) **+** faturação `CredenciaisSnsLst` vs `area-financeira/faturacao/credenciais-sns`.  
**Relacionado:** `credenciais-corrigir-lotes-implementacao.md`, `auditoria-area-administrativa-consultas-legado-vs-novo.md` (§3.7), `auditoria-menu-faturacao-legado-vs-novo.md` (§2.3).

**Princípio:** paridade **funcional** com o legado — não réplica espelhada do ASP (Metronic, ASMX, Crystal). **Não inventar** funcionalidades que o legado não tem.  
**Faturas / documentos financeiros (`TFatura`, pipeline documentos):** **adiados por decisão** — não implementar SNS-4 nem integrações de emissão nesta fase.  
**Relatórios / Crystal / `GS.ShowReport`:** **fora de âmbito nesta fase** — manter stubs (`toast` «em breve») até track de emissão runtime.

---

## Hierarquia da documentação

| Documento | Papel |
|-----------|--------|
| **Este ficheiro** | Disparidades do lançamento administrativo (LOTDIRECT) + **roadmap Credenciais S.N.S.** |
| `credenciais-corrigir-lotes-implementacao.md` | Guia técnico corrigir lotes + entidades filhas |
| `auditoria-area-administrativa-consultas-legado-vs-novo.md` | Auditoria global área administrativa |
| `auditoria-menu-faturacao-legado-vs-novo.md` | Menu faturação (4 variantes Credenciais S.N.S.) |

---

## Legenda

| Símbolo | Significado |
|---------|-------------|
| ✅ | Alinhado ou equivalente funcional |
| 🟡 | Parcial — funciona com diferenças |
| ⏳ | Não implementado |
| ➕ | Melhoria face ao legado (não é gap) |
| ⚠️ | Diferença arquitetural relevante |
| — | Fora de âmbito deste ecrã |
| 🔇 | Adiado de propósito (ex.: relatórios Crystal) |

---

## 1. Resumo executivo (re-auditoria 2026-06-25)

| Camada | vs legado `LancamentoCredenciais` | Notas |
|--------|-----------------------------------|-------|
| **Modelo de dados** | 🟡 | `LoteDirect` cobre o núcleo; campos `hospital`/`quantc`/`k` **não existem no aspx Consultas** — só implementar se BD ainda os usar |
| **CRUD lançamento** | 🟡 | Gravar cabeçalho + linhas ✅; **editar carrega linhas V2/V3** ✅ (LD-P0); validações ESP/tipo 7 ⏳ |
| **Sync agregados no save** | ⚠️ | Legado: `LOTESP`/`LOTES` em cada save; novo: só **Corrigir Lotes** (B5 ⏳) |
| **Corrigir lotes** | ✅ | Executor + validação prévia + ecrã agregados |
| **Subsistema / serviço** | 🟡 | F1/F2 ✅; vínculos organismo nas linhas ✅ |
| **Listagens / mapas / etiquetas** | 🔇 | Stubs; sem Crystal |
| **Histórico** | 🟡 | Passar histórico massa org/mês/ano ✅; `RequisicoesESP` no histórico ⏳; **passar para ativo** ⏳ |
| **Filtros listagem** | 🟡 | BE 7 filtros; FE expõe subconjunto (L1 parcial) |
| **Faturação SNS** | 🟡 | Especialidades operacional (~85% fluxo listar/ver/apagar); resto ⏳ — ver **§7** |

**Conclusão:** fluxo **lançar → gravar linhas → editar com linhas → corrigir lotes → SNS especialidades → Ver admin** utilizável em UAT. **Pendente (só legado, sem documentos):** LD-P1 passar ativo, B5 sync save, obter novo lote, filtros extra, validações ESP; SNS fisioterapia e permissões 3 módulos.

---

## 1.1 Roadmap pendente — Lançamento admin (`LoteDirect`)

Ordem acordada; **cada item existe no legado** (`LancamentoCredenciaisLst/Edt`, `Services/LancamentoCredenciais.cs`).

| Fase | Conteúdo | Legado | Estado |
|------|----------|--------|--------|
| **LD-P0** | `GET` devolve `linhas` + `linhas789`; FE preenche grelhas no edit | `Lindirect789Load` + tabela serviços | ✅ |
| **LD-P1** | `passarLancamentoCredenciaisParaAtivo` + modal mês/ano | `LancamentoCredenciaisLst.js` modo histórico | ⏳ |
| **LD-P1** | `RequisicoesESP.UpdateParaHistorico/Ativo` no passar histórico/ativo | `passarLancamentoCredenciaisPara*` | ⏳ |
| **LD-P1** | Modo histórico: só Ver + Passar ativo (ocultar edit/delete/add/corrigir) | Listagem histórico legado | ⏳ |
| **LD-P2** | `ObternovoLote` → API + FE ao mudar organismo/tipo/mês/ano | `ObternovoLote` ASMX | ⏳ |
| **LD-P2** | **B5** — sync `LoteDirectAgregado`/`Detalhe` no save (como `LotdirectEdtSave`) | Save incremental LOTESP | ⏳ |
| **LD-P3** | Filtros listagem utente/nome/datas (L1 extensão) | `LotdirectLst` filtros de/até | ⏳ |
| **LD-P3** | Validações save tipo lote 7 / ESP / PNP | `LotdirectEdtSave` ~741–836 | ⏳ |
| **LD-P4** | Lançamento automático por credencial | `LotdirectEdtObterInfoAdmissaoByCredencial` | ⏳ |
| **LD-P4** | Navegação P/N, `OnMessage`, `selectField` | `GetIdLancamentoCons`, `postMessage` | ⏳ |
| — | F10 `hospital`, `quantc/k` | Ausentes no aspx Consultas; save legado força 0 | **Não implementar** salvo requisito BD |
| 🔇 | L2/L3/F8 listagens e etiquetas Crystal | `GS.ShowReport` | Adiado |

**Ficheiros LD-P0:** `LoteDirectLinhaDTO.cs`, `LoteDirectService.GetByIdAsync`, specs `LoteDirectLinhas*ByCabecalhoSpec`, `MappingProfiles`, `lote-direct.dtos.ts`, `lote-direct-form-modal.tsx` (`linhaDtoToFormRow`, `linhasDtoParaGrelhaExames`).

---

## 2. Mapeamento legado → novo

| Legado | Novo |
|--------|------|
| `CliCloud.ASPcli/Client/Consultas/LancamentoCredenciaisLst.aspx` + `.js` | `listagem-lote-direct-page.tsx` |
| `LancamentoCredenciaisEdt.aspx` + `.js` | `lote-direct-form-modal.tsx` / `novo-lote-direct-page.tsx` |
| `WSConsultas.asmx` (`LancamentoCredenciais*`) | `LoteDirectController` (`/client/credenciais/LoteDirect`) |
| `dbo.LOTDIRECT` | `Credenciais.LoteDirect` |
| `dbo.LINDIRECT` | `Credenciais.LoteDirectLinha` |
| `dbo.LINDIRECT_789` | `Credenciais.LoteDirectLinha789` |
| `dbo.LOTESP` | `Credenciais.LoteDirectAgregado` |
| `dbo.LOTES` | `Credenciais.LoteDirectDetalhe` |
| `dbo.ACOR_INS` | `Servicos.SubsistemaServico` (+ organismo `CodigoULSNova`) |
| `SP_CorrigirLancamentoCredenciaisConsultas` | `LoteDirectCorrecaoLotesExecutor` |
| `SubSistemasServicosFiltroAutocomplete` (Admissoes.asmx) | `useSubsistemasServicoByOrganismo` (só usado nas linhas de exame) |
| `CredenciaisSnsLst.aspx?modulo=*` | `area-financeira/faturacao/credenciais-sns/{fisioterapia\|especialidades\|exames}` |
| `CredenciaisSnsFicheiroEletronicoLst.aspx` | `area-financeira/faturacao/credenciais-sns/ficheiro-eletronico` |
| `WSFaturacao.asmx/CredenciaisSnsLst` | `POST /client/faturacao/credenciais-sns/{modulo}/paginated` |
| `WSFaturacao.asmx/CredenciaisSnsDel*` | `DELETE /client/faturacao/credenciais-sns/{modulo}` |
| `WSFaturacao.asmx/CredenciaisSnsCriarFatura` | 🔇 adiado (SNS-4 — sem documentos nesta fase) |
| `dbo.LOTESP` (especialidades SNS) | `Credenciais.LoteDirectAgregado` |
| `dbo.LOTESPFISIO` (fisioterapia SNS) | ⏳ sem entidade no domínio novo |
| `FicheiroEletronicoCredenciaisSns` (Dados.Faturacao) | ⏳ (fase SNS-6) |

---

## 3. Listagem (`LancamentoCredenciaisLst`)

### 3.1 O que está alinhado ✅

| Funcionalidade | Legado | Novo |
|----------------|--------|------|
| Listagem paginada | DataTables + ASMX | `POST .../paginated` |
| Ver registo | `verRegisto(codigo)` | Modal ver |
| Editar registo | `chgRegisto` (exc. histórico) | Modal editar |
| Apagar registo | `delRegisto` | `DELETE .../{id}` |
| Modo histórico | Filtro `historico_de` / `historico_ate` | Toggle «Histórico» + filtro `historico` |
| Corrigir lotes | Modal + `LancamentoCredenciaisCorrigirLotes` | Modal + validação + `corrigir-lotes` |
| Ver agregados pós-correção | Implícito em `LOTESP` / faturação | Página `/credenciais/agregados` ➕ |
| Filtro por lote agregado (Ver desde SNS) | `?indice=` no lançamento | `?indicelote=` na listagem ➕ |

### 3.2 Disparidades 🟡 / ⏳

| # | Legado | Novo | Prioridade |
|---|--------|------|------------|
| L1 | Filtros avançados: código, utente, nome, credencial, nº lote, organismo, datas, mês/ano, histórico de/até | N.º lote, organismo, mês, ano + pesquisa `credencial` + histórico | 🟡 P2 (mais filtros se necessário) |
| L2 | Botão **Listagens** → 7 mapas Crystal | Modal tipos 1–7 + **stub** (`credenciais-legado-relatorios.ts`) | 🔇 P1 UX feito; emissão adiada |
| L3 | Por linha: **etiquetas** | Stub toast | 🔇 adiado |
| L4 | Por linha: **passar ao histórico** | ✅ `passar-para-historico` por linha (credencial) | ✅ |
| L5 | Por linha: **relatório ESP** quando `PartilharRelatorio` | ⏳ | P3 |
| L6 | Colunas legado (mais campos, `mesAno`, organismo nome, etc.) | Subconjunto; sigla organismo ✅ | P2 |
| L7 | Seleção de campo (`selectField`) para ecrãs externos | ⏳ | P3 |
| L8 | `passarLancamentoCredenciaisParaAtivo` (reverter histórico com novo mês/ano) | ⏳ | **P1** (LD-P1) |

**Ficheiros novo:** `listagem-lote-direct-page.tsx`, `listagem-lote-direct-table.columns.tsx`, `corrigir-lotes-modal.tsx`.

### 3.3 Filtros — gap FE vs BE

O `LoteDirectSearchTable` já suporta:

| `filter.Id` | Legado equivalente |
|-------------|-------------------|
| `credencial` | `nrCredencial` |
| `numerolote` | `clote` |
| `codigoorganismo` | `codinst` |
| `mes` / `ano` | `mes` / `ano` |
| `historico` | `historico_de`/`historico_ate` (novo: booleano único) |
| `indicelote` | `indice` (SNS) |

**Em falta no BE (e no legado listagem):** utente, nome utente, médico, centro saúde, datas início/fim, intervalos de/até.

---

## 4. Formulário (`LancamentoCredenciaisEdt`)

### 4.1 O que está alinhado ✅

| Bloco | Legado | Novo |
|-------|--------|------|
| Estrutura geral | Cabeçalho utente + credencial + período | Abas «Dados da Credencial» + «Registo de Serviços» |
| Utente | Autocomplete + dados automáticos | `AsyncCombobox` utente + campos derivados |
| Taxa moderadora | Isento / Não isento / E111 / H / … | `RadioGroup` equivalente |
| Credencial, ano, mês, tipo lote, tipo serviço | `modFld*` | Campos homólogos |
| Médico / médico externo | Autocomplete | Combobox + light APIs |
| Consultas (V1) | Serviço, subsistema, qtd, valor, taxa | Secção «Consultas» com totais [V1]/[T1] |
| Exames/tratamentos (V2) | Tabela `servicos` + modal edição | Grelha inline «Exames/Tratamentos» |
| ENPE / 789 (V3) | `examesNaoPrescritosEfetuados` | Grelha «Exames Não Prescritos e Efetuados» |
| Totais | `updateValTotal`, `updateValorServicos` | Totais T1+T2+T3, V1+V2+V3 |
| Histórico faturação | Campo read-only | Campo read-only |
| Gravar cabeçalho + linhas | ASMX save | `Create` / `Update` + sync linhas |
| **Carregar linhas no edit** | `Lindirect789Load` + serviços | `GET /{id}` → `linhas` / `linhas789` + `applyDetail` ✅ (LD-P0) |

### 4.2 Disparidades — subsistema / serviço 🟡

| # | Legado | Novo | Notas |
|---|--------|------|-------|
| F1 | **Consultas → Serviço:** só `ACOR_INS` do organismo | `servicoConsultaItems` = vínculos `useSubsistemasServicoByOrganismo` | ✅ |
| F2 | Botão **+** abre `Acor_InsLst.aspx?instit=` | **+** → `/tabelas/subsistemas-servicos?organismoId=` | ✅ |
| F3 | **Exames:** só acordos do organismo | `subsistemaLinhaComboboxItems`: vínculos + «sem vínculo» manual | ➕ fallback; alinhado ao espírito com extra |
| F4 | Mensagem quando sem acordos | *«Sem vínculos Subsistema/Serviço…»* | Esperado sem dados em `SubsistemaServico` |
| F5 | Edição de linha em **modal** | Edição **inline** | UX diferente; aceitável |
| F6 | `getSubsistServico` preenche preços | `buildLinhaValoresFromSubsistema` | Validar isenção caso a caso |
| F7 | `showServicos()` → `Acor_InsLst` | `+ Inserir` linha vazia | Fluxo diferente |

**Evidência F1 (resolvido):** `servicoConsultaItems` usa `subsistemasOrganismo` (mesma fonte que `subsistemaLinhaComboboxItems`).

### 4.3 Disparidades — campos / ações ⏳

| # | Legado (`LancamentoCredenciaisEdt.js` save) | Novo (`LoteDirect.cs`) |
|---|---------------------------------------------|------------------------|
| F8 | Impressão credenciais (`modFldOpcoesCredenciais`) | Ícone `Printer`; fluxo incompleto |
| F9 | `verificaOrganismo`, cartão utente, validade | Parcial no load utente |
| F10 | `hospital`, `prodaplic`, `quantc`, `quantk`, `tiposrvecg`, `ecg`, `totalc`, `totalk` | **Ausentes** na entidade e no formulário |
| F11 | `credencialExterna`, `procedimentosEfetuados`, `proveniencia` | Campos existem ✅ |
| F12 | `OnMessage` (abrir de outros ecrãs) | ⏳ |

---

## 5. Backend / regras de negócio

### 5.1 Alinhado ✅

| Regra | Estado |
|-------|--------|
| Entidades filhas para corrigir lotes | ✅ Migration + configurations |
| Corrigir lotes transaccional | ✅ `LoteDirectCorrecaoLotesExecutor` |
| Validação prévia corrigir lotes | ➕ extra vs legado |
| Renumerar lotes, máx. 30 credenciais/lote, ESP tipo 97 | ✅ no executor |
| Organismo via `CodigoULSNova` | ✅ |
| API REST `LoteDirectController` | ✅ paginated, CRUD, corrigir, agregados |

### 5.2 Validações no save — legado vs novo

| Validação | Legado (`LotdirectEdtSave`) | Novo (`LoteDirectService`) |
|-----------|----------------------------|----------------------------|
| Utente obrigatório | ✅ | ✅ |
| Credencial obrigatória | ✅ | ✅ |
| Mês / ano válidos | ✅ | ✅ |
| Credencial **única** (add/chg) | ✅ `ObterByCredencial` | ✅ `LoteDirectSaveValidator` |
| Organismo/mês/ano **já em histórico** | ✅ `ObterOrganismoMesAnoHistorico` | ✅ spec + validator |
| Organismo obrigatório | ✅ | 🟡 (via utente) |
| Permissões funcionalidade | ✅ `Consul_LancCredenciais` | Via roles API |
| Tipo lote 7 / ESP: sync médico requisição | ✅ | ⏳ |
| Tipo lote 7 / ESP: validar MCDT vs linhas | ✅ | ⏳ |
| Tipo lote 7 / ESP: PNP vs serviços (ENP assinado) | ✅ | ⏳ |
| **Sync LOTESP/LOTES no save** | ✅ incremental no mesmo TX | ⚠️ **não** — só `corrigir-lotes` |

### 5.3 Disparidade arquitetural ⚠️ B5 — Save vs agregados

| Aspeto | Legado | Novo |
|--------|--------|------|
| Após gravar lançamento | Recalcula/atualiza `LOTESP` e `LOTES` da credencial (centenas de linhas em `LotdirectEdtSave` ~850+) | Apenas `LoteDirect` + `LINDIRECT` |
| Impacto operacional | Faturação SNS vê lotes actualizados sem passo extra | Utilizador **deve** correr «Corrigir Lotes» para o mês |
| Risco | — | Dados admin e SNS dessincronizados entre gravação e correção |

**Decisão de produto necessária** antes de implementar (ver §11.7).

---

## 6. Corrigir lotes e agregados

| Aspeto | Legado | Novo | Estado |
|--------|--------|------|--------|
| Entrada | Mês + ano no modal | Igual + validação prévia | ✅ |
| Resultado | `LOTESP` + `LOTES` | `LoteDirectAgregado` + `LoteDirectDetalhe` | ✅ validado (Maio/2026) |
| Ecrã agregados admin | — | `/credenciais/agregados` | ➕ |
| SQL Server 2014 | SP legada | Sem `OPENJSON` em filtros grandes | ✅ |

---

## 7. Credenciais S.N.S. — Faturação (track completo)

**Legado:** `CredenciaisSnsLst.aspx` + `CredenciaisSnsLst.js` (3 módulos via `?modulo=`) e ecrã separado `CredenciaisSnsFicheiroEletronicoLst.aspx`.  
**Novo:** `Frontend/src/pages/area-financeira/faturacao/credenciais-sns/` + `Backend/.../CredenciaisSnsService/`.  
**Cobertura estimada:** ~**40%** global SNS; **~85%** módulo especialidades (listar/ver/apagar); faturação/documentos **adiados**.

### 7.1 Estado actual (2026-06-25)

| Área | Legado | Novo | Estado |
|------|--------|------|--------|
| Menu 4 itens | Fisioterapia, Especialidades, Exames, Ficheiro Eletrónico | `menu-items.ts` + rotas `areaFinanceira.tsx` | ✅ |
| Ecrã listagem (3 módulos) | Mesmo `.aspx`, título com módulo | `listagem-credenciais-sns-modulo-page.tsx` | ✅ |
| Colunas grelha | `c_lote`, data, taxas, organismo, tipos… | `listagem-credenciais-sns-table.columns.tsx` | ✅ |
| Filtros de/até | Data, nº lote, organismo, ano, mês | `listagem-credenciais-sns-filter-controls.tsx` + `CredenciaisSnsAgregadoSearchSpec` | ✅ |
| Pesquisa rápida | `filtrobox` | `globalSearchColumnId=filtrobox` | ✅ |
| Toolbar | Fatura, Verbete, Relação, Listagens, Atualizar | Igual na página módulo | 🟡 |
| **Dados especialidades** | `LOTESP` via ASMX | `LoteDirectAgregado` paginated | ✅ |
| **Dados fisioterapia** | `LOTESPFISIO` | Lista vazia (BE ignora módulo) | ⏳ |
| **Dados exames** | ASMX (listagem) | Lista vazia | ⏳ |
| Apagar lote(s) | `CredenciaisSnsDel` / `DelAll` | `DELETE …/{modulo}` + executor | ✅ só **especialidades** |
| Ver linha | Fisio → Tratamentos; Espec → Consultas; Exames → «brevemente» | Admin `?indicelote=` / toasts | 🟡 |
| Modal **Fatura** | `OpenModal('fatura')` + `gerarFatura` | `credenciais-sns-fatura-modal.tsx` (UI) | 🔇 adiado (sem `TFatura`/documentos) |
| Modal **Verbete** / **Relação** | Mesmo modal, campos lote | Stub `credenciais-sns-operacoes-modal.tsx` | 🔇 adiado (pré-fatura) |
| **Ficheiro Eletrónico** | CRUD + gerar ficheiro ACSS | Placeholder página | ⏳ |
| Etiquetas / Listagens SNS | Crystal | Stub `credenciais-sns-legado-acoes.ts` | 🔇 adiado |
| Permissões por módulo | 3 `IDFuncionalidade` no `.aspx.cs` | Uma `credenciaisSns` no FE | ⏳ |

### 7.2 Matriz de cobertura SNS

```
Credenciais S.N.S. (Faturação) — sem track fatura/documentos
├── Menu + rotas 4 variantes          ██████████  100%
├── UI listagem (3 módulos)           █████████░   90%
├── Filtros + grelha                  ████████░░   80%
├── Especialidades (listar/ver/apagar) ████████░░   85%
├── Fisioterapia / exames (dados)     ░░░░░░░░░░    0%  (exames: legado também vazio)
├── Criar fatura / verbete / relação  🔇 adiado     —
├── Ficheiro eletrónico SNS           ░░░░░░░░░░    5%
└── Relatórios / etiquetas / Crystal  🔇 adiado     —
```

### 7.3 Dependência com Lançamento administrativo

| Fluxo | Ligação |
|-------|---------|
| Agregados SNS especialidades | Originam em **Corrigir Lotes** (`LoteDirectAgregado`) |
| Ver lote | SNS → `/area-administrativa/credenciais?indicelote={indice}` |
| Dessincronia B5 | Entre gravar lançamento e corrigir lotes, SNS pode estar desatualizado |

**UAT mínimo SNS:** corrigir lotes (mês/ano) → SNS especialidades lista → Ver → filtro `indicelote` na admin → apagar lote SNS remove agregado.

### 7.4 Roadmap de implementação (sem relatórios)

Ordem recomendada — cada fase fecha valor testável; **não inclui** Crystal / `GS.ShowReport`.

#### SNS-0 — Fundação UI ✅ (concluída)

| Item | Ficheiros |
|------|-----------|
| Menu 4 rotas | `config/menu-items.ts`, `routes/area-financeira/areaFinanceira.tsx` |
| Página módulo partilhada | `credenciais-sns/pages/listagem-credenciais-sns-modulo-page.tsx` |
| Tabela + filtros | `components/listagem-credenciais-sns-table*.tsx`, `filter-controls.tsx` |
| Queries/mutations | `queries/listagem-credenciais-sns-queries.ts`, `credenciais-sns-mutations.ts` |
| Config módulo | `credenciais-sns-modulo-config.ts` |
| Placeholder ficheiro eletrónico | `pages/listagem-credenciais-sns-ficheiro-eletronico-page.tsx` |
| Modal Fatura (UI) | `modals/credenciais-sns-fatura-modal.tsx` |
| Fix colunas ocultas DataTable | `components/shared/data-table.tsx` |

#### SNS-1 — Especialidades: fecho BE ✅ (concluída)

| # | Tarefa | Legado | Novo |
|---|--------|--------|------|
| 1.1 | Paginated + filtros | `CredenciaisSnsLst` (módulo especialidades) | ✅ |
| 1.2 | Delete lote | `CredenciaisSnsDel` | ✅ `CredenciaisSnsAgregadoDeleteExecutor` |
| 1.3 | Enriquecimento organismo/tipo lote/tipo serviço | Joins ASMX | ✅ `PreencherEnriquecimentosAsync` + fallback `TipoServicoRegisto` |
| 1.4 | Ver → lançamento admin | `?indice=` | ✅ `?indicelote=` |
| 1.5 | UAT delete cascata | `LOTES` | Validar em BD por release |

#### SNS-2 — Fisioterapia (dados + Ver) ⏳ — **próximo track SNS** (sem documentos)

| # | Tarefa | Legado | Implementação sugerida |
|---|--------|--------|------------------------|
| 2.1 | Entidade `LOTESPFISIO` | `Dados/Tratamentos/LancamentoCredenciais.cs` | Migration `Credenciais.LoteFisioAgregado` (ou nome alinhado ao domínio) + configuration EF |
| 2.2 | Spec paginated/delete | `CredenciaisSnsLst?modulo=fisioterapia` | `CredenciaisSnsFisioterapiaSearchSpec` em `CredenciaisSnsService` |
| 2.3 | DTO partilhado ou extensão | Mesmas colunas da grelha | Reutilizar `CredenciaisSnsLoteTableDTO` |
| 2.4 | **Ver** | `LancamentoCredenciaisLst.aspx` (Tratamentos) | Rota futura tratamentos **ou** manter toast até existir `area-administrativa/tratamentos/credenciais` |
| 2.5 | Permissão | `Faturacao_CredSNS_Fisio` | Mapear em `modules.areaFinanceira.permissions` (sub-permissão ou claim) |

**Ordem técnica:** inspecionar `CliCloud.ASPcli` + `Dados` para mapeamento colunas → domínio → AutoMapper → activar ramo `fisioterapia` em `GetPaginatedAsync` / `DeleteAsync`.

#### SNS-3 — Exames ⏳ (paridade mínima já alinhada)

| # | Tarefa | Legado | Notas |
|---|--------|--------|-------|
| 3.1 | Listagem exames | ASMX **sem ramo de dados** | Novo: lista vazia ✅ (igual legado) |
| 3.2 | **Ver** | `CredenciaisSnsLstBrevemente` | Toast ✅ |
| 3.3 | Permissão | `Faturacao_CredSNS_Exames` | ⏳ SNS-7.1 |

#### SNS-4 — Fatura (negócio) 🔇 **adiado** — decisão: sem integração `TFatura`/documentos nesta fase

> Referência futura quando o track documentos for activado. UI modal existe; `credenciais-sns-fatura-submit.ts` mantém stub.

| # | Tarefa | Legado | Novo |
|---|--------|--------|------|
| 4.1 | Validar parâmetros | `gerarFatura()` em `CredenciaisSnsLst.js` | ✅ FE `validateCredenciaisSnsFaturaForm` |
| 4.2 | **Apenas visualizar** | `CredenciaisSnsFaturaVisualizar{Consultas\|Tratamentos}.rpt` | `POST …/fatura/preview` → DTO resumo (totais, linhas, organismo) — **UI read-only**, sem `.rpt` |
| 4.3 | **Gerar fatura** | `CredenciaisSnsCriarFatura` → `tfatura` | `POST …/fatura` → reutilizar pipeline **TFatura** / documentos existentes (`area-financeira/faturacao`) |
| 4.4 | Erros de emissão | `FicheiroErros` download txt | `CredenciaisSnsCriarFaturaResponse` com lista erros + download FE |
| 4.5 | Pós-sucesso | `GS.ShowReport(CredenciaisSnsFatura.rpt)` | Navegar para `documento-edicao-page` / toast + link — **sem impressão Crystal** |
| 4.6 | Lig FE submit | `credenciais-sns-fatura-submit.ts` | Substituir toast por chamada API |

**Ficheiros novos sugeridos:**

```
Backend/CliCloud.Application/Services/Faturacao/CredenciaisSnsService/
  ICredenciaisSnsFaturaService.cs
  CredenciaisSnsFaturaService.cs
  DTOs/CredenciaisSnsFaturaRequest.cs
  DTOs/CredenciaisSnsFaturaPreviewDTO.cs
  DTOs/CredenciaisSnsCriarFaturaResultDTO.cs
Backend/CliCloud.WebApi/Controllers/Faturacao/CredenciaisSnsController.cs  (+ rotas fatura)
Frontend/.../credenciais-sns/
  lib/services/.../credenciais-sns-client.ts  (+ createFatura, previewFatura)
  queries/credenciais-sns-fatura-mutations.ts
```

**Referência legado:** `CredenciaisSnsLst.js` (`gerarFatura`, `CriarFatura`), `WSFaturacao.asmx/CredenciaisSnsCriarFatura`.

#### SNS-5 — Verbete e Relação 🔇 **adiado** (pré-fatura; sem documentos nesta fase)

| # | Tarefa | Legado | Novo |
|---|--------|--------|------|
| 5.1 | Modal partilhado | `OpenModal('verbete' \| 'relacaoLotes')` — mostra campos **lote** | `credenciais-sns-verbete-relacao-modal.tsx` (extrair campos comuns de `credenciais-sns-fatura-modal.tsx`) |
| 5.2 | Validação | `gerarVerbete` / `gerarRelacaoLotes` | Mesmas regras no FE; espelhar no BE |
| 5.3 | Resultado | `.rpt` Consultas/Tratamentos | `POST …/verbete/validate` e `…/relacao-lotes/validate` → confirmação + toast — **emissão adiada** |

#### SNS-6 — Ficheiro Eletrónico SNS (ecrã separado)

**Não** é o mesmo ecrã que `CredenciaisSnsLst` — ecrã próprio no legado.

| # | Tarefa | Legado | Novo |
|---|--------|--------|------|
| 6.1 | Listagem | `CredenciaisSnsFicheiroEletronicoLst` | Página CRUD (padrão `listagem-*-page` + `DataTable`) |
| 6.2 | Entidade | `FicheiroEletronicoCredenciaisSns` (`Dados.Faturacao`) | Domain + migration + service |
| 6.3 | CRUD | Modal registo | `credenciais-sns-ficheiro-eletronico-form-modal.tsx` |
| 6.4 | Gerar ficheiro | `GeraFicheiro` / `OnGerarFicheiro1_0Click` | `POST …/ficheiro-eletronico/{id}/gerar` — export XML/ficheiro (não Crystal) |
| 6.5 | Por linha | Ver, apagar, menu tarefas | Coluna acções padrão `createAreaComumListActionsColumnDef` |

**Estrutura FE sugerida:**

```
Frontend/src/pages/area-financeira/faturacao/credenciais-sns/ficheiro-eletronico/
  pages/listagem-credenciais-sns-ficheiro-eletronico-page.tsx  (substituir placeholder)
  components/listagem-credenciais-sns-ficheiro-eletronico-table*.tsx
  modals/credenciais-sns-ficheiro-eletronico-form-modal.tsx
  queries/...
```

#### SNS-7 — Permissões e polish

| # | Tarefa |
|---|--------|
| 7.1 | Três funcionalidades RBAC (fisio / especi / exames) como `CredenciaisSnsLst.aspx.cs` |
| 7.2 | `OrganismosLancamentoCredenciaisAutoComplete` → filtrar organismos no modal Fatura (API dedicada ou filtro no light) |
| 7.3 | Naturezas por organismo (`OrganismosEdtLoad` → `List_InstituiNatureza`) — hoje `NATUREZAS_ORGANISMO` genérico |

#### SNS-R — Relatórios (fora de âmbito actual)

Manter stubs; **não implementar** nesta fase:

| Acção legado | Ficheiro stub |
|--------------|---------------|
| Listagens SNS toolbar | `emitirCredenciaisSnsListagemRelatorio()` |
| Etiquetas por linha | `imprimirEtiquetasCredenciaisSns()` |
| Pós-criar fatura `.rpt` | — (substituir por navegação documento) |
| Verbete / relação `.rpt` | — (fase SNS-5 só valida) |
| Ficheiro eletrónico «relatório» | — |

### 7.5 Estrutura do projeto novo (referência)

```
Frontend/src/pages/area-financeira/faturacao/credenciais-sns/
├── credenciais-sns-modulo-config.ts
├── pages/
│   ├── listagem-credenciais-sns-modulo-page.tsx      # ?modulo=fisioterapia|especialidades|exames
│   └── listagem-credenciais-sns-ficheiro-eletronico-page.tsx
├── components/
│   ├── listagem-credenciais-sns-table.tsx
│   ├── listagem-credenciais-sns-table.columns.tsx
│   └── listagem-credenciais-sns-filter-controls.tsx
├── modals/
│   ├── credenciais-sns-fatura-modal.tsx
│   ├── credenciais-sns-operacoes-modal.tsx           # → evoluir para verbete/relação
│   └── (futuro) credenciais-sns-verbete-relacao-modal.tsx
├── queries/
│   ├── listagem-credenciais-sns-queries.ts
│   ├── credenciais-sns-mutations.ts
│   └── credenciais-sns-form-queries.ts
└── utils/
    ├── credenciais-sns-legado-acoes.ts               # stubs relatórios
    ├── credenciais-sns-fatura-form-utils.ts
    └── credenciais-sns-fatura-submit.ts

Backend/CliCloud.Application/Services/Faturacao/CredenciaisSnsService/
├── CredenciaisSnsService.cs
├── ICredenciaisSnsService.cs
├── CredenciaisSnsModulo.cs
├── Filters/CredenciaisSnsTableFilter.cs
├── DTOs/
├── Specifications/CredenciaisSnsAgregadoSearchSpec.cs
└── (futuro) CredenciaisSnsFaturaService.cs, FicheiroEletronicoCredenciaisSnsService.cs

Backend/CliCloud.WebApi/Controllers/Faturacao/CredenciaisSnsController.cs
Backend/CliCloud.Infrastructure/.../CredenciaisSnsAgregadoDeleteExecutor.cs
```

---

## 8. Catálogo de relatórios legado (referência — 🔇 adiado)


### 8.1 Modal «Listagens» — tipos 1–7

| Tipo | Relatório Crystal | Parâmetros principais |
|------|-------------------|----------------------|
| 1 | `ListagemLancamentoCredenciaisConsultasCodigo.rpt` | `ano_de/ate`, `mes_de/ate`, `nlote_de/ate`, `c_organismo`, `c_tipo_srv` |
| 2 | `LancamentoCredenciaisEtiquetasP1Impressora.rpt` | `codigo` (credencial) |
| 3 | `EtiquetasP1ImpressoraNIF.rpt` | `codigoNIF` |
| 4 | `ListagemLancamentoCredenciaisConsultasCentroDiscriminado.rpt` | `ano/mes`, `c_centro` |
| 5 | `ListagemLancamentoCredenciaisConsultasCentroQuantidade.rpt` | `ano/mes`, `c_centro` |
| 6 | `ListagemLancamentoCredenciaisConsultasMedico.rpt` | `ano/mes`, `c_medico` |
| 7 | `ListagemLancamentoCredenciaisConsultasMedicoExterno.rpt` | `ano/mes`, `c_medico` (externo) |

### 8.2 Por linha (menu Tarefas)

| Ação | Relatório |
|------|-----------|
| Etiqueta P1 | `ListagemLancamentoCredenciaisConsultasEtiquetaP1.rpt` (`codigo`) |
| Etiqueta P1 NIF | `ListagemLancamentoCredenciaisConsultasEtiquetaP1NIF.rpt` (`codigoNIF`, `valor`) |

### 8.3 Motor no projeto novo

- **Decisão 2026-06-25:** relatórios **não** entram no roadmap actual (admin L2/L3/L5, SNS listagens/etiquetas/verbete/fatura `.rpt`).
- Stubs: `credenciais-legado-relatorios.ts`, `credenciais-sns-legado-acoes.ts` → `toast` informativo.
- Quando houver track de emissão: investigar viewer existente ou reimplementação Stimulsoft; catalogar `.rpt` em `Reports/Faturacao/` e `Reports/Consultas/`.

---

## 9. Matriz de cobertura (re-estimada)

```
Legado LancamentoCredenciais (consultas)
├── Dados + CRUD cabeçalho/linhas     █████████░  ~88%  (+ LD-P0 carregar linhas edit)
├── Passar para ativo + ESP histórico  ░░░░░░░░░░   0%  (LD-P1)
├── Sync agregados no save (B5)       ░░░░░░░░░░   0%  ⚠️
├── Regras preços / isenções          ██████░░░░  ~60%
├── Corrigir lotes + agregados        █████████░  ~90%
├── Listagens / mapas / etiquetas     🔇░░░░░░░░  adiado
├── Histórico em massa                ████████░░  ~80%  (falta RequisicoesESP)
├── ESP / relatórios partilha         🔇░░░░░░░░  adiado
├── Filtros listagem (vs legado)      ██████░░░░  ~60%
└── UX subsistema (Acor_Ins)          █████████░  ~90%
```

```
Credenciais S.N.S. — ver §7.2 (~40% global; especialidades ~85%)
```

---

## 10. Plano de fecho (prioridades)

### Concluído ✅

- [x] **LD-P0** — Carregar linhas V2/V3 no edit (`GetById` + `lote-direct-form-modal`).
- [x] F1/F2 — Consultas serviço só vínculos organismo; botão + subsistemas-servicos.
- [x] L1 (fase 1) — Filtros nº lote, organismo, mês, ano.
- [x] L2 — Modal listagens + stubs (sem Crystal).
- [x] L4 — Passar ao histórico (massa org/mês/ano por linha).
- [x] B1 — Validador save (credencial única, mês em histórico).
- [x] **SNS-0** + **SNS-1** — UI SNS + especialidades listar/apagar/ver.

### UAT / dados de teste

- [ ] Subsistemas de Serviço para organismo de teste (ex. ULS 19).
- [ ] Após gravar, correr **Corrigir Lotes** até **B5** estar implementado.
- [ ] Validar edit com linhas exame/789 (LD-P0).

### Próximo — Admin **LD-P1** (sem documentos)

- [ ] `passarLancamentoCredenciaisParaAtivo` — BE executor + modal FE + acção em modo histórico.
- [ ] `RequisicoesESP.UpdateParaHistorico/Ativo` nos executores de histórico/ativo.
- [ ] Listagem modo histórico: ocultar edit/delete/corrigir/adicionar; só Ver + Passar ativo.

### Depois — Admin **LD-P2**

- [ ] `ObternovoLote` — endpoint + ligar formulário.
- [ ] **B5** — sync agregados no save (paridade `LotdirectEdtSave`; ver §11.7).

### Depois — Admin **LD-P3** / SNS (sem faturas)

- [ ] L1 extensão — filtros utente, nome, datas.
- [ ] Validações save tipo lote 7 / ESP / PNP.
- [ ] **SNS-2** — fisioterapia `LOTESPFISIO`.
- [ ] **SNS-7.1** — permissões 3 módulos RBAC.

### Adiado 🔇 (existe no legado; fora de âmbito actual)

- [ ] **SNS-4** — `CredenciaisSnsCriarFatura` / documentos.
- [ ] **SNS-5** — verbete / relação (pré-fatura).
- [ ] L3/F8/L5 — etiquetas, listagens Crystal, relatório ESP.
- [ ] **SNS-6** — ficheiro eletrónico (track separado).
- [ ] F10 — `hospital`, `quantc/k` (não usados no Consultas legado).

### P4 — Integrações tardias

- [ ] LD-P4 — lançamento automático, navegação P/N, `OnMessage`/`selectField`.

---

## 11. Como implementar no projeto novo

Esta secção descreve **onde** e **como** fechar cada gap, seguindo a arquitectura existente (Application services, controllers `client/`, páginas `area-administrativa/credenciais`, hooks React Query).

### 11.1 F1 — Consultas: serviço só com vínculos do organismo ✅

**Objectivo:** Paridade com `SubSistemasServicosFiltroAutocomplete` + `ACOR_INS.ProcurarByInstit`.

**Estado:** implementado em `lote-direct-form-modal.tsx` — `servicoConsultaItems` usa `subsistemasOrganismo`.

---

### 11.2 F2 — Botão «+» → Subsistemas de Serviço ✅

**Estado:** `navigate` para `/area-administrativa/tabelas/subsistemas-servicos?organismoId=…`

---

### 11.3 L1 — Filtros avançados na listagem ✅ (fase 1)

**Estado:** `ListagemLoteDirectFilterControls` com nº lote, organismo, mês, ano.

- Estender `LoteDirectSearchTable` com `utenteId`, `utenteNome` (join `Utente`), `medicoId`, intervalos de data.
- Migration só se colunas não indexadas forem críticas para performance.

---

### 11.4 L2 / L3 — Listagens e etiquetas (🔇 relatórios adiados)

**Estado:** modal `ListagensLoteDirectModal` + `credenciais-legado-relatorios.ts` com toast — **sem emissão Crystal**.

**Quando houver track de relatórios** (fora do âmbito actual):

1. **BE:** `LoteDirectRelatorioService` com métodos por tipo que devolvem DTOs alinhados aos datasets Crystal (ou SQL equivalente ao `.rpt`).
2. **BE:** Endpoint `POST /client/credenciais/LoteDirect/relatorios/{tipo}` com body de filtros.
3. **FE:** Integrar viewer existente do projeto (investigar módulo `pages/reports/` — hoje focado em designer, não runtime).
4. **Etiquetas por linha:** acções extra em `getLoteDirectColumns` → `renderExtraActions` (tipos 2/3/etiqueta linha).

**Nota:** Os `.rpt` estão em `Reports/Consultas/` no legado; copiar para `reports-originais` só após validar licenciamento Stimulsoft/Crystal.

---

### 11.5 L4 — Passar lançamento ao histórico ✅ (implementado por credencial)

**Legado:** `passarLancamentoCredenciaisParaHistorico` por credencial; também existe `MoveToHistory` em massa por organismo/mês/ano.

**Novo (actual):**

- `ILoteDirectPassarHistoricoExecutor` + `POST .../passar-para-historico` (por `loteDirectId`).
- Acção na listagem admin com confirmação.

**Pendente (paridade legado):**

- `RequisicoesESP.UpdateParaHistorico` no passar histórico (LD-P1).
- `passarLancamentoCredenciaisParaAtivo` + modal (LD-P1).
- Modo histórico na listagem (LD-P1).

---

### 11.6 B1 — Validador de negócio no save ✅

**Implementado:** `LoteDirectSaveValidator` + specs `LoteDirectByCredencialSpec`, `LoteDirectOrganismoMesAnoHistoricoSpec`; FluentValidation em Create/Update requests.

**Regras activas:**

- Credencial única no create/update.
- Bloqueio organismo/mês/ano já em histórico.
- Invocação em `CreateAsync` / `UpdateAsync` antes de persistir.

**Frontend:** Mapear códigos de erro nos toasts do `handleSave` (melhoria menor se ainda incompleto).

---

### 11.7 B5 — Sync agregados no save (decisão)

| Opção | Descrição | Esforço | Paridade |
|-------|-----------|---------|----------|
| **A — Manter batch** | Documentar + aviso UI «Corra Corrigir Lotes após gravar» | Baixo | Parcial |
| **B — Auto-corrigir mês** | Após save OK, chamar `CorrigirLotesAsync(ano, mes)` em background | Médio | Funcional próxima |
| **C — Sync incremental** | Portar lógica `LotdirectEdtSave` ~850+ para `LoteDirectSaveAgregadosSync` | Alto | Máxima |

**Recomendação:** **B** para ambiente de transição (menos risco que C, melhor UX que A). Implementar flag `AutoCorrigirLotesAposSave` em config ou sempre activo em consultas.

**Ficheiros:** `LoteDirectService.cs` — após `SaveChangesAsync`, invocar executor se mês/ano presentes.

---

### 11.8 F10 — Campos LOTDIRECT em falta

**Se ainda existirem na BD `Credenciais.LoteDirect` (verificar migration / tabela física):**

1. Adicionar propriedades em `LoteDirect.cs`: `Hospital`, `Prodaplic`, `QuantidadeConsultaC`/`K` (mapear nomes reais da coluna), `Tiposrvecg`, `Ecg`, `Totalc`, `Totalk`.
2. DTOs `CreateLoteDirectRequest`, `LoteDirectDTO`, AutoMapper.
3. Campos no formulário só se utilizadores ainda os preenchem no legado (confirmar com negócio — muitos podem ser legado morto).

**Se colunas não existem na BD nova:** ignorar até requisito explícito.

---

### 11.9 Credenciais S.N.S. — roadmap (sem faturas/documentos)

**Ver §7.4.** Próxima sprint SNS (quando retomar faturação **sem** TFatura):

1. **SNS-2** — `LOTESPFISIO` + listagem/apagar fisioterapia.
2. **SNS-7.1** — permissões `Faturacao_CredSNS_Fisio` / `_Especi` / `_Exames`.

**Adiado por decisão:** SNS-4 (fatura), SNS-5 (verbete/relação), SNS-6 (ficheiro eletrónico), SNS-7.2/7.3 (naturezas modal fatura).

**Já feito:** SNS-0, SNS-1, Ver especialidades→admin, stubs relatórios.

---

## 12. Referências legado

| Ficheiro | Conteúdo |
|----------|----------|
| `LancamentoCredenciaisLst.js` | Listagem admin, relatórios tipos 1–7, etiquetas, histórico |
| `CredenciaisSnsLst.js` | Listagem SNS, `gerarFatura`, verbete, relação |
| `CredenciaisSnsFicheiroEletronicoLst.js` | Ficheiro eletrónico SNS |
| `CredenciaisSnsLst.aspx.cs` | Permissões por módulo |
| `LancamentoCredenciaisEdt.js` | Formulário, save payload, `lancamentoPeloHistorico` |
| `Services/LancamentoCredenciais.cs` | `LotdirectEdtSave`, `passarLancamentoCredenciaisParaHistorico`, corrigir |
| `Services/Admissoes.cs` | `SubSistemasServicosFiltroAutocomplete` |
| `Dados/.../LancamentoCredenciais.cs` | `LOTDIRECT`, `MoveToHistory`, filtros listagem |
| `Dados/.../Acor_Ins.cs` | `ProcurarByInstit` |

## 13. Referências novo

| Ficheiro | Conteúdo |
|----------|----------|
| `Frontend/.../area-administrativa/credenciais/` | UI lançamento + listagem |
| `Frontend/.../faturacao/credenciais-sns/` | **UI SNS completa (§7.5)** |
| `lote-direct-form-modal.tsx` | F1/F2 subsistema/serviço ✅ |
| `listagem-lote-direct-page.tsx` | Filtros, listagens stub, histórico ✅ |
| `modals/listagens-lote-direct-modal.tsx` | L2 stub tipos 1–7 |
| `modals/credenciais-sns-fatura-modal.tsx` | Modal Fatura SNS |
| `LoteDirectService.cs` | CRUD + corrigir + passar histórico + validator + **GetById com linhas** |
| `LoteDirectLinhaDTO.cs` | DTO linhas V2/V3 para edit |
| `LoteDirectSearchTable.cs` | Filtros BE disponíveis |
| `CredenciaisSnsService.cs` | SNS paginated/delete especialidades |
| `CredenciaisSnsController.cs` | API SNS |
| `credenciais-legado-relatorios.ts` | Stub relatórios admin |
| `credenciais-sns-legado-acoes.ts` | Stub relatórios SNS |

---

## 14. UAT mínimo recomendado

1. Utente com organismo + vínculos → lançamento consulta + 1 exame → gravar → **editar** → linhas V2/789 visíveis (LD-P0).  
2. Corrigir lotes → agregados OK.  
3. Credencial duplicada / mês em histórico → erro (B1).  
4. SNS especialidades → listar → Ver → `indicelote` na admin.  
5. Apagar lote SNS → agregado removido.  
6. (LD-P1) Modo histórico → passar para ativo com novo mês/ano.  
7. (B5) Gravar → agregados reflectem save sem corrigir manual.  
8. (SNS-2) Fisioterapia lista com dados.  
9. (SNS-6) Ficheiro eletrónico — quando track activo.  
10. (SNS-4) Fatura — quando track documentos activo.

---

## 15. Histórico de revisões

| Data | Alteração |
|------|-----------|
| 2026-06-25 | Documento inicial |
| 2026-06-25 | Re-auditoria: catálogo relatórios, validações save, B5, filtros, §11 implementação |
| 2026-06-25 | **LD-P0** ✅: `GetById` com `linhas`/`linhas789`; FE edit carrega grelhas V2/V3; **SNS-1** ✅; roadmap pendente §1.1 e §10 reorganizado; faturas/documentos e SNS-4/5 **adiados** |
