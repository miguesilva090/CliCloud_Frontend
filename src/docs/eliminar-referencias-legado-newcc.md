# Eliminar referências / runtime legado no newCC

**Data:** 2026-08-05 (actualizado após fix OPENJSON)  
**Regra Cursor:** `.cursor/rules/arquitetura-luma-paridade-funcional.mdc`  
**Objectivo:** o Backend e o Frontend do newCC **não falam** com BD/código legado (`dbo.*`, `CliCloud.ASPcli`, `CliCloud.Dados.*`). Paridade = comportamento; dados = só schemas EF novos.

Este documento é inventário + plano. **Não apagar em massa** sem PR/fase dedicada — cada bloco abaixo é um trabalho de migração.

---

## Estado geral

| Fase | Conteúdo | Estado |
|------|----------|--------|
| Regra Cursor | Proíbe novos `dbo` / gateways legado | **Feito** |
| **B1** | Lookup tipo serviço sem `dbo.TIPO_SRV` | **Feito** (validado UI; corrigido `EF.Constant`) |
| **B2** | Credenciais SNS fisioterapia sem `dbo.LOTESPFISIO` / `INSTITUI` / `TIPOLOTES` | **Feito** (código; aplicar migration `Add_LoteFisioterapia`) |
| **B3** | Lote Direct ESP + fecho ESP sem `dbo.RequisicoesEsp*` | **Feito** |
| A1 | Rename FE `*legado*` / toasts / menu | Pendente (cosmético) |
| A2 | Rename BE soft (`*Legacy*`, params) | Pendente (cosmético) |
| Sweep | Comentários / docs desactualizados | Pendente |

**Documentos financeiros** (facturas, recibos, etc.) continuam fora de âmbito deste inventário — não confundir com Credenciais SNS / Lote Direct.

---

## Critérios

| Tipo | Acção |
|------|--------|
| SQL runtime `dbo.*` / `OBJECT_ID('dbo.…')` | **Migrar** para entidade EF + `IRepositoryAsync`; depois **retirar** gateway |
| Nome de tipo/ficheiro `*Legado*` / `*Legacy*` que implica coexistência | **Renomear** quando o fluxo já estiver no modelo novo |
| Comentários “paridade legado …” / docs de roadmap | **OK** em docs de trabalho; limpar comentários no código de produto quando tocar no ficheiro |
| Pastas `CliCloud.ASPcli` / `Dados` na solution | **Referência humana** — o newCC (`Backend/`, `Frontend/`) **não** deve ter `ProjectReference` a elas |
| Colunas `CodigoLegado` em entidades EF já migradas | **Não é** “falar com legado”; é dado histórico no schema novo. Renomear só se o produto quiser vocabulario limpo (breaking) |

---

## P0 — Runtime SQL `dbo` (retirar / migrar)

### B1 — Lookup tipo serviço — **FEITO**

| Item | Detalhe |
|------|---------|
| Removido | `ICredenciaisSnsLegadoLookup`, `CredenciaisSnsLegadoLookup` (SQL `dbo.TIPO_SRV`) |
| Modelo novo | `Servicos.TipoServico.Codigo` + `Filtro` |
| Lookup | `ITipoServicoCodigoLookup` / `TipoServicoCodigoLookup` |
| Spec | `TipoServicoByCodigosSpec` — usa **`EF.Constant`** (evitar `OPENJSON`, incompatível com compatibilidade SQL baixa desta BD) |
| Consumidores | `CredenciaisSnsService`, `LoteDirectService` |
| Gateway fisio | `JOIN dbo.TIPO_SRV` **removido**; nome vem do enriquecimento |
| Migration | `20260805160120_Add_TipoServico_Codigo_Filtro` (colunas + backfill one-shot; não é runtime) |
| Teste | Credenciais SNS → Especialidades: listagem OK após fix OPENJSON |

### B2 — Credenciais SNS fisioterapia — **FEITO**

| Item | Detalhe |
|------|---------|
| Removido | `CredenciaisSnsFisioterapiaGateway`, `ICredenciaisSnsFisioterapiaGateway` (SQL `dbo.LOTESPFISIO` / `INSTITUI` / `TIPOLOTES`) |
| Modelo novo | `Credenciais.LoteFisioterapia` |
| Listagem | `CredenciaisSnsFisioterapiaSearchSpec` + `IRepositoryAsync` (como especialidades) |
| Delete | `CredenciaisSnsFisioterapiaDeleteExecutor` em `Persistence/Credenciais/` (EF, sem `dbo`) |
| Migration | `20260806080802_Add_LoteFisioterapia` (+ backfill one-shot de `dbo.LOTESPFISIO` se existir) |
| Teste | Credenciais SNS → Fisioterapia: listagem + delete; reiniciar API após `dotnet ef database update` |

### B3a — Lote Direct ESP — **FEITO**

| Ficheiro | O quê |
|----------|--------|
| `.../Credenciais/LoteDirectEspHistoricoGateway.cs` | `dbo.RequisicoesEsp`, `RequisicoesESPLinha`, `EFETUADOS_N_PRESC`, `ACOR_INS` |
| Interface | `ILoteDirectEspHistoricoGateway` |
| Relacionados | `LoteDirectPassarHistoricoExecutor`, `LoteDirectPassarAtivoExecutor` |

