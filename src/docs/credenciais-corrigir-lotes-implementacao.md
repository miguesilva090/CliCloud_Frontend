# Guia completo — replicar Corrigir Lotes (Consultas) no projeto novo

Documento passo a passo para replicar, na BD e na aplicação novas, o comportamento do legado **Consultas** (`CliCloud.ASPcli` + `SP_CorrigirLancamentoCredenciaisConsultas`), **sem** usar a BD legada nem executar a SP antiga.

**Referência de regras:** `Dados/CliCloud.ASPcli.BDUpdate/Resources/script00895.sql`

**Âmbito:** Consultas. Tratamentos ficam fora.

---

## 1. Resumo da arquitectura recomendada

| Legado | Novo |
|--------|------|
| `LOTDIRECT` | `Credenciais.LoteDirect` |
| `LINDIRECT` | `Credenciais.LoteDirectLinha` |
| `LINDIRECT_789` | `Credenciais.LoteDirectLinha789` |
| `LOTESP` | `Credenciais.LoteDirectAgregado` |
| `LOTES` | `Credenciais.LoteDirectDetalhe` |
| `TIPOLOTES` | `Credenciais.TipoLotes` |
| `ACOR_INS` + `@Filtro` | `Servicos.SubsistemaServico` + `Organismos.Organismo` (`CodigoULSNova` ↔ `CodigoOrganismo`) |

**Fluxo:** o React mantém o modal e o `POST corrigir-lotes`; o backend valida mês/ano e executa um executor transaccional que aplica as mesmas fases da SP sobre estas tabelas.

**Pré-requisito:** ao gravar o lançamento, persistir linhas no cabeçalho. Sem linhas, a correção não tem efeito útil.

---

## 2. Índice de ficheiros

### Criar

| Ficheiro |
|----------|
| `Backend/CliCloud.Domain/Entities/Credenciais/LoteDirectLinha.cs` |
| `Backend/CliCloud.Domain/Entities/Credenciais/LoteDirectLinha789.cs` |
| `Backend/CliCloud.Domain/Entities/Credenciais/LoteDirectAgregado.cs` |
| `Backend/CliCloud.Domain/Entities/Credenciais/LoteDirectDetalhe.cs` |
| `Backend/CliCloud.Infrastructure/Persistence/Configurations/LoteDirectLinhaConfiguration.cs` |
| `Backend/CliCloud.Infrastructure/Persistence/Configurations/LoteDirectLinha789Configuration.cs` |
| `Backend/CliCloud.Infrastructure/Persistence/Configurations/LoteDirectAgregadoConfiguration.cs` |
| `Backend/CliCloud.Infrastructure/Persistence/Configurations/LoteDirectDetalheConfiguration.cs` |
| `Backend/CliCloud.Application/Services/Credenciais/LoteDirectService/ILoteDirectCorrecaoLotesExecutor.cs` |
| `Backend/CliCloud.Infrastructure/Persistence/Credenciais/LoteDirectCorrecaoLotesExecutor.cs` |
| Migration EF `Add_Credenciais_LoteDirect_CorrigirLotes_Children` |

### Editar

| Ficheiro |
|----------|
| `Backend/CliCloud.Domain/Entities/Credenciais/LoteDirect.cs` |
| `Backend/CliCloud.Infrastructure/Persistence/Contexts/ApplicationDbContext.cs` |
| `Backend/CliCloud.Application/Services/Credenciais/LoteDirectService/LoteDirectService.cs` |
| `Backend/CliCloud.WebApi/Extensions/ServiceCollectionExtensions.cs` |
| `Backend/CliCloud.Application/Services/Credenciais/LoteDirectService/DTOs/CreateLoteDirectRequest.cs` |
| `Backend/CliCloud.Application/Services/Credenciais/LoteDirectService/DTOs/UpdateLoteDirectRequest.cs` |
| `Backend/CliCloud.Application/Services/Credenciais/LoteDirectService/DTOs/LoteDirectDTO.cs` |
| `Frontend/src/types/dtos/credenciais/lote-direct.dtos.ts` |
| `Frontend/src/pages/area-administrativa/credenciais/modals/lote-direct-form-modal.tsx` |

### Sem alteração obrigatória

| Ficheiro |
|----------|
| `Backend/CliCloud.Application/Services/Credenciais/LoteDirectService/DTOs/CorrigirLotesRequest.cs` |
| `Backend/CliCloud.WebApi/Controllers/Credenciais/LoteDirectController.cs` |
| `Frontend/src/pages/area-administrativa/credenciais/modals/corrigir-lotes-modal.tsx` |
| `Frontend/src/lib/services/credenciais/lote-direct-service/lote-direct-client.ts` |

---

## 3. Domain — entidades

### 3.1 `LoteDirectLinha.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;
using CliCloud.Domain.Entities.Servicos;

namespace CliCloud.Domain.Entities.Credenciais;

[Table("LoteDirectLinha", Schema = "Credenciais")]
public class LoteDirectLinha : AuditableEntityWithSoftDelete
{
    public Guid LoteDirectId { get; set; }
    public LoteDirect LoteDirect { get; set; } = null!;

    public Guid ServicoId { get; set; }
    public Servico Servico { get; set; } = null!;

    public int Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }
    public decimal ValorUtenteOriginal { get; set; }
    public decimal ValorInstituicaoOriginal { get; set; }
    public decimal ValorUtente { get; set; }
    public decimal ValorInstituicao { get; set; }
}
```

### 3.2 `LoteDirectLinha789.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;
using CliCloud.Domain.Entities.Servicos;

