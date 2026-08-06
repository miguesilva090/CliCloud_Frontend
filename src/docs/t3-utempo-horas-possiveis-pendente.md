# T3 — U.Tempo / Horas possíveis / Planning

Documento de continuidade (estado a **2026-08-05**).  
Serve para retomar: o que já está feito, o que foi saltado de propósito, e as fatias seguintes.

**Regra do projecto:** o agente só escreve no repo com instrução explícita (`implementa tu`, etc.). Packs ficam em chat / neste doc para o utilizador copiar.

**Arquitectura:** template Luma (newCC). Legado (`CliCloud.ASPcli`, `Dados`) = **só referência** de comportamento / mensagens — **não** portar `dbo` nem comunicar com o ASP.

**Referências legado (só comportamento):**
- `CliCloud.ASPcli/Client/Tratamentos/Services/MarcacoesManuais.cs` — `GetMaximoTratamentos*`, `ObterHorasPossiveisDia*`
- `CliCloud.ASPcli/Client/Tratamentos/Services/Admissoes.cs` — compensar falta + horas
- `Dados/CliCloud.Dados.Tratamentos/Terapeutas.cs` — `GetNrMaxTratamentos` / `maxtrat`
- `CliCloud.ASPcli/Client/Tratamentos/Planning.aspx` (+ JS) — calendário por técnico (paridade UI T3.6)
- `CliCloud.ASPcli/Client/Tratamentos/PesquisaPlanning.aspx` — pesquisa de vaga (**T3.7**)

---

## Estado actual (resumo)

| Fatia | Estado | Notas |
|-------|--------|--------|
| T1 — Ficha serviços prescritos | Feito | |
| T2.1 / T2.2 — Marcações manuais + bridge LE | Feito | `ListaEsperaTratamentoId` no tratamento |
| T2.UI — 3 tabs + modais (serviços / sessões) | Feito | |
| T2.3 — Compensar falta | Feito | |
| **T3.1** — API U.Tempo + horas possíveis | **Feito** | `MaxTratamentos`; ocupação via `SessaoTratamento` |
| **T3.2** — Combos nos ecrãs | **Feito** | Compensar falta + marcações manuais |
| **T3.3** — Persistência U.Tempo | **Feito** | `UnidadeTempoFisio/Aux/Outro` + UI + ocupação real |
| **T3.4** — Folga clínica / feriados | **Feito** | `Clinica.Folga*` + `Utility.Feriado`; msgs legado |
| **T3.5** — Gateway `dbo.PLANING` | **Saltado** | newCC **não** comunica com legado; revertido (sem `CodigoLegado` / `IPlaningGateway`) |
| **T3.6** — Planning UI (Geral) | **Feito (MVP)** | Calendário FullCalendar + sessões EF; pesquisa = stub |
| **T3.6.2** — Blocos horário/folga no calendário | Pendente | Opcional (fundo indisponível / folga / feriado) |
| **T3.7** — Pesquisa de vaga | Pendente | Stub de página; lógica a implementar |
| **T3.8** — Marcações automáticas | Pendente | |

---

## Roadmap T3 (fatias)

| Fatia | Objectivo | Entrega | Estado |
|-------|-----------|---------|--------|
| **T3.1** | Base U.Tempo + horas possíveis | `MaxTratamentos`; API `unidades-tempo` + `horas-possiveis` | Feito |
| **T3.2** | Ligar aos ecrãs T2 | Combos U.Tempo + horas (compensar / manuais) | Feito |
| **T3.3** | Persistência U.Tempo | Campos no tratamento + UI + soma unidades na ocupação | Feito |
| **T3.4** | Folgas clínica / feriados | Bloquear dia + mensagem | Feito |
| **T3.5** | Occupancy legado (opcional) | Gateway `dbo.PLANING` — **não aplicável** sem coexistência | Saltado |
| **T3.6** | Planning Geral | Página calendário por técnico (`SessaoTratamento`) | Feito (MVP) |
| **T3.6.2** | Planning polish | Background: horário / folga / feriado no calendário | Pendente |
| **T3.7** | Pesquisa vaga | Encontrar técnicos livres + abrir Planning | Pendente |
| **T3.8** | Marcações automáticas | Geração de sessões com disponibilidade | Pendente |

---

## Decisão T3.5 (importante)

Foi iniciado um pack com `IPlaningGateway` + `CodigoLegado` no técnico para ler `dbo.PLANING`.  
**Revertido** porque o newCC **não vai comunicar com o legado**.

Ocupação no newCC = **`SessaoTratamento`** (já em T3.1–T3.4). Não reintroduzir gateway `dbo.PLANING` sem decisão explícita de coexistência.

---

## T3.1–T3.4 — Onde está (referência rápida)

