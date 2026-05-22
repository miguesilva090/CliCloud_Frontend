# Paridade — Consultas › Marcações (legado vs novo)

**Âmbito:** `CliCloud.ASPcli` › Área Administrativa › Consultas › **Marcações** ↔ projeto novo `Frontend` + `Backend`.  
**Data:** 2026-05-21  
**Legenda:** ✅ paridade aceitável · ⚠️ parcial · ❌ em falta · 🔵 **diferença propositada**

**Documentos:** inventário legado em [`auditoria-marcacoes-legado-vs-novo.md`](./auditoria-marcacoes-legado-vs-novo.md).  
**Plano de implementação:** [`plano-implementacao-consultas-marcacoes.md`](./plano-implementacao-consultas-marcacoes.md) (inclui apuramento ESP).  
**Checklist:** [`consultas-marcacoes-pendente.md`](./consultas-marcacoes-pendente.md).

---

## 1. Mapa do menu

| # | Legado (`WSMenus`) | Permissão legado | Novo (rota) | Permissão novo |
|---|-------------------|------------------|-------------|----------------|
| 1 | `MarcacoesLst` ou `MarcacoesGestaoSalasLst` | `Consul_MarcacoesSemanais` | `/area-administrativa/consultas/marcacoes` | `marcacoesAgenda` |
| 2 | `TrocaMarcacoesEntreMedicos` | `Consul_TrocaMarcacoesEntreMedicos` | `.../troca-medicos` | `trocaMarcacoesMedicos` |
| 3 | `OrdemEntradaMarcacoesLst` | `Consul_OrdemEntradaMarcacoes` | `.../ordem-entrada` | `ordemEntradaMarcacoes` |
| 4 | `ListaEsperaLst` | `Consul_ListaEspera` | `.../lista-espera` | `listaEsperaConsultas` |
| 5 | `PedidosConsultaLst` | `Consul_GlobalBooking` | `.../global-booking` | `globalBooking` |

**Condição legado:** se `emp.GestaoSalas` → item 1 usa página por **sala**; senão por **médico**. No novo: só agenda por médico (+ API associar sala).

**Fora deste menu:** Transferência marcações (`TransferenciaMarcacoesLst` — comentado no menu legado); Marcações Tratamentos; agenda **área clínica** (`PClinico_ConsMarca`).

---

## 2. Resumo por submenu

| Submenu | vs legado | Prioridade paridade |
|---------|-----------|---------------------|
| **Agenda** | ⚠️ ~45% calendário; ~70% CRUD | Alta — receção marca aqui |
| **Troca médicos** | ✅ ~95% | Baixa — UAT |
| **Ordem entrada** | ⚠️ ~85% | Média — relatórios / ESP |
| **Lista espera** | ⚠️ ~80% | Média — filtro utente API |
| **GlobalBooking** | ✅ ~90% (UAT fechado) | P2: filtros intervalo, horas 1:1 legado |

---

## 3. Agenda (`MarcacoesLst` / `MarcacoesGestaoSalasLst`)

**Legado:** `Client/Consultas/MarcacoesLst.js` (~4500 linhas), `Services/MarcacoesDiarias.cs`  
**Novo:** `marcacoes-administrativo` + `listagem-marcacoes-administrativo-page.tsx`, `marcacoes-agenda-calendario.tsx`

### 3.1 Funcionalidades

