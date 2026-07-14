# Plano de implementação — Consultas, Credenciais e Tratamentos

**Data:** 2026-07-10  
**Âmbito da equipa:** Área Administrativa (Consultas + Credenciais) e, em fase seguinte, Tratamentos operacional.  
**Excluído (outra equipa / fase):** Medicação (prescrição, MCDTs, enfermagem) · Faturação (documentos, CC, tesouraria, SAFT, ADSE emissão, credenciais SNS faturação).

**Documentos relacionados:**
- `disparidades-lancamento-credenciais-legado-vs-novo.md` — detalhe LoteDirect
- `auditoria-area-administrativa-consultas-legado-vs-novo.md` — se existir
- Legado: `CliCloud.ASPcli/Client/Consultas/`, `Services/WSConsultas.asmx`, `Dados/CliCloud.Dados.Consultas/LancamentoCredenciais.cs`

---

## 1. Resumo executivo

| Fase | Foco | Duração estimada | Pré-requisito |
|------|------|------------------|---------------|
| **A** | Fechar Consultas admin + Credenciais (LoteDirect) | 2–4 semanas | Nenhum |
| **B** | Tratamentos operacional (se cliente usa fisio) | 6–12 semanas | Terapeutas API mínima |

**Princípio:** paridade **funcional** com o legado (`CliCloud.ASPcli` + `Dados`). Não inventar schema (`dbo` vs `Credenciais` — seguir padrão já validado em LoteDirect). Não usar `framer-motion`.

---

## 2. Estado actual (2026-07-10)

### ✅ Concluído

| Item | Notas |
|------|-------|
| LoteDirect CRUD + linhas + edit com V2/V3 | LD-P0 |
| Corrigir lotes + agregados | |
| `ObterNovoLote` (BE + FE) | LD-P2 |
| Passar histórico / passar ativo (1 credencial + ESP) | LD-P1 |
| Filtros listagem utente/nome/datas (parcial) | LD-P3 parcial |
| Ver SNS → listagem filtrada + sidebar Faturação | Contexto navegação |
| Marcações, admissões, lista espera, fecho, histórico consultas | Consultas admin |
| Grupos sanguíneos / habilitações (dados mestre) | Manual + pendente seed migration |

### ⏳ Pendente — Fase A

| ID | Item | Prioridade |
|----|------|------------|
| A1 | Validações save LoteDirect tipo 7 / ESP / MCDT / PNP | P1 |
| A2 | Sync agregados no save (B5) ou documentar decisão “só corrigir lotes” | P2 |
| A3 | Ordem entrada: organismo auto do utente + UX loading | P1 |
| A4 | Credenciais SNS **fisioterapia** (só lançamento, sem fatura) | P2 |
| A5 | Filtros/colunas LoteDirect extra (L1, L6) | P3 |
| A6 | Seeds migration (grupos sanguíneos, habilitações) | P3 |
| A7 | Consentimentos utente (tab outras informações) — quando fechar tab | P3 |

### 🔇 Adiado / outra equipa

- Faturação SNS (fatura, verbete, ficheiro eletrónico)
- Crystal / mapas
- Medicação
- CC, Tesouraria, SAFT

---

## 3. Fase A — Plano de PRs (Consultas + Credenciais)

Cada PR deve: compilar BE + FE · testes manuais descritos · não misturar faturação.

---

### PR-A1 — Validações ESP / tipo 7 no save LoteDirect

**Objectivo:** Paridade `LotdirectEdtSave` (~linhas 741–836 legado) antes de UAT credenciais em produção.

**Legado:** `CliCloud.ASPcli/Client/Consultas/Services/LancamentoCredenciais.cs`  
**Novo:** `LoteDirectSaveValidator.cs`, `LoteDirectService.cs`

| Camada | Ficheiros |
|--------|-----------|
| BE | `LoteDirectSaveValidator.cs` (estender) |
| BE | `LoteDirectService.cs` — chamar validador no save |
| BE | Gateway ESP se necessário: padrão `LoteDirectEspHistoricoGateway` / `RequisicaoEspFechoUpdater` |
| FE | `lote-direct-form-modal.tsx` — mostrar erros de validação por linha/campo |
| FE | `lote-direct.dtos.ts` — se novos códigos de erro |

**Regras a portar (confirmar no legado linha a linha):**
- Tipo lote 7: regras ESP / credencial
- Linhas MCDT / PNP conforme organismo e tipo
- Bloqueios quando credencial já em histórico / requisição fechada

**Testes UAT:**
1. Gravar lançamento tipo 7 com credencial ESP válida → sucesso
2. Gravar com credencial inválida → mensagem igual ou equivalente ao legado
3. Comparar mesmo utente/organismo no legado vs novo

**Estimativa:** 3–5 dias

---

### PR-A2 — Ordem entrada: organismo do utente

