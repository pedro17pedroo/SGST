# Instruções para Corrigir o Serviço API-gstock em Produção

## Problema Identificado
O serviço `API-gstock` está falhando em produção devido ao erro:
```
SyntaxError: Cannot use import statement outside a module
```

Este erro ocorre porque o arquivo `dist/index.js` foi compilado com sintaxe ES modules, mas o Node.js está tentando executá-lo como CommonJS.

## Solução Implementada
Foram feitas alterações na configuração de build do backend para gerar código CommonJS compatível com o PM2.

## Passos para Aplicar as Correções no Servidor de Produção

### 1. Fazer Backup dos Arquivos Atuais
```bash
cd /var/www/gstock/back/
cp package.json package.json.backup
cp tsconfig.json tsconfig.json.backup
cp -r dist dist.backup
```

### 2. Atualizar os Arquivos de Configuração

#### 2.1. Atualizar package.json
Edite o arquivo `server/package.json` e faça as seguintes alterações:

**Remover a linha:**
```json
"type": "module",
```

**Alterar os scripts de build:**
```json
"build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --format=cjs --sourcemap",
"build:prod": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js --format=cjs --minify --sourcemap"
```

#### 2.2. Atualizar tsconfig.json
Edite o arquivo `server/tsconfig.json` e altere:
```json
"module": "CommonJS"
```

### 3. Instalar Dependências e Recompilar
```bash
cd /var/www/gstock/back/
npm install
npm run build
```

### 4. Verificar o Arquivo Gerado
```bash
# Verificar se o arquivo foi gerado corretamente
ls -la dist/
head -5 dist/index.js
```

O arquivo deve começar com `"use strict";` em vez de `import`.

### 5. Parar e Reiniciar o Serviço PM2
```bash
# Parar o serviço atual
pm2 stop API-gstock
pm2 delete API-gstock

# Verificar se o processo foi removido
pm2 list

# Iniciar o serviço novamente
pm2 start ecosystem.config.js

# Ou usar o arquivo específico de produção se criado
pm2 start ecosystem.production.config.js

# Salvar a configuração
pm2 save
```

### 6. Verificar o Status do Serviço
```bash
# Verificar se o serviço está rodando
pm2 status

# Verificar os logs
pm2 logs API-gstock --lines 20

# Monitorar logs em tempo real
pm2 logs API-gstock
```

### 7. Testar a API
```bash
# Testar se a API está respondendo
curl http://localhost:4002/health

# Ou testar uma rota específica
curl http://localhost:4002/api/products
```

## Verificações de Sucesso

✅ **O serviço deve mostrar status "online" no PM2:**
```bash
pm2 status
```

✅ **Os logs não devem mostrar erros de sintaxe:**
```bash
pm2 logs API-gstock --lines 10
```

✅ **A API deve responder às requisições:**
```bash
curl -I http://localhost:4002/
```

✅ **O arquivo dist/index.js deve usar CommonJS:**
```bash
head -1 dist/index.js
# Deve mostrar: "use strict";
```

## Solução de Problemas

### Se o build falhar:
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Tentar build novamente
npm run build
```

### Se o PM2 não iniciar:
```bash
# Verificar se o arquivo existe
ls -la dist/index.js

# Verificar se o Node.js consegue executar
node dist/index.js

# Verificar configuração do ecosystem
cat ecosystem.config.js
```

### Se a API não responder:
```bash
# Verificar se a porta está sendo usada
netstat -tlnp | grep 4002

# Verificar variáveis de ambiente
cat .env | grep -E "NODE_ENV|PORT"

# Verificar logs detalhados
pm2 logs API-gstock --lines 50
```

## Arquivos de Backup Criados

Em caso de problemas, você pode restaurar os arquivos originais:
```bash
cp package.json.backup package.json
cp tsconfig.json.backup tsconfig.json
cp -r dist.backup dist
```

## Contato para Suporte

Se encontrar problemas durante a aplicação dessas correções, documente:
1. O comando que estava executando
2. A mensagem de erro completa
3. O conteúdo dos logs do PM2
4. O status atual do serviço

Essas informações ajudarão a diagnosticar rapidamente qualquer problema adicional.