| Funcionalidade | Legado | Novo | Estado |
|----------------|--------|------|--------|
| Calendário semana/dia/mês | FullCalendar `#calendar` | FullCalendar `timeGridWeek` + day/month | ✅ |
| Eventos: consultas (4 tipos cor) | `calendarioMarcacoesMedicoLst` | `POST calendario` + `MarcacoesCalendarioBuilder` | ⚠️ motor simplificado |
| Feriado / folga / indisponível / horário variável / vagas extra | Sim | Sim (cores `marcacoes-agenda-cores.ts`) | ⚠️ regras vagas extra incompletas |
| Botões médico por especialidade | `ConstroiBotoesMedicos` | `marcacoes-agenda-medicos-toolbar` | ✅ |
| Marcar (clique slot) | `openModal` → `MarcacoesSemanaisMarcarConsulta` | Modal create + `POST /` | ✅ |
| Editar (duplo clique) | `AlterarConsultaDuploClique` | Modal edit | ✅ |
| Mover horário (drag) | `MudarHorarioConsulta` | `mudar-horario` | ✅ |
| Desmarcar | `DeleteConsultaCalendario` + motivo | `desmarcar` | ✅ |
| Check vagas | `CheckVagas`, `MaximoValorVaga` | — | ❌ |
| Horário flexível (1ª vs seguinte) | `isHorarioFlexivel`, duração | Parcial no calendário/config | ⚠️ |
| Disponibilidade médicos | `VerificaDisponibilidadeMedicos`, modal | `disponibilidade-medicos-mes` + dialog | ⚠️ |
| `checkHoraConsulta` / próximo slot | Sim | Parcial nas validações create/update | ⚠️ |
| Tabela semanal alternativa | `tableMarcacoesSemanais` | — | ❌ |
| Lista de espera (atalho + no modal) | `goToListaEspera`, checkbox LE | Modal LE + menu header | ✅ |
| Observações utente/marcação | `MarcacoesLstGetObservacoes` | Obs no modal + admissão | ⚠️ |
| SMS em lote | `modalEnvioSMS` | `marcacoes-envio-sms-modal` | ✅ |
| SMS ao marcar/alterar/apagar | Automático templates 6.x | Manual / parcial | ❌ |
| Email ao marcar | Checkbox `envioEmail` | — | ❌ |
| Exames sem papel no modal | `goToExamesSemPapel` | Módulo existe noutra rota admin | ❌ no modal agenda |
| Relatórios toolbar | Vários Crystal/listagens | Export **CSV** apenas | 🔵 CSV em vez de Crystal |
| Transferir marcação | JS `TransferirMarcacao` (muito comentado) | — | ❌ (menu transferência desativado no legado) |
| Deep links URL | `c_utente`, `c_medico`, `c_especial`, `numReq`, … | `numeroUtente`, Guid médico/esp.; `c_medico` int → aviso | ⚠️ |
| Sync admissão ao marcar | ADMISS legado | `MarcacaoAdmissaoSyncHelper` | ✅ |
| **Agenda por sala** (`GestaoSalas`) | `calendarioMarcacoesSalaLst` + filtro sala | — | ❌ |
| Associar sala ao slot | Modal sala (gestão salas) | API `associar-sala`; modal **não ligado** na página | ⚠️ BE ✅ / FE ❌ |

### 3.2 Toolbar legado vs novo

| Legado | Novo |
|--------|------|
| Check vagas, Desmarcar dia, Enviar SMS, LE, Obs, Relatórios (dropdown) | Voltar, Atualizar, Disponibilidade, SMS, Desmarcar (evento selecionado), Listagens→CSV |
| — | 🔵 Troca / OE / LE / GB só no **header** Marcações (não na toolbar agenda) |

### 3.3 APIs legado (`MarcacoesDiarias.cs`) vs novo

| Legado (amostra) | Novo |
|------------------|------|
| `calendarioMarcacoesMedicoLst` | `POST calendario` |
| `calendarioMarcacoesSalaLst` | — |
| `MarcacoesSemanaisMarcarConsulta` | `POST /` |
| `AlterarConsultaDuploClique` | `PUT /{id}` |
| `DeleteConsultaCalendario` | `POST desmarcar` |
| `CheckVagas` / `MaximoValorVaga` | — |
| `obterHorariosPossiveisMedicoPorDia` | Parcial |
| `GetDiasFolgaClinica` | Incluído no builder calendário |
| `MarcacoesDiariasLst` (listagem diária) | `POST paginated` (lista separada no mesmo ecrã) |

