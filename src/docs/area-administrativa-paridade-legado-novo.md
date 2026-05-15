# Paridade Área Administrativa: legado (CliCloud.ASPcli) → projeto novo

Documento de **lacunas e trabalho necessário** para o comportamento, a lógica e o modelo de dados do novo alinharem ao pretendido do **CliCloud.ASPcli**, com foco na **Área Administrativa** tal como definida no menu (`Services/WSMenus.asmx.cs`: secção `AreaAdministrativa` + conteúdo carregado por `LoadSubMenu` para as chaves `Consultas`, `Tratamentos`, `Exames`, `Modalidades`, e entradas reservadas Internamento / Bloco operatório / Cuidados contínuos).

**Fonte de verdade legada:** `CliCloud.ASPcli/Services/WSMenus.asmx.cs`, `CliCloud.ASPcli/Client/{Consultas,Tratamentos,Exames,Modalidades,Comum,Faturacao}/`, serviços ASMX por pasta, `CliCloud.Dados.*`.

**Estado atual (resumo):** no novo existem rotas e UI parciais em `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`, `Frontend/src/pages/area-administrativa/**`, menus em `Frontend/src/config/menu-items.ts`, módulo `Frontend/src/config/modules/administrativo/area-administrativa-module.ts`, e no backend `LoteDirectController` + `SinistradoController` + serviços em `CliCloud.Application`.

---

## 0. Resumo executivo — o que ainda falta (vs `CliCloud.ASPcli` Área Administrativa)

Referência de menu: `CliCloud.ASPcli/Services/WSMenus.asmx.cs` (`AreaAdministrativa` → `LoadSubMenu` para `Consultas`, `Tratamentos`, `Exames`, `Modalidades`).

| Bloco legado (menu admin) | Novo — estado | O que falta (Frontend + Backend) |
|---------------------------|----------------|-----------------------------------|
| **Marcações** (semanais, gestão salas, troca médicos, ordem entrada, lista espera, global booking) | Só **atalhos** para área clínica em `menu-items.ts` | Ecrãs e APIs equivalentes a `MarcacoesLst`, `MarcacoesGestaoSalasLst`, `TrocaMarcacoesEntreMedicos`, `OrdemEntradaMarcacoesLst`, `ListaEsperaLst`, `PedidosConsultaLst` + permissões `Consul_*`. |
| **Consultas diárias** (admissões, pendentes, fecho diário) | Atalhos → processo clínico | `AdmissoesLst` (modos), `FechoDiario` + serviços/migrações alinhados a `CliCloud.Dados.Consultas` / `Admissoes.cs`. |
| **Credenciais SNS** (lotes + exames sem papel) | **Parcial:** `LoteDirect` UI + API; exames sem papel via rota admin → página clínica | Paridade total `Lotdirect*` / faturação `CredenciaisSnsLst` + relatórios; listagem já com enriquecimentos (ex.: sigla organismo via `CodigoULSNova`/`Abreviatura`). |
| **Sinistrados** | **Parcial:** listagem, novo, histórico | Regras/WS e campos vs legado; testes de aceitação. |
| **Histórico admin** (datas, utentes, médicos, organismos) | Só histórico **clínico** (consultas efetuadas / listagens) | `Historico*Lst` como relatórios admin ou fundir produto; APIs agregadas. |
| **Mapas** (dezenas de `codigo=` + livro caixa + Excel) | Dois mapas (marcadas / efetuadas) na área clínica | Serviços de relatório + UI `MapasServicosComValores` / `MapasLivroCaixa` / `GerarFicheiroExcel`. |
| **Entidades** (utentes, médicos, organismos no menu Consultas) | Médicos, fornecedores, funcionários em admin; utentes/organismos **não** no mesmo header | Rotas/links + permissões; eventualmente mesma entrada que legado. |
| **Tabelas** (serviços, acordos, doenças, margens, tipos carta, tipos consulta, prioridades, motivos, salas…) | Várias rotas admin → páginas **area-comum**; salas/motivos/tipos carta dedicados em admin | Cobrir `Acor_InsLst`; validar paridade campo a campo com `.aspx`/`.js` legado. |
| **Tratamentos** (todo o `case "Tratamentos"`) | **Placeholder** `AreaAdministrativaTablePlaceholderPage` | Módulo inteiro: planning, marcações, admissões, credenciais fisio, histórico, mapas, estatísticas, entidades, tabelas + `Backend` espelho. |
| **Exames** (`case "Exames"`) | **Sem** hub/rota admin dedicada no novo | Centros, análises, tipos exame, acordos + permissões `Exames_*`. |
| **Modalidades** | **Placeholder** | Agenda, matrículas, faturação modalidades, config + `CliCloud.Dados.Modalidades`. |
| **Internamento / Bloco / Cuidados contínuos** | Entrada de menu legado (muitas vezes demo) | Definir âmbito; se necessário, mesmo padrão Domain/Application/WebApi/UI. |
| **Permissões** | Subconjunto em `area-administrativa-module.ts` | Mapear **todas** as `Funcionalidades` do `WSMenus` para IDs/guards e seeders BD. |

**Conclusão:** o novo cobre **uma fatia** do menu administrativo legado (credenciais, sinistrados, parte das tabelas/entidades). O **volume maior** — marcações operacionais admin, consultas diárias/fecho, históricos e mapas admin, **tratamentos**, **exames**, **modalidades** e relatórios — **ainda não está implementado** na mesma abrangência que `CliCloud.ASPcli`.

---

## 0.1 Auditoria técnica (revisão) — evidências e priorização

### A) Definição de âmbito (legado)

| Conceito legado | Onde está definido |
|-----------------|-------------------|
| Bloco lateral “Área Administrativa” | `CliCloud.ASPcli/Services/WSMenus.asmx.cs` — `MainMenu("AreaAdministrativa", …)` com filhos `Consultas`, `Tratamentos`, `Exames`, `Modalidades`, … |
| Conteúdo de cada filho | Mesmo ficheiro, `LoadSubMenu()` — `switch (menuKey)` em `Consultas`, `Tratamentos`, `Exames`, `Modalidades` |
| Permissões por linha de menu | `LoginInfo.IsFuncionalidadeAllowed(AppControl.Funcionalidades.*)` |
| Dados e regras | `CliCloud.Dados.*` + `CliCloud.ASPcli/Client/**/Services/*.cs` (ASMX) |

### B) Novo — navegação e UI (`Frontend`)

| Peça | Evidência | Avaliação vs legado |
|------|-----------|---------------------|
| Rotas `area-administrativa/*` | `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx` | Credenciais, sinistrados, tabelas (várias via lazy `area-comum`), entidades parciais; **tratamentos** e **modalidades** = placeholder |
| Header “Área Administrativa” (submenus) | `Frontend/src/config/menu-items.ts` → `roleHeaderMenus['area-administrativa']` | **Marcações** e **Consultas diárias** têm só 2 links cada → área **clínica**, não equivalentes a `MarcacoesLst`, `AdmissoesLst`, `FechoDiario`, etc. |
| **Histórico** / **Mapas** | Idem | Só fluxos **clínico** (consultas efetuadas / mapas marcadas-efetuadas); **sem** `HistoricoDatasLst`, `HistoricoMedicosLst`, `MapasServicosComValores` (dezenas de `codigo=`), livro de caixa, Excel |
| **Entidades** | Idem | Falta **Utentes** e **Organismos** como no menu Consultas legado (`UtentesLst`, `OrganismosLst`) |
| **Tabelas** | Idem + rotas | Falta **Acordo Inst.** (`Acor_InsLst`); resto parcialmente coberto via `area-comum` |
| Hub “Consultas” | `Frontend/src/pages/area-administrativa/pages/area-administrativa-home.tsx` | Vazio — não substitui dashboard/atalhos do legado |
| Módulo permissões admin | `Frontend/src/config/modules/administrativo/area-administrativa-module.ts` | Subconjunto; não espelha todas as `Consul_*` / `Tratamentos_*` usadas no `WSMenus` |

**Risco de produto:** vários itens do header admin usam `funcionalidadeId` de **área comum** ou **clínica** (ex.: Marcações com `modules.areaComum.permissions.tabelas`) — pode **esconder** entradas a utilizadores com permissão admin mas sem essas funcionalidades; rever ao mapear `AppControl` → novo.

### C) Novo — API (`Backend`)

| Domínio admin-relevante | Controller (exemplo) | Nota |
|-------------------------|------------------------|------|
| Credenciais SNS (lotes) | `CliCloud.WebApi/Controllers/Credenciais/LoteDirectController.cs` | Parcial vs `Lotdirect*` + faturação SNS legado |
| Sinistrados | `Controllers/Sinistrados/SinistradoController.cs`, `EstadoSinistradoController.cs` | Parcial vs ASMX + `CliCloud.Dados` legado |
| Exames sem papel | `Controllers/Consultas/ExamesSemPapelController.cs` | Existe API; UI admin reutiliza página clínica |
| Marcações (núcleo consultas) | `Controllers/Consultas/MarcacaoConsultaController.cs` | Existe no novo; **não** exposto como suite “admin marcações” do legado |
| Tabelas consultas | `MotivoConsultaController`, `SalaController`, `TipoConsultaController`, `Utility/TipoCartaController`, `Servicos/ServicoController`, … | Suportam rotas admin/comum; paridade campo a campo com legado **não auditada** neste doc |
| Tratamentos / Modalidades / Mapas admin | — | **Sem** controladores dedicados ao volume do `case "Tratamentos"` / `Modalidades` do `WSMenus` |

### D) Matriz rápida: grupo legado “Consultas” → cobertura nova

| Grupo `WSMenus` (Consultas) | Cobertura nova | Prioridade sugerida |
|----------------------------|----------------|---------------------|
| Marcações (6+ ecrãs) | ~0 ecrãs admin equivalentes (só links clínicos) | **P0** se operação admin for obrigatória |
| Consultas diárias + fecho | ~0 (links clínicos ≠ admissões/fecho legado) | **P0** |
| Credenciais SNS | Parcial (`LoteDirect` + corrigir lotes + exames sem papel rota) | **P0** — fechar paridade ASMX/relatórios/faturação |
| Sinistrados | Parcial | **P1** |
| Histórico (4 listas) | Não | **P1** |
| Mapas + Excel + livro caixa | Não (2 mapas clínicos) | **P2** (grande esforço) |
| Entidades (3 listas) | 1/3 no header (falta utentes, organismos) | **P1** |
| Tabelas | ~7/8 sem Acordo Ins.; paridade fina em aberto | **P1** |

### E) Próximos passos de auditoria (para fechar “equiparado”)

1. **Inventário mecânico:** exportar todas as linhas `submenu1.Add(new SubMenu(...))` dentro de `case "Consultas":` e `case "Tratamentos":` para uma tabela (URL + `Funcionalidades` enum).
2. **Matriz ASMX:** por cada `.aspx`, apontar o `.asmx` / método chamado no `.js` homónimo.
3. **Dados:** por fluxo crítico (ex.: `Admissoes`), listar classes `CliCloud.Dados.Consultas.*` e tabelas SQL usadas; mapear para entidades EF no novo.
4. **Critérios de aceite:** um teste manual por linha do menu legado (como checklist de “done”).
5. **Faturação SNS:** auditar `Client/Faturacao/CredenciaisSnsLst.js` + `WSFaturacao` vs módulo financeiro novo (quando existir).

---

## 1. Princípios de replicação

| Dimensão | Legado | Novo (alvo) |
|----------|--------|----------------|
| Navegação | `LoadSubMenu` + `MenuLateral` + `AppControl.Funcionalidades` | Rotas React + `LicenseGuard` + `modules` / permissões em BD/seeder |
| API | ASMX + `CliCloud.Dados` | `WebApi` + `Application/Services` + EF + migrações |
| UI | `.aspx` + `.js` | Páginas + `components` + `modals` + `queries` + `lib/services` |
| Relatórios / Excel | `.aspx` dedicados, Crystal/Reports em `CliCloud.ASPcli/Reports` | Endpoints de agregação, export CSV/XLSX, ou motor de relatórios acordado |

Tudo o que se lista nas secções seguintes implica **criar** ficheiros novos e/ou **editar** os existentes nas camadas indicadas.

---

## 2. Inventário legado por “módulo” do menu administrativo

### 2.1 Consultas (`case "Consultas"` em `WSMenus.asmx.cs`)

Grupos e exemplos de ecrãs legados (cada um com permissão `Consul_*` ou `Comuns_*`):

1. **Marcações:** `MarcacoesGestaoSalasLst`, `MarcacoesLst`, `TrocaMarcacoesEntreMedicos`, `OrdemEntradaMarcacoesLst`, `ListaEsperaLst`, `PedidosConsultaLst` (Global Booking).
2. **Consultas diárias:** `AdmissoesLst` (e variantes querystring), `FechoDiario`.
3. **Credenciais S.N.S.:** `LancamentoCredenciaisLst` / `LancamentoCredenciaisEdt`, `ExamesSemPapelLst` (+ histórico).
4. **Sinistrados:** `SinistradosLst` (+ fluxo de edição associado).
5. **Histórico:** `HistoricoDatasLst`, `HistoricoUtentesLst`, `HistoricoMedicosLst`, `HistoricoOrganismosLst` (e itens comentados noutras listas).
6. **Mapas:** `MapasServicosComValores.aspx` (muitos `codigo=`), `MapasLivroCaixa.aspx`, `GerarFicheiroExcel.aspx`, motivos/tipos consulta como vistas de mapa.
7. **Entidades (atalhos Comum):** `UtentesLst`, `MedicosLst`, `OrganismosLst`.
8. **Tabelas:** `SalasLst` (pasta Modalidades no legado), `ServicosLst`, `Acor_InsLst`, `DoencasLst`, `Marg_MedLst`, `TiposCartaLst`, `TIPOS_CONSULTA`, `PrioridadeLst`, `MotivosconsultaLst`.

**Faturação ligada a credenciais (fora do submenu Consultas mas produto SNS):** `Client/Faturacao/CredenciaisSnsLst.js` + `WSFaturacao` (listagens / etiquetas de lotes SNS). Paridade com “administrativo operacional” de credenciais.

### 2.2 Tratamentos (`case "Tratamentos"`)

Planning (`Planning.aspx`, `PesquisaPlanning.aspx`), listas de espera e marcações automáticas/manuais, `TratamentosLst` (vários `modo`), admissões (`AdmissoesLst` tratamentos), **credenciais** (`Tratamentos/LancamentoCredenciaisLst` com `Tratamentos_LancCred`), sinistrados (reutiliza Consultas), histórico (`HistoricoTratamentosLst` + vários `modo`), mapas (`MapasServicosTratamentos.aspx` + muitos `modo`), estatísticas (várias páginas e parâmetros), entidades (terapeutas, auxiliares, médicos externos, organismos, utentes), tabelas (margem terapeutas, `LoctratLst`, serviços modo tratamentos, patologias, estados LE, prioridades, tipo tratamento, hierarquia aparelhos/tipos/marcas/modelos).

### 2.3 Exames (`case "Exames"`)

Entidades: técnicos, utentes, organismos, médicos. Tabelas: centros/unidades, análises, tipos de exame, acordos.

### 2.4 Modalidades (`case "Modalidades"`)

Configuração (`ConfigModalidades`), agenda, sessões diárias, matrículas, faturação modalidades (`PorLiquidar`, `TFaturaModalidadesLst`), tabelas (modalidades, salas, utentes, tipos plano, profissionais).

### 2.5 Entradas de menu sem `case` completo

**Internamento**, **Bloco operatório**, **Cuidados contínuos:** aparecem como módulos no `MainMenu` mas não têm, no ramo analisado do `switch`, a mesma riqueza de submenus — definir se são fora de âmbito ou fases futuras e alinhar produto.

---

## 3. Estado atual no projeto novo (baseline)

### 3.1 Frontend

