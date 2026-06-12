# Implementação — Impostos (Motivo Isenção + Motivo Retenção na Fonte)

**Data:** 2026-06-12  
**Âmbito:** submenu **Faturação → Tabelas → Imposto** (legado vs projeto novo)  
**Raiz do projeto:** `c:\Users\Globalsoft_ryzen_02\Desktop\New\newCC\`

---

## 1. Contexto (legado)

No legado existem **dois módulos distintos** no submenu Imposto. **Não dependem um do outro** — só podem coexistir no mesmo documento fiscal.

| # | Menu legado | Ecrã | Tabela | Conceito fiscal |
|---|-------------|------|--------|-----------------|
| 1 | Motivos de Retenção de Imposto *(nome errado)* | `MotivoIsencaoLst.aspx` | `Faturacao.MotivoIsencao` | **Isenção IVA** (SAFT M-codes) |
| 2 | Taxa de Imposto | `TaxaIvaLst.aspx` | `Faturacao.TaxaIva` + `dbo.TAXASIVA` | Taxas IVA |
| 3 | Motivos de Retenção | `MotivoRetencaoFonteLst.aspx` | `dbo.MOTIVOS_RETENCAO` | **Retenção na fonte** (IRS/IRC/IS) |

**Estado atual no projeto novo:**

| Módulo | Estado |
|--------|--------|
| `MotivoIsencao` | ✅ Implementado (dados OK, 28 registos seed) — corrigir labels + faturação por linha |
| `TaxaIva` | ✅ OK |
| `MotivoRetencao` | ❌ Por implementar |

---

## 2. Índice de ficheiros

| Grupo | Criar | Alterar |
|-------|-------|---------|
| A — Corrigir isenção (labels) | 0 | 3 |
| B — Backend MotivoRetencao | 16 | 2 |
| C — Migração BD | 1 | 0 |
| D — Frontend MotivoRetencao | 9 | 2 |
| E — Faturação | 0 | 6 |

**Ordem de execução recomendada:** B → C → D → A → E

---

# GRUPO A — ALTERAR (só textos isenção)

## A1. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-isencao/pages/listagem-motivos-isencao-page.tsx`

Substituir linhas do título:

```tsx
<PageHead title='Motivos de Isenção | Tabelas | CliCloud' />
// ...
title='Motivos de Isenção'
```

## A2. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-isencao/modals/motivo-isencao-view-create-modal.tsx`

```tsx
const MODAL_TITLE = 'Motivos de Isenção'
```

```tsx
<DialogDescription className='sr-only'>
  Formulário de motivos de isenção de IVA.
</DialogDescription>
```

## A3. `Frontend/src/config/menu-items.ts`

**Área Financeira → Imposto** (~linha 543): label → `'Motivos de Isenção'`

**Área Comum → Tabelas** (~linha 856): label → `'Motivos de Isenção'`

**Adicionar 3.º item** em ambos os blocos `Imposto` (depois de Taxas IVA):

```tsx
{
  label: 'Motivos de Retenção',
  href: '/area-comum/tabelas/tabelas/motivos-retencao',
  funcionalidadeId: modules.areaComum.permissions.taxasIva.id,
  funcionalidadeFallbackIds: [
    modules.areaFinanceira.permissions.tabelas.id,
  ],
},
```

---

# GRUPO B — CRIAR (Backend)

## B1. `Backend/CliCloud.Domain/Entities/TaxasIva/MotivoRetencao.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;

namespace CliCloud.Domain.Entities.TaxasIva
{
    [Table("MotivoRetencao", Schema = "Utility")]
    public class MotivoRetencao : AuditableEntityWithSoftDelete
    {
        [Key]
        public new Guid Id { get; set; }

        public int Codigo { get; set; }

        [Required]
        [StringLength(150)]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [StringLength(3)]
        public string TipoImposto { get; set; } = string.Empty;
    }
}
```

## B2. `Backend/CliCloud.Infrastructure/Persistence/Configurations/MotivoRetencaoConfiguration.cs`

```csharp
using CliCloud.Domain.Entities.TaxasIva;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CliCloud.Infrastructure.Persistence.Configurations
{
    public class MotivoRetencaoConfiguration : IEntityTypeConfiguration<MotivoRetencao>
    {
        public void Configure(EntityTypeBuilder<MotivoRetencao> builder)
        {
            builder.ToTable("MotivoRetencao", "Utility");
            builder.Property(x => x.Descricao).HasMaxLength(150);
            builder.Property(x => x.TipoImposto).HasMaxLength(3);
            builder.HasIndex(x => x.Codigo).IsUnique();
            builder.HasIndex(x => x.TipoImposto);
        }
    }
}
```

## B3. `Backend/CliCloud.Application/Services/TaxasIva/MotivoRetencaoService/IMotivoRetencaoService.cs`

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Filters;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService
{
    public interface IMotivoRetencaoService : ITransientService
    {
        Task<Response<IEnumerable<MotivoRetencaoDTO>>> GetMotivoRetencaoAsync(string keyword = "");
        Task<Response<IEnumerable<MotivoRetencaoLightDTO>>> GetMotivoRetencaoLightAsync(string keyword = "", string? tipoImposto = null);
        Task<PaginatedResponse<MotivoRetencaoTableDTO>> GetMotivoRetencaoPaginatedAsync(MotivoRetencaoTableFilter filter);
        Task<Response<IEnumerable<MotivoRetencaoTableDTO>>> GetAllMotivoRetencaoAsync(MotivoRetencaoAllFilter? filter);
        Task<Response<MotivoRetencaoDTO>> GetMotivoRetencaoAsync(Guid id);
        Task<Response<Guid>> CreateMotivoRetencaoAsync(CreateMotivoRetencaoRequest request);
        Task<Response<Guid>> UpdateMotivoRetencaoAsync(UpdateMotivoRetencaoRequest request, Guid id);
        Task<Response<Guid>> DeleteMotivoRetencaoAsync(Guid id);
        Task<Response<IEnumerable<Guid>>> DeleteMultipleMotivoRetencaoAsync(IEnumerable<Guid> ids);
    }
}
```

