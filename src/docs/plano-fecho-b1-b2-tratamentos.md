# Fecho B1/B2 Tratamentos — implementação + testes

**Estado (2026-07-31):** pacotes §1–§4 **implementados e verificados no código**.  
**Title global:** `PageHead` → sempre `"CliCloud"` (feito).  
**Pendente:** UAT manual (secção abaixo).

**Legado (comportamento):** `AdmissoesLst.js` (~1248) + `Admissoes.cs` `ActualizaSituacao*` / `AtualizaFaltasTratamento`.

Abaixo: código de referência (já aplicado). No fim: **checklist UAT**.

---

## 1. Regras Confirmado / Efectuado / Faltou + actualizar `NFalta`

### Paridade legado

| Acção | Se já… | Resultado |
|-------|--------|-----------|
| Confirmado=1 ou Efectuado=1 | Faltou | Erro (não grava) |
| Faltou=1 | Efectuado | Erro |
| Faltou=1 | Confirmado | Erro (no legado; há que desmarcar Confirmado primeiro) |
| Faltou 0→1 / 1→0 | — | Actualizar `Tratamento.NFalta` (+1 / −1, mín. 0) |
| Confirmado=1 | — | Limpa Faltou (já existe) |
| Faltou=1 (após validar) | — | Limpa Confirmado (já existe) |

Histórico sessão / planning / avisos utente: **fora deste passo**.

### Editar

`Backend/CliCloud.Application/Services/Tratamentos/AdmissaoTratamentoAdministrativoService/AdmissaoTratamentoAdministrativoService.cs`

Substituir o método `UpdateSituacaoAsync` por:

```csharp
  public async Task<Response<Guid>> UpdateSituacaoAsync(
    Guid id,
    UpdateAdmissaoTratamentoSituacaoRequest request
  )
  {
    SessaoTratamento? entity = await _repository.GetByIdAsync<SessaoTratamento, Guid>(id);
    if (entity == null)
    {
      return ResponseFactory.Fail<Guid>("Sessão de tratamento não encontrada.");
    }

    string campo = request.Campo.Trim().ToLowerInvariant();
    int valor = request.Valor;
    int faltouAntes = entity.Faltou ?? 0;

    switch (campo)
    {
      case "confirmado":
        if (valor == 1 && (entity.Faltou ?? 0) == 1)
        {
          return ResponseFactory.Fail<Guid>(
            "Não é possível marcar confirmado: a sessão já está marcada como faltou."
          );
        }
        entity.Confirmado = valor;
        if (valor == 1)
        {
          entity.Faltou = 0;
        }
        break;

      case "efetuado":
        if (valor == 1 && (entity.Faltou ?? 0) == 1)
        {
          return ResponseFactory.Fail<Guid>(
            "Não é possível marcar efectuado: a sessão já está marcada como faltou."
          );
        }
        entity.Efetuado = valor;
        break;

      case "faltou":
        if (valor == 1 && (entity.Efetuado ?? 0) == 1)
        {
          return ResponseFactory.Fail<Guid>(
            "Não é possível marcar faltou: a sessão já está marcada como efectuada."
          );
        }
        if (valor == 1 && (entity.Confirmado ?? 0) == 1)
        {
          return ResponseFactory.Fail<Guid>(
            "Não é possível marcar faltou: a sessão já está marcada como confirmada. Desmarque confirmado primeiro."
          );
        }
        entity.Faltou = valor;
        if (valor == 1)
        {
          entity.Confirmado = 0;
        }
        break;

      default:
        return ResponseFactory.Fail<Guid>("Campo de situação inválido.");
    }

    // Paridade AtualizaFaltasTratamento (totais) — consecutivo/planning fora deste passo
    if (campo == "faltou" && valor != faltouAntes)
    {
      Tratamento? tratamento = await _repository.GetByIdAsync<Tratamento, Guid>(
        entity.TratamentoId
      );
      if (tratamento != null)
      {
        int n = tratamento.NFalta ?? 0;
        if (valor == 1)
        {
          tratamento.NFalta = n + 1;
        }
        else
        {
          tratamento.NFalta = Math.Max(0, n - 1);
        }
        _ = await _repository.UpdateAsync<Tratamento, Guid>(tratamento);
      }
    }

    try
    {
      _ = await _repository.UpdateAsync<SessaoTratamento, Guid>(entity);
      _ = await _repository.SaveChangesAsync();
    }
    catch (Exception ex) when (ex.Message.Contains("Nada a ser atualizado"))
    {
      return ResponseFactory.Success(entity.Id);
    }

    return ResponseFactory.Success(entity.Id);
  }
```

### Editar (opcional UX — validar antes do PUT)

`Frontend/src/pages/area-administrativa/tratamentos/admissoes/pages/listagem-admissoes-tratamento-page.tsx`

No início de `onToggle`, antes do `try`:

