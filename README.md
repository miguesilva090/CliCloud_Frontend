<p align="center">
  <img src="public/logo.svg" alt="luma">
</p>

# Luma Project - Client

Frontend de gestão de um autarquia

## Configuração

Este projeto suporta dois métodos de configuração:

1. **Runtime Configuration (Recomendado para Produção)**: Usa um ficheiro `config.json` que pode ser substituído por cliente, permitindo um único build para múltiplos clientes.
2. **Environment Variables (Desenvolvimento)**: Usa variáveis de ambiente no ficheiro `.env` para desenvolvimento local.

### Configuração Runtime (Produção - Multi-Client)

Para suportar múltiplos clientes com um único build, use o ficheiro `public/config.json`:

1. Copie o ficheiro de exemplo:

   ```bash
   cp public/config.json.example public/config.json
   ```

2. Edite `public/config.json` com os valores específicos do cliente:

   ```json
   {
     "apiKey": "sua-chave-api",
     "urlApiHttp": "http://api.cliente.com:8084",
     "urlApiHttps": "https://api.cliente.com:8094",
     "urlAccessControlHttp": "http://api.cliente.com:8084",
     "urlAccessControlHttps": "https://api.cliente.com:8094",
     "updaterApiUrlHttp": "http://updater.cliente.com:5275",
     "updaterApiUrlHttps": "https://updater.cliente.com:7038",
     "updaterApiKey": "chave-updater",
     "clientKey": "915220DC-CA91-4537-1763-08DE33F7F2C2",
     "licencaId": "",
     "encryptionKey": "chave-de-criptografia-unica-por-cliente"
   }
   ```

3. **Para builds de produção**, sincronize `.env.build` a partir de `config.json.example`:

   ```bash
   # Sincronizar .env.build a partir de config.json.example
   npm run sync:env
   ```

   O ficheiro `.env.build` é gerado automaticamente com valores placeholder que correspondem a `config.json.example`. Estes valores servem apenas como fallback e são substituídos por `config.json` em runtime.

   **⚠️ Importante**:
   - `npm run build` usa o seu `.env` de desenvolvimento (valores reais)
   - `npm run build:safe` ou `npm run release` usa `.env.build` (valores placeholder)
   - Os valores do `.env` são embutidos no bundle JavaScript

4. Faça o build de forma segura:

   ```bash
   # Build normal (usa .env - valores de desenvolvimento)
   npm run build

   # Build seguro (usa .env.build com placeholders)
   npm run build:safe

   # Release (usa .env.build automaticamente)
   npm run release -- 1.0.24
   ```

   O comando `build:safe`:
   - Verifica se `.env.build` existe (cria a partir de `config.json.example` se necessário)
   - Usa `vite build --mode build` para carregar `.env.build` em vez de `.env`
   - O seu `.env` de desenvolvimento permanece inalterado

5. **Após o build**, crie `config.json` na pasta `dist/` com os valores reais do cliente:

   ```bash
   # Copiar o exemplo
   cp public/config.json.example dist/config.json

   # Editar com valores reais do cliente
   # (edite dist/config.json com os valores específicos do cliente)
   ```

   **Importante**:
   - NÃO coloque `config.json` em `public/` (será copiado automaticamente no build)
   - Crie `config.json` apenas em `dist/` após o build
   - Cada cliente deve ter seu próprio `config.json` com valores específicos

**Vantagens:**

- Um único build serve múltiplos clientes
- Configuração específica por cliente sem recompilar
- Mais seguro: configuração não é incluída no bundle JavaScript

**Nota de Segurança:**

- O ficheiro `config.json` é público e acessível no browser
- API keys em aplicações frontend são sempre visíveis aos utilizadores
- Use este método para URLs e configurações não sensíveis
- Para segredos sensíveis, use autenticação/autorização no servidor

### Variáveis de Ambiente (Desenvolvimento)

Para desenvolvimento local, use variáveis de ambiente no ficheiro `.env`:

### Configuração de URLs (Separadas por Protocolo)

Para suportar diferentes URLs para HTTP e HTTPS:

```env
# URLs para HTTP
VITE_URL_API_HTTP=http://qualidade.globalsoft.pt:8084
VITE_URL_ACCESS_CONTROL_HTTP=http://qualidade.globalsoft.pt:8084

# URLs para HTTPS
VITE_URL_API_HTTPS=https://qualidade.globalsoft.pt:8094
VITE_URL_ACCESS_CONTROL_HTTPS=https://qualidade.globalsoft.pt:8094

# Chave da API
VITE_API_KEY=sua-chave-api
```

