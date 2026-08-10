# Plano semanal — Pack P3 (Ficha / Histórico tratamentos)

**Data:** 2026-08-07  
**Objectivo:** fechar paridade operacional do histórico de tratamentos (sem reports / documentos financeiros).  
**Quem aplica:** tu (código no repo). Assistente só escreve no projeto se pedires *implementa tu*.

---

## Estado actual (já feito)

| Item | Estado |
|------|--------|
| **P1** — Incluir desmarcados, repor desmarcação, compensar falta | Feito + UAT |
| **P2** — Fecho diário tratamentos (modal + API) | Feito + UAT |
| **P3.1** — Fix fecho: **não** soft-delete sessões/serviços; `DataFim` + `ConfDfim=1` + `HistSess=1` em todas as sessões | Feito no código |

**Ficheiro do fix P3.1:**  
`Backend/CliCloud.Application/Services/Tratamentos/FechoDiarioTratamentoAdministrativoService/FechoDiarioTratamentoAdministrativoService.cs`  
→ método `FecharTratamentoAsync` (sem `RemoveAsync`).

---

## O que falta (P3.2 → P3.12)

| Ordem | # | Tarefa | Esforço estimado |
|------:|---|--------|------------------|
| 1 | **2** | Spec histórico: `DataFim <= hoje` | ~5 min |
| 2 | **3** | Spec marcados: activo se `DataFim` null ou `> hoje` | ~5 min |
| 3 | **7** | CRIAR DTO observações + validator | ~15 min |
| 4 | **4–6** | Interface + Service + Controller histórico (passar / reabrir / apagar / obs) | ~1–2 h |
| 5 | **8–9** | Client FE + types DTOs | ~30 min |
| 6 | **12** | Modal observações histórico | ~45 min |
| 7 | **10–11** | Columns + page histórico (Editar, Apagar, Obs, Reabrir) | ~1–2 h |
| 8 | **13–14** | Marcados: «Passar para histórico» | ~1 h |
| 9 | — | Build + restart API + UAT | ~1 h |

**Total orientativo:** 1–2 dias úteis (buffer para bugs / licenças).

---

## Princípios (obrigatório)

- Runtime só schemas EF (`Tratamentos.*`). **Sem** `dbo.HISTTRAT` / gateways legado.
- Legado = referência de comportamento (`HistoricoTratamentosLst/Edt`, `TransferirParaHistorico`).
- Padrão Luma: Service + Spec + `IRepositoryAsync`.
- Sem `framer-motion` / `motion.*`.
- Fora de âmbito: Crystal/reports, facturas/recibos/NC/SAFT, TV (P5), planning sync (P4), modalidades (P6).

### Fronteira Marcados ↔ Histórico (após #2+#3)

| Lista | Critério |
|-------|----------|
| **Marcados** | `DataFim` null **ou** `DataFim > hoje` |
| **Histórico** | `DataFim` preenchido **e** `DataFim <= hoje` |

Assim, passar para histórico / fecho com `DataFim = hoje` reflecte-se **no mesmo dia**.

### Passar / Reabrir (comportamento)

| Acção | Tratamento | Sessões |
|-------|------------|---------|
| Passar para histórico | `DataFim = hoje`, `ConfDfim = 1` | todas `HistSess = 1` |
| Reabrir | `DataFim = null`, `ConfDfim = 0` | todas `HistSess = 0` |
| Apagar | soft-delete tratamento; bloquear se recibo/documento | — |

---

## Inventário de ficheiros

### Backend

| # | Acção | Path |
|---|--------|------|
| 2 | EDITAR | `Backend/CliCloud.Application/Services/Tratamentos/HistoricoTratamentoAdministrativoService/Specifications/HistoricoTratamentoSearchTable.cs` |
| 3 | EDITAR | `Backend/CliCloud.Application/Services/Tratamentos/TratamentoMarcadosAdministrativoService/Specifications/TratamentoMarcadosSearchTable.cs` |
| 4 | SUBSTITUIR | `…/HistoricoTratamentoAdministrativoService/IHistoricoTratamentoAdministrativoService.cs` |
| 5 | SUBSTITUIR | `…/HistoricoTratamentoAdministrativoService/HistoricoTratamentoAdministrativoService.cs` |
| 6 | SUBSTITUIR | `Backend/CliCloud.WebApi/Controllers/Tratamentos/HistoricoTratamentoAdministrativoController.cs` |
| 7 | CRIAR | `…/HistoricoTratamentoAdministrativoService/DTOs/HistoricoTratamentoObservacoesDTO.cs` |

