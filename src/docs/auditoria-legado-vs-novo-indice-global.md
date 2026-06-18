# Auditoria global — CliCloud legado vs projeto novo

Índice mestre de **paridade** entre:

- **Legado:** `CliCloud.ASPcli` + `Dados/CliCloud.Dados.*` + `Reports/`
- **Novo:** `Frontend` + `Backend` (Web API, EF Core)

**Fonte de menu legado:** `CliCloud.ASPcli/Services/WSMenus.asmx.cs`  
**Fonte de navegação novo:** `Frontend/src/routes/`, `Frontend/src/config/menu-items.ts`  
**Data de referência:** maio 2026

---

## Como usar este documento

| Objetivo | Onde ir |
|----------|---------|
| Visão de **todas** as áreas e % equiparação | Secção 1 (tabela resumo) |
| Incongruências **transversais** (afetam várias áreas) | Secção 2 |
| Detalhe por **área do produto** | Secção 3 (3.1–3.7) |
| **Como retificar** (padrões de mitigação) | Secção 4 |
| Inventário **numerado** do que recriar | Secção 5 |
| Consultas diárias admin (muito detalhe) | [`auditoria-area-administrativa-consultas-legado-vs-novo.md`](./auditoria-area-administrativa-consultas-legado-vs-novo.md) |
| Área admin ampla (menu WSMenus) | [`area-administrativa-paridade-legado-novo.md`](./area-administrativa-paridade-legado-novo.md) |

**Legenda de estado**

| Símbolo | Significado |
|---------|-------------|
| ✅ | Equiparável para uso corrente (validar regras pontuais) |
| ⚠️ | Parcial — existe UI/API mas gaps P0/P1 ou regras diferentes |
| ❌ | Ausente ou só placeholder / item de menu sem rota |
| 🔗 | Coberto noutra área do novo (reutilizar, não duplicar) |

**“Equiparável”** = mesmo resultado operacional que o legado, não cópia de WebForms nem obrigatoriamente as mesmas tabelas SQL.

---

## 1. Resumo executivo por área

| Área (menu legado) | Legado (`Client/`) | Novo (rotas/API) | Equiparação estimada | Prioridade migração |
|--------------------|--------------------|------------------|----------------------|---------------------|
| **Área Comum** — Tabelas | `Comum/`, partes `Faturacao/` (stocks) | `area-comum/tabelas` (~135 rotas) | **~75–85%** | Manutenção / validação campo a campo |
| **Área Comum** — Utilitários | `Replicar*.aspx`, `FundirUtentes` | `area-comum/utilitarios` | **~90%** | Baixa |
| **Área Comum** — App Mobile | `Mobile/` | `area-comum/app-saude` | **⚠️** | Validar vs `Client/Mobile` |
| **Área Clínica** — Processo clínico | `ProcessoClinico/` | `area-clinica/processo-clinico` | **~60–70%** | Alta (ficha, atendimento) |
| **Área Clínica** — Prescrição / MCDT / Enfermagem | `Prescricao/` | Placeholder “em breve” | **~0–5%** | **Crítica** (módulo inteiro) |
| **Área Administrativa** — Consultas | `Consultas/` | `area-administrativa/consultas` | **~35–45%** menu; **~60–70%** consultas diárias | **Em curso** (tua prioridade) |
| **Área Administrativa** — Tratamentos | `Tratamentos/` | Placeholder | **~5–10%** (só tabelas PC/API) | Após consultas + financeira |
| **Área Administrativa** — Exames | `Exames/` | Tabelas em comum; sem hub admin | **~20–30%** | Track Exames admin |
| **Área Administrativa** — Modalidades | `Modalidades/` | Placeholder | **~0–5%** | Track Modalidades |
| **Área Administrativa** — Internamento / Bloco / Cuidados | Demo no menu | ❌ | **0%** | Produto definir âmbito |
| **Área Financeira** | `Faturacao/`, `Tesouraria/` | Menu sem rotas; API mínima | **~0–5%** | **Crítica** (bloqueia admin receção) |
| **Área Gestão** | `Gestao/` | Menu sem rotas | **~0%** | Baixa / opcional |
| **Área Aprovisionamento** | Stocks/compras em `Faturacao/` | Menu sem rotas | **~0%** | Média (stocks) |
| **Relatórios** | `Reports/*` (centenas) | Designer + `ReportController`; muitos stubs | **~10–15%** | Por prioridade cliente |