**Nota sobre Protocolos (HTTP/HTTPS):**

- A aplicação detecta automaticamente o protocolo usado (HTTP ou HTTPS) e seleciona a URL apropriada
- Configure `VITE_URL_API_HTTP` e `VITE_URL_API_HTTPS` para usar URLs diferentes por protocolo
- Se usar a mesma URL para ambos os protocolos, configure ambas as variáveis com o mesmo valor

### Configuração do Updater

Para o sistema de atualizações:

```env
# URLs do Updater
VITE_UPDATER_API_URL_HTTP=http://qualidade.globalsoft.pt:5275
VITE_UPDATER_API_URL_HTTPS=https://localhost:7038

# Chave do Updater
VITE_UPDATER_API_KEY="gS_Upd@ter-2025!_K3y#A9"

# Identificador do Cliente (opcional - fallback para auth store)
VITE_CLIENT_KEY="915220DC-CA91-4537-1763-08DE33F7F2C2"

# ID da Licença (opcional - fallback para auth store)
VITE_LICENCA_ID=""

# Chave de Criptografia (opcional - para encriptação do localStorage)
VITE_ENCRYPTION_KEY="sua-chave-de-criptografia-aqui"
```

**Nota sobre VITE_CLIENT_KEY e VITE_LICENCA_ID:**

- Estas variáveis são opcionais e servem como fallback
- Se não definidas, a aplicação tentará obter os valores do auth store (decodificado do JWT token)
- Cada instância de frontend pode definir estes valores diferentemente no `.env` ou `config.json`

**Nota sobre VITE_ENCRYPTION_KEY:**

- Esta variável é opcional e serve como fallback
- Se não definida, a aplicação usará uma chave padrão (para compatibilidade com dados existentes)
- **Recomendado**: Defina `encryptionKey` no `config.json` para ter chaves diferentes por cliente sem recompilar
- Cada cliente pode ter sua própria chave de criptografia no `config.json`

### Prioridade de Configuração

A aplicação carrega configuração na seguinte ordem de prioridade:

1. **Runtime Config** (`public/config.json`) - Usado em produção
2. **Environment Variables** (`.env`) - Usado em desenvolvimento, fallback se `config.json` não existir

Isto permite que a mesma build funcione para múltiplos clientes, cada um com o seu próprio `config.json`.

## Development

Para começar a desenvolver

```bash
  npm run dev
```

## Deploy

Para fazer build do projeto

```bash
  npm run build
```

### Build com Auto-Versionamento

O projeto inclui scripts para incrementar automaticamente a versão ao fazer build:

| Comando                 | Descrição                                    |
| ----------------------- | -------------------------------------------- |
| `npm run build:patch`   | Incrementa patch (1.0.0 → 1.0.1) e faz build |
| `npm run build:minor`   | Incrementa minor (1.0.0 → 1.1.0) e faz build |
| `npm run build:major`   | Incrementa major (1.0.0 → 2.0.0) e faz build |
| `npm run version:bump`  | Apenas incrementa a versão (sem build)       |
| `npm run zip`           | Cria um zip da pasta dist                    |
| `npm run release:patch` | Incrementa patch + build + zip               |
| `npm run release:minor` | Incrementa minor + build + zip               |
| `npm run release:major` | Incrementa major + build + zip               |

```bash
# Build com incremento de patch (default)
npm run build:patch

# Build com incremento de minor
npm run build:minor

# Build com incremento de major
npm run build:major

# Apenas incrementar versão (sem build)
npm run version:bump patch
npm run version:bump minor
npm run version:bump major
```

A versão é armazenada em `public/version.json` e estará disponível em `/version.json` na aplicação.

### Release (Build + Zip)

Para criar um release completo (incrementar versão, build e criar zip):

```bash
# Release com versão específica
npm run release -- 1.0.24
# Output: releases/luma-frontend-1.0.24.zip

# Release com incremento de patch
npm run release:patch
# Output: releases/luma-frontend-1.0.1.zip

# Release com incremento de minor
npm run release:minor
# Output: releases/luma-frontend-1.1.0.zip

# Release com incremento de major
npm run release:major
# Output: releases/luma-frontend-2.0.0.zip
```

Os ficheiros zip são guardados na pasta `releases/` com a versão no nome do ficheiro.