| Área | Existe | Notas |
|------|--------|--------|
| Hub Consultas / home admin | Parcial | `area-administrativa-home.tsx` é essencialmente vazio (só layout). |
| Tratamentos / Modalidades | Placeholder | `AreaAdministrativaTablePlaceholderPage` nas rotas. |
| Credenciais (`LoteDirect`) | Parcial | Listagem, novo, modais, corrigir lotes; paridade funcional com legado ainda incompleta (ver doc `credenciais-corrigir-lotes-implementacao.md`). |
| Exames sem papel | Parcial | Rota reutiliza página da área clínica. |
| Sinistrados | Parcial | Lista, novo, histórico; validar regras vs `SinistradosLst` legado. |
| Tabelas admin | Parcial | Salas, motivos, tipos carta dedicados; restantes reutilizam páginas `area-comum`. |
| Entidades admin | Parcial | Médicos, fornecedores, funcionários; **sem** Utentes/Organismos no header admin como no legado. |
| Marcações / Consultas diárias / Histórico admin / Mapas | Redirecionado | `menu-items.ts` aponta sobretudo para **área clínica** (agenda, consultas do dia, histórico, dois mapas). Falta paridade com **todo** o conjunto legado (marcções semanais com gestão salas, troca entre médicos, ordem entrada, lista espera admin, admissões admin, fecho diário, históricos por data/médico/organismo, dezenas de mapas). |

Ficheiros-chave já existentes a **manter como referência de padrão**:

- `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`
- `Frontend/src/config/menu-items.ts` (`roleHeaderMenus['area-administrativa']`)
- `Frontend/src/config/modules/administrativo/area-administrativa-module.ts`
- `Frontend/src/pages/area-administrativa/credenciais/**`
- `Frontend/src/pages/area-administrativa/consultas/sinistrados/**`

### 3.2 Backend

| Domínio | Existe | Notas |
|---------|--------|--------|
| `LoteDirect` | Parcial | `LoteDirectController`, `LoteDirectService`, DTOs, specs, correção de lotes; completar métodos/regras espelhando `Lotdirect*` e persistência legada. |
| Sinistros | Parcial | `SinistradoController` + `SinistradoService`; alinhar com tabelas e regras do legado. |
| Restantes módulos admin consultas/tratamentos | Em grande parte ausente | Marcações, admissões, fechos, mapas, históricos admin, planning fisio, etc. |

---

## 4. Lista mestra: o que falta criar ou editar

Para cada bloco: **C** = criar novo, **E** = editar extensão do existente.

### 4.1 Plataforma: permissões e menu

| Item | C/E | Ficheiros / pastas típicos |
|------|-----|------------------------------|
| Permissões 1:1 com `AppControl.Funcionalidades` do legado (Consul_*, Tratamentos_*, Exames_*, Modalidades_*, Comuns_*) | E/C | `Frontend/src/config/modules/**`; seeders/initializers de perfis na BD (`Backend/**/Initializer`, `Seeder`); documentação de mapeamento ID |
| Submenus do header admin alinhados ao legado (não só subset) | E | `Frontend/src/config/menu-items.ts` |
| Rotas para cada novo ecrã | E | `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx` (e possivelmente `area-clinica` se a decisão for manter fluxos clínicos separados) |
| `LicenseGuard` / fallbacks por funcionalidade | E | Cada rota nova; revisão de `permissionFallbackIds` |
| Janelas MDI / nomes de janela (`window-utils`) | E | `Frontend/src/utils/window-utils.ts` se novos `windowName` forem necessários |
| Sidebar principal (três entradas Consultas / Tratamentos / Modalidades) | E | `roleMenuItems` em `menu-items.ts`; conteúdo real das páginas hub |

### 4.2 Hub e navegação por módulo

| Item | C/E | Ficheiros / pastas típicos |
|------|-----|------------------------------|
| Home **Consultas** admin com atalhos/dashboard | E | `Frontend/src/pages/area-administrativa/pages/area-administrativa-home.tsx` |
| Hub **Tratamentos** (substituir placeholder) | C/E | Nova página + rota `area-administrativa/tratamentos` |
| Hub **Modalidades** (substituir placeholder) | C/E | Nova página + rota `area-administrativa/modalidades` |
| Hub **Exames** (se o menu lateral novo incluir Exames como no legado) | C | Rotas + página + entrada em `menu-items` e `roleMenuItems` |

### 4.3 Marcações (consultas)

| Funcional legado | C/E | Backend | Frontend |
|------------------|-----|---------|----------|
| Marcações semanais (com/sem gestão salas) | C/E | Serviços, specs, filtros, entidades de agenda/salas; integração com regras `GestaoSalas` | Páginas equivalentes a `MarcacoesLst` / `MarcacoesGestaoSalasLst`, queries, tabelas |
| Troca de marcações entre médicos | C | Caso de uso + validações + auditoria | Página + formulário |
| Ordem de entrada de marcações | C | API + persistência | Lista ordenável / ações |
| Lista de espera (admin) | C/E | Depende de entidade lista espera já existente ou nova | UI admin |
| Pedidos consulta / Global Booking | C | Integração com modelo de dados de pedidos | UI |

### 4.4 Consultas diárias e fecho

| Funcional legado | C/E | Backend | Frontend |
|------------------|-----|---------|----------|
| Admissões (listas, pendentes, modos legados) | C/E | Serviços de admissão; alinhar com `CliCloud.Dados.Consultas` / serviço `Admissoes.cs` | Páginas fora ou dentro de `area-administrativa` conforme decisão UX |
| Fecho diário | C | Agregações, fecho por data/empresa, bloqueios | Ecrã + confirmações |
| Fecho mensal (se reativado no legado) | C | Idem | Idem |

### 4.5 Credenciais S.N.S. (lotes)

| Funcional legado | C/E | Backend | Frontend |
|------------------|-----|---------|----------|
| Paridade completa `Lotdirect*` / gravação linhas / 789 / tipos lote | E | `LoteDirectService`, repositórios sync, executores, validações; entidades `LoteDirect*` em `CliCloud.Domain` | `lote-direct-form-modal.tsx`, payloads, validação cliente |
| Listagem / filtros / estados como legado | E | `LoteDirectTableFilter`, specs | Colunas, filtros, ações; coluna organismo com **sigla** (`Organismo.Abreviatura` via `CodigoULSNova` = `CodigoOrganismo`) na listagem e detalhe |
| Credenciais SNS **faturação** (lotes, etiquetas) | C | Novos serviços/controllers ou extensão faturação | Novas páginas ou módulo área financeira |
| Relatórios Crystal legados `Reports/Consultas/LancamentoCredenciais*` | C/E | Motor de relatório escolhido (PDF/API) | UI de emissão |

### 4.6 Exames sem papel

| Item | C/E | Onde |
|------|-----|------|
| Paridade com `ExamesSemPapelLst` (estados, histórico, permissões `Consul_ExamesSemPapel`) | E | Backend se endpoints incompletos; `Frontend` páginas área clínica + rotas admin |

### 4.7 Sinistrados

| Item | C/E | Onde |
|------|-----|------|
| Regras de negócio, estados, integrações do legado `SinistradosLst` / WS | E | `SinistradoService`, entidades, validações |
| UI: importação, anexos, pesquisas avançadas se existirem no legado | E/C | `Frontend/.../sinistrados/**` |

### 4.8 Histórico (admin consultas)

| Ecrã legado | C/E | Backend | Frontend |
|-------------|-----|---------|----------|
| `HistoricoDatasLst` | C | Queries agregadas por datas | Nova rota admin ou comum |
| `HistoricoUtentesLst` | C | Idem | Idem |
| `HistoricoMedicosLst` | C | Idem | Idem |
| `HistoricoOrganismosLst` | C | Idem | Idem |

**Nota:** o novo redireciona parte do “Histórico” para consultas efetuadas na área clínica — decidir se os históricos **administrativos** do legado permanecem em área admin ou fundem com relatórios clínicos; em qualquer caso é trabalho **C/E** novo.

### 4.9 Mapas e exportações (consultas)

Cada variante de `MapasServicosComValores.aspx?codigo=...` e família “com quantidades”, livro de caixa, gerar Excel:

| Item | C/E | Onde |
|------|-----|------|
| Endpoints de relatório parametrizados (`codigo` / filtros) | C | `CliCloud.Application` serviços de relatório + `WebApi` controllers |
| Queries otimizadas / views SQL / materializações | C/E | `Infrastructure`, possivelmente migrações com views |
| UI: um ou vários ecrãs com seletor de tipo de mapa | C | `Frontend/src/pages/area-administrativa/consultas/mapas/**` (ou área comum/relatórios) |
| Export Excel | C/E | Biblioteca servidor (ClosedXML etc.) + download no cliente |

### 4.10 Entidades (atalhos Comum no menu Consultas)

| Entidade | C/E | Onde |
|----------|-----|------|
| Utentes | E | Rotas provavelmente `area-comum` + links no header admin; serviços já existentes ou novos |
| Organismos | E | Idem |
| Médicos | E | Já existe rota admin; alinhar campos/ações com `MedicosLst` legado |
| Fornecedores / Funcionários | E | Comparar com legado (podem não existir no mesmo menu) |

### 4.11 Tabelas (menu Consultas no legado)

| Tabela legada | Novo | C/E |
|---------------|------|-----|
| `Acor_InsLst` (Acordo Instituições) | Verificar se existe em `area-comum` | C/E |
| `ServicosLst` / subsistemas / tipos serviço | Parcialmente coberto | E |
| `TiposCarta`, `Marg_Med`, `Doencas`, `Prioridade`, `Motivos`, `TIPOS_CONSULTA` | Parcialmente coberto | E |
| `Salas` (legado via Modalidades) | Parcial | E |

Para cada uma: comparar **campos**, **validações**, **integrações** no `.js` legado e no serviço ASMX/Dados.

### 4.12 Tratamentos (módulo inteiro no menu admin)

Replicação grande — criar estrutura espelho:

| Pastas / camadas | Ação |
|--------------------|------|
| `Frontend/src/pages/area-administrativa/tratamentos/**` | **C** (planning, marcações, tratamentos, admissões, credenciais fisio, histórico, mapas, estatísticas, entidades, tabelas) |
| `Backend/CliCloud.Application/Services/Tratamentos/**` (ou nome já usado no monólito) | **C/E** por feature |
| `Backend/CliCloud.WebApi/Controllers/Tratamentos/**` | **C** |
| `CliCloud.Domain/Entities` para agregados de fisio, planning, aparelhos, etc. | **C/E** |
| Migrações EF | **C** |
| Portar lógica de `Client/Tratamentos/Services/*.cs` e `CliCloud.Dados.Tratamentos` | **C/E** |

Permissões: mapear `Tratamentos_*` do `AppControl` para GUIDs no módulo admin ou módulo dedicado.

### 4.13 Exames (módulo no menu admin)

| Pastas | Ação |
|--------|------|
| `Frontend/src/pages/area-administrativa/exames/**` ou `area-comum/tabelas/exames/**` | **C** |
| Controllers + serviços + entidades (Centros, Análises, TipoExame, Acordos) | **C/E** |

### 4.14 Modalidades

| Pastas | Ação |
|--------|------|
| `Frontend/src/pages/area-administrativa/modalidades/**` | **C** |
| Backend: `ConfigModalidades`, agenda, matrículas, faturação modalidades | **C** |
| Integração com `CliCloud.Dados.Modalidades` | **C/E** |

### 4.15 Internamento / Bloco operatório / Cuidados contínuos

| Item | C/E | Notas |
|------|-----|--------|
| Definição de âmbito com negócio | — | Se forem necessários, repetir padrão: Domain + Application + WebApi + Frontend + permissões |

### 4.16 Relatórios e impressões

| Origem legado | Ação |
|---------------|------|
| `CliCloud.ASPcli/Reports/**` relacionados com consultas, tratamentos, credenciais | **C/E** no stack de relatórios adotado (.NET report viewer, DevExpress, PDF puro, etc.) |
| Chamadas desde listagens `.aspx` | **E** nas novas listagens |

### 4.17 Testes, observabilidade e dados

| Item | C/E | Onde |
|------|-----|------|
| Testes de integração API (marcadores críticos: credenciais, fecho, mapas) | C | `Backend/**/*Tests` |
| Testes E2E ou componentes principais | C | `Frontend/**` |
| Logs e auditoria (substituir `Utils.DumpASMX`) | E | Middleware logging, correlation ids |
| Scripts de migração de dados legado → novo | C | Projeto tooling ou `Infrastructure` |

### 4.18 Documentação interna

| Item | C/E |
|------|-----|
| Este ficheiro | E (atualizar à medida que features forem fechadas) |
| Matriz método ASMX → endpoint OpenAPI | C (opcional mas recomendado) |
| Diagrama ER legado (Dados) vs EF atual | C/E |

---

## 5. Ordem sugerida de implementação (dependências)

1. **Permissões e menu** completos (senão utilizadores não acedem ao que for desenvolvido).
2. **Credenciais** até paridade com lançamento + faturação SNS + relatórios usados em produção.
3. **Consultas diárias** (admissões, fecho) — base para mapas e histórico coerentes.
4. **Marcações admin** (lista espera, troca médicos, gestão salas).
5. **Históricos admin** e **mapas** (consumir os mesmos agregados que admissões/fecho).
6. **Tratamentos** em bloco (planning + credenciais fisio já unificadas no domínio `LoteDirect` onde aplicável).
7. **Exames** e **Modalidades**.
8. **Relatórios** e **exports** transversais.

---

## 6. Checklist rápido “ficheiros a tocar” por camada

- **Frontend:** `menu-items.ts`, `area-administrativa-module.ts`, `areaAdministrativa.tsx`, novas pastas sob `pages/area-administrativa/{consultas,tratamentos,exames,modalidades,mapas,historico,marcacoes}/`, `lib/services/*`, `types/dtos/*`, testes.
- **Backend:** `CliCloud.Domain/Entities/**`, `CliCloud.Application/Services/**`, `CliCloud.Infrastructure/**`, `CliCloud.WebApi/Controllers/**`, migrações, validators, permissions/authorization handlers.
- **Legado (leitura apenas):** `WSMenus.asmx.cs`, `Client/**/Services/*.cs`, `CliCloud.Dados.*`, `Reports/**`.

---

## 7. Auditoria 2026-05-14 — Matriz consolidada de paridade

> Esta secção substitui a matriz rápida da secção 0.1.D quando há conflito. Construída a partir de inventário completo dos `case` do `WSMenus.asmx.cs` (Consultas, Tratamentos, Exames, Modalidades) e do estado atual de `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`, `Frontend/src/config/menu-items.ts`, `Backend/CliCloud.WebApi/Controllers/**` e `Backend/CliCloud.Application/Services/**`.

Legenda: ✅ implementado · ⚠️ parcial · ❌ ausente

### 7.1 Bloco **Consultas**

| Sub-bloco | Item legado | Equivalente novo | Estado |
|-----------|-------------|------------------|--------|
| Marcações | `MarcacoesLst.aspx` / `MarcacoesGestaoSalasLst.aspx` | `/area-clinica/processo-clinico/agenda/*` + `MarcacaoConsultaController` | ⚠️ |
| Marcações | `TrocaMarcacoesEntreMedicos.aspx` | — | ❌ |
| Marcações | `OrdemEntradaMarcacoesLst.aspx` | — | ❌ |
| Marcações | `ListaEsperaLst.aspx` (consultas) | — | ❌ |
| Marcações | `PedidosConsultaLst.aspx` (Global Booking) | — | ❌ |
| Diárias | `AdmissoesLst.aspx` | `/area-clinica/.../consultas-do-dia` | ⚠️ |
| Diárias | `AdmissoesLst.aspx?tipo=pendentes` | — | ❌ |
| Diárias | `FechoDiario.aspx` | — | ❌ |
| Credenciais | `LancamentoCredenciaisLst.aspx` | `/area-administrativa/credenciais` (+ `/novo`) | ✅ |
| Credenciais | `ExamesSemPapelLst.aspx` (+ histórico) | `/area-administrativa/credenciais/exames-sem-papel(-historico)` | ⚠️ |
| Sinistrados | `SinistradosLst.aspx` | `/area-administrativa/consultas/sinistrados` (+ `/novo`) | ✅ |
| Sinistrados | *(não tem histórico no menu legado)* — `HistoricoSinistradosLst.aspx` existe mas a entrada do `WSMenus` está **comentada** (linhas 729-730) | `/area-administrativa/consultas/historico-sinistrados` (rota só, fora do header) | ⚠️ **Extra vs legado** — manter rota sem entrada de menu |
| Histórico | `HistoricoDatasLst.aspx` | — | ❌ |
| Histórico | `HistoricoUtentesLst.aspx` | — | ❌ |
| Histórico | `HistoricoMedicosLst.aspx` | — | ❌ |
| Histórico | `HistoricoOrganismosLst.aspx` | — | ❌ |
| Mapas | `MapasServicosComValores.aspx?codigo=*` (≥14 variantes) | — | ❌ |
| Mapas | `MapasLivroCaixa.aspx` (4 modos) | — | ❌ |
| Mapas | `MapaServicosComValores.aspx?codigo=Motivos\|Tipos` | — | ❌ |
| Mapas | `GerarFicheiroExcel.aspx` → `WSConsultas/CriarFicheiro` | — | ❌ |
| Entidades | `UtentesLst.aspx` | `/area-comum/tabelas/entidades/utentes` (fora do header admin) | ⚠️ |
| Entidades | `OrganismosLst.aspx` | `/area-comum/tabelas/entidades/organismos` (fora do header admin) | ⚠️ |
| Entidades | `MedicosLst.aspx` | `/area-administrativa/entidades/medicos` | ✅ |
| Tabelas | Serviços, Margem Médicos, Prioridade, Tipos Carta, Motivos | `/area-administrativa/tabelas/*` | ✅ |
| Tabelas | **Doenças** (CID-9 no legado) | `/area-administrativa/tabelas/doencas` (ICD-11 importado da WHO) | ⚠️ **Mudança intencional de modelo** — CID-9 → ICD-11; paridade estrita inviável |
| Tabelas | **Salas** (`Modalidades/SalasLst.aspx`) | `/area-administrativa/tabelas/salas` (entidade `Consultas/Sala.cs`) | ⚠️ **Subset incompleto** — faltam campos `Capacidade`, `UsaConsultas`, `UsaModalidades`, `CorAgenda` (ver 7.6) |
| Tabelas | `Acor_Ins` (Acordo Instituição: Serviço × Organismo + valores) | `/area-administrativa/tabelas/subsistemas-servicos` (Serviço × **Subsistema** × Organismo + várias margens) | ⚠️ **Evolução de modelo, não renomeação** — novo introduz dimensão Subsistema |
| Tabelas | `TIPOS_CONSULTA` (CRUD completo legado: `Codigo` + `Designa`) | `/area-administrativa/tabelas/tipos-consultas` (**sem create**, **sem `Codigo`**) | ⚠️ **Subset + sem create** (ver 7.6) |