---

## 4. Troca entre médicos (`TrocaMarcacoesEntreMedicos`)

| Aspeto | Legado | Novo | Estado |
|--------|--------|------|--------|
| Médico/data origem e destino | Modal única | Página form + preview | 🔵 UX página vs modal |
| API | `TrocaMarcacoesEntreMedicos2` (`Admissoes.cs`) | `troca-medicos/preview` + `executar` | ✅ |
| Permissão | Menu `Consul_TrocaMarcacoesEntreMedicos`; API usa `Consul_TransferenciaMarcacoes` | `trocaMarcacoesMedicos` | 🔵 novo alinhado ao menu |
| Atualiza admissões ligadas | Sim (transação legado) | Sim (`ConsultaMarcacao` + `Admissao`) | ✅ |

---

## 5. Ordem de entrada (`OrdemEntradaMarcacoesLst`)

| Aspeto | Legado | Novo | Estado |
|--------|--------|------|--------|
| Listagem ADMISS do dia | `OrdemEntradaMarcacoesLst` | `ordem-entrada/paginated` | ✅ |
| Filtros utente/médico/esp./data de-até | GSLst | Painel + pesquisa global | ✅ |
| Modo consultas desmarcadas | `historico=1` | `incluirHistorico` | ✅ |
| Ações linha (ativas) | Obs | Obs + ver/editar | ✅ |
| Ações linha (desmarcadas) | Ver, editar, imprimir, apagar, obs | Ver, editar, desmarcar, obs | ⚠️ sem imprimir |
| Adicionar | `modalRegisto` | `AdmissaoViewEditModal` create | ✅ |
| Fila presente / ordem / chegada | Implícito no fluxo legado | Colunas + confirmar / definir ordem / anular | 🔵 **extensão receção** (melhoria) |
| Relatórios toolbar | Por data, utente, médico | — | 🔵 **fora de âmbito** (pedido projeto) |
| Coluna utilizador | `utilizador` | — | ❌ |
| `checkHoraConsultaOrdemMarcacoes` | Sim | — | ❌ |
| ESP / `RequisicoesESP` na anulação | `OrdemEntradaMarcacoesDel` | Anular ordem genérico | ❌ |
| Abrir agenda após gravar | Redirect `MarcacoesLst.aspx` + params | Converter LE / links manuais | ⚠️ |

---

## 6. Lista de espera (`ListaEsperaLst` / `ListaEsperaEdt`)

| Aspeto | Legado | Novo | Estado |
|--------|--------|------|--------|
| CRUD | Frame Edt + Lst | Modal view/edit na mesma SPA | 🔵 sem frame ASP |
| Colunas grelha | Utente, tel, médico, esp., data, organismo, prioridade, hora | Alinhadas | ✅ |
| Filtro código LE | `codigo` | — | ❌ |
| Filtro utente | `c_utente` | UI `utenteId` **não enviado** na query | ❌ bug FE |
| Filtro prioridade de-até | Sim | `prioridadeId` único | ⚠️ |
| Relatórios | Utente, prioridade, especialidade | — | 🔵 fora de âmbito |
| Converter → marcação + admissão | Sim | `converter-marcacao` + sync | ✅ |
| Obs | `ListaEsperaGetObservacoes` | `observacoes` GET/POST | ✅ |
| Integração agenda | `postMessage` + `ListaEsperaDel` ao marcar | Menu + converter modal → agenda | ✅ |
| Dados | `LISTAESPERACONSATEND` | `Consultas.ListaEsperaConsulta` | ⚠️ migração dados |

---

## 7. GlobalBooking (`PedidosConsultaLst`)

