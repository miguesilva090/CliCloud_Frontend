# T3 — U.Tempo / Horas possíveis / Planning

Documento de continuidade (estado a **2026-08-03**).  
Serve para retomar amanhã: o que já está feito, o que falta aplicar (T3.1), e as fatias seguintes.

**Regra do projecto:** o agente só escreve no repo com instrução explícita (`implementa tu`, etc.). Packs ficam em chat / neste doc para o utilizador copiar.

**Referências legado (só comportamento):**
- `CliCloud.ASPcli/Client/Tratamentos/Services/MarcacoesManuais.cs` — `GetMaximoTratamentos*`, `ObterHorasPossiveisDia*`
- `CliCloud.ASPcli/Client/Tratamentos/Services/Admissoes.cs` — compensar falta + horas
- `Dados/CliCloud.Dados.Tratamentos/Terapeutas.cs` — `GetNrMaxTratamentos` / `maxtrat`
- `Dados/CliCloud.Dados.Tratamentos/Planning.cs` — ocupação `dbo.PLANING` (só a partir de T3.5)

---

## Estado actual (resumo)

| Fatia | Estado | Notas |
|-------|--------|--------|
| T1 — Ficha serviços prescritos | Feito | |
| T2.1 / T2.2 — Marcações manuais + bridge LE | Feito | `ListaEsperaTratamentoId` no tratamento |
| T2.UI — 3 tabs + modais (serviços / sessões) | Feito | Sem U.Tempo |
| T2.3 — Compensar falta | Feito | `TimeField` livre; combo slots = T3.2 |
| **T3.1 — API U.Tempo + horas possíveis** | **Implementado** (2026-08-03) | Migration aplicada; controller + FE técnico + client |
| T3.2 … T3.8 | Pendente | Depois de T3.1 |

---

## Roadmap T3 (fatias)

| Fatia | Objectivo | Entrega |
|-------|-----------|---------|
| **T3.1** | Base U.Tempo + horas possíveis | `MaxTratamentos` no técnico; API `unidades-tempo` + `horas-possiveis` (horário fixo/variável + folgas técnico + ocupação via `SessaoTratamento`) |
| **T3.2** | Ligar aos ecrãs T2 | Combos U.Tempo + horas em **Compensar falta** e **Marcações Manuais** (sessões); substituir `TimeField` livre onde fizer sentido |
| **T3.3** | Persistência U.Tempo no tratamento | Campos `UnidadeTempoFisio/Aux/Outro` + UI no tab Tratamento (manuais/ficha) |
| **T3.4** | Folgas clínica / feriados | Excluir dias de folga clínica (`ClinFolg`) |
| **T3.5** | Occupancy legado (opcional) | Gateway mínimo `dbo.PLANING` se coexistência de dados o exigir |
| **T3.6** | Planning UI | Página Planning (ocupação diária/semanal) |
| **T3.7** | Pesquisa vaga | Fluxo “encontrar slot livre” |
| **T3.8** | Marcações automáticas | Geração automática de sessões com disponibilidade |

---

## T3.1 — Alterações necessárias (por aplicar)

Pack completo foi enviado no chat (2026-08-03). Resumo operacional:

### Comportamento alvo

- `MaxTratamentos` em `Tecnicos.Tecnico` (legado `maxtrat`) → lista U.Tempo = `1..Max`
- Horas possíveis = slots de `MinMarcacao` no horário fixo do dia **+** horário variável **−** folgas do técnico **−** ocupação em `SessaoTratamento`
- Até T3.3: cada sessão existente no slot conta **1** unidade
- **Fora de T3.1:** folga clínica (`ClinFolg`), `dbo.PLANING`, combos nos ecrãs

### Endpoints a criar

| Método | Rota |
|--------|------|
| GET | `/client/tratamentos/DisponibilidadeTecnicoTratamento/unidades-tempo/{tecnicoId}` |
| POST | `/client/tratamentos/DisponibilidadeTecnicoTratamento/horas-possiveis` |

Body `horas-possiveis`: `{ tecnicoId, data, unidadeTempo, ignorarSessaoId? }`  
Response: `{ duracao: "HH:mm", horas: ["09:00", ...] }`

