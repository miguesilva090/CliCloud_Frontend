# Disparidades — Lançamento de Credenciais (Legado vs Novo)

**Última atualização:** 2026-06-25 (roadmap Credenciais S.N.S.)  
**Âmbito:** `LancamentoCredenciaisLst/Edt` (Consultas) vs `area-administrativa/credenciais` (`LoteDirect`) **+** faturação `CredenciaisSnsLst` vs `area-financeira/faturacao/credenciais-sns`.  
**Relacionado:** `credenciais-corrigir-lotes-implementacao.md`, `auditoria-area-administrativa-consultas-legado-vs-novo.md` (§3.7), `auditoria-menu-faturacao-legado-vs-novo.md` (§2.3).

**Princípio:** paridade **funcional** com o legado — não réplica espelhada do ASP (Metronic, ASMX, Crystal).  
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

| Camada | vs legado `LancamentoCredenciais` | Notas da re-auditoria |
|--------|-----------------------------------|------------------------|
| **Modelo de dados** | 🟡 | `LoteDirect` cobre o núcleo; faltam colunas legado (`hospital`, `prodaplic`, `quantc`/`quantk`, `tiposrvecg`, `ecg`, `totalc`/`totalk`) |
| **CRUD lançamento** | 🟡 | Gravar cabeçalho + linhas OK; validações de negócio muito reduzidas vs `LotdirectEdtSave` |
| **Sync agregados no save** | ⚠️ | Legado atualiza `LOTESP`/`LOTES` **em cada gravação**; novo só via **Corrigir Lotes** (batch) |
| **Corrigir lotes** | ✅ | Executor + validação prévia + ecrã agregados |
| **Subsistema / serviço** | 🟡 | Consultas e exames com vínculos organismo ✅; exames mantém fallback manual ➕ |
| **Listagens / mapas / etiquetas** | 🔇 | Stubs documentados; **sem emissão Crystal** nesta fase |
| **Histórico em massa** | ✅ | `POST passar-para-historico` + acção na listagem |
| **Filtros listagem** | 🟡 | BE 7 filtros; FE expõe nº lote, organismo, mês, ano (+ credencial, histórico, URL) |
| **ESP / relatórios partilha** | 🔇 | Adiado |
| **Faturação SNS** | 🟡 | ~30% — ver **§7** (UI forte; BE sobretudo especialidades) |

**Conclusão:** o fluxo **lançar → gravar linhas → corrigir lotes → ver agregados → SNS listar (especialidades)** é utilizável em UAT. **Não** é paridade total: sync incremental no save (B5), relatórios, e quase todo o track SNS de faturação/verbete/ficheiro eletrónico.

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
| `WSFaturacao.asmx/CredenciaisSnsCriarFatura` | ⏳ (fase SNS-4) |
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
| L8 | `passarLancamentoCredenciaisParaAtivo` (reverter histórico com novo mês/ano) | ⏳ | P3 |

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
**Cobertura estimada:** ~**30%** (UI ~90%; dados/negócio ~15% fora especialidades).

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
| Modal **Fatura** | `OpenModal('fatura')` + `gerarFatura` | `credenciais-sns-fatura-modal.tsx` (UI + validação) | 🟡 sem BE |
| Modal **Verbete** / **Relação** | Mesmo modal, campos lote | Stub `credenciais-sns-operacoes-modal.tsx` | ⏳ |
| **Ficheiro Eletrónico** | CRUD + gerar ficheiro ACSS | Placeholder página | ⏳ |
| Etiquetas / Listagens SNS | Crystal | Stub `credenciais-sns-legado-acoes.ts` | 🔇 adiado |
| Permissões por módulo | 3 `IDFuncionalidade` no `.aspx.cs` | Uma `credenciaisSns` no FE | ⏳ |

### 7.2 Matriz de cobertura SNS