### 7.2 Bloco **Tratamentos**

| Sub-bloco | Item legado | Equivalente novo | Estado |
|-----------|-------------|------------------|--------|
| Planning | `Planning.aspx`, `PesquisaPlanning.aspx` | — | ❌ |
| Marcações | `MarcacoesAutomaticas.aspx`, `MarcacoesManuais.aspx`, `TratamentosLst.aspx` (modos) | `TratamentoController` (API parcial) | ⚠️ |
| Diárias | `AdmissoesLst.aspx` (`utentesPresentes`/`localTratamento`) | `SessaoTratamentoController` (parcial) | ⚠️ |
| Credenciais fisio | `Tratamentos/LancamentoCredenciaisLst.aspx` (`LOTDIRECTFISIO` — entidade dedicada com campos de tratamento/sessão/terapeuta) | `LoteDirectController` **só cobre `LOTDIRECT` (consultas)**; campos `CodigoServicoConsulta`, `ServicoConsulta`, `CodigoSubsistemaConsulta`, `QuantidadeConsulta`, `ValorConsulta`, `TaxaConsulta` provam o foco em consultas | ❌ **Ausente** — entidade equivalente a `LOTDIRECTFISIO` não existe no novo (ver 7.6) |
| Histórico | `HistoricoTratamentosLst.aspx` (7 modos) | — | ❌ |
| Mapas | `MapasServicosTratamentos.aspx` (vários modos) | — | ❌ |
| Estatísticas | `EstatisticasMarcacoes/TratamentosRealizados/Medias/UtenteOrganismo/Gerais/TaxaOcupacao.aspx` | — | ❌ |
| Entidades fisio | `TerapeutaLst.aspx`, `AuxiliarLst.aspx`, `TerapeutaOcupLst.aspx` | — | ❌ |
| Tabelas | `LoctratLst`, `Patologias`, `Estados_LELst`, `Prioridade`, `Aparelhos`, `TipoAparelhos`, `Marcas`, `Modelos` | `/area-comum/tabelas/tratamentos/*` | ✅ |
| Tabelas | `PeriodicidadeLst.aspx` | `PeriocidadeTratamentoController` (API existe, **sem UI**) | ⚠️ |
| Tabelas | `MargemTerapeutasLst.aspx` | — | ❌ |
| Tabelas | `TipoTratamento.aspx` | `/area-administrativa/tabelas/tipos-consultas` (partilha) | ⚠️ |

### 7.3 Bloco **Exames**

| Item legado | Equivalente novo | Estado |
|-------------|------------------|--------|
| Técnicos, Utentes, Organismos, Médicos | `/area-comum/tabelas/entidades/*` | ✅ |
| `CentrosUnidadesLst.aspx` (cadastro interno de **unidades de exames** — campos `C_Unid`, `Nome`, permissão `Exames_CentroUnidades`) | `/area-comum/tabelas/entidades/centros-saude` (entidade `CentroSaude` com `CodigoLocalCS` — cadastro de **Centros de Saúde do SNS**) | ❌ **Conceitos diferentes** — `CentrosUnidades` (interno) não tem equivalente; `CentroSaude` no novo é entidade SNS externa |
| `AnalisesLst.aspx`, `TipoExameLst.aspx`, `AcordosLst.aspx` | `/area-comum/tabelas/exames/*` (controllers `client/exames/*`) | ✅ |

### 7.4 Bloco **Modalidades**

| Item legado | Equivalente novo | Estado |
|-------------|------------------|--------|
| `ConfigModalidades.aspx` | — | ❌ |
| `Agenda.aspx`, `SessoesDiariasLst.aspx` | — | ❌ |
| `MatriculasLst.aspx` (+ Edt), `PorLiquidar.aspx`, `TFaturaModalidadesLst.aspx` | — | ❌ |
| `ModalidadesLst.aspx`, `TiposPlanoLst.aspx` | — | ❌ |
| `SalasLst.aspx` (modalidades — campos `c_sala`, `nome`, `capacidade`, `UsaConsultas`, `UsaModalidades`, `corAgenda`) | `/area-administrativa/tabelas/salas` (entidade `Consultas/Sala.cs` partilhada — só `Nome`, `NumeroSala`, `ClinicaId`, `Ativa`) | ⚠️ **Mesma entidade que Consultas — faltam 4 campos** (ver 7.6) |
| Profissionais (`TerapeutaLst.aspx`) | — | ❌ |

### 7.5 Disparidades de **menu/permissões** (alta visibilidade, baixo custo)

1. **Entidades → Utentes/Organismos** — no legado (`case "Consultas"`, linhas 257-275 do `WSMenus.asmx.cs`) o submenu Entidades tem **Utentes → Médicos → Organismos**; no novo header admin só está Médicos (+ Fornecedores e Funcionários que **não** existem no submenu legado deste bloco).
2. **`TipoConsulta` sem create** — o controller só tem `Update`/`Delete`. Legado (`TIPOS_CONSULTA.aspx` linhas 459 e 980) faz CRUD completo.
3. **`Periodicidade` sem UI** — controller `PeriocidadeTratamentoController` está implementado (com typo de nome — ver 7.6 §4); falta a página SPA equivalente a `PeriodicidadeLst.aspx` (linha 1448).

> **Nota sobre Sinistrados**: a entrada "Histórico de Sinistrados" **não existe** no header legado (a linha está comentada em `WSMenus.asmx.cs:729-730`). A rota `/area-administrativa/consultas/historico-sinistrados` no novo é uma **adição extra** vs legado e **não deve ser adicionada ao header `area-administrativa`** se o objetivo for paridade estrita. Manter a rota acessível por URL direto / outras navegações é a opção compatível.

### 7.6 Erros do **modelo novo** a corrigir para paridade (não são "features em falta", são divergências de modelo)

Lista de bugs / subsets / divergências que requerem **alterações ao Backend novo**, não apenas implementação de páginas:

| # | O que está mal no novo | Evidência legado | Correção mínima |
|---|------------------------|-------------------|------------------|
| 1 | **`Sala.cs`** só tem `Nome`, `NumeroSala`, `ClinicaId`, `Ativa` | `Modalidades/SalasLst.aspx:27-39` tem `Capacidade`, `UsaConsultas`, `UsaModalidades`, `CorAgenda` | Adicionar 4 campos à entidade + migration EF; atualizar DTOs, AutoMapper, validators, UI |
| 2 | **`TipoConsultaItem.cs`** só tem `Id` (Guid) + `Designacao` | `TIPOS_CONSULTA.aspx:18` tem `Codigo` (int 9 dígitos) + `Designa` (15 chars) | Adicionar campo `Codigo` à entidade + migration EF; DTOs Create/Update/Get; validator |
| 3 | **`LoteDirect.cs`** só cobre `LOTDIRECT` (consultas) | Legado tem **duas entidades**: `LOTDIRECT` + `LOTDIRECTFISIO` (`Client/Tratamentos/Services/LancamentoCredenciais.cs:200,204,322,422,1095,1245,…`) | Criar entidade `LoteDirectFisio` separada (ou estender `LoteDirect` com discriminator + campos de tratamento) + migration EF + service + controller |
| 4 | **`PeriocidadeTratamento`** (typo no novo) | Legado é `Periodicidade` (`Strings.MenuPeriodicidade`, `PeriodicidadeLst.aspx`) | Decisão tomada: manter nome interno `Periocidade` mas label **"Periodicidade"** na UI (ver 8.3) |
| 5 | **`SubsistemaServico`** ≠ `Acor_Ins` — não é renomeação | Legado `Acor_Ins`: Serviço × Organismo + `Cservinst` + valores. Novo: Serviço × Subsistema × Organismo + várias margens | Dois caminhos: (a) usar `SubsistemaServico` com `SubsistemaId` default como equivalente funcional de `Acor_Ins`; (b) reintroduzir entidade `AcordoInstituicao` simples. Decisão de produto pendente. |
| 6 | **`CentroSaude`** (Centros de Saúde SNS) ≠ `CentrosUnidades` (unidades de exames internas) | Legado tem cadastro interno `Exames/CentrosUnidades` com permissão `Exames_CentroUnidades` | Criar entidade nova `Exames/UnidadeExame` ou similar; o `CentroSaude` actual fica como cadastro SNS externo |
| 7 | **`Doenca`** baseada em ICD-11 (importado WHO) | Legado usa CID-9 (`WSComum.Cid9Lst`) | **Mudança intencional de produto** — paridade estrita inviável; aceitar e documentar |

---

## 8. Plano executável — Onda 1 (quick wins) — rev. 3

> Objetivo: fechar as 3 disparidades listadas em 7.5 e os erros 1, 2 e 4 de 7.6, com **paridade estrita ao legado** e **sem introduzir decisões de produto novas**.
>
> Decisões tomadas pelo utilizador (2026-05-14):
> - **Fornecedores e Funcionários removidos** do submenu Entidades admin (não existem no legado).
> - **Sem hubs/cards** para Tratamentos/Modalidades — rotas placeholder que redirecionam para o primeiro item real do submenu.
> - **Typo `Periocidade`** no Backend mantido internamente; **label "Periodicidade"** na UI.

### 8.1 Adicionar Utentes e Organismos ao menu "Entidades" do header admin (paridade estrita)

Evidência legado: `CliCloud.ASPcli/Services/WSMenus.asmx.cs:257-275` — ordem **Utentes → Médicos → Organismos**, sem Fornecedores nem Funcionários.

**Ficheiro a EDITAR**: `Frontend/src/config/menu-items.ts`

No `roleHeaderMenus.client['area-administrativa']`, **substituir completamente** a entrada `Entidades` (linhas 248-268 atuais) por:

```typescript
{
  label: 'Entidades',
  href: '/area-administrativa',
  funcionalidadeId: modules.areaAdministrativa.permissions.entidades.id,
  items: [
    {
      label: 'Utentes',
      href: '/area-comum/tabelas/entidades/utentes',
      funcionalidadeId: modules.areaComum.permissions.utentes.id,
    },
    {
      label: 'Médicos',
      href: '/area-administrativa/entidades/medicos',
      funcionalidadeId: modules.areaAdministrativa.permissions.medicos.id,
    },
    {
      label: 'Organismos',
      href: '/area-comum/tabelas/entidades/organismos',
      funcionalidadeId: modules.areaComum.permissions.organismos.id,
    },
  ],
},
```

**Notas importantes:**

- **Não** se criam permissões novas em `area-administrativa-module.ts` (a versão anterior do plano sugeriu `utentes` e `organismos` com GUIDs `0106`/`0107` — descartado por ser redundância vs `Comuns_Utentes` / `Comuns_Organismos` do legado).
- **`funcionalidadeId`** aponta direto para `modules.areaComum.permissions.utentes/organismos.id`, mesma permissão que o legado usa (`Comuns_Utentes` / `Comuns_Organismos`).
- **Fornecedores e Funcionários removidos** do header admin (não existem no submenu Entidades legado). Continuam acessíveis pela navegação `/area-administrativa/entidades/fornecedores` se necessário, ou podem ser totalmente removidos das rotas se quiseres paridade absoluta.

### 8.2 Implementar `CreateTipoConsulta` (Backend) — **incluindo campo `Codigo` em falta**

Erro 7.6 §2: a entidade `TipoConsultaItem` no novo só tem `Designacao`. O legado tem **`Codigo` (int)** + **`Designa` (string 15)**. Para paridade real é preciso adicionar `Codigo` à entidade antes do Create funcionar como no legado.

#### Passo A — adicionar campo `Codigo` à entidade + migration

**Ficheiro a EDITAR**: `Backend/CliCloud.Domain/Entities/Consultas/TipoConsultaItem.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;

namespace CliCloud.Domain.Entities.Consultas
{
    /// <summary>
    /// Tipo de consulta (ex: 1ª Consulta, AV. Final, Feriado, Teleconsulta).
    /// Paridade legado: TIPOS_CONSULTA (Codigo int + Designa varchar(15)).
    /// </summary>
    [Table("TiposConsulta", Schema = "Consultas")]
    public class TipoConsultaItem : AuditableEntityWithSoftDelete
    {
        [Key]
        public new Guid Id { get; set; }

        /// <summary>Código numérico legado (TIPOS_CONSULTA.Codigo). Único.</summary>
        public int Codigo { get; set; }

        [Required]
        [StringLength(80)]
        public string Designacao { get; set; } = string.Empty;
    }
}
```

**Comando** (a partir de `Backend/CliCloud.WebApi`):

```bash
dotnet ef migrations add AddCodigoToTipoConsulta --project ../CliCloud.Infrastructure --startup-project .
dotnet ef database update --project ../CliCloud.Infrastructure --startup-project .
```

> Atenção: definir estratégia para registos existentes (default 0? geração sequencial? leitura do legado?). Recomenda-se gerar valor a partir de `MAX(Codigo)+1` nos registos novos e backfill manual para os existentes.

#### Passo B — DTO de criação

**Ficheiro a CRIAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/DTOs/CreateTipoConsultaRequest.cs`

```csharp
using FluentValidation;
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService.DTOs
{
    public class CreateTipoConsultaRequest : IDto
    {
        public int Codigo { get; set; }
        public string Designacao { get; set; } = string.Empty;
    }

    public class CreateTipoConsultaValidator : AbstractValidator<CreateTipoConsultaRequest>
    {
        public CreateTipoConsultaValidator()
        {
            _ = RuleFor(x => x.Codigo).GreaterThan(0);
            _ = RuleFor(x => x.Designacao).NotEmpty().MaximumLength(80);
        }
    }
}
```

#### Passo C — atualizar `UpdateTipoConsultaRequest.cs` para incluir `Codigo`

**Ficheiro a EDITAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/DTOs/UpdateTipoConsultaRequest.cs`

```csharp
using FluentValidation;
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService.DTOs
{
    public class UpdateTipoConsultaRequest : IDto
    {
        public int Codigo { get; set; }
        public string Designacao { get; set; } = string.Empty;
    }

    public class UpdateTipoConsultaValidator : AbstractValidator<UpdateTipoConsultaRequest>
    {
        public UpdateTipoConsultaValidator()
        {
            _ = RuleFor(x => x.Codigo).GreaterThan(0);
            _ = RuleFor(x => x.Designacao).NotEmpty().MaximumLength(80);
        }
    }
}
```

E também os DTOs `TipoConsultaDTO` e `TipoConsultaTableDTO` (na mesma pasta) — adicionar `public int Codigo { get; set; }`.

#### Passo D — Specifications