namespace CliCloud.Domain.Entities.Credenciais;

[Table("LoteDirectLinha789", Schema = "Credenciais")]
public class LoteDirectLinha789 : AuditableEntityWithSoftDelete
{
    public Guid LoteDirectId { get; set; }
    public LoteDirect LoteDirect { get; set; } = null!;

    public Guid ServicoId { get; set; }
    public Servico Servico { get; set; } = null!;

    public int Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }
    public decimal ValorUtenteOriginal { get; set; }
    public decimal ValorInstituicaoOriginal { get; set; }
    public decimal ValorUtente { get; set; }
    public decimal ValorInstituicao { get; set; }
}
```

### 3.3 `LoteDirectAgregado.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;

namespace CliCloud.Domain.Entities.Credenciais;

[Table("LoteDirectAgregado", Schema = "Credenciais")]
public class LoteDirectAgregado : AuditableEntityWithSoftDelete
{
  public int Indice { get; set; }

  public int NumeroLote { get; set; }
  public int Ano { get; set; }
  public int Mes { get; set; }
  public int CodigoOrganismo { get; set; }
  public int TipoLote { get; set; }
  public int TipoServico { get; set; }

  public DateTime DataLote { get; set; }
  public int Quantidade { get; set; }
  public decimal Valor { get; set; }
  public decimal ValorTaxa { get; set; }
  public int? Isencao { get; set; }
  public int NumeroRequisicoes { get; set; }
}
```

`Indice` substitui o `LOTESP.indice` legado. `LoteDirect.IndiceLote` guarda este valor após a correção.

### 3.4 `LoteDirectDetalhe.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;

namespace CliCloud.Domain.Entities.Credenciais;

[Table("LoteDirectDetalhe", Schema = "Credenciais")]
public class LoteDirectDetalhe : AuditableEntityWithSoftDelete
{
  public Guid LoteDirectAgregadoId { get; set; }
  public LoteDirectAgregado LoteDirectAgregado { get; set; } = null!;

  public Guid LoteDirectId { get; set; }
  public LoteDirect LoteDirect { get; set; } = null!;

  public int Indice { get; set; }
  public int NumeroLote { get; set; }
  public int Ano { get; set; }
  public int Mes { get; set; }
  public int CodigoOrganismo { get; set; }
  public int TipoServico { get; set; }
  public int TipoLote { get; set; }

  public string? Credencial { get; set; }
  public int Quantidade { get; set; }
  public decimal Valor { get; set; }
  public decimal ValorTaxa { get; set; }
  public int? Isencao { get; set; }
  public DateTime? Data { get; set; }
}
```

### 3.5 `LoteDirect.cs` — acrescentar navegações

```csharp
public ICollection<LoteDirectLinha> Linhas { get; set; } = new List<LoteDirectLinha>();
public ICollection<LoteDirectLinha789> Linhas789 { get; set; } = new List<LoteDirectLinha789>();
```

---

## 4. Infrastructure — configurações EF

### 4.1 `LoteDirectLinhaConfiguration.cs`

```csharp
using CliCloud.Domain.Entities.Credenciais;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CliCloud.Infrastructure.Persistence.Configurations;

public class LoteDirectLinhaConfiguration : IEntityTypeConfiguration<LoteDirectLinha>
{
  public void Configure(EntityTypeBuilder<LoteDirectLinha> builder)
  {
    builder.ToTable("LoteDirectLinha", "Credenciais");

    builder.HasIndex(x => x.LoteDirectId);
    builder.HasIndex(x => x.ServicoId);

    builder.HasOne(x => x.LoteDirect)
      .WithMany(x => x.Linhas)
      .HasForeignKey(x => x.LoteDirectId)
      .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(x => x.Servico)
      .WithMany()
      .HasForeignKey(x => x.ServicoId)
      .OnDelete(DeleteBehavior.Restrict);
  }
}
```

### 4.2 `LoteDirectLinha789Configuration.cs`

```csharp
using CliCloud.Domain.Entities.Credenciais;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CliCloud.Infrastructure.Persistence.Configurations;

public class LoteDirectLinha789Configuration : IEntityTypeConfiguration<LoteDirectLinha789>
{
  public void Configure(EntityTypeBuilder<LoteDirectLinha789> builder)
  {
    builder.ToTable("LoteDirectLinha789", "Credenciais");

    builder.HasIndex(x => x.LoteDirectId);
    builder.HasIndex(x => x.ServicoId);

    builder.HasOne(x => x.LoteDirect)
      .WithMany(x => x.Linhas789)
      .HasForeignKey(x => x.LoteDirectId)
      .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(x => x.Servico)
      .WithMany()
      .HasForeignKey(x => x.ServicoId)
      .OnDelete(DeleteBehavior.Restrict);
  }
}
```

### 4.3 `LoteDirectAgregadoConfiguration.cs`

```csharp
using CliCloud.Domain.Entities.Credenciais;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CliCloud.Infrastructure.Persistence.Configurations;