```
Credenciais S.N.S. (Faturação)
├── Menu + rotas 4 variantes          ██████████  100%
├── UI listagem (3 módulos)           █████████░   90%
├── Filtros + grelha                  ████████░░   80%
├── Listagem com dados (especialidades) ███░░░░░░░   30%
├── Fisioterapia / exames (dados)     ░░░░░░░░░░    0%
├── Apagar lotes                      ███░░░░░░░   30%
├── Modal Fatura (UI)                 ██████░░░░   60%
├── Criar fatura (negócio)            ░░░░░░░░░░    0%
├── Verbete / relação (UI+negócio)    █░░░░░░░░░   10%
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

#### SNS-1 — Especialidades: fecho BE 🟡 (quase completo)

| # | Tarefa | Legado | Novo |
|---|--------|--------|------|
| 1.1 | Paginated + filtros | `CredenciaisSnsLst` | ✅ `GetPaginatedAsync` + `CredenciaisSnsAgregadoSearchSpec` |
| 1.2 | Delete lote | `CredenciaisSnsDel` | ✅ `CredenciaisSnsAgregadoDeleteExecutor` |
| 1.3 | Enriquecimento organismo/tipo lote | Joins implícitos ASMX | ✅ `PreencherEnriquecimentosAsync` |
| 1.4 | Testes UAT delete em cascata (`LOTES`) | Sim | Validar em BD após cada release |

**Ficheiros BE:** `CredenciaisSnsService.cs`, `Specifications/`, `Infrastructure/.../CredenciaisSnsAgregadoDeleteExecutor.cs`, `CredenciaisSnsController.cs`.

#### SNS-2 — Fisioterapia (dados + Ver)

| # | Tarefa | Legado | Implementação sugerida |
|---|--------|--------|------------------------|
| 2.1 | Entidade `LOTESPFISIO` | `Dados/Tratamentos/LancamentoCredenciais.cs` | Migration `Credenciais.LoteFisioAgregado` (ou nome alinhado ao domínio) + configuration EF |
| 2.2 | Spec paginated/delete | `CredenciaisSnsLst?modulo=fisioterapia` | `CredenciaisSnsFisioterapiaSearchSpec` em `CredenciaisSnsService` |
| 2.3 | DTO partilhado ou extensão | Mesmas colunas da grelha | Reutilizar `CredenciaisSnsLoteTableDTO` |
| 2.4 | **Ver** | `LancamentoCredenciaisLst.aspx` (Tratamentos) | Rota futura tratamentos **ou** manter toast até existir `area-administrativa/tratamentos/credenciais` |
| 2.5 | Permissão | `Faturacao_CredSNS_Fisio` | Mapear em `modules.areaFinanceira.permissions` (sub-permissão ou claim) |

**Ordem técnica:** inspecionar `CliCloud.ASPcli` + `Dados` para mapeamento colunas → domínio → AutoMapper → activar ramo `fisioterapia` em `GetPaginatedAsync` / `DeleteAsync`.

#### SNS-3 — Exames (dados + Ver)

| # | Tarefa | Legado | Notas |
|---|--------|--------|-------|
| 3.1 | Listagem exames | ASMX (quando existir dados) | Confirmar tabela origem no legado (pode partilhar agregados com regra distinta) |
| 3.2 | **Ver** | `CredenciaisSnsLstBrevemente` | Manter toast até módulo exames SNS definido |
| 3.3 | Permissão | `Faturacao_CredSNS_Exames` | Idem SNS-2.5 |

#### SNS-4 — Fatura (negócio, sem Crystal)

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

#### SNS-5 — Verbete e Relação de Lotes (UI + validação, sem Crystal)

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
├── Dados + CRUD cabeçalho/linhas     ████████░░  ~80%
├── Sync agregados no save            ░░░░░░░░░░   0%  ⚠️
├── Regras preços / isenções          ██████░░░░  ~60%
├── Corrigir lotes + agregados        █████████░  ~90%
├── Listagens / mapas / etiquetas     🔇░░░░░░░░  stubs (adiado)
├── Histórico em massa                ████████░░  ~80%  (por credencial; legado era organismo/mês)
├── ESP / relatórios partilha         🔇░░░░░░░░  adiado
├── Filtros listagem (vs legado)      ██████░░░░  ~60%
└── UX subsistema (Acor_Ins)          █████████░  ~90%
```

```
Credenciais S.N.S. (faturação) — ver §7.2
└── Cobertura global ~30% (UI pronta; BE operacional sobretudo especialidades)
```

---

## 10. Plano de fecho (prioridades)

### P0 — Dados de teste

- [ ] Criar **Subsistemas de Serviço** para organismo de teste (ex. ULS 19) em `subsistemas-servicos`.
- [ ] Confirmar **Tipo de Serviço** no cabeçalho antes de linhas de exame.
- [ ] Após cada gravação em UAT, correr **Corrigir Lotes** até decisão sobre B5.

### P1 — Paridade operacional imediata

