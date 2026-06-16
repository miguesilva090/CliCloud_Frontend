# Implementação — Pagamentos (Condição + Modo de Pagamento)

**Data:** 2026-06-15  
**Âmbito:** submenu **Faturação → Tabelas → Pagamentos** (2 itens de menu) + integração em documentos e entidades relacionadas  
**Menu (único escopo de ecrãs novos):**

```
Pagamentos
  ├── Condições de Pagamento
  └── Modos de Pagamento
```

Integração fora do submenu (sem páginas novas): `Documento`, `Organismo`, `Fornecedor`, `Empresa`.  
**Raiz do projeto:** `c:\Users\Globalsoft_ryzen_02\Desktop\New\newCC\`

> **Princípio directriz:** as tabelas do legado **não replicam** a estrutura do projeto novo (PK composta `int` → **`Id` Guid**). O objectivo é **transpor a lógica de negócio** do legado para o padrão do sistema novo (`Moeda`, `MotivoRetencao`, `TipoDocumento`), não clonar o schema `COND_PAG` / `TMOD_PAG`.

---

## 1. Contexto (legado vs novo)

### 1.1 O que o legado tem

No legado, **Pagamentos** não são enums fixos. São **tabelas configuráveis por empresa de faturação** (`filtro` = empresa / `SessionManager.Empresa`).

| # | Menu legado | Ecrã | Tabela SQL | Ficheiro dados |
|---|-------------|------|------------|----------------|
| 1 | Condição de Pagamento | `CondicaoPagamentoLst.aspx` | `dbo.COND_PAG` | `Dados/CliCloud.Dados.Faturacao/CondicaoPagamento.cs` |
| 2 | Modos de Pagamento | `ModoPagamentoLst.aspx` | `dbo.TMOD_PAG` | `Dados/CliCloud.Dados.Faturacao/TipoModoPagamento.cs` |

**Fora do menu** (não é terceiro ecrã): `Base.TipoPagamento` — lista fixa de códigos SAFT usada **só no modal** de Modos de Pagamento para o campo Abreviatura (`ModoPagamentoLst.aspx.cs` → `TipoPagamentoBase.ObterTodos()`). No novo: constante partilhada BE/FE, **sem tabela nem CRUD**.

**Menu** (`CliCloud.ASPcli/Services/WSMenus.asmx.cs`, ~1829–1833):

```
Faturação → Tabelas → Pagamentos
  ├── Condição de Pagamento → CondicaoPagamentoLst.aspx
  └── Modos de Pagamento    → ModoPagamentoLst.aspx
