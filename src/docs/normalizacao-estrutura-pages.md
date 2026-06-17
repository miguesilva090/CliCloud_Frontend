# Normalização da estrutura de `pages/`

> **Data:** 2026-06-17 (atualizado)  
> **Objetivo:** Inventariar entidades/pastas que ainda não seguem o padrão canónico CRUD.

## Padrão canónico (referência)

```
{entidade}/
  components/   listagem-{plural}-table.tsx, listagem-{plural}-table.columns.tsx, listagem-{plural}-filter-controls.tsx
  modals/       {entidade}-view-create-modal.tsx
  pages/        listagem-{plural}-page.tsx
  queries/      listagem-{plural}-queries.ts
```

**Blueprint:** `area-financeira/faturacao/tabelas/pagamentos/modo-pagamento/`

### Extensão — entidades com edição complexa (Fase B)

Entidades com formulário multi-tab (utentes, médicos, técnicos, etc.) acrescentam pastas locais na mesma raiz da entidade:

```
{entidade}/
  components/   listagem-* + `{entidade}-edit-tabs/` (padrão unificado em entidades/)
  modals/       (quando aplicável)
  pages/        listagem-*-page.tsx, {entidade}-edit-page.tsx, {entidade}-details-page.tsx
  queries/      listagem-*-queries.ts + {entidade}-queries.ts (CRUD edit)
  types/        {entidade}-edit-form-types.ts
  utils/        {entidade}-edit-form.ts, *-payload.ts, *-validation.ts
  constants/    (opcional)
```

**Regra:** sem duplicação em `pages/{entidade}/` na raiz do projeto.

---

## Resumo

| Estado | Quantidade | Descrição |
|--------|------------|-----------|
| **Completo** | 47+ | 4 pastas + naming `listagem-*` / `*-view-create-modal` |
| **Parcial** | ~20 | 4 pastas presentes, mas naming legado ou modal/fluxo diferente |
| **Incompleto** | ~7 | Falta pelo menos uma das 4 pastas CRUD |
| **Legado raiz** | 0 | ✅ Fase B concluída — `pages/utentes`, `medicos`, `organismos`, `fornecedores`, `tecnicos`, `empresas` removidos |
| **Fora do CRUD** | vários | Configuração, editores, fluxos clínicos — exceção documentada |

**Total de módulos com `listagem-*-page.tsx`:** 86 ficheiros / ~83 entidades distintas.

---

## ✅ Fase B concluída — consolidação `entidades/` (2026-06-17)

Implementação unificada em `area-comum/tabelas/entidades/{entidade}/`. Pastas legacy `pages/{entidade}/` eliminadas.

| Entidade | Path canónico | Notas |
|----------|---------------|-------|
| Utentes | `.../entidades/utentes` | `listagem-utentes-table*`, `utente-edit-tabs/`, `types/`, `utils/`, queries edit + RNU |
| Médicos | `.../entidades/medicos` | `listagem-medicos-table*`, `medico-edit-tabs/`, `types/`, `utils/` |
| Organismos | `.../entidades/organismos` | Listagem CRUD + `organismo-edit-tabs/`, `constants/` |
| Fornecedores | `.../entidades/fornecedores` | Listagem + `fornecedor-edit-tabs/` (sem modal CRUD) |
| Empresas | `.../entidades/empresas` | `empresa-edit-tabs/`, listagem CRUD |
| Técnicos | `.../entidades/tecnicos` | `tecnico-edit-tabs/`, `types/`, queries horário |
| Centros saúde | `.../entidades/centros-saude` | `centro-saude-edit-tabs/`, listagem CRUD |

---

## ✅ Já normalizados (47) — CRUD simples

Estes módulos cumprem o padrão completo. Servem de referência para novos CRUDs.

<details>
<summary>Expandir lista completa</summary>