```tsx
  if (campo === 'confirmado' && valor === 1 && row.faltou === 1) {
    toast.error(
      'Não é possível marcar confirmado: a sessão já está marcada como faltou.'
    )
    return
  }
  if (campo === 'efetuado' && valor === 1 && row.faltou === 1) {
    toast.error(
      'Não é possível marcar efectuado: a sessão já está marcada como faltou.'
    )
    return
  }
  if (campo === 'faltou' && valor === 1 && row.efetuado === 1) {
    toast.error(
      'Não é possível marcar faltou: a sessão já está marcada como efectuada.'
    )
    return
  }
  if (campo === 'faltou' && valor === 1 && row.confirmado === 1) {
    toast.error(
      'Não é possível marcar faltou: a sessão já está marcada como confirmada. Desmarque confirmado primeiro.'
    )
    return
  }
```

### Testes §1

1. Faltou=1 → tentar Confirmado/Efectuado → erro  
2. Efectuado=1 → tentar Faltou → erro  
3. Confirmado=1 → tentar Faltou → erro; desmarcar Confirmado → Faltou OK e `NFalta` sobe  
4. Desmarcar Faltou → `NFalta` desce (não negativo)

---

## 2. Coluna Nr faltas na grelha

O DTO já tem `nFalta`. Só falta a coluna.

### Editar

`Frontend/src/pages/area-administrativa/tratamentos/admissoes/components/listagem-admissoes-tratamento-table.columns.tsx`

Substituir o bloco final `sessoes` + `return` por:

```tsx
  cols.push({
    id: 'sessoes',
    header: 'Sessões',
    enableSorting: false,
    cell: ({ row }) => {
      const n = row.original.numSessao
      const total = row.original.numSessaoTratamento
      if (n == null && total == null) return '—'
      return `${n ?? '—'}/${total ?? '—'}`
    },
  })

  cols.push({
    id: 'nFalta',
    header: 'Faltas',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.nFalta != null ? String(row.original.nFalta) : '—',
  })

  return cols
}
```

### Testes §2

Após marcar/desmarcar Faltou e refrescar, a coluna reflecte o valor.

---

## 3. Sticky `tipoTecnico=1` (listagem Fisioterapeutas)

Na rota admin Fisioterapeutas, limpar filtros não pode remover o discriminador.

### Editar

`Frontend/src/pages/area-comum/tabelas/entidades/tecnicos/pages/listagem-tecnicos-page.tsx`

1. Import (se ainda não existir no topo — já há `TIPO_TECNICO` e `usePageData`):

```tsx
import {
  usePageData,
  type PageFilter,
} from '@/utils/page-data-utils'
```

(Se `PageFilter` não for exportado de `page-data-utils`, usar o tipo local:)

```tsx
type PageFilter = { id: string; value: string }
```

2. Depois de `contextFilters`, adicionar:

```tsx
  const ensureFisioFilter = (next: PageFilter[]): PageFilter[] => {
    if (!isTratamentosFisioterapeutas) return next
    const rest = next.filter((f) => f.id !== 'tipoTecnico')
    return [
      ...rest,
      { id: 'tipoTecnico', value: String(TIPO_TECNICO.Fisioterapeuta) },
    ]
  }

  const onFiltersChangeSticky = (next: PageFilter[]) => {
    handleFiltersChange(ensureFisioFilter(next))
  }
```

3. Em `resetListFilters`, manter `handleFiltersChange(contextFilters)` (já correcto).

4. Na `ListagemTecnicosTable`, trocar:

```tsx
onFiltersChange={handleFiltersChange}
```

por:

```tsx
onFiltersChange={onFiltersChangeSticky}
```

### Testes §3

Em `/area-administrativa/tratamentos/entidades/fisioterapeutas`: limpar filtros / pesquisa global → continua só Fisioterapeuta.  
Área Comum Técnicos (se existir): sem lock.

---

## 4. (Opcional) Botão Listagens — deixar de ser noop

### Editar

Mesmo ficheiro `listagem-tecnicos-page.tsx`, no `toolbarActions`:

```tsx
    {
      label: 'Listagens',
      icon: <List className='h-4 w-4' />,
      onClick: () =>
        toast.info('Listagens de fisioterapeutas em desenvolvimento.'),
      variant: 'outline',
    },
```

Reports completos do legado = PR separado.

---

## Fora deste documento (não implementar agora)

- Editar sessão, desmarcar, compensar falta, chamar utente, reports, kiosk  
- Auxiliares / Terapeutas ocupacionais  
- Planning / marcações (B3)  
- `NFaltaCons`, histórico sessão, planning ao faltar, avisos utente  
- GUID permissão Admissões tratamentos dedicado  

---

## Checklist implementação

- [x] §1 BE validações + `NFalta`
- [x] §1 FE guards
- [x] §2 coluna Faltas
- [x] §3 sticky `tipoTecnico`
- [x] §4 toast Listagens
- [x] Title de todas as páginas = `"CliCloud"` (via `PageHead` central)

---

## Testes manuais (UAT) — fazer com tempo

### Preparação

- [ ] API a correr (`dotnet run` em `Backend/CliCloud.WebApi` ou pasta habitual)
- [ ] FE a correr (`npm run dev`)
- [ ] Login com permissão de **Admissões** e **Fisioterapeutas**
- [ ] Existem dados: pelo menos **1 sessão de tratamento** na data de teste (idealmente hoje)
- [ ] Existe pelo menos **1 local de tratamento** (para o modo Local)
- [ ] Preferível: 1 sessão sem flags; outra já com Confirmado (para Presentes)