```

### 1.2 Condição de pagamento (`COND_PAG`)

| Campo legado | Tipo | Uso |
|--------------|------|-----|
| `codigo` | int | PK com `filtro`; `MAX+1` por empresa (`GeraMaximo`) |
| `filtro` | int | Empresa faturação |
| `descricao` | string(30) | Obrigatório |
| `n_dias_pgt` | int? | Dias até vencimento |
| `desconto` | double? | Desconto % na condição (coluna grelha) |

**Lógica fatura** (`CliCloud.ASPcli/Client/Faturacao/TfaturaEdt.js` → `onChangeCondPagamento`):

- Só em documento **novo** (`oper == 'add'`).
- AJAX `WSFaturacao.asmx/CondicaoPagamentoEdtLoad` → lê `N_dias_pgt`.
- `DataVencPagVenda` = data documento + N dias.

**Nota:** `desconto` na tabela **≠** `DescontoPagamento` do documento (`TFatura.DescontoPagamento` é campo separado no cabeçalho).

### 1.3 Modo de pagamento (`TMOD_PAG`)

| Campo legado | Tipo | Uso |
|--------------|------|-----|
| `c_modpag` | int | PK com `filtro`; `MAX+1` por empresa |
| `filtro` | int | Empresa |
| `descricao` | string(50) | Ex.: «Multibanco» |
| `Abreviatura` | string(3) | **Código SAFT/AT** (NU, MB, TB, CH, CC, CD, CS, LC, PR, TR) |
| `TemNumAssociado` | int? | 1 → exige nº cheque + pré-datado na fatura |
| `TemContaBancaria` | int? | 1 → exige conta bancária na fatura |
| `CodigoContaBancaria` | int? | Conta default (`Base.ContaBancaria`) |
| `Historico` | int? | 0=ativo; 1=histórico (oculto no autocomplete) |

**Seed legado** (`TipoModoPagamento.LoadDefaultData`) — 10 modos por empresa:

| c_modpag | Abrev | Descrição | TemNumAssociado | TemContaBancaria |
|----------|-------|-----------|-----------------|------------------|
| 1 | CC | Cartão crédito | 0 | 0 |
| 2 | CD | Cartão débito | 0 | 0 |
| 3 | CH | Cheque | 1 | 1 |
| 4 | CS | Compensação de saldos em conta corrente | 0 | 0 |
| 5 | LC | Letra comercial | 0 | 0 |
| 6 | MB | Multibanco | 0 | 1 |
| 7 | NU | Numerário | 0 | 0 |
| 8 | PR | Permuta | 0 | 0 |
| 9 | TB | Transferência bancária | 0 | 1 |
| 10 | TR | Ticket restaurante | 0 | 0 |

**Lógica fatura** (`TfaturaEdt.js` → `onChangeModoPagamento`):

- AJAX `TipoModoPagamentoEdtLoad` → flags + conta default.
- Se `TemContaBancaria` → mostra combobox `ContaBancaria` (não banco/instituição).
- Se `TemNumAssociado` → mostra `NumeroCheque`, `PreDatado`, `DataVencimento` (cheque).
- `onChangePreDatado` → data vencimento cheque só visível se pré-datado.

**Histórico:** `SetHistorico(c_modpag, filtro, bool)` — autocomplete (`Procurar`) filtra `Historico=0`.

**Label autocomplete:** `Descricao (Abreviatura)` — propriedade `Autocomplete` na entidade legado.

### 1.4 Abreviatura SAFT (campo do Modo — não é módulo à parte)

No legado, `Base.TipoPagamento` **não tem menu**. Serve apenas para popular o combobox **Abreviatura** ao criar/editar um modo (`ModoPagamentoLst.aspx.cs`).

No novo:

- Valor persistido: coluna **`AbreviaturaSaft`** (string 3) em `Utility.ModoPagamento` — como `TMOD_PAG.Abreviatura` no legado.
- Opções do combobox: **lista fixa** partilhada (BE + FE), sem entidade `TipoPagamentoSaft`, sem tabela, sem controller dedicado.
- Validação no `ModoPagamentoService`: `AbreviaturaSaft` deve estar na lista permitida.

```csharp
// Backend/CliCloud.Domain/Constants/AbreviaturasPagamentoSaft.cs (exemplo)
public static readonly IReadOnlyList<(string Codigo, string Descricao)> Todos =
[
    ("CC", "Cartão de crédito"),
    ("CD", "Cartão de débito"),
    ("CH", "Cheque"),
    ("CS", "Compensação de saldos em conta corrente"),
    ("LC", "Letra comercial"),
    ("MB", "Multibanco"),
    ("NU", "Numerário"),
    ("PR", "Permuta"),
    ("TB", "Transferência bancária"),
    ("TR", "Ticket restaurante"),
];
```

Endpoint opcional (no **ModoPagamentoController**, não módulo separado):

```
GET client/pagamentos/ModoPagamento/abreviaturas-saft
```

### 1.5 Onde são usados no legado

**MVP (este documento, grupos B–M):**

| Consumidor | O que precisa no novo |
|------------|----------------------|
| `TFatura` / `Documento` | FK condição + modo + conta + cheque + vencimento + `DescontoPagamento` |
| `TfaturaEdt.js` | Comboboxes Guid, vencimento auto, flags dinâmicas |
| `Institui` / Organismo | FK defaults na fatura |
| `Fornecedores` / `Empresa` | FK defaults |
| Tabelas Pagamentos (menu) | CRUD condição + modo |

**Fase 2 (Grupo N — fora do MVP):**

| Consumidor | Nota |
|------------|------|
| Admissões / Tratamentos / `ConfigModalidades` | FKs nos requests / config modalidades |
| `ContaCorrenteOrganismoEdt.js` | Condição → vencimento em CC |
| `CredenciaisSnsLst.js` | Modo obrigatório |
| Liquidação utente/organismo | Modo + conta |
| `ChequePredatadoRecebido` (tesouraria) | Cheque pré-datado além dos campos no documento |
| `FicheiroSaft.cs` / relatórios Crystal | `AbreviaturaSaft` no export/joins |
| `EditarModoPagamentoFatura` | Alterar modo em doc emitido |

### 1.6 Validação legado emissão (`TFatura.cs`, ~2099–2140)

Para **FR / Adiantamento / FSR** (`FaturaRecibo`, `Adiantamento`, `FaturaSimplificadaRecibo`):

1. `TipoModoPagamento` obrigatório e deve existir na empresa.
2. Se `TemContaBancaria == 1` → `ContaBancaria.Codigo` obrigatório e válido.
3. Se `TemNumAssociado == 1` → `NumeroCheque` obrigatório; se pré-datado → `DataVencimento` obrigatória.
4. `DataVencPagVenda` obrigatória e ≥ data documento.

### 1.7 Estado actual no projeto novo (gap)

| Aspecto | Legado | Novo (actual) | Acção |
|---------|--------|---------------|-------|
| Armazenamento | Tabelas por empresa | Enums `CondicaoPagamento` (7) e `TipoModoPagamento` (8) | **Substituir por entidades BD** |
| CRUD tabelas | Sim | Não | Implementar |
| Menu Pagamentos | Sim | Não | Adicionar |
| Abreviatura SAFT | Por registo | Não existe | Campo em `ModoPagamento` |
| Flags cheque/conta | Dinâmicas na BD | `modoPagamentoRequerBanco(2\|3\|4)` hardcoded | Usar flags da entidade |
| Conta na fatura | `ContaBancaria` (Guid no novo) | `BancoId` (instituição) | Adicionar `ContaBancariaId` |
| Cheque | `NumeroCheque`, pré-datado | Não existe | Novos campos no `Documento` |
| Vencimento auto | Condição → N dias | Manual | Implementar no editor |
| Histórico modo | Sim | N/A | Campo `Historico` + acções |
| Herança organismo | Sim | BE tem enum; FE não herda | FK + patch no editor |
| `GetOpcoesPagamento` | N/A (vem da BD) | Devolve enums (`DocumentoEmissaoService.cs`) | Carregar da BD por clínica |
| Liquidação / CC | Completo | Parcial | Fase posterior (preparar campos) |
| PK / FK | `(codigo, filtro)` int composto | **`Id` Guid** + FK `*Id` Guid | Ver secção **1.9** |

### 1.8 ⚠️ Incompatibilidade enums novo ≠ legado

**Não usar enums actuais para migração de dados.**

| Novo enum `TipoModoPagamento` | Valor | Legado `c_modpag` | Legado Abrev |
|-------------------------------|-------|-------------------|--------------|
| Dinheiro | 1 | 7 | NU |
| TransferenciaBancaria | 2 | 9 | TB |
| Cheque | 3 | 3 | CH |
| Multibanco | 4 | 6 | MB |
| CartaoCredito | 5 | 1 | CC |
| CartaoDebito | 6 | 2 | CD |
| DebitoDireto | 7 | — | — |
| Outro | 8 | — | — |

**Faltam no enum novo:** CS, LC, PR, TR (existem no legado).

| Novo enum `CondicaoPagamento` | Valor | Legado |
|-------------------------------|-------|--------|
| AVista … Outro | 1–7 | Códigos **configuráveis** por empresa (não fixos) |

### 1.9 Mapeamento estrutural legado → novo (PK Guid)

**As tabelas do legado não batem certo com o novo em termos de PK.** No legado a chave é composta (`codigo` + `filtro` ou `c_modpag` + `filtro`). No novo a PK é sempre **`Id` UNIQUEIDENTIFIER**. Excepto essa diferença estrutural, transpõe-se **toda a lógica** relevante do legado.

#### O que muda estruturalmente

| Aspecto | Legado | Novo |
|---------|--------|------|
| **PK** | Composta: `(codigo, filtro)` ou `(c_modpag, filtro)` | **`Id` Guid** |
| **Âmbito** | `filtro` (int empresa) | **`ClinicaId` (Guid)** |
| **Código sequencial** | Parte da PK | Campo **`Codigo` (int)** — negócio + migração, **não é PK** |
| **FK documento** | `CodigoCondicaoPagamento`, `CodigoTipoModoPagamento` (int) | **`CondicaoPagamentoId`, `ModoPagamentoId` (Guid?)** |
| **Conta default modo** | `CodigoContaBancaria` (int) | **`ContaBancariaId` (Guid?)** |
| **Abreviatura SAFT** | `TMOD_PAG.Abreviatura` + lookup `Base.TipoPagamento` no modal | **`AbreviaturaSaft` string** em `ModoPagamento` + lista fixa no combobox |

#### O que se mantém (lógica, não estrutura)

| Lógica legado | Como fica no novo |
|---------------|-------------------|
| CRUD por empresa/clínica | `ClinicaId` + `ICurrentClinicaService` |
| `Codigo` auto `MAX+1` por âmbito | `MAX(Codigo)+1 WHERE ClinicaId = @id` |
| Condição → N dias → vencimento | `NDiasPagamento`; efeito no editor |
| Flags `TemContaBancaria` / `TemNumAssociado` | `bool` em `ModoPagamento` |
| Histórico de modos | `Historico` + passar/retirar |
| Autocomplete só activos | `Historico == false` |
| Label `Descricao (Abreviatura)` | DTO `autocompleteLabel` |
| Validação FR/FSR/Adiantamento | Validator com modo carregado por **Guid** |
| Herança organismo na fatura | FKs no organismo → patch no editor |
| Seed 10 modos por clínica | Migração F16 + ETL |
| Combobox Abreviatura no modal modo | Lista fixa `AbreviaturasPagamentoSaft` (BE/FE) |
| `desconto` condição ≠ `DescontoPagamento` doc | Campos separados |

#### Regra de ouro

1. **Toda a app nova** (API, FE, emissão, organismo, fornecedor) usa **`Guid`** (`Id` / `*Id`).
2. **`Codigo` (int)** — grelha, `MAX+1`, ponte migração `(ClinicaId, Codigo)`; **nunca** como FK.
3. Comboboxes faturação: `value = id` (Guid), como `MoedaId` / `MotivoIsencaoId` — **não** `codigo` int.

#### Ponte migração legado → novo

```
COND_PAG.codigo + filtro     →  CondicaoPagamento.Id (NEWID)
                                 + ClinicaId + Codigo (= codigo legado)

TMOD_PAG.c_modpag + filtro   →  ModoPagamento.Id (NEWID)
                                 + ClinicaId + Codigo (= c_modpag legado)

TFatura.CodigoCondicaoPagamento    →  Documento.CondicaoPagamentoId
  (lookup: ClinicaId + Codigo)

TFatura.CodigoTipoModoPagamento    →  Documento.ModoPagamentoId
  (lookup: ClinicaId + Codigo)