**Objectivo:** Ao seleccionar utente, preencher organismo (principal + subsistema); não bloquear save sem motivo.

**Legado:** `OrdemEntradaMarcacoesLst.js` → `OnChangeUtente` → `UtentesEdtLoad`

| Camada | Ficheiros |
|--------|-----------|
| FE | `ordem-entrada-registo-modal.tsx` — loading no organismo; auto-select; mensagem se utente sem organismo |
| FE | (opcional) reutilizar helper `buildOrganismoOptions` noutros modais |

**Comportamento:**
1. Mudar utente → `getUtente` → popular dropdown
2. Auto-seleccionar 1.º organismo
3. Se lista vazia → toast “Utente sem organismo — configure na ficha”
4. Não permitir guardar enquanto `utenteQuery.isFetching` após mudança de utente

**Testes UAT:**
1. Utente Teste com organismo → organismo preenchido automaticamente
2. Utente sem organismo → mensagem clara
3. Guardar registo → organismo persistido na admissão

**Estimativa:** 0,5–1 dia

---

### PR-A3 — B5 Sync agregados no save (decisão + implementação)

**Objectivo:** Alinhar com legado (`LOTESP`/`LOTES` no save) ou documentar explicitamente que só `Corrigir Lotes` sincroniza.

**Opção recomendada:** `TentarAutoCorrigirAgregadosAsync` após save (já existe parcialmente) — validar paridade com `LotdirectEdtSave`.

| Camada | Ficheiros |
|--------|-----------|
| BE | `LoteDirectService.cs` |
| BE | Executores agregados existentes |
| Doc | Actualizar `disparidades-lancamento-credenciais-legado-vs-novo.md` com decisão |

**Testes UAT:**
1. Gravar lançamento novo → agregados correctos sem clicar “Corrigir lotes”
2. Editar linhas → agregados actualizados

**Estimativa:** 1–2 dias (se Opção B já estiver estável, só validação)

---

### PR-A4 — Credenciais SNS Fisioterapia (só lançamento)

**Objectivo:** Módulo `credenciais-sns/fisioterapia` deixa de estar vazio; paridade `LOTESPFISIO` legado **sem** faturação.

**Legado:** `CredenciaisSnsLst` fisioterapia + `Dados` tratamentos/credenciais

| Camada | Ficheiros |
|--------|-----------|
| BE | Novo serviço ou extensão `CredenciaisSns` / gateway `LOTESPFISIO` |
| BE | Controller + DTOs |
| FE | `listagem-credenciais-sns-fisioterapia-page.tsx` (ou equivalente) |
| FE | Rotas `area-financeira` / menu SNS — **só listagem/lançamento** |

**Pré-requisito:** Confirmar tabelas legado (`dbo` vs schema) antes de EF.

**Testes UAT:**
1. Listar credenciais fisio por organismo/mês
2. Ver / filtrar como especialidades

**Estimativa:** 5–8 dias

---

### PR-A5 — Filtros e colunas LoteDirect (L1, L6)

**Objectivo:** Completar listagem admin conforme legado `LotdirectLst`.

| Camada | Ficheiros |
|--------|-----------|
| BE | `LoteDirectSearchTable.cs`, `LoteDirectTableFilter.cs` |
| FE | `listagem-lote-direct-page.tsx`, filtros, colunas |

**Estimativa:** 2–3 dias

---

### PR-A6 — Seeds dados mestre

**Objectivo:** Novos ambientes nascem com grupos sanguíneos (8) e habilitações base.

| Camada | Ficheiros |
|--------|-----------|
| BE | Nova migration `Seed_GrupoSanguineo_Habilitacao` (GUIDs fixos) |
| BE | Enum `GrupoSanguineo.cs` como referência de descrições |

**Estimativa:** 0,5 dia

---

### PR-A7 — Consentimentos utente (opcional nesta fase)

**Objectivo:** Tab “Outras informações” — checkbox + datas + persistência (paridade `UtentesEdt.js`).

| Camada | Ficheiros |
|--------|-----------|
| FE | `tab-outras-informacoes.tsx`, `utente-edit-form-types.ts`, `utente-edit-form.ts`, `utente-edit-payload.ts`, `utente-edit-page.tsx` |

**Nota:** Só avançar quando fecharem a tab; não bloqueia credenciais.

---

### Ordem de merge Fase A

```
PR-A2 (ordem entrada)  → rápido, desbloqueia utilizadores
PR-A1 (validações ESP) → crítico credenciais
PR-A3 (B5 sync)        → após A1 estável
PR-A6 (seeds)          → paralelo
PR-A4 (fisio SNS)      → se cliente confirmar fisio
PR-A5 (filtros)        → polish
PR-A7 (consentimentos) → quando houver tempo
```

---

## 4. Fase B — Plano de PRs (Tratamentos operacional)

