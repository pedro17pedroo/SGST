#!/bin/bash

# Script de Configuração de Produção - SGST
# Este script ajuda a configurar as variáveis de ambiente para produção no VPS

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está na raiz do projeto
if [[ ! -f "package.json" ]]; then
    log_error "Este script deve ser executado na raiz do projeto SGST"
    exit 1
fi

log "🚀 Configurando SGST para Produção"
echo "==========================================="

# Configurações de domínio
echo
log "📋 Configurações de Domínio"
read -p "Digite o domínio do frontend (padrão: https://gstock.tatusolutions.com): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-https://gstock.tatusolutions.com}
read -p "Digite o domínio do backend (padrão: https://gstock-api.tatusolutions.com): " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-https://gstock-api.tatusolutions.com}
read -p "Digite a porta do backend (padrão: 4002): " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-4002}

echo
log "🗄️ Configuração do Banco de Dados"
read -p "Digite o nome do banco de dados (padrão: sgst_production): " DB_NAME
DB_NAME=${DB_NAME:-sgst_production}
read -p "Digite o usuário do banco de dados (padrão: sgst_user): " DB_USER
DB_USER=${DB_USER:-sgst_user}
read -s -p "Digite a senha do banco de dados: " DB_PASSWORD
echo

# Gerar chave secreta
log "🔐 Gerando chave secreta..."
SESSION_SECRET="sgst-prod-$(openssl rand -hex 32)"

# Criar arquivo .env de produção
log "📝 Criando arquivo .env de produção..."
cat > .env << EOF
# Configuração de Produção - SGST
# Gerado automaticamente em $(date)

# Database Configuration
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}"

# Frontend Configuration
FRONTEND_URL="${FRONTEND_URL}"

# Production Environment
NODE_ENV="production"

# Session Secret
SESSION_SECRET="${SESSION_SECRET}"

# Port Configuration
PORT=${BACKEND_PORT}

# CORS Configuration
CORS_ORIGIN="${FRONTEND_URL}"

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/sgst/app.log"

# Performance
MAX_CONNECTIONS=100
REQUEST_TIMEOUT=30000

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOF

# Criar arquivo .env.local para o frontend
log "📝 Criando arquivo .env.local para o frontend..."
cat > client/.env.local << EOF
# Configuração Frontend - Produção
# Gerado automaticamente em $(date)

# URL do Backend API
VITE_API_URL="${BACKEND_URL}"

# Environment
NODE_ENV="production"

# App Configuration
VITE_APP_NAME="SGST - Sistema de Gestão de Stock e Rastreamento"
VITE_APP_VERSION="1.0.0"

# Features Flags
VITE_ENABLE_GPS_TRACKING=true
VITE_ENABLE_COMPUTER_VISION=true
VITE_ENABLE_AI_ANALYTICS=true

# Map Configuration (Angola - Luanda)
VITE_DEFAULT_MAP_CENTER_LAT="-8.8390"
VITE_DEFAULT_MAP_CENTER_LNG="13.2894"
VITE_DEFAULT_MAP_ZOOM="10"

# Performance
VITE_ENABLE_SERVICE_WORKER=true
EOF

# Criar diretório de logs
log "📁 Configurando diretórios de logs..."
sudo mkdir -p /var/log/sgst
sudo chown $USER:$USER /var/log/sgst

# Backup dos arquivos antigos
if [[ -f ".env.backup" ]]; then
    log "📦 Fazendo backup do arquivo .env anterior..."
    cp .env.backup ".env.backup.$(date +%Y%m%d_%H%M%S)"
fi

log_success "✅ Configuração de produção criada com sucesso!"
echo
log "📋 Resumo da Configuração:"
echo "   • Frontend: ${FRONTEND_URL}"
echo "   • Backend: ${BACKEND_URL}"
echo "   • Porta Backend: ${BACKEND_PORT}"
echo "   • Banco de Dados: ${DB_NAME}"
echo "   • Usuário DB: ${DB_USER}"
echo
log_warning "⚠️  Próximos passos:"
echo "   1. Configure o MySQL no VPS"
echo "   2. Execute: npm run build"
echo "   3. Execute: npm run start"
echo
log "🔒 Arquivos criados:"
echo "   • .env (configuração do backend)"
echo "   • client/.env.local (configuração do frontend)"
echo
log_success "🎉 Configuração concluída!"