```

Tabela auxiliar opcional (só migração):

```sql
-- MapeamentoLegadoPagamentos (temporária)
-- Tipo: 'COND' | 'MOD'  |  ClinicaId, CodigoLegado INT, NovoId UNIQUEIDENTIFIER
```

### 1.10 Decisão de arquitectura (obrigatória)

1. **Dois ecrãs de menu** — Condições de Pagamento + Modos de Pagamento (como legado).
2. **Duas entidades** com `ClinicaId` e **PK `Guid`**: `CondicaoPagamento`, `ModoPagamento`.
3. **Schema** `Utility`; padrão `TipoDocumentoService` + `ICurrentClinicaService`.
4. **Abreviatura SAFT** — campo `AbreviaturaSaft` em `ModoPagamento` + lista fixa (sem tabela `TipoPagamentoSaft`).
5. **Documento / Organismo / Fornecedor / Empresa** — FK **`Guid?`**; remover enums.
6. **Seed + ETL** por clínica na migração F16.
7. **Todas as PK/FK de negócio são Guid** — sem excepções neste módulo.
8. **Foco:** paridade de **comportamento** legado; estrutura alinhada ao **projeto novo**.

### 1.11 Posição no mapa Tabelas Faturação

| Menu legado | Estado novo |
|-------------|-------------|
| Documentos (Natureza, Séries) | OK |
| Entidades Bancárias / Geográficas | Alias → área comum |
| Imposto | OK |
| Moedas | OK + alias financeira |
| **Pagamentos** | **❌ Este documento** |
| Serviços (3 sub-itens) | BE+FE área comum; faltam aliases |
| Zonas | Não implementado |
| Artigos | Não implementado |

---

## 2. Índice de ficheiros

| Grupo | Criar | Alterar |
|-------|-------|---------|
| **B** — Domínio + config EF | 3 | 2 |
| **C** — Backend CondicaoPagamento | 14 | 2 |
| **D** — Backend ModoPagamento (+ abreviaturas SAFT) | 17 | 2 |
| **F** — Migração BD + seed | 1 | 1 |
| **G** — Frontend CondicaoPagamento | 9 | 2 |
| **H** — Frontend ModoPagamento | 10 | 2 |
| **I** — Menu + rotas alias financeira | 0 | 4 |
| **J** — Migrar enums → FK (Documento, entidades) | 0 | ~30 |
| **K** — Faturação (editor + emissão) | 2 | 14 |
| **L** — Organismo / Fornecedor / Empresa | 0 | 10 |
| **M** — Script migração dados legado | 1 | 0 |
| **N** — Fase 2 (liquidação, CC, credenciais SNS, SAFT export) | — | — |

**Ordem de execução recomendada:**  
**B → F → C → D → G → H → I → J → K → L → M**

Não avançar **Grupo K** antes de **Grupo J** estar estável (breaking change coordenado BE+FE).

---

# GRUPO B — Domínio e EF

## B1. Criar entidades

| Ficheiro |
|----------|
| `Backend/CliCloud.Domain/Entities/Pagamentos/CondicaoPagamento.cs` |
| `Backend/CliCloud.Domain/Entities/Pagamentos/ModoPagamento.cs` |
| `Backend/CliCloud.Domain/Constants/AbreviaturasPagamentoSaft.cs` |

### B1.1 `CondicaoPagamento.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Common;

namespace CliCloud.Domain.Entities.Pagamentos;

[Table("CondicaoPagamento", Schema = "Utility")]
public class CondicaoPagamento : AuditableEntityWithSoftDelete
{
    [Key]
    public new Guid Id { get; set; }

    public Guid ClinicaId { get; set; }

    /// <summary>Código sequencial por clínica (legado: codigo). Não é PK — negócio + migração.</summary>
    public int Codigo { get; set; }

    [Required, StringLength(30)]
    public string Descricao { get; set; } = string.Empty;

    public int? NDiasPagamento { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Desconto { get; set; }
}
```

### B1.2 `ModoPagamento.cs`

```csharp
#nullable enable

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CliCloud.Domain.Entities.Bancos;
using CliCloud.Domain.Entities.Common;

namespace CliCloud.Domain.Entities.Pagamentos;

[Table("ModoPagamento", Schema = "Utility")]
public class ModoPagamento : AuditableEntityWithSoftDelete
{
    [Key]
    public new Guid Id { get; set; }

    public Guid ClinicaId { get; set; }

    /// <summary>Código sequencial por clínica (legado: c_modpag). Não é PK.</summary>
    public int Codigo { get; set; }

    [Required, StringLength(50)]
    public string Descricao { get; set; } = string.Empty;

    /// <summary>Código SAFT/AT (3 letras). Legado: Abreviatura.</summary>
    [Required, StringLength(3)]
    public string AbreviaturaSaft { get; set; } = string.Empty;

    public bool TemNumAssociado { get; set; }
    public bool TemContaBancaria { get; set; }

    public Guid? ContaBancariaId { get; set; }
    public ContaBancaria? ContaBancaria { get; set; }

