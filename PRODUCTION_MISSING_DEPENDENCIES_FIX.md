# Correção Urgente - Dependências em Falta no Servidor de Produção

## Problema Identificado
O servidor de produção está com erro `MODULE_NOT_FOUND` porque:
1. ✅ O arquivo `index.js` está presente
2. ❌ Falta o arquivo `package.json`
3. ❌ Falta a pasta `node_modules` com as dependências
4. ❌ Não é possível executar `npm install` sem o `package.json`

## Solução Imediata

### Opção 1: Copiar Arquivos Necessários do Projeto Local

#### 1.1. No seu computador local, preparar os arquivos:
```bash
cd /Users/pedrodivino/Dev/SGST/server

# Criar um pacote com os arquivos necessários
tar -czf production-files.tar.gz package.json .env.example ecosystem.config.js

# Copiar para o servidor (substitua pelo seu método de upload)
scp production-files.tar.gz root@srv943012:/var/www/gstock/back/
```

#### 1.2. No servidor de produção:
```bash
cd /var/www/gstock/back

# Extrair os arquivos
tar -xzf production-files.tar.gz

# Instalar dependências
npm install --production

# Reiniciar o serviço
pm2 restart API-gstock
```

### Opção 2: Recriar o package.json Manualmente

#### 2.1. Criar package.json mínimo:
```bash
cd /var/www/gstock/back

cat > package.json << 'EOF'
{
  "name": "sgst-backend",
  "version": "1.0.0",
  "description": "SGST Backend API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-session": "^1.17.3",
    "mysql2": "^3.6.0",
    "drizzle-orm": "^0.28.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "zod": "^3.22.2"
  }
}
EOF
```

#### 2.2. Instalar dependências:
```bash
npm install --production
```

#### 2.3. Reiniciar o serviço:
```bash
pm2 restart API-gstock
```

### Opção 3: Deploy Completo (Recomendado)

#### 3.1. Fazer backup do .env atual:
```bash
cd /var/www/gstock/back
cp .env .env.backup
```

#### 3.2. Remover arquivos atuais e fazer deploy completo:
```bash
# Parar o serviço
pm2 stop API-gstock

# Fazer backup e limpar
mv /var/www/gstock/back /var/www/gstock/back.backup
mkdir -p /var/www/gstock/back

# Copiar projeto completo do seu repositório
# (substitua pelo seu método de deploy)
git clone [seu-repositorio] /tmp/sgst-deploy
cp -r /tmp/sgst-deploy/server/* /var/www/gstock/back/

# Restaurar .env de produção
cp /var/www/gstock/back.backup/.env /var/www/gstock/back/

# Instalar dependências e compilar
cd /var/www/gstock/back
npm install
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.js
```

## Verificações Após Correção

### 1. Verificar se os arquivos estão presentes:
```bash
cd /var/www/gstock/back
ls -la
# Deve mostrar: package.json, node_modules/, index.js, .env
```

### 2. Verificar se as dependências foram instaladas:
```bash
ls node_modules/ | head -10
# Deve mostrar as pastas das dependências
```

### 3. Verificar se o serviço está funcionando:
```bash
pm2 status
pm2 logs API-gstock --lines 10
```

### 4. Testar a API:
```bash
# Teste local
curl http://localhost:4002/health

# Teste externo
curl https://gstock-api.tatusolutions.com/health
```

## Comandos de Diagnóstico

### Se ainda houver erros MODULE_NOT_FOUND:
```bash
# Verificar qual módulo está em falta
pm2 logs API-gstock --lines 20 | grep "Cannot find module"

# Instalar módulo específico (exemplo)
npm install [nome-do-modulo]

# Reiniciar
pm2 restart API-gstock
```

### Se o npm install falhar:
```bash
# Limpar cache
npm cache clean --force

# Tentar com --legacy-peer-deps
npm install --production --legacy-peer-deps

# Ou forçar instalação
npm install --production --force
```

## Estrutura Esperada do Diretório

Após a correção, o diretório `/var/www/gstock/back` deve ter:
```
/var/www/gstock/back/
├── package.json          # ✅ Necessário
├── package-lock.json     # ✅ Gerado pelo npm install
├── node_modules/         # ✅ Dependências instaladas
├── index.js             # ✅ Arquivo principal compilado
├── index.js.map         # ✅ Source map
├── .env                 # ✅ Configurações de produção
└── ecosystem.config.js   # ✅ Configuração do PM2 (opcional)
```

## Prevenção de Problemas Futuros

### 1. Criar script de deploy:
```bash
#!/bin/bash
# deploy.sh
set -e

echo "Fazendo backup..."
cp /var/www/gstock/back/.env /tmp/.env.backup

echo "Atualizando código..."
cd /var/www/gstock/back
git pull origin main

echo "Instalando dependências..."
npm install --production

echo "Compilando..."
npm run build

echo "Restaurando .env..."
cp /tmp/.env.backup .env

echo "Reiniciando serviço..."
pm2 restart API-gstock

echo "Deploy concluído!"
pm2 status
```

### 2. Configurar monitoramento:
```bash
# Adicionar ao crontab para verificar se o serviço está rodando
*/5 * * * * pm2 status | grep -q "API-gstock.*online" || pm2 restart API-gstock
```

## Resumo dos Comandos Essenciais

```bash
# Opção rápida (se tiver o package.json)
cd /var/www/gstock/back
npm install --production
pm2 restart API-gstock

# Verificar resultado
pm2 status && pm2 logs API-gstock --lines 5
curl http://localhost:4002/health
```