| Path |
|------|
| `area-administrativa/tabelas/motivos-consulta` |
| `area-administrativa/tabelas/salas` |
| `area-administrativa/tabelas/tipos-carta` |
| `area-comum/tabelas/consultas/alergias` |
| `area-comum/tabelas/consultas/graus-alergia` |
| `area-comum/tabelas/consultas/margem-medicos` |
| `area-comum/tabelas/consultas/servicos/servicos` |
| `area-comum/tabelas/consultas/servicos/subsistemas-servicos` |
| `area-comum/tabelas/consultas/servicos/tipos-servico` |
| `area-comum/tabelas/entidades/funcionarios` |
| `area-comum/tabelas/entidades/medicos-externos` |
| `area-comum/tabelas/entidades/organismos` |
| `area-comum/tabelas/exames/acordos` |
| `area-comum/tabelas/exames/analises` |
| `area-comum/tabelas/exames/categoria-procedimento` |
| `area-comum/tabelas/exames/tipos-exame` |
| `area-comum/tabelas/stocks/vias-administracao` |
| `area-comum/tabelas/tabelas/bancos` |
| `area-comum/tabelas/tabelas/categorias-das-especialidades` |
| `area-comum/tabelas/tabelas/contas-bancarias` |
| `area-comum/tabelas/tabelas/entidades-financeiras-responsaveis` |
| `area-comum/tabelas/tabelas/especialidades` |
| `area-comum/tabelas/tabelas/estados-civis` |
| `area-comum/tabelas/tabelas/feriados` |
| `area-comum/tabelas/tabelas/graus-parentesco` |
| `area-comum/tabelas/tabelas/grupos-sanguineos` |
| `area-comum/tabelas/tabelas/habilitacoes` |
| `area-comum/tabelas/tabelas/moedas` |
| `area-comum/tabelas/tabelas/motivo-isencao` |
| `area-comum/tabelas/tabelas/motivo-retencao` |
| `area-comum/tabelas/tabelas/notificacao-tipos` |
| `area-comum/tabelas/tabelas/profissoes` |
| `area-comum/tabelas/tabelas/proveniencias-utentes` |
| `area-comum/tabelas/tabelas/sexos` |
| `area-comum/tabelas/tabelas/taxas-iva` |
| `area-comum/tabelas/tabelas/tipos-entidade` |
| `area-comum/tabelas/tratamentos/estados-lista-espera` |
| `area-comum/tabelas/tratamentos/goniometrias` |
| `area-comum/tabelas/tratamentos/locais-tratamento` |
| `area-comum/tabelas/tratamentos/patologias` |
| `area-comum/tabelas/tratamentos/prioridades` |
| `area-comum/tabelas/tratamentos/regioes-corpo` |
| `area-comum/tabelas/tratamentos/tipos-de-dor` |
| `area-financeira/faturacao/tabelas/documentos/natureza-documento` |
| `area-financeira/faturacao/tabelas/documentos/series-documento` |
| `area-financeira/faturacao/tabelas/pagamentos/condicao-pagamento` |
| `area-financeira/faturacao/tabelas/pagamentos/modo-pagamento` |

</details>

---

## 🟡 Parcial — 4 pastas OK, naming ou fluxo em falta

### ✅ Fase A concluída — geograficas, recibos e tratamentos

Geográficas (6), recibos e tratamentos (7) com `listagem-*-queries.ts` e componentes `listagem-*`.

### Prioridade média — modal/fluxo diferente do CRUD canónico

| Entidade | Path | Situação |
|----------|------|----------|
| Clínicas | `area-comum/tabelas/configuracao/clinicas` | `listagem-clinicas-queries.ts` + `clinica-queries.ts`; `clinica-edit-tabs/`; edit em página |
| Doenças | `area-comum/tabelas/consultas/doencas` | Sem `*-view-create-modal` |
| Estado sinistro | `.../estado-sinistro` | Sem `*-view-create-modal` |
| Tipos consulta | `.../tipos-consultas` | Sem `*-view-create-modal` |
| Notificações | `area-comum/tabelas/tabelas/notificacoes` | Modals separados (`notificacao-view-modal`, `notificacao-create-modal`) |
| Atestados | `area-clinica/processo-clinico/atestados` | `listagem-atestados-*` + `novo-atestado-page` (fluxo) + `atestado-view-modal` |
| Fornecedores | `.../entidades/fornecedores` | Edit em página dedicada (sem modal CRUD) |
| Utentes, Médicos, Técnicos | `.../entidades/*` | Edit multi-tab em página (exceção legítima) |
| Empresas, Centros saúde | `.../entidades/*` | Edit em página (sem modal CRUD) |

### Prioridade baixa — workflows (não são CRUD simples)

Fluxos operacionais com listagem; modal canónico pode não aplicar.

