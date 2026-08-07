# Pack C7 — Admissões B2+ (MVP)

**Data:** 2026-08-07  
**Estado:** Pendente de aplicar (copiar/criar ficheiros abaixo)  
**Roadmap:** `Frontend/src/docs/plano-paridade-legado-newcc.md` §C7

---

## Objectivo

Paridade operacional das admissões diárias de tratamentos além dos flags Confirmado/Efectuado/Faltou:

| Acção | Paridade legado |
|-------|-----------------|
| **Desmarcar** | `ActualizaSituacaoDesmarcou` + motivo obrigatório |
| **Editar / Ver sessão** | `AdmissoesEdt` → reutilizar modal Marcados |
| **Chamar utente** | `ChamarUtente` → `ChamadaUtentesService` (já existe) |

## Arquitectura

| Decisão | Detalhe |
|---------|---------|
| Entidade | `Tratamentos.SessaoTratamento` + `Tratamentos.MotivosDesmarcacao` |
| Proibido | `dbo.SESSTRAT` / `dbo.PLANING` |
| Desmarcar | `Desmarcado=1` + `MotivoDesmarcacaoId` → linha some da lista (spec actual) |
| Chamar | `Core.ChamadaUtente` via `ChamadaUtentesService` |
| Editar / Ver | Reutilizar `SessaoTratamentoFichaModal` (Marcados); modal faz `getById` — não é `AdmissoesEdt` completo |
| API extra | `RemoverDesmarcacao` no BE (sem UI neste MVP) |
| Fora MVP | Uncheck/repor na grelha, compensar falta, sync PLANING, KQueue → C7.2+ |

## Legado (referência só de comportamento)

- `CliCloud.ASPcli/Client/Tratamentos/AdmissoesLst.js` — desmarcar, chamar, editar
- `Admissoes.cs` — `ActualizaSituacaoDesmarcou`, `ChamarUtente`, `AdmisessNewEdtSave`
- Mensagens: *"Deve selecionar o motivo da desmarcação"*, *"Utente chamado com sucesso."*

---

## Inventário (ordem de aplicação)

> **Não começar pela migration.** Primeiro o modelo (§1–§2); a migration (§3) só depois, gerada pelo EF.

### Backend — nesta ordem

1. **EDITAR** `Domain/Entities/Tratamentos/SessaoTratamento.cs` → **§1**
2. **EDITAR** `Infrastructure/Persistence/Configurations/SessaoTratamentoConfiguration.cs` → **§2**
3. **GERAR** migration `Add_SessaoTratamento_MotivoDesmarcacaoId` (`dotnet ef migrations add`) → validar vs **§3**
4. **Aplicar BD** `dotnet ef database update`
5. **CRIAR** `DTOs/DesmarcarAdmissaoTratamentoRequest.cs` → **§4**
6. **EDITAR** `IAdmissaoTratamentoAdministrativoService.cs` → **§5**
7. **EDITAR** `AdmissaoTratamentoAdministrativoService.cs` → **§6**
8. **EDITAR** `AdmissaoTratamentoAdministrativoController.cs` → **§7**

### Frontend — nesta ordem (após Backend)

9. **EDITAR** `admissao-tratamento-administrativo.dtos.ts` → **§8**
10. **EDITAR** `admissao-tratamento-administrativo-client.ts` → **§9**
11. **CRIAR** `admissoes/modals/admissao-tratamento-desmarcar-modal.tsx` → **§10**
12. **CRIAR** `admissoes/modals/admissao-tratamento-chamar-modal.tsx` → **§11**
13. **EDITAR** `listagem-admissoes-tratamento-table.columns.tsx` → **§12**
14. **EDITAR** `listagem-admissoes-tratamento-page.tsx` → **§13**

**Sem alteração:** `AdmissaoTratamentoSearchTable.cs` (mantém exclusão `Desmarcado == 0`).

### Notas ao aplicar (revisão 2026-08-07)

- **§1:** não acrescentar `using` — `MotivosDesmarcacao` já está no namespace `CliCloud.Domain.Entities.Tratamentos`.
- **SUBSTITUIR (§5–§7, §9, §12–§13):** o conteúdo base é o B1/B2 actual; se houver alterações locais nos mesmos ficheiros, fazer merge em vez de colar às cegas.
- **Coluna Desmarcado:** na lista fica sempre unchecked (a spec só devolve `Desmarcado == 0`); o check só abre o modal — igual ao fluxo legado `mdlMotivoDesmarcacao`.
- **`HistSess = 1`:** aproxima `SESSTRAT.UpdateHistoricoSessao` ao desmarcar; o stamp em `ObservSessao` é extra newCC (legado não escrevia texto aí).
- **Chamar:** FE usa `ChamadaUtentesService` já existente (`getDadosChamadaTratamento` / `chamarUtenteTratamento`) — não criar endpoint novo de chamada neste pack.

---

## Ordem de aplicação (passo a passo)

1. Editar **§1** `SessaoTratamento.cs` + **§2** `SessaoTratamentoConfiguration.cs` *(modelo primeiro)*
2. Gerar migration (padrão do repo — gera `.cs`, `.Designer.cs` e actualiza `ApplicationDbContextModelSnapshot.cs`):

