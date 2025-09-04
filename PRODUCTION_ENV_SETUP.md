# Configuração do Arquivo .env para Produção

## 🚨 Problema Identificado

O serviço `API-gstock` está com erro em produção porque:
1. O arquivo `.env` atual está configurado para desenvolvimento (`NODE_ENV="development"`, `PORT=4001`)
2. O PM2 está a tentar sobrescrever com `NODE_ENV=production` e `PORT=4002` via `ecosystem.config.js`
3. Isso causa conflito e impede o serviço de iniciar corretamente

## ✅ Solução

### Opção 1: Corrigir o arquivo .env (Recomendado)

No servidor de produção, edite o arquivo `.env` e configure:

```bash
# Configuração de Produção - SGST Backend
# Arquivo: .env

# Ambiente
NODE_ENV=production

# Servidor
PORT=4002

# URLs
FRONTEND_URL="https://gstock.tatusolutions.com"
VITE_API_URL="https://gstock-api.tatusolutions.com"

# CORS
CORS_ORIGIN="https://gstock.tatusolutions.com"

# Base de Dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/sgst_production"

# Segurança
SESSION_SECRET="sua-chave-secreta-super-segura-aqui"

# SSL e Segurança
SSL_ENABLED=true
HSTS_MAX_AGE=31536000
CSP_ENABLED=true

# Performance
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
ERROR_LOG_FILE=./logs/error.log
```

### Opção 2: Usar o arquivo .env.production

Se preferir manter o `.env` para desenvolvimento, pode:

1. Copiar as configurações do `.env.production` para `.env`:
```bash
cp .env.production .env
```

2. Ou configurar o `dotenv` para carregar o `.env.production` explicitamente

## 🔧 Comandos para Executar no Servidor

### 1. Verificar o arquivo .env atual
```bash
cat .env | grep -E "NODE_ENV|PORT"
```

### 2. Fazer backup do .env atual
```bash
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### 3. Editar o arquivo .env
```bash
nano .env
# ou
vi .env
```

### 4. Verificar se as configurações estão corretas
```bash
cat .env | grep -E "NODE_ENV|PORT|DATABASE_URL|FRONTEND_URL"
```

### 5. Executar o script de correção do PM2
```bash
./fix-production-pm2.sh
```

## 📋 Checklist de Verificação

- [ ] ✅ `NODE_ENV=production` no arquivo `.env`
- [ ] ✅ `PORT=4002` no arquivo `.env`
- [ ] ✅ `DATABASE_URL` configurada corretamente
- [ ] ✅ `FRONTEND_URL` aponta para `https://gstock.tatusolutions.com`
- [ ] ✅ `CORS_ORIGIN` configurado corretamente
- [ ] ✅ `SESSION_SECRET` definido
- [ ] ✅ Arquivo `dist/index.js` existe
- [ ] ✅ Diretório `logs/` existe
- [ ] ✅ PM2 configurado com nome `API-gstock`

## 🚨 Problemas Comuns

### Erro: "Cannot find module"
- **Causa**: Arquivo `dist/index.js` não existe
- **Solução**: Execute `npm run build:backend` para gerar o arquivo

### Erro: "Port already in use"
- **Causa**: Outro processo está a usar a porta 4002
- **Solução**: 
  ```bash
  sudo lsof -i :4002
  sudo kill -9 <PID>
  ```

### Erro: "Database connection failed"
- **Causa**: `DATABASE_URL` incorreta ou base de dados não acessível
- **Solução**: Verificar credenciais e conectividade da base de dados

### Erro: "CORS policy"
- **Causa**: `CORS_ORIGIN` não configurado corretamente
- **Solução**: Definir `CORS_ORIGIN="https://gstock.tatusolutions.com"`

## 📞 Suporte

Se continuar com problemas:
1. Verificar logs: `pm2 logs API-gstock`
2. Verificar status: `pm2 status`
3. Reiniciar serviço: `pm2 restart API-gstock`
4. Verificar conectividade: `curl -k https://gstock-api.tatusolutions.com/health`