**Conclusão global:** O novo **não** substitui o legado na totalidade. Compõe por camadas: **Comum** sólido → **Clínica** (PC forte, medicação fraca) → **Admin Consultas** (receção em curso) → **Financeira** (quase ausente, bloqueador transversal).

---

## 2. Incongruências transversais (todas as áreas)

Estas incongruências aparecem em mais do que um módulo. Corrigir uma vez beneficia várias áreas.

| # | Incongruência | Legado | Novo | Como retificar |
|---|---------------|--------|------|----------------|
| T1 | **Modelo histórico consultas** | `HIST_AD` / `HIST_ADF` | `Consulta` promovida | Decisão produto: A) só `Consulta` B) views SQL compat. C) dual-write temporário — ver doc consultas §6.3 |
| T2 | **Data de trabalho** | `getDataTrabalho` / sessão | Lista admissões: `DateTime.Today`; fecho: sessão | `dataReferencia` em API + frontend em todas as listas operacionais do dia |
| T3 | **Pago / Faturado** | Só via `TFatura` / `setAdmissaoFaturada` | Checkboxes manuais na admissão | Fase A: só leitura; Fase B–C: área financeira emite eventos — ver doc consultas §6.2 |
| T4 | **Relatórios Crystal** | `Reports/*.cs` + `.rpt` | Motor novo + stubs | Inventariar relatórios obrigatórios por clínica; migrar template ou view SQL |
| T5 | **Permissões** | `AppControl.Funcionalidades.*` em `WSMenus` | Módulos GUID em `config/modules` | Matriz `Funcionalidades` legado → `funcionalidadeId` novo; seeders BD |
| T6 | **ASMX → REST** | `Client/**/Services/*.cs` | Controllers + Application services | Por ecrã: comparar métodos WS com endpoints; testes aceitação |
| T7 | **Stocks / artigos** | `Faturacao/ArtigoLst`, etc. (menu Comum) | Stocks = só vias administração | Recriar com área financeira/aprovisionamento ou reutilizar quando existir |
| T8 | **Marcações** | Admin (`MarcacoesLst`) + Clínica (`ConsultasMarcadas`) | Clínica parcial; admin ausente | Definir: admin = clínica ou recriar suite admin (troca médicos, lista espera, …) |
| T9 | **Integrações SPMS / prescrição** | `Prescricao/`, `Dados` SOAP | `ISpmsPrescricaoSoapService` sem UI produto | Módulo prescrição: UI + fluxos RSP/MCDT |
| T10 | **Soft delete vs apagar** | Desmarcar / estado | `DELETE` em admissões | Desmarcar → `StatusConsulta`; delete só admin |

---

## 3. Incongruências e retificação por área

### 3.1 Área Comum (`WSMenus` → `case "Tabelas"`, `Utilitarios`, `AppMobile"`)

**Novo:** `Frontend/src/routes/area-comum/areaComum.tsx`, controllers em `Utentes`, `Medicos`, `Organismos`, `Utility`, `Tratamentos` (tabelas), `Exames`, etc.

#### O que está equiparado (✅)

- Entidades: utentes, médicos, externos, organismos, centros, funcionários, fornecedores, empresa, técnicos.
- Geográficas: países, distritos, concelhos, freguesias, códigos postais, ruas.
- Tabelas gerais: bancos, especialidades, estados civis, IVA, moedas, profissões, sexos, graus parentesco, proveniências, tipos entidade, entidades financeiras.
- Consultas (tabelas): serviços, subsistemas (≈ `Acor_Ins`), tipos serviço, margem médicos, alergias, graus, doenças.
- Tratamentos (tabelas): locais, prioridades, patologias, regiões/zonas corpo, aparelhos, goniometrias, motivos alta/desmarcação, etc.
- Exames (tabelas): centros/unidades, análises, tipos exame, acordos.
- Configuração: clínicas, SMS, voz, teleconsulta, carta condução, email, webservice, exames sem papel, separadores, feriados, documentos, referências MB, notificações.
- Utilitários: replicar patologias/subsistemas/margem, atualizar subs. entidade, fundir utentes.