### Backend — ficheiros

| Acção | Path |
|--------|------|
| EDIT | `Backend/CliCloud.Domain/Entities/Tecnicos/Tecnico.cs` — propriedade `MaxTratamentos` (default 1) |
| EDIT | `Backend/CliCloud.Infrastructure/Persistence/Configurations/TecnicoConfiguration.cs` |
| MIGRATE | `dotnet ef migrations add Add_Tecnico_MaxTratamentos` (Infrastructure + WebApi) |
| EDIT | `.../TecnicoService/DTOs/CreateTecnicoRequest.cs` (+ validator 1..50) |
| EDIT | `.../TecnicoService/DTOs/UpdateTecnicoRequest.cs` (+ validator) |
| EDIT | `.../TecnicoService/DTOs/TecnicoDTO.cs` (+ Light/Table se útil) |
| NEW | `.../DisponibilidadeTecnicoTratamentoService/IDisponibilidadeTecnicoTratamentoService.cs` |
| NEW | `.../DisponibilidadeTecnicoTratamentoService/DisponibilidadeTecnicoTratamentoService.cs` |
| NEW | `.../DisponibilidadeTecnicoTratamentoService/DisponibilidadeTecnicoTratamentoHelper.cs` |
| NEW | `.../DisponibilidadeTecnicoTratamentoService/DTOs/UnidadesTempoTecnicoResponse.cs` |
| NEW | `.../DisponibilidadeTecnicoTratamentoService/DTOs/HorasPossiveisTecnicoRequest.cs` |
| NEW | `.../DisponibilidadeTecnicoTratamentoService/DTOs/HorasPossiveisTecnicoResponse.cs` |
| NEW | `.../DisponibilidadeTecnicoTratamentoService/Specifications/SessoesOcupacaoTecnicoDiaSpec.cs` |
| NEW | `Backend/CliCloud.WebApi/Controllers/Tratamentos/DisponibilidadeTecnicoTratamentoController.cs` |

DI: `ITransientService` → scan automático (sem registo manual).

### Frontend — ficheiros (T3.1)

| Acção | Path |
|--------|------|
| EDIT | `Frontend/src/types/dtos/saude/tecnicos.dtos.ts` — `maxTratamentos` |
| EDIT | `Frontend/.../tecnicos/types/tecnico-edit-form-types.ts` |
| EDIT | `Frontend/.../tecnicos/pages/tecnico-edit-page.tsx` — default/reset/submit |
| EDIT | `Frontend/.../tecnicos/components/tecnico-edit-tabs/tab-tecnico-dados-profissionais.tsx` — campo “Máx. tratamentos / slot” |
| NEW | `Frontend/src/types/dtos/tratamentos/disponibilidade-tecnico-tratamento.dtos.ts` |
| NEW | `Frontend/src/lib/services/tratamentos/disponibilidade-tecnico-tratamento-service/disponibilidade-tecnico-tratamento-client.ts` |

### Entidades já existentes a reutilizar (não criar)

- `HorarioTecnico` / `HorarioTecnicoDia` (`MinMarcacao`, períodos manhã/tarde)
- `HorarioTecnicoVariavel`
- `FolgasTecnico` (`TodoDia`, intervalos)
- `SessaoTratamento` (`HoraFisio` / `HoraAux` / `HoraOutro` / `HoraInic` + IDs de técnicos)
- Specs: `HorarioTecnicoSearchByTecnicoId`, `HorarioTecnicoVariavelSearchByTecnicoId`, `FolgasTecnicoSearchByTecnicoId`

### Checklist de teste T3.1

1. Migrar BD; técnico com `MaxTratamentos = 3` → `GET unidades-tempo` devolve `[1,2,3]`
2. Horário fixo 09:00–12:00, `MinMarcacao = 00:30` → horas 09:00 … 11:30
3. Folga `TodoDia` nesse dia → `horas: []`
4. Sessão no slot + `max=1` + `unidadeTempo=1` → slot desaparece; com `max=2` continua
5. Sem horário / sem `MinMarcacao` → intervalo default 15 min; lista vazia se não houver slots (não erro)