**API a expor** (`client/tratamentos/historico-tratamento-administrativo`):

| Método | Rota |
|--------|------|
| POST | `/paginated` (já existe) |
| POST | `/{id}/passar-historico` |
| POST | `/{id}/reabrir` |
| DELETE | `/{id}` |
| GET | `/{id}/observacoes` |
| POST | `/{id}/observacoes` body `{ texto }` |

Reutilizar Spec já existente:  
`FechoDiarioTratamentoAdministrativoService/Specifications/SessoesDoTratamentoParaFechoSpec.cs`.

### Frontend

| # | Acção | Path |
|---|--------|------|
| 8 | SUBSTITUIR | `Frontend/src/lib/services/tratamentos/historico-tratamento-administrativo-service/historico-tratamento-administrativo-client.ts` |
| 9 | EDITAR | `Frontend/src/types/dtos/tratamentos/historico-tratamento-administrativo.dtos.ts` |
| 10 | SUBSTITUIR | `Frontend/src/pages/area-administrativa/tratamentos/historico/components/listagem-historico-tratamentos-table.columns.tsx` |
| 11 | SUBSTITUIR | `Frontend/src/pages/area-administrativa/tratamentos/historico/pages/listagem-historico-tratamentos-page.tsx` |
| 12 | CRIAR | `Frontend/src/pages/area-administrativa/tratamentos/historico/modals/historico-tratamento-observacoes-modal.tsx` |
| 13 | EDITAR | `Frontend/src/pages/area-administrativa/tratamentos/marcados/components/listagem-tratamentos-marcados-table.columns.tsx` |
| 14 | EDITAR | `Frontend/src/pages/area-administrativa/tratamentos/marcados/pages/listagem-tratamentos-marcados-page.tsx` |

Permissão listagens: `modules.areaAdministrativa.permissions.consultas.id` (igual ao histórico actual).

---

## Sugestão de calendário (semana)

| Dia | Foco |
|-----|------|
| **Seg** | Specs #2+#3; DTO #7; Interface + Service + Controller #4–6; build Application/WebApi |
| **Ter** | Client + DTOs FE #8–9; modal obs #12 |
| **Qua** | Page + columns histórico #10–11; smoke listagem |
| **Qui** | Marcados passar histórico #13–14; UAT cruzado Marcados ↔ Histórico ↔ Ficha |
| **Sex** | Buffer: bugs, mensagens, reinício API, checklist final |

---

## Snippets mínimos (specs)

### #2 — Histórico

```csharp
_ = Query.Where(x =>
  x.DataFim.HasValue && x.DataFim.Value.Date <= hoje
);
```

### #3 — Marcados (modo Marcados)

```csharp
&& (x.DataFim == null || x.DataFim.Value.Date > hoje)
```

> Código completo dos restantes ficheiros: pack P3 no chat da sessão Cursor (mensagem «mostra-me a implementaçao do P3»). Usar esse pack como fonte para SUBSTITUIR/CRIAR.

---

## Checklist de UAT (fim da semana)

- [ ] Fecho última sessão → tratamento no histórico **no mesmo dia**; ficha com **sessões e serviços** visíveis  
- [ ] Fecho meio tratamento → só `HistSess=1` na sessão do dia; some das admissões  
- [ ] Marcados → «Passar para histórico» → some de Marcados; aparece no Histórico  
- [ ] Histórico → Ver / Editar abrem ficha `/marcados/:id`  
- [ ] Histórico → Apagar (bloqueia se recibo)  
- [ ] Histórico → Observações (append)  
- [ ] Histórico → Reabrir → volta a Marcados; `HistSess=0`  
- [ ] `dotnet build` Application + WebApi OK; FE sem erros TS nos ficheiros tocados  

---

## Fora deste plano / dívida

| Item | Nota |
|------|------|
| Dados soft-deleted pelo P2 antigo (antes do fix #1) | Não recuperam sozinhos |
| Gate legado `AlterarHistorico` | Opcional pós-P3 |
| Campo Pago editável na ficha | Opcional |
| P4 Planning sync / P5 TV / P6 modalidades | Fases seguintes |

---

## Como pedir ajuda na próxima sessão

- *«implementado P3, analisa»* — rever o que aplicaste  
- *«implementa tu a P3»* — agente escreve no repo  
- *«só o BE da P3»* / *«só o FE»* — fatias menores  

**Referência legado:**  
`CliCloud.ASPcli/Client/Tratamentos/HistoricoTratamentosLst.*`, `HistoricoTratamentosEdt.*`, `TransferirParaHistorico` em `Services/Tratamentos.cs`.