**Ficheiro a CRIAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/Specifications/TipoConsultaMatchCodigo.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Consultas;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService.Specifications
{
    public sealed class TipoConsultaMatchCodigo : Specification<TipoConsultaItem>
    {
        public TipoConsultaMatchCodigo(int codigo)
        {
            Query.Where(x => x.Codigo == codigo);
        }
    }
}
```

**Ficheiro a CRIAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/Specifications/TipoConsultaMatchDesignacao.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Consultas;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService.Specifications
{
    public sealed class TipoConsultaMatchDesignacao : Specification<TipoConsultaItem>
    {
        public TipoConsultaMatchDesignacao(string designacao)
        {
            Query.Where(x => x.Designacao == designacao);
        }
    }
}
```

#### Passo E — Interface + Service

**Ficheiro a EDITAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/ITipoConsultaService.cs`

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.TiposConsulta.TipoConsultaService.DTOs;
using CliCloud.Application.Services.TiposConsulta.TipoConsultaService.Filters;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService
{
    public interface ITipoConsultaService : ITransientService
    {
        Task<PaginatedResponse<TipoConsultaTableDTO>> GetTipoConsultaPaginatedAsync(TipoConsultaTableFilter filter);
        Task<Response<IEnumerable<TipoConsultaTableDTO>>> GetAllTipoConsultaAsync(TipoConsultaAllFilter? filter);
        Task<Response<TipoConsultaDTO>> GetTipoConsultaAsync(Guid id);
        Task<Response<Guid>> CreateTipoConsultaAsync(CreateTipoConsultaRequest request);
        Task<Response<Guid>> UpdateTipoConsultaAsync(UpdateTipoConsultaRequest request, Guid id);
        Task<Response<Guid>> DeleteTipoConsultaAsync(Guid id);
    }
}
```

**Ficheiro a EDITAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/TipoConsultaService.cs`

Adicionar método `CreateTipoConsultaAsync` antes do `UpdateTipoConsultaAsync`:

```csharp
public async Task<Response<Guid>> CreateTipoConsultaAsync(CreateTipoConsultaRequest request)
{
    try
    {
        TipoConsultaMatchCodigo codigoSpec = new(request.Codigo);
        if (await _repository.ExistsAsync<TipoConsultaItem, Guid>(codigoSpec))
        {
            return ResponseFactory.Fail<Guid>($"Já existe um tipo de consulta com o código {request.Codigo}.");
        }

        TipoConsultaMatchDesignacao designacaoSpec = new(request.Designacao ?? string.Empty);
        if (await _repository.ExistsAsync<TipoConsultaItem, Guid>(designacaoSpec))
        {
            return ResponseFactory.Fail<Guid>("Já existe um tipo de consulta com esta designação.");
        }

        TipoConsultaItem entity = _mapper.Map<TipoConsultaItem>(request);
        entity.Id = Guid.NewGuid();

        TipoConsultaItem created = await _repository.CreateAsync<TipoConsultaItem, Guid>(entity);
        _ = await _repository.SaveChangesAsync();
        return ResponseFactory.Success(created.Id);
    }
    catch (Exception ex)
    {
        return ResponseFactory.Fail<Guid>(ex.Message);
    }
}
```

#### Passo F — Controller

**Ficheiro a EDITAR**: `Backend/CliCloud.WebApi/Controllers/Consultas/TipoConsultaController.cs`

Substituir o comentário XML da classe (linhas 10-12):

```csharp
/// <summary>
/// API para Tipos de Consulta. CRUD completo (paridade com TIPOS_CONSULTA.aspx legado).
/// </summary>
```

Adicionar endpoint Create antes do Update:

```csharp
[Authorize(Roles = "client")]
[HttpPost]
public async Task<IActionResult> CreateTipoConsultaAsync([FromBody] CreateTipoConsultaRequest request)
{
    try
    {
        Response<Guid> result = await _tipoConsultaService.CreateTipoConsultaAsync(request);
        return Ok(result);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}
```

#### Passo G — AutoMapper

**Ficheiro a EDITAR**: `Backend/CliCloud.Infrastructure/Mapper/MappingProfiles.cs`

Após a linha 1755 (fim do `CreateMap<TipoConsultaDtos.UpdateTipoConsultaRequest, TipoConsultaItem>()...`), adicionar:

```csharp
_ = CreateMap<TipoConsultaDtos.CreateTipoConsultaRequest, TipoConsultaItem>()
    .ForMember(d => d.Id, o => o.Ignore())
    .ForMember(d => d.CreatedBy, o => o.Ignore())
    .ForMember(d => d.CreatedOn, o => o.Ignore())
    .ForMember(d => d.LastModifiedBy, o => o.Ignore())
    .ForMember(d => d.LastModifiedOn, o => o.Ignore())
    .ForMember(d => d.DeletedOn, o => o.Ignore())
    .ForMember(d => d.DeletedBy, o => o.Ignore());
```

> Frontend (não detalhado aqui): adicionar `createTipoConsulta(payload)` em `Frontend/src/lib/services/consultas/tipo-consulta-service.ts`; estender o modal existente para `mode='create'`; habilitar botão "Adicionar"; **adicionar campo `codigo`** no formulário (input numérico) acima do campo `designacao`.

### 8.3 Criar página SPA para Periodicidade Tratamentos (paridade: na área administrativa, não área comum)

> Decisão: backend mantém nome interno `Periocidade` (typo histórico); **UI usa label "Periodicidade"** como no legado.
>
> Localização: legado tem `PeriodicidadeLst.aspx` em `Client/Tratamentos/` (WSMenus `case "Tratamentos"` linha 1448). Para paridade, a rota nova deve estar em **`/area-administrativa/tratamentos/tabelas/periodicidades`**, não em `area-comum`.

**Ficheiro a EDITAR**: `Frontend/src/config/modules/administrativo/area-administrativa-module.ts`

Adicionar permissão (no final do objeto `permissions`):

```typescript
periodicidades: {
  id: '00000002-0000-0000-0108-000000000004', // verificar colisão antes
  name: 'Periodicidades de Tratamento',
},
```

> ⚠️ **GUID a validar antes de aplicar** — fazer `grep` por `00000002-0000-0000-0108-` em todos os módulos antes de gravar.

**Ficheiro a EDITAR**: `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`

Adicionar lazy import + rota:

```typescript
const ListagemPeriodicidadesPage = lazy(() =>
  import(
    '@/pages/area-administrativa/tratamentos/tabelas/periodicidades/pages/listagem-periodicidades-page'
  ).then((m) => ({ default: m.ListagemPeriodicidadesPage })),
)

{
  path: 'area-administrativa/tratamentos/tabelas/periodicidades',
  element: (
    <LicenseGuard
      requiredModule={modules.areaAdministrativa.id}
      requiredPermission={modules.areaAdministrativa.permissions.periodicidades.id}
      actionType={actionTypes.AuthVer}
    >
      <ListagemPeriodicidadesPage />
    </LicenseGuard>
  ),
  manageWindow: true,
  windowName: 'Periodicidades',
},
```

**Ficheiro a EDITAR**: `Frontend/src/lib/services/tratamentos/periocidade-tratamento-service/periocidade-tratamento-client.ts`

Estender para CRUD completo (mantendo nome interno `Periocidade`):

```typescript
import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  PeriocidadeTratamentoLightDTO,
  PeriocidadeTratamentoTableDTO,
  PeriocidadeTratamentoDTO,
  CreatePeriocidadeTratamentoRequest,
  UpdatePeriocidadeTratamentoRequest,
  PeriocidadeTratamentoTableFilter,
} from '@/types/dtos/tratamentos/periocidade-tratamento.dtos'

const BASE = '/client/tratamentos/PeriocidadeTratamento'

export class PeriocidadeTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPeriocidadesLight(
    keyword?: string,
  ): Promise<ResponseApi<GSResponse<PeriocidadeTratamentoLightDTO[]>>> {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<PeriocidadeTratamentoLightDTO[]>>(state.URL, url)
  }

  async getPaginated(
    filter: PeriocidadeTratamentoTableFilter,
  ): Promise<ResponseApi<PaginatedResponse<PeriocidadeTratamentoTableDTO>>> {
    return this.httpClient.postRequest<PaginatedResponse<PeriocidadeTratamentoTableDTO>>(
      state.URL, `${BASE}/paginated`, filter,
    )
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<PeriocidadeTratamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<PeriocidadeTratamentoDTO>>(state.URL, `${BASE}/${id}`)
  }

  async create(payload: CreatePeriocidadeTratamentoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<GSResponse<string>>(state.URL, BASE, payload)
  }

  async update(id: string, payload: UpdatePeriocidadeTratamentoRequest): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`, payload)
  }

  async remove(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}
```

**Ficheiro a EDITAR**: `Frontend/src/types/dtos/tratamentos/periocidade-tratamento.dtos.ts`

```typescript
export interface PeriocidadeTratamentoLightDTO {
  id: string
  descricao?: string | null
  ativo: boolean
}

export interface PeriocidadeTratamentoTableDTO {
  id: string
  descricao?: string | null
  ativo: boolean
  createdOn: string
}

export interface PeriocidadeTratamentoDTO extends PeriocidadeTratamentoTableDTO {}

export interface CreatePeriocidadeTratamentoRequest {
  descricao?: string | null
}

export interface UpdatePeriocidadeTratamentoRequest {
  descricao?: string | null
}

export interface PeriocidadeTratamentoTableFilter {
  pageNumber: number
  pageSize: number
  filters?: Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
}
```

**Ficheiros a CRIAR** sob `Frontend/src/pages/area-administrativa/tratamentos/tabelas/periodicidades/`:

| Caminho | Responsabilidade |
|---------|------------------|
| `pages/listagem-periodicidades-page.tsx` | Página principal — replicar `listagem-motivos-consulta-page.tsx`, label do título **"Periodicidades"**, permissão `modules.areaAdministrativa.permissions.periodicidades.id` |
| `components/listagem-periodicidades-table.tsx` | Wrapper sobre `data-table` |
| `components/listagem-periodicidades-table.columns.tsx` | Colunas `descricao`, `ativo` |
| `components/listagem-periodicidades-filter-controls.tsx` | Filtros |
| `queries/listagem-periodicidades-queries.ts` | Hooks `useGetPeriodicidadesPaginated` / `usePrefetchAdjacentPeriodicidades` |
| `modals/periodicidade-view-create-modal.tsx` | Modal view/create/edit com **label "Periodicidade"** em todos os textos visíveis |

### 8.4 Rotas placeholder `Tratamentos`/`Modalidades` — redirecionar (paridade)

> Decisão: **sem hubs nem cards**. As rotas `/area-administrativa/tratamentos` e `/modalidades` redirecionam para o primeiro item real do submenu quando este for criado. Entretanto ficam apenas como página vazia (não como dashboard novo).

**Ficheiro a EDITAR**: `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`

Manter as rotas como estão (com `AreaAdministrativaTablePlaceholderPage`), mas adicionar comentário sobre o destino futuro:

```tsx
// PARIDADE LEGADO: estas rotas servem apenas como "ponto de entrada" do menu lateral.
// Quando os submenus reais (Planning, Agenda) forem implementados, substituir por:
//   <Navigate to='/area-administrativa/tratamentos/planning' replace />
//   <Navigate to='/area-administrativa/modalidades/agenda' replace />
// Por agora, página vazia (sem cards/dashboard, para não introduzir UX que o legado não tem).
{
  path: 'area-administrativa/tratamentos',
  element: (
    <LicenseGuard
      requiredModule={modules.areaAdministrativa.id}
      requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
      actionType={actionTypes.AuthVer}
    >
      <AreaAdministrativaTablePlaceholderPage title='Tratamentos' />
    </LicenseGuard>
  ),
  manageWindow: false,
},
{
  path: 'area-administrativa/modalidades',
  element: (
    <LicenseGuard
      requiredModule={modules.areaAdministrativa.id}
      requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
      actionType={actionTypes.AuthVer}
    >
      <AreaAdministrativaTablePlaceholderPage title='Modalidades' />
    </LicenseGuard>
  ),
  manageWindow: false,
},
```

> A sugestão anterior de criar `area-administrativa-tratamentos-home.tsx` e `…-modalidades-home.tsx` com cards **foi descartada** — não tem paridade com o legado (que apenas dispara `LoadSubMenu` ao clicar no menu lateral, sem dashboard intermédio).

### 8.2 Implementar `CreateTipoConsulta` (Backend)

Replica o padrão usado em `MotivoConsultaService`.

**Ficheiro a CRIAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/DTOs/CreateTipoConsultaRequest.cs`

```csharp
using FluentValidation;
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService.DTOs
{
    public class CreateTipoConsultaRequest : IDto
    {
        public string Designacao { get; set; } = string.Empty;
    }

    public class CreateTipoConsultaValidator : AbstractValidator<CreateTipoConsultaRequest>
    {
        public CreateTipoConsultaValidator()
        {
            _ = RuleFor(x => x.Designacao).NotEmpty().MaximumLength(80);
        }
    }
}
```

**Ficheiro a CRIAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/Specifications/TipoConsultaMatchDesignacao.cs`

Necessário para evitar duplicados (mesma regra que `MotivoConsultaService`).

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Consultas;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService.Specifications
{
    public sealed class TipoConsultaMatchDesignacao : Specification<TipoConsultaItem>
    {
        public TipoConsultaMatchDesignacao(string designacao)
        {
            Query.Where(x => x.Designacao == designacao);
        }
    }
}
```

**Ficheiro a EDITAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/ITipoConsultaService.cs`

Substituir todo o conteúdo por:

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.TiposConsulta.TipoConsultaService.DTOs;
using CliCloud.Application.Services.TiposConsulta.TipoConsultaService.Filters;

namespace CliCloud.Application.Services.TiposConsulta.TipoConsultaService
{
    public interface ITipoConsultaService : ITransientService
    {
        Task<PaginatedResponse<TipoConsultaTableDTO>> GetTipoConsultaPaginatedAsync(TipoConsultaTableFilter filter);
        Task<Response<IEnumerable<TipoConsultaTableDTO>>> GetAllTipoConsultaAsync(TipoConsultaAllFilter? filter);
        Task<Response<TipoConsultaDTO>> GetTipoConsultaAsync(Guid id);
        Task<Response<Guid>> CreateTipoConsultaAsync(CreateTipoConsultaRequest request);
        Task<Response<Guid>> UpdateTipoConsultaAsync(UpdateTipoConsultaRequest request, Guid id);
        Task<Response<Guid>> DeleteTipoConsultaAsync(Guid id);
    }
}
```

**Ficheiro a EDITAR**: `Backend/CliCloud.Application/Services/TipoConsulta/TipoConsultaService/TipoConsultaService.cs`

Adicionar o `using` da pasta `Specifications` (já existe) e inserir o método `CreateTipoConsultaAsync` imediatamente antes de `UpdateTipoConsultaAsync`:

```csharp
public async Task<Response<Guid>> CreateTipoConsultaAsync(CreateTipoConsultaRequest request)
{
    try
    {
        TipoConsultaMatchDesignacao matchSpec = new(request.Designacao ?? string.Empty);
        if (await _repository.ExistsAsync<TipoConsultaItem, Guid>(matchSpec))
        {
            return ResponseFactory.Fail<Guid>("Já existe um tipo de consulta com esta designação.");
        }

        TipoConsultaItem entity = _mapper.Map<TipoConsultaItem>(request);
        entity.Id = Guid.NewGuid();

        TipoConsultaItem created = await _repository.CreateAsync<TipoConsultaItem, Guid>(entity);
        _ = await _repository.SaveChangesAsync();
        return ResponseFactory.Success(created.Id);
    }
    catch (Exception ex)
    {
        return ResponseFactory.Fail<Guid>(ex.Message);
    }
}
```

**Ficheiro a EDITAR**: `Backend/CliCloud.WebApi/Controllers/Consultas/TipoConsultaController.cs`

Adicionar o `using` `...DTOs` (já existe) e o endpoint imediatamente antes de `UpdateTipoConsultaAsync`:

```csharp
[Authorize(Roles = "client")]
[HttpPost]
public async Task<IActionResult> CreateTipoConsultaAsync([FromBody] CreateTipoConsultaRequest request)
{
    try
    {
        Response<Guid> result = await _tipoConsultaService.CreateTipoConsultaAsync(request);
        return Ok(result);
    }
    catch (Exception ex)
    {
        return BadRequest(ex.Message);
    }
}
```

Atualizar o comentário XML da classe (linhas 10-12) para remover o texto "Sem modal de inserção", deixando apenas:

```csharp
/// <summary>
/// API para Tipos de Consulta. CRUD completo.
/// </summary>
```

**Ficheiro a EDITAR**: `Backend/CliCloud.Infrastructure/Mapper/MappingProfiles.cs`

Após a linha 1755 (fim do `CreateMap<TipoConsultaDtos.UpdateTipoConsultaRequest, TipoConsultaItem>()...`), adicionar:

```csharp
_ = CreateMap<TipoConsultaDtos.CreateTipoConsultaRequest, TipoConsultaItem>()
    .ForMember(d => d.Id, o => o.Ignore())
    .ForMember(d => d.CreatedBy, o => o.Ignore())
    .ForMember(d => d.CreatedOn, o => o.Ignore())
    .ForMember(d => d.LastModifiedBy, o => o.Ignore())
    .ForMember(d => d.LastModifiedOn, o => o.Ignore())
    .ForMember(d => d.DeletedOn, o => o.Ignore())
    .ForMember(d => d.DeletedBy, o => o.Ignore());
