# Pack C6 — Histórico tratamentos (MVP)

**Data:** 2026-08-06  
**Estado:** Pendente de aplicar (copiar/criar ficheiros abaixo)  
**Roadmap:** `Frontend/src/docs/plano-paridade-legado-newcc.md` §C6

---

## Objectivo

7 entradas de menu Histórico → listagem paginada **read-only** com filtro por modo (paridade `HistoricoTratamentosLst.aspx?modo=*`).

## Arquitectura

| Decisão | Detalhe |
|---------|---------|
| Entidade | `Tratamentos.Tratamento` (EF newCC) |
| Proibido | `dbo.HISTTRAT` / gateways legado |
| Critério “histórico” | `DataFim` preenchida **e** `DataFim < hoje` (complemento dos Marcados/Iniciados) |
| Acção Ver | Navega para `/area-administrativa/tratamentos/marcados/:id` |
| Fora do MVP | Edt histórico próprio, apagar, observações, reports → C6.2+ |

## Legado (referência só de comportamento)

- `CliCloud.ASPcli/Client/Tratamentos/HistoricoTratamentosLst.aspx` (+ `.js`)
- Modos: `datas`, `utentes`, `fisioter`, `auxiliar`, `outro`, `organismo`, `credencial`
- Menu newCC já usa: `fisioterapeuta` (alias BE: `fisioter` → `fisioterapeuta`)

## Inventário

### CRIAR — Backend (7)

1. `HistoricoTratamentoAdministrativoModos.cs`
2. `IHistoricoTratamentoAdministrativoService.cs`
3. `HistoricoTratamentoAdministrativoService.cs`
4. `DTOs/HistoricoTratamentoTableDTO.cs`
5. `Filters/HistoricoTratamentoTableFilter.cs`
6. `Specifications/HistoricoTratamentoSearchTable.cs`
7. `HistoricoTratamentoAdministrativoController.cs`

### CRIAR — Frontend (6)

8. `historico-tratamento-administrativo.dtos.ts`
9. `historico-tratamento-administrativo-client.ts`
10. `listagem-historico-tratamentos-queries.ts`
11. `historico-tratamento-filtro-modal.tsx`
12. `listagem-historico-tratamentos-table.columns.tsx`
13. `listagem-historico-tratamentos-page.tsx`

### EDITAR (2)

14. `MappingProfiles.cs`
15. `areaAdministrativa.tsx`

Menu `administrativa-tratamentos-header-menu.ts` — já aponta para `/historico/{modo}` (sem alteração obrigatória).

---

### 1. HistoricoTratamentoAdministrativoModos.cs

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/HistoricoTratamentoAdministrativoService/HistoricoTratamentoAdministrativoModos.cs`

```csharp
namespace CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService;

/// <summary>Slugs alinhados ao menu FE (legado: fisioter ≈ fisioterapeuta).</summary>
public static class HistoricoTratamentoAdministrativoModos
{
  public const string Datas = "datas";
  public const string Utentes = "utentes";
  public const string Fisioterapeuta = "fisioterapeuta";
  public const string Auxiliar = "auxiliar";
  public const string Outro = "outro";
  public const string Organismo = "organismo";
  public const string Credencial = "credencial";

  public static readonly HashSet<string> Todos = new(StringComparer.OrdinalIgnoreCase)
  {
    Datas, Utentes, Fisioterapeuta, Auxiliar, Outro, Organismo, Credencial,
  };

  public static string Normalize(string? modo)
  {
    if (string.IsNullOrWhiteSpace(modo)) return Datas;
    string m = modo.Trim().ToLowerInvariant();
    if (m is "fisioter") return Fisioterapeuta;
    return Todos.Contains(m) ? m : Datas;
  }
}
```

---

### 2. IHistoricoTratamentoAdministrativoService.cs

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/HistoricoTratamentoAdministrativoService/IHistoricoTratamentoAdministrativoService.cs`

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.DTOs;
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.Filters;

namespace CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService;

public interface IHistoricoTratamentoAdministrativoService : ITransientService
{
  Task<PaginatedResponse<HistoricoTratamentoTableDTO>> GetPaginatedAsync(
    HistoricoTratamentoTableFilter filter
  );
}
```

---

### 3. HistoricoTratamentoAdministrativoService.cs

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/HistoricoTratamentoAdministrativoService/HistoricoTratamentoAdministrativoService.cs`

```csharp
using CliCloud.Application.Common;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.DTOs;
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.Filters;
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.Specifications;
using CliCloud.Application.Utility;
using CliCloud.Domain.Entities.Tratamentos;

namespace CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService;

public class HistoricoTratamentoAdministrativoService(IRepositoryAsync repository)
  : IHistoricoTratamentoAdministrativoService
{
  private readonly IRepositoryAsync _repository = repository;

  public async Task<PaginatedResponse<HistoricoTratamentoTableDTO>> GetPaginatedAsync(
    HistoricoTratamentoTableFilter filter
  )
  {
    filter.Modo = HistoricoTratamentoAdministrativoModos.Normalize(filter.Modo);

    if (filter.Filters?.Count > 0)
      filter.PageNumber = 1;

    string order =
      filter.Sorting != null ? GSHelpers.GenerateOrderByString(filter) : string.Empty;

    var spec = new HistoricoTratamentoSearchTable(filter, order);

    return await _repository.GetPaginatedResultsAsync<
      Tratamento,
      HistoricoTratamentoTableDTO,
      Guid
    >(filter.PageNumber, filter.PageSize, spec);
  }
}
```

