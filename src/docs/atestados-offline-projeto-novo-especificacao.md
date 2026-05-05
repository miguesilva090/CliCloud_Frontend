# Especificacao Tecnica - Atestados Offline no Projeto Novo

## Contexto

Este documento define a implementacao robusta do fluxo de atestados com comunicacao SPMS no projeto novo (`Backend` + `Frontend`), mantendo paridade funcional com o legado.

## Paridade com legado (obrigatoria)

No legado existe comunicacao dedicada offline com endpoint proprio.  
No projeto novo deve existir o mesmo comportamento:

- `ConfigCartaConducao.UrlOnline` -> endpoint SPMS online.
- `ConfigCartaConducao.UrlOffline` -> endpoint SPMS offline (equivalente ao legado).

### Regras de uso do endpoint

1. Criacao de atestado: tenta online (`UrlOnline`).
2. Reenvio de pendente: usa offline (`UrlOffline`).
3. Reenvio em lote: usa offline (`UrlOffline`).

---

## Modelo de estado (contrato)

- `0` = Pendente (fila offline / por reenviar)
- `1` = Enviado
- `2` = Erro funcional

---

## Backend - alteracoes

## 1) `Backend/CliCloud.Application/Services/Atestados/SpmsCartaConducaoService/SpmsRegistoAtestadoResult.cs`

Adicionar classificacao de falha transiente:

```csharp
public class SpmsRegistoAtestadoResult
{
    public bool Success { get; set; }
    public string? NumeroAtestadoMedico { get; set; }
    public string? Message { get; set; }
    public bool IsTransientFailure { get; set; }
}
```

## 2) `Backend/CliCloud.Application/Services/Atestados/SpmsCartaConducaoService/SpmsCartaConducaoService.cs`

### Selecao endpoint (obrigatoria)

```csharp
var targetUrl = useOfflineEndpoint ? config.UrlOffline : config.UrlOnline;
var endpointName = useOfflineEndpoint ? "offline" : "online";
```

### Falhas HTTP/transporte

- `5xx`, timeout, `HttpRequestException` -> `IsTransientFailure = true`
- erros funcionais de payload -> `IsTransientFailure = false`

Exemplo:

```csharp
if (!response.IsSuccessStatusCode)
{
    var status = (int)response.StatusCode;
    return new SpmsRegistoAtestadoResult
    {
        Success = false,
        Message = BuildHttpErrorMessage(status, body),
        IsTransientFailure = status >= 500
    };
}
```

## 3) `Backend/CliCloud.Application/Services/Atestados/AtestadoService/AtestadoService.cs`

No `ComunicarAtestadoAsync(...)`:

- sucesso -> estado `1`;
- falha transiente -> estado `0` + `MensagemErro`;
- falha funcional -> estado `2` + `MensagemErro`.

Exemplo:

```csharp
if (!spms.Success)
{
    if (spms.IsTransientFailure)
    {
        atestado.EstadoEnvio = 0;
        atestado.MensagemErro = spms.Message;
        await _repository.UpdateAsync<Atestado, Guid>(atestado);
        await _repository.SaveChangesAsync();
        return (false, $"Comunicacao indisponivel. Pendente: {spms.Message}");
    }

    atestado.EstadoEnvio = 2;
    atestado.MensagemErro = spms.Message;
    await _repository.UpdateAsync<Atestado, Guid>(atestado);
    await _repository.SaveChangesAsync();
    return (false, $"Falha funcional SPMS: {spms.Message}");
}
```

### Mapeamento de chamadas

- `CreateAtestadoAsync` -> `useOfflineEndpoint: false` (online)
- `ReenviarAtestadoOfflineAsync` -> `useOfflineEndpoint: true` (offline)
- `ReenviarPendentesOfflineAsync` -> `useOfflineEndpoint: true` (offline)

## 4) DTOs backend

Garantir `MensagemErro` em:

- `AtestadoDTO`
- `AtestadoTableDTO`

---

## Frontend - alteracoes

## 5) `Frontend/src/types/dtos/saude/atestados.dtos.ts`

Garantir:

```ts
mensagemErro?: string | null
```

em `AtestadoDTO` e `AtestadoTableDTO`.

## 6) `Frontend/src/lib/services/saude/atestados-service/atestados-client.ts`

Adicionar metodos:

- `reenviarAtestadoOffline(id)`
- `reenviarPendentesOffline()`
- `obterErroComunicacao(id)`

Endpoints:

- `POST /client/atestados/Atestado/{id}/reenviar-offline`
- `POST /client/atestados/Atestado/reenviar-pendentes-offline`
- `GET /client/atestados/Atestado/{id}/erro-comunicacao`

## 7) `Frontend/src/lib/services/saude/atestados-service/atestados-queries.ts`

Adicionar hooks:

- `useReenviarAtestadoOffline`
- `useReenviarPendentesOffline`
- `useObterErroComunicacaoAtestado`

Todos com `invalidateQueries(['atestados-paginated'])` apos sucesso.

## 8) `Frontend/src/pages/area-clinica/processo-clinico/atestados/components/atestados-table/atestados-columns.tsx`

Estado com 3 labels:

- `0 -> Pendente`
- `1 -> Enviado`
- `2 -> Erro`

## 9) `Frontend/src/pages/area-clinica/processo-clinico/atestados/pages/listagem-atestados-page.tsx`

Adicionar:

- acao por linha para estado `0`: reenviar;
- acao por linha para estado `2`: ver erro (e opcional reenviar);
- acao de toolbar: reenviar pendentes.

Recomendacao: criar componente de acoes especifico para atestados (evita acoplamento na coluna generica global).

---

## Criterios de aceitacao

1. Criacao nunca perde registo por falha transiente.
2. Reenvio usa endpoint offline (`UrlOffline`) no backend.
3. Estados 0/1/2 corretos na listagem.
4. Erro comunicacao visivel ao utilizador.
5. Reenvio unitario e em lote funcionais.

---

## Testes minimos obrigatorios

1. Create + sucesso online -> estado 1.
2. Create + timeout -> estado 0.
3. Create + erro funcional SPMS -> estado 2.
4. Reenvio estado 0 + sucesso -> estado 1.
5. Reenvio estado 0 + falha transiente -> mantem 0.
6. Reenvio estado 0 + erro funcional -> 2.
7. Consulta `erro-comunicacao` devolve mensagem esperada.