```

> Frontend: já existe um modal de edição em `Frontend/src/pages/area-comum/tabelas/consultas/tipos-consultas/modals/` (chamado pelo `listagem-tipos-consulta-page.tsx`). Para fechar a Onda 1 do lado do cliente, basta:
> 1. Adicionar uma função `createTipoConsulta(payload)` em `Frontend/src/lib/services/consultas/tipo-consulta-service.ts` (POST `/client/consultas/TipoConsulta`).
> 2. Estender o modal existente para aceitar `mode='create'` (já é o padrão noutras tabelas — ver `motivo-consulta-view-create-modal.tsx`).
> 3. Habilitar o botão "Adicionar" no `listagem-tipos-consulta-page.tsx` (atualmente o `canAdd` está bloqueado por o controller não ter endpoint).

### 8.3 Criar página SPA para `Periocidade Tratamentos`

> O backend (`PeriocidadeTratamentoController`) já está completo com CRUD + paginação. Falta só Frontend.

**Ficheiro a EDITAR**: `Frontend/src/config/modules/common/area-comum-module.ts`

Adicionar permissão (após `historicoCredenciaisLancamento`):

```typescript
periocidades: {
  id: '00000002-0000-0000-0094-000000000003',
  name: 'Periocidades de Tratamento',
},
```

**Ficheiro a EDITAR**: `Frontend/src/config/menu-items.ts`

Dentro de `roleHeaderMenus.client.tabelas`, no item `Tratamentos`, antes de `Motivos de Alta` (linha ~670), inserir:

```typescript
{ label: 'Periocidades', href: '/area-comum/tabelas/tratamentos/periocidades', funcionalidadeId: modules.areaComum.permissions.periocidades.id },
```

**Ficheiro a EDITAR**: `Frontend/src/routes/area-comum/areaComum.tsx`

Adicionar lazy import + rota (mesmo padrão das outras tabelas de tratamentos).

```typescript
const ListagemPeriocidadesPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tratamentos/periocidades/pages/listagem-periocidades-page'
  ).then((m) => ({ default: m.ListagemPeriocidadesPage })),
)

{
  path: 'area-comum/tabelas/tratamentos/periocidades',
  element: (
    <LicenseGuard
      requiredModule={modules.areaComum.id}
      requiredPermission={modules.areaComum.permissions.periocidades.id}
      actionType={actionTypes.AuthVer}
    >
      <ListagemPeriocidadesPage />
    </LicenseGuard>
  ),
  manageWindow: true,
  windowName: 'Periocidades',
},
```

**Ficheiro a EDITAR**: `Frontend/src/lib/services/tratamentos/periocidade-tratamento-service/periocidade-tratamento-client.ts`

O cliente actual só tem `getPeriocidadesLight`. Estender para CRUD completo:

```typescript
import state from '@/states/state'
import type { ResponseApi } from '@/types/responses'
import type { GSResponse, PaginatedResponse } from '@/types/api/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  PeriocidadeTratamentoLightDTO,
  PeriocidadeTratamentoTableDTO,
  PeriocidadeTratamentoDTO,
  CreatePeriocidadeTratamentoRequest,
  UpdatePeriocidadeTratamentoRequest,
  PeriocidadeTratamentoTableFilter,
} from '@/types/dtos/tratamentos/periocidade-tratamento.dtos'

const BASE = '/client/tratamentos/PeriocidadeTratamento'