| Entidade | Path | Situação |
|----------|------|----------|
| Admissões | `area-administrativa/consultas/admissoes` | Listagem + `nova-admissao-page` / `editar-admissao-page` |
| Global booking | `.../global-booking` | Sem modal CRUD canónico |
| Lista espera | `.../lista-espera` | idem |
| Marcações | `.../marcacoes` | Listagem + calendário/disponibilidade |
| Ordem entrada | `.../ordem-entrada` | idem |
| Sinistrados | `.../sinistrados` | `sinistrado-view-edit-modal`, `novo-sinistrado-page` |
| Credenciais | `area-administrativa/credenciais` | Modals custom (`lote-direct-view-modal`, etc.) |

---

## 🔴 Incompleto — falta pasta(s) da estrutura 4-way

| Entidade | Path | Pastas em falta | Notas |
|----------|------|-----------------|-------|
| Histórico (admin) | `area-administrativa/consultas/historico` | — | `listagem-historico-*`; filtro em `modals/` (não modal CRUD canónico) |
| Agenda | `area-clinica/processo-clinico/agenda` | `components` | Calendário/mapa — exceção legítima |
| Histórico (clínica) | `area-clinica/processo-clinico/historico` | `components`, `modals` | `listagem-consultas-efetuadas-queries.ts`; páginas de mapa/fluxo |
| Grupo vias admin. | `area-comum/tabelas/stocks/grupo-vias-administracao` | `modals` (opcional) | Edit em página — exceção legítima; estrutura já coesa no path canónico |
| Faturação | `area-financeira/faturacao` | `modals` (opcional) | Listagem + `documento-editor/` — `listagem-faturacao-queries.ts` separado do editor |

> Utentes, médicos, organismos, fornecedores, empresas, técnicos e centros-saúde saíram desta lista após Fase B.

---

## 🟠 Legado em `pages/` (raiz)

**Estado:** ✅ resolvido (2026-06-17)

| Pasta raiz (removida) | Destino |
|-----------------------|---------|
| `pages/utentes/` | `area-comum/.../entidades/utentes/` |
| `pages/medicos/` | `area-comum/.../entidades/medicos/` |
| `pages/organismos/` | `area-comum/.../entidades/organismos/` |
| `pages/fornecedores/` | `area-comum/.../entidades/fornecedores/` |
| `pages/tecnicos/types/` | `area-comum/.../entidades/tecnicos/types/` |
| `pages/empresas/types/` | já em `area-comum/.../entidades/empresas/types/` |

### Stubs / resíduos

| Path | Conteúdo | Ação |
|------|----------|------|
| `pages/base/utilitarios-dashboard/` | Dashboard utilitários | Manter; não é CRUD |

---

## ⚪ Fora do padrão CRUD — exceções legítimas (não priorizar)

Módulos que não são tabelas CRUD com modal; estrutura própria é aceitável.

### Configuração (`area-comum/tabelas/configuracao/`)

| Módulo | Estrutura | Notas |
|--------|-----------|-------|
| `sms`, `email`, `voz` | Só `pages/` (+ components pontuais) | Config + histórico |
| `webservices`, `teleconsulta` | Só `pages/` | Config |
| `referencias-mb`, `carta-conducao`, `exames-sem-papel` | Só `pages/` | Config |
| `separadores`, `separadores-personalizados` | Só `pages/` | Config |
| `documentos` | `components/` + `pages/` | Sem `queries/` nem `modals/` na entidade; editor próprio |

### Processo clínico (`area-clinica/processo-clinico/`)

| Módulo | Estrutura | Notas |
|--------|-----------|-------|
| `atendimento/` | `pages/`, `queries/`, componentes aninhados | Ficha clínica, consultas do dia |
| `exames/` | `pages/` | Exames sem papel |
| `tabelas/*` | Só `pages/` | alergias, medicamentos, patologias, etc. (clínica local) |
| `fecho-diario`, `troca-medicos` | Flat | Operacional |

### Financeira — editores

| Módulo | Path | Notas |
|--------|------|-------|
| Editor documento | `area-financeira/faturacao/` | `documento-editor`, hooks, queries partilhadas |
| Emissão | `area-financeira/documentos/` | Fluxo emissão, não listagem CRUD |

---

## Plano de normalização sugerido

### Fase A — Baixo risco (renaming) ✅ concluída

1. Geográficas (6): renomear queries/tables para `listagem-*`
2. Tratamentos (7): renomear queries para `listagem-*-queries.ts`
3. Recibos: `recibo-queries.ts` → `listagem-recibos-queries.ts`

### Fase B — Consolidação entidades ✅ concluída