public class LoteDirectAgregadoConfiguration : IEntityTypeConfiguration<LoteDirectAgregado>
{
  public void Configure(EntityTypeBuilder<LoteDirectAgregado> builder)
  {
    builder.ToTable("LoteDirectAgregado", "Credenciais");

    builder.Property(x => x.Indice)
      .ValueGeneratedOnAdd();

    builder.HasIndex(x => new { x.Ano, x.Mes });
    builder.HasIndex(x => new
    {
      x.Ano,
      x.Mes,
      x.CodigoOrganismo,
      x.TipoLote,
      x.TipoServico,
      x.NumeroLote
    }).IsUnique();
  }
}
```

### 4.4 `LoteDirectDetalheConfiguration.cs`

```csharp
using CliCloud.Domain.Entities.Credenciais;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CliCloud.Infrastructure.Persistence.Configurations;

public class LoteDirectDetalheConfiguration : IEntityTypeConfiguration<LoteDirectDetalhe>
{
  public void Configure(EntityTypeBuilder<LoteDirectDetalhe> builder)
  {
    builder.ToTable("LoteDirectDetalhe", "Credenciais");

    builder.HasIndex(x => new { x.Ano, x.Mes });
    builder.HasIndex(x => x.LoteDirectId);

    builder.HasOne(x => x.LoteDirectAgregado)
      .WithMany()
      .HasForeignKey(x => x.LoteDirectAgregadoId)
      .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(x => x.LoteDirect)
      .WithMany()
      .HasForeignKey(x => x.LoteDirectId)
      .OnDelete(DeleteBehavior.Restrict);
  }
}
```

### 4.5 `ApplicationDbContext.cs` — acrescentar

```csharp
public DbSet<LoteDirectLinha> LotesDirectLinha { get; set; }
public DbSet<LoteDirectLinha789> LotesDirectLinha789 { get; set; }
public DbSet<LoteDirectAgregado> LotesDirectAgregado { get; set; }
public DbSet<LoteDirectDetalhe> LotesDirectDetalhe { get; set; }
```

Em `OnModelCreating`:

```csharp
_ = modelBuilder.ApplyConfiguration(new LoteDirectLinhaConfiguration());
_ = modelBuilder.ApplyConfiguration(new LoteDirectLinha789Configuration());
_ = modelBuilder.ApplyConfiguration(new LoteDirectAgregadoConfiguration());
_ = modelBuilder.ApplyConfiguration(new LoteDirectDetalheConfiguration());
```

### 4.6 Migration

```bash
dotnet ef migrations add Add_Credenciais_LoteDirect_CorrigirLotes_Children --project Backend/CliCloud.Infrastructure --startup-project Backend/CliCloud.WebApi
dotnet ef database update --project Backend/CliCloud.Infrastructure --startup-project Backend/CliCloud.WebApi
```

### 4.7 Seed mínimo de `TipoLotes`

Garantir o registo com `Valor = 97` (exames sem papel). Exemplo SQL:

```sql
IF NOT EXISTS (SELECT 1 FROM Credenciais.TipoLotes WHERE Valor = 97)
BEGIN
  INSERT INTO Credenciais.TipoLotes (Id, Valor, Designa)
  VALUES (7, 97, N'EXAMES SEM PAPEL');
END
```

Ajusta `Id` ao catálogo real da clínica.

---

## 5. Application — contrato e serviço

### 5.1 `ILoteDirectCorrecaoLotesExecutor.cs`

```csharp
namespace CliCloud.Application.Services.Credenciais.LoteDirectService;

public interface ILoteDirectCorrecaoLotesExecutor
{
  Task ExecutarAsync(int ano, int mes, CancellationToken cancellationToken = default);
}
```

### 5.2 `LoteDirectService.cs` — substituir a classe

```csharp
using AutoMapper;
using CliCloud.Application.Common;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.Credenciais.LoteDirectService.DTOs;
using CliCloud.Application.Services.Credenciais.LoteDirectService.Filters;
using CliCloud.Application.Services.Credenciais.LoteDirectService.Specifications;
using CliCloud.Application.Utility;
using CliCloud.Domain.Entities.Credenciais;

namespace CliCloud.Application.Services.Credenciais.LoteDirectService;