    public bool Historico { get; set; }
}
```

### B1.3 `AbreviaturasPagamentoSaft.cs`

Lista fixa espelhando `Base.TipoPagamento` / seed dos 10 modos legado. Usada na validação do service e no combobox do modal FE (import partilhado ou endpoint `GET .../abreviaturas-saft`).

## B2. Configurations EF

| Ficheiro |
|----------|
| `Backend/CliCloud.Infrastructure/Persistence/Configurations/CondicaoPagamentoConfiguration.cs` |
| `Backend/CliCloud.Infrastructure/Persistence/Configurations/ModoPagamentoConfiguration.cs` |

```csharp
// CondicaoPagamentoConfiguration — exemplo
builder.HasIndex(x => new { x.ClinicaId, x.Codigo }).IsUnique();
builder.HasIndex(x => x.ClinicaId);

// ModoPagamentoConfiguration — exemplo
builder.HasIndex(x => new { x.ClinicaId, x.Codigo }).IsUnique();
builder.HasOne(x => x.ContaBancaria)
    .WithMany()
    .HasForeignKey(x => x.ContaBancariaId)
    .OnDelete(DeleteBehavior.Restrict);
```

**Notas EF:**

- **PK:** `Id` (Guid) em `CondicaoPagamento` e `ModoPagamento` — únicas tabelas novas deste módulo.
- **Índice único `(ClinicaId, Codigo)`:** substitui PK composta legado.
- **Códigos SAFT:** sem tabela; validados via `AbreviaturasPagamentoSaft` + coluna `AbreviaturaSaft`.

## B3. Alterar

| Ficheiro | Alteração |
|----------|-----------|
| `Backend/CliCloud.Infrastructure/Persistence/ApplicationDbContext.cs` | `DbSet<CondicaoPagamento>`, `DbSet<ModoPagamento>` |
| `Backend/CliCloud.Infrastructure/Mapper/MappingProfiles.cs` | Maps Create/Update/DTO para as 2 entidades |

---

# GRUPO C — Backend CondicaoPagamento

Espelhar `MoedaService` + filtro `ClinicaId` como `TipoDocumentoService`.

## C1. Service (criar pasta completa)

`Backend/CliCloud.Application/Services/Pagamentos/CondicaoPagamentoService/`

| Ficheiro | Responsabilidade |
|----------|------------------|
| `ICondicaoPagamentoService.cs` | Interface |
| `CondicaoPagamentoService.cs` | CRUD + `ICurrentClinicaService` |
| `DTOs/CondicaoPagamentoDTO.cs` | Detalhe |
| `DTOs/CondicaoPagamentoLightDTO.cs` | Autocomplete: **`id` (Guid)**, `codigo` (display), `descricao`, `nDiasPagamento` |
| `DTOs/CondicaoPagamentoTableDTO.cs` | Grelha |
| `DTOs/CreateCondicaoPagamentoRequest.cs` | |
| `DTOs/UpdateCondicaoPagamentoRequest.cs` | |
| `DTOs/DeleteMultipleCondicaoPagamentoRequest.cs` | |
| `Filters/CondicaoPagamentoTableFilter.cs` | `FiltroBox`, `CodigoDe/Ate`, `DescricaoDe/Ate` (paridade legado) |
| `Filters/CondicaoPagamentoAllFilter.cs` | |
| `Specifications/CondicaoPagamentoSearchList.cs` | `ClinicaId` + keyword |
| `Specifications/CondicaoPagamentoSearchTable.cs` | Filtros grelha |
| `Specifications/CondicaoPagamentoMatchDescricao.cs` | Unicidade descrição por clínica (opcional) |
| `Specifications/CondicaoPagamentoByCodigo.cs` | Próximo código = Max+1 por clínica |

## C2. Controller

`Backend/CliCloud.WebApi/Controllers/Pagamentos/CondicaoPagamentoController.cs`

```csharp
[Route("client/pagamentos/[controller]")]
[ApiController]
public class CondicaoPagamentoController(ICondicaoPagamentoService service) : ControllerBase
```

Endpoints (padrão `MotivoRetencaoController`):

```
GET           — light list (keyword)
GET  light    — idem explícito
POST paginated
POST all
GET  {id}
POST          — create
PUT  {id}     — update
DELETE {id}
DELETE        — bulk (body DeleteMultipleCondicaoPagamentoRequest)
```

## C3. DI

Registar scoped em ficheiro de DI do projeto (mesmo padrão `MoedaService` / `MotivoRetencaoService`):

```csharp
services.AddScoped<ICondicaoPagamentoService, CondicaoPagamentoService>();
```

## C4. Regras de negócio (paridade legado)

- `Codigo` auto-gerado no create (`MAX(Codigo)+1` por `ClinicaId`).
- `Descricao` obrigatória, max 30.
- Delete: verificar uso em `Documento`, `Organismo`, `Fornecedor`, `Empresa` → bloquear ou apenas soft-delete.
- `GetLight`: filtrar `ClinicaId` actual, ordenar por `Descricao`.
- Legado faz **hard delete**; no novo preferir soft-delete + validação de referências.

---

# GRUPO D — Backend ModoPagamento

`Backend/CliCloud.Application/Services/Pagamentos/ModoPagamentoService/`

Mesma estrutura que Grupo C, mais:

| Método extra | Legado |
|--------------|--------|
| `PassarHistoricoAsync(Guid id)` | `TipoModoPagamento.SetHistorico(..., true)` |
| `RetirarHistoricoAsync(Guid id)` | `SetHistorico(..., false)` |

**DTO Light** deve incluir:

- `id`, `codigo`, `descricao`, `abreviaturaSaft`
- `temNumAssociado`, `temContaBancaria`
- `contaBancariaId`, `contaBancariaNumero` (join, como legado `NumeroContaBancaria`)
- Propriedade calculada `autocompleteLabel` = `"{descricao} ({abreviaturaSaft})"` (paridade legado)

**Filtro grelha** (paridade `TipoModoPagamentoLst.GetListaSQL`):

- `Historico_Sim` / `Historico_Nao` (checkboxes)
- `C_modpagDe` / `C_modpagAte` → `CodigoDe` / `CodigoAte`
- `DescricaoDe` / `DescricaoAte`

**Validações save:**

- `AbreviaturaSaft` obrigatória; deve existir em `AbreviaturasPagamentoSaft.Todos`.
- Se `TemContaBancaria` e `ContaBancariaId` preenchido → validar conta existe.
- Registo em histórico: não editar campos (só retirar histórico).

## D1. Controller

`Backend/CliCloud.WebApi/Controllers/Pagamentos/ModoPagamentoController.cs`

Endpoints:

```
GET  abreviaturas-saft     — lista fixa { codigo, descricao } para o modal (opcional se FE importar constante)
POST {id}/historico/passar
POST {id}/historico/retirar
```

(+ CRUD padrão igual a `CondicaoPagamentoController`)

## D2. Specification autocomplete documento

`ModoPagamentoSearchListAtivos` — `ClinicaId` + `Historico == false` + keyword em `Descricao` / `AbreviaturaSaft`.

---

# GRUPO F — Migração BD

## F1. Pré-requisitos

```bash
# Parar dotnet run antes de migrar / rebuild
dotnet ef migrations add F16_Pagamentos_CondicaoModo \
  --project Backend/CliCloud.Infrastructure \
  --startup-project Backend/CliCloud.WebApi
```

**Lições anteriores:** não criar migração manual sem `.Designer.cs`; usar sempre `dotnet ef migrations add`.

## F2. Conteúdo `Up` (além das tabelas EF)

### F2.1 Seed `ModoPagamento` por clínica

Para **cada** `Core.Clinica` activa, inserir os 10 modos (`LoadDefaultData`).

```sql
-- Pseudocódigo: cursor sobre ClinicaId
INSERT INTO [Utility].[ModoPagamento]
  (Id, ClinicaId, Codigo, Descricao, AbreviaturaSaft, TemNumAssociado, TemContaBancaria, Historico, CreatedBy, CreatedOn)
VALUES
  (NEWID(), @ClinicaId, 1, N'Cartão crédito', N'CC', 0, 0, 0, @User, SYSUTCDATETIME()),
  -- ... codigos 2–10 conforme tabela secção 1.3
```

### F2.2 Seed `CondicaoPagamento` (sugestão inicial por clínica)

Consultar BD legado; se vazio, inserir típicas:

| Codigo | Descricao | NDiasPagamento | Desconto |
|--------|-----------|----------------|----------|
| 1 | À vista | 0 | 0 |
| 2 | 30 dias | 30 | 0 |
| 3 | 60 dias | 60 | 0 |
| 4 | 90 dias | 90 | 0 |

### F2.3 Alterar `Documentos.Documento`

**FKs são Guid** — os int legado (`CodigoCondicaoPagamento`, `CodigoTipoModoPagamento`) **não** ficam na tabela; só servem na migração via lookup `(ClinicaId + Codigo)`.

1. Adicionar colunas:
   - `CondicaoPagamentoId` (uniqueidentifier, null) → FK `Utility.CondicaoPagamento.Id`
   - `ModoPagamentoId` (uniqueidentifier, null) → FK `Utility.ModoPagamento.Id`
   - `ContaBancariaId` (uniqueidentifier, null)
   - `NumeroCheque` (nvarchar(40), null)
   - `PreDatado` (bit, default 0)
   - `DataVencimentoCheque` (datetime2, null)

2. Migrar dados — **resolver int legado → Guid** (nunca gravar int como FK):

```sql
-- A partir de TFatura / colunas enum temporárias — join por Codigo de negócio
UPDATE d SET d.ModoPagamentoId = m.Id
FROM [Documentos].[Documento] d
INNER JOIN [Utility].[ModoPagamento] m
  ON m.ClinicaId = d.ClinicaId AND m.Codigo = @CodigoLegado  -- ex.: 7 = NU
WHERE d.TipoModoPagamento IS NOT NULL;  -- coluna enum a remover
```

3. Remover colunas `CondicaoPagamento`, `TipoModoPagamento` (int enum).

4. FK constraints:

```sql
ALTER TABLE [Documentos].[Documento] ADD CONSTRAINT FK_Documento_CondicaoPagamento
  FOREIGN KEY (CondicaoPagamentoId) REFERENCES [Utility].[CondicaoPagamento](Id);
ALTER TABLE [Documentos].[Documento] ADD CONSTRAINT FK_Documento_ModoPagamento
  FOREIGN KEY (ModoPagamentoId) REFERENCES [Utility].[ModoPagamento](Id);
```

### F2.4 Alterar entidades com enums

| Tabela | Alteração |
|--------|-----------|
| `Organismos.Organismo` | `CondicaoPagamentoId`, `ModoPagamentoId` (Guid?) |
| `Fornecedores.Fornecedor` | idem |
| `Empresas.Empresa` | idem (se aplicável) |

Remover properties enum + actualizar `FornecedorConfiguration.cs` etc.

### F2.5 Remover enums do código

Após migração e compilação limpa:

- `Backend/CliCloud.Domain/Enums/CondicaoPagamento.cs`
- `Backend/CliCloud.Domain/Enums/TipoModoPagamento.cs`

Actualizar **todas** as referências (DTOs, services, FE types).

---

# GRUPO G — Frontend Condição de Pagamento

Espelhar `Frontend/src/pages/area-comum/tabelas/tabelas/moedas/` ou `motivo-retencao/`.

## G1. Estrutura de pastas

```
Frontend/src/pages/area-comum/tabelas/tabelas/pagamentos/condicao-pagamento/
  pages/listagem-condicoes-pagamento-page.tsx
  components/listagem-condicoes-pagamento-table.tsx
  components/listagem-condicoes-pagamento-table.columns.tsx
  components/listagem-condicoes-pagamento-filter-controls.tsx
  modals/condicao-pagamento-view-create-modal.tsx
  queries/listagem-condicoes-pagamento-queries.ts
```

## G2. DTOs e service

| Ficheiro |
|----------|
| `Frontend/src/types/dtos/pagamentos/condicao-pagamento.dtos.ts` |
| `Frontend/src/lib/services/pagamentos/condicao-pagamento-service/condicao-pagamento-client.ts` |
| `Frontend/src/lib/services/pagamentos/condicao-pagamento-service/index.ts` |

```typescript
const BASE = '/client/pagamentos/CondicaoPagamento'
```

Padrão `moeda-client.ts`: `getLight`, `getPaginated`, `getById`, `create`, `update`, `delete`, `deleteMultiple`.

## G3. Grelha (colunas legado `CondicaoPagamentoLst`)

| Coluna | Campo |
|--------|-------|
| Número | `codigo` |
| Descrição | `descricao` |
| N.º Dias | `nDiasPagamento` |
| Desconto | `desconto` |

## G4. Modal

| Campo | Notas |
|-------|-------|
| Código | read-only após create |
| Descrição | obrigatório, max 30 |
| N.º dias pagamento | int |
| Desconto % | decimal |

## G5. Rotas área comum

`Frontend/src/routes/area-comum/areaComum.tsx`:

```tsx
path: 'area-comum/tabelas/tabelas/pagamentos/condicoes-pagamento'
component: ListagemCondicoesPagamentoPage
permission: modules.areaComum.permissions.condicoesPagamento.id
```

---

# GRUPO H — Frontend Modo de Pagamento

```
Frontend/src/pages/area-comum/tabelas/tabelas/pagamentos/modo-pagamento/
  pages/listagem-modos-pagamento-page.tsx
  components/...
  modals/modo-pagamento-view-create-modal.tsx
  queries/listagem-modos-pagamento-queries.ts
```

## H1. Grelha (colunas legado `ModoPagamentoLst`)

| Coluna | Campo |
|--------|-------|
| Código | `codigo` |
| Descrição | `descricao` |
| Tipo (SAFT) | `abreviaturaSaft` |
| Histórico | `historico` → Ativo/Inativo |

Filtros: checkbox Ativo / Inativo (histórico).

## H2. Modal

| Campo | Tipo | Notas |
|-------|------|-------|
| Código | read-only | |
| Descrição | text | obrigatório, max 50 |
| Abreviatura SAFT | combobox | Lista fixa `AbreviaturasPagamentoSaft` (FE) ou `GET .../ModoPagamento/abreviaturas-saft` |
| Tem n.º associado | switch | legado `TemNumAssociado` |
| Tem conta bancária | switch | legado `TemContaBancaria` |
| Conta bancária | AsyncCombobox | só se switch activo; service `ContaBancaria` área comum |

## H3. Acções de linha

- Ver / Editar / Apagar (se não histórico e sem referências)
- **Passar a histórico** / **Retirar do histórico** (menu contextual)

## H4. Service e constante SAFT

`Frontend/src/lib/services/pagamentos/modo-pagamento-service/`

`Frontend/src/constants/abreviaturas-pagamento-saft.ts` — espelho da lista BE (ou consumir só o endpoint `abreviaturas-saft`).

```typescript
passarHistorico(id: string)
retirarHistorico(id: string)
```
```

---

# GRUPO I — Menu e rotas área financeira

## I1. Permissões

`Frontend/src/config/modules/common/area-comum-module.ts`:

```typescript
condicoesPagamento: {
  id: '00000002-0000-0000-0052-000000000003', // novo GUID — sincronizar com BE licenças
  name: 'Condições de Pagamento',
},
modosPagamento: {
  id: '00000002-0000-0000-0053-000000000003',
  name: 'Modos de Pagamento',
},
```

## I2. `Frontend/src/config/menu-items.ts`

**Área Financeira → Tabelas** — após **Moedas**, adicionar submenu **Pagamentos**:

```typescript
{
  label: 'Pagamentos',
  href: '#',
  funcionalidadeId: modules.areaFinanceira.permissions.tabelas.id,
  items: [
    {
      label: 'Condições de Pagamento',
      href: '/area-financeira/faturacao/tabelas/pagamentos/condicoes-pagamento',
      funcionalidadeId: modules.areaComum.permissions.condicoesPagamento.id,
      funcionalidadeFallbackIds: [modules.areaFinanceira.permissions.tabelas.id],
    },
    {
      label: 'Modos de Pagamento',
      href: '/area-financeira/faturacao/tabelas/pagamentos/modos-pagamento',
      funcionalidadeId: modules.areaComum.permissions.modosPagamento.id,
      funcionalidadeFallbackIds: [modules.areaFinanceira.permissions.tabelas.id],
    },
  ],
},
```

**Área Comum → Tabelas** — mesmo par com prefixo `/area-comum/tabelas/tabelas/pagamentos/...`.

## I3. `Frontend/src/routes/area-financeira/areaFinanceira.tsx`

Alias (padrão Moedas, ~linha 530):

```tsx
{
  path: 'area-financeira/faturacao/tabelas/pagamentos/condicoes-pagamento',
  lazy: () => import('@/pages/area-comum/tabelas/tabelas/pagamentos/condicao-pagamento/pages/listagem-condicoes-pagamento-page'),
},
{
  path: 'area-financeira/faturacao/tabelas/pagamentos/modos-pagamento',
  lazy: () => import('@/pages/area-comum/tabelas/tabelas/pagamentos/modo-pagamento/pages/listagem-modos-pagamento-page'),
},
```

## I4. `Frontend/src/routes/area-comum/areaComum.tsx`

Rotas canónicas na área comum (idem estrutura moedas).

---

# GRUPO J — Migrar enums → FK (breaking change coordenado)

## J1. Backend — entidades

| Ficheiro | Alteração |
|----------|-----------|
| `Backend/CliCloud.Domain/Entities/Documentos/Documento.cs` | FKs + campos cheque |
| `Backend/CliCloud.Domain/Entities/Organismos/Organismo.cs` | FKs |
| `Backend/CliCloud.Domain/Entities/Fornecedores/Fornecedor.cs` | FKs |
| `Backend/CliCloud.Domain/Entities/Empresas/Empresa.cs` | FKs |

### J1.1 `Documento.cs` — secção Pagamento (substituir)

```csharp
// --- Pagamento ---
public Guid? CondicaoPagamentoId { get; set; }
public Entities.Pagamentos.CondicaoPagamento? CondicaoPagamento { get; set; }

public Guid? ModoPagamentoId { get; set; }
public Entities.Pagamentos.ModoPagamento? ModoPagamento { get; set; }

public Guid? ContaBancariaId { get; set; }
public ContaBancaria? ContaBancaria { get; set; }

[StringLength(40)]
public string? NumeroCheque { get; set; }

public bool PreDatado { get; set; }
public DateTime? DataVencimentoCheque { get; set; }

// Manter BancoId se ainda usado noutros fluxos; emissão FR prioriza ContaBancariaId
public Guid? BancoId { get; set; }
public Banco? Banco { get; set; }

public DateTime? DataVencimentoPagamento { get; set; }
public decimal? DescontoPagamento { get; set; }  // já existe
```

## J2. Backend — DTOs e requests

| Ficheiro |
|----------|
| `EmitirDocumentoRequest.cs` |
| `EmitirDocumentoDesdeAdmissaoRequest.cs` |
| `EmitirDocumentoDesdeConsultaRequest.cs` |
| `DocumentoDTO.cs` / light / table |
| `OrganismoDTO.cs`, `CreateOrganismoRequest`, `UpdateOrganismoRequest` |
| `FornecedorDTO.cs`, create/update |
| `EmpresaDTO.cs` (se aplicável) |
| `DocumentoEmissaoOpcoesPagamentoDTO.cs` |
| `PagamentoOpcaoDTO.cs` → evoluir para Guid |

### J2.1 `EmitirDocumentoRequest` — campos pagamento

```csharp
public Guid? CondicaoPagamentoId { get; set; }
public Guid? ModoPagamentoId { get; set; }
public Guid? ContaBancariaId { get; set; }
public string? NumeroCheque { get; set; }
public bool PreDatado { get; set; }
public DateTime? DataVencimentoCheque { get; set; }
// Remover: CondicaoPagamento?, TipoModoPagamento?, BancoId? (ou manter BancoId só se necessário)
```

## J3. Backend — services

| Ficheiro | Alteração |
|----------|-----------|
| `DocumentoEmissaoService.cs` | Persistir FKs; includes ModoPagamento para validação |
| `DocumentoService.cs` | DTOs com descrições join |
| `OrganismoService.cs` | FKs |
| `FornecedorService.cs` | FKs |
| `MappingProfiles.cs` | Maps novos |
| `DocumentoSearchTable.cs` | Filtros por descrição join |

## J4. `GetOpcoesPagamentoAsync` — substituir enums

Ficheiro actual (`DocumentoEmissaoService.cs`, ~34–50) usa `Enum.GetValues` — **substituir por:**

```csharp
public async Task<Response<DocumentoEmissaoOpcoesPagamentoDTO>> GetOpcoesPagamentoAsync()
{
    Guid? clinicaId = await ResolveClinicaIdAsync();
    if (!clinicaId.HasValue)
        return ResponseFactory.Fail<DocumentoEmissaoOpcoesPagamentoDTO>("Clínica não definida.");

    var condicoes = await _repository.GetListAsync<CondicaoPagamento, CondicaoPagamentoOpcaoDTO, Guid>(
        new CondicaoPagamentoSearchList("", clinicaId.Value));

    var modos = await _repository.GetListAsync<ModoPagamento, ModoPagamentoOpcaoDTO, Guid>(
        new ModoPagamentoSearchListAtivos("", clinicaId.Value));

    // TiposSerie, ImpostosRetencao, ReferenciasMb — manter como está
    ...
}
```

Novos DTOs:

```csharp
public class CondicaoPagamentoOpcaoDTO
{
    public Guid Id { get; set; }
    public string Descricao { get; set; } = "";
    public int? NDiasPagamento { get; set; }
}

public class ModoPagamentoOpcaoDTO : CondicaoPagamentoOpcaoDTO
{
    public string AbreviaturaSaft { get; set; } = "";
    public bool TemNumAssociado { get; set; }
    public bool TemContaBancaria { get; set; }
    public Guid? ContaBancariaId { get; set; }
    public string? ContaBancariaNumero { get; set; }
}
```

## J5. Frontend — tipos

`Frontend/src/pages/area-financeira/faturacao/types/documento-editor.types.ts`:

```typescript
// Substituir:
// condicaoPagamento?: number | null
// tipoModoPagamento?: number | null
// bancoId: string | null

condicaoPagamentoId: string | null
modoPagamentoId: string | null
contaBancariaId: string | null
numeroCheque: string | null
preDatado: boolean
dataVencimentoCheque: string | null
bancoId: string | null  // manter se ainda usado; deprecar na tab pagamento
```

Actualizar:

- `utils/map-documento-to-editor-state.ts`
- `types/dtos/faturacao/documento-emissao.dtos.ts`
- `types/dtos/saude/fornecedores.dtos.ts`
- `types/dtos/organismos/*.ts` (se existir enum)

---

# GRUPO K — Faturação (paridade `TfaturaEdt.js`)

## K1. Comboboxes no cabeçalho

Ficheiro: `components/documento-cabecalho-section.tsx`

Substituir `<Select>` com enums por `AsyncCombobox` com **`value`/`onChange` em Guid** (`condicaoPagamentoId`, `modoPagamentoId`) — nunca `codigo` int.

- `AsyncCombobox` condição → `useCondicoesPagamentoDocumento(keyword)`
- `AsyncCombobox` modo → `useModosPagamentoDocumento(keyword)` (só activos)

Queries em `queries/documento-editor-queries.ts`.

Label modo: `descricao (abreviaturaSaft)` — paridade `Autocomplete` legado.

## K2. `onChangeCondPagamento`

Em `documento-cabecalho-section.tsx` ou hook:

```typescript
// Ao seleccionar condicaoPagamentoId com nDiasPagamento definido:
// dataVencimentoPagamento = addDays(state.dataDocumento, nDias)
// Só se documento novo (não readOnly)
```

Espelhar legado: só `oper == 'add'`.

## K3. `onChangeModoPagamento` — novo componente

Criar `components/documento-pagamento-detalhe-section.tsx` (ou expandir `documento-tab-observacoes-banco-section.tsx`):

| Flag modo | UI |
|-----------|-----|
| `temContaBancaria` | `AsyncCombobox` → `ContaBancaria` |
| `temNumAssociado` | Input `numeroCheque`, switch `preDatado`, date `dataVencimentoCheque` |

**Remover** `modoPagamentoRequerBanco()` em `documento-cliente-utils.ts` (linhas 67–70) — substituir por flags do modo seleccionado (cache do item light ou fetch by id).

Ao mudar modo: pré-preencher `contaBancariaId` com default do modo (legado `SelectItem(data.NumeroContaBancaria, data.CodigoContaBancaria)`).

## K4. Herança ao seleccionar organismo

Legado (`TfaturaEdt.js`, ~1361–1380): `tipoCliente == "2"` (organismo):

```javascript
$("#modFldCodigoCondicaoPagamento").SelectItem(data.COND_PAG.Descricao, data.COND_PAG.Codigo);
$("#modFldCodigoModoPagamento").SelectItem(data.TMOD_PAG.Autocomplete, data.TMOD_PAG.C_modpag);
onChangeCondPagamento();
```

No novo: ao carregar organismo no editor (`documento-cliente-utils.ts` ou patch do hook):

```typescript
if (organismo.condicaoPagamentoId) patch({ condicaoPagamentoId: organismo.condicaoPagamentoId })
if (organismo.modoPagamentoId) patch({ modoPagamentoId: organismo.modoPagamentoId })
// disparar efeitos vencimento + detalhe pagamento
```

## K5. Validação emissão (backend)

`DocumentoEmissaoPerfilValidator.cs` — adicionar para **FR / FSR / Adiantamento** (abrevs legado):

```csharp
if (abrev is "FR" or "FSR" or "ADT" /* confirmar abrevs no TipoDocumento */)
{
    if (!request.ModoPagamentoId.HasValue)
        return "Modo de pagamento é obrigatório.";

    // Carregar modo (ou receber flags no request após validação no service)
    // TemContaBancaria → ContaBancariaId obrigatório
    // TemNumAssociado → NumeroCheque obrigatório
    // PreDatado → DataVencimentoCheque obrigatória
}

if (!request.DataVencimentoPagamento.HasValue)
    return "Data de vencimento de pagamento é obrigatória.";
```

Validação detalhada também em `DocumentoEmissaoService` antes de persistir (como `TFatura.cs`).

## K6. Persistência emissão

`DocumentoEmissaoService.cs` — todas as ocorrências de:

```csharp
documento.CondicaoPagamento = request.CondicaoPagamento;
documento.TipoModoPagamento = request.TipoModoPagamento;
documento.BancoId = request.BancoId;
```

Substituir por FKs + campos cheque. Incluir paths: emitir normal, desde admissão, desde consulta, duplicar documento (~1116).

## K7. Validação FE

`documento-editor.tsx` — toasts antes de emitir (espelhar BE).

## K8. Ficheiros FE a alterar

| Ficheiro |
|----------|
| `hooks/use-documento-editor.ts` |
| `types/documento-editor.types.ts` |
| `components/documento-cabecalho-section.tsx` |
| `components/documento-tab-observacoes-banco-section.tsx` |
| `components/documento-editor.tsx` |
| `utils/map-documento-to-editor-state.ts` |
| `utils/documento-cliente-utils.ts` |
| `queries/documento-editor-queries.ts` |
| `pages/novo-documento-page.tsx` |

## K9. Fase 2 — `EditarModoPagamentoFatura`

Endpoint `PATCH documentos/{id}/modo-pagamento` — actualizar modo/conta/cheque em documento emitido não liquidado + conta corrente (quando módulo liquidação activo).

---

# GRUPO L — Organismo, Fornecedor, Empresa

## L1. Backend

- DTOs: enums → `Guid? CondicaoPagamentoId`, `Guid? ModoPagamentoId`.
- Opcionalmente expor `condicaoPagamentoDescricao`, `modoPagamentoDescricao` no GET para UI.
- `OrganismoService` / `FornecedorService` — persistir FKs.

## L2. Frontend

| Página | Alteração |
|--------|-----------|
| Organismos — tab financeiro | Combobox condição + modo (light paginado) |
| Fornecedores — form/modal | Idem |
| Empresas (se aplicável) | Idem |

Reutilizar services `condicao-pagamento-client` e `modo-pagamento-client`.

---

# GRUPO M — Script migração dados legado (SQL Server)

Ficheiro: `Backend/Scripts/MigracaoLegado/Pagamentos_COND_PAG_TMOD_PAG.sql`

**Princípio:** o script **não preserva PKs legado**. Cada registo recebe `NEWID()`; a ponte é `(ClinicaId, CodigoLegado) → NovoId` para actualizar FKs em documentos/organismos/fornecedores.

## M1. Tabela auxiliar empresa → clínica

```sql
-- LegadoEmpresaId INT → ClinicaId UNIQUEIDENTIFIER
-- Preencher manualmente ou via script de migração global existente
```

## M2. Importar condições

```sql
INSERT INTO [Utility].[CondicaoPagamento]
  (Id, ClinicaId, Codigo, Descricao, NDiasPagamento, Desconto, CreatedBy, CreatedOn)
SELECT NEWID(), m.ClinicaId, cp.codigo, cp.descricao, cp.n_dias_pgt, cp.desconto, @User, SYSUTCDATETIME()
FROM dbo.COND_PAG cp
INNER JOIN dbo.MapeamentoEmpresaClinica m ON m.EmpresaLegadoId = cp.filtro
WHERE NOT EXISTS (
  SELECT 1 FROM [Utility].[CondicaoPagamento] x
  WHERE x.ClinicaId = m.ClinicaId AND x.Codigo = cp.codigo
);
```

## M3. Importar modos

```sql
INSERT INTO [Utility].[ModoPagamento] (...)
SELECT NEWID(), m.ClinicaId, tmp.c_modpag, tmp.descricao, tmp.Abreviatura,
       CASE WHEN tmp.TemNumAssociado = 1 THEN 1 ELSE 0 END,
       CASE WHEN tmp.TemContaBancaria = 1 THEN 1 ELSE 0 END,
       cb_new.Id,  -- mapear CodigoContaBancaria legado int → Guid
       CASE WHEN tmp.Historico = 1 THEN 1 ELSE 0 END,
       @User, SYSUTCDATETIME()
FROM dbo.TMOD_PAG tmp
INNER JOIN dbo.MapeamentoEmpresaClinica m ON m.EmpresaLegadoId = tmp.filtro
LEFT JOIN dbo.MapeamentoContaBancaria map ON map.CodigoLegado = tmp.CodigoContaBancaria
LEFT JOIN [Bancos].[ContaBancaria] cb_new ON cb_new.Id = map.ContaBancariaId;
```

## M4. Actualizar documentos (int legado → Guid FK)

```sql
-- Join pelo Codigo de negócio, não pela PK composta legado
UPDATE d SET
  d.CondicaoPagamentoId = cp_new.Id,
  d.ModoPagamentoId = mp_new.Id
FROM [Documentos].[Documento] d
INNER JOIN dbo.TFatura tf ON tf.IdDocumentoNovo = d.Id  -- ou chave migração existente
LEFT JOIN [Utility].[CondicaoPagamento] cp_new
  ON cp_new.ClinicaId = d.ClinicaId AND cp_new.Codigo = tf.CodigoCondicaoPagamento
LEFT JOIN [Utility].[ModoPagamento] mp_new
  ON mp_new.ClinicaId = d.ClinicaId AND mp_new.Codigo = tf.CodigoTipoModoPagamento;
```

Via tabela de mapeamento (M2/M3):

```sql
UPDATE d SET d.ModoPagamentoId = map.NovoId
FROM [Documentos].[Documento] d
INNER JOIN dbo.TFatura tf ON tf.IdDocumentoNovo = d.Id
INNER JOIN dbo.MapeamentoLegadoPagamentos map
  ON map.Tipo = 'MOD' AND map.ClinicaId = d.ClinicaId AND map.CodigoLegado = tf.CodigoTipoModoPagamento;
```

## M5. Organismo / Fornecedor

```sql
UPDATE o SET
  o.CondicaoPagamentoId = cp.Id,
  o.ModoPagamentoId = mp.Id
FROM [Organismos].[Organismo] o
-- join Institui legado CodigoCondicaoPagamento, CodigoTipoModoPagamento
```

## M6. Validação pós-migração

```sql
SELECT COUNT(*) FROM dbo.COND_PAG; -- vs Utility.CondicaoPagamento por clínica
SELECT COUNT(*) FROM dbo.TMOD_PAG WHERE ISNULL(Historico,0)=0;
-- vs ModoPagamento Historico=0
```

---

# GRUPO N — Fase 2 (fora do MVP)

| Módulo | O que falta |
|--------|-------------|
| Liquidação utente/organismo | `ModoPagamentoId` + `ContaBancariaId` nos movimentos |
| `ChequePredatadoRecebido` (tesouraria) | Registo tesouraria além dos campos no `Documento` |
| Conta corrente organismo/fornecedor | Condição → vencimento (`ContaCorrenteOrganismoEdt.js`) |
| Credenciais SNS | Modo obrigatório |
| Admissões / Tratamentos emissão | FKs nos requests automáticos |
| `ConfigModalidades.c_modopagamento` | `ModoPagamentoId` quando módulo modalidades existir |
| Relatórios / mapas Crystal | Filtros por modo (join `ModoPagamento`) |
| `FicheiroSaft.cs` | `AbreviaturaSaft` no XML export |
| `EditarModoPagamentoFatura` | PATCH modo em documento emitido não liquidado |
| Hook criar clínica | Seed 10 modos automático |

---

## 3. Mapa de consumo

Ver secção **1.5** (MVP vs fase 2). Resumo:

| Área | MVP (B–M) | Fase 2 (N) |
|------|-----------|------------|
| Menu Pagamentos (2 ecrãs) | Sim | — |
| Documento / emissão / editor | Sim | Editar modo em doc emitido |
| Organismo / fornecedor / empresa | Sim | — |
| Liquidação / tesouraria / CC | Preparar campos | Implementar fluxos |
| SAFT export / relatórios | `AbreviaturaSaft` no modo | Joins/export |
| Admissões / modalidades / credenciais SNS | — | FKs nos fluxos |

---

## 4. Testes manuais (checklist)

### Tabelas
- [ ] CRUD condição na clínica A não aparece na clínica B
- [ ] CRUD modo com abreviatura SAFT, conta default, flags
- [ ] Passar modo a histórico → desaparece do autocomplete do documento
- [ ] Retirar do histórico → volta ao autocomplete
- [ ] Filtro histórico na grelha modos (Ativo/Inativo)

### Faturação
- [ ] Novo documento organismo → herda condição e modo
- [ ] Mudar condição → data vencimento = data doc + N dias (só doc novo)
- [ ] Modo MB → exige conta bancária; modo CH → exige nº cheque
- [ ] Pré-datado → exige data vencimento cheque
- [ ] Emitir FR sem modo → erro validação
- [ ] Documento gravado com FKs correctas na BD
- [ ] `GetOpcoesPagamento` devolve dados da clínica actual (não enums)

### Migração
- [ ] Contagem `COND_PAG` = `CondicaoPagamento` por clínica
- [ ] Contagem `TMOD_PAG` activos = `ModoPagamento` (Historico=0)
- [ ] Documentos migrados com condição/modo resolvidos
- [ ] Organismos/fornecedores com FKs correctas

### Regressão
- [ ] Moedas / impostos / motivo retenção inalterados
- [ ] Emissão NC/GT/retencao continua a funcionar

---

## 5. Riscos e notas

1. **PK Guid vs legado:** não replicar PK composta `(codigo, filtro)`; app inteira usa `Id` Guid. `Codigo` int é só negócio/migração.
2. **Transposição de lógica:** validar por comportamento (vencimento, flags, FR), não por igualdade de schema SQL legado.
3. **Breaking change:** remoção dos enums exige deploy coordenado BE + FE + migração SQL.
4. **Permissões:** criar GUIDs em `area-comum-module.ts` e sincronizar com licenças backend.
5. **ContaBancaria vs Banco:** na fatura seguir legado (`ContaBancaria` Guid); `BancoId` noutros contextos se necessário.
6. **Liquidação completa** fase 2; campos no `Documento` preparam o modelo.
7. **Condição.desconto** ≠ `DescontoPagamento` documento (como legado).
8. **Sem framer-motion** no FE.
9. **Parar `dotnet run`** antes de `ef migrations`.
10. **Serviços (aliases):** depois de Pagamentos estável.
11. **Escopo menu:** apenas 2 itens; `Base.TipoPagamento` legado **não** vira terceiro ecrã — só lista fixa no modal Modo.

---

## 6. Estimativa de esforço

| Grupo | Esforço |
|-------|---------|
| B + F (domínio + migração) | 1–2 dias |
| C + D (BE CRUD + abreviaturas) | 2–3 dias |
| G + H + I (FE tabelas + menu) | 2 dias |
| J (migrar enums FK) | 1–2 dias |
| K (faturação paridade) | 2–3 dias |
| L (organismo/fornecedor) | 1 dia |
| M (ETL legado) | 1–2 dias |

**Total:** ~10–15 dias + testes integrados.

---

## 7. Referências legado

| Tema | Path |
|------|------|
| Dados condição | `Dados/CliCloud.Dados.Faturacao/CondicaoPagamento.cs` |
| Dados modo | `Dados/CliCloud.Dados.Faturacao/TipoModoPagamento.cs` |
| SAFT (lista fixa legado) | `Dados/CliCloud.Dados.Faturacao/TipoPagamentoBase.cs` — **só combobox modal** |
| UI condição | `CliCloud.ASPcli/Client/Faturacao/CondicaoPagamentoLst.js` |
| UI modo + abreviatura | `CliCloud.ASPcli/Client/Faturacao/ModoPagamentoLst.aspx.cs` |
| Fatura editor | `CliCloud.ASPcli/Client/Faturacao/TfaturaEdt.js` |
| Gravação TFatura | `Dados/CliCloud.Dados.Faturacao/TFatura.cs` |
| Organismo | `Dados/CliCloud.Dados.Comum/Institui.cs` |
| Fornecedor | `Dados/CliCloud.Dados.Comum/Fornecedores.cs` |
| Menu | `CliCloud.ASPcli/Services/WSMenus.asmx.cs` (~1829–1833) |
| Credenciais SNS | `CliCloud.ASPcli/Client/Faturacao/CredenciaisSnsLst.js` |
| CC Organismo | `CliCloud.ASPcli/Client/Faturacao/ContaCorrenteOrganismoEdt.js` |

## 8. Referências projeto novo (copiar padrão)

| Tema | Path |
|------|------|
| Plano modelo | `Frontend/src/docs/implementacao-impostos-motivo-isencao-retencao.md` |
| CRUD BE utility | `Backend/CliCloud.Application/Services/Moedas/MoedaService/` |
| CRUD BE c/ clínica | `Backend/CliCloud.Application/Services/Documentos/TipoDocumentoService/` |
| CRUD BE motivo retenção | `Backend/CliCloud.Application/Services/TaxasIva/MotivoRetencaoService/` |
| Controller padrão | `Backend/CliCloud.WebApi/Controllers/TaxasIva/MotivoRetencaoController.cs` |
| Migração padrão | `Backend/CliCloud.Infrastructure/Persistence/Migrations/20260615084532_F15_MotivoRetencao.cs` |
| Listagem FE | `Frontend/src/pages/area-comum/tabelas/tabelas/moedas/` |
| Listagem FE retenção | `Frontend/src/pages/area-comum/tabelas/tabelas/motivo-retencao/` |
| Client FE | `Frontend/src/lib/services/moedas/moeda-service/moeda-client.ts` |
| Alias financeira | `Frontend/src/routes/area-financeira/areaFinanceira.tsx` (~530) |
| Conta bancária | `Backend/CliCloud.Domain/Entities/Bancos/ContaBancaria.cs` |
| Documento actual | `Backend/CliCloud.Domain/Entities/Documentos/Documento.cs` (~103–118) |
| Enums actuais (remover) | `Backend/CliCloud.Domain/Enums/CondicaoPagamento.cs`, `TipoModoPagamento.cs` |
| GetOpcoesPagamento | `Backend/.../DocumentoEmissaoService.cs` (~34–50) |
| Editor FE | `Frontend/src/pages/area-financeira/faturacao/` |
| Hardcode banco | `Frontend/.../documento-cliente-utils.ts` (~67–70) |
| Estado editor | `Frontend/.../documento-editor.types.ts` (~21–22, 52) |

---

## ANEXO-A — `condicao-pagamento-client.ts` (esqueleto)

```typescript
import state from '@/states/state'
import type { GSResponse, PaginatedRequest, PaginatedResponse } from '@/types/api/responses'
import type { ResponseApi } from '@/types/responses'
import { BaseApiClient } from '@/lib/base-client'
import type { CondicaoPagamentoLightDTO, CondicaoPagamentoTableDTO } from '@/types/dtos/pagamentos/condicao-pagamento.dtos'

const BASE = '/client/pagamentos/CondicaoPagamento'

export class CondicaoPagamentoClient extends BaseApiClient {
  constructor(idFuncionalidade: string) {
    super(idFuncionalidade)
  }

  getLight(keyword?: string) {
    const url = keyword ? `${BASE}/light?keyword=${encodeURIComponent(keyword)}` : `${BASE}/light`
    return this.httpClient.getRequest<GSResponse<CondicaoPagamentoLightDTO[]>>(state.URL, url)
  }

  getPaginated(params: PaginatedRequest) {
    return this.httpClient.postRequest<PaginatedRequest, PaginatedResponse<CondicaoPagamentoTableDTO>>(
      state.URL, `${BASE}/paginated`, params
    )
  }
  // getById, create, update, delete, deleteMultiple — copiar de moeda-client.ts
}
```

---

## ANEXO-B — Query documento editor

```typescript
// documento-editor-queries.ts
export function useCondicoesPagamentoDocumento(keyword: string) {
  return useQuery({
    queryKey: ['documento', 'condicoes-pagamento', keyword],
    queryFn: async () => {
      const res = await CondicaoPagamentoClient(modules.areaComum.permissions.condicoesPagamento.id).getLight(keyword)
      return res.info?.data ?? []
    },
  })
}

export function useModosPagamentoDocumento(keyword: string) {
  return useQuery({
    queryKey: ['documento', 'modos-pagamento', keyword],
    queryFn: async () => {
      const res = await ModoPagamentoClient(modules.areaComum.permissions.modosPagamento.id).getLight(keyword)
      return (res.info?.data ?? []).filter((m) => !m.historico)
    },
  })
}
```

---

## ANEXO-C — Efeito vencimento (hook)

```typescript
// use-documento-editor.ts ou documento-cabecalho-section.tsx
function applyCondicaoPagamentoVencimento(
  condicaoId: string | null,
  condicoes: CondicaoPagamentoLightDTO[],
  dataDocumento: string,
  isNovoDocumento: boolean,
): string | null {
  if (!isNovoDocumento || !condicaoId) return null
  const c = condicoes.find((x) => x.id === condicaoId)
  if (c?.nDiasPagamento == null) return null
  return addDays(parseISO(dataDocumento), c.nDiasPagamento).toISOString().slice(0, 10)
}
```

---

## ANEXO-D — Flags modo pagamento (substituir hardcode)

```typescript
// documento-pagamento-detalhe-section.tsx
const modo = modos.find((m) => m.id === state.modoPagamentoId)

const showConta = modo?.temContaBancaria === true
const showCheque = modo?.temNumAssociado === true

// Remover import e uso de modoPagamentoRequerBanco em documento-tab-observacoes-banco-section.tsx
```

---

*Documento para implementação faseada. Executar por grupo na ordem da secção 2. Não avançar Grupo K antes de J estar estável.*