---

### 4. HistoricoTratamentoTableDTO.cs

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/HistoricoTratamentoAdministrativoService/DTOs/HistoricoTratamentoTableDTO.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.DTOs;

public class HistoricoTratamentoTableDTO : IDto
{
  public Guid Id { get; set; }
  public string? Designacao { get; set; }
  public Guid? UtenteId { get; set; }
  public string? NumeroUtente { get; set; }
  public string? UtenteNome { get; set; }
  public DateTime? DataInic { get; set; }
  public DateTime? DataFim { get; set; }
  public int? NumSessao { get; set; }
  public int? Pago { get; set; }
  public int? Faturado { get; set; }
  public int? ConfDfim { get; set; }
  public string? Credencial { get; set; }
  public int? Isencao { get; set; }
  public Guid? MedicoId { get; set; }
  public string? MedicoNome { get; set; }
  public Guid? OrganismoId { get; set; }
  public string? OrganismoNome { get; set; }
  public Guid? FisioterapeutaId { get; set; }
  public string? FisioterapeutaNome { get; set; }
  public Guid? AuxiliarId { get; set; }
  public string? AuxiliarNome { get; set; }
  public Guid? OutroTecnicoId { get; set; }
  public string? OutroTecnicoNome { get; set; }
}
```

---

### 5. HistoricoTratamentoTableFilter.cs

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/HistoricoTratamentoAdministrativoService/Filters/HistoricoTratamentoTableFilter.cs`

```csharp
using CliCloud.Application.Common.Filter;

namespace CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.Filters;

public class HistoricoTratamentoTableFilter : PaginationFilter
{
  public string Modo { get; set; } = HistoricoTratamentoAdministrativoModos.Datas;
  public List<TableFilter> Filters { get; set; } = [];

  public Guid? UtenteId { get; set; }
  public Guid? FisioterapeutaId { get; set; }
  public Guid? AuxiliarId { get; set; }
  public Guid? OutroTecnicoId { get; set; }
  public Guid? OrganismoId { get; set; }
}
```

---

### 6. HistoricoTratamentoSearchTable.cs

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/HistoricoTratamentoAdministrativoService/Specifications/HistoricoTratamentoSearchTable.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Application.Common.Filter;
using CliCloud.Application.Common.Specification;
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.Filters;
using CliCloud.Domain.Entities.Tratamentos;

namespace CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.Specifications;