public class LoteDirectService(
    IRepositoryAsync repository,
    IMapper mapper,
    ILoteDirectCorrecaoLotesExecutor correcaoLotesExecutor) : ILoteDirectService
{
  private readonly IRepositoryAsync _repository = repository;
  private readonly IMapper _mapper = mapper;
  private readonly ILoteDirectCorrecaoLotesExecutor _correcaoLotesExecutor = correcaoLotesExecutor;

  public Task<PaginatedResponse<LoteDirectTableDTO>> GetPaginatedAsync(LoteDirectTableFilter filter)
  {
    if (filter.Filters?.Count > 0) filter.PageNumber = 1;
    var order = filter.Sorting != null ? GSHelpers.GenerateOrderByString(filter) : "";
    var spec = new LoteDirectSearchTable(filter.Filters ?? [], order);
    return _repository.GetPaginatedResultsAsync<LoteDirect, LoteDirectTableDTO, Guid>(
      filter.PageNumber,
      filter.PageSize,
      spec);
  }

  public async Task<Response<LoteDirectDTO>> GetByIdAsync(Guid id)
  {
    var spec = new LoteDirectGetById();
    var dto = await _repository.GetByIdAsync<LoteDirect, LoteDirectDTO, Guid>(id, spec);
    return ResponseFactory.Success(dto);
  }

  public async Task<Response<Guid>> CreateAsync(CreateLoteDirectRequest request)
  {
    if (request.UtenteId is null || request.UtenteId == Guid.Empty)
      return ResponseFactory.Fail<Guid>("Utente em falta.");

    if (string.IsNullOrWhiteSpace(request.Credencial))
      return ResponseFactory.Fail<Guid>("Nº credencial em falta.");

    if (request.Mes is < 1 or > 12)
      return ResponseFactory.Fail<Guid>("Mês inválido.");

    if (request.Ano is null or < 1900)
      return ResponseFactory.Fail<Guid>("Ano inválido.");

    var entity = _mapper.Map<LoteDirect>(request);
    entity.Id = Guid.NewGuid();
    await _repository.CreateAsync<LoteDirect, Guid>(entity);
    await SincronizarLinhasAsync(entity.Id, request.Linhas, request.Linhas789);
    await _repository.SaveChangesAsync();
    return ResponseFactory.Success(entity.Id);
  }

  public async Task<Response<Guid>> UpdateAsync(Guid id, UpdateLoteDirectRequest request)
  {
    if (request.UtenteId is null || request.UtenteId == Guid.Empty)
      return ResponseFactory.Fail<Guid>("Utente em falta.");

    if (string.IsNullOrWhiteSpace(request.Credencial))
      return ResponseFactory.Fail<Guid>("Nº credencial em falta.");

    if (request.Mes is < 1 or > 12)
      return ResponseFactory.Fail<Guid>("Mês inválido.");

    if (request.Ano is null or < 1900)
      return ResponseFactory.Fail<Guid>("Ano inválido.");

    var entity = await _repository.GetByIdAsync<LoteDirect, Guid>(id);
    _mapper.Map(request, entity);
    await _repository.UpdateAsync<LoteDirect, Guid>(entity);
    await SincronizarLinhasAsync(entity.Id, request.Linhas, request.Linhas789);
    await _repository.SaveChangesAsync();
    return ResponseFactory.Success(entity.Id);
  }

  public async Task<Response<Guid>> DeleteAsync(Guid id)
  {
    await _repository.RemoveByIdAsync<LoteDirect, Guid>(id);
    await _repository.SaveChangesAsync();
    return ResponseFactory.Success(id);
  }

  public async Task<Response<int>> CorrigirLotesAsync(CorrigirLotesRequest request)
  {
    if (request.Mes is < 1 or > 12)
      return ResponseFactory.Fail<int>("Mês inválido.");

    if (request.Ano < 1900)
      return ResponseFactory.Fail<int>("Ano inválido.");

    try
    {
      await _correcaoLotesExecutor.ExecutarAsync(request.Ano, request.Mes);
      return ResponseFactory.Success(request.Ano);
    }
    catch (Exception ex)
    {
      return ResponseFactory.Fail<int>($"Não foi possível corrigir os lotes: {ex.Message}");
    }
  }

  public async Task<Response<IEnumerable<TipoLoteLightDTO>>> GetTiposLoteLightAsync()
  {
    var spec = new TipoLoteSearchList();
    var list = await _repository.GetListAsync<TipoLote, TipoLoteLightDTO, int>(spec);
    return ResponseFactory.Success(list);
  }

  private async Task SincronizarLinhasAsync(
    Guid loteDirectId,
    IEnumerable<LoteDirectLinhaUpsertRequest>? linhas,
    IEnumerable<LoteDirectLinhaUpsertRequest>? linhas789)
  {
    await _repository.RemoveRangeAsync<LoteDirectLinha, Guid>(
      await _repository.GetListAsync<LoteDirectLinha, Guid>(
        new LoteDirectLinhasByCabecalhoSpec(loteDirectId)));

    await _repository.RemoveRangeAsync<LoteDirectLinha789, Guid>(
      await _repository.GetListAsync<LoteDirectLinha789, Guid>(
        new LoteDirectLinhas789ByCabecalhoSpec(loteDirectId)));

    foreach (var linha in linhas ?? [])
    {
      await _repository.CreateAsync<LoteDirectLinha, Guid>(new LoteDirectLinha
      {
        Id = Guid.NewGuid(),
        LoteDirectId = loteDirectId,
        ServicoId = linha.ServicoId,
        Quantidade = linha.Quantidade,
        ValorUnitario = linha.ValorUnitario,
        ValorUtenteOriginal = linha.ValorUtenteOriginal,
        ValorInstituicaoOriginal = linha.ValorInstituicaoOriginal,
        ValorUtente = linha.ValorUtente,
        ValorInstituicao = linha.ValorInstituicao,
      });
    }

    foreach (var linha in linhas789 ?? [])
    {
      await _repository.CreateAsync<LoteDirectLinha789, Guid>(new LoteDirectLinha789
      {
        Id = Guid.NewGuid(),
        LoteDirectId = loteDirectId,
        ServicoId = linha.ServicoId,
        Quantidade = linha.Quantidade,
        ValorUnitario = linha.ValorUnitario,
        ValorUtenteOriginal = linha.ValorUtenteOriginal,
        ValorInstituicaoOriginal = linha.ValorInstituicaoOriginal,
        ValorUtente = linha.ValorUtente,
        ValorInstituicao = linha.ValorInstituicao,
      });
    }
  }
}
```

### 5.3 DTOs novos — `LoteDirectLinhaUpsertRequest.cs`

```csharp
namespace CliCloud.Application.Services.Credenciais.LoteDirectService.DTOs;