- [x] F1: Consultas → serviço = só vínculos organismo.
- [x] F2: Botão **+** → subsistemas-servicos (query `organismoId`).
- [x] L2: Modal listagens + **stubs** (sem Crystal).
- [ ] Decisão B5: sync agregados no save vs manter batch.
- [ ] **SNS-4:** `CredenciaisSnsCriarFatura` + preview sem `.rpt`.

### P2 — Completude listagem e save

- [x] L1: Filtros nº lote, organismo, mês, ano na listagem admin.
- [x] L4: Passar ao histórico por linha.
- [x] B1: Validador save (credencial única, mês em histórico).
- [ ] L3: Etiquetas — **adiado** (relatórios).
- [ ] F10: Campos legado em falta (se ainda usados na BD).
- [ ] **SNS-2 / SNS-3:** Fisioterapia e exames com dados.

### P3 — Integrações SNS e ESP

- [ ] **SNS-5:** Modais verbete + relação (validação; sem `.rpt`).
- [ ] **SNS-6:** Ficheiro eletrónico SNS (CRUD + gerar ficheiro).
- [ ] **SNS-7:** Permissões por módulo + organismos/naturezas no modal Fatura.
- [ ] L5: Relatório ESP — **adiado**.
- [ ] F8: Impressão credenciais — **adiado**.
- [ ] L7/L8: Seleção externa e reverter histórico.

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

**Pendente (paridade legado em massa):**

- `MoveToHistory` por organismo/mês/ano (todas as credenciais de uma vez).
- `PassarParaAtivoAsync` / reverter histórico.
- Integração `RequisicoesESP` (exames-sem-papel).

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

### 11.9 Credenciais S.N.S. — roadmap detalhado

**Ver §7.4** (fases SNS-0 a SNS-7 + SNS-R relatórios adiados). Resumo da próxima sprint sugerida:

1. **SNS-4** — `CredenciaisSnsCriarFatura` + preview DTO + ligar `credenciais-sns-fatura-submit.ts`.
2. **SNS-2** — migrar `LOTESPFISIO` e activar listagem fisioterapia.
3. **SNS-5** — modais verbete/relação (campos lote do legado `OpenModal`).
4. **SNS-6** — ficheiro eletrónico (substituir placeholder).

**Já feito (SNS-0 + SNS-1 parcial):** menu, rotas, UI 3 módulos, filtros, paginated/delete especialidades, Ver→admin, modal Fatura UI, stubs relatórios.

**Não fazer agora:** qualquer `.rpt`, `GS.ShowReport`, etiquetas SNS, listagem Crystal toolbar.

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
| `LoteDirectService.cs` | CRUD + corrigir + passar histórico + validator |
| `LoteDirectSearchTable.cs` | Filtros BE disponíveis |
| `CredenciaisSnsService.cs` | SNS paginated/delete especialidades |
| `CredenciaisSnsController.cs` | API SNS |
| `credenciais-legado-relatorios.ts` | Stub relatórios admin |
| `credenciais-sns-legado-acoes.ts` | Stub relatórios SNS |

---

## 14. UAT mínimo recomendado

1. Utente com organismo + vínculos → lançamento consulta + 1 exame → gravar → **corrigir lotes** → agregados OK.  
2. Repetir **sem** vínculos → comparar legado (lista vazia consultas) vs novo (F1 após fix).  
3. Tentar gravar credencial duplicada → legado erro; novo deve falhar após B1.  
4. Tentar gravar mês já em histórico → legado erro; novo deve falhar após B1.  
5. SNS especialidades → listar → Ver → `indicelote` na listagem admin.  
6. Apagar lote SNS → agregado + detalhes removidos.  
7. Modal Fatura → validar campos; após SNS-4, criar documento sem `.rpt`.  
8. (Pós B5) Gravar lançamento → agregados reflectem save automático ou aviso corrigir.  
9. (Pós SNS-2) Fisioterapia lista com dados; Ver abre tratamentos (quando rota existir).  
10. (Pós SNS-6) Ficheiro eletrónico: CRUD + gerar ficheiro exportável.

---

## 15. Histórico de revisões

| Data | Alteração |
|------|-----------|
| 2026-06-25 | Documento inicial |
| 2026-06-25 | Re-auditoria: catálogo relatórios, validações save, B5, filtros, §11 implementação |
| 2026-06-25 | **Roadmap Credenciais S.N.S. (§7):** estado ~30%, fases SNS-0–7, estrutura projeto novo; relatórios 🔇 adiados; progresso admin F1/F2/L1/L2/L4/B1 |
