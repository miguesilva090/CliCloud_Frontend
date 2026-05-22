# Checklist — Fecho Consultas › Marcações

**Plano completo:** [`plano-implementacao-consultas-marcacoes.md`](./plano-implementacao-consultas-marcacoes.md)  
**Paridade:** [`paridade-consultas-marcacoes.md`](./paridade-consultas-marcacoes.md)

---

## Sprint 1
- [ ] LE: `utenteId` na query
- [ ] Smoke UAT 5 rotas

## Sprint 2 — ESP (se clínica usa exames/credenciais ESP)
- [ ] `RequisicaoEspFechoUpdater`: agendado + cativado + bloqueio efetivada
- [ ] Ordem entrada anular + agenda desmarcar + marcação create/update + desmarcar admissão

## Sprint 3 — GlobalBooking ✅ (UAT fechado 2026-05-20)
- [x] Filtros FE
- [x] Nomes médico (novo + fallback dbo); especialidade dbo batch
- [x] Script migração dados (`Backend/Scripts/Migrate_PedidosConsulta_LegacyToConsultas.sql`)
- [x] Horas no modal agendar (calendário)
- [x] UAT GB — ver [`uat-global-booking-fecho.md`](./uat-global-booking-fecho.md)

## Sprint 4 — GestaoSalas (por clínica)
- [ ] Se `true`: sala obrigatória + calendário por sala
- [ ] Se `false`: sem regressão

## Sprint 5
- [ ] UAT go-live Parte C do plano
