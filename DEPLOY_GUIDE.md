# Guia Completo de Deploy - SGST

## 📋 Visão Geral

Este é o guia único e completo para fazer deploy do Sistema de Gestão de Stock e Rastreamento (SGST) em produção.

### Domínios de Produção
- **Frontend**: https://gstock.tatusolutions.com
- **Backend API**: https://gstock-api.tatusolutions.com

---

## 🏗️ Estrutura de Build

### Comandos de Build
```bash
# Build completo (frontend + backend)
npm run build

# Build apenas frontend
npm run build:frontend

# Build apenas backend
npm run build:backend
```

### Estrutura dos Arquivos de Build
```
dist/
├── index.js          # 🔧 BACKEND - Arquivo principal do servidor
├── index.js.map      # Source map do backend
└── public/           # 🌐 FRONTEND - Arquivos estáticos
    ├── assets/       # CSS, JS, imagens otimizadas
    └── index.html    # Página principal
```

**IMPORTANTE:**
- **VPS Backend**: Use apenas `dist/index.js`
- **VPS Frontend**: Use todo o conteúdo de `dist/public/`

### Como Funciona o Build

#### Backend (esbuild)
- **Entrada**: `server/index.ts` + todas as dependências
- **Saída**: `dist/index.js` (arquivo único com bundle)
- **Processo**: esbuild faz bundle de todo o código TypeScript + dependências npm
- **Resultado**: Arquivo autossuficiente que roda com `node index.js`

#### Frontend (Vite)
- **Entrada**: `client/src/` + dependências
- **Saída**: `dist/public/` (arquivos estáticos otimizados)
- **Processo**: Vite compila React + CSS + assets
- **Resultado**: Arquivos estáticos para servir via Nginx

**Por isso não precisa de package.json no VPS do backend** - todas as dependências já estão "empacotadas" no `index.js`!

---

## ⚙️ Configuração de Ambiente

### 1. Variáveis de Ambiente - Backend

Crie o arquivo `.env` no VPS do backend:

```bash
# Configuração do Banco de Dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sgst_prod"

# URLs e CORS
FRONTEND_URL="https://gstock.tatusolutions.com"
CORS_ORIGIN="https://gstock.tatusolutions.com"

# Configuração do Servidor
PORT=4002
NODE_ENV=production

# Segurança
JWT_SECRET="seu-jwt-secret-super-seguro-aqui"
SESSION_SECRET="seu-session-secret-super-seguro-aqui"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info
LOG_FILE_PATH="/var/log/sgst/app.log"
```

### 2. Variáveis de Ambiente - Frontend

Crie o arquivo `.env` no VPS do frontend:

```bash
# URL da API
VITE_API_URL="https://gstock-api.tatusolutions.com"

# Configuração de Produção
NODE_ENV=production
```

---

## 🚀 Deploy do Backend

### 1. Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### 2. Configuração do Banco de Dados

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE sgst_prod;
CREATE USER sgst_user WITH ENCRYPTED PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE sgst_prod TO sgst_user;
\q
```

### 3. Deploy da Aplicação

```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/sgst-backend
sudo chown $USER:$USER /var/www/sgst-backend
cd /var/www/sgst-backend

# Fazer upload do arquivo dist/index.js
# (use scp, rsync ou sua ferramenta preferida)

# Configurar variáveis de ambiente
# (criar arquivo .env conforme seção anterior)

# Executar migrações do banco (se necessário)
# node index.js migrate

# Iniciar com PM2
pm2 start index.js --name "sgst-backend"
pm2 startup
pm2 save
```

**⚠️ IMPORTANTE - Por que não precisa de package.json no VPS:**

O build do backend usa **esbuild** que faz **bundle** de todas as dependências em um único arquivo `dist/index.js`. Isso significa:

- ✅ **Todas as dependências já estão incluídas** no arquivo `index.js`
- ✅ **Não precisa instalar node_modules** no VPS
- ✅ **Não precisa de package.json** no servidor de produção
- ✅ **Deploy mais rápido** - apenas um arquivo
- ✅ **Menos problemas** de dependências em produção

O arquivo `index.js` gerado é **autossuficiente** e contém todo o código necessário para executar a aplicação.

### 4. Configuração do Nginx (Backend)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo tee /etc/nginx/sites-available/sgst-backend << EOF
server {
    listen 80;
    server_name gstock-api.tatusolutions.com;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gstock-api.tatusolutions.com;
    
    # Certificados SSL (configurar após obter certificados)
    ssl_certificate /etc/letsencrypt/live/gstock-api.tatusolutions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gstock-api.tatusolutions.com/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/sgst-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🌐 Deploy do Frontend

### 1. Preparação do Servidor

```bash
# Instalar Nginx (se não estiver instalado)
sudo apt update
sudo apt install nginx -y