public class LoteDirectLinhaUpsertRequest
{
  public Guid ServicoId { get; set; }
  public int Quantidade { get; set; }
  public decimal ValorUnitario { get; set; }
  public decimal ValorUtenteOriginal { get; set; }
  public decimal ValorInstituicaoOriginal { get; set; }
  public decimal ValorUtente { get; set; }
  public decimal ValorInstituicao { get; set; }
}
```

### 5.4 `CreateLoteDirectRequest.cs` / `UpdateLoteDirectRequest.cs` — acrescentar

```csharp
public List<LoteDirectLinhaUpsertRequest>? Linhas { get; set; }
public List<LoteDirectLinhaUpsertRequest>? Linhas789 { get; set; }
```

### 5.5 Specifications — `LoteDirectLinhasByCabecalhoSpec.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Credenciais;

namespace CliCloud.Application.Services.Credenciais.LoteDirectService.Specifications;

public sealed class LoteDirectLinhasByCabecalhoSpec : Specification<LoteDirectLinha>
{
  public LoteDirectLinhasByCabecalhoSpec(Guid loteDirectId)
  {
    Query.Where(x => x.LoteDirectId == loteDirectId);
  }
}
```

### 5.6 `LoteDirectLinhas789ByCabecalhoSpec.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Credenciais;

namespace CliCloud.Application.Services.Credenciais.LoteDirectService.Specifications;

public sealed class LoteDirectLinhas789ByCabecalhoSpec : Specification<LoteDirectLinha789>
{
  public LoteDirectLinhas789ByCabecalhoSpec(Guid loteDirectId)
  {
    Query.Where(x => x.LoteDirectId == loteDirectId);
  }
}
```

Confirma no projecto os métodos `RemoveRangeAsync` / `GetListAsync` com specification. Se não existirem, usa `ApplicationDbContext` no executor e um repositório dedicado para a sincronização de linhas.

---

## 6. Infrastructure — executor completo

### 6.1 `LoteDirectCorrecaoLotesExecutor.cs`

```csharp
using CliCloud.Application.Services.Credenciais.LoteDirectService;
using CliCloud.Domain.Entities.Credenciais;
using CliCloud.Domain.Entities.Organismos;
using CliCloud.Domain.Entities.Servicos;
using CliCloud.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace CliCloud.Infrastructure.Persistence.Credenciais;

