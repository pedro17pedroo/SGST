# Correção Urgente - Serviço API-gstock em Produção

## Problema Atual
O serviço `API-gstock` está com erro `MODULE_NOT_FOUND` porque o PM2 está tentando executar `index.js` diretamente em vez de `dist/index.js`.

## Comandos para Executar no Servidor de Produção

### 1. Parar o Serviço Atual
```bash
cd /var/www/gstock/back
pm2 stop API-gstock
pm2 delete API-gstock
```

### 2. Verificar se o Arquivo dist/index.js Existe
```bash
ls -la dist/
# Se não existir, execute:
npm run build
```

### 3. Iniciar o Serviço com o Caminho Correto
```bash
# Opção 1: Usar o arquivo dist/index.js diretamente
pm2 start dist/index.js --name "API-gstock" --env production

# Opção 2: Usar o ecosystem.config.js (recomendado)
pm2 start ecosystem.config.js
```

### 4. Verificar o Status
```bash
pm2 status
pm2 logs API-gstock --lines 10
```

### 5. Testar a API
```bash
# Testar localmente
curl http://localhost:4002/health

# Testar externamente
curl https://gstock-api.tatusolutions.com/health
```

### 6. Salvar a Configuração
```bash
pm2 save
```

## Verificação de Sucesso

✅ **PM2 Status deve mostrar "online":**
```bash
pm2 status
```

✅ **Logs não devem mostrar erros MODULE_NOT_FOUND:**
```bash
pm2 logs API-gstock --lines 20
```

✅ **API deve responder:**
```bash
curl -I http://localhost:4002/
```

✅ **Nginx deve conseguir fazer proxy:**
```bash
curl https://gstock-api.tatusolutions.com/health
```

## Se o Arquivo dist/index.js Não Existir

### Compilar o Projeto:
```bash
cd /var/www/gstock/back
npm install
npm run build
```

### Verificar se foi criado:
```bash
ls -la dist/
head -5 dist/index.js
```

## Configuração Recomendada do ecosystem.config.js

Verifique se o arquivo `ecosystem.config.js` tem a configuração correta:

```javascript
module.exports = {
  apps: [{
    name: 'API-gstock',
    script: 'dist/index.js',  // <- IMPORTANTE: deve apontar para dist/index.js
    env: {
      NODE_ENV: 'production',
      PORT: 4002
    }
  }]
};
```

## Solução de Problemas

### Se o build falhar:
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Se o PM2 não conseguir iniciar:
```bash
# Verificar se o Node.js consegue executar o arquivo
node dist/index.js

# Se funcionar, o problema é na configuração do PM2
```

### Se a API não responder:
```bash
# Verificar se a porta está sendo usada
netstat -tlnp | grep 4002

# Verificar logs detalhados
pm2 logs API-gstock --lines 50
```

## Resumo dos Comandos Essenciais

```bash
# 1. Parar serviço
pm2 stop API-gstock && pm2 delete API-gstock

# 2. Verificar/compilar
ls -la dist/ || npm run build

# 3. Iniciar corretamente
pm2 start dist/index.js --name "API-gstock" --env production

# 4. Verificar
pm2 status && pm2 logs API-gstock --lines 5

# 5. Testar
curl http://localhost:4002/health

# 6. Salvar
pm2 save
```