# Criar diretório para o frontend
sudo mkdir -p /var/www/sgst-frontend
sudo chown $USER:$USER /var/www/sgst-frontend
```

### 2. Upload dos Arquivos

```bash
# Fazer upload de todo o conteúdo de dist/public/ para /var/www/sgst-frontend/
# Exemplo com rsync:
# rsync -avz dist/public/ usuario@servidor:/var/www/sgst-frontend/
```

### 3. Configuração do Nginx (Frontend)

```bash
# Criar configuração
sudo tee /etc/nginx/sites-available/sgst-frontend << EOF
server {
    listen 80;
    server_name gstock.tatusolutions.com;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gstock.tatusolutions.com;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/gstock.tatusolutions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gstock.tatusolutions.com/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    root /var/www/sgst-frontend;
    index index.html;
    
    # Configuração para SPA (Single Page Application)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache para assets estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Compressão
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/sgst-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 Configuração SSL com Let's Encrypt

### 1. Instalar Certbot

```bash
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Obter Certificados

```bash
# Para o backend
sudo certbot --nginx -d gstock-api.tatusolutions.com

# Para o frontend
sudo certbot --nginx -d gstock.tatusolutions.com
```

### 3. Renovação Automática

```bash
# Testar renovação
sudo certbot renew --dry-run

# Configurar renovação automática (já configurado por padrão)
sudo systemctl status snap.certbot.renew.timer
```

---

## 🔧 Scripts de Automação

### Script de Deploy Rápido

Crie o arquivo `deploy.sh`:

```bash
#!/bin/bash

# Configurações
BACKEND_SERVER="usuario@ip-backend"
FRONTEND_SERVER="usuario@ip-frontend"
BACKEND_PATH="/var/www/sgst-backend"
FRONTEND_PATH="/var/www/sgst-frontend"

echo "🏗️ Fazendo build da aplicação..."
npm run build

echo "🚀 Fazendo deploy do backend..."
scp dist/index.js $BACKEND_SERVER:$BACKEND_PATH/
ssh $BACKEND_SERVER "cd $BACKEND_PATH && pm2 restart sgst-backend"

echo "🌐 Fazendo deploy do frontend..."
rsync -avz --delete dist/public/ $FRONTEND_SERVER:$FRONTEND_PATH/

echo "✅ Deploy concluído!"
echo "Frontend: https://gstock.tatusolutions.com"
echo "Backend: https://gstock-api.tatusolutions.com"
```

---

## 📊 Monitoramento e Logs

### 1. Logs do Backend

```bash
# Ver logs do PM2
pm2 logs sgst-backend

# Ver logs em tempo real
pm2 logs sgst-backend --lines 100 -f

# Status da aplicação
pm2 status
```

### 2. Logs do Nginx

```bash
# Logs de acesso
sudo tail -f /var/log/nginx/access.log

# Logs de erro
sudo tail -f /var/log/nginx/error.log
```

### 3. Monitoramento do Sistema

```bash
# Status dos serviços
sudo systemctl status nginx
sudo systemctl status postgresql

# Uso de recursos
htop
df -h
free -h
```

---

## 🔍 Verificação e Testes

### Checklist de Deploy

- [ ] ✅ Build da aplicação executado com sucesso
- [ ] ✅ Arquivos enviados para os servidores corretos
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Banco de dados criado e migrações executadas
- [ ] ✅ PM2 executando o backend
- [ ] ✅ Nginx configurado e funcionando
- [ ] ✅ Certificados SSL instalados
- [ ] ✅ DNS apontando para os servidores
- [ ] ✅ Frontend acessível via HTTPS
- [ ] ✅ Backend respondendo via HTTPS
- [ ] ✅ Comunicação frontend-backend funcionando

### Comandos de Teste

```bash
# Testar backend
curl -k https://gstock-api.tatusolutions.com/health

# Testar frontend
curl -I https://gstock.tatusolutions.com

# Testar conectividade
ping gstock.tatusolutions.com
ping gstock-api.tatusolutions.com
```

---

## 🆘 Troubleshooting

### Problemas Comuns

#### 1. Erro 502 Bad Gateway
```bash
# Verificar se o backend está rodando
pm2 status

# Verificar logs
pm2 logs sgst-backend

# Reiniciar aplicação
pm2 restart sgst-backend
```

#### 2. Erro de CORS
```bash
# Verificar variáveis de ambiente
cat /var/www/sgst-backend/.env | grep CORS

# Verificar se FRONTEND_URL está correto
```

#### 3. Erro de Conexão com Banco
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U sgst_user -d sgst_prod
```

#### 4. Certificado SSL Expirado
```bash
# Verificar status dos certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew
```

---

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o deploy:

- **Documentação**: Este arquivo
- **Logs**: Sempre verificar logs antes de reportar problemas
- **Backup**: Sempre fazer backup antes de atualizações

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0.0