### B3b — Fecho requisição ESP — **FEITO**

| Ficheiro | O quê |
|----------|--------|
| `.../Consultas/RequisicaoEspFechoUpdater.cs` | `dbo.RequisicoesEsp`, `dbo.EstadoExameESP` |

**Para fazer:** entidades EF partilhadas com B3a; updater só EF.

### Migrations históricas (não apagar à cega)

Estas migrations já corridas **mencionam** `dbo` no histórico EF — não as reescrever. Novas migrations **não** devem criar/seed `dbo.*` em runtime.

| Ficheiro | Nota |
|----------|------|
| `.../Migrations/20260512135023_Ensure_Dbo_TIPOLOTES.cs` | Criou `dbo.TIPOLOTES` (passado) |
| `.../Migrations/20260512140132_Move_TipoLotes_To_Credenciais.cs` | Moveu para `Credenciais` |
| `.../Migrations/20260519140610_Backfill_TiposConsulta_CodigoLegado.cs` | Backfill a partir de `dbo.TIPOS_CONSULTA` |
| `.../Migrations/20260320101151_Add_UnidadesLocaisSaude.cs` | Comentário “equivalente a dbo.UlsNovas” |
| `.../Migrations/20260805160120_Add_TipoServico_Codigo_Filtro.cs` | Colunas + backfill one-shot (incl. `IF OBJECT_ID dbo.TIPO_SRV` só na migration) |

**Scripts:** `Backend/scripts/Migrate_PedidosConsulta_LegacyToConsultas.sql` — ferramenta one-shot; documentar como histórico ou arquivar fora do runtime.

---

## P1 — Naming / tipos que “mencionam” legado (após ou em paralelo a P0)

### Backend

| Actual | Sugestão | Nota |
|--------|----------|------|
| ~~`ICredenciaisSnsLegadoLookup`~~ | — | **Removido** (B1) |
| `PedidoConsultaLegacyNamesResolver` | Resolver no EF ou remover | Pendente |
| `AvisosClinicaLegacyDTO` | `AvisosClinicaDTO` | Pendente |
| `LegacyValueConverters` | `SqlBitIntConverters` | Pendente (só naming) |
| Params `filtroLegado`, `tipoPreFaturaLegado`, `operacaoLegado` | Nomes de domínio | Pendente |

### Frontend

| Ficheiro / símbolo | Acção |
|--------------------|--------|
| `.../credenciais-sns/utils/credenciais-sns-legado-acoes.ts` | Renomear; toast sem “legado …” |
| `.../credenciais/utils/credenciais-legado-relatorios.ts` | Idem |
| `.../admissoes/utils/admissao-legado-relatorios.ts` | Idem |
| `formatMesAnoLegado` | `formatMesAno` |
| `credenciais-sns-modulo-config.ts` comentário `dbo.LOTESPFISIO` | Actualizar quando B2 fechar |
| `menu-items.ts` — path ASPcli em Notificações | Título limpo |
| `odontograma-legacy-config` / `findLegacyAction` | Rename quando tocar na feature |
| UI `title='Legado: modFld…'` | Remover prefixo |

### Docs FE

| Doc | Estado |
|-----|--------|
| `plano-paridade-legado-newcc.md` | Ainda pode sugerir gateway `dbo` para Planning — alinhar (T3.5 saltado) |
| `t3-utempo-horas-possiveis-pendente.md` | Já “sem dbo” |
| **Este ficheiro** | Fonte de verdade do inventário runtime |

---

## P2 — Comentários no código (limpeza oportunista)

Há dezenas de comentários `// Legado: …` / `// Paridade legado …`.  
**Não** é runtime. Limpar ao editar o ficheiro.

---

## P3 — Explicitamente fora de “retirar runtime”

- Pastas `CliCloud.ASPcli/`, `Dados/` — referência humana de comportamento.
- Docs `*paridade*` / `*legado*` — roadmap.
- Campos `CodigoLegado` em EF — dados no schema novo.
- Emissão / documentos financeiros (exclusão de âmbito do plano de paridade operacional).

---

## Ordem sugerida

1. ~~Regra Cursor~~ — **feito**
2. ~~B1 tipo serviço / `TIPO_SRV`~~ — **feito**
3. ~~B2 fisioterapia `LOTESPFISIO` → EF~~ — **feito** (aplicar migration)
4. ~~B3 ESP + fecho → EF~~ — **feito**
5. Rename `*Legado*` / toasts / menu — **em curso**
6. Sweep comentários e docs

---

## Checklist rápido (antes de merge de feature nova)

- [ ] Sem `FROM dbo.` / `OBJECT_ID(N'dbo.` no diff de **código runtime** (migrations históricas OK)
- [ ] `Contains` em listas: preferir `EF.Constant(...)` (esta BD)
- [ ] Sem `ProjectReference` a ASPcli/Dados no Backend/Frontend
- [ ] Sem novo gateway que leia `dbo`
- [ ] Se falta tabela: entidade EF + migration no schema novo
