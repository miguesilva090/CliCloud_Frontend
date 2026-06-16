# Normalização da estrutura de `pages/`

> **Data:** 2026-06-16  
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

---

## Resumo

| Estado | Quantidade | Descrição |
|--------|------------|-----------|
| **Completo** | 47 | 4 pastas + naming `listagem-*` / `*-view-create-modal` |
| **Parcial** | 26* | 4 pastas presentes, mas naming legado ou modal/fluxo diferente |
| **Incompleto** | 12 | Falta pelo menos uma das 4 pastas |
| **Legado raiz** | 5 | Implementação em `pages/{entidade}/` fora da área temática |
| **Fora do CRUD** | vários | Configuração, editores, fluxos clínicos — exceção documentada |

\* `sinistrados` aparece duplicado na auditoria (2 páginas de listagem no mesmo módulo).

**Total de módulos com `listagem-*-page.tsx`:** 86 ficheiros / ~83 entidades distintas.

---

## ✅ Já normalizados (47)

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

## 🟡 Parcial — 4 pastas OK, naming ou fluxo em falta (26)

### Prioridade alta — renaming cosmético (geográficas)

Têm `components/`, `modals/`, `pages/`, `queries/` mas ficheiros com naming legado.

| Entidade | Path | O que falta renomear |
|----------|------|----------------------|
| Países | `area-comum/tabelas/tabelas/geograficas/paises` | `paises-queries.ts` → `listagem-paises-queries.ts`; `paises-table/` → `listagem-paises-*` |
| Distritos | `.../geograficas/distritos` | `distritos-queries.ts`; `distritos-listagem-table.tsx` |
| Concelhos | `.../geograficas/concelhos` | `concelhos-queries.ts`; `concelhos-listagem-table.tsx` |
| Freguesias | `.../geograficas/freguesias` | `freguesias-queries.ts`; `freguesias-listagem-table.tsx` |
| Códigos postais | `.../geograficas/codigospostais` | `codigospostais-queries.ts`; `codigospostais-listagem-table.tsx` |
| Ruas | `.../geograficas/ruas` | `ruas-queries.ts`; `ruas-listagem-table.tsx` |

> Nota: geografias também têm páginas create/update e `*-forms/` — podem manter-se como exceção de fluxo híbrido.

### Prioridade média — queries sem prefixo `listagem-`

| Entidade | Path | Pendente |
|----------|------|----------|
| Aparelhos | `area-comum/tabelas/tratamentos/aparelhos` | `listagem-aparelhos-queries.ts` (atual: naming diferente) |
| Fraquezas musculares | `.../fraquezas-musculares` | idem |
| Marcas aparelho | `.../marcas-aparelho` | idem |
| Modelos aparelho | `.../modelos-aparelho` | idem |
| Motivos alta | `.../motivos-alta` | idem |
| Motivos desmarcação | `.../motivos-desmarcacao` | idem |
| Tipos aparelho | `.../tipos-aparelho` | idem |

### Prioridade média — modal/fluxo diferente do CRUD canónico

| Entidade | Path | Situação |
|----------|------|----------|
| Clínicas | `area-comum/tabelas/configuracao/clinicas` | Sem `*-view-create-modal`; queries `clinicas-queries.ts`; edit em `clinica-edit-page` |
| Doenças | `area-comum/tabelas/consultas/doencas` | Sem `*-view-create-modal` |
| Estado sinistro | `.../estado-sinistro` | Sem `*-view-create-modal` |
| Tipos consulta | `.../tipos-consultas` | Sem `*-view-create-modal` |
| Notificações | `area-comum/tabelas/tabelas/notificacoes` | Modals separados (`notificacao-view-modal`, `notificacao-create-modal`) |
| Atestados | `area-clinica/processo-clinico/atestados` | `atestados-table/`, `atestados-queries.ts`, `atestado-view-modal` (só view) |

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

## 🔴 Incompleto — falta pasta(s) da estrutura 4-way (12)