**Só iniciar se o cliente usa fisioterapia/rehab no dia-a-dia.**  
**Excluído:** faturação tratamentos, credenciais fatura, mapas Crystal.

---

### PR-B0 — Terapeutas API (read + listagem mínima)

**Objectivo:** Combo/lista de terapeutas para matrículas modalidades e admissões tratamentos.

**Legado:** `Dados/CliCloud.Dados.Tratamentos/Terapeutas.cs`, tabela `TERAPEUTA` / `c_tecnico`

| Camada | Ficheiros |
|--------|-----------|
| BE | `Terapeuta` entity (mapear tabela legado) OU gateway SQL |
| BE | `TerapeutaService`, `TerapeutaController`, DTOs Light |
| FE | Lookup em admissões / modalidades futuras |

**Estimativa:** 3–5 dias

---

### PR-B1 — Substituir placeholder Tratamentos admin

**Objectivo:** Rota `/area-administrativa/tratamentos` deixa de ser placeholder; hub com submenu.

| Camada | Ficheiros |
|--------|-----------|
| FE | `areaAdministrativa.tsx` — rotas |
| FE | `menu-items.ts`, `area-administrativa-module.ts` — permissões `tratamentos` |
| FE | Página hub `tratamentos/pages/tratamentos-hub-page.tsx` |

**Estimativa:** 1 dia

---

### PR-B2 — Admissões diárias tratamentos

**Objectivo:** Primeiro fluxo operacional (presentes, por local, por hora).

**Legado:** `AdmissoesDiarias*.aspx`, `WSTratamentos`

| Camada | Ficheiros |
|--------|-----------|
| BE | Serviços admissão tratamento (avaliar reutilizar `Admissao` vs entidade tratamento) |
| FE | Listagem + filtros por data/local |

**Estimativa:** 8–15 dias

---

### PR-B3 — Planning / marcações (fatias)

Dividir em sub-PRs conforme legado:
- B3a — Lista espera prescrições tratamentos
- B3b — Marcações manuais
- B3c — Planning geral

**Estimativa:** 15–30 dias (módulo grande)

---

### Ordem de merge Fase B

```
PR-B0 (terapeutas) → obrigatório
PR-B1 (hub UI)
PR-B2 (admissões diárias) → MVP operacional
PR-B3* (planning) → incremental
```

---

## 5. Matriz de responsabilidades

| Área | Vossa equipa | Outra equipa / adiado |
|------|--------------|------------------------|
| LoteDirect / credenciais admin | ✅ | |
| Consultas admin (marcações, admissões, ordem entrada) | ✅ | |
| Credenciais SNS lançamento (incl. fisio) | ✅ | |
| Credenciais SNS faturação / ficheiro eletrónico | | 🔇 Faturação |
| Documentos / CC / tesouraria / ADSE | | 🔇 Faturação |
| Prescrição / medicação | | 🔇 Medicação |
| Modalidades | Opcional (Fase C) | |
| Gestão / dashboards | | ⏳ Baixa prioridade |

---

## 6. Checklist de testes por release (Fase A)

- [ ] Criar/editar/apagar lançamento credenciais consultas
- [ ] Passar histórico + passar ativo (1 credencial) + verificar ESP
- [ ] Obter novo lote ao mudar organismo/mês/ano
- [ ] Corrigir lotes
- [ ] Ver desde SNS → listagem filtrada (sidebar Faturação)
- [ ] Ordem entrada: utente com organismo → guardar OK
- [ ] Marcações + admissões smoke test
- [ ] Legado e novo na mesma BD: mesmo utente credenciais não divergem (se paralelo)

---

## 7. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Validar ESP sem entidade Domain errada | Gateway SQL como `LoteDirectEspHistoricoGateway` |
| Schema `dbo` vs `Credenciais` | Seguir tabelas já mapeadas em LoteDirect |
| Fisio sem modelo claro | Ler `LOTESPFISIO` legado antes de PR-A4 |
| Tratamentos scope creep | B2 MVP antes de B3 planning |
| Paralelo legado/novo | Testar mesmo registo nas duas UIs |

---

## 8. Critérios de “Fase A concluída”

1. UAT credenciais consultas sem blockers conhecidos (validações ESP OK)
2. Ordem entrada e fluxos consultas admin sem bugs P1
3. Documento `disparidades-lancamento-credenciais-legado-vs-novo.md` actualizado
4. Cliente aceita usar novo stack para **consultas + credenciais admin** (mesmo com legado em paralelo para faturação)

---

## 9. Critérios de “Fase B concluída” (MVP)

1. Terapeutas listáveis no novo stack
2. Admissões diárias tratamentos utilizáveis
3. Placeholder `/area-administrativa/tratamentos` removido

---

*Documento vivo — actualizar após cada PR mergeado.*