### Migração (comandos)

```powershell
cd Backend
dotnet ef migrations add Add_Tecnico_MaxTratamentos --project CliCloud.Infrastructure --startup-project CliCloud.WebApi
dotnet ef database update --project CliCloud.Infrastructure --startup-project CliCloud.WebApi
```

---

## O que ainda falta depois do T3.1

### T3.2 — Ligar combos aos ecrãs (próxima após aplicar T3.1)

**Objectivo:** deixar de usar hora livre onde o legado usa combo de slots.

| Ecrã | Ficheiro típico | Alteração |
|------|-----------------|-----------|
| Compensar falta | `Frontend/.../marcados/modals/compensar-falta-sessao-modal.tsx` | Combo U.Tempo por técnico + combo horas via API; duração = `duracao` da API |
| Marcações manuais (sessões) | `Frontend/.../marcacoes-manuais/pages/marcacoes-manuais-page.tsx` (+ modal sessão) | Idem ao escolher fisio/aux/outro + data |
| (Opcional) Editar sessão ficha | `sessao-tratamento-ficha-modal.tsx` | Mesmo padrão se quiseres paridade total |

Dependências: client T3.1 já criado; técnicos com `MaxTratamentos` e horário configurado.

### T3.3 — Persistência U.Tempo no tratamento

- Campos no tratamento (legado `Unidadetempofisio/aux/outro`)
- UI no tab Tratamento (manuais + ficha)
- Helper de ocupação passa a somar unidades reais (deixar de contar 1 por sessão)

### T3.4 — Folgas clínica / feriados

- Paridade com `ClinFolg` em `ObterHorasPossiveisDia*`
- Mensagem legado tipo “folga da clínica” quando o dia da semana está bloqueado

### T3.5 — Gateway `dbo.PLANING` (opcional)

- Só se coexistência com dados legado o exigir
- Atenção: PLANING usa códigos `int`; newCC usa `Guid` — precisa de estratégia de mapeamento
- Não criar gateway por operação; um por tabela/workflow

### T3.6 / T3.7 / T3.8

- UI Planning, pesquisa de vaga, marcações automáticas  
- Hoje o menu pode ter placeholders — implementação depois da base T3.1–T3.3

---

## Gaps conscientes (já fechados em T2, ficam para T3+)

| Gap | Onde se nota | Fase |
|-----|--------------|------|
| Combo horas livres (U.Tempo) | Compensar falta / manuais | T3.2 |
| Validação ocupação tipo PLANING | Guardar sessão | T3.5 (ou T3.1 parcial via SessaoTratamento) |
| Folgas/feriados clínica | Data sugerida | T3.4 |
| U.Tempo gravado no tratamento | Tab Tratamento | T3.3 |
| Visualizar ocupação técnicos | Botão legado | T3.6 |
| Recibo ligado à compensação | Financeiro | polish (fora T3 core) |

---

## Ficheiros-chave já implementados (contexto T2.3)

Úteis ao fazer T3.2 (wiring):

- BE: `SessaoTratamentoService.CompensarFaltaAsync`, `CompensarFaltaSessaoTratamentoRequest`, `POST .../compensar-falta`
- FE: `compensar-falta-sessao-modal.tsx`, painel ficha sessões, `sessao-tratamento-client.ts`
- Manuais: `marcacoes-manuais-page.tsx`
- Helper: `TratamentoIntegridadeHelper.cs` (`RecalcularFaltas` = faltas − compensações)

---

## Como retomar amanhã

1. Abrir este ficheiro + pack T3.1 no chat (ou pedir “reenvia o pack T3.1 completo”).
2. Aplicar T3.1 (entidade → migração → service/controller → FE técnico + client).
3. Testar endpoints com Postman/Swagger + um técnico com horário.
4. Pedir pack **T3.2** (combos nos modais).
5. Só depois T3.3 (persistir U.Tempo) — melhora a ocupação real.

**Pedido típico ao agente:**  
“reenvia o pack T3.1 com o código completo” / “implementa tu o T3.1” / “manda o pack T3.2”.