public sealed class HistoricoTratamentoSearchTable : Specification<Tratamento>
{
  public HistoricoTratamentoSearchTable(
    HistoricoTratamentoTableFilter filter,
    string? dynamicOrder = ""
  )
  {
    DateTime hoje = DateTime.Today;
    string modo = HistoricoTratamentoAdministrativoModos.Normalize(filter.Modo);

    _ = Query
      .Include(x => x.Utente)
      .Include(x => x.Organismo)
      .Include(x => x.Medico)
      .Include(x => x.Fisioterapeuta)
      .Include(x => x.Auxiliar)
      .Include(x => x.OutroTecnico);

    _ = Query.Where(x => x.DeletedOn == null);
    // Concluídos = histórico (paridade funcional vs Marcados activos)
    _ = Query.Where(x =>
      x.DataFim.HasValue && x.DataFim.Value.Date < hoje
    );

    switch (modo)
    {
      case HistoricoTratamentoAdministrativoModos.Utentes:
        if (!filter.UtenteId.HasValue)
          _ = Query.Where(_ => false);
        else
          _ = Query.Where(x => x.UtenteId == filter.UtenteId.Value);
        break;
      case HistoricoTratamentoAdministrativoModos.Fisioterapeuta:
        if (!filter.FisioterapeutaId.HasValue)
          _ = Query.Where(_ => false);
        else
          _ = Query.Where(x => x.FisioterapeutaId == filter.FisioterapeutaId.Value);
        break;
      case HistoricoTratamentoAdministrativoModos.Auxiliar:
        if (!filter.AuxiliarId.HasValue)
          _ = Query.Where(_ => false);
        else
          _ = Query.Where(x => x.AuxiliarId == filter.AuxiliarId.Value);
        break;
      case HistoricoTratamentoAdministrativoModos.Outro:
        if (!filter.OutroTecnicoId.HasValue)
          _ = Query.Where(_ => false);
        else
          _ = Query.Where(x => x.OutroTecnicoId == filter.OutroTecnicoId.Value);
        break;
      case HistoricoTratamentoAdministrativoModos.Organismo:
        if (!filter.OrganismoId.HasValue)
          _ = Query.Where(_ => false);
        else
          _ = Query.Where(x => x.OrganismoId == filter.OrganismoId.Value);
        break;
      case HistoricoTratamentoAdministrativoModos.Credencial:
        break;
    }

    bool temCredencial = false;

    foreach (TableFilter f in filter.Filters ?? [])
    {
      string id = (f.Id ?? string.Empty).ToLowerInvariant();
      string? val = f.Value;
      if (string.IsNullOrWhiteSpace(val)) continue;

      switch (id)
      {
        case "filtrobox":
        case "utentenome":
          _ = Query.Where(x =>
            x.Utente != null
            && (
              (x.Utente.Nome != null && x.Utente.Nome.Contains(val))
              || (x.Utente.NumeroUtente != null && x.Utente.NumeroUtente.Contains(val))
            )
          );
          break;
        case "designacao":
          _ = Query.Where(x => x.Designacao != null && x.Designacao.Contains(val));
          break;
        case "credencial":
          temCredencial = true;
          _ = Query.Where(x => x.Credencial != null && x.Credencial.Contains(val));
          break;
        case "datafimde":
          if (DateTime.TryParse(val, out DateTime dfDe))
            _ = Query.Where(x => x.DataFim!.Value.Date >= dfDe.Date);
          break;
        case "datafimate":
          if (DateTime.TryParse(val, out DateTime dfAte))
            _ = Query.Where(x => x.DataFim!.Value.Date <= dfAte.Date);
          break;
        case "datainicde":
          if (DateTime.TryParse(val, out DateTime diDe))
            _ = Query.Where(x => x.DataInic.HasValue && x.DataInic.Value.Date >= diDe.Date);
          break;
        case "datainicate":
          if (DateTime.TryParse(val, out DateTime diAte))
            _ = Query.Where(x => x.DataInic.HasValue && x.DataInic.Value.Date <= diAte.Date);
          break;
        case "utenteid":
          if (Guid.TryParse(val, out Guid uid))
            _ = Query.Where(x => x.UtenteId == uid);
          break;
        case "fisioterapeutaid":
          if (Guid.TryParse(val, out Guid fid))
            _ = Query.Where(x => x.FisioterapeutaId == fid);
          break;
        case "auxiliarid":
          if (Guid.TryParse(val, out Guid aid))
            _ = Query.Where(x => x.AuxiliarId == aid);
          break;
        case "outrotecnicoid":
          if (Guid.TryParse(val, out Guid oid))
            _ = Query.Where(x => x.OutroTecnicoId == oid);
          break;
        case "organismoid":
          if (Guid.TryParse(val, out Guid orgId))
            _ = Query.Where(x => x.OrganismoId == orgId);
          break;
      }
    }

    if (modo == HistoricoTratamentoAdministrativoModos.Credencial && !temCredencial)
      _ = Query.Where(_ => false);

    if (!string.IsNullOrWhiteSpace(dynamicOrder))
      _ = Query.OrderBy(dynamicOrder);
    else
      _ = Query.OrderByDescending(x => x.DataFim).ThenBy(x => x.Utente!.Nome);
  }
}
```

---

### 7. HistoricoTratamentoAdministrativoController.cs

**Localização:**  
`Backend/CliCloud.WebApi/Controllers/Tratamentos/HistoricoTratamentoAdministrativoController.cs`

```csharp
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService;
using CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CliCloud.WebApi.Controllers.Tratamentos;

[Route("client/tratamentos/historico-tratamento-administrativo")]
[ApiController]
public class HistoricoTratamentoAdministrativoController(
  IHistoricoTratamentoAdministrativoService service
) : ControllerBase
{
  private readonly IHistoricoTratamentoAdministrativoService _service = service;

  [Authorize(Roles = "client")]
  [HttpPost("paginated")]
  public async Task<IActionResult> GetPaginated(
    [FromBody] HistoricoTratamentoTableFilter filter
  ) => Ok(await _service.GetPaginatedAsync(filter));
}
```

---

### 8. MappingProfiles.cs (EDITAR)

**Localização:**  
`Backend/CliCloud.Infrastructure/Mapper/MappingProfiles.cs`

**A)** No topo, junto aos outros aliases de DTOs Tratamentos:

```csharp
using HistoricoTratamentoAdministrativoDtos = CliCloud.Application.Services.Tratamentos.HistoricoTratamentoAdministrativoService.DTOs;
```

**B)** Depois do `CreateMap` de `TratamentoMarcadosTableDTO`, acrescenta:

```csharp
      _ = CreateMap<Tratamento, HistoricoTratamentoAdministrativoDtos.HistoricoTratamentoTableDTO>()
        .ForMember(d => d.UtenteNome, o => o.MapFrom(s => s.Utente != null ? s.Utente.Nome : null))
        .ForMember(d => d.NumeroUtente, o => o.MapFrom(s => s.Utente != null ? s.Utente.NumeroUtente : null))
        .ForMember(d => d.MedicoNome, o => o.MapFrom(s => s.Medico != null ? s.Medico.Nome : null))
        .ForMember(d => d.OrganismoNome, o => o.MapFrom(s =>
          s.Organismo != null
            ? (s.Organismo.Nome ?? s.Organismo.NomeComercial ?? s.Organismo.Abreviatura)
            : null))
        .ForMember(d => d.FisioterapeutaNome, o => o.MapFrom(s => s.Fisioterapeuta != null ? s.Fisioterapeuta.Nome : null))
        .ForMember(d => d.AuxiliarNome, o => o.MapFrom(s => s.Auxiliar != null ? s.Auxiliar.Nome : null))
        .ForMember(d => d.OutroTecnicoNome, o => o.MapFrom(s => s.OutroTecnico != null ? s.OutroTecnico.Nome : null));