```powershell
cd c:\Users\Globalsoft_ryzen_02\Desktop\New\newCC

dotnet ef migrations add Add_SessaoTratamento_MotivoDesmarcacaoId `
  --project Backend\CliCloud.Infrastructure `
  --startup-project Backend\CliCloud.WebApi
```

3. Abrir o `.cs` gerado e **confirmar** que o `Up()` coincide com **§3** (coluna + index + FK). Se diferir, substituir o `Up`/`Down` pelo de §3.
4. Aplicar BD:

```powershell
dotnet ef database update `
  --project Backend\CliCloud.Infrastructure `
  --startup-project Backend\CliCloud.WebApi
```

5. Restantes ficheiros Backend **§4–§7**, depois Frontend **§8–§13**
6. Reiniciar `dotnet run`

> **Nota:** Não colar só o `.cs` sem Designer/Snapshot — o EF não reconhece a migration. O conteúdo de §3 é referência do `Up`/`Down` esperado (igual a `20260803095808_Add_Tratamento_ListaEsperaTratamentoId.cs`). Não criar a migration à mão antes de §1–§2.

---

### 1. SessaoTratamento.cs (EDITAR)

**Localização:**  
`Backend/CliCloud.Domain/Entities/Tratamentos/SessaoTratamento.cs`

Imediatamente **a seguir** a linha `public int? Desmarcado { get; set; }` (sem `using` extra — `MotivosDesmarcacao` já está no mesmo namespace):

```csharp
    public Guid? MotivoDesmarcacaoId { get; set; }
    public MotivosDesmarcacao? MotivoDesmarcacao { get; set; }
```

---

### 2. SessaoTratamentoConfiguration.cs (EDITAR)

**Localização:**  
`Backend/CliCloud.Infrastructure/Persistence/Configurations/SessaoTratamentoConfiguration.cs`

Inserir **antes** do bloco `// Relacionamento 1:N com ServicoSessao`:

```csharp
      builder.HasOne(s => s.MotivoDesmarcacao)
        .WithMany()
        .HasForeignKey(s => s.MotivoDesmarcacaoId)
        .OnDelete(DeleteBehavior.SetNull);
```

---

### 3. Add_SessaoTratamento_MotivoDesmarcacaoId.cs (REFERÊNCIA / CRIAR se manual)

**Localização (após `dotnet ef migrations add`):**  
`Backend/CliCloud.Infrastructure/Persistence/Migrations/20260807100000_Add_SessaoTratamento_MotivoDesmarcacaoId.cs`  
*(timestamp gerado pelo EF pode ser diferente — manter o nome da classe `Add_SessaoTratamento_MotivoDesmarcacaoId`)*

```csharp
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CliCloud.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add_SessaoTratamento_MotivoDesmarcacaoId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MotivoDesmarcacaoId",
                schema: "Tratamentos",
                table: "SessaoTratamento",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SessaoTratamento_MotivoDesmarcacaoId",
                schema: "Tratamentos",
                table: "SessaoTratamento",
                column: "MotivoDesmarcacaoId");

            migrationBuilder.AddForeignKey(
                name: "FK_SessaoTratamento_MotivosDesmarcacao_MotivoDesmarcacaoId",
                schema: "Tratamentos",
                table: "SessaoTratamento",
                column: "MotivoDesmarcacaoId",
                principalSchema: "Tratamentos",
                principalTable: "MotivosDesmarcacao",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SessaoTratamento_MotivosDesmarcacao_MotivoDesmarcacaoId",
                schema: "Tratamentos",
                table: "SessaoTratamento");

            migrationBuilder.DropIndex(
                name: "IX_SessaoTratamento_MotivoDesmarcacaoId",
                schema: "Tratamentos",
                table: "SessaoTratamento");

            migrationBuilder.DropColumn(
                name: "MotivoDesmarcacaoId",
                schema: "Tratamentos",
                table: "SessaoTratamento");
        }
    }
}
```

---

### 4. DesmarcarAdmissaoTratamentoRequest.cs (CRIAR)

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/AdmissaoTratamentoAdministrativoService/DTOs/DesmarcarAdmissaoTratamentoRequest.cs`

```csharp
using FluentValidation;
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.DTOs;

public class DesmarcarAdmissaoTratamentoRequest : IDto
{
  public required Guid MotivoDesmarcacaoId { get; set; }
}

public class DesmarcarAdmissaoTratamentoValidator
  : AbstractValidator<DesmarcarAdmissaoTratamentoRequest>
{
  public DesmarcarAdmissaoTratamentoValidator()
  {
    _ = RuleFor(x => x.MotivoDesmarcacaoId).NotEmpty()
      .WithMessage("Deve selecionar o motivo da desmarcação");
  }
}
```

---

### 5. IAdmissaoTratamentoAdministrativoService.cs (SUBSTITUIR)

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/AdmissaoTratamentoAdministrativoService/IAdmissaoTratamentoAdministrativoService.cs`

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.DTOs;
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.Filters;

namespace CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService;

public interface IAdmissaoTratamentoAdministrativoService : ITransientService
{
  Task<PaginatedResponse<AdmissaoTratamentoTableDTO>> GetPaginatedAsync(
    AdmissaoTratamentoTableFilter filter
  );

  Task<Response<Guid>> UpdateSituacaoAsync(
    Guid id,
    UpdateAdmissaoTratamentoSituacaoRequest request
  );