#### Incongruências principais (⚠️ / ❌)

| # | Legado | Novo | Retificação |
|---|--------|------|-------------|
| C1 | `ZonasLst.aspx` | ❌ | CRUD Zonas: entidade + controller + rota comum |
| C2 | `ArtigoLst`, `FamiliaArtigosLst`, `UnidadeLst` (menu stocks) | Só vias + grupo vias | Módulo stocks/faturação: artigos, famílias, unidades — ver **[`auditoria-artigos-stocks-legado-vs-novo.md`](./auditoria-artigos-stocks-legado-vs-novo.md)** |
| C3 | `PagamentosMedicosLst`, `PagamentosTerapeutasLst` | ❌ | Ecrãs + API pagamentos (ou integrar financeira) |
| C4 | `Acor_InsLst` vs subsistemas | `subsistemas-servicos` | Validar campos/regras 1:1; documentar mapeamento |
| C5 | Formulários personalizados legado | Rotas referidas | Auditar `formularios-personalizados` vs `FormulariosPersonalizadosLst` |
| C6 | App Mobile completo | `app-saude` | Comparar `Client/Mobile` e `Dados.Mobile` |
| C7 | Paridade campo a campo em cada `.aspx` | CRUD genérico | Checklist por entidade (ver §4.1) |

**Equiparação global Comum:** ~75–85% — **não exige reescrita total**, exige **fechar lacunas C1–C3** e validação sistemática.

---

### 3.2 Área Clínica (`ProcessosCli`, `Prescricao`, `PrescricaoMCDT`, `Enfermagem`)

**Novo:** `Frontend/src/routes/area-clinica/areaClinica.tsx`

#### Processo clínico (⚠️ ~60–70%)

| Legado | Novo | Estado |
|--------|------|--------|
| `AtendimentoUtenteLst` / `FichaClinica.aspx` | `consultas-do-dia`, `ficha-clinica` (muitas tabs) | ⚠️ |
| `ConsultasMarcadasLst`, listagem, mapa | `agenda/*` | ⚠️ |
| `ExamesSemPapelMedicoLst` | `exames-sem-papel` | ⚠️ |
| Atestados carta condução | `atestados/*` + SPMS parcial | ⚠️ |
| Histórico consultas efetuadas | `historico/*` | ⚠️ |
| Tabelas PC (medicamentos, alergias, body chart, …) | `processo-clinico/tabelas/*` | ⚠️ |
| `EvolucaoTratamentoEdt` | `evolucao-tratamento` | ⚠️ |
| Separadores / formulários dinâmicos | API separadores + `SeparadorDinamicoTab` | ⚠️ |

**Retificação PC:** por tab da ficha, comparar com legado; portar regras de gravação em falta; testes por especialidade (odontologia, estomatologia, fisio).

#### Prescrição / MCDT / Enfermagem (❌ ~0–5%)

| Legado | Novo | Retificação |
|--------|------|-------------|
| `PrescricaoLst`, `PrescricaoRSPEdt`, `MedicamentoLst`, … | Rotas placeholder | **Recriar módulo:** UI prescrição eletrónica, integração SPMS, receituário manual |
| Prescrição MCDT | Placeholder | Módulo MCDT + webservices |
| Enfermagem | Placeholder | Módulo enfermagem (âmbito a definir com legado) |
| Tab medicação na ficha (`MedicacaoTab`) | “A implementar” | Implementar receita eletrónica/manual na ficha |

**Backend:** `ISpmsPrescricaoSoapService` existe; falta **produto** (controllers + páginas + permissões `Presc_*`).

---

### 3.3 Área Administrativa

#### 3.3.1 Consultas (detalhe noutro doc)

Ver **[auditoria-area-administrativa-consultas-legado-vs-novo.md](./auditoria-area-administrativa-consultas-legado-vs-novo.md)** — inventário completo, P0–P2, sprints.

**Resumo incongruências:** data trabalho, pago/faturação, histórico editável, fisio, marcações admin, mapas, credenciais parciais, sinistrados parciais.

#### 3.3.2 Tratamentos admin (❌)

| Legado | Novo |
|--------|------|
| Planning, marcações, admissões fisio, credenciais, histórico, mapas, estatísticas (`Client/Tratamentos/`) | Placeholder `area-administrativa/tratamentos` |