**Nota:** a listagem filtra por **data** (default = hoje). Se a lista vier vazia, muda o filtro Data para um dia em que haja sessões.

---

### A) Admissões — Utentes/Hora

**Entrada:** header **Tratamentos Diários → Utentes/Hora**  
**URL:** `/area-administrativa/tratamentos/admissoes`

| # | Passo | Resultado esperado | OK? |
|---|--------|-------------------|-----|
| A1 | Abrir a página; filtrar Data com sessões | Grelha com linhas; colunas Confirmado, Efectuado, Faltou, Sessões, **Faltas** | [ ] |
| A2 | Marcar **Confirmado** numa linha; refrescar (Atualizar) | Continua marcado | [ ] |
| A3 | Com Confirmado=1, tentar marcar **Faltou** | Toast de erro (desmarcar confirmado primeiro); Faltou **não** grava | [ ] |
| A4 | Desmarcar Confirmado → marcar **Faltou** | Faltou fica; coluna **Faltas** sobe (+1) | [ ] |
| A5 | Com Faltou=1, tentar **Confirmado** | Toast de erro (já faltou) | [ ] |
| A6 | Com Faltou=1, tentar **Efectuado** | Toast de erro (já faltou) | [ ] |
| A7 | Desmarcar Faltou | Faltas desce (−1, não negativo) | [ ] |
| A8 | Marcar **Efectuado**; tentar **Faltou** | Toast de erro (já efectuada) | [ ] |
| A9 | Filtros: utente / fisioterapeuta / texto | Lista restringe sem crash | [ ] |

---

### B) Admissões — Utentes Presentes

**Entrada:** **Tratamentos Diários → Utentes Presentes**  
**URL:** `/area-administrativa/tratamentos/admissoes/presentes`

| # | Passo | Resultado esperado | OK? |
|---|--------|-------------------|-----|
| B1 | Abrir com Data = dia em que há Confirmado=1 | Só sessões confirmadas | [ ] |
| B2 | Verificar colunas | **Sem** Confirmado/Faltou; **com** Efectuado (+ restantes) | [ ] |
| B3 | Marcar/desmarcar Efectuado | Persiste após Atualizar | [ ] |

---

### C) Admissões — Local de Tratamento

**Entrada:** **Tratamentos Diários → Local de Tratamento**  
**URL:** `/area-administrativa/tratamentos/admissoes/local-tratamento`

| # | Passo | Resultado esperado | OK? |
|---|--------|-------------------|-----|
| C1 | Abrir a página | Modal **Local de Tratamento** abre sozinho | [ ] |
| C2 | Cancelar sem escolher | Modal fecha; lista vazia / sem local | [ ] |
| C3 | **Nova pesquisa** (toolbar) | Modal reabre | [ ] |
| C4 | Escolher local → Confirmar | Modal fecha; grelha filtrada por esse local | [ ] |
| C5 | Botão **+** no modal | Abre gestão de locais (nova aba/janela) | [ ] |
| C6 | Repetir A2–A7 neste modo (se houver linhas) | Mesmas regras de situação | [ ] |

---

### D) Fisioterapeutas (B1)

**Entrada:** header **Entidades → Fisioterapeutas**  
**URL:** `/area-administrativa/tratamentos/entidades/fisioterapeutas`

| # | Passo | Resultado esperado | OK? |
|---|--------|-------------------|-----|
| D1 | Abrir listagem | Título Fisioterapeutas; só técnicos tipo Fisioterapeuta | [ ] |
| D2 | Limpar filtros / limpar pesquisa global | Continua só Fisioterapeuta (filtro sticky) | [ ] |
| D3 | Atualizar | Mantém filtro tipo; lista refresca | [ ] |
| D4 | **Listagens** | Toast “em desenvolvimento” (não crash) | [ ] |
| D5 | Novo / editar | Tipo Fisioterapeuta bloqueado no contexto admin | [ ] |

---

### E) Home Tratamentos (regressão rápida)

**URL:** `/area-administrativa/tratamentos`

| # | Passo | Resultado esperado | OK? |
|---|--------|-------------------|-----|
| E1 | Abrir home Tratamentos | Sem cards; só header do módulo (como Consultas) | [ ] |

---

### Registo rápido de falhas

| ID teste | O que falhou | Notas (toast / network / screenshot) |
|----------|--------------|--------------------------------------|
| | | |
| | | |
| | | |

---

## To-do title (concluído)

- [x] Trocar o **title** de todas as páginas para apenas `"CliCloud"`
  - **Como:** `Frontend/src/components/shared/page-head.tsx` — `Helmet` fixo em `CliCloud`
  - Páginas podem continuar a passar `title={...}` (API estável); o `&lt;title&gt;` do browser ignora o prop
  - Títulos de ecrã / janelas continuam no UI da app (`windowName`, headings), não no document title

---

*Após UAT OK → fechar este fecho B1/B2 e seguir B2+/B3 no plano mãe.*
