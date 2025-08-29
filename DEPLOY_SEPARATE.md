# Guia de Deployment Separado - SGST

Este guia explica como fazer deploy do frontend e backend em máquinas separadas.

## 🏗️ Arquitetura de Deployment

- **Frontend**: Aplicação React que pode ser servida por qualquer servidor web estático
- **Backend**: API Express.js que fornece os endpoints e acesso à base de dados

## 📋 Pré-requisitos

### Para o Backend
- Node.js 18+
- PostgreSQL (local ou remoto)
- Variáveis de ambiente configuradas

### Para o Frontend
- Servidor web (Nginx, Apache, ou qualquer CDN)
- Build da aplicação React

## 🚀 Deployment do Backend

### 1. Preparar o ambiente
```bash
# Clonar ou transferir o código
git clone <seu-repositorio>
cd sgst

# Instalar dependências
npm install
```

### 2. Configurar variáveis de ambiente
Criar arquivo `.env` na raiz do projeto:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sgst"

# CORS - URL do frontend (IMPORTANTE!)
FRONTEND_URL="https://seu-frontend.com"

# Environment
NODE_ENV="production"

# Session Secret
SESSION_SECRET="sua-chave-secreta-super-forte-aqui"

# Port
PORT=5000
```

### 3. Fazer build e iniciar
```bash
# Fazer build do backend
npm run build:backend

# Push da base de dados
npm run db:push

# Iniciar servidor de produção
npm run start:backend
```

### 4. Configurar proxy reverso (opcional)
Se usar Nginx, exemplo de configuração:
```nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🌐 Deployment do Frontend

### 1. Configurar URL da API
Criar arquivo `.env.production` na pasta raiz:
```env
VITE_API_URL=https://api.seu-dominio.com
```

### 2. Fazer build
```bash
# Build do frontend para produção
npm run build:frontend
```

### 3. Deploy dos ficheiros estáticos
Os ficheiros de build estarão em `dist/public/`. Deploy para:
- **Netlify**: Arraste a pasta `dist/public`
- **Vercel**: Conecte o repositório e configure build command: `npm run build:frontend`
- **Nginx**: Copie os ficheiros para `/var/www/html`
- **Apache**: Copie os ficheiros para `/var/www/html`

### 4. Configurar servidor web (exemplo Nginx)
```nginx
server {
    listen 80;
    server_name seu-frontend.com;
    root /var/www/html;
    index index.html;

    # Configuração para SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 Desenvolvimento Separado

Para desenvolvimento local com frontend e backend separados:

### Terminal 1 - Backend
```bash
npm run dev:backend
# Backend disponível em http://localhost:5000
```

### Terminal 2 - Frontend
```bash
# Criar .env.development
echo "VITE_API_URL=http://localhost:5000" > client/.env.development

# Iniciar frontend
npm run dev:frontend
# Frontend disponível em http://localhost:3000
```

## 🔐 Configurações de Segurança

### CORS
O backend já está configurado para aceitar requests de diferentes origens através da variável `FRONTEND_URL`.

### Headers de Segurança
Adicione ao seu proxy reverso ou servidor web:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## ✅ Verificação de Funcionamento

### Backend
```bash
curl https://api.seu-dominio.com/api/modules
# Deve retornar lista de módulos
```

### Frontend
1. Aceder ao frontend no navegador
2. Verificar se carrega sem erros
3. Tentar fazer login (se aplicável)
4. Verificar consola do navegador para erros CORS

## 🐛 Troubleshooting

### Erro CORS
- Verificar se `FRONTEND_URL` está definida corretamente no backend
- Verificar se `VITE_API_URL` está definida corretamente no frontend

### 404 em rotas do frontend
- Configurar servidor web para SPA (todas as rotas devem servir `index.html`)

### Erro de conexão à base de dados
- Verificar `DATABASE_URL`
- Executar `npm run db:push` se necessário

### Assets não carregam
- Verificar se o caminho base está correto
- Verificar configurações de cache do servidor web

## 📝 Notas Importantes

1. **Segurança**: Sempre usar HTTPS em produção
2. **Base de Dados**: Configurar backup automático
3. **Logs**: Configurar sistema de logging adequado
4. **Monitorização**: Implementar health checks
5. **Escalabilidade**: Considerar load balancer se necessário

## 🚀 Scripts Adicionais Disponíveis

- `npm run dev` - Desenvolvimento conjunto (frontend + backend)
- `npm run dev:frontend` - Apenas frontend em desenvolvimento
- `npm run dev:backend` - Apenas backend em desenvolvimento  
- `npm run build:frontend` - Build apenas do frontend
- `npm run build:backend` - Build apenas do backend
- `npm run start:backend` - Produção apenas do backend