public sealed class LoteDirectCorrecaoLotesExecutor(ApplicationDbContext dbContext)
  : ILoteDirectCorrecaoLotesExecutor
{
  private const int MaxCredenciaisPorLote = 30;
  private const int TipoLoteValorExamesSemPapel = 97;

  private sealed record PrecoServico(
    decimal ValorServico,
    decimal ValorUtente,
    decimal ValorOrganismo);

  private sealed record TotaisLinhas(
    int Quantidade,
    decimal ValorUtente,
    decimal ValorInstituicao,
    decimal ValorServico);

  public async Task ExecutarAsync(int ano, int mes, CancellationToken cancellationToken = default)
  {
    await using IDbContextTransaction tx =
      await dbContext.Database.BeginTransactionAsync(cancellationToken);

    var tipoExamesSemPapelId = await dbContext.Set<TipoLote>()
      .AsNoTracking()
      .Where(x => x.Valor == TipoLoteValorExamesSemPapel)
      .Select(x => (int?)x.Id)
      .FirstOrDefaultAsync(cancellationToken);

    var cabecalhos = await dbContext.Set<LoteDirect>()
      .Where(x => !x.Historico && x.Ano == ano && x.Mes == mes)
      .OrderBy(x => x.CodigoOrganismo)
      .ThenBy(x => x.TipoServico)
      .ThenBy(x => x.TipoLote)
      .ThenBy(x => x.Id)
      .ToListAsync(cancellationToken);

    await dbContext.Set<LoteDirectDetalhe>()
      .Where(x => x.Ano == ano && x.Mes == mes)
      .ExecuteDeleteAsync(cancellationToken);

    await dbContext.Set<LoteDirectAgregado>()
      .Where(x => x.Ano == ano && x.Mes == mes)
      .ExecuteDeleteAsync(cancellationToken);

    RenumerarLotes(cabecalhos, tipoExamesSemPapelId);
    AplicarRegraExamesSemPapel(cabecalhos, tipoExamesSemPapelId);

    foreach (var cab in cabecalhos)
      cab.IndiceLote = null;

    var cabecalhoIds = cabecalhos.Select(x => x.Id).ToList();

    var linhas = await dbContext.Set<LoteDirectLinha>()
      .Where(x => cabecalhoIds.Contains(x.LoteDirectId))
      .ToListAsync(cancellationToken);

    var linhas789 = await dbContext.Set<LoteDirectLinha789>()
      .Where(x => cabecalhoIds.Contains(x.LoteDirectId))
      .ToListAsync(cancellationToken);

    var precos = await CarregarPrecosAsync(cabecalhos, linhas, linhas789, cancellationToken);

  foreach (var cab in cabecalhos)
  {
    if (cab.CodigoOrganismo is null)
      continue;

    foreach (var linha in linhas.Where(x => x.LoteDirectId == cab.Id))
    {
      if (!precos.TryGetValue((cab.CodigoOrganismo.Value, linha.ServicoId), out var preco))
        continue;

      AplicarPrecoLinha(cab, linha, preco);
    }

    foreach (var linha in linhas789.Where(x => x.LoteDirectId == cab.Id))
    {
      if (!precos.TryGetValue((cab.CodigoOrganismo.Value, linha.ServicoId), out var preco))
        continue;

      AplicarPrecoLinha789(cab, linha, preco);
    }
  }

    RecalcularTotaisCabecalho(cabecalhos, linhas, linhas789);

    var agregados = CriarAgregados(cabecalhos, linhas, linhas789, ano, mes);
    dbContext.Set<LoteDirectAgregado>().AddRange(agregados);
    await dbContext.SaveChangesAsync(cancellationToken);

    AtualizarIndices(cabecalhos, agregados);

    var detalhes = CriarDetalhes(cabecalhos, linhas, linhas789, agregados);
    dbContext.Set<LoteDirectDetalhe>().AddRange(detalhes);

    await dbContext.SaveChangesAsync(cancellationToken);
    await tx.CommitAsync(cancellationToken);
  }

  private static void RenumerarLotes(List<LoteDirect> cabecalhos, int? tipoExamesSemPapelId)
  {
    var elegiveis = cabecalhos
      .Where(x => tipoExamesSemPapelId is null || x.TipoLote != tipoExamesSemPapelId)
      .ToList();

    int? organismo = null;
    int? tipoServico = null;
    int? tipoLote = null;
    var numeroLote = 1;
    var contador = 1;

    foreach (var cab in elegiveis)
    {
      if (organismo != cab.CodigoOrganismo
          || tipoServico != cab.TipoServico
          || tipoLote != cab.TipoLote)
      {
        numeroLote = 1;
        contador = 1;
      }
      else if (contador > MaxCredenciaisPorLote)
      {
        numeroLote++;
        contador = 1;
      }

      cab.NumeroLote = numeroLote;
      organismo = cab.CodigoOrganismo;
      tipoServico = cab.TipoServico;
      tipoLote = cab.TipoLote;
      contador++;
    }
  }

  private static void AplicarRegraExamesSemPapel(List<LoteDirect> cabecalhos, int? tipoExamesSemPapelId)
  {
    if (tipoExamesSemPapelId is null)
      return;

    foreach (var cab in cabecalhos.Where(x => x.TipoLote == tipoExamesSemPapelId && x.NumeroLote > 1))
      cab.NumeroLote = 1;
  }

  private async Task<Dictionary<(int CodigoOrganismo, Guid ServicoId), PrecoServico>> CarregarPrecosAsync(
    List<LoteDirect> cabecalhos,
    List<LoteDirectLinha> linhas,
    List<LoteDirectLinha789> linhas789,
    CancellationToken cancellationToken)
  {
    var servicoIds = linhas.Select(x => x.ServicoId)
      .Concat(linhas789.Select(x => x.ServicoId))
      .Distinct()
      .ToList();

    var codigosOrganismo = cabecalhos
      .Where(x => x.CodigoOrganismo.HasValue)
      .Select(x => x.CodigoOrganismo!.Value)
      .Distinct()
      .ToList();

    var organismos = await dbContext.Set<Organismo>()
      .AsNoTracking()
      .Where(x => x.CodigoULSNova != null && codigosOrganismo.Contains(x.CodigoULSNova.Value))
      .Select(x => new { x.Id, Codigo = x.CodigoULSNova!.Value })
      .ToListAsync(cancellationToken);

    var organismoIds = organismos.Select(x => x.Id).ToList();

    var precos = await dbContext.Set<SubsistemaServico>()
      .AsNoTracking()
      .Where(x => !x.Inativo && organismoIds.Contains(x.OrganismoId) && servicoIds.Contains(x.ServicoId))
      .Select(x => new
      {
        x.OrganismoId,
        x.ServicoId,
        x.ValorServico,
        x.ValorUtente,
        x.ValorOrganismo
      })
      .ToListAsync(cancellationToken);

    var codigoPorOrganismoId = organismos.ToDictionary(x => x.Id, x => x.Codigo);

    return precos
      .Where(x => codigoPorOrganismoId.ContainsKey(x.OrganismoId))
      .ToDictionary(
        x => (codigoPorOrganismoId[x.OrganismoId], x.ServicoId),
        x => new PrecoServico(x.ValorServico, x.ValorUtente, x.ValorOrganismo));
  }

  private static void AplicarPrecoLinha(LoteDirect cab, LoteDirectLinha linha, PrecoServico preco)
  {
    linha.ValorUnitario = preco.ValorServico;
    var isIsento = cab.Isencao == 1;

    linha.ValorUtenteOriginal = isIsento ? 0 : preco.ValorUtente;
    linha.ValorInstituicaoOriginal = isIsento ? preco.ValorServico : preco.ValorOrganismo;
    linha.ValorUtente = linha.ValorUtenteOriginal * linha.Quantidade;
    linha.ValorInstituicao = linha.ValorInstituicaoOriginal * linha.Quantidade;
  }

  private static void AplicarPrecoLinha789(LoteDirect cab, LoteDirectLinha789 linha, PrecoServico preco)
  {
    linha.ValorUnitario = preco.ValorServico;
    var isIsento = cab.Isencao == 1;

    linha.ValorUtenteOriginal = isIsento ? 0 : preco.ValorUtente;
    linha.ValorInstituicaoOriginal = isIsento ? preco.ValorServico : preco.ValorOrganismo;
    linha.ValorUtente = linha.ValorUtenteOriginal * linha.Quantidade;
    linha.ValorInstituicao = linha.ValorInstituicaoOriginal * linha.Quantidade;
  }

  private static TotaisLinhas SomarLinhas<TLinha>(IEnumerable<TLinha> linhas)
    where TLinha : class
  {
    var quantidade = 0;
    var valorUtente = 0m;
    var valorInstituicao = 0m;
    var valorServico = 0m;

    foreach (var linha in linhas)
    {
      switch (linha)
      {
        case LoteDirectLinha normal:
          quantidade += normal.Quantidade;
          valorUtente += normal.ValorUtente;
          valorInstituicao += normal.ValorInstituicao;
          valorServico += normal.ValorUnitario * normal.Quantidade;
          break;
        case LoteDirectLinha789 especial:
          quantidade += especial.Quantidade;
          valorUtente += especial.ValorUtente;
          valorInstituicao += especial.ValorInstituicao;
          valorServico += especial.ValorUnitario * especial.Quantidade;
          break;
      }
    }

    return new TotaisLinhas(quantidade, valorUtente, valorInstituicao, valorServico);
  }

  private static void RecalcularTotaisCabecalho(
    List<LoteDirect> cabecalhos,
    List<LoteDirectLinha> linhas,
    List<LoteDirectLinha789> linhas789)
  {
    var porCab = linhas.GroupBy(x => x.LoteDirectId).ToDictionary(g => g.Key, g => g.ToList());
    var porCab789 = linhas789.GroupBy(x => x.LoteDirectId).ToDictionary(g => g.Key, g => g.ToList());

    foreach (var cab in cabecalhos)
    {
      porCab.TryGetValue(cab.Id, out var l1);
      porCab789.TryGetValue(cab.Id, out var l2);
      l1 ??= [];
      l2 ??= [];

      var taxaLinhas = l1.Sum(x => x.ValorUtente) + l2.Sum(x => x.ValorUtente);
      var subtotal = l1.Sum(x => x.ValorUnitario * x.Quantidade)
                   + l2.Sum(x => x.ValorUnitario * x.Quantidade);

      cab.ValorTaxasLinhas = taxaLinhas;
      cab.Subtotal = subtotal;
      cab.ValorTaxas = (cab.TaxaConsulta ?? 0) + taxaLinhas;
      cab.ValorTotal = (cab.ValorConsulta ?? 0) + subtotal;
    }
  }

  private static List<LoteDirectAgregado> CriarAgregados(
    List<LoteDirect> cabecalhos,
    List<LoteDirectLinha> linhas,
    List<LoteDirectLinha789> linhas789,
    int ano,
    int mes)
  {
    var porCab = linhas.GroupBy(x => x.LoteDirectId).ToDictionary(g => g.Key, g => g.ToList());
    var porCab789 = linhas789.GroupBy(x => x.LoteDirectId).ToDictionary(g => g.Key, g => g.ToList());

    return cabecalhos
      .GroupBy(x => new
      {
        NumeroLote = x.NumeroLote ?? 0,
        CodigoOrganismo = x.CodigoOrganismo ?? 0,
        TipoLote = x.TipoLote ?? 0,
        TipoServico = x.TipoServico ?? 0
      })
      .Select(grupo =>
      {
        var membros = grupo.ToList();
        var quantidade = 0;
        var valor = 0m;
        var valorTaxa = 0m;
        int? isencao = null;

        foreach (var cab in membros)
        {
          porCab.TryGetValue(cab.Id, out var l1);
          porCab789.TryGetValue(cab.Id, out var l2);
          l1 ??= [];
          l2 ??= [];

          quantidade += l1.Sum(x => x.Quantidade)
                      + l2.Sum(x => x.Quantidade)
                      + (cab.QuantidadeConsulta ?? 0);

          valor += l1.Sum(x => x.ValorUtente + x.ValorInstituicao)
                 + l2.Sum(x => x.ValorUtente + x.ValorInstituicao)
                 + (cab.ValorConsulta ?? 0);

          valorTaxa += l1.Sum(x => x.ValorUtente)
                    + l2.Sum(x => x.ValorUtente)
                    + (cab.TaxaConsulta ?? 0);

          isencao = Math.Max(isencao ?? cab.Isencao ?? 0, cab.Isencao ?? 0);
        }

        return new LoteDirectAgregado
        {
          Id = Guid.NewGuid(),
          NumeroLote = grupo.Key.NumeroLote,
          Ano = ano,
          Mes = mes,
          CodigoOrganismo = grupo.Key.CodigoOrganismo,
          TipoLote = grupo.Key.TipoLote,
          TipoServico = grupo.Key.TipoServico,
          DataLote = DateTime.UtcNow,
          Quantidade = quantidade,
          Valor = valor,
          ValorTaxa = valorTaxa,
          Isencao = isencao,
          NumeroRequisicoes = membros.Count
        };
      })
      .ToList();
  }

  private static void AtualizarIndices(List<LoteDirect> cabecalhos, List<LoteDirectAgregado> agregados)
  {
    foreach (var cab in cabecalhos)
    {
      var agregado = agregados.FirstOrDefault(x =>
        x.NumeroLote == (cab.NumeroLote ?? 0)
        && x.CodigoOrganismo == (cab.CodigoOrganismo ?? 0)
        && x.TipoLote == (cab.TipoLote ?? 0)
        && x.TipoServico == (cab.TipoServico ?? 0));

      if (agregado is null)
        continue;

      cab.IndiceLote = agregado.Indice;
    }
  }

  private static List<LoteDirectDetalhe> CriarDetalhes(
    List<LoteDirect> cabecalhos,
    List<LoteDirectLinha> linhas,
    List<LoteDirectLinha789> linhas789,
    List<LoteDirectAgregado> agregados)
  {
    var porCab = linhas.GroupBy(x => x.LoteDirectId).ToDictionary(g => g.Key, g => g.ToList());
    var porCab789 = linhas789.GroupBy(x => x.LoteDirectId).ToDictionary(g => g.Key, g => g.ToList());

    var detalhes = new List<LoteDirectDetalhe>();

    foreach (var cab in cabecalhos)
    {
      var agregado = agregados.FirstOrDefault(x =>
        x.NumeroLote == (cab.NumeroLote ?? 0)
        && x.CodigoOrganismo == (cab.CodigoOrganismo ?? 0)
        && x.TipoLote == (cab.TipoLote ?? 0)
        && x.TipoServico == (cab.TipoServico ?? 0));

      if (agregado is null)
        continue;

      porCab.TryGetValue(cab.Id, out var l1);
      porCab789.TryGetValue(cab.Id, out var l2);
      l1 ??= [];
      l2 ??= [];

      detalhes.Add(new LoteDirectDetalhe
      {
        Id = Guid.NewGuid(),
        LoteDirectAgregadoId = agregado.Id,
        LoteDirectId = cab.Id,
        Indice = agregado.Indice,
        NumeroLote = cab.NumeroLote ?? 0,
        Ano = cab.Ano ?? 0,
        Mes = cab.Mes ?? 0,
        CodigoOrganismo = cab.CodigoOrganismo ?? 0,
        TipoServico = cab.TipoServico ?? 0,
        TipoLote = cab.TipoLote ?? 0,
        Credencial = cab.Credencial,
        Quantidade = l1.Sum(x => x.Quantidade)
                   + l2.Sum(x => x.Quantidade)
                   + (cab.QuantidadeConsulta ?? 0),
        Valor = l1.Sum(x => x.ValorUtente + x.ValorInstituicao)
              + l2.Sum(x => x.ValorUtente + x.ValorInstituicao)
              + (cab.ValorConsulta ?? 0),
        ValorTaxa = l1.Sum(x => x.ValorUtente)
                  + l2.Sum(x => x.ValorUtente)
                  + (cab.TaxaConsulta ?? 0),
        Isencao = cab.Isencao,
        Data = cab.DataFim
      });
    }

    return detalhes;
  }
}
```

**Nota:** `Indice` do agregado só fica disponível depois do `SaveChanges` que gera a coluna identity. Se `AtualizarIndices` correr antes desse save, recarrega os agregados da BD ou atribui o índice após o primeiro `SaveChanges` e antes de criar os detalhes.

---

## 7. WebApi — registo DI

Em `ServiceCollectionExtensions.cs`, junto aos outros `AddTransient`:

```csharp
using CliCloud.Application.Services.Credenciais.LoteDirectService;
using CliCloud.Infrastructure.Persistence.Credenciais;