```

---

### 9. historico-tratamento-administrativo.dtos.ts

**Localização:**  
`Frontend/src/types/dtos/tratamentos/historico-tratamento-administrativo.dtos.ts`

```ts
import type {
  PaginationFilterRequest,
  TableFilter,
} from '@/types/dtos/common/table-filters.dtos'

export type HistoricoTratamentoModo =
  | 'datas'
  | 'utentes'
  | 'fisioterapeuta'
  | 'auxiliar'
  | 'outro'
  | 'organismo'
  | 'credencial'

export interface HistoricoTratamentoTableDTO {
  id: string
  designacao?: string | null
  utenteId?: string | null
  numeroUtente?: string | null
  utenteNome?: string | null
  dataInic?: string | null
  dataFim?: string | null
  numSessao?: number | null
  pago?: number | null
  faturado?: number | null
  confDfim?: number | null
  credencial?: string | null
  isencao?: number | null
  medicoId?: string | null
  medicoNome?: string | null
  organismoId?: string | null
  organismoNome?: string | null
  fisioterapeutaId?: string | null
  fisioterapeutaNome?: string | null
  auxiliarId?: string | null
  auxiliarNome?: string | null
  outroTecnicoId?: string | null
  outroTecnicoNome?: string | null
}

export interface HistoricoTratamentoTableFilterRequest
  extends PaginationFilterRequest {
  modo: HistoricoTratamentoModo
  utenteId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
  filters?: TableFilter[]
}
```

---

### 10. historico-tratamento-administrativo-client.ts

**Localização:**  
`Frontend/src/lib/services/tratamentos/historico-tratamento-administrativo-service/historico-tratamento-administrativo-client.ts`

```ts
import state from '@/states/state'
import type { PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  HistoricoTratamentoTableDTO,
  HistoricoTratamentoTableFilterRequest,
} from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'

const BASE = '/client/tratamentos/historico-tratamento-administrativo'

export class HistoricoTratamentoAdministrativoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getPaginated(
    params: HistoricoTratamentoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<HistoricoTratamentoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }
}

export function HistoricoTratamentoAdministrativoService(
  idFuncionalidade: string
) {
  return new HistoricoTratamentoAdministrativoClient(idFuncionalidade)
}
```

---

### 11. listagem-historico-tratamentos-queries.ts

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/historico/queries/listagem-historico-tratamentos-queries.ts`

```ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'
import { modules } from '@/config/modules'
import { HistoricoTratamentoAdministrativoService } from '@/lib/services/tratamentos/historico-tratamento-administrativo-service/historico-tratamento-administrativo-client'
import type {
  HistoricoTratamentoModo,
  HistoricoTratamentoTableFilterRequest,
} from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import type { TableFilter } from '@/types/dtos/common/table-filters.dtos'

const perm = modules.areaAdministrativa.permissions.consultas.id

export type HistoricoCriteriaIds = {
  utenteId?: string | null
  fisioterapeutaId?: string | null
  auxiliarId?: string | null
  outroTecnicoId?: string | null
  organismoId?: string | null
}

function buildBody(
  modo: HistoricoTratamentoModo,
  page: number,
  pageSize: number,
  filters: TableFilter[],
  sorting: SortingState,
  ids: HistoricoCriteriaIds,
  enabled: boolean
): HistoricoTratamentoTableFilterRequest | null {
  if (!enabled) return null
  return {
    pageNumber: page,
    pageSize,
    filters,
    sorting: sorting.map((s) => ({ id: s.id, desc: s.desc })),
    modo,
    utenteId: ids.utenteId || null,
    fisioterapeutaId: ids.fisioterapeutaId || null,
    auxiliarId: ids.auxiliarId || null,
    outroTecnicoId: ids.outroTecnicoId || null,
    organismoId: ids.organismoId || null,
  }
}

export function useGetHistoricoTratamentosPaginated(
  modo: HistoricoTratamentoModo,
  page: number,
  pageSize: number,
  filters: TableFilter[],
  sorting: SortingState,
  ids: HistoricoCriteriaIds,
  enabled: boolean
) {
  const body = buildBody(modo, page, pageSize, filters, sorting, ids, enabled)
  return useQuery({
    queryKey: ['historico-tratamentos', body],
    enabled: !!body,
    queryFn: async () => {
      const res = await HistoricoTratamentoAdministrativoService(perm).getPaginated(
        body!
      )
      return res.info
    },
  })
}

export function invalidateHistoricoTratamentosQueries(
  qc: ReturnType<typeof useQueryClient>
) {
  void qc.invalidateQueries({ queryKey: ['historico-tratamentos'] })
}
```