| Aspeto | Legado | Novo | Estado |
|--------|--------|------|--------|
| Grelha pedidos | `PedidosConsultaLst` | `pedidos-consulta-administrativo/paginated` | ✅ |
| BD | `dbo.PedidosConsulta` | `Consultas.PedidoConsulta` | 🔵 schema novo; **migrar dados** |
| Filtros rápidos Estado/Email/SMS | Botões → filtros booleanos | BE suporta; **FE vazio** | ❌ |
| Colunas estado (Agendado, Recusado, flags email/SMS) | Bits na grelha | Colunas principais | ⚠️ |
| Marcar consulta | `modalAgendar` → `PedidosConsultaGuardarConsulta` | `global-booking-agendar-modal` | ✅ |
| Criar utente / candidatos | `PedidosConsultaAddUtente`, `GetUtentes` | `criar-utente`, `utentes-candidatos` | ✅ |
| Recusar | Flag no modal | `recusado` endpoint | ✅ |
| Download ficheiro | Sim | `ficheiro` | ✅ |
| Email/SMS tipos 1–4 | `PedidosConsultaEnvioEmail/Sms` | `enviar-email`, `enviar-sms` | ✅ |
| Nomes médico/esp. | SQL `MEDICOS` / `ESPECIAL` | `PedidoConsultaLegacyNamesResolver` | ⚠️ depende dbo legado |
| `CodigoAdmissao` int | Preenchido no legado | Não preenchido | ⚠️ |
| Imprimir no agendar | Sim no modal legado | — | ❌ |

---

## 8. Diferenças propositadas (não são bugs)

| # | Diferença | Motivo |
|---|-----------|--------|
| 1 | Stack React + API REST vs WebForms + ASMX | Arquitetura novo projeto |
| 2 | `ConsultaMarcacao` + `Admissao` Guid vs ADMISS/códigos int legado | Modelo de domínio novo |
| 3 | GlobalBooking em `Consultas.PedidoConsulta` vs `dbo.PedidosConsulta` | BD nova; exige migração/sync |
| 4 | Relatórios agenda/OE/LE: **CSV** em vez de Crystal/listagens legado | Âmbito MVP / pedido explícito OE |
| 5 | Ordem entrada: colunas **Presente / Ordem / Chegada** | Extensão receção no novo |
| 6 | Submenus satélite só no **header** Marcações, não na toolbar agenda | UX React / menos duplicação |
| 7 | Troca médicos: **página** em vez de modal iframe | Padrão área administrativa nova |
| 8 | Lista espera: **modal** CRUD vs `ListaEsperaEdt.aspx` em frame | Padrão FE área comum |
| 9 | Permissões: GUIDs `marcacoes*` vs `Consul_*` (mapeamento perfil) | Sistema permissões novo |
| 10 | API Marcações usa muitas vezes perm `consultas` (0089) vs submenu | Padrão atual serviços; GB usa `globalBooking` |
| 11 | Não alterar `MarcacaoConsultaController` (clínico) | Separação admin vs processo clínico |

---

## 9. Apuramento — existe no legado?

Regra: **só implementar no novo** o que (1) **existe e está ativo** no legado neste menu, (2) a receção/clínica **usa no dia-a-dia**, ou (3) é **bug** no novo. O resto fica para v2 ou fica 🔵 propositado.