_ = services.AddTransient<ILoteDirectCorrecaoLotesExecutor, LoteDirectCorrecaoLotesExecutor>();
```

---

## 8. Frontend — DTOs e gravação

### 8.1 `lote-direct.dtos.ts` — acrescentar

```ts
export interface LoteDirectLinhaUpsertRequest {
  servicoId: string
  quantidade: number
  valorUnitario: number
  valorUtenteOriginal: number
  valorInstituicaoOriginal: number
  valorUtente: number
  valorInstituicao: number
}
```

Em `CreateLoteDirectRequest` e `UpdateLoteDirectRequest`:

```ts
linhas?: LoteDirectLinhaUpsertRequest[]
linhas789?: LoteDirectLinhaUpsertRequest[]
```

### 8.2 `lote-direct-form-modal.tsx`

No payload de create/update, enviar as linhas que o ecrã já calcula a partir de `SubsistemaServico`, mais tarde as linhas 789 quando migrares essa secção.

O modal já resolve `codigoOrganismo` via `Organismo.codigoULSNova`; mantém esse valor no cabeçalho para a renumeração por organismo.

### 8.3 `corrigir-lotes-modal.tsx`

Sem alteração de contrato. Após o backend real, o toast de sucesso/erro e o `refresh` da listagem passam a reflectir a correção.

---

## 9. Ordem de implementação

1. Entidades + configurações + migration + seed `TipoLotes` (`Valor = 97`).
2. DTOs/specifications e sincronização de linhas no create/update.
3. Executor completo e registo DI.
4. Substituir o stub em `CorrigirLotesAsync`.
5. Frontend: enviar `linhas` / `linhas789` no save.
6. Testes com mês/ano fixos: histórico intocado, limite 30, tipo 97, totais e agregados coerentes.

---

## 10. Critérios de aceitação

- [ ] Só credenciais `Historico = false` do mês/ano pedido são alteradas.
- [ ] `NumeroLote` segue agrupamento e limite 30, com regra `Valor = 97`.
- [ ] Linhas e totais reflectem `SubsistemaServico` e `Isencao`.
- [ ] Agregados e detalhe do período são recriados; `IndiceLote` coerente.
- [ ] UI: sucesso, erro e refresh da listagem.

---

## 11. O que não fazer

- Chamar a SP legada ou usar tabelas `dbo.LOTDIRECT`.
- Implementar só o cabeçalho e ignorar linhas/agregados.
- Misturar o fluxo de Tratamentos neste guia.