| Entidade | Path | Pastas em falta | Notas |
|----------|------|-----------------|-------|
| Histórico (admin) | `area-administrativa/consultas/historico` | `modals` | Filtro em componente, não modal canónico |
| Agenda | `area-clinica/processo-clinico/agenda` | `components` | Calendário/mapa — exceção legítima |
| Histórico (clínica) | `area-clinica/processo-clinico/historico` | `components`, `modals` | Consultas efetuadas |
| Centros saúde | `area-comum/tabelas/entidades/centros-saude` | `modals` | Edit em `centro-saude-edit-page` |
| Empresas | `area-comum/tabelas/entidades/empresas` | `modals` | Edit em `empresa-edit-page` |
| Fornecedores | `area-comum/tabelas/entidades/fornecedores` | `modals` | Edit em `pages/fornecedores/` |
| Médicos | `area-comum/tabelas/entidades/medicos` | `modals`, `queries` | Shell → `pages/medicos/` |
| Técnicos | `area-comum/tabelas/entidades/tecnicos` | `modals` | Edit em `tecnico-edit-page` |
| Utentes | `area-comum/tabelas/entidades/utentes` | `components`, `modals`, `queries` | Shell → `pages/utentes/` |
| Grupo vias admin. | `area-comum/tabelas/stocks/grupo-vias-administracao` | `modals` | CRUD via `grupo-vias-administracao-edit-page` |
| Faturação | `area-financeira/faturacao` | `modals` | Listagem + editor documento (estrutura própria) |
| Recibos | `area-financeira/recibos` | `modals` | `recibo-queries.ts` sem prefixo `listagem-` |

---

## 🟠 Legado em `pages/` (raiz) — consolidar ou documentar exceção

Implementação real fora da pasta temática `area-comum/.../entidades/`.

| Pasta raiz | Estrutura atual | Listagem canónica | Ação sugerida |
|------------|-----------------|-------------------|---------------|
| `pages/utentes/` | `components/`, `pages/`, `queries/`, `utils/`, `types/` | Shell em `area-comum/.../utentes/` | Migrar tudo para pasta da entidade ou inverter (shell aponta para raiz) |
| `pages/medicos/` | `components/`, `pages/`, `queries/`, `utils/`, `types/` | Shell em `area-comum/.../medicos/` | idem |
| `pages/fornecedores/` | `components/`, `pages/`, `queries/` (só edit) | Listagem em `area-comum/.../fornecedores/` | Mover edit para dentro da entidade |
| `pages/organismos/` | `components/`, `pages/`, `queries/` (só edit) | Listagem canónica em `area-comum/.../organismos/` | Mover edit para dentro da entidade |
| `pages/empresas/types/` | Só `empresa-edit-form-types.ts` | — | **Remover stub**; tipos já em `area-comum/.../empresas/` |

### Stubs / resíduos

| Path | Conteúdo | Ação |
|------|----------|------|
| `pages/base/utilitarios-dashboard/` | Dashboard utilitários | Manter; não é CRUD |
| `pages/empresas/types/` | Tipos partilhados | Eliminar após confirmar imports |

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

### Fase A — Baixo risco (renaming)

1. Geográficas (6): renomear queries/tables para `listagem-*`
2. Tratamentos (7): renomear queries para `listagem-*-queries.ts`
3. Recibos: `recibo-queries.ts` → `listagem-recibos-queries.ts`

### Fase B — Consolidação entidades

1. Utentes e médicos: unificar shell + `pages/{entidade}/` numa só pasta
2. Fornecedores, organismos, empresas, técnicos, centros-saúde: mover edit para pasta da entidade
3. Remover `pages/empresas/types/`

### Fase C — Decisão arquitetural

1. Workflows admin (admissões, marcações, sinistrados): documentar exceção ou criar subpastas `listagem/` vs `fluxo/`
2. Faturação/recibos: separar `listagem-documentos/` de `documento-editor/`
3. Atestados: alinhar com padrão ou manter como fluxo clínico

### Fase D — Clínica / configuração

Avaliar caso a caso; maioria não beneficia do padrão CRUD modal.

---

## Critérios de verificação

Um módulo está **normalizado** quando:

- [ ] Existe `components/`, `modals/`, `pages/`, `queries/`
- [ ] `pages/listagem-{plural}-page.tsx`
- [ ] `queries/listagem-{plural}-queries.ts`
- [ ] `components/listagem-{plural}-table.tsx` (+ `.columns.tsx`, `-filter-controls.tsx`)
- [ ] `modals/{entidade}-view-create-modal.tsx`
- [ ] Rotas e imports atualizados
- [ ] Sem duplicação em `pages/{entidade}/` na raiz (exceto exceção documentada)

---

## Referências

- Implementação Pagamentos: `src/docs/implementacao-pagamentos-condicao-modo.md`
- Blueprint: `src/pages/area-financeira/faturacao/tabelas/pagamentos/modo-pagamento/`