---

### 12. historico-tratamento-filtro-modal.tsx

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/historico/modals/historico-tratamento-filtro-modal.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react'
import { format, isValid, startOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { modules } from '@/config/modules'
import { UtentesService } from '@/lib/services/saude/utentes-service'
import { OrganismoService } from '@/lib/services/saude/organismo-service'
import { TecnicoService } from '@/lib/services/saude/tecnico-service'
import { TIPO_TECNICO } from '@/pages/area-comum/tabelas/entidades/tecnicos/constants/tipo-tecnico'
import type { HistoricoTratamentoModo } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import type { TableFilter } from '@/types/dtos/common/table-filters.dtos'
import { toast } from '@/utils/toast-utils'

const perm = modules.areaAdministrativa.permissions.consultas.id

export type HistoricoTratCriteria = {
  dataFimDe: Date | null
  dataFimAte: Date | null
  utenteId: string
  utenteLabel: string
  fisioterapeutaId: string
  fisioterapeutaLabel: string
  auxiliarId: string
  auxiliarLabel: string
  outroTecnicoId: string
  outroTecnicoLabel: string
  organismoId: string
  organismoLabel: string
  credencial: string
}

export function emptyHistoricoTratCriteria(): HistoricoTratCriteria {
  const now = new Date()
  return {
    dataFimDe: startOfMonth(now),
    dataFimAte: endOfMonth(now),
    utenteId: '',
    utenteLabel: '',
    fisioterapeutaId: '',
    fisioterapeutaLabel: '',
    auxiliarId: '',
    auxiliarLabel: '',
    outroTecnicoId: '',
    outroTecnicoLabel: '',
    organismoId: '',
    organismoLabel: '',
    credencial: '',
  }
}

export function historicoTratListEnabled(
  modo: HistoricoTratamentoModo,
  c: HistoricoTratCriteria
): boolean {
  switch (modo) {
    case 'datas':
      return !!(c.dataFimDe && c.dataFimAte)
    case 'utentes':
      return !!c.utenteId
    case 'fisioterapeuta':
      return !!c.fisioterapeutaId
    case 'auxiliar':
      return !!c.auxiliarId
    case 'outro':
      return !!c.outroTecnicoId
    case 'organismo':
      return !!c.organismoId
    case 'credencial':
      return !!c.credencial.trim()
    default:
      return false
  }
}

export function buildHistoricoTratApiFilters(
  c: HistoricoTratCriteria
): TableFilter[] {
  const filters: TableFilter[] = []
  if (c.dataFimDe && isValid(c.dataFimDe)) {
    filters.push({
      id: 'dataFimDe',
      value: format(startOfDay(c.dataFimDe), 'yyyy-MM-dd'),
    })
  }
  if (c.dataFimAte && isValid(c.dataFimAte)) {
    filters.push({
      id: 'dataFimAte',
      value: format(startOfDay(c.dataFimAte), 'yyyy-MM-dd'),
    })
  }
  if (c.credencial.trim()) {
    filters.push({ id: 'credencial', value: c.credencial.trim() })
  }
  return filters
}

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  modo: HistoricoTratamentoModo
  criteria: HistoricoTratCriteria
  onApply: (next: HistoricoTratCriteria) => void
}