| Item | No legado ativo? | Decisão fecho módulo |
|------|------------------|----------------------|
| Calendário + CRUD + drag + desmarcar | ✅ `MarcacoesLst` | ✅ **Já feito** |
| Troca médicos | ✅ menu + API | ✅ **Já feito** — só UAT |
| Ordem entrada listagem + fila | ✅ | ✅ **Já feito** |
| LE CRUD + converter | ✅ | ✅ **Já feito** |
| GB listagem + agendar + email/SMS | ✅ | ⚠️ **Fechar** filtros + dados + nomes |
| Check vagas / vagas extra | ✅ botão agenda | **P1** se receção usa; senão v2 |
| Agenda por sala (`GestaoSalas`) | ✅ página à parte | **P1** só clínicas com flag; senão v2 |
| Associar sala (modal) | ✅ gestão salas | **P0** ligar modal FE (API pronta) |
| `checkHoraConsulta` ao marcar | ✅ | **P1** validação mínima |
| Horário flexível completo | ✅ | **P2** pós-fecho |
| Tabela semanal alternativa | ✅ secundária | **Fora** fecho |
| SMS automático marcar/alterar | ✅ | **P2** (SMS manual já existe) |
| Email ao marcar | ✅ checkbox | **P2** |
| Exames sem papel no modal agenda | ✅ atalho | **P2** (módulo ESP noutra rota) |
| Relatórios Crystal agenda/OE/LE | ✅ | **Fora** fecho (🔵 CSV) |
| Transferir marcação | ⚠️ JS/menu desativado | **Fora** fecho |
| Deep link `c_medico` int | ✅ URLs legado | **P1** resolver Guid |
| OE: `checkHoraConsultaOrdem` | ✅ | **P2** |
| OE: ESP na anulação | ✅ clientes ESP | **P1** só se usam ESP |
| OE: imprimir / col. utilizador | ✅ | **P2** / fora |
| LE: filtro utente | ✅ | **P0** bug FE |
| LE: filtro código / prioridade de-até | ✅ | **P2** |
| LE: migração dados | ✅ tabela legado | **P0** se há dados em produção |
| GB: filtros Estado/Email/SMS | ✅ toolbar | **P0** fecho GB |
| GB: migração dados | ✅ dbo | **P0** se usam portal |
| GB: nomes sem dbo | ✅ SQL legado | **P0** fecho GB |
| GB: `CodigoAdmissao` / slots / imprimir | ✅ | **P2** |
| Paridade total `MarcacoesDiarias.cs` | ✅ | **Fora** fecho (evolução contínua agenda) |

---

## 12. Fecho do módulo Marcações — definição e plano

### O que significa «módulo fechado»

Os **5 submenus** do header Marcações utilizáveis em produção, com UAT por perfil, **sem depender do legado** para o fluxo normal da receção. Não exige 100% das ~4500 linhas de `MarcacoesLst.js`.

### Estado por submenu

| Submenu | Fechado? | Falta para fechar |
|---------|----------|-------------------|
| **Troca médicos** | ✅ Sim | UAT |
| **Ordem entrada** | ✅ Sim* | *ESP só se cliente ESP; sem Crystal |
| **Lista espera** | ⚠️ Quase | P0: `utenteId` na API; P0: dados se aplicável |
| **GlobalBooking** | ❌ Não | P0: filtros FE, dados, nomes médico/esp. |
| **Agenda** | ⚠️ Quase | P0: modal sala na UI; P1: vagas/validação horário; P1: agenda por sala **se** `GestaoSalas` |

### P0 universal (qualquer clínica)

1. **LE:** `utenteId` na query FE — BE já expõe `ListaEsperaTableFilter.UtenteId` (bug FE, não feature nova).
2. **UAT** 5 submenus.

### Decisões de negócio (2026-05-21)

| Tema | Decisão |
|------|---------|
| **GlobalBooking** | **Totalidade** — ver checklist em [`consultas-marcacoes-pendente.md`](./consultas-marcacoes-pendente.md) §3 |
| **GestaoSalas** | Config clínica: se ativa → sala **obrigatória** ao marcar + ecrã por sala; se inativa → marcar sem sala. Confirmado legado §2 do pendente |
| **ESP** | Apurado no plano — Sprint 2; cativado/agendado em falta no novo; realizado já existe |

### P0 condicional (agora definido)

| Condição | Itens | Confirmado no legado? |
|----------|-------|------------------------|
| **GlobalBooking** (obrigatório) | Filtros, colunas, horas no modal, dados, nomes, UAT completo | ✅ `PedidosConsultaLst` + `PedidosConsulta.cs` |
| **`GestaoSalas = true`** (por clínica) | Sala obrigatória + calendário por sala + exames→agenda com sala | ✅ `MarcacoesGestaoSalasLst`, `MarcacoesDiarias` «A sala é obrigatória», `ExamesSemPapelLst` |
| **`GestaoSalas = false`** | Sem sala no marcar | ✅ `MarcacoesLst` (sem `modFldSala` no modal) |
| **ESP** (TBD) | `RequisicoesESP` na anulação OE | ✅ legado; novo tem `RequisicaoEspFechoUpdater` parcial |