**Retificação:** track próprio — espelhar `WSMenus` `case "Tratamentos"`; reutilizar APIs `Tratamentos/*` já existentes para **dados clínicos**, acrescentar **operação diária**.

#### 3.3.3 Exames admin (❌ / ⚠️)

| Legado | Novo |
|--------|------|
| Centros, análises, tipos, acordos (menu Exames admin) | Tabelas em **comum**; sem hub admin exames |
| Operação laboratório / mapas exames | ❌ |

**Retificação:** hub `area-administrativa/exames` ou consolidar em comum + relatórios.

#### 3.3.4 Modalidades (❌)

| Legado | Novo |
|--------|------|
| Agenda, matrículas, sessões diárias, faturação modalidades (`Client/Modalidades/`) | Placeholder |

**Retificação:** track `Dados.Modalidades` + UI completa.

#### 3.3.5 Internamento / Bloco / Cuidados contínuos

Menu legado (muitas vezes demo). **Retificação:** decisão de produto — fora de âmbito ou projeto separado.

---

### 3.4 Área Financeira (`Faturacao`, `ContasCorrentes`, `Tesouraria`, `Configuracoes`)

**Novo:** item no `menu-items.ts`; **sem** `routes` em `index.tsx`. API: `ReferenciasMbController`, `ReciboController`, `Documentos/*` — **não** o núcleo `Tfatura`.

| Bloco legado | Exemplos | Novo | Retificação |
|--------------|----------|------|-------------|
| Faturação | `TfaturaLst/Edt`, emitir FR, NC, liquidações, ADSE | ❌ | **Recriar módulo financeiro:** documentos, linhas, integração admissão (`T1`–`T3`) |
| Contas correntes | `MapasContasCorrentes`, liquidações organismo/utente | ❌ | CC + mapas |
| Tesouraria | `Client/Tesouraria/` | ❌ | Módulo tesouraria |
| Config faturação | refs MB (parcial em comum), tipos documento | ⚠️ | Completar configs |
| Stocks (ligação) | artigos, movimentos, armazéns | ❌ | Ver C2, área aprovisionamento |

**Impacto:** bloqueia paridade **admin consultas** (pago, emitir FR na receção, histórico faturável).

---

### 3.5 Área Gestão (`Dashboards`, `Excel`, `Marketing`)

| Legado | Novo | Retificação |
|--------|------|-------------|
| `Gestao/Dashboards*`, marketing, Excel | Menu sem rotas | ❌ Recriar ou adiar; dashboards podem ser BI externo |

---

### 3.6 Área Aprovisionamento (`Stocks`, `Compras`)

| Legado | Novo | Retificação |
|--------|------|-------------|
| Requisições, entradas/saídas artigo, armazéns | Menu sem rotas | ❌ Módulo stocks + compras; ligar a artigos (C2) |

---

### 3.7 Relatórios (`CliCloud.ASPcli/Reports/`)

| Legado | Novo | Retificação |
|--------|------|-------------|
| Dezenas de relatórios por domínio (Consultas, Tratamentos, Faturacao, …) | `reports/designer`, `ReportController`, stubs em admissões | Priorizar por cliente; migrar template; um hub parametrizado por `codigo` onde o legado usa query string |

**Não** é obrigatório replicar cada `.aspx` de mapa — é obrigatório produzir o **mesmo output** para relatórios legalmente/operacionalmente necessários.

---

## 4. Padrões de retificação (como corrigir em qualquer área)

### 4.1 Checklist por ecrã legado (repetível)

Para cada `*.aspx` + `*.js` legado:

1. Localizar no `WSMenus` e permissão `Funcionalidades`.
2. Listar métodos ASMX em `Services/*.cs` e SQL em `Dados.*`.
3. Verificar rota novo + controller + entidade EF.
4. Comparar: filtros, colunas, validações no save, efeitos colaterais (SMS, fatura, histórico).
5. Classificar ✅ / ⚠️ / ❌ e registar na tabela da área.
6. Implementar ou documentar dependência (ex.: “bloqueado por financeira”).

### 4.2 Ordem de implementação recomendada