## B4. DTOs — `Backend/CliCloud.Application/Services/TaxasIva/MotivoRetencaoService/DTOs/`

### `MotivoRetencaoDTO.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs
{
    public class MotivoRetencaoDTO : IDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string TipoImposto { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public DateTime? LastModifiedOn { get; set; }
    }
}
```

### `MotivoRetencaoLightDTO.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs
{
    public class MotivoRetencaoLightDTO : IDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string TipoImposto { get; set; } = string.Empty;
    }
}
```

### `MotivoRetencaoTableDTO.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs
{
    public class MotivoRetencaoTableDTO : IDto
    {
        public Guid Id { get; set; }
        public int Codigo { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string TipoImposto { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
    }
}
```

### `CreateMotivoRetencaoRequest.cs`

```csharp
using FluentValidation;
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs
{
    public class CreateMotivoRetencaoRequest : IDto
    {
        public int Codigo { get; set; }
        public required string Descricao { get; set; }
        public required string TipoImposto { get; set; }
    }

    public class CreateMotivoRetencaoValidator : AbstractValidator<CreateMotivoRetencaoRequest>
    {
        public CreateMotivoRetencaoValidator()
        {
            _ = RuleFor(x => x.Codigo).GreaterThan(0);
            _ = RuleFor(x => x.Descricao).NotEmpty().MaximumLength(150);
            _ = RuleFor(x => x.TipoImposto).NotEmpty().MaximumLength(3);
        }
    }
}
```

### `UpdateMotivoRetencaoRequest.cs`

```csharp
using FluentValidation;
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs
{
    public class UpdateMotivoRetencaoRequest : IDto
    {
        public int Codigo { get; set; }
        public required string Descricao { get; set; }
        public required string TipoImposto { get; set; }
    }

    public class UpdateMotivoRetencaoValidator : AbstractValidator<UpdateMotivoRetencaoRequest>
    {
        public UpdateMotivoRetencaoValidator()
        {
            _ = RuleFor(x => x.Codigo).GreaterThan(0);
            _ = RuleFor(x => x.Descricao).NotEmpty().MaximumLength(150);
            _ = RuleFor(x => x.TipoImposto).NotEmpty().MaximumLength(3);
        }
    }
}
```

### `DeleteMultipleMotivoRetencaoRequest.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs
{
    public class DeleteMultipleMotivoRetencaoRequest : IDto
    {
        public IEnumerable<Guid> Ids { get; set; } = [];
    }
}
```

## B5. Filters — `Backend/CliCloud.Application/Services/TaxasIva/MotivoRetencaoService/Filters/`

### `MotivoRetencaoTableFilter.cs`

```csharp
using CliCloud.Application.Common.Filter;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Filters
{
    public class MotivoRetencaoTableFilter : PaginationFilter
    {
        public List<TableFilter> Filters { get; set; } = [];
    }
}
```

### `MotivoRetencaoAllFilter.cs`

```csharp
using CliCloud.Application.Common.Filter;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Filters
{
    public class MotivoRetencaoAllFilter
    {
        private List<TableFilter>? _filters;
        private List<TanstackColumnOrder>? _sorting;

        public List<TableFilter> Filters { get => _filters ??= []; set => _filters = value ?? []; }
        public List<TanstackColumnOrder> Sorting { get => _sorting ??= []; set => _sorting = value ?? []; }

        public string GetOrderByString()
        {
            if (Sorting.Count == 0) return "";
            var valid = Sorting.Where(sc => !string.IsNullOrWhiteSpace(sc.Id)).ToList();
            if (valid.Count == 0) return "";
            return string.Join(",", valid.Select(s => (s.Desc ? "-" : "") + s.Id));
        }
    }
}
```

## B6. Specifications — `Backend/CliCloud.Application/Services/TaxasIva/MotivoRetencaoService/Specifications/`

### `MotivoRetencaoSearchList.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.TaxasIva;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Specifications
{
    public class MotivoRetencaoSearchList : Specification<MotivoRetencao>
    {
        public MotivoRetencaoSearchList(string? keyword = "", string? tipoImposto = null)
        {
            if (!string.IsNullOrWhiteSpace(tipoImposto))
                _ = Query.Where(x => x.TipoImposto == tipoImposto);

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                _ = Query.Where(x =>
                    x.Descricao.Contains(keyword) ||
                    x.Codigo.ToString().Contains(keyword) ||
                    x.TipoImposto.Contains(keyword));
            }

            _ = Query.OrderBy(x => x.Codigo);
        }
    }
}
```

### `MotivoRetencaoSearchTable.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Application.Common.Filter;
using CliCloud.Domain.Entities.TaxasIva;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Specifications
{
    public class MotivoRetencaoSearchTable : Specification<MotivoRetencao>
    {
        public MotivoRetencaoSearchTable(List<TableFilter> filters, string? dynamicOrder = "")
        {
            if (filters != null && filters.Count > 0)
            {
                foreach (var f in filters)
                {
                    switch (f.Id.ToLowerInvariant())
                    {
                        case "codigo":
                            if (int.TryParse(f.Value, out var codigo))
                                _ = Query.Where(x => x.Codigo == codigo);
                            break;
                        case "descricao":
                            if (!string.IsNullOrWhiteSpace(f.Value))
                                _ = Query.Where(x => x.Descricao.Contains(f.Value));
                            break;
                        case "tipoimposto":
                            if (!string.IsNullOrWhiteSpace(f.Value))
                                _ = Query.Where(x => x.TipoImposto == f.Value);
                            break;
                    }
                }
            }

            _ = string.IsNullOrEmpty(dynamicOrder)
                ? Query.OrderBy(x => x.Codigo)
                : Query.OrderBy(dynamicOrder);
        }
    }
}
```

## B7. `Backend/CliCloud.Application/Services/TaxasIva/MotivoRetencaoService/MotivoRetencaoService.cs`

```csharp
using AutoMapper;
using CliCloud.Application.Common;
using CliCloud.Application.Common.Filter;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Utility;
using CliCloud.Domain.Entities.TaxasIva;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Filters;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Specifications;

namespace CliCloud.Application.Services.TaxasIva.MotivoRetencaoService
{
    public class MotivoRetencaoService : IMotivoRetencaoService
    {
        private readonly IRepositoryAsync _repository;
        private readonly IMapper _mapper;

        public MotivoRetencaoService(IRepositoryAsync repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Response<IEnumerable<MotivoRetencaoDTO>>> GetMotivoRetencaoAsync(string keyword = "")
        {
            var spec = new MotivoRetencaoSearchList(keyword);
            var list = await _repository.GetListAsync<MotivoRetencao, MotivoRetencaoDTO, Guid>(spec);
            return ResponseFactory.Success(list);
        }

        public async Task<Response<IEnumerable<MotivoRetencaoLightDTO>>> GetMotivoRetencaoLightAsync(string keyword = "", string? tipoImposto = null)
        {
            var spec = new MotivoRetencaoSearchList(keyword, tipoImposto);
            var list = await _repository.GetListAsync<MotivoRetencao, MotivoRetencaoLightDTO, Guid>(spec);
            return ResponseFactory.Success(list);
        }

        public async Task<PaginatedResponse<MotivoRetencaoTableDTO>> GetMotivoRetencaoPaginatedAsync(MotivoRetencaoTableFilter filter)
        {
            if (filter.Filters != null && filter.Filters.Count > 0) filter.PageNumber = 1;
            var order = filter.Sorting != null ? GSHelpers.GenerateOrderByString(filter) : "";
            var spec = new MotivoRetencaoSearchTable(filter.Filters ?? [], order);
            return await _repository.GetPaginatedResultsAsync<MotivoRetencao, MotivoRetencaoTableDTO, Guid>(filter.PageNumber, filter.PageSize, spec);
        }

        public async Task<Response<IEnumerable<MotivoRetencaoTableDTO>>> GetAllMotivoRetencaoAsync(MotivoRetencaoAllFilter? filter)
        {
            try
            {
                filter ??= new MotivoRetencaoAllFilter();
                var order = filter.GetOrderByString();
                var spec = new MotivoRetencaoSearchTable(filter.Filters ?? [], order);
                var list = await _repository.GetListAsync<MotivoRetencao, MotivoRetencaoTableDTO, Guid>(spec);
                return ResponseFactory.Success(list);
            }
            catch (Exception ex) { return ResponseFactory.Fail<IEnumerable<MotivoRetencaoTableDTO>>(ex.Message); }
        }

        public async Task<Response<MotivoRetencaoDTO>> GetMotivoRetencaoAsync(Guid id)
        {
            try
            {
                var dto = await _repository.GetByIdAsync<MotivoRetencao, MotivoRetencaoDTO, Guid>(id);
                return ResponseFactory.Success(dto);
            }
            catch (Exception ex) { return ResponseFactory.Fail<MotivoRetencaoDTO>(ex.Message); }
        }

        public async Task<Response<Guid>> CreateMotivoRetencaoAsync(CreateMotivoRetencaoRequest request)
        {
            request.Descricao = request.Descricao.Trim();
            request.TipoImposto = request.TipoImposto.Trim().ToUpperInvariant();

            var entity = _mapper.Map<MotivoRetencao>(request);
            try
            {
                var created = await _repository.CreateAsync<MotivoRetencao, Guid>(entity);
                _ = await _repository.SaveChangesAsync();
                return ResponseFactory.Success(created.Id);
            }
            catch (Exception ex) { return ResponseFactory.Fail<Guid>(ex.Message); }
        }

        public async Task<Response<Guid>> UpdateMotivoRetencaoAsync(UpdateMotivoRetencaoRequest request, Guid id)
        {
            request.Descricao = request.Descricao.Trim();
            request.TipoImposto = request.TipoImposto.Trim().ToUpperInvariant();

            var existing = await _repository.GetByIdAsync<MotivoRetencao, Guid>(id);
            _mapper.Map(request, existing);
            try
            {
                _ = await _repository.UpdateAsync<MotivoRetencao, Guid>(existing);
                _ = await _repository.SaveChangesAsync();
                return ResponseFactory.Success(existing.Id);
            }
            catch (Exception ex) { return ResponseFactory.Fail<Guid>(ex.Message); }
        }

        public async Task<Response<Guid>> DeleteMotivoRetencaoAsync(Guid id)
        {
            try
            {
                var entity = await _repository.RemoveByIdAsync<MotivoRetencao, Guid>(id);
                await _repository.SaveChangesAsync();
                return ResponseFactory.Success(entity.Id);
            }
            catch (Exception ex) { return ResponseFactory.Fail<Guid>(ex.Message); }
        }

        public async Task<Response<IEnumerable<Guid>>> DeleteMultipleMotivoRetencaoAsync(IEnumerable<Guid> ids)
        {
            var ok = new List<Guid>();
            foreach (var id in ids.ToList())
            {
                try
                {
                    var e = await _repository.RemoveByIdAsync<MotivoRetencao, Guid>(id);
                    if (e != null) { _ = await _repository.SaveChangesAsync(); ok.Add(id); }
                }
                catch { _repository.ClearChangeTracker(); }
            }
            if (ok.Count == ids.Count()) return ResponseFactory.Success<IEnumerable<Guid>>(ok);
            if (ok.Count > 0) return ResponseFactory.PartialSuccess<IEnumerable<Guid>>(ok, $"Eliminados {ok.Count} de {ids.Count()}.");
            return ResponseFactory.Fail<IEnumerable<Guid>>("Nenhum eliminado.");
        }
    }
}
```

## B8. `Backend/CliCloud.WebApi/Controllers/TaxasIva/MotivoRetencaoController.cs`

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs;
using CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.Filters;

namespace CliCloud.WebApi.Controllers.TaxasIva
{
    [Route("client/taxas-iva/[controller]")]
    [ApiController]
    public class MotivoRetencaoController(IMotivoRetencaoService motivoRetencaoService) : ControllerBase
    {
        private readonly IMotivoRetencaoService _service = motivoRetencaoService;

        [Authorize(Roles = "client")]
        [HttpGet]
        public async Task<IActionResult> GetAsync(string keyword = "")
            => Ok(await _service.GetMotivoRetencaoAsync(keyword));

        [Authorize(Roles = "client")]
        [HttpGet("light")]
        public async Task<IActionResult> GetLightAsync(string keyword = "", string? tipoImposto = null)
            => Ok(await _service.GetMotivoRetencaoLightAsync(keyword, tipoImposto));

        [Authorize(Roles = "client")]
        [HttpPost("paginated")]
        public async Task<IActionResult> GetPaginatedAsync(MotivoRetencaoTableFilter filter)
            => Ok(await _service.GetMotivoRetencaoPaginatedAsync(filter));

        [Authorize(Roles = "client")]
        [HttpPost("all")]
        public async Task<IActionResult> GetAllAsync([FromBody] MotivoRetencaoAllFilter? filter = null)
            => Ok(await _service.GetAllMotivoRetencaoAsync(filter ?? new MotivoRetencaoAllFilter()));

        [Authorize(Roles = "client")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync(Guid id)
            => Ok(await _service.GetMotivoRetencaoAsync(id));

        [Authorize(Roles = "client")]
        [HttpPost]
        public async Task<IActionResult> CreateAsync(CreateMotivoRetencaoRequest request)
            => Ok(await _service.CreateMotivoRetencaoAsync(request));

        [Authorize(Roles = "client")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsync(UpdateMotivoRetencaoRequest request, Guid id)
            => Ok(await _service.UpdateMotivoRetencaoAsync(request, id));

        [Authorize(Roles = "client")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(Guid id)
            => Ok(await _service.DeleteMotivoRetencaoAsync(id));

        [Authorize(Roles = "client")]
        [HttpDelete("bulk")]
        public async Task<IActionResult> DeleteMultipleAsync([FromBody] DeleteMultipleMotivoRetencaoRequest request)
            => Ok(await _service.DeleteMultipleMotivoRetencaoAsync(request.Ids));
    }
}
```

## B9. ALTERAR `Backend/CliCloud.Infrastructure/Persistence/Contexts/ApplicationDbContext.cs`

Depois de `public DbSet<MotivoIsencao> MotivosIsencao { get; set; }`:

```csharp
public DbSet<MotivoRetencao> MotivosRetencao { get; set; }
```

## B10. ALTERAR `Backend/CliCloud.Infrastructure/Mapper/MappingProfiles.cs`

Using no topo:

```csharp
using MotivoRetencaoDtos = CliCloud.Application.Services.TaxasIva.MotivoRetencaoService.DTOs;
```

Depois do bloco `// ---- MotivoIsencao ----`:

```csharp
// ---- MotivoRetencao ----
_ = CreateMap<CliCloud.Domain.Entities.TaxasIva.MotivoRetencao, MotivoRetencaoDtos.MotivoRetencaoDTO>();
_ = CreateMap<CliCloud.Domain.Entities.TaxasIva.MotivoRetencao, MotivoRetencaoDtos.MotivoRetencaoLightDTO>();
_ = CreateMap<CliCloud.Domain.Entities.TaxasIva.MotivoRetencao, MotivoRetencaoDtos.MotivoRetencaoTableDTO>();
_ = CreateMap<MotivoRetencaoDtos.CreateMotivoRetencaoRequest, CliCloud.Domain.Entities.TaxasIva.MotivoRetencao>();
_ = CreateMap<MotivoRetencaoDtos.UpdateMotivoRetencaoRequest, CliCloud.Domain.Entities.TaxasIva.MotivoRetencao>();
```

---

# GRUPO C — Migração BD

Comando:

```bash
cd Backend
dotnet ef migrations add F15_MotivoRetencao --project CliCloud.Infrastructure --startup-project CliCloud.WebApi
```

No método `Up` da migração gerada, após `CreateTable`, adicionar seed:

```csharp
migrationBuilder.Sql("""
    DECLARE @CreatedBy uniqueidentifier = '00000000-0000-0000-0000-000000000001';
    DECLARE @Now datetime2 = SYSUTCDATETIME();

    INSERT INTO [Utility].[MotivoRetencao] (Id, Codigo, Descricao, TipoImposto, CreatedBy, CreatedOn)
    SELECT v.Id, v.Codigo, v.Descricao, v.TipoImposto, @CreatedBy, @Now
    FROM (VALUES
        ('A1510000-0000-4000-8000-000000000001', 1, N'Artigo 98º, Alínea 1', N'IRS'),
        ('A1510000-0000-4000-8000-000000000002', 2, N'Artigo 98º, Alínea 2', N'IRS'),
        ('A1510000-0000-4000-8000-000000000003', 3, N'Artigo 98º, Alínea 3', N'IRS'),
        ('A1510000-0000-4000-8000-000000000004', 4, N'Artigo 98º, Alínea 4', N'IRS'),
        ('A1510000-0000-4000-8000-000000000005', 5, N'Artigo 98º, Alínea 6', N'IRS'),
        ('A1510000-0000-4000-8000-000000000006', 6, N'Artigo 98º, Alínea 7', N'IRS'),
        ('A1510000-0000-4000-8000-000000000007', 7, N'Artigo 96º, Alínea 3', N'IRC'),
        ('A1510000-0000-4000-8000-000000000008', 8, N'Artigo 96º, Alínea 4', N'IRC'),
        ('A1510000-0000-4000-8000-000000000009', 9, N'Artigo 96º, Alínea 5', N'IRC'),
        ('A1510000-0000-4000-8000-00000000000A', 10, N'Artigo 96º, Alínea 6', N'IRC')
    ) v(Id, Codigo, Descricao, TipoImposto)
    WHERE NOT EXISTS (
        SELECT 1 FROM [Utility].[MotivoRetencao] m
        WHERE m.Codigo = v.Codigo AND m.DeletedOn IS NULL
    );
""");
```

Aplicar:

```bash
dotnet ef database update --project CliCloud.Infrastructure --startup-project CliCloud.WebApi
```

---

# GRUPO D — CRIAR (Frontend MotivoRetencao)

## Estrutura de pastas

```
Frontend/src/
├── types/dtos/taxas-iva/motivo-retencao.dtos.ts
├── lib/services/taxas-iva/motivo-retencao-service/
│   ├── motivo-retencao-client.ts
│   └── index.ts
└── pages/area-comum/tabelas/tabelas/motivo-retencao/
    ├── pages/listagem-motivos-retencao-page.tsx
    ├── modals/motivo-retencao-view-create-modal.tsx
    ├── components/
    │   ├── listagem-motivos-retencao-table.tsx
    │   ├── listagem-motivos-retencao-table.columns.tsx
    │   └── listagem-motivos-retencao-filter-controls.tsx
    └── queries/listagem-motivos-retencao-queries.ts
```

## D1. `Frontend/src/types/dtos/taxas-iva/motivo-retencao.dtos.ts`

```typescript
export interface MotivoRetencaoLightDTO {
  id: string
  codigo: number
  descricao: string
  tipoImposto: string
}

export interface MotivoRetencaoTableDTO extends MotivoRetencaoLightDTO {
  createdOn: string
}

export interface MotivoRetencaoDTO extends MotivoRetencaoLightDTO {
  createdOn: string
  lastModifiedOn?: string | null
}

export type MotivoRetencaoSaveBody = {
  codigo: number
  descricao: string
  tipoImposto: 'IRS' | 'IRC' | 'IS'
}
```

## D2. `Frontend/src/lib/services/taxas-iva/motivo-retencao-service/motivo-retencao-client.ts`

```typescript
import state from '@/states/state'
import type {
  GSResponse,
  PaginatedRequest,
  PaginatedResponse,
} from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type {
  MotivoRetencaoDTO,
  MotivoRetencaoLightDTO,
  MotivoRetencaoSaveBody,
  MotivoRetencaoTableDTO,
} from '@/types/dtos/taxas-iva/motivo-retencao.dtos'

const BASE = '/client/taxas-iva/MotivoRetencao'

export class MotivoRetencaoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  async getMotivosRetencaoPaginated(
    params: PaginatedRequest,
  ): Promise<ResponseApi<PaginatedResponse<MotivoRetencaoTableDTO>>> {
    return this.httpClient.postRequest<
      PaginatedRequest,
      PaginatedResponse<MotivoRetencaoTableDTO>
    >(state.URL, `${BASE}/paginated`, params)
  }

  async getMotivosRetencaoLight(
    keyword = '',
    tipoImposto?: string,
  ): Promise<ResponseApi<GSResponse<MotivoRetencaoLightDTO[]>>> {
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (tipoImposto) params.set('tipoImposto', tipoImposto)
    const qs = params.toString()
    return this.httpClient.getRequest<GSResponse<MotivoRetencaoLightDTO[]>>(
      state.URL,
      `${BASE}/light${qs ? `?${qs}` : ''}`,
    )
  }

  async createMotivoRetencao(
    body: MotivoRetencaoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest<MotivoRetencaoSaveBody, GSResponse<string>>(
      state.URL,
      BASE,
      body,
    )
  }

  async updateMotivoRetencao(
    id: string,
    body: MotivoRetencaoSaveBody,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.putRequest<MotivoRetencaoSaveBody, GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
      body,
    )
  }

  async getMotivoRetencaoById(
    id: string,
  ): Promise<ResponseApi<GSResponse<MotivoRetencaoDTO>>> {
    return this.httpClient.getRequest<GSResponse<MotivoRetencaoDTO>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }

  async deleteMotivoRetencao(
    id: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.deleteRequest<GSResponse<string>>(
      state.URL,
      `${BASE}/${id}`,
    )
  }
}
```

## D3. `Frontend/src/lib/services/taxas-iva/motivo-retencao-service/index.ts`

```typescript
import { MotivoRetencaoClient } from './motivo-retencao-client'

export const MotivoRetencaoService = (idFuncionalidade = '') =>
  new MotivoRetencaoClient(idFuncionalidade)
```

## D4. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-retencao/components/listagem-motivos-retencao-table.columns.tsx`

```typescript
import type { MotivoRetencaoTableDTO } from '@/types/dtos/taxas-iva/motivo-retencao.dtos'
import { DataTableColumnDef } from '@/components/shared/data-table-types'
import { createAreaComumListActionsColumnDef } from '@/components/shared/area-comum-list-actions-column'
import type { AreaComumListRowActionPermissions } from '@/hooks/use-area-comum-entity-list-permissions'

export const columns: DataTableColumnDef<MotivoRetencaoTableDTO>[] = [
  {
    accessorKey: 'codigo',
    header: 'Código',
    sortKey: 'codigo',
    enableSorting: true,
    meta: { align: 'center' as const, width: 'w-[80px]' },
  },
  {
    accessorKey: 'descricao',
    header: 'Descrição',
    sortKey: 'descricao',
    enableSorting: true,
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'tipoImposto',
    header: 'Imposto',
    sortKey: 'tipoImposto',
    enableSorting: true,
    meta: { align: 'center' as const, width: 'w-[100px]' },
  },
]

export function getColumnsWithViewCallback(
  onOpenView: (data: MotivoRetencaoTableDTO) => void,
  onOpenEdit?: (data: MotivoRetencaoTableDTO) => void,
  onOpenDelete?: (data: MotivoRetencaoTableDTO) => void,
  rowActionPermissions?: AreaComumListRowActionPermissions,
): DataTableColumnDef<MotivoRetencaoTableDTO>[] {
  return [
    ...columns,
    createAreaComumListActionsColumnDef<MotivoRetencaoTableDTO>({
      onOpenView,
      onOpenEdit,
      onOpenDelete,
      rowActionPermissions,
    }),
  ]
}
```

## D5. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-retencao/components/listagem-motivos-retencao-filter-controls.tsx`

```typescript
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ListagemMotivosRetencaoFilterControls({ table }: { table: any }) {
  const codigo = (table.getColumn('codigo')?.getFilterValue() as string) ?? ''
  const descricao = (table.getColumn('descricao')?.getFilterValue() as string) ?? ''
  const tipoImposto = (table.getColumn('tipoImposto')?.getFilterValue() as string) ?? ''

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <div className='space-y-2'>
        <Label>Código</Label>
        <Input
          value={codigo}
          onChange={(e) => table.getColumn('codigo')?.setFilterValue(e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label>Descrição</Label>
        <Input
          value={descricao}
          onChange={(e) => table.getColumn('descricao')?.setFilterValue(e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label>Imposto</Label>
        <Select
          value={tipoImposto || 'ALL'}
          onValueChange={(v) =>
            table.getColumn('tipoImposto')?.setFilterValue(v === 'ALL' ? '' : v)
          }
        >
          <SelectTrigger><SelectValue placeholder='Todos' /></SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>Todos</SelectItem>
            <SelectItem value='IRS'>IRS</SelectItem>
            <SelectItem value='IRC'>IRC</SelectItem>
            <SelectItem value='IS'>IS</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
```

## D6. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-retencao/queries/listagem-motivos-retencao-queries.ts`

Ver código em **D7** do índice original — copiar `listagem-motivos-isencao-queries.ts` e substituir `MotivoIsencao`→`MotivoRetencao`, queryKey `motivos-retencao-paginated`.

## D7. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-retencao/components/listagem-motivos-retencao-table.tsx`

Copiar `listagem-motivos-isencao-table.tsx` — substituir `Isencao`→`Retencao`.

## D8. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-retencao/pages/listagem-motivos-retencao-page.tsx`

Copiar `listagem-motivos-isencao-page.tsx` — título **Motivo Retenção na Fonte**, substituir `Isencao`→`Retencao`, `isencao`→`retencao`.

## D9. `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-retencao/modals/motivo-retencao-view-create-modal.tsx`

Modal completo — ver repositório após implementação ou copiar do plano na conversa (campos: `codigo` int, `tipoImposto` Select, `descricao` textarea 150).

## D10. ALTERAR `Frontend/src/routes/area-comum/areaComum.tsx`

**Lazy import:**

```tsx
const ListagemMotivosRetencaoPage = lazy(() =>
  import(
    '@/pages/area-comum/tabelas/tabelas/motivo-retencao/pages/listagem-motivos-retencao-page'
  ).then((m) => ({ default: m.ListagemMotivosRetencaoPage }))
)
```

**Rota** (depois de `motivos-isencao`):

```tsx
{
  path: 'area-comum/tabelas/tabelas/motivos-retencao',
  element: (
    <LicenseGuard
      requiredModule={areaComum.id}
      requiredPermission={areaComum?.permissions?.taxasIva?.id}
      actionType={actionTypes.AuthVer}
    >
      <ListagemMotivosRetencaoPage />
    </LicenseGuard>
  ),
  manageWindow: true,
  windowName: 'Motivos de Retenção',
},
```

---

# GRUPO E — ALTERAR (Faturação)

## E1. `Frontend/src/pages/area-financeira/faturacao/types/documento-editor.types.ts`

Adicionar a `DocumentoEditorState`:

```typescript
retencaoCodigoMotivo: number | null
```

## E2. `Frontend/src/pages/area-financeira/faturacao/hooks/use-documento-editor.ts`

Em `estadoInicial`:

```typescript
retencaoCodigoMotivo: null,
```

Em `toEmitirRequest`:

```typescript
retencaoCodigoMotivo: state.retencaoAtiva ? state.retencaoCodigoMotivo : null,
```

Linhas:

```typescript
motivoIsencaoId:
  l.taxaIvaPercentagem === 0 || state.isentoIva
    ? (l.motivoIsencaoId ?? state.motivoIsencaoId)
    : null,
```

## E3. `Frontend/src/pages/area-financeira/faturacao/utils/map-documento-to-editor-state.ts`

```typescript
retencaoCodigoMotivo: doc.retencaoCodigoMotivo ?? null,
```

## E4. `Frontend/src/pages/area-financeira/faturacao/queries/documento-editor-queries.ts`

```typescript
import { MotivoRetencaoService } from '@/lib/services/taxas-iva/motivo-retencao-service'
import type { MotivoRetencaoLightDTO } from '@/types/dtos/taxas-iva/motivo-retencao.dtos'

export function useMotivosRetencaoDocumento(tipoImposto: string, keyword = '') {
  return useQuery({
    queryKey: ['documento-editor', 'motivos-retencao', tipoImposto, keyword],
    enabled: !!tipoImposto,
    queryFn: async () => {
      const res = await MotivoRetencaoService(ID).getMotivosRetencaoLight(keyword, tipoImposto)
      if (res.info?.status !== ResponseStatus.Success) return []
      return (res.info.data ?? []) as MotivoRetencaoLightDTO[]
    },
    staleTime: 120_000,
  })
}
```

## E5. `Frontend/src/pages/area-financeira/faturacao/components/documento-tab-retencao-section.tsx`

Substituir ficheiro completo: usar `AsyncCombobox` + `useMotivosRetencaoDocumento(imposto)`; ao mudar IRS/IRC/IS limpar `retencaoCodigoMotivo` e `retencaoMotivo`; ao seleccionar motivo gravar `retencaoCodigoMotivo` (int) e `retencaoMotivo` (string). Código completo disponível no histórico da conversa (secção E5).

## E6. `Backend/CliCloud.Application/Services/Documentos/DocumentoEmissaoService/Validators/DocumentoEmissaoPerfilValidator.cs`

Após validação `IsentoIva`:

```csharp
foreach (var linha in request.Linhas)
{
    if (linha.TaxaIvaPercentagem == 0m
        && !linha.MotivoIsencaoId.HasValue
        && !request.MotivoIsencaoId.HasValue)
    {
        return $"Linha {linha.NumeroLinha}: indique o motivo de isenção (taxa 0%).";
    }
}

if (request.RetencaoAtiva && !request.RetencaoCodigoMotivo.HasValue
    && string.IsNullOrWhiteSpace(request.RetencaoMotivo))
{
    return "Indique o motivo da retenção na fonte.";
}
```

## E7. (Opcional) `Frontend/src/pages/area-financeira/faturacao/components/documento-linha-modal.tsx`

Quando `taxaIvaPercentagem === 0`, mostrar combobox de motivos de isenção (`useMotivosIsencaoDocumento`) e gravar `motivoIsencaoId` na linha.

---

## 3. Checklist de validação

- [ ] Submenu Imposto com 3 itens: Isenção, Taxas IVA, Retenção
- [ ] Motivos de isenção: 28 registos, labels corretos
- [ ] Motivos de retenção: seed IRS/IRC, filtro por tipo na listagem e na faturação
- [ ] Fatura: `RetencaoCodigoMotivo` + `RetencaoMotivo` gravados
- [ ] Linha taxa 0%: exige `MotivoIsencaoId`

---

## 4. Referências legado

| Ficheiro legado | Função |
|-----------------|--------|
| `Dados/CliCloud.Dados.Faturacao/MotivoIsencao.cs` | Isenção IVA |
| `Dados/CliCloud.Dados.Faturacao/MotivoRetencao.cs` | Retenção na fonte |
| `CliCloud.ASPcli/Services/WSMenus.asmx.cs` | Menu Imposto (3 itens) |
| `CliCloud.ASPcli/Client/Faturacao/TfaturaEdt.js` | Autocomplete retenção filtrado por IRS/IRC |

---

## 5. Documentos relacionados

- [`auditoria-menu-faturacao-legado-vs-novo.md`](./auditoria-menu-faturacao-legado-vs-novo.md)

---

# ANEXO — Código completo (secções referenciadas)

## ANEXO-D6. `listagem-motivos-retencao-queries.ts`

```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PaginatedRequest } from '@/types/api/responses'
import { MotivoRetencaoService } from '@/lib/services/taxas-iva/motivo-retencao-service'

type Sorting = Array<{ id: string; desc: boolean }> | null
type Filters = Array<{ id: string; value: string }> | null

export function useGetMotivosRetencaoPaginated(
  pageNumber: number,
  pageSize: number,
  filters: Filters,
  sorting: Sorting,
) {
  const params: PaginatedRequest = {
    pageNumber,
    pageSize,
    filters: (filters as unknown as Record<string, string>) ?? undefined,
    sorting: sorting ?? undefined,
  }
  return useQuery({
    queryKey: ['motivos-retencao-paginated', params],
    queryFn: () => MotivoRetencaoService().getMotivosRetencaoPaginated(params),
    placeholderData: (p) => p,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function usePrefetchAdjacentMotivosRetencao(page: number, pageSize: number, filters: Filters) {
  const queryClient = useQueryClient()
  const base = { pageSize, filters: (filters as unknown as Record<string, string>) ?? undefined }
  return {
    prefetchPreviousPage: async () => {
      if (page <= 1) return
      const params = { ...base, pageNumber: page - 1 }
      await queryClient.prefetchQuery({
        queryKey: ['motivos-retencao-paginated', params],
        queryFn: () => MotivoRetencaoService().getMotivosRetencaoPaginated(params),
      })
    },
    prefetchNextPage: async () => {
      const params = { ...base, pageNumber: page + 1 }
      await queryClient.prefetchQuery({
        queryKey: ['motivos-retencao-paginated', params],
        queryFn: () => MotivoRetencaoService().getMotivosRetencaoPaginated(params),
      })
    },
  }
}
```

## ANEXO-D9. `motivo-retencao-view-create-modal.tsx`

Ver secção D9 na conversa de implementação — ficheiro completo com `MotivoRetencaoViewCreateModal`, campos Código/Imposto/Descrição.

## ANEXO-E5. `documento-tab-retencao-section.tsx` (ficheiro completo)

```tsx
import { useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AsyncCombobox } from '@/components/shared/async-combobox'
import { fieldGap, formBlockGap, inputClass, labelClass } from '@/lib/form-styles'
import type { DocumentoEditorState, DocumentoEditorTotais } from '../types/documento-editor.types'
import { useMotivosRetencaoDocumento } from '../queries/documento-editor-queries'

export function DocumentoTabRetencaoSection({
  state, totais, onChange, impostos,
}: {
  state: DocumentoEditorState
  totais: DocumentoEditorTotais
  onChange: (p: Partial<DocumentoEditorState>) => void
  impostos: Array<{ value: 'IRS' | 'IRC' | 'IS'; label: string }>
}) {
  const baseRetencao = totais.total + totais.acerto
  const imposto = state.retencaoImposto || impostos[0]?.value || ''
  const motivosQ = useMotivosRetencaoDocumento(imposto)
  const motivoItems = useMemo(
    () => (motivosQ.data ?? []).map((m) => ({ id: String(m.codigo), label: m.descricao })),
    [motivosQ.data],
  )
  const aplicarTaxa = (taxa: number) => {
    if (taxa <= 0) { onChange({ retencaoTaxa: 0, retencaoValor: 0 }); return }
    onChange({ retencaoTaxa: taxa, retencaoValor: Math.round(baseRetencao * (taxa / 100) * 100) / 100 })
  }
  return (
    <div className={`max-w-2xl space-y-4 ${formBlockGap}`}>
      <div className='flex items-center gap-3'>
        <Switch id='retencao-ativa' checked={state.retencaoAtiva}
          onCheckedChange={(v) => onChange({
            retencaoAtiva: v,
            ...(v ? {} : { retencaoImposto: '', retencaoTaxa: 0, retencaoValor: 0, retencaoMotivo: '', retencaoCodigoMotivo: null }),
          })} />
        <Label htmlFor='retencao-ativa' className={labelClass}>Ativar retenção na fonte</Label>
      </div>
      {state.retencaoAtiva ? (
        <>
          <div className={fieldGap}>
            <Label className={labelClass}>Imposto</Label>
            <RadioGroup value={imposto} onValueChange={(v) => onChange({
              retencaoImposto: v as DocumentoEditorState['retencaoImposto'],
              retencaoCodigoMotivo: null, retencaoMotivo: '',
            })} className='flex flex-wrap gap-4'>
              {impostos.map((i) => (
                <div key={i.value} className='flex items-center gap-2'>
                  <RadioGroupItem value={i.value} id={`imp-${i.value}`} />
                  <Label htmlFor={`imp-${i.value}`}>{i.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className={fieldGap}>
            <Label className={labelClass}>Motivo</Label>
            <AsyncCombobox
              value={state.retencaoCodigoMotivo != null ? String(state.retencaoCodigoMotivo) : ''}
              onChange={(id) => {
                const item = motivoItems.find((m) => m.id === id)
                onChange({ retencaoCodigoMotivo: id ? Number(id) : null, retencaoMotivo: item?.label ?? '' })
              }}
              items={motivoItems} isLoading={motivosQ.isFetching} placeholder='Seleccionar motivo…' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className={fieldGap}>
              <Label className={labelClass}>Taxa (%)</Label>
              <Input type='number' min={0} step={0.01} className={inputClass} value={state.retencaoTaxa || ''}
                onChange={(e) => aplicarTaxa(Number(e.target.value) || 0)} />
            </div>
            <div className={fieldGap}>
              <Label className={labelClass}>Valor</Label>
              <Input type='number' min={0} step={0.01} className={inputClass} value={state.retencaoValor || ''}
                onChange={(e) => onChange({ retencaoValor: Number(e.target.value) || 0, retencaoTaxa: 0 })} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
```

---

## Histórico

| Data | Nota |
|------|------|
| 2026-06-12 | Documento criado — plano completo isenção + retenção |