export class PeriocidadeTratamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getPeriocidadesLight(
    keyword?: string,
  ): Promise<ResponseApi<GSResponse<PeriocidadeTratamentoLightDTO[]>>> {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<PeriocidadeTratamentoLightDTO[]>>(state.URL, url)
  }

  async getPaginated(
    filter: PeriocidadeTratamentoTableFilter,
  ): Promise<ResponseApi<PaginatedResponse<PeriocidadeTratamentoTableDTO>>> {
    return this.httpClient.postRequest<PaginatedResponse<PeriocidadeTratamentoTableDTO>>(
      state.URL,
      `${BASE}/paginated`,
      filter,
    )
  }

  async getById(id: string): Promise<ResponseApi<GSResponse<PeriocidadeTratamentoDTO>>> {
    return this.httpClient.getRequest<GSResponse<PeriocidadeTratamentoDTO>>(state.URL, `${BASE}/${id}`)
  }

  async create(
    payload: CreatePeriocidadeTratamentoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<GSResponse<string>>(state.URL, BASE, payload)
  }

  async update(
    id: string,
    payload: UpdatePeriocidadeTratamentoRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`, payload)
  }

  async remove(id: string): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(state.URL, `${BASE}/${id}`)
  }
}
```

**Ficheiro a EDITAR**: `Frontend/src/types/dtos/tratamentos/periocidade-tratamento.dtos.ts`

Estender com os DTOs necessários:

```typescript
export interface PeriocidadeTratamentoLightDTO {
  id: string
  descricao?: string | null
  ativo: boolean
}

export interface PeriocidadeTratamentoTableDTO {
  id: string
  descricao?: string | null
  ativo: boolean
  createdOn: string
}

export interface PeriocidadeTratamentoDTO extends PeriocidadeTratamentoTableDTO {}

export interface CreatePeriocidadeTratamentoRequest {
  descricao?: string | null
}

export interface UpdatePeriocidadeTratamentoRequest {
  descricao?: string | null
}

export interface PeriocidadeTratamentoTableFilter {
  pageNumber: number
  pageSize: number
  filters?: Array<{ id: string; value: string }>
  sorting?: Array<{ id: string; desc: boolean }>
}
```

**Ficheiros a CRIAR** (estrutura mínima — usar `motivos-consulta` ou `prioridades` como referência):

| Caminho | Responsabilidade |
|---------|------------------|
| `Frontend/src/pages/area-comum/tabelas/tratamentos/periocidades/pages/listagem-periocidades-page.tsx` | Página principal (replicar 1:1 o `listagem-motivos-consulta-page.tsx`, substituindo nomes e a permissão por `modules.areaComum.permissions.periocidades.id`) |
| `Frontend/src/pages/area-comum/tabelas/tratamentos/periocidades/components/listagem-periocidades-table.tsx` | Wrapper sobre `data-table` com colunas `descricao` e `ativo` |
| `Frontend/src/pages/area-comum/tabelas/tratamentos/periocidades/components/listagem-periocidades-table.columns.tsx` | Colunas (mesmo padrão de `motivos-consulta`) |
| `Frontend/src/pages/area-comum/tabelas/tratamentos/periocidades/components/listagem-periocidades-filter-controls.tsx` | Filtros (apenas descrição) |
| `Frontend/src/pages/area-comum/tabelas/tratamentos/periocidades/queries/listagem-periocidades-queries.ts` | Hooks `useGetPeriocidadesPaginated` / `usePrefetchAdjacentPeriocidades` |
| `Frontend/src/pages/area-comum/tabelas/tratamentos/periocidades/modals/periocidade-view-create-modal.tsx` | Modal view/create/edit |

### 8.4 Substituir placeholders `Tratamentos` e `Modalidades`

Em vez de `AreaAdministrativaTablePlaceholderPage`, criar dois hubs com cards de navegação para as sub-áreas (mesmo padrão do `area-administrativa-home`). Quando as features das ondas seguintes forem ficando prontas, os cards passam a apontar para as páginas reais.

**Ficheiro a CRIAR**: `Frontend/src/pages/area-administrativa/pages/area-administrativa-tratamentos-home.tsx`

```typescript
import { Link } from 'react-router-dom'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'

const CARDS: Array<{ title: string; description: string; href?: string; disabled?: boolean }> = [
  { title: 'Planning', description: 'Planeamento de tratamentos (legado Planning.aspx).', disabled: true },
  { title: 'Marcações', description: 'Marcações automáticas e manuais.', disabled: true },
  { title: 'Tratamentos marcados', description: 'Listagem de tratamentos por utente / local.', disabled: true },
  { title: 'Admissões', description: 'Admissões fisio do dia.', disabled: true },
  { title: 'Credenciais fisio', description: 'Lançamento de credenciais fisio.', href: '/area-administrativa/credenciais' },
  { title: 'Histórico', description: 'Histórico por datas / utentes / médicos / organismos.', disabled: true },
  { title: 'Mapas', description: 'Mapas de serviços de tratamentos.', disabled: true },
  { title: 'Estatísticas', description: 'Marcações, médias, ocupação.', disabled: true },
  { title: 'Tabelas', description: 'Periocidades, patologias, aparelhos…', href: '/area-comum/tabelas/tratamentos/locais-tratamento' },
]

export function AreaAdministrativaTratamentosHomePage() {
  return (
    <>
      <PageHead title='Tratamentos | Área Administrativa' />
      <DashboardPageContainer>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold'>Tratamentos</h1>
          <p className='text-sm text-muted-foreground'>
            Hub administrativo de tratamentos (em construção — paridade com case "Tratamentos" do WSMenus legado).
          </p>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {CARDS.map((card) => {
            const body = (
              <div
                className={
                  'rounded-lg border p-4 transition ' +
                  (card.disabled
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-accent cursor-pointer')
                }
              >
                <div className='font-medium'>{card.title}</div>
                <div className='text-sm text-muted-foreground mt-1'>{card.description}</div>
                {card.disabled ? (
                  <div className='mt-2 text-xs text-muted-foreground'>(em preparação)</div>
                ) : null}
              </div>
            )
            return card.disabled || !card.href ? (
              <div key={card.title}>{body}</div>
            ) : (
              <Link key={card.title} to={card.href}>{body}</Link>
            )
          })}
        </div>
      </DashboardPageContainer>
    </>
  )
}
```

**Ficheiro a CRIAR**: `Frontend/src/pages/area-administrativa/pages/area-administrativa-modalidades-home.tsx`

Mesmo padrão que `…-tratamentos-home.tsx`, com `CARDS` apontando para Agenda / Sessões / Matrículas / Faturação / Tabelas (todos `disabled: true` enquanto não houver implementação).

**Ficheiro a EDITAR**: `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`

Substituir os lazy imports e os elementos das rotas placeholder (linhas 5, 116-140) por:

```typescript
const AreaAdministrativaTratamentosHomePage = lazy(() =>
  import('@/pages/area-administrativa/pages/area-administrativa-tratamentos-home').then((m) => ({
    default: m.AreaAdministrativaTratamentosHomePage,
  })),
)
const AreaAdministrativaModalidadesHomePage = lazy(() =>
  import('@/pages/area-administrativa/pages/area-administrativa-modalidades-home').then((m) => ({
    default: m.AreaAdministrativaModalidadesHomePage,
  })),
)
```

E nas rotas:

```typescript
{
  path: 'area-administrativa/tratamentos',
  element: (
    <LicenseGuard
      requiredModule={modules.areaAdministrativa.id}
      requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
      actionType={actionTypes.AuthVer}
    >
      <AreaAdministrativaTratamentosHomePage />
    </LicenseGuard>
  ),
  manageWindow: false,
},
{
  path: 'area-administrativa/modalidades',
  element: (
    <LicenseGuard
      requiredModule={modules.areaAdministrativa.id}
      requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
      actionType={actionTypes.AuthVer}
    >
      <AreaAdministrativaModalidadesHomePage />
    </LicenseGuard>
  ),
  manageWindow: false,
},
```

Remover o `import` de `AreaAdministrativaTablePlaceholderPage` (linha 5) se nada mais o usa.

---

## 9. Plano executável — Ondas 2 a 5 (estrutura de ficheiros)

Para cada feature listo: ficheiros C/E principais e responsabilidade. Código completo será desenvolvido onda a onda.

### 9.1 Onda 2 — Consultas: operação diária

#### Fecho Diário

| Caminho | Ação | Responsabilidade |
|---------|------|------------------|
| `Backend/CliCloud.Domain/Entities/Consultas/FechoDiario.cs` | C | Entidade que regista fecho por data + utilizador + clínica + totalizadores |
| `Backend/CliCloud.Domain/Entities/Configurations/FechoDiarioConfig.cs` | C | EF Core config |
| `Backend/CliCloud.Infrastructure/Migrations/<timestamp>_AddFechoDiario.cs` | C | `dotnet ef migrations add AddFechoDiario` |
| `Backend/CliCloud.Application/Services/Consultas/FechoDiarioService/IFechoDiarioService.cs` | C | `EfetuarFechoAsync(date, clinicaId)`, `ConsultarFechoAsync(date)`, `ReverterFechoAsync(id)` |
| `Backend/CliCloud.Application/Services/Consultas/FechoDiarioService/FechoDiarioService.cs` | C | Implementação |
| `Backend/CliCloud.WebApi/Controllers/Consultas/FechoDiarioController.cs` | C | Endpoints |
| `Backend/CliCloud.Infrastructure/Mapper/MappingProfiles.cs` | E | Mapeamentos novos |
| `Frontend/src/routes/area-administrativa/areaAdministrativa.tsx` | E | Rota `/area-administrativa/consultas/fecho-diario` |
| `Frontend/src/pages/area-administrativa/consultas/fecho-diario/**` | C | Página + componentes |
| `Frontend/src/lib/services/consultas/fecho-diario-service.ts` | C | Service do cliente |
| `Frontend/src/config/menu-items.ts` | E | Entrada "Fecho Diário" em `Consultas Diárias` |
| `Frontend/src/config/modules/administrativo/area-administrativa-module.ts` | E | Permissão `fechoDiario` |

#### Admissões — modo "Pendentes"

Aproveitar `MarcacaoConsultaController` adicionando endpoint `pendentes`. Página em `Frontend/src/pages/area-administrativa/consultas/admissoes/` com filtros.

#### Lista de Espera (consultas)

Domínio novo (não confundir com `EstadoListaEspera` de tratamentos):

| Caminho | Ação |
|---------|------|
| `Backend/CliCloud.Domain/Entities/Consultas/ListaEsperaConsulta.cs` | C |
| `Backend/CliCloud.Application/Services/Consultas/ListaEsperaService/**` | C |
| `Backend/CliCloud.WebApi/Controllers/Consultas/ListaEsperaController.cs` | C |
| `Frontend/src/pages/area-administrativa/consultas/lista-espera/**` | C |

#### Pedidos Consulta (Global Booking) e Ordem de Entrada

Mesma estrutura. Avaliar se Global Booking integra com módulo externo no legado e definir contratos antes de implementar.

### 9.2 Onda 3 — Histórico administrativo (paridade: 4 páginas separadas)

Legado tem **4 páginas distintas** (`HistoricoDatasLst`, `HistoricoUtentesLst`, `HistoricoMedicosLst`, `HistoricoOrganismosLst`) no `case "Consultas"` → submenu "Histórico". Para paridade estrita, manter as **4 rotas separadas** (não usar tabs).

| Caminho | Ação |
|---------|------|
| `Backend/CliCloud.Application/Services/Consultas/HistoricoConsultaService/**` | C |
| `Backend/CliCloud.WebApi/Controllers/Consultas/HistoricoConsultaController.cs` | C — 4 endpoints (`por-data`, `por-utente`, `por-medico`, `por-organismo`) |
| `Frontend/src/pages/area-administrativa/consultas/historico/datas/**` | C |
| `Frontend/src/pages/area-administrativa/consultas/historico/utentes/**` | C |
| `Frontend/src/pages/area-administrativa/consultas/historico/medicos/**` | C |
| `Frontend/src/pages/area-administrativa/consultas/historico/organismos/**` | C |
| `Frontend/src/config/menu-items.ts` | E — Histórico → 4 sub-itens com labels idênticos ao legado (`MenuHistoricoDatas`, `MenuHistoricoUtentes`, `MenuHistoricoMedicos`, `MenuHistoricoOrganismos`) |

> Não substitui o histórico clínico em `/area-clinica/.../historico/consultas-efetuadas`. São relatórios administrativos agregados (separados na arquitetura nova mas que no legado estavam todos no `case "Consultas"`).

### 9.3 Onda 4 — Mapas, Estatísticas e Excel

**Decisão prévia obrigatória do projeto novo** (não é paridade — é escolha técnica para substituir Crystal Reports legado). Está **fora deste documento**; a equipa deve decidir e atualizar esta secção quando houver decisão. Listo apenas para referência:

| Opção | Notas |
|-------|-------|
| QuestPDF + Razor | PDF, layout em código |
| ClosedXML | Apenas Excel — adequa-se a `GerarFicheiroExcel.aspx` |
| Stimulsoft Reports.NET | Comercial, mais próximo de Crystal |
| RDLC + ReportViewerCore | Open-source, fluxo de upgrade |

**Esqueleto comum** (independente da escolha — o objetivo é replicar **todos** os relatórios `Reports/Consultas/*.rpt` e `Reports/Tratamentos/*.rpt` do legado):

| Caminho | Ação |
|---------|------|
| `Backend/CliCloud.Application/Services/Relatorios/RelatorioConsultasService/**` | C — agregação de dados |
| `Backend/CliCloud.Application/Services/Relatorios/ReportEngine/IReportEngine.cs` | C — abstração do motor |
| `Backend/CliCloud.Infrastructure/Reports/<MotorEscolhido>ReportEngine.cs` | C — implementação |
| `Backend/CliCloud.WebApi/Controllers/Relatorios/RelatoriosController.cs` | C — endpoints `mapa-servicos`, `livro-caixa`, `motivos`, `tipos-consulta`, `excel-mensal` |
| `Frontend/src/pages/area-administrativa/consultas/mapas/**` | C — UI com seletor de tipo + filtros + botão "Emitir" |
| `Frontend/src/lib/services/relatorios/relatorios-service.ts` | C — chamadas + download |

Cada variante `MapasServicosComValores.aspx?codigo=*` (Data, OrganismoData, OrganismoUtente, OrganismoADM, MedicoSimples, etc.) torna-se um `?codigo=` no endpoint novo — mantém o contrato simples e familiar.

### 9.4 Onda 5 — Tratamentos operacionais

| Sub-feature | Backend (novos) | Frontend (novos) |
|-------------|------------------|--------------------|
| Planning | `Tratamentos/PlanningService`, controller, entidade `PlaningTratamento` | `area-administrativa/tratamentos/planning/**` |
| Marcações Auto/Manuais | `Tratamentos/MarcacaoTratamentoService`, controller | `area-administrativa/tratamentos/marcacoes/**` |
| Tratamentos marcados (modos) | Estender `TratamentoService` com filtros `localTratamento`, `utente` | `area-administrativa/tratamentos/listagem/**` |
| Admissões fisio | `Tratamentos/AdmissaoFisioService`, controller | `area-administrativa/tratamentos/admissoes/**` |
| Histórico tratamentos | `Tratamentos/HistoricoTratamentoService` com 7 modos | `area-administrativa/tratamentos/historico/**` |
| Entidades fisio | Avaliar se `Funcionario` cobre; senão, CRUD dedicado | `area-administrativa/tratamentos/entidades/{terapeutas,auxiliares}/**` |
| Margem Terapeutas | `Tratamentos/MargemTerapeutaService`, controller | `area-administrativa/tratamentos/tabelas/margem-terapeutas/**` |

### 9.5 Onda 6 — Modalidades (módulo inteiro)

> Objetivo (paridade): **replicar tal-qual** o `case "Modalidades"` do `WSMenus.asmx.cs` (linhas 2177-2241). Labels do legado: `Agenda`, **`Lista Diária`** (não "Sessões"), **`Inscrições`** (não "Matrículas"), `Faturação`, `Tabelas`.

| Caminho | Ação |
|---------|------|
| `Backend/CliCloud.Domain/Entities/Modalidades/**` | C — `Modalidade`, `Sala`, `Aula`, `Matricula`, `TipoPlano`, `ConfigModalidade` |
| `Backend/CliCloud.Infrastructure/Migrations/<ts>_AddModalidades.cs` | C |
| `Backend/CliCloud.Application/Services/Modalidades/**` | C — `ConfigModalidadeService`, `AgendaService`, `MatriculaService`, `FaturacaoModalidadesService`, `TipoPlanoService` |
| `Backend/CliCloud.WebApi/Controllers/Modalidades/**` | C |
| `Frontend/src/pages/area-administrativa/modalidades/**` | C — `agenda`, `sessoes-diarias`, `matriculas`, `por-liquidar`, `tabelas/{modalidades,salas,tipos-plano}` |
| `Frontend/src/config/modules/administrativo/area-administrativa-module.ts` | E — permissões `modalidades*` |
| `Frontend/src/config/menu-items.ts` | E — header completo |

---

## 10. Ordem de execução recomendada

| # | Onda | Esforço relativo | Pré-requisitos |
|---|------|------------------|----------------|
| 1 | Onda 1 — Quick wins (secção 8) | XS (1–2 dias) | Nenhum |
| 2 | Onda 2 — Consultas operacional | M (1–2 sprints) | Onda 1 |
| 3 | Onda 3 — Histórico admin | S (1 sprint) | Onda 2 (partilha dados) |
| 4 | Onda 4 — Mapas + Excel | L (2+ sprints) | Decisão sobre motor de relatórios |
| 5 | Onda 5 — Tratamentos operacional | XL (3+ sprints) | Onda 1; reuso parcial de motor de relatórios |
| 6 | Onda 6 — Modalidades | XL (3+ sprints) | Decisão estratégica de produto |

---

---

## 11. Auditoria detalhada — **Credenciais SNS** (consultas + tratamentos + exames sem papel)

> Auditoria específica solicitada para servir de base à replicação integral. Investiga **três sub-features** que aparecem no submenu "Credenciais S.N.S." do legado: (A) Lançamento de Credenciais (Consultas), (B) Lançamento de Credenciais (Tratamentos/Fisio), (C) Exames Sem Papel (Lst + Histórico).
>
> Paths absolutos no projeto. Citações de código em forma resumida (não cópia integral). Inferências sobre `CliCloud.Dados.*` partem do código consumidor, dado que o assembly de Dados é externo ao repo.

### 11.1 Entradas no menu legado (`WSMenus.asmx.cs`)

**Ficheiro**: `CliCloud.ASPcli/Services/WSMenus.asmx.cs`

**Em `case "Consultas":` (linhas 694-705) — região "Menu Credenciais S.N.S.":**

| `SubMenu` (recurso) | URL | Permissão (`AppControl.Funcionalidades`) |
|---------------------|-----|-----------------------------------------|
| `MenuLancamentoCredenciais` | `~/Client/Consultas/LancamentoCredenciaisLst.aspx` | `Consul_LancCredenciais` |
| `MenuExamesSemPapel` | `~/Client/Consultas/ExamesSemPapelLst.aspx` | `Consul_ExamesSemPapel` |
| `MenuExamesSemPapelHistorico` | `~/Client/Consultas/ExamesSemPapelLst.aspx?historico=1` | `Consul_ExamesSemPapel` |

**Em `case "Tratamentos":` (linhas 1148-1158):**

| `SubMenu` | URL | Permissão |
|-----------|-----|-----------|
| `MenuLancamentoCredenciais` | `~/Client/Tratamentos/LancamentoCredenciaisLst.aspx` | `Tratamentos_LancCred` |
| `MenuExamesSemPapel` | `~/Client/Consultas/ExamesSemPapelLst.aspx` (mesmo ASPX! partilhado) | `Consul_ExamesSemPapel` |
| `MenuExamesSemPapelHistorico` | `~/Client/Consultas/ExamesSemPapelLst.aspx?historico=1` | `Consul_ExamesSemPapel` |

> **Observação 1**: Exames Sem Papel é a **mesma página** em ambos os menus — apenas o trampolim de entrada é diferente. A página suporta utentes vindos quer de consultas quer de tratamentos.
>
> **Observação 2**: o "Histórico" é apenas a **mesma página com query string `?historico=1`** — não há ASPX dedicada.

### 11.2 Páginas ASPX/JS do legado (inventário por área)

#### 11.2.A Lançamento de Credenciais — **Consultas** (`LOTDIRECT`)

Caminho: `CliCloud.ASPcli/Client/Consultas/`

| Ficheiro | Papel |
|----------|-------|
| `LancamentoCredenciaisLst.aspx` / `.aspx.cs` / `.js` | Listagem (DataTables AJAX) |
| `LancamentoCredenciaisEdt.aspx` / `.aspx.cs` / `.js` | Edição / criação (modal + linhas) |

**Listagem — colunas servidor** (mapeamento em `Services/LancamentoCredenciais.cs:176-194`):

`codigo`, `c_utente`, `utente`, `credencial`, `mesAno`, `lote`, `organismo`, `txmoderadora`, `tipoServico`, `valtaxas`, `tipolote`, mais flags: `UrlRelatorio`, `PartilharRelatorio`, `RelatorioComunicadoSemRequisicao`, `Erros`.

**Listagem — filtros** (`LancamentoCredenciaisLst.js:7-16`): código, c_utente, nome, credencial, num lote, codinst (organismo), data fim, mês/ano de pesquisa, **`historico_de` / `historico_ate`** (intervalo histórico).

**Ações de linha**: ver, editar (`LancamentoCredenciaisEdt.aspx`), apagar, relatórios/partilha ESP (se `PartilharRelatorio==True`), menu "tasks" → passar para histórico, etiquetas NIF/impressoras, relatório código por credencial.

**Ações de lista (toolbar)**: Adicionar, Corrigir Lotes, Listagens (vários Crystal Reports), Histórico (toggle filtro).

**Save** (`Services/LancamentoCredenciais.cs:597-701`, método `LotdirectEdtSave`) — parâmetros HTTP do POST:

`oper`, `codigo`, `cutente`, `nome`, `credencial`, `numlote`, `indice`, `codinst`, `mes`, `ano`, `datainic`, `datafim`, `isencao`, `tiposerv`, `tipolote`, `cmedico`, `codcons`, `qtcons`, `valcons`, `txcons`, `prodaplic`, `valtaxas`, `subtotal`, `valtotal`, `taxalinhas`, `cproveni`, `quantc/k`, `totalc/k`, `tiposrvecg`, `tserv`, `cservico`, `credencialexterna`, `procedefetuado`, **`servicos` (JSON → `LINDIRECT`)**, **`examesNaoPrescritosEfetuados` (JSON → `LINDIRECT_789`)**, `historico`, `c_extramed`, `areaPrestacao`.

#### 11.2.B Lançamento de Credenciais — **Tratamentos/Fisio** (`LOTDIRECTFISIO`)

Caminho: `CliCloud.ASPcli/Client/Tratamentos/`

| Ficheiro | Papel |
|----------|-------|
| `LancamentoCredenciaisLst.aspx` / `.aspx.cs` / `.js` | Listagem específica fisio |
| `LancamentoCredenciaisEdt.aspx` / `.aspx.cs` / `.js` | Edição específica fisio |

**Colunas extra vs consultas** (em `Services/LancamentoCredenciais.cs:210-230` do bloco `WSTratamentos`):

`Assinado`, `RelatorioComunicado`, **`Suspenso`** (linha em vermelho para créditos com tratamento suspenso).

**Pré-listagem específica fisio**: `LOTDIRECTFISIO.SuspenderCredenciaisTratamentosSuspensos()` é chamado **antes** da query — propaga o estado dos tratamentos suspensos para as credenciais.

**Toolbar exclusivo**: `LancamentoCredenciaisCorrigirLotes` (POST `WSTratamentos.asmx`), Transferência massiva para histórico por mês/ano (`TransferenciaHistoricoLancamentoCredenciaisByMesAno`), transferência por código (`ByCodigo`).

**Save** — campos extra vs consultas:

- **`ValidadeCredencial`** (data) — **não existe** em consultas, exclusivo de fisio
- Estado `Assinado`, gestão de `LOTESPFISIO` (lote de exames sem papel para fisio — agregação distinta de `LOTESP`)

#### 11.2.C Exames Sem Papel (`RequisicoesESP` / `RequisicoesESPLinha`)

Caminho: `CliCloud.ASPcli/Client/Consultas/`

| Ficheiro | Papel |
|----------|-------|
| `ExamesSemPapelLst.aspx` / `.aspx.cs` / `.js` | Listagem (com tab Histórico via `?historico=1`) |
| `ExamesSemPapelEdt.aspx` / `.aspx.cs` / `.js` | Edição da requisição |

**Filtros lista** (`Services/ExamesSemPapel.cs:49-227`, método `ExamesSemPapelLst`): número de requisição, utente, módulos, médico, estado, presença de relatório, histórico, ano/mês de faturação.

**Colunas servidor** (`L229-262`): `Codigo`, `NomeUtente`, `CodUtente`, `NumeroRequisicao`, `Estado`, `Area`, `Lotes`, `UrlRelatorio`, `RelatorioComunicado`, pins, flags PNP (prescrito-não-prescrito), ano/mês faturação.

> A região "Histórico" não é uma rota distinta — é a **mesma página** com `?historico=1`. O `.js` faz toggle do filtro `historico` e refaz o AJAX.

### 11.3 Métodos `[WebMethod]` — inventário completo

#### `WSConsultas.asmx` — parcial `LancamentoCredenciais.cs`

`LotdirectLst`, `LotdirectDelAll`, `LotdirectDel`, `LotdirectEdtLoadUtente`, `ObterProximoIDCredenciais`, `LotdirectEdtLoad`, `Lindirect789Load`, `LotdirectEdtVerificaCredencial`, `LotdirectEdtObterInfoAdmissaoByCredencial`, `LotdirectEdtSave`, `CodinstAutocomplete`, `CMedicoAutocomplete`, `CodconsAutocomplete`, `LotDirectAutoComplete`, `ObternovoLote`, `passarLancamentoCredenciaisParaHistorico`, `passarLancamentoCredenciaisParaAtivo`, `LancamentoCredenciaisCorrigirLotes`, `GetIdLancamentoCons`, `VerificarRelatorioSemRequisicao`, `CarregarDadosRelatorioResultadosSemRequisicao`, `VerificaDiagnosticoPreenchidoSemRequisicao`, `ExamesSemPapelComunicaRelatorioSemRequisicao`, `GuardaDadosRelatorioResultadosGeralSemRequisicao`, `GuardaDadosRelatorioResultadosMFRSemRequisicao`, `ExamesSemPapelAssociarRelatorioSemRequisicao`, `ExamesSemPapelDownloadRelatorioESPSemRequisicao`, `GetEncryptedPdfWithoutRequest`.

⚠️ **Bug legado a documentar**: `passarLancamentoCredenciaisParaHistorico` em `WSConsultas` verifica a permissão **`Tratamentos_LancCred`** (provável copy-paste de fisio). Em paridade nova, usar `Consul_LancCredenciais` aqui.

⚠️ **Gap segurança legado**: `LancamentoCredenciaisCorrigirLotes` apenas verifica sessão autenticada — **não tem gate de funcionalidade**. Em paridade estrita, manter; em **boa prática**, adicionar a verificação ao novo (decisão de produto).

#### `WSTratamentos.asmx` — parcial `LancamentoCredenciais.cs`

Métodos análogos com `LOTDIRECTFISIO` + extras:

`LancamentoCredenciaisLst`, `LancCredencialLstTransferenciaHistorico`, `ObterLote`, `TransferenciaHistoricoLancamentoCredenciaisByMesAno`, `TransferenciaHistoricoLancamentoCredenciaisByCodigo`, `passarLancamentoCredenciaisParaAtivoTratamento`, `GetNextIDCredenciais`, autocomplete `Medicos/Organismos/Centros/TipoSrv`, `DecryptedPdfWithoutRequest` (extra vs consultas que só tem encrypted).

#### `WSConsultas.asmx` — parcial `ExamesSemPapel.cs` (≈50 métodos)

Categorias:

| Categoria | Métodos representativos |
|-----------|--------------------------|
| Listagem / pesquisa | `ExamesSemPapelLst`, `ExamesSemPapelMedicoLst`, `OnSavePesquisaRequisicao`, `getENPS` |
| Edição / load | `ExamesSemPapelEdtLoad`, `ExamesSemPapelObter` |
| Cativação | `ExamesSemPapelCativarPorNumRequisicao`, `UpdateUtenteOrganismo` |
| Agendamento SNS | `ExamesSemPapelComunicaAgendamento`, `ExamesSemPapelAgendamentosCancelados`, `CancelarExamesSemPapelAgendamentosCancelados` |
| Efetivação SNS | `ExamesSemPapelVerificaPinPrestacao`, `ExamesSemPapelComunicaEfetivacao`, `ExamesSemPapelAnulaEfetivacao` |
| Validação | `ExamesSemPapelVerficaOrganismoServicos`, `ExamesSemPapelGuardarClick` |
| ENP (efetuados não prescritos) | `ExamesSemPapelAdicionarENP`, `ExamesSemPapelAnulaEfetuadosNaoPrescritos` |
| Taxas moderadoras | `ExamesSemPapelAnulaTaxasModeradoras`, `ExamesSemPapelRegistaTaxasModeradoras`, `ExamesSemPapelConsultaTaxasModeradoras` |
| Assinatura / relatório SNS | `ExamesSemPapelAssinarRequisicao`, `ExamesSemPapelAssociarRelatorio`, `ExamesSemPapelComunicaRelatorio`, `ApagarGuidRelatorio*` |
| Partilha / validação relatório | `PartilhaRemoverEstadoValidacao`, `ServicoVerificarRelatorioESP`, `ExamesSemPapelDownloadRelatorioESP` |
| Apagar lógico | `ExamesSemPapelDelApagado` |
| Diagnóstico | `ExamesSemPapelErrosComunicacao` |
| Histórico | `ExamesSemPapelTransferenciaHistorico` |
| Entrega SNS | `ExamesSemPapelEntregaRequisicaoSns` |
| PDF | helpers encrypt/decrypt, MFR, Geral, `RelatorioResultados*` |

**Permissão típica**: `Consul_ExamesSemPapel`. Algumas (ex.: `getENPS`) aceitam **OR** com `PClinico_ExamesSemPapel`.

**Integração externa**: `using Globalsoft.ACSS.WSClient;` no topo de `ExamesSemPapel.cs` — comunicação SOAP com webservices da ACSS / SPMS.

### 11.4 Entidades de dados legado (`CliCloud.Dados.*` — inferidas pelo código consumidor)

> O assembly `CliCloud.Dados` é **externo ao repo** (referência DLL). Os campos abaixo foram inferidos pelas propriedades acedidas no código consumidor (`Services/*.cs`).

#### `LOTDIRECT` (cabeçalho — consultas)

Campos visíveis no método `ConvertToHistorico` legado e no save (com tipos prováveis):

`Codigo` (int PK), `C_Utente` (int), `Credencial` (string), `Numlote` (int), `Indice` (int), `Codinst` (int organismo), `Mes` (int), `Ano` (int), `Datainic` / `Datafim` (DateTime), `Isencao` (int), `Tiposerv` (int), `Tipolote` (int), `C_Medico` (int), `Codcons` (int), `Qtcons` (int), `Valcons` (decimal), `Txcons` (decimal), `Prodaplic` (?), `Valtaxas` (decimal), `Subtotal` (decimal), `Valtotal` (decimal), `Taxalinhas` (decimal), `C_Proveni` (int), `QuantC` / `QuantK` (decimal), `Totalc` / `Totalk` (decimal), `Codconsfinal` / `Qtconsfinal` / `Txconsfinal` / `Valconsfinal` (campos espelho usados em correção), `Tiposrvecg`, `Tserv`, `Cservico`, `Credencialexterna` (bool), `Procedefetuado` (bool), `Historico` (int), `C_Extramed`, `AreaPrestacao`, `Hospital`, `Pic`, `IdUtilizador` (audit).

#### `LOTDIRECTLst` (DTO de listagem)

Subconjunto + flags computados: `Utente` (nome), `Organismo` (sigla/nome), `NomeServico`, `NomeTipoLote`, `UrlRelatorio`, `PartilharRelatorio` (bool), `RelatorioComunicadoSemRequisicao` (bool), `Erros` (string).

#### `LINDIRECT` (linhas de serviço — consultas)

Acedidos no save (`LotdirectEdtSave`): `Codigo` (FK LOTDIRECT), `Cservico`, `Codsubsis` (string subsistema), `Nome`, `Quantidade`, `QuantC` / `QuantK`, valores monetários (`ValorUnitario`, `ValorUtente`, `ValorInstituicao` ou semelhantes).

#### `LINDIRECT_789` (linhas ENP — exames não prescritos efetuados)

Mesma estrutura que `LINDIRECT` mas semanticamente distinta: representa exames que **não constam da prescrição original** mas foram efetuados. Origina-se do payload JSON `examesNaoPrescritosEfetuados` (não do `servicos`). Persistida em **tabela separada** (`LINDIRECT_789.Delete(codigo)` + `LINDIRECT_789.GuardarOrUpdate(linha)` — ver `Services/LancamentoCredenciais.cs:1085-1171`).

#### `LOTES` / `LOTESP` (agregados — consultas)

Cabeçalho-agregado por lote/mês. Atualizado dentro de `LotdirectEdtSave` para refletir totais de quantidade e valor. `TIPOLOTES.Valor == 97` identifica lote especial para exames sem papel.

#### `LOTDIRECTFISIO` / `LOTDIRECTFISIOLst` / `HIST_LOTDIRECTFISIO`

Mesmos campos que `LOTDIRECT` **mais**:

- **`ValidadeCredencial`** (DateTime) — exclusivo fisio
- Flags lista: **`Assinado`** (bool), **`RelatorioComunicado`** (bool), **`Suspenso`** (bool)

`HIST_LOTDIRECTFISIO` é uma **cópia separada** com todos os campos do `LOTDIRECTFISIO` (`ConvertToHistorico` em `Services/Tratamentos/LancamentoCredenciais.cs:2327-2369` lista os 35 campos copiados explicitamente).

#### `LINDIRECTFISIO`

Linhas de tratamentos para o lote fisio. **Não tem equivalente da tabela `_789`** (a noção de "ENP" só existe em consultas).

#### `LOTESPFISIO`

Lote especial para exames sem papel originados de credenciais fisio. Análogo a `LOTESP` mas distinto.

#### `RequisicoesESP` / `RequisicoesESPLinha` / `RequisicoesESPLst`

Cabeçalho de requisição de exame sem papel + linhas + DTO de listagem. Campos lista expostos em `ExamesSemPapelLst`:

`Codigo`, `NumeroRequisicao`, `CodUtente`, `NomeUtente`, `Estado` (enum), `Area`, `Lotes` (referência cruzada lotes consultas/fisio), `UrlRelatorio`, `RelatorioComunicado`, pins, flags PNP, ano/mês faturação.

`HIST_RequisicoesESP` (inferido) — histórico via `RequisicoesESP.UpdateParaHistorico(credencial)` e `RequisicoesESP.UpdateParaAtivo(credencial)`.

### 11.5 Crystal Reports usados (substituir no novo)

#### Consultas (`LancamentoCredenciaisLst.js` + `LancamentoCredenciaisEdt.js`)

`Reports/Consultas/`:

- `ListagemLancamentoCredenciaisConsultasEtiquetaP1.rpt` (+ variante `EtiquetaP1NIF`)
- `ListagemLancamentoCredenciaisConsultasCodigo.rpt`
- `LancamentoCredenciaisEtiquetasP1Impressora.rpt` (+ variante NIF)
- `ListagemLancamentoCredenciaisConsultasCentroDiscriminado.rpt`
- `ListagemLancamentoCredenciaisConsultasCentroQuantidade.rpt`
- `ListagemLancamentoCredenciaisConsultasMedico.rpt` (+ `MedicoExterno.rpt`)
- `RelatorioExameSemPapelLancamentoConsulta.rpt`
- `RelatorioExameSemPapelGeralLancamentoConsulta.rpt`
- `CredenciaisEmFaltaConsulta.rpt` (no Edt)

#### Tratamentos (`LancamentoCredenciaisLst.js` + `.Edt.js`)

`Reports/Tratamentos/`:

- `ListagemLancamentoCredenciaisTratamentos{Codigo,Medico,MedicoExterno,CentroDiscriminado,CentroQuantidade}.rpt`
- `…Tratamentos{EtiquetaP1,NIF,AnexoCredencial,CredencialP1}.rpt`
- `ListagemLancamentoCredenciaisCredenciaisEmFalta.rpt`
- `ListagemLancamentoCredenciaisAtosMedicosEtiqueta.rpt`
- `RelatorioExameSemPapelLancamentoTratamento*.rpt`

#### Exames Sem Papel

`Reports/Consultas/RelatorioExameSemPapel.rpt`, `RelatorioExameSemPapelGeral.rpt`, `Reports/Consultas/ListagemRequisicoesForaValidade.rpt`.

> **Decisão pendente** (Onda 4): motor de relatórios. Replicar **todos** os `.rpt` acima é obrigatório para paridade — cada um corresponde a uma listagem operacional do dia-a-dia.

### 11.6 Integrações SNS / ACSS (legado)

- **Cliente WCF**: `Globalsoft.ACSS.WSClient` (referenciado em `ExamesSemPapel.cs`).
- **Endpoints principais usados** (inferidos pelos nomes dos métodos):
  - Cativar requisição por número (`ExamesSemPapelCativarPorNumRequisicao`)
  - Comunicar agendamento (`ExamesSemPapelComunicaAgendamento`)
  - Verificar PIN do utente para prestação (`ExamesSemPapelVerificaPinPrestacao`)
  - Comunicar efetivação / Anular efetivação (`ExamesSemPapelComunicaEfetivacao` / `Anula…`)
  - Assinar requisição (`ExamesSemPapelAssinarRequisicao`)
  - Comunicar relatório (`ExamesSemPapelComunicaRelatorio`)
  - Entrega de requisição ao SNS (`ExamesSemPapelEntregaRequisicaoSns`)
- **PDF**: pipeline de encriptação/desencriptação local antes de enviar.
- **Taxas moderadoras**: registo/anulação/consulta integrados.

### 11.7 Estado atual do projeto **novo**

#### Backend

**Controller existente**:

```15:48:Backend/CliCloud.WebApi/Controllers/Credenciais/LoteDirectController.cs
public class LoteDirectController(ILoteDirectService service) : ControllerBase
{
    [HttpPost("paginated")]     // GetPaginated
    [HttpGet("{id:guid}")]      // GetById
    [HttpPost]                  // Create
    [HttpPut("{id:guid}")]      // Update
    [HttpDelete("{id:guid}")]   // Delete
    [HttpPost("corrigir-lotes")] // CorrigirLotes
    [HttpGet("tipos-lote/light")] // GetTiposLoteLight
}
```

**ExamesSemPapelService** — 6 métodos (`IExamesSemPapelService.cs:8-14`):

`ObterContextoAsync`, `ObterTabelaAsync`, `GuardarAssinaturaSessaoAsync`, `LimparAssinaturaSessaoAsync`, `AssinarLoteAsync`, `ComunicarLoteAsync`.

**Entidades existentes** em `Backend/CliCloud.Domain/Entities/Credenciais/`:

- `LoteDirect.cs` (cabeçalho — só consultas; ver matriz 11.8)
- `LoteDirectLinha.cs` (linhas normais)
- `LoteDirectLinha789.cs` (linhas ENP — mesma shape que `LoteDirectLinha`)
- `LoteDirectAgregado.cs` (agregado equivalente a `LOTESP`/`LOTES`)
- `LoteDirectDetalhe.cs`
- `TipoLote.cs`

**Entidades ESP** em `Backend/CliCloud.Domain/Entities/Consultas/`:

- `ExamesSemPapelOperacao.cs`
- `ExamesSemPapelAssinaturaSessao.cs`

> **Não existem**: `LoteDirectFisio`, `LoteDirectLinhaFisio`, `LoteDirectFisioHistorico`, equivalente próprio a `LOTESPFISIO`. Não existe `RequisicaoESP` como entidade dedicada (o `ExamesSemPapelOperacao` parece ser registo de operações, não a requisição em si).

#### Frontend

**Páginas** em `Frontend/src/pages/area-administrativa/credenciais/`:

- `pages/listagem-lote-direct-page.tsx` — lista global (consultas + ?)
- `pages/novo-lote-direct-page.tsx` — criar/editar
- `components/listagem-lote-direct-table.tsx` (`FilterControls={() => null}` — **filtros ricos por implementar**)
- `components/listagem-lote-direct-table.columns.tsx` — colunas: credencial, código utente, utente, mês/ano, nº lote, organismo, valor taxas, valor total, tipo serviço, tipo lote, ações
- `modals/CorrigirLotesModal.tsx`
- `queries/listagem-lote-direct-queries.ts` (usa permissão `credenciaisLancamentoConsultas` / `historicoCredenciaisLancamento` / `consultas`)

**Toolbar** (`listagem-lote-direct-page.tsx:101-144`):

- ✅ Corrigir Lotes
- ✅ Adicionar
- ❌ **Listagens** — botão presente com `onClick: () => {}` (não implementado — bloqueia paridade com os 14+ Crystal Reports)
- ✅ Histórico (toggle filtro)
- ✅ Atualizar

**Serviços**: `Frontend/src/lib/services/credenciais/lote-direct-service/`.
**DTOs**: `Frontend/src/types/dtos/credenciais/`.

### 11.8 Matriz **`LOTDIRECT` legado ⇄ `LoteDirect` novo** (campo a campo)

| Legado | Novo | Estado | Notas |
|--------|------|--------|-------|
| `Codigo` (int PK) | `Id` (Guid PK) | ⚠️ | Tipo diferente; OK para sistema novo, mas integração com legado SNS pode exigir mapping |
| `C_Utente` | `UtenteId` (Guid FK) | ✅ | Conceito igual |
| `Credencial` | `Credencial` | ✅ | |
| `Numlote` | `NumeroLote` | ✅ | |
| `Indice` | `IndiceLote` | ✅ | |
| `Codinst` | `CodigoOrganismo` | ✅ | |
| `Mes` / `Ano` | `Mes` / `Ano` | ✅ | |
| `Datainic` / `Datafim` | `DataInicio` / `DataFim` | ✅ | |
| `Isencao` | `Isencao` | ✅ | |
| `Tiposerv` | `TipoServico` + nav `TipoServicoRegistoId` | ✅ + ✨ | Novo introduz `TipoServicoRegistoId` (Guid → entidade rica) |
| `Tipolote` | `TipoLote` (int) | ✅ | Existe entidade `TipoLote` para lookup |
| `Valtaxas` / `Valtotal` / `Subtotal` | `ValorTaxas` / `ValorTotal` / `Subtotal` | ✅ | |
| — | `ValorTotalV2` / `ValorTotalV3` | ✨ | **Extras do novo** — investigar se mapeiam a `Totalc/Totalk`/correção |
| `Taxalinhas` | `ValorTaxasLinhas` | ✅ | |
| `Historico` (int) | `Historico` (bool) | ⚠️ | Legado pode ter mais estados que true/false — confirmar |
| `Codcons` | `CodigoServicoConsulta` + `ServicoConsultaId` | ✅ + ✨ | |
| `Qtcons` | `QuantidadeConsulta` | ✅ | |
| `Valcons` | `ValorConsulta` | ✅ | |
| `Txcons` | `TaxaConsulta` | ✅ | |
| `C_Medico` | `MedicoId` (Guid) + `CodigoMedico` (string) | ✅ | |
| `C_Extramed` | `MedicoExternoId` | ✅ | |
| `Cservico` | `ServicoConsulta` (string) + nav `ServicoConsultaRegisto` | ✅ | |
| `Codsubsis` consulta | `CodigoSubsistemaConsulta` | ✅ | |
| `Procedefetuado` | `ProcedimentosEfetuados` | ✅ | |
| `Credencialexterna` | `CredencialExterna` | ✅ | |
| `C_Proveni` | `Proveniencia` (string) | ⚠️ | Legado provavelmente int (FK); novo string livre — perda de FK |
| `Hospital` | — | ❌ | **Em falta** |
| `Pic` | — | ❌ | **Em falta** (semântica desconhecida — investigar) |
| `Prodaplic` | — | ❌ | **Em falta** |
| `QuantC` / `QuantK` (cab) | — | ❌ | **Em falta** (existem campos de quantidade nas linhas, mas o cab agregado tinha estas colunas) |
| `Totalc` / `Totalk` (cab) | — | ❌ | **Em falta** |
| `Codconsfinal` / `Qtconsfinal` / `Txconsfinal` / `Valconsfinal` | — | ❌ | **Em falta** (campos espelho da correção de lotes — investigar se `corrigir-lotes` novo precisa deles) |
| `Tiposrvecg` / `Tserv` | — | ❌ | **Em falta** |
| `AreaPrestacao` | — | ❌ | **Em falta** |

**Linhas — `LINDIRECT` vs `LoteDirectLinha`**:

| Legado | Novo | Estado |
|--------|------|--------|
| `Codigo` (FK) + `Cservico` + `Codsubsis` + `Nome` + `Quantidade` + `QuantC/K` + `ValorUnitario` + valores | `LoteDirectId` + `ServicoId` (FK Guid) + `Quantidade` + `ValorUnitario` + `ValorUtenteOriginal` + `ValorInstituicaoOriginal` + `ValorUtente` + `ValorInstituicao` | ⚠️ |

> Novo é **mais estruturado** (linha aponta para entidade `Servico` em vez de duplicar nome/código). Possíveis **gaps**: `Codsubsis` por linha (linha pode ter subsistema diferente do cabeçalho?), `QuantC/K` por linha.

**Linhas ENP — `LINDIRECT_789` vs `LoteDirectLinha789`**:

✅ Mesma estrutura semântica. Confirmado pelo executor de correção:

```64:90:Backend/CliCloud.Infrastructure/Persistence/Credenciais/LoteDirectCorrecaoLotesExecutor.cs
List<LoteDirectLinha789> linhas789 = await dbContext.Set<LoteDirectLinha789>()...
foreach (LoteDirectLinha789 linha in linhas789.Where(x => x.LoteDirectId == cab.Id))
```

E pelo AutoMapper:

```2233:2244:Backend/CliCloud.Infrastructure/Mapper/MappingProfiles.cs
_ = CreateMap<...CreateLoteDirectRequest, LoteDirect>()
    .ForMember(d => d.Linhas, o => o.Ignore())
    .ForMember(d => d.Linhas789, o => o.Ignore())
```

### 11.9 Matriz **`LOTDIRECTFISIO` legado ⇄ novo** (**ausente — entidade por criar**)

| Legado | Novo | Estado |
|--------|------|--------|
| Tudo de `LOTDIRECT` | `LoteDirect` (igual ao 11.8) | — |
| **`ValidadeCredencial`** (DateTime) | — | ❌ exclusivo fisio |
| **`Assinado`** (bool) | — | ❌ |
| **`RelatorioComunicado`** (bool) | — | ❌ |
| **`Suspenso`** (bool) | — | ❌ |
| Pre-listagem `LOTDIRECTFISIO.SuspenderCredenciaisTratamentosSuspensos()` | — | ❌ (regra de negócio inteira em falta) |
| `LINDIRECTFISIO` | — | ❌ (tabela paralela em falta) |
| `HIST_LOTDIRECTFISIO` | — | ❌ (tabela histórico fisio em falta) |
| `LOTESPFISIO` | — | ❌ (agregação ESP-fisio em falta) |
| `TransferenciaHistoricoLancamentoCredenciaisByMesAno` (massivo) | — | ❌ |
| `passarLancamentoCredenciaisParaAtivoTratamento` | — | ❌ |
| `LancamentoCredenciaisCorrigirLotes` (variante fisio) | parcial via `LoteDirectController/corrigir-lotes` | ⚠️ (executor não distingue fisio vs consultas) |

**Conclusão**: para paridade **é obrigatório criar um conjunto paralelo de entidades/services/controllers fisio** (não basta estender `LoteDirect`). Razões:

1. Tabelas legadas são fisicamente separadas (`LOTDIRECT` vs `LOTDIRECTFISIO`, idem para linhas e histórico).
2. Permissões diferem (`Consul_LancCredenciais` vs `Tratamentos_LancCred`).
3. Lista de colunas e ações diferem (Suspenso, Assinado, ValidadeCredencial não cabem na lista consultas).
4. Lotes especiais distintos (`LOTESP` vs `LOTESPFISIO`).

### 11.10 Matriz **Exames Sem Papel** — funcional

| Operação legada | Estado novo | Observação |
|------------------|-------------|------------|
| Lista com 12+ filtros (`ExamesSemPapelLst`) | ⚠️ parcial | `ObterTabelaAsync` existe; filtros completos por confirmar |
| Lista vista pelo médico (`ExamesSemPapelMedicoLst`) | ❌ ausente | Permissão `PClinico_ExamesSemPapel` distinta |
| Histórico via `?historico=1` | ❌ ausente | Implementar filtro lista |
| Edição (`ExamesSemPapelEdtLoad`) | ❌ ausente | |
| Cativar requisição | ❌ ausente | |
| Agendamento SNS (Comunicar / Cancelar) | ❌ ausente | |
| Efetivação SNS (Comunicar / Anular / Verificar PIN) | ❌ ausente | |
| Validação de organismo/serviços | ❌ ausente | |
| ENP (adicionar / anular efetuados não prescritos) | ❌ ausente | |
| Taxas moderadoras (registar / anular / consultar) | ❌ ausente | |
| **Assinar lote** | ✅ existe (`AssinarLoteAsync`) | Comparar implementação interna com legado |
| **Comunicar lote** | ✅ existe (`ComunicarLoteAsync`) | Idem |
| Associar / comunicar relatório (com e sem requisição) | ❌ ausente | |
| Apagar Guid relatório | ❌ ausente | |
| Partilha / remoção estado validação | ❌ ausente | |
| Apagar lógico (`Del Apagado`) | ❌ ausente | |
| Diagnóstico erros comunicação | ❌ ausente | |
| Transferência para histórico | ❌ ausente | |
| Entrega SNS | ❌ ausente | |
| PDF encrypted / decrypted | ❌ ausente | |

> **6 endpoints novos vs ≈50 legados.** A área de Exames Sem Papel está **muito incompleta** e a sua implementação integral envolve **integração SOAP com ACSS/SPMS** (decisão arquitetural maior).

### 11.11 Plano de paridade — Credenciais SNS

#### Fase 1 — completar `LoteDirect` (consultas) para paridade total

| # | Tarefa | Backend | Frontend |
|---|--------|---------|----------|
| 1.1 | Adicionar campos em falta a `LoteDirect`: `Hospital`, `Pic`, `Prodaplic`, `QuantC`, `QuantK`, `Totalc`, `Totalk`, `CodConsFinal`, `QtdeConsFinal`, `TaxaConsFinal`, `ValorConsFinal`, `TipoServicoEcg`, `TipoServico2`, `AreaPrestacao`. | E `LoteDirect.cs` + migration EF | E DTOs Create/Update/Get; AutoMapper |
| 1.2 | Confirmar/preencher correção de lotes — usar `*ConsFinal` para guardar valores corrigidos vs originais | E `LoteDirectCorrecaoLotesExecutor.cs` | — |
| 1.3 | Adicionar filtros ricos à listagem (paridade `LancamentoCredenciaisLst.js:7-16`): nome, código utente, número lote, organismo, intervalo mês/ano, **intervalo histórico de/até** | E `LoteDirectTableFilter` + spec | E `listagem-lote-direct-filter-controls.tsx` (atualmente `() => null`) |
| 1.4 | Implementar botão **Listagens** com seletor de Crystal Reports → endpoints (depende de Onda 4 motor relatórios) | C `LoteDirectController/listagem/{tipo}` | E `listagem-lote-direct-page.tsx:129-132` |
| 1.5 | Implementar passar para histórico / passar para ativo (por código, por mês/ano) | C 2 endpoints + service methods | E botões na lista |
| 1.6 | Sincronizar `RequisicoesESP` (futuro) ao mover para histórico (paridade `passarLancamentoCredenciaisParaHistorico`) | C | — |
| 1.7 | Verificar duplicação de credencial antes de gravar (paridade `LotdirectEdtVerificaCredencial`) | E `CreateLoteDirectAsync` adicionar spec `LoteDirectMatchCredencial` | E mostrar erro no modal |

#### Fase 2 — criar **`LoteDirectFisio`** paralelo (tratamentos)

| # | Tarefa | Backend | Frontend |
|---|--------|---------|----------|
| 2.1 | Criar entidade `LoteDirectFisio.cs` (copy de `LoteDirect.cs` + `ValidadeCredencial`, `Assinado`, `RelatorioComunicado`, `Suspenso`) | C | — |
| 2.2 | Criar `LoteDirectFisioLinha.cs` (paralelo a `LoteDirectLinha`, sem 789) | C | — |
| 2.3 | Criar `LoteDirectFisioAgregado.cs` (paralelo a `LoteDirectAgregado`, equivalente a `LOTESPFISIO`) | C | — |
| 2.4 | Migration EF `Add_Credenciais_LoteDirectFisio` | C | — |
| 2.5 | `ILoteDirectFisioService` + impl: paginated, get, create, update, delete, corrigir lotes, transferência para histórico (massiva + individual), reativar, suspender por tratamento suspenso | C | — |
| 2.6 | `LoteDirectFisioController` em `Backend/CliCloud.WebApi/Controllers/Credenciais/` | C | — |
| 2.7 | Job/pré-handler que executa `SuspenderCredenciaisTratamentosSuspensos` antes de cada listagem | C `LoteDirectFisioService.GetPaginatedAsync` | — |
| 2.8 | Página listagem `/area-administrativa/tratamentos/credenciais` | — | C `listagem-lote-direct-fisio-page.tsx` + table/columns/filters/queries |
| 2.9 | Página criar/editar `/area-administrativa/tratamentos/credenciais/novo` (com `validadeCredencial`) | — | C `novo-lote-direct-fisio-page.tsx` |
| 2.10 | Permissão `credenciaisLancamentoTratamentos` em `area-administrativa-module.ts` | — | E |
| 2.11 | Entrada de menu **Tratamentos → Credenciais S.N.S. → Lançamento de Credenciais** | — | E `menu-items.ts` |

#### Fase 3 — Exames Sem Papel (paridade plena)

> **Decisão prévia obrigatória**: integração ACSS/SPMS. O novo `ExamesSemPapelService` só tem 6 métodos; o legado tem ≈50 incluindo comunicação SOAP. A escolha do cliente SOAP/WCF (`Globalsoft.ACSS.WSClient` no legado) deve ser tomada antes de avançar.

| Sub-fase | Conteúdo |
|----------|----------|
| 3.A — Modelo | Criar entidades `RequisicaoESP`, `RequisicaoESPLinha`, `HistRequisicaoESP` em `Backend/CliCloud.Domain/Entities/Consultas/`. Migration EF. |
| 3.B — Operações offline | Cativar, validar organismo/serviços, ENP add/remover, taxas moderadoras CRUD, edição completa, apagar lógico, transferência histórico. |
| 3.C — Cliente SOAP ACSS | Criar `IAcssClient` em `Backend/CliCloud.Infrastructure/Integrations/Acss/` com endpoints `ComunicarAgendamento`, `CancelarAgendamento`, `VerificarPin`, `ComunicarEfetivacao`, `AnularEfetivacao`, `Assinar`, `ComunicarRelatorio`, `EntregaRequisicao`. |
| 3.D — Lista filtros completos | Estender `ObterTabelaAsync` com os 12+ filtros legado e suporte `historico=true`. |
| 3.E — Página médico | `ExamesSemPapelMedicoLst` paridade — página/rota distinta com permissão `PClinico_ExamesSemPapel`. |
| 3.F — Histórico | Toggle na mesma página (paridade `?historico=1`). |
| 3.G — Frontend | Migrar `/area-clinica/processo-clinico/exames/exames-sem-papel-page.tsx` para `area-administrativa/consultas/exames-sem-papel/...` (paridade local de rota) **ou** criar atalho duplo (manter ambas). |

#### Fase 4 — Crystal Reports (depende Onda 4)

Substituir os 14+ `.rpt` listados em 11.5 por endpoints `RelatoriosController` com seleção de motor (QuestPDF/ClosedXML/Stimulsoft/RDLC).

### 11.12 Permissões legadas a mapear no `Funcionalidades` novo

| Legado | Novo (proposto em `area-administrativa-module.ts`) | Já existe? |
|--------|----------------------------------------------------|-----------|
| `Consul_LancCredenciais` | `credenciaisLancamentoConsultas` | ✅ |
| `Tratamentos_LancCred` | `credenciaisLancamentoTratamentos` | ⚠️ a confirmar — adicionar se em falta |
| `Consul_ExamesSemPapel` | `credenciaisExamesSemPapel` (área-admin) ou `examesSemPapel` (área-clínica) | ⚠️ a confirmar |
| `PClinico_ExamesSemPapel` | `examesSemPapelMedico` (área-clínica) | ⚠️ a confirmar |

### 11.13 Riscos e decisões pendentes

1. **Strategy `LOTDIRECTFISIO`**: criar entidade separada (Fase 2 acima) **vs** estender `LoteDirect` com `Discriminator` ou flag `Tipo` (consultas/fisio). Recomendação para paridade estrita: **entidade separada** (preserva separação de permissões, listagens, histórico e tabelas).
2. **Integração ACSS**: bloqueia Fase 3.C. Decidir cedo.
3. **Sincronização Histórico ↔ RequisicoesESP**: o legado sincroniza estado entre lote e requisição. Garantir que o novo `RequisicaoESP` (quando existir) replica este vínculo bidireccional.
4. **Bug copy-paste `Tratamentos_LancCred` em `WSConsultas.passarLancamentoCredenciaisParaHistorico`**: replicar tal-qual no novo gera o mesmo bug; recomenda-se **corrigir** no novo para `credenciaisLancamentoConsultas`.
5. **Gap segurança `LancamentoCredenciaisCorrigirLotes`** (sem gate de funcionalidade no legado): adicionar no novo (`[Authorize]` + verificação de permissão `credenciaisLancamentoConsultas`/`...Tratamentos`).
6. **Crystal Reports** (Onda 4): cada `.rpt` é uma listagem operacional usada no dia-a-dia — não substituir é **regressão funcional**.

---

*Última atualização: 2026-05-14 (rev. 3) — auditoria crítica completa. Mudanças nesta revisão:*

- *Matriz 7 corrigida com evidência direta dos ficheiros legado/novo:*
  - *7.1: linhas `Acor_Ins` (não é renomeação — evolução com Subsistema) e `Doenças` (mudança intencional CID-9 → ICD-11) com notas explícitas; `Salas` movida para indicar subset incompleto vs Modalidades legado; `TIPOS_CONSULTA` indicado como sem `Codigo` no novo*
  - *7.2: `Credenciais fisio` reabaixada de ✅/⚠️ para **❌** (novo `LoteDirect` só cobre `LOTDIRECT`, não `LOTDIRECTFISIO`)*
  - *7.3: `CentrosUnidadesLst` reabaixada para ❌ (conceito diferente de `CentroSaude`)*
  - *7.4: `Salas` modalidades indicada como subset incompleto da entidade `Sala` consultas*
- *Nova secção 7.6: lista 7 erros do **modelo novo** a corrigir para paridade real (campos em falta em `Sala` e `TipoConsultaItem`, entidade `LoteDirectFisio` por criar, typo `Periocidade`, dimensão extra em `SubsistemaServico` vs `Acor_Ins`, conceito `CentrosUnidades` em falta, mudança intencional CID-9 → ICD-11)*
- *Secção 8 reescrita conforme decisões do utilizador:*
  - *8.1: Utentes/Organismos no header admin **sem criar permissões novas** (usar `Comuns_Utentes` / `Comuns_Organismos` do módulo área comum); **Fornecedores e Funcionários removidos** do submenu Entidades admin (paridade estrita).*
  - *8.2: `CreateTipoConsulta` agora **inclui campo `Codigo`** (com migration EF e validators atualizados).*
  - *8.3: Página Periodicidade movida para `/area-administrativa/tratamentos/tabelas/periodicidades` (paridade com legado); typo `Periocidade` mantido internamente mas **label "Periodicidade"** na UI.*
  - *8.4: hubs com cards descartados; rotas `Tratamentos`/`Modalidades` ficam como placeholder vazio (paridade — legado não tem dashboard intermédio).*
- *Onda 3 (9.2): mantém **4 páginas separadas** (não tabs) — paridade com `HistoricoDatasLst`/`UtentesLst`/`MedicosLst`/`OrganismosLst` legados.*
- *Onda 6 (9.5): retirada opção "descopar" Modalidades; objetivo é replicar tal-qual com labels exatos do legado (`Lista Diária`, `Inscrições`).*
- *Adicionada **secção 11** com auditoria detalhada **Credenciais SNS** (inventário menu, ASPX/JS, ASMX, entidades, Crystal Reports, integrações ACSS, matrizes campo-a-campo, plano de paridade em 4 fases, decisões pendentes).*