  Task<Response<Guid>> DesmarcarAsync(
    Guid id,
    DesmarcarAdmissaoTratamentoRequest request
  );

  Task<Response<Guid>> RemoverDesmarcacaoAsync(Guid id);
}
```

---

### 6. AdmissaoTratamentoAdministrativoService.cs (SUBSTITUIR)

**Localização:**  
`Backend/CliCloud.Application/Services/Tratamentos/AdmissaoTratamentoAdministrativoService/AdmissaoTratamentoAdministrativoService.cs`

```csharp
using CliCloud.Application.Common;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.DTOs;
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.Filters;
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.Specifications;
using CliCloud.Application.Utility;
using CliCloud.Domain.Entities.Tratamentos;

namespace CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService;

public class AdmissaoTratamentoAdministrativoService(IRepositoryAsync repository)
  : IAdmissaoTratamentoAdministrativoService
{
  private readonly IRepositoryAsync _repository = repository;

  public async Task<PaginatedResponse<AdmissaoTratamentoTableDTO>> GetPaginatedAsync(
    AdmissaoTratamentoTableFilter filter
  )
  {
    if (filter.Filters?.Count > 0)
    {
      filter.PageNumber = 1;
    }

    string order =
      filter.Sorting != null ? GSHelpers.GenerateOrderByString(filter) : string.Empty;
    var spec = new AdmissaoTratamentoSearchTable(filter, order);

    return await _repository.GetPaginatedResultsAsync<
      SessaoTratamento,
      AdmissaoTratamentoTableDTO,
      Guid
    >(filter.PageNumber, filter.PageSize, spec);
  }

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

    if ((entity.Desmarcado ?? 0) == 1)
    {
      return ResponseFactory.Fail<Guid>("Sessão desmarcada. Remova a desmarcação primeiro.");
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

    int faltouDepois = entity.Faltou ?? 0;
    if (faltouDepois != faltouAntes)
    {
      Tratamento? tratamento = await _repository.GetByIdAsync<Tratamento, Guid>(
        entity.TratamentoId
      );
      if (tratamento != null)
      {
        int n = tratamento.NFalta ?? 0;
        tratamento.NFalta =
          faltouDepois == 1 ? n + 1 : Math.Max(0, n - 1);
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

  public async Task<Response<Guid>> DesmarcarAsync(
    Guid id,
    DesmarcarAdmissaoTratamentoRequest request
  )
  {
    SessaoTratamento? entity = await _repository.GetByIdAsync<SessaoTratamento, Guid>(id);
    if (entity == null)
    {
      return ResponseFactory.Fail<Guid>("Sessão de tratamento não encontrada.");
    }

    MotivosDesmarcacao? motivo = await _repository.GetByIdAsync<MotivosDesmarcacao, Guid>(
      request.MotivoDesmarcacaoId
    );
    if (motivo == null || motivo.DeletedOn != null)
    {
      return ResponseFactory.Fail<Guid>("Deve selecionar o motivo da desmarcação");
    }

    entity.Desmarcado = 1;
    entity.MotivoDesmarcacaoId = request.MotivoDesmarcacaoId;
    entity.HistSess = 1;

    string stamp =
      $"[{DateTime.Now:dd/MM/yyyy HH:mm}] Desmarcado — {motivo.Descricao}";
    entity.ObservSessao = string.IsNullOrWhiteSpace(entity.ObservSessao)
      ? stamp
      : entity.ObservSessao + Environment.NewLine + stamp;

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

  public async Task<Response<Guid>> RemoverDesmarcacaoAsync(Guid id)
  {
    SessaoTratamento? entity = await _repository.GetByIdAsync<SessaoTratamento, Guid>(id);
    if (entity == null)
    {
      return ResponseFactory.Fail<Guid>("Sessão de tratamento não encontrada.");
    }

    entity.Desmarcado = 0;
    entity.MotivoDesmarcacaoId = null;

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
}
```

---

### 7. AdmissaoTratamentoAdministrativoController.cs (SUBSTITUIR)

**Localização:**  
`Backend/CliCloud.WebApi/Controllers/Tratamentos/AdmissaoTratamentoAdministrativoController.cs`

```csharp
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService;
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.DTOs;
using CliCloud.Application.Services.Tratamentos.AdmissaoTratamentoAdministrativoService.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CliCloud.WebApi.Controllers.Tratamentos;

[Route("client/tratamentos/admissao-tratamento-administrativo")]
[ApiController]
public class AdmissaoTratamentoAdministrativoController(
  IAdmissaoTratamentoAdministrativoService service
) : ControllerBase
{
  private readonly IAdmissaoTratamentoAdministrativoService _service = service;

  [Authorize(Roles = "client")]
  [HttpPost("paginated")]
  public async Task<IActionResult> GetPaginated(
    [FromBody] AdmissaoTratamentoTableFilter filter
  ) => Ok(await _service.GetPaginatedAsync(filter));

  [Authorize(Roles = "client")]
  [HttpPut("{id:guid}/situacao")]
  public async Task<IActionResult> UpdateSituacao(
    Guid id,
    [FromBody] UpdateAdmissaoTratamentoSituacaoRequest request
  ) => Ok(await _service.UpdateSituacaoAsync(id, request));

  [Authorize(Roles = "client")]
  [HttpPut("{id:guid}/desmarcar")]
  public async Task<IActionResult> Desmarcar(
    Guid id,
    [FromBody] DesmarcarAdmissaoTratamentoRequest request
  ) => Ok(await _service.DesmarcarAsync(id, request));

  [Authorize(Roles = "client")]
  [HttpPut("{id:guid}/remover-desmarcacao")]
  public async Task<IActionResult> RemoverDesmarcacao(Guid id) =>
    Ok(await _service.RemoverDesmarcacaoAsync(id));
}
```

---

### 8. admissao-tratamento-administrativo.dtos.ts (EDITAR)

**Localização:**  
`Frontend/src/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos.ts`

Acrescentar no fim:

```ts
export interface DesmarcarAdmissaoTratamentoRequest {
  motivoDesmarcacaoId: string
}
```

---

### 9. admissao-tratamento-administrativo-client.ts (SUBSTITUIR)

**Localização:**  
`Frontend/src/lib/services/tratamentos/admissao-tratamento-administrativo-service/admissao-tratamento-administrativo-client.ts`

```ts
import state from '@/states/state'
import type { PaginatedResponse, GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  AdmissaoTratamentoTableDTO,
  AdmissaoTratamentoTableFilterRequest,
  DesmarcarAdmissaoTratamentoRequest,
  UpdateAdmissaoTratamentoSituacaoRequest,
} from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

const BASE = '/client/tratamentos/admissao-tratamento-administrativo'

export class AdmissaoTratamentoAdministrativoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  public async getPaginated(
    params: AdmissaoTratamentoTableFilterRequest
  ): Promise<ResponseApi<PaginatedResponse<AdmissaoTratamentoTableDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/paginated`, params)
  }

  public async updateSituacao(
    id: string,
    payload: UpdateAdmissaoTratamentoSituacaoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(
      state.URL,
      `${BASE}/${id}/situacao`,
      payload
    )
  }

  public async desmarcar(
    id: string,
    payload: DesmarcarAdmissaoTratamentoRequest
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(
      state.URL,
      `${BASE}/${id}/desmarcar`,
      payload
    )
  }

  public async removerDesmarcacao(
    id: string
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest(
      state.URL,
      `${BASE}/${id}/remover-desmarcacao`,
      {}
    )
  }
}

export function AdmissaoTratamentoAdministrativoService(
  idFuncionalidade: string
) {
  return new AdmissaoTratamentoAdministrativoClient(idFuncionalidade)
}
```

---

### 10. admissao-tratamento-desmarcar-modal.tsx (CRIAR)

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/admissoes/modals/admissao-tratamento-desmarcar-modal.tsx`

```tsx
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { AdmissaoTratamentoAdministrativoService } from '@/lib/services/tratamentos/admissao-tratamento-administrativo-service/admissao-tratamento-administrativo-client'
import { MotivosDesmarcacaoService } from '@/lib/services/motivos-desmarcacao-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { AdmissaoTratamentoTableDTO } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AdmissaoTratamentoTableDTO | null
  listPermId: string
  onDesmarcada?: () => void
}

export function AdmissaoTratamentoDesmarcarModal({
  open,
  onOpenChange,
  row,
  listPermId,
  onDesmarcada,
}: Props) {
  const [motivoId, setMotivoId] = useState('')
  const [motivoSearch, setMotivoSearch] = useState('')
  const [debMotivo] = useDebounce(motivoSearch, 300)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setMotivoId('')
      setMotivoSearch('')
    }
  }, [open, row?.id])

  const motivosQ = useQuery({
    queryKey: ['adm-trat-motivos-desmarc', debMotivo],
    queryFn: () =>
      MotivosDesmarcacaoService(listPermId).getMotivosDesmarcacaoLight(debMotivo),
    enabled: open,
  })

  const motivoItems = useMemo(
    () =>
      (motivosQ.data?.info?.data ?? []).map((m) => ({
        value: m.id,
        label: m.descricao,
      })),
    [motivosQ.data]
  )

  const utenteLabel = row
    ? [row.numeroUtente, row.utenteNome].filter(Boolean).join(' — ')
    : ''

  const handleConfirmar = async () => {
    if (!row?.id) return
    if (!motivoId) {
      toast.error('Deve selecionar o motivo da desmarcação')
      return
    }

    setSaving(true)
    try {
      const res = await AdmissaoTratamentoAdministrativoService(listPermId).desmarcar(
        row.id,
        { motivoDesmarcacaoId: motivoId }
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Sessão desmarcada')
        onOpenChange(false)
        onDesmarcada?.()
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível desmarcar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Não foi possível desmarcar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Motivo de Desmarcação</DialogTitle>
          <DialogDescription>
            {utenteLabel
              ? `Desmarcar a sessão de ${utenteLabel}. O registo deixa de aparecer na lista do dia.`
              : 'Desmarcar esta sessão. O registo deixa de aparecer na lista do dia.'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2 py-2'>
          <Label>Tipo de Motivo de Desmarcação</Label>
          <AsyncCombobox
            value={motivoId}
            onChange={setMotivoId}
            searchValue={motivoSearch}
            onSearchValueChange={setMotivoSearch}
            items={motivoItems}
            isLoading={motivosQ.isFetching}
            placeholder='Selecione…'
            searchPlaceholder='Pesquisar motivo…'
            emptyText='Sem motivos'
            disabled={saving}
          />
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={() => void handleConfirmar()}
            disabled={saving}
          >
            {saving ? 'A desmarcar…' : 'Desmarcar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### 11. admissao-tratamento-chamar-modal.tsx (CRIAR)

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/admissoes/modals/admissao-tratamento-chamar-modal.tsx`

```tsx
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChamadaUtentesService } from '@/lib/services/core/chamada-utentes-service'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import type { AdmissaoTratamentoTableDTO } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: AdmissaoTratamentoTableDTO | null
  listPermId: string
}

export function AdmissaoTratamentoChamarModal({
  open,
  onOpenChange,
  row,
  listPermId,
}: Props) {
  const [sala, setSala] = useState('')
  const [tecnico, setTecnico] = useState('')
  const [nomeUtente, setNomeUtente] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !row?.id) return

    setLoading(true)
    void (async () => {
      try {
        const res = await ChamadaUtentesService(listPermId).getDadosChamadaTratamento(
          row.id,
          false
        )
        const d = res.info?.data
        if (res.info?.status !== ResponseStatus.Success || !d) {
          toast.error('Não foi possível obter dados para chamar.')
          onOpenChange(false)
          return
        }
        if (d.existeChamadaAtiva) {
          toast.error('Já existe uma chamada pendente para a consulta.')
          onOpenChange(false)
          return
        }
        if (d.existeChamadaFeita) {
          const ok = window.confirm(
            'Já existe uma chamada efetuada para a sessão, deseja chamar outra vez?'
          )
          if (!ok) {
            onOpenChange(false)
            return
          }
          const res2 = await ChamadaUtentesService(listPermId).getDadosChamadaTratamento(
            row.id,
            true
          )
          const d2 = res2.info?.data
          if (!d2) {
            onOpenChange(false)
            return
          }
          setNomeUtente(d2.nomeUtente)
          setSala(d2.sala ?? row.localTratamentoNome ?? '')
          setTecnico(
            d2.nomeProfissional
              ?? row.fisioterapeutaNome
              ?? row.auxiliarNome
              ?? row.outroTecnicoNome
              ?? ''
          )
          return
        }
        setNomeUtente(d.nomeUtente)
        setSala(d.sala ?? row.localTratamentoNome ?? '')
        setTecnico(
          d.nomeProfissional
            ?? row.fisioterapeutaNome
            ?? row.auxiliarNome
            ?? row.outroTecnicoNome
            ?? ''
        )
      } catch {
        toast.error('Erro ao carregar dados da chamada.')
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    })()
  }, [open, row, listPermId, onOpenChange])

  const handleChamar = async () => {
    if (!row?.id) return
    if (!sala.trim()) {
      toast.error('Indique a sala.')
      return
    }
    if (!tecnico.trim()) {
      toast.error('É necessário escolher um técnico')
      return
    }

    setSaving(true)
    try {
      const res = await ChamadaUtentesService(listPermId).chamarUtenteTratamento(
        row.id,
        { sala: sala.trim(), nomeTecnico: tecnico.trim() }
      )
      if (res.info?.status === ResponseStatus.Success) {
        toast.success('Utente chamado com sucesso.')
        onOpenChange(false)
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível chamar.'
        toast.error(msg)
      }
    } catch {
      toast.error('Não foi possível chamar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Chamar utente</DialogTitle>
        </DialogHeader>
        <div className='space-y-3 py-2'>
          <div className='space-y-1'>
            <Label>Utente</Label>
            <Input value={nomeUtente || row?.utenteNome || ''} disabled />
          </div>
          <div className='space-y-1'>
            <Label>Sala</Label>
            <Input
              value={sala}
              onChange={(e) => setSala(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className='space-y-1'>
            <Label>Técnico</Label>
            <Input
              value={tecnico}
              onChange={(e) => setTecnico(e.target.value)}
              disabled={loading || saving}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            onClick={() => void handleChamar()}
            disabled={loading || saving}
          >
            {saving ? 'A chamar…' : 'Chamar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

### 12. listagem-admissoes-tratamento-table.columns.tsx (SUBSTITUIR)

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/admissoes/components/listagem-admissoes-tratamento-table.columns.tsx`

```tsx
import { Volume2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import type { AdmissaoTratamentoTableDTO } from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'

type ToggleFn = (
  row: AdmissaoTratamentoTableDTO,
  campo: 'confirmado' | 'efetuado' | 'faltou',
  valor: 0 | 1
) => void

export function buildAdmissoesTratamentoColumns(opts: {
  canChange: boolean
  showConfirmado: boolean
  showFaltou: boolean
  onToggle: ToggleFn
  onDesmarcar: (row: AdmissaoTratamentoTableDTO) => void
  onChamar: (row: AdmissaoTratamentoTableDTO) => void
  onOpenView: (row: AdmissaoTratamentoTableDTO) => void
  onOpenEdit?: (row: AdmissaoTratamentoTableDTO) => void
  rowActionPermissions?: AreaComumListRowActionPermissions
}): ColumnDef<AdmissaoTratamentoTableDTO>[] {
  const cols: ColumnDef<AdmissaoTratamentoTableDTO>[] = [
    {
      accessorKey: 'data',
      header: 'Data',
      cell: ({ row }) =>
        row.original.data
          ? new Date(row.original.data).toLocaleDateString('pt-PT')
          : '—',
    },
    {
      id: 'hora',
      header: 'Hora',
      cell: ({ row }) =>
        row.original.horaFisio || row.original.horaInic || '—',
    },
    {
      accessorKey: 'utenteNome',
      header: 'Utente',
      cell: ({ row }) => {
        const num = row.original.numeroUtente
        const nome = row.original.utenteNome
        if (!num && !nome) return '—'
        return [num, nome].filter(Boolean).join(' — ')
      },
    },
    {
      accessorKey: 'fisioterapeutaNome',
      header: 'Fisioterapeuta',
      cell: ({ row }) => row.original.fisioterapeutaNome ?? '—',
    },
    {
      accessorKey: 'auxiliarNome',
      header: 'Auxiliar',
      cell: ({ row }) => row.original.auxiliarNome ?? '—',
    },
    {
      accessorKey: 'outroTecnicoNome',
      header: 'Terap. Ocup./Fala',
      cell: ({ row }) => row.original.outroTecnicoNome ?? '—',
    },
    {
      accessorKey: 'localTratamentoNome',
      header: 'Local',
      cell: ({ row }) => row.original.localTratamentoNome ?? '—',
    },
  ]

  if (opts.showConfirmado) {
    cols.push({
      id: 'confirmado',
      header: 'Confirmado',
      enableSorting: false,
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.confirmado === 1}
          disabled={!opts.canChange}
          onCheckedChange={(c) =>
            opts.onToggle(row.original, 'confirmado', c ? 1 : 0)
          }
        />
      ),
    })
  }

  cols.push({
    id: 'efetuado',
    header: 'Efectuado',
    enableSorting: false,
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.efetuado === 1}
        disabled={!opts.canChange}
        onCheckedChange={(c) =>
          opts.onToggle(row.original, 'efetuado', c ? 1 : 0)
        }
      />
    ),
  })

  if (opts.showFaltou) {
    cols.push({
      id: 'faltou',
      header: 'Faltou',
      enableSorting: false,
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.faltou === 1}
          disabled={!opts.canChange}
          onCheckedChange={(c) =>
            opts.onToggle(row.original, 'faltou', c ? 1 : 0)
          }
        />
      ),
    })
  }

  cols.push({
    id: 'desmarcado',
    header: 'Desmarcado',
    enableSorting: false,
    cell: ({ row }) => (
      <Checkbox
        checked={row.original.desmarcado === 1}
        disabled={!opts.canChange}
        onCheckedChange={(c) => {
          if (c) opts.onDesmarcar(row.original)
        }}
      />
    ),
  })

  cols.push({
    id: 'chamar',
    header: '',
    enableSorting: false,
    cell: ({ row }) => (
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-8 w-8'
        title='Chamar utente'
        disabled={!opts.canChange}
        onClick={() => opts.onChamar(row.original)}
      >
        <Volume2 className='h-4 w-4' />
      </Button>
    ),
  })

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

  cols.push(
    createAreaComumListActionsColumnDef<AdmissaoTratamentoTableDTO>({
      onOpenView: opts.onOpenView,
      onOpenEdit: opts.onOpenEdit,
      omitDelete: true,
      rowActionPermissions: opts.rowActionPermissions,
    })
  )

  return cols
}
```

---

### 13. listagem-admissoes-tratamento-page.tsx (SUBSTITUIR)

**Localização:**  
`Frontend/src/pages/area-administrativa/tratamentos/admissoes/pages/listagem-admissoes-tratamento-page.tsx`

```tsx
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RotateCw, Search } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { AreaComumListagemPageShell } from '@/components/shared/area-comum-listagem-page-shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePageData, buildFiltersWithValue } from '@/utils/page-data-utils'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { modules } from '@/config/modules'
import { ResponseStatus } from '@/types/api/responses'
import { toast } from '@/utils/toast-utils'
import {
  ModoListagemAdmissaoTratamento,
  type AdmissaoTratamentoTableDTO,
} from '@/types/dtos/tratamentos/admissao-tratamento-administrativo.dtos'
import type { SessaoTratamentoTableDTO } from '@/types/dtos/tratamentos/sessao-tratamento.dtos'
import { AdmissaoTratamentoAdministrativoService } from '@/lib/services/tratamentos/admissao-tratamento-administrativo-service/admissao-tratamento-administrativo-client'
import { ListagemAdmissoesTratamentoTable } from '../components/listagem-admissoes-tratamento-table'
import { buildAdmissoesTratamentoColumns } from '../components/listagem-admissoes-tratamento-table.columns'
import {
  invalidateAdmissoesTratamentoQueries,
  useGetAdmissoesTratamentoPaginated,
  usePrefetchAdjacentAdmissoesTratamento,
} from '../queries/listagem-admissoes-tratamento-queries'
import type { DataTableAction } from '@/components/shared/data-table'
import { SelecionarLocalTratamentoModal } from '../modals/selecionar-local-tratamento-modal'
import { AdmissaoTratamentoDesmarcarModal } from '../modals/admissao-tratamento-desmarcar-modal'
import { AdmissaoTratamentoChamarModal } from '../modals/admissao-tratamento-chamar-modal'
import { SessaoTratamentoFichaModal } from '../../marcados/modals/sessao-tratamento-ficha-modal'

const listPermId = modules.areaAdministrativa.permissions.admissoes.id

const TITLE: Record<ModoListagemAdmissaoTratamento, string> = {
  [ModoListagemAdmissaoTratamento.UtentesHora]: 'Admissões — Utentes/Hora',
  [ModoListagemAdmissaoTratamento.Presentes]: 'Admissões — Utentes Presentes',
  [ModoListagemAdmissaoTratamento.LocalTratamento]:
    'Admissões — Local de Tratamento',
}

function toSessaoRow(row: AdmissaoTratamentoTableDTO): SessaoTratamentoTableDTO {
  return {
    id: row.id,
    tratamentoId: row.tratamentoId,
    numSessao: row.numSessao,
    data: row.data,
    horaInic: row.horaInic,
    faltou: row.faltou,
    confirmado: row.confirmado,
    efetuado: row.efetuado,
    desmarcado: row.desmarcado,
    createdOn: '',
    servicosCount: 0,
  }
}

export function ListagemAdmissoesTratamentoPage({
  modo = ModoListagemAdmissaoTratamento.UtentesHora,
}: {
  modo?: ModoListagemAdmissaoTratamento
}) {
  const { canView, canChange } = useAreaComumEntityListPermissions(listPermId)
  const queryClient = useQueryClient()
  const today = new Date().toISOString().slice(0, 10)
  const isModoLocal = modo === ModoListagemAdmissaoTratamento.LocalTratamento
  const [localModalOpen, setLocalModalOpen] = useState(false)
  const [desmarcarRow, setDesmarcarRow] =
    useState<AdmissaoTratamentoTableDTO | null>(null)
  const [chamarRow, setChamarRow] =
    useState<AdmissaoTratamentoTableDTO | null>(null)
  const [fichaRow, setFichaRow] =
    useState<AdmissaoTratamentoTableDTO | null>(null)
  const [fichaMode, setFichaMode] = useState<'view' | 'edit'>('view')

  const {
    data,
    isLoading,
    isError,
    error,
    page,
    pageSize,
    filters,
    sorting,
    handleFiltersChange,
    handlePaginationChange,
    handleSortingChange,
  } = usePageData({
    useGetDataPaginated: (p, ps, f, s) =>
      useGetAdmissoesTratamentoPaginated(modo, p, ps, f, s),
    usePrefetchAdjacentData: (p, ps, f) =>
      usePrefetchAdjacentAdmissoesTratamento(modo, p, ps, f),
    defaultFilters: [{ id: 'data', value: today }],
  })

  const localId =
    filters.find((f) => f.id === 'localTratamentoId')?.value ?? ''

  useEffect(() => {
    if (isModoLocal && !localId) {
      setLocalModalOpen(true)
    }
  }, [isModoLocal, localId])

  const rows = data?.info?.data ?? []
  const pageCount = data?.info?.totalPages ?? 0
  const totalRows = data?.info?.totalCount ?? 0
  const errorMessage =
    error instanceof Error ? error.message : error ? String(error) : ''

  const applyLocal = (id: string) => {
    handleFiltersChange(
      buildFiltersWithValue(
        filters.length ? filters : [{ id: 'data', value: today }],
        'localTratamentoId',
        id
      )
    )
    handlePaginationChange(1, pageSize)
  }

  const onToggle = async (
    row: AdmissaoTratamentoTableDTO,
    campo: 'confirmado' | 'efetuado' | 'faltou',
    valor: 0 | 1
  ) => {
    if (!canChange || !row.id) return

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

    try {
      const res = await AdmissaoTratamentoAdministrativoService(
        listPermId
      ).updateSituacao(row.id, { campo, valor })
      if (res.info?.status === ResponseStatus.Success) {
        invalidateAdmissoesTratamentoQueries(queryClient)
      } else {
        const msg =
          Object.values(res.info?.messages ?? {})
            .flat()
            .find(Boolean) ?? 'Não foi possível actualizar a situação.'
        toast.error(msg)
      }
    } catch (e: unknown) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Erro ao actualizar situação.')
    }
  }

  const refresh = () => invalidateAdmissoesTratamentoQueries(queryClient)

  const toolbarActions: DataTableAction[] = [
    {
      label: 'Atualizar',
      icon: <RotateCw className='h-4 w-4' />,
      onClick: refresh,
      variant: 'outline',
    },
    ...(isModoLocal
      ? [
          {
            label: 'Nova pesquisa',
            icon: <Search className='h-4 w-4' />,
            onClick: () => setLocalModalOpen(true),
            variant: 'outline' as const,
          },
        ]
      : []),
  ]

  const columns = buildAdmissoesTratamentoColumns({
    canChange,
    showConfirmado: modo !== ModoListagemAdmissaoTratamento.Presentes,
    showFaltou: modo !== ModoListagemAdmissaoTratamento.Presentes,
    onToggle,
    onDesmarcar: (row) => setDesmarcarRow(row),
    onChamar: (row) => setChamarRow(row),
    onOpenView: (row) => {
      setFichaMode('view')
      setFichaRow(row)
    },
    onOpenEdit: canChange
      ? (row) => {
          setFichaMode('edit')
          setFichaRow(row)
        }
      : undefined,
    rowActionPermissions: { canView, canChange, canDelete: false },
  })

  if (!canView) {
    return (
      <DashboardPageContainer>
        <Alert variant='destructive'>
          <AlertTitle>Sem permissão</AlertTitle>
          <AlertDescription>
            Não tem permissão para ver admissões de tratamentos.
          </AlertDescription>
        </Alert>
      </DashboardPageContainer>
    )
  }

  return (
    <>
      <PageHead title={`${TITLE[modo]} | CliCloud`} />
      <DashboardPageContainer>
        <AreaComumListagemPageShell
          title={TITLE[modo]}
          onRefresh={refresh}
        >
          {isError ? (
            <Alert variant='destructive' className='mb-4'>
              <AlertTitle>Falha ao carregar admissões</AlertTitle>
              <AlertDescription>
                {errorMessage || 'Erro ao pedir a lista.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <ListagemAdmissoesTratamentoTable
            data={rows}
            columns={columns}
            isLoading={isLoading}
            pageCount={pageCount}
            totalRows={totalRows}
            page={page}
            pageSize={pageSize}
            filters={filters}
            sorting={sorting}
            onPaginationChange={handlePaginationChange}
            onFiltersChange={handleFiltersChange}
            onSortingChange={handleSortingChange}
            toolbarActions={toolbarActions}
            modo={modo}
          />
        </AreaComumListagemPageShell>
      </DashboardPageContainer>

      {isModoLocal ? (
        <SelecionarLocalTratamentoModal
          open={localModalOpen}
          onOpenChange={setLocalModalOpen}
          initialLocalId={localId}
          onConfirm={applyLocal}
        />
      ) : null}

      <AdmissaoTratamentoDesmarcarModal
        open={!!desmarcarRow}
        onOpenChange={(o) => {
          if (!o) setDesmarcarRow(null)
        }}
        row={desmarcarRow}
        listPermId={listPermId}
        onDesmarcada={refresh}
      />

      <AdmissaoTratamentoChamarModal
        open={!!chamarRow}
        onOpenChange={(o) => {
          if (!o) setChamarRow(null)
        }}
        row={chamarRow}
        listPermId={listPermId}
      />

      {fichaRow ? (
        <SessaoTratamentoFichaModal
          open={!!fichaRow}
          onOpenChange={(o) => {
            if (!o) setFichaRow(null)
          }}
          mode={fichaMode}
          tratamentoId={fichaRow.tratamentoId}
          listPermId={listPermId}
          defaultFisioId={fichaRow.fisioterapeutaId ?? ''}
          defaultFisioLabel={fichaRow.fisioterapeutaNome ?? ''}
          defaultAuxId={fichaRow.auxiliarId ?? ''}
          defaultAuxLabel={fichaRow.auxiliarNome ?? ''}
          defaultOutroId={fichaRow.outroTecnicoId ?? ''}
          defaultOutroLabel={fichaRow.outroTecnicoNome ?? ''}
          existingSessoes={[]}
          row={toSessaoRow(fichaRow)}
          onSaved={() => {
            setFichaRow(null)
            refresh()
          }}
        />
      ) : null}
    </>
  )
}

export function ListagemAdmissoesTratamentoPresentesPage() {
  return (
    <ListagemAdmissoesTratamentoPage
      modo={ModoListagemAdmissaoTratamento.Presentes}
    />
  )
}

export function ListagemAdmissoesTratamentoLocalPage() {
  return (
    <ListagemAdmissoesTratamentoPage
      modo={ModoListagemAdmissaoTratamento.LocalTratamento}
    />
  )
}
```

---

## Checklist de aplicação

- [ ] **§1–§2** Entidade + Configuration *(primeiro — sem isto a migration fica vazia/errada)*
- [ ] `dotnet ef migrations add Add_SessaoTratamento_MotivoDesmarcacaoId`
- [ ] Validar `Up()` vs **§3**
- [ ] `dotnet ef database update`
- [ ] **§4–§7** Backend (DTO + service + controller)
- [ ] **§8–§13** Frontend
- [ ] Motivos de desmarcação existem (Área Comum → Tabelas → Motivos Desmarcação)
- [ ] Reiniciar `dotnet run`

## Teste manual

1. Admissões Utentes/Hora → marcar **Desmarcado** → escolher motivo → toast *Sessão desmarcada* → linha desaparece  
2. Cancelar o modal de motivo → checkbox Desmarcado volta/fica unchecked (não grava)  
3. Ícone volume → **Chamar** → toast *Utente chamado com sucesso.*  
4. Opções → **Ver** / **Editar** → `SessaoTratamentoFichaModal` carrega por `getById`  
5. Flags Confirmado/Efectuado/Faltou continuam OK  

## Fora deste MVP (C7.2+)

- UI para repor desmarcação (uncheck) — o endpoint `RemoverDesmarcacao` já fica no BE deste pack  
- Compensar falta a partir da admissão  
- Sync agenda / PLANING (legado: `PLANING.DeleteParaDesmarcou` / recriar)  
- KQueue externo  
- Paridade total `AdmissoesEdt` (tab serviços prescritos read-only, etc.)