```text
1. Transversais T2, T10 (data trabalho, desmarcar) — admin consultas
2. Transversal T3 fase A (pago só leitura)
3. Comum — lacunas C1–C3 se a clínica precisar
4. Admin consultas — Sprints doc consultas (1–4)
5. Área financeira — T3 fases B–C, Tfatura, liquidações
6. Clínica — Prescrição/MCDT/Enfermagem (módulo)
7. Admin — marcações, mapas, tratamentos, modalidades, exames
8. Gestão / Aprovisionamento — conforme contrato
9. Relatórios — por lista priorizada do cliente
```

### 4.3 O que não fazer

- Duplicar utentes/médicos/serviços já em **comum** no admin sem necessidade.
- Gravar `Pago`/`Faturado` à mão enquanto a financeira não existir.
- Assumir que agenda **clínica** substitui marcações **admin** sem decisão escrita de produto.
- Recriar `HIST_AD` no código novo sem necessidade de relatório (preferir views ou relatórios novos).

---

## 5. Inventário mestre numerado (todas as áreas)

| ID | Área | Item a recriar / fechar | Doc detalhe |
|----|------|-------------------------|-------------|
| G01 | Transversal | Alinhar data trabalho em operações diárias | Consultas §6.1 |
| G02 | Transversal | Pago/faturado via financeira | Consultas §6.2 |
| G03 | Transversal | Estratégia HIST_* vs Consulta | Consultas §6.3 |
| G04 | Transversal | Matriz permissões WSMenus → modules | Este §4.1 |
| G05 | Transversal | Plano migração relatórios | §3.7 |
| C01 | Comum | Zonas | §3.1 C1 |
| C02 | Comum | Artigos / famílias / unidades (stocks) | §3.1 C2, §3.6 |
| C03 | Comum | Pagamentos médicos/terapeutas | §3.1 C3 |
| CL01 | Clínica | Prescrição eletrónica (módulo) | §3.2 |
| CL02 | Clínica | Prescrição MCDT | §3.2 |
| CL03 | Clínica | Enfermagem | §3.2 |
| CL04 | Clínica | MedicacaoTab (receitas na ficha) | §3.2 |
| CL05 | Clínica | Paridade tabs ficha vs legado | §3.2 |
| A01–A25 | Admin Consultas | Ver tabela sec. 10 doc consultas | [consultas](./auditoria-area-administrativa-consultas-legado-vs-novo.md) |
| A30 | Admin | Tratamentos operacionais | §3.3.2 |
| A31 | Admin | Modalidades | §3.3.4 |
| A32 | Admin | Exames operacionais admin | §3.3.3 |
| F01 | Financeira | Tfatura / emitir FR / NC | §3.4 |
| F02 | Financeira | Contas correntes | §3.4 |
| F03 | Financeira | Tesouraria | §3.4 |
| P01 | Aprovisionamento | Stocks + movimentos | §3.6 |
| P02 | Aprovisionamento | Compras / requisições | §3.6 |
| M01 | Gestão | Dashboards / marketing / Excel | §3.5 |

---

## 6. Documentos do repositório (mapa)

| Ficheiro | Âmbito |
|----------|--------|
| **Este ficheiro** | Índice global — todas as áreas |
| `auditoria-area-administrativa-consultas-legado-vs-novo.md` | Admin › Consultas (detalhe + sprints) |
| `area-administrativa-paridade-legado-novo.md` | Admin menu completo (pode ter secções desatualizadas; cruzar com os dois acima) |
| `credenciais-corrigir-lotes-implementacao.md` | LoteDirect / credenciais SNS |

**Manutenção:** ao fechar um gap, atualizar o estado (✅) na tabela da secção 3 e no inventário secção 5.

---

## 7. Conclusão

- O ficheiro **só de consultas admin** continua válido como **detalhe profundo** de um submenu.
- **Sim, é melhor** ter este **índice global** para enumerar incongruências em **todas** as áreas e como retificar.
- O projeto novo está **em construção**; a equiparação real é **por área e por dependência**, não um “big bang”.
- Prioridade sugerida alinhada ao teu plano: **fechar transversais T2/T10 + admin consultas** → **financeira** → **prescrição/medicação** → **resto admin** → gestão/aprovisionamento.

Quando uma área atingir checklist de go-live, assinar na secção 3 dessa área (data + responsável) — opcional para controlo de projeto.