1. Utentes e médicos: unificar shell + `pages/{entidade}/` numa só pasta
2. Fornecedores, organismos, empresas, técnicos, centros-saúde: mover edit para pasta da entidade
3. Remover stubs `pages/empresas/types/`, `pages/tecnicos/types/`

### Fase C — Decisão arquitetural ✅ concluída (baixo risco)

> **Princípio aplicado:** alinhar naming `listagem-*` dentro de cada módulo; separar queries de listagem vs fluxo; **não** mover `documento-editor/` nem workflows operacionais.

| Módulo | Alteração | Mantido sem mudança |
|--------|-----------|---------------------|
| Atestados | `listagem-atestados-table/`, `listagem-atestados-queries.ts`; fluxo em `atestado-queries.ts` + `novo-atestado-page` | `atestado-view-modal`, `utils/` |
| Faturação | `listagem-faturacao-queries.ts` (facade da listagem) | `documento-editor/`, `documento-queries.ts` (editor e mutações partilhadas) |
| Ordem entrada | `listagem-ordem-entrada-filter-controls.tsx` | modals e `ordem-entrada-registo-queries.ts` |
| Admissões, marcações, sinistrados, credenciais | Já com `listagem-*` — **exceção documentada** (fluxo operacional) | páginas `nova-*` / `editar-*`, modals custom |

**Padrão workflow (exceção legítima):**

```
{modulo}/
  components/   listagem-*-table*
  modals/       modals de domínio (não *-view-create-modal canónico)
  pages/        listagem-*-page.tsx + páginas de fluxo (nova-*, editar-*)
  queries/      listagem-*-queries.ts + *-form-queries.ts / registo-queries.ts
  utils/        (opcional)
```

### Fase D — Clínica / configuração ✅ concluída (baixo risco)

| Módulo | Alteração |
|--------|-----------|
| Clínicas | `listagem-clinicas-queries.ts`; edit em `clinica-queries.ts`; `components/tabs/` → `clinica-edit-tabs/` |
| Histórico admin | `listagem-historico-consultas-administrativo-queries.ts`; filtro → `modals/` |
| Histórico clínica | `listagem-consultas-efetuadas-queries.ts` (consumido também por ficha clínica) |
| Agenda, atendimento, config flat | **Exceção documentada** — sem forçar CRUD modal |

### Fase E — Limpeza de duplicados ✅ concluída (2026-06-17)

| Módulo | Alteração |
|--------|-----------|
| Utentes | `utentes-table/` → `listagem-utentes-table.tsx` (+ `.columns`, `-filter-controls`) |
| Médicos | `medicos-table/` → `listagem-medicos-table.tsx` (+ `.columns`, `-filter-controls`) |
| Geográficas (utilitários) | Páginas `*-page.tsx` usam `Listagem*Table` canónico |
| Geográficas (resíduo) | Removidas pastas `*-table/`; `listagem-*-cell-actions.tsx` na raiz de `components/` |
| Atestados | `listagem-atestados-table/` achatado para ficheiros em `components/` |
| Margem médicos | `listagem-margem-medicos-table.columns.tsx` (naming canónico) |

**Padrão configuração / clínica (exceção legítima):**

```
{modulo}/
  components/   listagem-* ou componentes de domínio (calendário, ficha, etc.)
  modals/       quando aplicável (filtros, view)
  pages/        listagem + fluxos dedicados
  queries/      listagem-*-queries.ts + queries de domínio
  utils/        (opcional)
```

---

## Critérios de verificação

Um módulo CRUD simples está **normalizado** quando:

- [ ] Existe `components/`, `modals/`, `pages/`, `queries/`
- [ ] `pages/listagem-{plural}-page.tsx`
- [ ] `queries/listagem-{plural}-queries.ts`
- [ ] `components/listagem-{plural}-table.tsx` (+ `.columns.tsx`, `-filter-controls.tsx`)
- [ ] `modals/{entidade}-view-create-modal.tsx`
- [ ] Rotas e imports atualizados
- [ ] Sem duplicação em `pages/{entidade}/` na raiz (exceto exceção documentada)

Entidades com **edição complexa** acrescentam `types/`, `utils/` e tabs em `components/`, mantendo listagem canónica quando existir.

---

## Referências

- Implementação Pagamentos: `src/docs/implementacao-pagamentos-condicao-modo.md`
- Blueprint: `src/pages/area-financeira/faturacao/tabelas/pagamentos/modo-pagamento/`
- Rotas entidades: `src/config/entity-routes.ts`