export function HistoricoTratamentoFiltroModal({
  open,
  onOpenChange,
  modo,
  criteria,
  onApply,
}: Props) {
  const [local, setLocal] = useState(criteria)
  const [utSearch, setUtSearch] = useState('')
  const [tecSearch, setTecSearch] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [debUt] = useDebounce(utSearch, 300)
  const [debTec] = useDebounce(tecSearch, 300)
  const [debOrg] = useDebounce(orgSearch, 300)

  useEffect(() => {
    if (open) setLocal(criteria)
  }, [open, criteria])

  const utQuery = useQuery({
    queryKey: ['hist-trat-ut', debUt],
    queryFn: () => UtentesService(perm).getUtentesLight(debUt),
    enabled: open && (modo === 'utentes' || modo === 'datas'),
  })

  const tipoTec =
    modo === 'fisioterapeuta'
      ? TIPO_TECNICO.Fisioterapeuta
      : modo === 'auxiliar'
        ? TIPO_TECNICO.Auxiliar
        : modo === 'outro'
          ? TIPO_TECNICO.Outro
          : null

  const tecQuery = useQuery({
    queryKey: ['hist-trat-tec', tipoTec, debTec],
    queryFn: async () => {
      const res = await TecnicoService(perm).getTecnicosPaginated({
        pageNumber: 1,
        pageSize: 40,
        filters: [
          { id: 'tipoTecnico', value: String(tipoTec) },
          ...(debTec.trim() ? [{ id: 'nome', value: debTec.trim() }] : []),
        ],
      })
      return res.info?.data ?? []
    },
    enabled: open && tipoTec != null,
  })

  const orgQuery = useQuery({
    queryKey: ['hist-trat-org', debOrg],
    queryFn: () => OrganismoService(perm).getOrganismosLight(debOrg),
    enabled: open && modo === 'organismo',
  })

  const utItems = useMemo(
    () =>
      (utQuery.data?.info?.data ?? []).map((u: { id: string; nome?: string }) => ({
        value: u.id,
        label: u.nome ?? u.id,
      })),
    [utQuery.data]
  )

  const tecItems = useMemo(
    () =>
      (tecQuery.data ?? []).map((t: { id: string; nome?: string | null }) => ({
        value: t.id,
        label: t.nome ?? t.id,
      })),
    [tecQuery.data]
  )

  const orgItems = useMemo(
    () =>
      (orgQuery.data?.info?.data ?? []).map((o: { id: string; nome?: string }) => ({
        value: o.id,
        label: o.nome ?? o.id,
      })),
    [orgQuery.data]
  )

  const apply = () => {
    if (!historicoTratListEnabled(modo, local)) {
      toast.error('Preencha os filtros obrigatórios do modo.')
      return
    }
    onApply(local)
    onOpenChange(false)
  }

  const iso = (d: Date | null) =>
    d && isValid(d) ? format(d, 'yyyy-MM-dd') : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Histórico de Tratamentos — filtros</DialogTitle>
        </DialogHeader>

        <div className='space-y-3 py-2'>
          {(modo === 'datas' ||
            modo === 'utentes' ||
            modo === 'fisioterapeuta' ||
            modo === 'auxiliar' ||
            modo === 'outro' ||
            modo === 'organismo') && (
            <div className='grid grid-cols-2 gap-2'>
              <div className='space-y-1'>
                <Label>Data conclusão de</Label>
                <Input
                  type='date'
                  value={iso(local.dataFimDe)}
                  onChange={(e) =>
                    setLocal((p) => ({
                      ...p,
                      dataFimDe: e.target.value
                        ? startOfDay(new Date(e.target.value))
                        : null,
                    }))
                  }
                />
              </div>
              <div className='space-y-1'>
                <Label>Data conclusão até</Label>
                <Input
                  type='date'
                  value={iso(local.dataFimAte)}
                  onChange={(e) =>
                    setLocal((p) => ({
                      ...p,
                      dataFimAte: e.target.value
                        ? startOfDay(new Date(e.target.value))
                        : null,
                    }))
                  }
                />
              </div>
            </div>
          )}

          {modo === 'utentes' && (
            <div className='space-y-1'>
              <Label>Utente</Label>
              <AsyncCombobox
                value={local.utenteId}
                onChange={(id) => {
                  const label = utItems.find((i) => i.value === id)?.label ?? ''
                  setLocal((p) => ({ ...p, utenteId: id, utenteLabel: label }))
                }}
                searchValue={utSearch}
                onSearchValueChange={setUtSearch}
                items={utItems}
                isLoading={utQuery.isFetching}
                placeholder='Selecione…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
          )}

          {(modo === 'fisioterapeuta' ||
            modo === 'auxiliar' ||
            modo === 'outro') && (
            <div className='space-y-1'>
              <Label>
                {modo === 'fisioterapeuta'
                  ? 'Fisioterapeuta'
                  : modo === 'auxiliar'
                    ? 'Auxiliar'
                    : 'Terapeuta Ocup./Fala'}
              </Label>
              <AsyncCombobox
                value={
                  modo === 'fisioterapeuta'
                    ? local.fisioterapeutaId
                    : modo === 'auxiliar'
                      ? local.auxiliarId
                      : local.outroTecnicoId
                }
                onChange={(id) => {
                  const label = tecItems.find((i) => i.value === id)?.label ?? ''
                  setLocal((p) => {
                    if (modo === 'fisioterapeuta')
                      return {
                        ...p,
                        fisioterapeutaId: id,
                        fisioterapeutaLabel: label,
                      }
                    if (modo === 'auxiliar')
                      return { ...p, auxiliarId: id, auxiliarLabel: label }
                    return { ...p, outroTecnicoId: id, outroTecnicoLabel: label }
                  })
                }}
                searchValue={tecSearch}
                onSearchValueChange={setTecSearch}
                items={tecItems}
                isLoading={tecQuery.isFetching}
                placeholder='Selecione…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
          )}

          {modo === 'organismo' && (
            <div className='space-y-1'>
              <Label>Organismo</Label>
              <AsyncCombobox
                value={local.organismoId}
                onChange={(id) => {
                  const label = orgItems.find((i) => i.value === id)?.label ?? ''
                  setLocal((p) => ({
                    ...p,
                    organismoId: id,
                    organismoLabel: label,
                  }))
                }}
                searchValue={orgSearch}
                onSearchValueChange={setOrgSearch}
                items={orgItems}
                isLoading={orgQuery.isFetching}
                placeholder='Selecione…'
                searchPlaceholder='Pesquisar…'
                emptyText='Sem resultados'
              />
            </div>
          )}

          {modo === 'credencial' && (
            <div className='space-y-1'>
              <Label>Credencial</Label>
              <Input
                value={local.credencial}
                onChange={(e) =>
                  setLocal((p) => ({ ...p, credencial: e.target.value }))
                }
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type='button' onClick={apply}>
            Pesquisar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### 13. listagem-historico-tratamentos-table.columns.tsx

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/historico/components/listagem-historico-tratamentos-table.columns.tsx`

```tsx
import type { ColumnDef } from '@tanstack/react-table'
import { format, parseISO, isValid } from 'date-fns'
import type { HistoricoTratamentoTableDTO } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'

function fmtDate(v?: string | null) {
  if (!v) return '—'
  const d = parseISO(v)
  return isValid(d) ? format(d, 'dd/MM/yyyy') : '—'
}

function isencaoLabel(v?: number | null) {
  switch (v) {
    case 1:
      return 'Isento'
    case 2:
      return 'N.Isento'
    case 3:
      return 'E11'
    case 4:
      return 'H'
    default:
      return '—'
  }
}

export function buildHistoricoTratamentosColumns(): ColumnDef<HistoricoTratamentoTableDTO>[] {
  return [
    {
      accessorKey: 'numeroUtente',
      header: 'Utente',
      cell: ({ row }) => {
        const n = row.original.numeroUtente
        const nome = row.original.utenteNome
        if (n && nome) return `${n} - ${nome}`
        return nome ?? n ?? '—'
      },
    },
    {
      accessorKey: 'dataInic',
      header: 'Início',
      cell: ({ getValue }) => fmtDate(getValue() as string),
    },
    {
      accessorKey: 'dataFim',
      header: 'Conclusão',
      cell: ({ getValue }) => fmtDate(getValue() as string),
    },
    {
      accessorKey: 'numSessao',
      header: 'Nº sessões',
      cell: ({ getValue }) => getValue() ?? '—',
    },
    {
      accessorKey: 'pago',
      header: 'Pago',
      cell: ({ getValue }) => ((getValue() as number) === 1 ? 'Sim' : 'Não'),
    },
    {
      accessorKey: 'organismoNome',
      header: 'Organismo',
      cell: ({ getValue }) => (getValue() as string) || '—',
    },
    {
      accessorKey: 'credencial',
      header: 'Credencial',
      cell: ({ getValue }) => (getValue() as string) || '—',
    },
    {
      accessorKey: 'confDfim',
      header: 'Alta',
      cell: ({ getValue }) => ((getValue() as number) === 1 ? 'Sim' : 'Não'),
    },
    {
      accessorKey: 'isencao',
      header: 'Isenção',
      cell: ({ getValue }) => isencaoLabel(getValue() as number),
    },
    {
      accessorKey: 'medicoNome',
      header: 'Médico',
      cell: ({ getValue }) => (getValue() as string) || '—',
    },
    {
      accessorKey: 'faturado',
      header: 'Faturado',
      cell: ({ getValue }) => ((getValue() as number) === 1 ? 'Sim' : 'Não'),
    },
  ]
}
```

---

### 14. listagem-historico-tratamentos-page.tsx

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/historico/pages/listagem-historico-tratamentos-page.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { DataTable, type DataTableAction } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { modules } from '@/config/modules'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { usePageData } from '@/utils/page-data-utils'
import type { HistoricoTratamentoModo } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import type { HistoricoTratamentoTableDTO } from '@/types/dtos/tratamentos/historico-tratamento-administrativo.dtos'
import { buildHistoricoTratamentosColumns } from '../components/listagem-historico-tratamentos-table.columns'
import {
  HistoricoTratamentoFiltroModal,
  buildHistoricoTratApiFilters,
  emptyHistoricoTratCriteria,
  historicoTratListEnabled,
  type HistoricoTratCriteria,
} from '../modals/historico-tratamento-filtro-modal'
import {
  invalidateHistoricoTratamentosQueries,
  useGetHistoricoTratamentosPaginated,
} from '../queries/listagem-historico-tratamentos-queries'

const VALID = new Set<HistoricoTratamentoModo>([
  'datas',
  'utentes',
  'fisioterapeuta',
  'auxiliar',
  'outro',
  'organismo',
  'credencial',
])

const TITLES: Record<HistoricoTratamentoModo, string> = {
  datas: 'Histórico — Por Datas',
  utentes: 'Histórico — Por Utente',
  fisioterapeuta: 'Histórico — Por Fisioterapeuta',
  auxiliar: 'Histórico — Por Auxiliar',
  outro: 'Histórico — Por Terap. Ocupacional',
  organismo: 'Histórico — Por Organismo',
  credencial: 'Histórico — Por Credencial',
}

const perm = modules.areaAdministrativa.permissions.consultas.id

export function ListagemHistoricoTratamentosPage() {
  const { modo: modoParam } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canView } = useAreaComumEntityListPermissions(perm)

  const modo = (modoParam ?? '') as HistoricoTratamentoModo
  if (!VALID.has(modo)) {
    return <Navigate to='/area-administrativa/tratamentos/historico/datas' replace />
  }

  const [criteria, setCriteria] = useState<HistoricoTratCriteria>(
    emptyHistoricoTratCriteria
  )
  const [applied, setApplied] = useState(false)
  const [filtroOpen, setFiltroOpen] = useState(true)

  const enabled = applied && historicoTratListEnabled(modo, criteria)
  const apiFilters = useMemo(
    () => (enabled ? buildHistoricoTratApiFilters(criteria) : []),
    [enabled, criteria]
  )
  const ids = useMemo(
    () => ({
      utenteId: criteria.utenteId || null,
      fisioterapeutaId: criteria.fisioterapeutaId || null,
      auxiliarId: criteria.auxiliarId || null,
      outroTecnicoId: criteria.outroTecnicoId || null,
      organismoId: criteria.organismoId || null,
    }),
    [criteria]
  )

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    sorting,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: (p, ps, _f, s) =>
      useGetHistoricoTratamentosPaginated(
        modo,
        p,
        ps,
        apiFilters,
        s,
        ids,
        enabled
      ),
  })

  useEffect(() => {
    setApplied(false)
    setCriteria(emptyHistoricoTratCriteria())
    setFiltroOpen(true)
  }, [modo])

  const columns = useMemo(() => buildHistoricoTratamentosColumns(), [])

  const actions: DataTableAction<HistoricoTratamentoTableDTO>[] = [
    {
      label: 'Ver',
      icon: Eye,
      onClick: (row) =>
        navigate(`/area-administrativa/tratamentos/marcados/${row.id}`),
    },
  ]

  if (!canView) {
    return (
      <DashboardPageContainer>
        <Alert variant='destructive'>
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>Não pode ver o histórico.</AlertDescription>
        </Alert>
      </DashboardPageContainer>
    )
  }

  return (
    <>
      <PageHead title={`${TITLES[modo]} | Tratamentos`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={TITLES[modo]}
          toolbar={
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setFiltroOpen(true)}
              >
                <SlidersHorizontal className='mr-1 h-4 w-4' />
                Filtros
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  invalidateHistoricoTratamentosQueries(queryClient)
                }
              >
                <RefreshCw className='mr-1 h-4 w-4' />
                Actualizar
              </Button>
            </div>
          }
        >
          {!enabled ? (
            <p className='text-sm text-muted-foreground'>
              Defina os filtros e clique em Pesquisar.
            </p>
          ) : isError ? (
            <Alert variant='destructive'>
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                {(error as Error)?.message ?? 'Falha ao carregar.'}
              </AlertDescription>
            </Alert>
          ) : (
            <DataTable
              columns={columns}
              data={data?.data ?? []}
              pageCount={data?.totalPages ?? 0}
              pageIndex={page}
              pageSize={pageSize}
              onPaginationChange={handlePaginationChange}
              sorting={sorting}
              onSortingChange={handleSortingChange}
              isLoading={isLoading}
              actions={actions}
              totalCount={data?.totalCount}
            />
          )}
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      <HistoricoTratamentoFiltroModal
        open={filtroOpen}
        onOpenChange={setFiltroOpen}
        modo={modo}
        criteria={criteria}
        onApply={(next) => {
          setCriteria(next)
          setApplied(true)
        }}
      />
    </>
  )
}
```

---

### 15. areaAdministrativa.tsx (EDITAR)

**Localização:**  
`Frontend/src/routes/area-administrativa/areaAdministrativa.tsx`

**A)** Lazy (junto aos outros de tratamentos):

```tsx
const ListagemHistoricoTratamentosPage = lazy(() =>
  import(
    '@/pages/area-administrativa/tratamentos/historico/pages/listagem-historico-tratamentos-page'
  ).then((m) => ({ default: m.ListagemHistoricoTratamentosPage }))
)
```

**B)** Rota **antes** do catch-all `tratamentos/*`:

```tsx
  {
    path: 'area-administrativa/tratamentos/historico/:modo',
    element: (
      <LicenseGuard
        requiredModule={modules.areaAdministrativa.id}
        requiredPermission={modules.areaAdministrativa.permissions.consultas.id}
        actionType={actionTypes.AuthVer}
      >
        <ListagemHistoricoTratamentosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Histórico Tratamentos',
  },
```

---

## Checklist de aplicação

- [ ] Criar 7 ficheiros Backend
- [ ] Editar `MappingProfiles.cs` (using + CreateMap)
- [ ] Criar 6 ficheiros Frontend
- [ ] Editar `areaAdministrativa.tsx` (lazy + rota antes do `*`)
- [ ] Reiniciar `dotnet run`
- [ ] Testar menu Histórico → Por Datas → Pesquisar → Ver

## Teste manual

1. Menu **Histórico → Por Datas** → modal → **Pesquisar**
2. Acção **Ver** → `/area-administrativa/tratamentos/marcados/{id}`
3. Repetir modos: utente, fisioterapeuta, auxiliar, outro, organismo, credencial

## Fora deste MVP (C6.2+)

- Edt histórico próprio (`HistoricoTratamentosEdt`)
- Apagar / observações / reports
- Entidade de arquivo separada (se `Tratamento` activo ≠ arquivo legado)
