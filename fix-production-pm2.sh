#!/bin/bash

# Script para corrigir o problema do PM2 em produção
# Execute este script no servidor de produção onde está o backend

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log "🔧 Corrigindo configuração do PM2 para API-gstock"

# 1. Parar o processo atual (se estiver a correr)
log "⏹️  Parando processo API-gstock atual..."
pm2 stop API-gstock 2>/dev/null || log_warning "Processo API-gstock não estava a correr"
pm2 delete API-gstock 2>/dev/null || log_warning "Processo API-gstock não estava registado"

# 2. Verificar se o arquivo dist/index.js existe
log "📁 Verificando se dist/index.js existe..."
if [[ ! -f "dist/index.js" ]]; then
    log_error "Arquivo dist/index.js não encontrado!"
    log "💡 Execute: npm run build:backend para gerar o arquivo"
    exit 1
fi
log_success "Arquivo dist/index.js encontrado"

# 3. Verificar se o arquivo .env existe
log "📄 Verificando arquivo .env..."
if [[ ! -f ".env" ]]; then
    log_error "Arquivo .env não encontrado!"
    log "💡 Crie o arquivo .env com as configurações de produção"
    exit 1
fi
log_success "Arquivo .env encontrado"

# 4. Verificar se NODE_ENV está definido como production no .env
log "🔍 Verificando configuração NODE_ENV..."
if grep -q "NODE_ENV=production" .env || grep -q 'NODE_ENV="production"' .env; then
    log_success "NODE_ENV configurado como production"
else
    log_warning "NODE_ENV não está definido como production no .env"
    log "💡 Adicione: NODE_ENV=production ao arquivo .env"
fi

# 5. Criar diretório de logs se não existir
log "📁 Criando diretório de logs..."
mkdir -p logs

# 6. Iniciar o processo com o novo nome
log "🚀 Iniciando API-gstock com configuração correta..."
pm2 start dist/index.js --name "API-gstock" --env production

# 7. Salvar configuração do PM2
log "💾 Salvando configuração do PM2..."
pm2 save

# 8. Aguardar inicialização
log "⏳ Aguardando inicialização..."
sleep 5

# 9. Verificar status
log "📊 Verificando status do serviço..."
pm2 status API-gstock

# 10. Verificar logs para erros
log "📋 Verificando logs recentes..."
pm2 logs API-gstock --lines 10

log_success "🎉 Configuração do PM2 corrigida!"
log "📝 Para monitorar: pm2 logs API-gstock"
log "📊 Para status: pm2 status"
log "🔄 Para reiniciar: pm2 restart API-gstock"