**Nota:** ligar `MarcacaoAssociarSalaModal` **não** equivale ao legado `GestaoSalas` e **não** é P0 universal — em `MarcacoesLst` (sem gestão salas) a sala aparece sobretudo em relatórios, não no fluxo de marcar.

### P1 — pós-fecho (legado existe; não bloqueia go-live)

1. **Agenda:** subset `CheckVagas` / validações horário (não portar `MarcacoesDiarias.cs` inteiro).
2. **Agenda:** FE usar `GET resolve-medico-legado` (BE já existe).
3. **Agenda:** associar sala pós-marcação (API pronta) como complemento a B4.

### P2 / fora do fecho — backlog v2 (não bloquear go-live)

- Tabela semanal `tableMarcacoesSemanais`
- SMS/email automáticos em cada gravação (manter SMS manual + GB)
- Exames sem papel dentro do modal agenda
- Horário flexível 100%, `obterHorariosPossiveisMedicoPorDia` completo
- GB: `CodigoAdmissao` int, imprimir, slots no modal
- OE: imprimir, coluna utilizador, `checkHoraConsultaOrdem`
- LE: filtro código LE, prioridade de-até
- Transferência marcações (menu legado comentado)
- Réplica integral `MarcacoesDiarias.cs`

### Ordem de execução recomendada (sprints)

```text
Sprint fecho A (bloqueadores):  LE utenteId → GB filtros FE → GB nomes BE → modal sala agenda → UAT smoke
Sprint fecho B (dados GB/LE):   migração/sync BD → UAT GlobalBooking com dados reais
Sprint fecho C (se cliente):    GestaoSalas OU CheckVagas + validação horário + ESP OE
```

### Critério de aceitação go-live Marcações

- [ ] Utilizador com `marcacoesAgenda` marca, edita, desmarca e move no calendário.
- [ ] `trocaMarcacoesMedicos` executa troca com preview sem erro.
- [ ] `ordemEntradaMarcacoes` gere fila do dia + histórico desmarcadas.
- [ ] `listaEsperaConsultas` CRUD + converter; filtro utente funciona.
- [ ] `globalBooking` lista, filtra, agenda pedido, email/SMS, ficheiro (com dados migrados).
- [ ] Nenhum erro 500 por tabelas `dbo.*` em GB em BD só nova.

---

## 10. Ficheiros de referência

| | Legado (`CliCloud.ASPcli`) | Novo |
|--|---------------------------|------|
| Menu | `Services/WSMenus.asmx.cs` | `config/menu-items.ts` |
| Agenda | `Client/Consultas/MarcacoesLst.*` | `pages/.../marcacoes/` |
| Salas | `MarcacoesGestaoSalasLst.*` | — |
| Calendário WS | `Services/MarcacoesDiarias.cs` | `MarcacoesAdministrativoService.*` |
| Troca | `TrocaMarcacoesEntreMedicos.*`, `Admissoes.cs` | `troca-medicos/` |
| OE | `OrdemEntradaMarcacoesLst.*`, `OrdemEntradaMarcacoes.cs` | `ordem-entrada/` + `AdmissaoAdministrativo` |
| LE | `ListaEspera*`, `ListaEspera.cs` | `lista-espera/` |
| GB | `PedidosConsulta*`, `PedidosConsulta.cs` | `global-booking/` |

---

## 11. Histórico

| Data | Notas |
|------|-------|
| 2026-05-21 | Auditoria confronto legado ASPcli vs novo (5 submenus + diferenças propositadas) |
| 2026-05-21 | §9 apuramento legado; §12 plano fecho módulo; pendente = P0/P1 only |
