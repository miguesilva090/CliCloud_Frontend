# ADSE — Comunicação de Faturas — Implementação completa

Documento com **checklist + código** de cada ficheiro a criar/alterar.

**Já feito:** Configurações ADSE (`WebserviceAdse`, `AdseController`, `config-adse-page`).

**Decisões de tipos:** ver secção [Matriz de decisão](#matriz-de-decisão). **Sem enums C#** — usar `AdseEstados` (legado) + `string` TA/CA/EX.

**Ordem:** Domain → Infrastructure (configs) → Application → Infrastructure (reader/storage) → WebApi → Migration → Frontend.

---

## Matriz de decisão

| Conceito | Legado | Projeto novo |
|----------|--------|--------------|
| Estado comunicação 0–4 | `AdseEstados.EstadoPF_*` | `AdseEstados` + `int` |
| Estado pré-fatura 1–3 | `ADSE_PreFaturas.Estado` | constantes `PreFatura*` |
| Tipo TA/CA/EX | `nvarchar(2)` | `string` |
| Rotas API | — | `AdseComunicacaoModulo` (como `CredenciaisSnsModulo`) |
| Operação 1–5 | `opcao` ASMX | `AdseEstados.Operacao*` |

---

## Migration (após criar entidades + configs)

```bash
cd Backend/CliCloud.Infrastructure
dotnet ef migrations add F23_Faturacao_AdseComunicacao --startup-project ../CliCloud.WebApi
dotnet ef database update --startup-project ../CliCloud.WebApi
```

---

# BACKEND — Ficheiros a CRIAR

---

## `Backend/CliCloud.Domain/Entities/Faturacao/AdseEstados.cs`

```csharp
namespace CliCloud.Domain.Entities.Faturacao;

/// <summary>Porte de CliCloud.Dados.Faturacao.AdseEstados + estados pré-fatura.</summary>
public static class AdseEstados
{
    public const int CoPagamentoNenhum = 0;
    public const int CoPagamentoPorComunicarSemPdf = 1;
    public const int CoPagamentoPorComunicarComPdf = 2;
    public const int CoPagamentoComunicado = 3;
    public const int CoPagamentoFechado = 4;

    public const int PreFaturaCriada = 1;
    public const int PreFaturaAberta = 2;
    public const int PreFaturaFechada = 3;

    public const int OperacaoValidar = 1;
    public const int OperacaoComunicar = 2;
    public const int OperacaoEliminar = 3;
    public const int OperacaoSubstituirPdf = 4;
    public const int OperacaoSubstituirRelatorio = 5;

    public const string TipoTratamentos = "TA";
    public const string TipoConsultas = "CA";
    public const string TipoExames = "EX";

    public static int CoPagamentoDeDescricao(string? descricao) => descricao switch
    {
        "Fechado" => CoPagamentoFechado,
        "Comunicado" => CoPagamentoComunicado,
        "Por Comunicar c/ PDF" => CoPagamentoPorComunicarComPdf,
        "Por Comunicar s/ PDF" => CoPagamentoPorComunicarSemPdf,
        _ => CoPagamentoNenhum,
    };

    public static string DescricaoCoPagamento(int estado) => estado switch
    {
        CoPagamentoPorComunicarSemPdf => "Por Comunicar s/ PDF",
        CoPagamentoPorComunicarComPdf => "Por Comunicar c/ PDF",
        CoPagamentoComunicado => "Comunicado",
        CoPagamentoFechado => "Fechado",
        _ => string.Empty,
    };

    public static string DescricaoPreFatura(int estado) => estado switch
    {
        PreFaturaCriada => "Criada",
        PreFaturaAberta => "Aberta",
        PreFaturaFechada => "Fechada",
        _ => string.Empty,
    };

    public static string CodigoPreFatura(string tipo, int numOrdem) => $"{tipo}{numOrdem}";
}
```

---

## `Backend/CliCloud.Domain/Entities/Faturacao/AdsePreFatura.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;
using CliCloud.Domain.Entities.Documentos;

namespace CliCloud.Domain.Entities.Faturacao;

[Table("AdsePreFatura", Schema = "Faturacao")]
public class AdsePreFatura : AuditableEntityWithSoftDelete
{
    public Guid ClinicaId { get; set; }

    [StringLength(2)]
    public string TipoPreFatura { get; set; } = AdseEstados.TipoTratamentos;

    public int NumOrdem { get; set; }
    public int Estado { get; set; }
    public DateTime DataAbertura { get; set; }
    public DateTime? DataFecho { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorTotal { get; set; }

    public int NumDocumentos { get; set; }

    [StringLength(260)]
    public string? PdfFicheiro { get; set; }

    public Guid? DocumentoFechoId { get; set; }
    public Documento? DocumentoFecho { get; set; }

    [StringLength(50)]
    public string? ReferenciaSerie { get; set; }
    public int? ReferenciaNumeroDocumento { get; set; }
    public DateTime? ReferenciaData { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ReferenciaValor { get; set; }
}
```

---

## `Backend/CliCloud.Domain/Entities/Faturacao/AdseCoPagamento.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;
using CliCloud.Domain.Entities.Documentos;

namespace CliCloud.Domain.Entities.Faturacao;

[Table("AdseCoPagamento", Schema = "Faturacao")]
public class AdseCoPagamento : AuditableEntityWithSoftDelete
{
    public Guid ClinicaId { get; set; }
    public Guid DocumentoId { get; set; }
    public Documento Documento { get; set; } = null!;

    [StringLength(2)]
    public string? TipoPreFatura { get; set; }

    public int? NumOrdemPreFatura { get; set; }
    public int Estado { get; set; }
    public DateTime? DataComunicacao { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorTotalUtente { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorTotalAdse { get; set; }

    [StringLength(260)]
    public string? PdfFicheiro { get; set; }

    [StringLength(260)]
    public string? PdfRelatorioFicheiro { get; set; }

    public string? Erros { get; set; }
    public DateTime? DataDevolucao { get; set; }
    public int NumDevolucoes { get; set; }
    public Guid OrigemClinicaId { get; set; }

    [StringLength(50)]
    public string? NumeroDevolucao { get; set; }
}
```

---

## `Backend/CliCloud.Infrastructure/Persistence/Configurations/AdsePreFaturaConfiguration.cs`

```csharp
using CliCloud.Domain.Entities.Faturacao;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CliCloud.Infrastructure.Persistence.Configurations;

public class AdsePreFaturaConfiguration : IEntityTypeConfiguration<AdsePreFatura>
{
    public void Configure(EntityTypeBuilder<AdsePreFatura> builder)
    {
        builder.ToTable("AdsePreFatura", "Faturacao");
        builder.HasIndex(x => new { x.ClinicaId, x.TipoPreFatura, x.NumOrdem })
            .IsUnique()
            .HasFilter("[DeletedOn] IS NULL");
        builder.HasOne(x => x.DocumentoFecho)
            .WithMany()
            .HasForeignKey(x => x.DocumentoFechoId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
```

---

## `Backend/CliCloud.Infrastructure/Persistence/Configurations/AdseCoPagamentoConfiguration.cs`

```csharp
using CliCloud.Domain.Entities.Faturacao;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CliCloud.Infrastructure.Persistence.Configurations;

public class AdseCoPagamentoConfiguration : IEntityTypeConfiguration<AdseCoPagamento>
{
    public void Configure(EntityTypeBuilder<AdseCoPagamento> builder)
    {
        builder.ToTable("AdseCoPagamento", "Faturacao");
        builder.HasIndex(x => x.DocumentoId)
            .IsUnique()
            .HasFilter("[DeletedOn] IS NULL");
        builder.HasOne(x => x.Documento)
            .WithMany()
            .HasForeignKey(x => x.DocumentoId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/AdseComunicacaoModulo.cs`

```csharp
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService;

public static class AdseComunicacaoModulo
{
    public const string Tratamentos = "tratamentos";
    public const string Consultas = "consultas";
    public const string Exames = "exames";

    public static bool TryParse(string? rota, out string tipoPreFaturaLegado)
    {
        tipoPreFaturaLegado = AdseEstados.TipoTratamentos;
        return (rota ?? "").Trim().ToLowerInvariant() switch
        {
            Tratamentos => Set(AdseEstados.TipoTratamentos, out tipoPreFaturaLegado),
            Consultas => Set(AdseEstados.TipoConsultas, out tipoPreFaturaLegado),
            Exames => Set(AdseEstados.TipoExames, out tipoPreFaturaLegado),
            _ => false,
        };
    }

    private static bool Set(string tipo, out string tipoPreFaturaLegado)
    {
        tipoPreFaturaLegado = tipo;
        return true;
    }
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/Filters/AdseComunicacaoTableFilter.cs`

```csharp
using CliCloud.Application.Common.Filter;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Filters;

public class AdseComunicacaoTableFilter : PaginationFilter
{
    public string Modulo { get; set; } = AdseComunicacaoModulo.Tratamentos;
    public DateTime? DataInicial { get; set; }
    public DateTime? DataFinal { get; set; }
    public int? EstadoComunicacao { get; set; }
    public Guid? UtenteId { get; set; }
    public bool Devolucoes { get; set; }
    public int? NumOrdemPreFatura { get; set; }
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/DTOs/AdseComunicacaoLinhaDTO.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;

public class AdseComunicacaoLinhaDTO : IDto
{
    public string Id { get; set; } = string.Empty;
    public Guid OrigemClinicaId { get; set; }
    public Guid DocumentoId { get; set; }
    public Guid? CoPagamentoId { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public int NumeroSessoes { get; set; }
    public Guid UtenteId { get; set; }
    public string UtenteNome { get; set; } = string.Empty;
    public string NumeroFatura { get; set; } = string.Empty;
    public DateTime? DataFatura { get; set; }
    public decimal ValorFatura { get; set; }
    public decimal ValorAdse { get; set; }
    public string? PreFatura { get; set; }
    public string? FaturaAdse { get; set; }
    public int Estado { get; set; }
    public string EstadoDescricao { get; set; } = string.Empty;
    public DateTime? DataComunicacao { get; set; }
    public string? PdfFicheiro { get; set; }
    public string? PdfRelatorioFicheiro { get; set; }
    public string? Erros { get; set; }
    public string? NumeroDevolucao { get; set; }
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/DTOs/AdseComunicacaoPaginatedDTO.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;

public class AdseComunicacaoPaginatedDTO : IDto
{
    public List<AdseComunicacaoLinhaDTO> Linhas { get; set; } = [];
    public decimal TotalFaturaPagina { get; set; }
    public decimal TotalFatura { get; set; }
    public decimal TotalAdsePagina { get; set; }
    public decimal TotalAdse { get; set; }
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/DTOs/AdsePreFaturaDTO.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;

public class AdsePreFaturaDTO : IDto
{
    public Guid Id { get; set; }
    public string TipoPreFatura { get; set; } = string.Empty;
    public int NumOrdem { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public int Estado { get; set; }
    public string EstadoDescricao { get; set; } = string.Empty;
    public DateTime DataAbertura { get; set; }
    public DateTime? DataFecho { get; set; }
    public decimal ValorTotal { get; set; }
    public int NumDocumentos { get; set; }
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/DTOs/CriarAdsePreFaturaRequest.cs`

```csharp
namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;

public class CriarAdsePreFaturaRequest
{
    public string TipoPreFatura { get; set; } = string.Empty;
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/DTOs/AdseComunicarDocumentosRequest.cs`

```csharp
namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;

public class AdseComunicarDocumentosRequest
{
    public string TipoPreFatura { get; set; } = string.Empty;
    public int NumOrdemPreFatura { get; set; }
    public int Operacao { get; set; }
    public bool Devolucoes { get; set; }
    public List<AdseComunicarLinhaRequest> Linhas { get; set; } = [];
}

public class AdseComunicarLinhaRequest
{
    public Guid OrigemClinicaId { get; set; }
    public Guid DocumentoId { get; set; }
    public string NumeroFatura { get; set; } = string.Empty;
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/DTOs/AdseUploadPdfRequest.cs`

```csharp
namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;

public class AdseUploadPdfRequest
{
    public Guid DocumentoId { get; set; }
    public Guid OrigemClinicaId { get; set; }
    public string NomeFicheiro { get; set; } = string.Empty;
    public string ConteudoBase64 { get; set; } = string.Empty;
    public bool RelatorioMedico { get; set; }
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/Specifications/AdsePreFaturasAbertasSpec.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Specifications;

public class AdsePreFaturasAbertasSpec : Specification<AdsePreFatura>
{
    public AdsePreFaturasAbertasSpec(Guid clinicaId, string tipoPreFatura) =>
        Query.Where(x =>
            x.ClinicaId == clinicaId
            && x.TipoPreFatura == tipoPreFatura
            && x.DeletedOn == null
            && x.Estado < AdseEstados.PreFaturaFechada)
            .OrderBy(x => x.NumOrdem);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/Specifications/AdsePreFaturasPorClinicaTipoSpec.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Specifications;

/// <summary>Legado: MAX(N_Ordem) por TipoPreFatura + Filtro.</summary>
public class AdsePreFaturasPorClinicaTipoSpec : Specification<AdsePreFatura>
{
    public AdsePreFaturasPorClinicaTipoSpec(Guid clinicaId, string tipoPreFatura) =>
        Query.Where(x =>
            x.ClinicaId == clinicaId
            && x.TipoPreFatura == tipoPreFatura
            && x.DeletedOn == null);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/Specifications/AdsePreFaturasPorEstadoSpec.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Specifications;

public class AdsePreFaturasPorEstadoSpec : Specification<AdsePreFatura>
{
    public AdsePreFaturasPorEstadoSpec(Guid clinicaId, string tipoPreFatura, int estado) =>
        Query.Where(x =>
            x.ClinicaId == clinicaId
            && x.TipoPreFatura == tipoPreFatura
            && x.Estado == estado
            && x.DeletedOn == null)
            .OrderBy(x => x.NumOrdem);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/Specifications/AdseCoPagamentoPorDocumentoSpec.cs`

```csharp
using Ardalis.Specification;
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Specifications;

public class AdseCoPagamentoPorDocumentoSpec : Specification<AdseCoPagamento>
{
    public AdseCoPagamentoPorDocumentoSpec(Guid documentoId) =>
        Query.Where(x => x.DocumentoId == documentoId && x.DeletedOn == null);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/IAdseComunicacaoListReader.cs`

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Filters;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService;

public interface IAdseComunicacaoListReader : ITransientService
{
    Task<AdseComunicacaoPaginatedDTO> ObterPaginadoAsync(
        Guid clinicaId,
        Guid organismoAdseId,
        string tipoPreFaturaLegado,
        AdseComunicacaoTableFilter filter,
        CancellationToken cancellationToken = default);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/IAdsePdfStorage.cs`

```csharp
using CliCloud.Application.Common.Marker;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService;

public interface IAdsePdfStorage : ITransientService
{
    Task<string> GuardarAsync(Guid clinicaId, string pastaRelativa, string nomeFicheiro, byte[] conteudo, CancellationToken ct = default);
    Task<byte[]?> LerAsync(Guid clinicaId, string pastaRelativa, string nomeFicheiro, CancellationToken ct = default);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/IAdseSoapClient.cs`

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService;

public interface IAdseSoapClient : ITransientService
{
    Task<string?> ExecutarDocumentoAsync(
        WebserviceAdse config,
        int operacaoLegado,
        AdseComunicacaoLinhaDTO linha,
        string codigoPreFatura,
        byte[]? pdf,
        byte[]? pdfRelatorio,
        CancellationToken ct = default);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/IAdseComunicacaoService.cs`

```csharp
using CliCloud.Application.Common.Marker;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Filters;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService;

public interface IAdseComunicacaoService : ITransientService
{
    Task<Response<AdseComunicacaoPaginatedDTO>> GetPaginatedAsync(string modulo, AdseComunicacaoTableFilter filter, CancellationToken ct = default);
    Task<Response<IReadOnlyList<AdsePreFaturaDTO>>> ListarPreFaturasAbertasAsync(string tipoPreFatura, CancellationToken ct = default);
    Task<Response<Guid>> CriarPreFaturaAsync(CriarAdsePreFaturaRequest request, CancellationToken ct = default);
    Task<Response<bool>> ApagarPreFaturaAsync(Guid id, CancellationToken ct = default);
    Task<Response<Guid>> RegistarPdfAsync(AdseUploadPdfRequest request, string tipoPreFatura, CancellationToken ct = default);
    Task<Response<string>> ComunicarDocumentosAsync(AdseComunicarDocumentosRequest request, CancellationToken ct = default);
}
```

---

## `Backend/CliCloud.Application/Services/Faturacao/AdseComunicacaoService/AdseComunicacaoService.cs`

```csharp
using CliCloud.Application.Common;
using CliCloud.Application.Common.Wrapper;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Filters;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Specifications;
using CliCloud.Application.Services.Faturacao.WebserviceAdseService.Specifications;
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Application.Services.Faturacao.AdseComunicacaoService;

public sealed class AdseComunicacaoService(
    IRepositoryAsync repository,
    ICurrentClinicaService currentClinica,
    IAdseComunicacaoListReader listReader,
    IAdsePdfStorage pdfStorage,
    IAdseSoapClient soapClient
) : IAdseComunicacaoService
{
    public async Task<Response<AdseComunicacaoPaginatedDTO>> GetPaginatedAsync(
        string modulo, AdseComunicacaoTableFilter filter, CancellationToken ct = default)
    {
        if (!AdseComunicacaoModulo.TryParse(modulo, out string tipo))
            return ResponseFactory.Fail<AdseComunicacaoPaginatedDTO>("Módulo ADSE inválido.");

        Guid? clinicaId = await ObterClinicaIdAsync().ConfigureAwait(false);
        if (clinicaId is null)
            return ResponseFactory.Fail<AdseComunicacaoPaginatedDTO>("Clínica atual inválida.");

        WebserviceAdse? config = await ObterConfigAsync(clinicaId.Value).ConfigureAwait(false);
        if (config is null)
            return ResponseFactory.Fail<AdseComunicacaoPaginatedDTO>("Configure o organismo ADSE em Configurações.");

        AdseComunicacaoPaginatedDTO page = await listReader
            .ObterPaginadoAsync(clinicaId.Value, config.OrganismoId, tipo, filter, ct)
            .ConfigureAwait(false);

        return ResponseFactory.Success(page);
    }

    public async Task<Response<IReadOnlyList<AdsePreFaturaDTO>>> ListarPreFaturasAbertasAsync(
        string tipoPreFatura, CancellationToken ct = default)
    {
        Guid? clinicaId = await ObterClinicaIdAsync().ConfigureAwait(false);
        if (clinicaId is null)
            return ResponseFactory.Fail<IReadOnlyList<AdsePreFaturaDTO>>("Clínica atual inválida.");

        IEnumerable<AdsePreFatura> rows = await repository
            .GetListAsync<AdsePreFatura, Guid>(new AdsePreFaturasAbertasSpec(clinicaId.Value, tipoPreFatura))
            .ConfigureAwait(false);

        return ResponseFactory.Success(MapPreFaturas(rows));
    }

    public async Task<Response<Guid>> CriarPreFaturaAsync(
        CriarAdsePreFaturaRequest request, CancellationToken ct = default)
    {
        Guid? clinicaId = await ObterClinicaIdAsync().ConfigureAwait(false);
        if (clinicaId is null)
            return ResponseFactory.Fail<Guid>("Clínica atual inválida.");

        IEnumerable<AdsePreFatura> existentes = await repository
            .GetListAsync<AdsePreFatura, Guid>(new AdsePreFaturasPorClinicaTipoSpec(clinicaId.Value, request.TipoPreFatura))
            .ConfigureAwait(false);

        int proximaOrdem = existentes.Any() ? existentes.Max(x => x.NumOrdem) + 1 : 1;

        AdsePreFatura entity = new()
        {
            ClinicaId = clinicaId.Value,
            TipoPreFatura = request.TipoPreFatura,
            NumOrdem = proximaOrdem,
            Estado = AdseEstados.PreFaturaCriada,
            DataAbertura = DateTime.UtcNow,
        };

        _ = await repository.CreateAsync<AdsePreFatura, Guid>(entity).ConfigureAwait(false);
        _ = await repository.SaveChangesAsync(ct).ConfigureAwait(false);
        return ResponseFactory.Success(entity.Id);
    }

    public async Task<Response<bool>> ApagarPreFaturaAsync(Guid id, CancellationToken ct = default)
    {
        AdsePreFatura? entity = await repository.GetByIdAsync<AdsePreFatura, Guid>(id).ConfigureAwait(false);
        if (entity is null || entity.DeletedOn is not null)
            return ResponseFactory.Fail<bool>("Pré-fatura não encontrada.");
        if (entity.Estado >= AdseEstados.PreFaturaFechada)
            return ResponseFactory.Fail<bool>("Não é possível apagar pré-fatura fechada.");

        _ = await repository.DeleteAsync<AdsePreFatura, Guid>(entity).ConfigureAwait(false);
        _ = await repository.SaveChangesAsync(ct).ConfigureAwait(false);
        return ResponseFactory.Success(true);
    }

    public async Task<Response<Guid>> RegistarPdfAsync(
        AdseUploadPdfRequest request, string tipoPreFatura, CancellationToken ct = default)
    {
        Guid? clinicaId = await ObterClinicaIdAsync().ConfigureAwait(false);
        if (clinicaId is null) return ResponseFactory.Fail<Guid>("Clínica atual inválida.");

        WebserviceAdse? config = await ObterConfigAsync(clinicaId.Value).ConfigureAwait(false);
        if (config is null) return ResponseFactory.Fail<Guid>("Configure o webservice ADSE.");

        byte[] bytes;
        try { bytes = Convert.FromBase64String(request.ConteudoBase64); }
        catch { return ResponseFactory.Fail<Guid>("PDF inválido."); }

        string nome = string.IsNullOrWhiteSpace(request.NomeFicheiro)
            ? $"{request.DocumentoId:N}.pdf"
            : request.NomeFicheiro.Trim();

        string ficheiro = await pdfStorage
            .GuardarAsync(clinicaId.Value, config.PastaPdfAdse, nome, bytes, ct)
            .ConfigureAwait(false);

        AdseCoPagamento? cop = (await repository
            .GetListAsync<AdseCoPagamento, Guid>(new AdseCoPagamentoPorDocumentoSpec(request.DocumentoId))
            .ConfigureAwait(false)).FirstOrDefault();

        if (cop is null)
        {
            cop = new AdseCoPagamento
            {
                ClinicaId = clinicaId.Value,
                DocumentoId = request.DocumentoId,
                OrigemClinicaId = request.OrigemClinicaId,
                TipoPreFatura = tipoPreFatura,
                Estado = AdseEstados.CoPagamentoPorComunicarComPdf,
            };
            _ = await repository.CreateAsync<AdseCoPagamento, Guid>(cop).ConfigureAwait(false);
        }
        else if (cop.Estado == AdseEstados.CoPagamentoPorComunicarSemPdf)
        {
            cop.Estado = AdseEstados.CoPagamentoPorComunicarComPdf;
        }

        if (request.RelatorioMedico) cop.PdfRelatorioFicheiro = ficheiro;
        else cop.PdfFicheiro = ficheiro;

        if (cop.Id != Guid.Empty)
            _ = await repository.UpdateAsync<AdseCoPagamento, Guid>(cop).ConfigureAwait(false);

        _ = await repository.SaveChangesAsync(ct).ConfigureAwait(false);
        return ResponseFactory.Success(cop.Id);
    }

    public async Task<Response<string>> ComunicarDocumentosAsync(
        AdseComunicarDocumentosRequest request, CancellationToken ct = default)
    {
        Guid? clinicaId = await ObterClinicaIdAsync().ConfigureAwait(false);
        if (clinicaId is null) return ResponseFactory.Fail<string>("Clínica atual inválida.");

        WebserviceAdse? config = await ObterConfigAsync(clinicaId.Value).ConfigureAwait(false);
        if (config is null) return ResponseFactory.Fail<string>("Configure o organismo ADSE.");

        string codigoPf = AdseEstados.CodigoPreFatura(request.TipoPreFatura, request.NumOrdemPreFatura);
        List<string> erros = [];

        foreach (AdseComunicarLinhaRequest linha in request.Linhas)
        {
            AdseCoPagamento? cop = (await repository
                .GetListAsync<AdseCoPagamento, Guid>(new AdseCoPagamentoPorDocumentoSpec(linha.DocumentoId))
                .ConfigureAwait(false)).FirstOrDefault();

            string? validacao = ValidarOperacao(request.Operacao, cop);
            if (validacao is not null) { erros.Add(validacao); continue; }

            AdseComunicacaoLinhaDTO dto = new()
            {
                OrigemClinicaId = linha.OrigemClinicaId,
                DocumentoId = linha.DocumentoId,
                NumeroFatura = linha.NumeroFatura,
            };

            byte[]? pdf = cop?.PdfFicheiro is not null
                ? await pdfStorage.LerAsync(clinicaId.Value, config.PastaPdfAdse, cop.PdfFicheiro, ct) : null;
            byte[]? pdfRel = cop?.PdfRelatorioFicheiro is not null
                ? await pdfStorage.LerAsync(clinicaId.Value, config.PastaPdfAdse, cop.PdfRelatorioFicheiro, ct) : null;

            string? erroWs = await soapClient
                .ExecutarDocumentoAsync(config, request.Operacao, dto, codigoPf, pdf, pdfRel, ct)
                .ConfigureAwait(false);

            if (!string.IsNullOrWhiteSpace(erroWs))
            {
                if (cop is not null) { cop.Erros = erroWs; _ = await repository.UpdateAsync<AdseCoPagamento, Guid>(cop).ConfigureAwait(false); }
                erros.Add(erroWs);
                continue;
            }

            if (cop is not null)
            {
                AplicarSucesso(cop, request.Operacao, request.TipoPreFatura, request.NumOrdemPreFatura);
                cop.Erros = null;
                _ = await repository.UpdateAsync<AdseCoPagamento, Guid>(cop).ConfigureAwait(false);
            }
        }

        _ = await repository.SaveChangesAsync(ct).ConfigureAwait(false);
        return erros.Count == 0
            ? ResponseFactory.Success("Comunicação concluída.")
            : ResponseFactory.Fail<string>(string.Join(Environment.NewLine, erros));
    }

    private static void AplicarSucesso(AdseCoPagamento cop, int operacao, string tipo, int numOrdem)
    {
        if (operacao == AdseEstados.OperacaoComunicar)
        {
            cop.Estado = AdseEstados.CoPagamentoComunicado;
            cop.DataComunicacao = DateTime.UtcNow;
            cop.TipoPreFatura = tipo;
            cop.NumOrdemPreFatura = numOrdem;
        }
        else if (operacao == AdseEstados.OperacaoEliminar)
        {
            cop.Estado = AdseEstados.CoPagamentoPorComunicarComPdf;
            cop.DataComunicacao = null;
            cop.NumOrdemPreFatura = null;
        }
    }

    private static string? ValidarOperacao(int operacao, AdseCoPagamento? cop)
    {
        if (operacao is AdseEstados.OperacaoValidar or AdseEstados.OperacaoComunicar)
        {
            if (cop is null || string.IsNullOrWhiteSpace(cop.PdfFicheiro)) return "PDF obrigatório.";
            if (cop.Estado is AdseEstados.CoPagamentoComunicado or AdseEstados.CoPagamentoFechado)
                return "Documento já comunicado ou fechado.";
        }
        if (operacao == AdseEstados.OperacaoEliminar && cop?.Estado != AdseEstados.CoPagamentoComunicado)
            return "Só é possível eliminar documentos comunicados.";
        return null;
    }

    private async Task<Guid?> ObterClinicaIdAsync()
    {
        await currentClinica.SetClinicaAsync().ConfigureAwait(false);
        return Guid.TryParse(currentClinica.ClinicaId, out Guid id) ? id : null;
    }

    private async Task<WebserviceAdse?> ObterConfigAsync(Guid clinicaId)
    {
        IEnumerable<WebserviceAdse> rows = await repository
            .GetListAsync<WebserviceAdse, Guid>(new WebserviceAdsePorClinicaSpec(clinicaId))
            .ConfigureAwait(false);
        return rows.FirstOrDefault();
    }

    private static IReadOnlyList<AdsePreFaturaDTO> MapPreFaturas(IEnumerable<AdsePreFatura> rows) =>
        rows.Select(x => new AdsePreFaturaDTO
        {
            Id = x.Id,
            TipoPreFatura = x.TipoPreFatura,
            NumOrdem = x.NumOrdem,
            Codigo = AdseEstados.CodigoPreFatura(x.TipoPreFatura, x.NumOrdem),
            Estado = x.Estado,
            EstadoDescricao = AdseEstados.DescricaoPreFatura(x.Estado),
            DataAbertura = x.DataAbertura,
            DataFecho = x.DataFecho,
            ValorTotal = x.ValorTotal,
            NumDocumentos = x.NumDocumentos,
        }).ToList();
}
```

---

## `Backend/CliCloud.Infrastructure/Persistence/Faturacao/AdseComunicacaoListReader.cs`

```csharp
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Filters;
using CliCloud.Domain.Entities.Faturacao;
using CliCloud.Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace CliCloud.Infrastructure.Persistence.Faturacao;

public sealed class AdseComunicacaoListReader(ApplicationDbContext db) : IAdseComunicacaoListReader
{
    public async Task<AdseComunicacaoPaginatedDTO> ObterPaginadoAsync(
        Guid clinicaId, Guid organismoAdseId, string tipo, AdseComunicacaoTableFilter filter, CancellationToken ct)
    {
        List<AdseComunicacaoLinhaDTO> linhas = tipo switch
        {
            AdseEstados.TipoTratamentos => await TratamentosAsync(clinicaId, organismoAdseId, filter, ct),
            AdseEstados.TipoConsultas => await ConsultasAsync(clinicaId, organismoAdseId, filter, ct),
            AdseEstados.TipoExames => [],
            _ => [],
        };

        AplicarFiltrosPosQuery(linhas, filter, tipo);

        int total = linhas.Count;
        int skip = (filter.PageNumber - 1) * filter.PageSize;
        List<AdseComunicacaoLinhaDTO> page = linhas.Skip(skip).Take(filter.PageSize).ToList();

        return new AdseComunicacaoPaginatedDTO
        {
            Linhas = page,
            TotalCount = total,
            PageNumber = filter.PageNumber,
            PageSize = filter.PageSize,
            TotalFaturaPagina = page.Sum(x => x.ValorFatura),
            TotalFatura = linhas.Sum(x => x.ValorFatura),
            TotalAdsePagina = page.Sum(x => x.ValorAdse),
            TotalAdse = linhas.Sum(x => x.ValorAdse),
        };
    }

    private async Task<List<AdseComunicacaoLinhaDTO>> TratamentosAsync(
        Guid clinicaId, Guid organismoId, AdseComunicacaoTableFilter filter, CancellationToken ct)
    {
        (DateTime ini, DateTime fim) = IntervaloFatura(filter);

        var rows = await (
            from sess in db.SessoesTratamento.AsNoTracking()
            join trat in db.Tratamentos.AsNoTracking() on sess.TratamentoId equals trat.Id
            join doc in db.Documentos.AsNoTracking() on sess.DocumentoId equals doc.Id
            join ut in db.Utentes.AsNoTracking() on trat.UtenteId equals ut.Id
            join org in db.Organismos.AsNoTracking() on trat.OrganismoId equals org.Id into orgJ
            from org in orgJ.DefaultIfEmpty()
            where sess.DeletedOn == null && trat.DeletedOn == null && doc.DeletedOn == null
                  && doc.ClinicaId == clinicaId && doc.OrganismoId == organismoId
                  && doc.Data >= ini && doc.Data <= fim && sess.DocumentoId != null
                  && (sess.Faltou == 0 || org == null || org.Faltas == 0 || !org.ContabilizarFaltas)
            group sess by new
            {
                TratamentoId = trat.Id,
                trat.DataInic,
                trat.DataFim,
                UtenteId = ut.Id,
                UtenteNome = ut.Nome,
                DocumentoId = doc.Id,
                doc.NumeroExibicao,
                doc.Data,
                doc.TotalLiquido,
            }
            into g
            select new RowBase(
                g.Key.TratamentoId, g.Key.DocumentoId, g.Key.DataInic, g.Key.DataFim,
                g.Select(x => x.NumSessao).Distinct().Count(),
                g.Key.UtenteId, g.Key.UtenteNome ?? "", g.Key.NumeroExibicao ?? "",
                g.Key.Data, g.Key.TotalLiquido ?? 0m, g.Max(x => x.NumDevolucao)))
            .ToListAsync(ct);

        return await MapearComCopagamentosAsync(rows, ct);
    }

    private async Task<List<AdseComunicacaoLinhaDTO>> ConsultasAsync(
        Guid clinicaId, Guid organismoId, AdseComunicacaoTableFilter filter, CancellationToken ct)
    {
        (DateTime ini, DateTime fim) = IntervaloFatura(filter);

        var rows = await (
            from c in db.Consultas.AsNoTracking()
            join a in db.Admissoes.AsNoTracking() on c.AdmissaoId equals a.Id
            join doc in db.Documentos.AsNoTracking() on c.DocumentoId equals doc.Id
            join ut in db.Utentes.AsNoTracking() on a.UtenteId equals ut.Id
            where c.DeletedOn == null && a.DeletedOn == null && doc.DeletedOn == null
                  && doc.ClinicaId == clinicaId && doc.OrganismoId == organismoId
                  && doc.Data >= ini && doc.Data <= fim && c.DocumentoId != null
            select new RowBase(
                a.Id, doc.Id, c.Data, c.Data, 1,
                ut.Id, ut.Nome ?? "", doc.NumeroExibicao ?? "", doc.Data,
                doc.TotalLiquido ?? 0m, null))
            .ToListAsync(ct);

        return await MapearComCopagamentosAsync(rows, ct);
    }

    private async Task<List<AdseComunicacaoLinhaDTO>> MapearComCopagamentosAsync(
        List<RowBase> list, CancellationToken ct)
    {
        var docIds = list.Select(x => x.DocumentoId).Distinct().ToList();
        var cops = await db.AdseCoPagamentos.AsNoTracking()
            .Where(x => docIds.Contains(x.DocumentoId) && x.DeletedOn == null)
            .ToDictionaryAsync(x => x.DocumentoId, ct);

        return list.Select(r =>
        {
            cops.TryGetValue(r.DocumentoId, out AdseCoPagamento? cop);
            int estado = cop?.Estado ?? AdseEstados.CoPagamentoNenhum;
            return new AdseComunicacaoLinhaDTO
            {
                Id = $"{r.OrigemId}:{r.DocumentoId}",
                OrigemClinicaId = r.OrigemId,
                DocumentoId = r.DocumentoId,
                CoPagamentoId = cop?.Id,
                DataInicio = r.DataInicio,
                DataFim = r.DataFim,
                NumeroSessoes = r.NumSessoes,
                UtenteId = r.UtenteId,
                UtenteNome = r.UtenteNome,
                NumeroFatura = r.NumeroFatura,
                DataFatura = r.DataFatura,
                ValorFatura = r.ValorFatura,
                ValorAdse = r.ValorFatura,
                PreFatura = cop?.TipoPreFatura is not null && cop.NumOrdemPreFatura is int n
                    ? AdseEstados.CodigoPreFatura(cop.TipoPreFatura, n) : null,
                Estado = estado,
                EstadoDescricao = AdseEstados.DescricaoCoPagamento(estado),
                DataComunicacao = cop?.DataComunicacao,
                PdfFicheiro = cop?.PdfFicheiro,
                PdfRelatorioFicheiro = cop?.PdfRelatorioFicheiro,
                Erros = cop?.Erros,
                NumeroDevolucao = r.NumDevolucao,
            };
        }).OrderBy(x => x.DataFatura).ToList();
    }

    private static void AplicarFiltrosPosQuery(
        List<AdseComunicacaoLinhaDTO> linhas, AdseComunicacaoTableFilter filter, string tipo)
    {
        if (filter.UtenteId.HasValue)
            linhas.RemoveAll(x => x.UtenteId != filter.UtenteId.Value);
        if (filter.EstadoComunicacao is > 0)
            linhas.RemoveAll(x => x.Estado != filter.EstadoComunicacao);
        if (filter.NumOrdemPreFatura.HasValue)
            linhas.RemoveAll(x => x.PreFatura != AdseEstados.CodigoPreFatura(tipo, filter.NumOrdemPreFatura.Value));
        if (filter.Devolucoes)
            linhas.RemoveAll(x => string.IsNullOrWhiteSpace(x.NumeroDevolucao));
    }

    private static (DateTime ini, DateTime fim) IntervaloFatura(AdseComunicacaoTableFilter filter)
    {
        DateTime ini = filter.DataInicial?.Date ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        DateTime fim = filter.DataFinal?.Date.AddDays(1).AddTicks(-1) ?? DateTime.Today.AddDays(1).AddTicks(-1);
        return (ini, fim);
    }

    private sealed record RowBase(
        Guid OrigemId, Guid DocumentoId, DateTime? DataInicio, DateTime? DataFim, int NumSessoes,
        Guid UtenteId, string UtenteNome, string NumeroFatura, DateTime? DataFatura,
        decimal ValorFatura, string? NumDevolucao);
}
```

---

## `Backend/CliCloud.Infrastructure/Persistence/Faturacao/AdsePdfFileStorage.cs`

```csharp
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService;
using Microsoft.Extensions.Hosting;

namespace CliCloud.Infrastructure.Persistence.Faturacao;

public sealed class AdsePdfFileStorage(IHostEnvironment env) : IAdsePdfStorage
{
    public async Task<string> GuardarAsync(
        Guid clinicaId, string pastaRelativa, string nomeFicheiro, byte[] conteudo, CancellationToken ct = default)
    {
        string dir = Path.Combine(
            env.ContentRootPath, "UserFiles", clinicaId.ToString("N"), pastaRelativa.Trim('\\', '/'));
        Directory.CreateDirectory(dir);
        string fullPath = Path.Combine(dir, Path.GetFileName(nomeFicheiro));
        await File.WriteAllBytesAsync(fullPath, conteudo, ct).ConfigureAwait(false);
        return Path.GetFileName(fullPath);
    }

    public async Task<byte[]?> LerAsync(
        Guid clinicaId, string pastaRelativa, string nomeFicheiro, CancellationToken ct = default)
    {
        string fullPath = Path.Combine(
            env.ContentRootPath, "UserFiles", clinicaId.ToString("N"),
            pastaRelativa.Trim('\\', '/'), Path.GetFileName(nomeFicheiro));
        return File.Exists(fullPath) ? await File.ReadAllBytesAsync(fullPath, ct).ConfigureAwait(false) : null;
    }
}
```

---

## `Backend/CliCloud.Infrastructure/Persistence/Faturacao/AdseSoapClientStub.cs`

```csharp
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;
using CliCloud.Domain.Entities.Faturacao;

namespace CliCloud.Infrastructure.Persistence.Faturacao;

/// <summary>Fase F4: substituir por cliente SOAP (Dados/.../wsADSE).</summary>
public sealed class AdseSoapClientStub : IAdseSoapClient
{
    public Task<string?> ExecutarDocumentoAsync(
        WebserviceAdse config, int operacaoLegado, AdseComunicacaoLinhaDTO linha,
        string codigoPreFatura, byte[]? pdf, byte[]? pdfRelatorio, CancellationToken ct = default)
    {
        if (operacaoLegado == AdseEstados.OperacaoValidar)
            return Task.FromResult<string?>(null);
        return Task.FromResult<string?>("Integração SOAP ADSE pendente (Fase F4).");
    }
}
```

---

## `Backend/CliCloud.WebApi/Controllers/Faturacao/AdseComunicacaoController.cs`

```csharp
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.DTOs;
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CliCloud.WebApi.Controllers.Faturacao;

[Route("client/faturacao/adse/comunicacao")]
[ApiController]
[Authorize(Roles = "client")]
public class AdseComunicacaoController(IAdseComunicacaoService service) : ControllerBase
{
    [HttpPost("{modulo}/paginated")]
    public async Task<IActionResult> GetPaginated(string modulo, [FromBody] AdseComunicacaoTableFilter filter)
    {
        filter.Modulo = modulo;
        return Ok(await service.GetPaginatedAsync(modulo, filter));
    }

    [HttpGet("pre-faturas/abertas")]
    public async Task<IActionResult> PreFaturasAbertas([FromQuery] string tipoPreFatura)
        => Ok(await service.ListarPreFaturasAbertasAsync(tipoPreFatura));

    [HttpPost("pre-faturas")]
    public async Task<IActionResult> CriarPreFatura([FromBody] CriarAdsePreFaturaRequest request)
        => Ok(await service.CriarPreFaturaAsync(request));

    [HttpDelete("pre-faturas/{id:guid}")]
    public async Task<IActionResult> ApagarPreFatura(Guid id, CancellationToken ct)
        => Ok(await service.ApagarPreFaturaAsync(id, ct));

    [HttpPost("{modulo}/pdf")]
    public async Task<IActionResult> Pdf(string modulo, [FromBody] AdseUploadPdfRequest request, CancellationToken ct)
    {
        if (!AdseComunicacaoModulo.TryParse(modulo, out string tipo))
            return BadRequest("Módulo inválido.");
        return Ok(await service.RegistarPdfAsync(request, tipo, ct));
    }

    [HttpPost("documentos/comunicar")]
    public async Task<IActionResult> Comunicar([FromBody] AdseComunicarDocumentosRequest request, CancellationToken ct)
        => Ok(await service.ComunicarDocumentosAsync(request, ct));
}
```

---

# BACKEND — Ficheiros a ALTERAR

---

## `Backend/CliCloud.Infrastructure/Persistence/Contexts/ApplicationDbContext.cs`

Na secção `// DbSets - Faturacao`, após `WebservicesAdse`:

```csharp
public DbSet<AdsePreFatura> AdsePreFaturas { get; set; }
public DbSet<AdseCoPagamento> AdseCoPagamentos { get; set; }
```

---

## `Backend/CliCloud.WebApi/Extensions/ServiceCollectionExtensions.cs`

Adicionar usings no topo do ficheiro:

```csharp
using CliCloud.Application.Services.Faturacao.AdseComunicacaoService;
using CliCloud.Infrastructure.Persistence.Faturacao;
```

Junto a `ICredenciaisSnsLegadoLookup` (região de DI):

```csharp
_ = services.AddTransient<IAdseComunicacaoListReader, AdseComunicacaoListReader>();
_ = services.AddTransient<IAdsePdfStorage, AdsePdfFileStorage>();
_ = services.AddTransient<IAdseSoapClient, AdseSoapClientStub>();
```

---

# FRONTEND — Ficheiros a CRIAR

---

## `Frontend/src/types/dtos/faturacao/adse-comunicacao.dtos.ts`

```typescript
export type AdseComunicacaoModulo = 'tratamentos' | 'consultas' | 'exames'

export type AdseComunicacaoLinhaDTO = {
  id: string
  origemClinicaId: string
  documentoId: string
  coPagamentoId?: string | null
  dataInicio?: string | null
  dataFim?: string | null
  numeroSessoes: number
  utenteId: string
  utenteNome: string
  numeroFatura: string
  dataFatura?: string | null
  valorFatura: number
  valorAdse: number
  preFatura?: string | null
  faturaAdse?: string | null
  estado: number
  estadoDescricao: string
  dataComunicacao?: string | null
  pdfFicheiro?: string | null
  pdfRelatorioFicheiro?: string | null
  erros?: string | null
  numeroDevolucao?: string | null
}

export type AdseComunicacaoPaginatedDTO = {
  linhas: AdseComunicacaoLinhaDTO[]
  totalFaturaPagina: number
  totalFatura: number
  totalAdsePagina: number
  totalAdse: number
  totalCount: number
  pageNumber: number
  pageSize: number
}

export type AdseComunicacaoTableFilter = {
  pageNumber: number
  pageSize: number
  sorting: { id: string; desc: boolean }[]
  dataInicial?: string | null
  dataFinal?: string | null
  estadoComunicacao?: number | null
  utenteId?: string | null
  devolucoes?: boolean
  numOrdemPreFatura?: number | null
}

export type AdsePreFaturaDTO = {
  id: string
  tipoPreFatura: string
  numOrdem: number
  codigo: string
  estado: number
  estadoDescricao: string
  dataAbertura: string
  dataFecho?: string | null
  valorTotal: number
  numDocumentos: number
}

export type AdseComunicarDocumentosRequest = {
  tipoPreFatura: string
  numOrdemPreFatura: number
  operacao: number
  devolucoes: boolean
  linhas: { origemClinicaId: string; documentoId: string; numeroFatura: string }[]
}
```

---

## `Frontend/src/lib/services/faturacao/adse-service/adse-comunicacao-client.ts`

```typescript
import state from '@/states/state'
import { BaseApiClient } from '@/lib/base-client'
import type { GSResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import type {
  AdseComunicacaoModulo,
  AdseComunicacaoPaginatedDTO,
  AdseComunicacaoTableFilter,
  AdseComunicarDocumentosRequest,
  AdsePreFaturaDTO,
} from '@/types/dtos/faturacao/adse-comunicacao.dtos'

const BASE = '/client/faturacao/adse/comunicacao'

export class AdseComunicacaoClient extends BaseApiClient {
  getPaginated(
    modulo: AdseComunicacaoModulo,
    filter: AdseComunicacaoTableFilter,
  ): Promise<ResponseApi<GSResponse<AdseComunicacaoPaginatedDTO>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/${modulo}/paginated`, filter)
  }

  listarPreFaturasAbertas(
    tipoPreFatura: string,
  ): Promise<ResponseApi<GSResponse<AdsePreFaturaDTO[]>>> {
    return this.httpClient.getRequest(
      state.URL,
      `${BASE}/pre-faturas/abertas?tipoPreFatura=${encodeURIComponent(tipoPreFatura)}`,
    )
  }

  criarPreFatura(
    tipoPreFatura: string,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/pre-faturas`, { tipoPreFatura })
  }

  comunicarDocumentos(
    payload: AdseComunicarDocumentosRequest,
  ): Promise<ResponseApi<GSResponse<string>>> {
    return this.httpClient.postRequest(state.URL, `${BASE}/documentos/comunicar`, payload)
  }
}
```

---

## `Frontend/src/pages/area-financeira/faturacao/adse/adse-modulo-config.ts`

```typescript
import type { AdseComunicacaoModulo } from '@/types/dtos/faturacao/adse-comunicacao.dtos'

export const ADSE_TIPO_PRE_FATURA: Record<AdseComunicacaoModulo, string> = {
  tratamentos: 'TA',
  consultas: 'CA',
  exames: 'EX',
}

export function adseComunicacaoPageTitle(modulo: AdseComunicacaoModulo): string {
  switch (modulo) {
    case 'tratamentos':
      return 'Faturação ADSE - Tratamentos'
    case 'consultas':
      return 'Faturação ADSE - Consultas'
    case 'exames':
      return 'Faturação ADSE - Exames'
    default:
      return 'Faturação ADSE'
  }
}
```

---

## `Frontend/src/pages/area-financeira/faturacao/adse/queries/adse-comunicacao-queries.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { AdseComunicacaoService } from '@/lib/services/faturacao/adse-service'
import type {
  AdseComunicacaoModulo,
  AdseComunicacaoTableFilter,
} from '@/types/dtos/faturacao/adse-comunicacao.dtos'
import { ADSE_PERM_ID } from './adse-config-queries'
import { ADSE_TIPO_PRE_FATURA } from '../adse-modulo-config'

export const adseComunicacaoPaginatedKey = (
  modulo: AdseComunicacaoModulo,
  filter: AdseComunicacaoTableFilter,
) => ['adse', 'comunicacao', modulo, filter]

export function useAdseComunicacaoPaginatedQuery(
  modulo: AdseComunicacaoModulo,
  filter: AdseComunicacaoTableFilter,
  enabled = true,
) {
  return useQuery({
    queryKey: adseComunicacaoPaginatedKey(modulo, filter),
    queryFn: () => AdseComunicacaoService(ADSE_PERM_ID).getPaginated(modulo, filter),
    enabled,
  })
}

export function useAdsePreFaturasAbertasQuery(modulo: AdseComunicacaoModulo) {
  const tipo = ADSE_TIPO_PRE_FATURA[modulo]
  return useQuery({
    queryKey: ['adse', 'pre-faturas', 'abertas', modulo],
    queryFn: () => AdseComunicacaoService(ADSE_PERM_ID).listarPreFaturasAbertas(tipo),
  })
}
```

---

## `Frontend/src/pages/area-financeira/faturacao/adse/queries/adse-comunicacao-mutations.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AdseComunicacaoService } from '@/lib/services/faturacao/adse-service'
import type { AdseComunicacaoModulo, AdseComunicarDocumentosRequest } from '@/types/dtos/faturacao/adse-comunicacao.dtos'
import { ADSE_PERM_ID } from './adse-config-queries'
import { ADSE_TIPO_PRE_FATURA } from '../adse-modulo-config'

export function useCriarAdsePreFaturaMutation(modulo: AdseComunicacaoModulo) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      AdseComunicacaoService(ADSE_PERM_ID).criarPreFatura(ADSE_TIPO_PRE_FATURA[modulo]),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adse', 'pre-faturas', 'abertas', modulo] }),
  })
}

export function useComunicarAdseDocumentosMutation() {
  return useMutation({
    mutationFn: (payload: AdseComunicarDocumentosRequest) =>
      AdseComunicacaoService(ADSE_PERM_ID).comunicarDocumentos(payload),
  })
}
```

---

## `Frontend/src/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-modulo-page.tsx`

```tsx
import { useMemo, useState } from 'react'
import { Check, CloudUpload, Plus, RotateCw, X } from 'lucide-react'
import { PageHead } from '@/components/shared/page-head'
import { DashboardPageContainer } from '@/components/shared/dashboard-page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAreaComumEntityListPermissions } from '@/hooks/use-area-comum-entity-list-permissions'
import { handleApiResponse } from '@/utils/response-handlers'
import { toast } from '@/utils/toast-utils'
import type { AdseComunicacaoModulo } from '@/types/dtos/faturacao/adse-comunicacao.dtos'
import {
  ADSE_PERM_ID,
  useAdseComunicacaoPaginatedQuery,
  useAdsePreFaturasAbertasQuery,
} from '../queries/adse-comunicacao-queries'
import {
  useComunicarAdseDocumentosMutation,
  useCriarAdsePreFaturaMutation,
} from '../queries/adse-comunicacao-mutations'
import { adseComunicacaoPageTitle, ADSE_TIPO_PRE_FATURA } from '../adse-modulo-config'

type Props = { modulo: AdseComunicacaoModulo }

export function ComunicacaoAdseModuloPage({ modulo }: Props) {
  const title = adseComunicacaoPageTitle(modulo)
  const { canView } = useAreaComumEntityListPermissions(ADSE_PERM_ID)
  const [devolucoes, setDevolucoes] = useState(false)
  const [estadoCom, setEstadoCom] = useState('0')
  const [preFaturaOrdem, setPreFaturaOrdem] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  const filter = useMemo(
    () => ({
      pageNumber: 1,
      pageSize: 50,
      sorting: [] as { id: string; desc: boolean }[],
      devolucoes,
      estadoComunicacao: Number(estadoCom) || null,
      numOrdemPreFatura: preFaturaOrdem ? Number(preFaturaOrdem) : null,
    }),
    [devolucoes, estadoCom, preFaturaOrdem],
  )

  const listQuery = useAdseComunicacaoPaginatedQuery(modulo, filter, canView)
  const preFaturasQuery = useAdsePreFaturasAbertasQuery(modulo)
  const criarPf = useCriarAdsePreFaturaMutation(modulo)
  const comunicar = useComunicarAdseDocumentosMutation()

  const linhas = listQuery.data?.info?.data?.linhas ?? []
  const totais = listQuery.data?.info?.data
  const preFaturas = preFaturasQuery.data?.info?.data ?? []

  const executarOperacao = async (operacao: number) => {
    if (!preFaturaOrdem) {
      toast.error('Selecione uma pré-fatura.')
      return
    }
    const payload = {
      tipoPreFatura: ADSE_TIPO_PRE_FATURA[modulo],
      numOrdemPreFatura: Number(preFaturaOrdem),
      operacao,
      devolucoes,
      linhas: linhas
        .filter((l) => selected.includes(l.id))
        .map((l) => ({
          origemClinicaId: l.origemClinicaId,
          documentoId: l.documentoId,
          numeroFatura: l.numeroFatura,
        })),
    }
    const res = await comunicar.mutateAsync(payload)
    handleApiResponse(res, {
      onSuccess: () => { toast.success('Operação concluída.'); listQuery.refetch() },
      onError: (msg) => toast.error(msg),
    })
  }

  if (!canView) return null

  return (
    <DashboardPageContainer>
      <PageHead title={title} />
      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2'>
          <CardTitle>{devolucoes ? 'Devoluções' : 'Pré-Faturas'}</CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Button variant='outline' size='sm' onClick={() => setDevolucoes((v) => !v)}>
              {devolucoes ? 'Pré-Faturas' : 'Devoluções'}
            </Button>
            <Button variant='outline' size='sm' onClick={() => listQuery.refetch()}>
              <RotateCw className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={() => criarPf.mutate()}>
              <Plus className='mr-1 h-4 w-4' /> Nova pré-fatura
            </Button>
            <Button size='sm' onClick={() => executarOperacao(1)}>
              <Check className='mr-1 h-4 w-4' /> Validar
            </Button>
            <Button size='sm' className='bg-emerald-600 hover:bg-emerald-700' onClick={() => executarOperacao(2)}>
              <CloudUpload className='mr-1 h-4 w-4' /> Comunicar
            </Button>
            <Button size='sm' variant='destructive' onClick={() => executarOperacao(3)}>
              <X className='mr-1 h-4 w-4' /> Eliminar
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <Select value={estadoCom} onValueChange={setEstadoCom}>
              <SelectTrigger><SelectValue placeholder='Estado Com.' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='0'>Todos</SelectItem>
                <SelectItem value='1'>Por Comunicar s/ PDF</SelectItem>
                <SelectItem value='2'>Por Comunicar c/ PDF</SelectItem>
                <SelectItem value='3'>Comunicado</SelectItem>
                <SelectItem value='4'>Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={preFaturaOrdem} onValueChange={setPreFaturaOrdem}>
              <SelectTrigger><SelectValue placeholder='N. Pré-Fatura' /></SelectTrigger>
              <SelectContent>
                {preFaturas.map((p) => (
                  <SelectItem key={p.id} value={String(p.numOrdem)}>{p.codigo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b bg-muted/50 text-left'>
                  <th className='p-2' />
                  <th className='p-2'>Utente</th>
                  <th className='p-2'>Nº FR</th>
                  <th className='p-2'>Val. FR</th>
                  <th className='p-2'>Val. ADSE</th>
                  <th className='p-2'>Pré-Fatura</th>
                  <th className='p-2'>Estado</th>
                  <th className='p-2'>Erros</th>
                </tr>
              </thead>
              <tbody>
                {linhas.length === 0 ? (
                  <tr><td colSpan={8} className='p-6 text-center text-muted-foreground'>Não existem dados a apresentar</td></tr>
                ) : linhas.map((row) => (
                  <tr key={row.id} className='border-b'>
                    <td className='p-2'>
                      <input type='checkbox' checked={selected.includes(row.id)}
                        onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, row.id] : prev.filter((id) => id !== row.id))} />
                    </td>
                    <td className='p-2'>{row.utenteNome}</td>
                    <td className='p-2'>{row.numeroFatura}</td>
                    <td className='p-2'>{row.valorFatura.toFixed(2)}</td>
                    <td className='p-2'>{row.valorAdse.toFixed(2)}</td>
                    <td className='p-2'>{row.preFatura ?? ''}</td>
                    <td className='p-2'>{row.estadoDescricao}</td>
                    <td className='p-2 text-destructive'>{row.erros ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='grid grid-cols-2 gap-2 text-sm md:grid-cols-4'>
            <div>Total FR (Pág): {totais?.totalFaturaPagina?.toFixed(2) ?? '0.00'}</div>
            <div>Total FR: {totais?.totalFatura?.toFixed(2) ?? '0.00'}</div>
            <div>Total ADSE (Pág): {totais?.totalAdsePagina?.toFixed(2) ?? '0.00'}</div>
            <div>Total ADSE: {totais?.totalAdse?.toFixed(2) ?? '0.00'}</div>
          </div>
        </CardContent>
      </Card>
    </DashboardPageContainer>
  )
}
```

---

## `Frontend/src/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-tratamentos-page.tsx`

```tsx
import { ComunicacaoAdseModuloPage } from './comunicacao-adse-modulo-page'
export function ComunicacaoAdseTratamentosPage() {
  return <ComunicacaoAdseModuloPage modulo='tratamentos' />
}
```

---

## `Frontend/src/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-consultas-page.tsx`

```tsx
import { ComunicacaoAdseModuloPage } from './comunicacao-adse-modulo-page'
export function ComunicacaoAdseConsultasPage() {
  return <ComunicacaoAdseModuloPage modulo='consultas' />
}
```

---

## `Frontend/src/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-exames-page.tsx`

```tsx
import { ComunicacaoAdseModuloPage } from './comunicacao-adse-modulo-page'
export function ComunicacaoAdseExamesPage() {
  return <ComunicacaoAdseModuloPage modulo='exames' />
}
```

---

# FRONTEND — Ficheiros a ALTERAR

---

## `Frontend/src/lib/services/faturacao/adse-service/index.ts`

Substituir conteúdo por:

```typescript
import { AdseClient } from './adse-client'
import { AdseComunicacaoClient } from './adse-comunicacao-client'

export const AdseService = (idFuncionalidade = '') => new AdseClient(idFuncionalidade)
export const AdseComunicacaoService = (idFuncionalidade = '') =>
  new AdseComunicacaoClient(idFuncionalidade)
```

---

## `Frontend/src/config/menu-items.ts`

Substituir o bloco `label: 'ADSE'` (linhas ~460–471) por:

```typescript
      {
        label: 'ADSE',
        href: '/area-financeira/faturacao/adse/tratamentos',
        funcionalidadeId: modules.areaFinanceira.permissions.adse.id,
        items: [
          {
            label: 'Comunicação de Faturas',
            href: '/area-financeira/faturacao/adse/tratamentos',
            funcionalidadeId: modules.areaFinanceira.permissions.adse.id,
            items: [
              {
                label: 'Tratamentos',
                href: '/area-financeira/faturacao/adse/tratamentos',
                funcionalidadeId: modules.areaFinanceira.permissions.adse.id,
              },
              {
                label: 'Consultas',
                href: '/area-financeira/faturacao/adse/consultas',
                funcionalidadeId: modules.areaFinanceira.permissions.adse.id,
              },
              {
                label: 'Exames',
                href: '/area-financeira/faturacao/adse/exames',
                funcionalidadeId: modules.areaFinanceira.permissions.adse.id,
              },
            ],
          },
          {
            label: 'Configurações',
            href: '/area-financeira/faturacao/adse/configuracoes',
            funcionalidadeId: modules.areaFinanceira.permissions.adse.id,
          },
        ],
      },
```

---

## `Frontend/src/routes/area-financeira/areaFinanceira.tsx`

**1.** Após o lazy de `ConfigAdsePage` (~linha 41), adicionar:

```typescript
const ComunicacaoAdseTratamentosPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-tratamentos-page').then(
    (m) => ({ default: m.ComunicacaoAdseTratamentosPage }),
  ),
)
const ComunicacaoAdseConsultasPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-consultas-page').then(
    (m) => ({ default: m.ComunicacaoAdseConsultasPage }),
  ),
)
const ComunicacaoAdseExamesPage = lazy(() =>
  import('@/pages/area-financeira/faturacao/adse/pages/comunicacao-adse-exames-page').then(
    (m) => ({ default: m.ComunicacaoAdseExamesPage }),
  ),
)
```

**2.** Após a rota `configuracoes` (~linha 520), adicionar:

```typescript
  {
    path: 'area-financeira/faturacao/adse/tratamentos',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <ComunicacaoAdseTratamentosPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação ADSE - Tratamentos',
  },
  {
    path: 'area-financeira/faturacao/adse/consultas',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <ComunicacaoAdseConsultasPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação ADSE - Consultas',
  },
  {
    path: 'area-financeira/faturacao/adse/exames',
    element: (
      <LicenseGuard
        requiredModule={modules.areaFinanceira.id}
        requiredPermission={modules.areaFinanceira.permissions.adse.id}
        actionType={actionTypes.AuthVer}
      >
        <ComunicacaoAdseExamesPage />
      </LicenseGuard>
    ),
    manageWindow: true,
    windowName: 'Faturação ADSE - Exames',
  },
```

---

## Checklist pós-implementação

- [ ] `dotnet build` sem erros
- [ ] Migration F23 aplicada
- [ ] Config ADSE com organismo + `PastaPdfAdse`
- [ ] Listagem TA/CA com dados
- [ ] Criar pré-fatura → aparece `TA1` no dropdown
- [ ] Validar/Comunicar com stub (mensagem F4 esperada)
- [ ] Menu 3 ecrãs + configurações

## Fora de scope (dia seguinte)

- F4: `AdseSoapClient` real (`wsADSE`)
- F5: fecho pré-fatura + conferência
- F7: listagem EX
- F8: `ValorAdse` = VALOR_ORG (linhas documento)
