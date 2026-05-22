# UAT GlobalBooking — Fecho Sprint 3

**Data fecho:** 2026-05-20  
**Rota:** `Área Administrativa › Consultas › Marcações › GlobalBooking`  
**Legado:** `PedidosConsultaLst.aspx` / `PedidosConsulta.cs`

---

## Estado: FECHADO (implementação + critérios operacionais)

Sprint 3 considerado **entregue para produção receção** com ressalvas P2 documentadas abaixo.

---

## Entregas Sprint 3

| # | Item | Estado |
|---|------|--------|
| 3.1 | Filtros FE (presets Estado/Email/SMS + Sim/Não + datas) | ✅ |
| 3.2 | Colunas flags email/SMS na grelha | ✅ |
| 3.3 | Nomes médico via `ResolveMedicoLegado` + fallback `dbo.MEDICOS` | ✅ |
| 3.3b | Nomes especialidade via `dbo.ESPECIAL` (batch) | ✅ |
| 3.4 | Script migração `Backend/Scripts/Migrate_PedidosConsulta_LegacyToConsultas.sql` | ✅ (manual) |
| 3.5 | Horas no modal (calendário médico) | ✅ |
| 3.6 | Fluxos: marcar, utente, recusar, email/SMS, download, apagar | ✅ |
| 3.7 | Modal: bloqueio se já agendado; utente candidatos detalhado; defaults tipo consulta/admissão | ✅ |

---

## Matriz UAT — resultado esperado

### Listagem e filtros

- [x] Grelha carrega (`Consultas.PedidoConsulta`)
- [x] Pesquisa global nome/email/telemóvel
- [x] Presets Pendentes / Agendados / Recusados / Falha comunicação
- [x] Presets Email e SMS
- [x] Filtros manuais Sim/Não
- [x] Data de / até
- [x] Colunas Agendado, Recusado, Email/SMS pedido e agendamento

### Ações

- [x] Marcar consulta → marcação + admissão + flags
- [x] Bloqueio pedido já agendado (UI + API)
- [x] Adicionar utente (confirm com dados candidato)
- [x] Recusar / reverter
- [x] Download ficheiro
- [x] Email tipos 1 e 2; SMS tipos 3 e 4
- [x] Apagar pedido (não agendado, com permissão delete)

### Permissões

- [x] `globalBooking` / fallback `marcacoes` / `consultas`
- [x] Ações de escrita condicionadas a `canChange` / `canDelete`

---

## Ressalvas P2 (não bloqueiam Sprint 4)

| Tema | Notas |
|------|--------|
| Horas livres | Derivadas do **calendário**; não é port 1:1 de `OrdemMarcacoesObterDisponibilidadeHoras` |
| Especialidade | Nome via `dbo.ESPECIAL` até existir `CodigoLegado` em `Especialidades.Especialidade` |
| Filtros avançados legado | Intervalos Código / Médico / Hora no painel legado — não replicados (pesquisa global cobre uso comum) |
| Apagar múltiplos | API `delete-multiple` existe; UI só apaga linha a linha |
| Imprimir / admissão na grelha | P2 plano |

---

## Pré-requisitos operacionais

1. Dados em `Consultas.PedidoConsulta` (migração SQL se necessário).
2. Config email/SMS clínica códigos `6.1`–`6.4` para envios.
3. Médicos com `Letra` = `c_medico` legado para resolver nomes no schema novo.

---

## Próximo passo

**Sprint 4 — GestaoSalas** (`Clinica.GestaoSalas`): sala obrigatória e calendário por sala quando ativo.
