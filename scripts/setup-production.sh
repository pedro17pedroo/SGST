#!/bin/bash

# Script de Configuração Inicial para Produção SGST
# Uso: ./setup-production.sh [backend|frontend|all]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

log_info() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Verificar argumentos
SETUP_TYPE=${1:-all}
if [[ "$SETUP_TYPE" != "backend" && "$SETUP_TYPE" != "frontend" && "$SETUP_TYPE" != "all" ]]; then
    log_error "Tipo inválido. Use: backend, frontend ou all"
    exit 1
fi

log "🚀 Iniciando configuração de produção SGST: $SETUP_TYPE"

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    log_error "package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
fi

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para instalar dependências do sistema
install_system_dependencies() {
    log "📦 Verificando dependências do sistema..."
    
    # Detectar sistema operacional
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command_exists apt-get; then
            # Ubuntu/Debian
            log "🐧 Detectado: Ubuntu/Debian"
            sudo apt update
            
            # Dependências básicas
            sudo apt install -y curl wget git build-essential
            
            # Node.js 18
            if ! command_exists node || [[ $(node --version | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
                log "📥 Instalando Node.js 18..."
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
            fi
            
            if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
                # MySQL
                if ! command_exists mysql; then
                    log "🗄️  Instalando MySQL..."
                    sudo apt install -y mysql-server
                    sudo mysql_secure_installation
                fi
                
                # PM2
                if ! command_exists pm2; then
                    log "⚙️  Instalando PM2..."
                    sudo npm install -g pm2
                fi
            fi
            
            if [[ "$SETUP_TYPE" == "frontend" || "$SETUP_TYPE" == "all" ]]; then
                # Nginx
                if ! command_exists nginx; then
                    log "🌐 Instalando Nginx..."
                    sudo apt install -y nginx
                fi
            fi
            
        elif command_exists yum; then
            # CentOS/RHEL
            log "🎩 Detectado: CentOS/RHEL"
            sudo yum update -y
            sudo yum install -y curl wget git gcc-c++ make
            
            # Node.js 18
            if ! command_exists node; then
                curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
                sudo yum install -y nodejs
            fi
            
            if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
                sudo yum install -y mysql-server
                sudo npm install -g pm2
            fi
            
            if [[ "$SETUP_TYPE" == "frontend" || "$SETUP_TYPE" == "all" ]]; then
                sudo yum install -y nginx
            fi
        fi
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        log "🍎 Detectado: macOS"
        
        if ! command_exists brew; then
            log "📥 Instalando Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        brew update
        
        if ! command_exists node; then
            brew install node@18
        fi
        
        if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
            brew install mysql
            npm install -g pm2
        fi
        
        if [[ "$SETUP_TYPE" == "frontend" || "$SETUP_TYPE" == "all" ]]; then
            brew install nginx
        fi
    fi
    
    log_success "Dependências do sistema instaladas"
}

# Função para configurar o banco de dados
setup_database() {
    log "🗄️  Configurando banco de dados..."
    
    # Verificar se MySQL está rodando
    if ! systemctl is-active --quiet mysql 2>/dev/null && ! brew services list | grep mysql | grep started >/dev/null 2>&1; then
        log "🔄 Iniciando MySQL..."
        if command_exists systemctl; then
            sudo systemctl start mysql
            sudo systemctl enable mysql
        elif command_exists brew; then
            brew services start mysql
        fi
    fi
    
    # Solicitar informações do banco
    echo
    log_info "Configure as credenciais do banco de dados:"
    read -p "Nome do banco de dados [sgst_production]: " DB_NAME
    DB_NAME=${DB_NAME:-sgst_production}
    
    read -p "Usuário do banco [sgst_user]: " DB_USER
    DB_USER=${DB_USER:-sgst_user}
    
    read -s -p "Senha do usuário: " DB_PASSWORD
    echo
    
    read -s -p "Senha do root do MySQL: " MYSQL_ROOT_PASSWORD
    echo
    
    # Criar banco e usuário
    log "📝 Criando banco de dados e usuário..."
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    log_success "Banco de dados configurado"
    
    # Salvar configurações no .env
    echo "DATABASE_URL=\"mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME\"" >> .env.temp
}

# Função para configurar variáveis de ambiente
setup_environment() {
    log "⚙️  Configurando variáveis de ambiente..."
    
    # Solicitar informações
    echo
    log_info "Configure as URLs da aplicação:"
    read -p "URL do frontend [https://seu-dominio-frontend.com]: " FRONTEND_URL
    FRONTEND_URL=${FRONTEND_URL:-https://seu-dominio-frontend.com}
    
    read -p "URL do backend [https://seu-dominio-backend.com]: " BACKEND_URL
    BACKEND_URL=${BACKEND_URL:-https://seu-dominio-backend.com}
    
    read -p "Porta do backend [4002]: " PORT
PORT=${PORT:-4002}
    
    # Gerar chave secreta
    SESSION_SECRET=$(openssl rand -hex 32)
    
    # Criar arquivo .env
    cat > .env << EOF
# Configurações de Produção SGST
# Gerado em: $(date)

# Ambiente
NODE_ENV=production

# URLs
FRONTEND_URL="$FRONTEND_URL"
VITE_API_URL="$BACKEND_URL"

# Servidor
PORT=$PORT

# Segurança
SESSION_SECRET="$SESSION_SECRET"
CORS_ORIGIN="$FRONTEND_URL"

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
EOF
    
    # Adicionar configurações do banco se existirem
    if [[ -f ".env.temp" ]]; then
        cat .env.temp >> .env
        rm .env.temp
    fi
    
    log_success "Arquivo .env criado"
}

# Função para configurar Nginx
setup_nginx() {
    log "🌐 Configurando Nginx..."
    
    read -p "Domínio do frontend: " FRONTEND_DOMAIN
    read -p "Domínio do backend: " BACKEND_DOMAIN
    
    # Configuração do frontend
    if [[ "$SETUP_TYPE" == "frontend" || "$SETUP_TYPE" == "all" ]]; then
        sudo tee /etc/nginx/sites-available/sgst-frontend > /dev/null << EOF
server {
    listen 80;
    server_name $FRONTEND_DOMAIN;
    root /var/www/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check
    location /health {
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
}
EOF
        
        sudo ln -sf /etc/nginx/sites-available/sgst-frontend /etc/nginx/sites-enabled/
    fi
    
    # Configuração do backend
    if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
        sudo tee /etc/nginx/sites-available/sgst-backend > /dev/null << EOF
server {
    listen 80;
    server_name $BACKEND_DOMAIN;
    
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF
        
        sudo ln -sf /etc/nginx/sites-available/sgst-backend /etc/nginx/sites-enabled/
    fi
    
    # Remover configuração padrão
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    sudo nginx -t
    
    # Reiniciar Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    log_success "Nginx configurado"
}

# Função para configurar SSL
setup_ssl() {
    log "🔒 Configurando SSL com Let's Encrypt..."
    
    # Instalar Certbot
    if ! command_exists certbot; then
        if command_exists apt-get; then
            sudo apt install -y certbot python3-certbot-nginx
        elif command_exists yum; then
            sudo yum install -y certbot python3-certbot-nginx
        elif command_exists brew; then
            brew install certbot
        fi
    fi
    
    read -p "Configurar SSL agora? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [[ "$SETUP_TYPE" == "frontend" || "$SETUP_TYPE" == "all" ]]; then
            sudo certbot --nginx -d "$FRONTEND_DOMAIN"
        fi
        
        if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
            sudo certbot --nginx -d "$BACKEND_DOMAIN"
        fi
        
        # Configurar renovação automática
        echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
        
        log_success "SSL configurado"
    else
        log_warning "SSL não configurado. Execute manualmente: sudo certbot --nginx -d seu-dominio.com"
    fi
}

# Função para configurar firewall
setup_firewall() {
    log "🔥 Configurando firewall..."
    
    if command_exists ufw; then
        sudo ufw --force enable
        sudo ufw allow ssh
        sudo ufw allow 80
        sudo ufw allow 443
        
        if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
            sudo ufw allow "$PORT"
        fi
        
        log_success "Firewall configurado"
    else
        log_warning "UFW não disponível. Configure o firewall manualmente."
    fi
}

# Função principal
main() {
    echo
    echo "🎯 SGST - Sistema de Gestão de Stock e Rastreamento"
    echo "📋 Configuração de Produção - Tipo: $SETUP_TYPE"
    echo
    
    # Verificar se é root
    if [[ $EUID -eq 0 ]]; then
        log_warning "Não execute este script como root. Use sudo quando necessário."
        exit 1
    fi
    
    # Instalar dependências do sistema
    install_system_dependencies
    
    # Configurar banco de dados (apenas para backend)
    if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
        setup_database
    fi
    
    # Configurar variáveis de ambiente
    setup_environment
    
    # Instalar dependências do projeto
    log "📦 Instalando dependências do projeto..."
    npm ci --only=production
    
    # Build da aplicação
    log "🔨 Compilando aplicação..."
    if [[ "$SETUP_TYPE" == "backend" ]]; then
        npm run build:backend:prod
    elif [[ "$SETUP_TYPE" == "frontend" ]]; then
        npm run build:frontend:prod
    else
        npm run build:frontend:prod
        npm run build:backend:prod
    fi
    
    # Configurar Nginx
    if [[ "$SETUP_TYPE" == "frontend" || "$SETUP_TYPE" == "all" ]]; then
        setup_nginx
    fi
    
    # Configurar SSL
    setup_ssl
    
    # Configurar firewall
    setup_firewall
    
    # Criar diretórios necessários
    mkdir -p logs backups
    
    # Configurar PM2 (apenas para backend)
    if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
        log "⚙️  Configurando PM2..."
        pm2 start ecosystem.config.js --env production
        pm2 save
        pm2 startup
        
        # Executar migrações
        log "🗄️  Executando migrações do banco..."
        npm run db:migrate
    fi
    
    echo
    log_success "🎉 Configuração de produção concluída!"
    echo
    log_info "📋 Próximos passos:"
    
    if [[ "$SETUP_TYPE" == "backend" || "$SETUP_TYPE" == "all" ]]; then
        echo "   • Verificar status: pm2 status"
        echo "   • Ver logs: pm2 logs sgst-backend"
        echo "   • Monitorar: pm2 monit"
    fi
    
    if [[ "$SETUP_TYPE" == "frontend" || "$SETUP_TYPE" == "all" ]]; then
        echo "   • Verificar Nginx: sudo systemctl status nginx"
        echo "   • Ver logs: sudo tail -f /var/log/nginx/access.log"
    fi
    
    echo "   • Configurar backup: crontab -e"
    echo "   • Monitorar recursos: htop"
    echo "   • Verificar SSL: https://seu-dominio.com"
    echo
    log_info "📚 Documentação completa: DEPLOY_GUIDE.md"
}

# Executar função principal
main