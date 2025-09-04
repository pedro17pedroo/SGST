# Correção Final - Erro ERR_REQUIRE_ESM com nanoid

## Problema Identificado
O erro `ERR_REQUIRE_ESM` ocorre porque o módulo `nanoid` é um ES Module, mas o código compilado está tentando usar `require()` para carregá-lo. Isso acontece quando o esbuild não empacota todas as dependências no bundle final.

## Erro Específico
```
Error [ERR_REQUIRE_ESM]: require() of ES Module /var/www/gstock/back/node_modules/nanoid/index.js from /var/www/gstock/back/index.js not supported.
```

## Solução Aplicada

### 1. Configuração do esbuild Corrigida
A configuração foi alterada para empacotar todas as dependências exceto `mysql2` e `drizzle-orm`:

**Antes:**
```json
"build": "esbuild src/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist --minify --sourcemap"
```

**Depois:**
```json
"build": "esbuild src/index.ts --platform=node --bundle --format=cjs --outdir=dist --minify --sourcemap --external:mysql2 --external:drizzle-orm"
```

### 2. Resultado do Build
- Arquivo gerado: `dist/index.js` (1.7mb)
- Todas as dependências empacotadas exceto mysql2 e drizzle-orm
- Formato CommonJS compatível com Node.js 18

## Instruções para o Servidor de Produção

### Comando Único (Recomendado)
```bash
# Navegar para o diretório do projeto
cd /var/www/gstock/back

# Parar o serviço PM2
pm2 delete API-gstock

# Copiar o novo index.js compilado
# (você precisa fazer upload do novo dist/index.js do seu ambiente local)

# Reiniciar o serviço
pm2 start index.js --name "API-gstock"

# Verificar status
pm2 status
pm2 logs API-gstock
```

### Verificação Pós-Correção
```bash
# Verificar se o serviço está rodando
pm2 status

# Verificar logs para confirmar que não há erros
pm2 logs API-gstock --lines 20

# Testar a API
curl -k https://gstock-api.tatusolutions.com/health
```

## Dependências Empacotadas
Com a nova configuração, as seguintes dependências estão empacotadas no bundle:
- `nanoid` (ES Module problemático)
- `@hono/node-server`
- `@hono/zod-validator`
- `bcrypt`
- `cors`
- `dotenv`
- `drizzle-zod`
- `express`
- `express-session`
- `hono`
- `jsonwebtoken`
- `zod`

## Dependências Externas (não empacotadas)
- `mysql2` - Driver de banco de dados
- `drizzle-orm` - ORM

Estas permanecem externas porque são dependências de sistema que devem ser instaladas separadamente.

## Próximos Passos
1. Fazer upload do novo `dist/index.js` para o servidor
2. Reiniciar o serviço PM2
3. Verificar se a API responde corretamente
4. Confirmar que não há mais erros de módulo

## Prevenção
Para evitar problemas similares no futuro:
- Sempre testar o build localmente antes do deploy
- Verificar se todas as dependências ES Module estão sendo empacotadas
- Manter a configuração do esbuild consistente entre ambientes