### Endpoints disponibilidade

| Método | Rota |
|--------|------|
| GET | `/client/tratamentos/DisponibilidadeTecnicoTratamento/unidades-tempo/{tecnicoId}` |
| POST | `/client/tratamentos/DisponibilidadeTecnicoTratamento/horas-possiveis` |

Body: `{ tecnicoId, data, unidadeTempo, ignorarSessaoId? }`  
Response sucesso: `{ duracao, horas }` · Fail: `"Dia de Folga Clínica"` / `"Dia de Feriado: …"`

### Ficheiros-chave

| Área | Path |
|------|------|
| Service | `.../DisponibilidadeTecnicoTratamentoService/` (+ Helper, Specs, DTOs) |
| Controller | `WebApi/Controllers/Tratamentos/DisponibilidadeTecnicoTratamentoController.cs` |
| FE hook / UI slots | `hooks/tratamentos/use-disponibilidade-tecnico-slot.ts`, `components/tratamentos/tecnico-slot-horario-fields.tsx`, `tecnico-unidade-tempo-field.tsx` |
| U.Tempo tratamento | entidade `Tratamento` + DTOs + ficha / manuais / compensar |

---

## T3.6 — Planning Geral (implementado)

**Comportamento:** tipo técnico → lista técnicos → calendário dia/semana/mês com eventos de `SessaoTratamento` (cores por estado: 1ª / marcada / última / alta / provisório / falta / multi-técnico).

**Não usa** `dbo.PLANING`. Legado só para paridade visual / tipo de evento.

### Endpoint

| Método | Rota |
|--------|------|
| POST | `/client/tratamentos/PlanningTratamentoAdministrativo/sessoes` |

Body: `{ tecnicoId, tipoTecnico, dataDe, dataAte }`  
Response: `{ eventos: PlanningSessaoEventoDTO[] }`

### Backend

| Path |
|------|
| `Application/.../PlanningTratamentoAdministrativoService/IPlanningTratamentoAdministrativoService.cs` |
| `.../PlanningTratamentoAdministrativoService.cs` |
| `.../DTOs/PlanningSessoesRequest.cs` (+ validator + response) |
| `.../DTOs/PlanningSessaoEventoDTO.cs` |
| `.../Specifications/SessoesPlanningTecnicoPeriodoSpec.cs` |
| `WebApi/Controllers/Tratamentos/PlanningTratamentoAdministrativoController.cs` |

### Frontend

| Path |
|------|
| `types/dtos/tratamentos/planning-tratamento.dtos.ts` |
| `lib/services/tratamentos/planning-tratamento-administrativo-service/planning-tratamento-administrativo-client.ts` |
| `pages/.../tratamentos/planning/pages/planning-geral-page.tsx` |
| `pages/.../tratamentos/planning/pages/pesquisa-vaga-page.tsx` (stub T3.7) |
| `pages/.../tratamentos/planning/components/planning-tecnicos-toolbar.tsx` |
| `pages/.../tratamentos/planning/components/planning-agenda-calendario.tsx` |
| `pages/.../tratamentos/planning/queries/planning-queries.ts` |
| `pages/.../tratamentos/planning/utils/planning-agenda-*.ts` |
| Rotas em `routes/area-administrativa/areaAdministrativa.tsx` (`/planning`, `/planning/pesquisa`) |

Menu: `config/administrativa-tratamentos-header-menu.ts` (já apontava para estas rotas).

### Fora do MVP T3.6

- Drag-drop / inserir sessão no calendário  
- Blocos de fundo (horário, folga clínica, feriado) → **T3.6.2**  
- Pesquisa de vaga completa → **T3.7**  
- Marcações automáticas → **T3.8**

---

## Gaps / próximos

| Item | Fase | Notas |
|------|------|--------|
| Blocos indisponíveis no Planning | T3.6.2 | Reusar horário técnico + folgas + feriados (como disponibilidade) |
| Pesquisa de vaga | T3.7 | Paridade `PesquisaPlanning`; motor ≈ `horas-possiveis` / disponibilidade |
| Marcações automáticas | T3.8 | Orquestração multi-sessão |
| Recibo na compensação | Polish | Fora do core T3 |
| Editar sessão ficha com combos U.Tempo | Opcional | Paridade total se necessário |

---

## Como retomar

1. Abrir este ficheiro.  
2. **Próximo pack útil:** **T3.7** (Pesquisa de Vaga) — ou **T3.6.2** se quiseres primeiro o fundo do calendário.  
3. Pedidos típicos:  
   - “manda o pack T3.7”  
   - “implementa tu o T3.7”  
   - “manda o pack T3.6.2 (blocos no calendário)”

**Não retomar T3.5** salvo decisão explícita de coexistência com `dbo.PLANING`.
