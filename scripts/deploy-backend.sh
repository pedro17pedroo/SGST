#!/bin/bash

# Script de Deploy do Backend SGST
# Uso: ./deploy-backend.sh [production|staging]

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

# Verificar argumentos
ENV=${1:-production}
if [[ "$ENV" != "production" && "$ENV" != "staging" ]]; then
    log_error "Ambiente inválido. Use: production ou staging"
    exit 1
fi

log "🚀 Iniciando deploy do backend para ambiente: $ENV"

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    log_error "package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
fi

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log_error "PM2 não está instalado. Instale com: npm install -g pm2"
    exit 1
fi

# Backup do arquivo .env atual
if [[ -f ".env" ]]; then
    log "📦 Fazendo backup do arquivo .env"
    cp .env ".env.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Verificar se há mudanças não commitadas
if [[ -n $(git status --porcelain) ]]; then
    log_warning "Há mudanças não commitadas no repositório"
    read -p "Deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deploy cancelado pelo usuário"
        exit 1
    fi
fi

# Atualizar código
log "📥 Atualizando código do repositório"
git fetch origin
git pull origin main

# Verificar se Node.js está na versão correta
NODE_VERSION=$(node --version)
log "📋 Versão do Node.js: $NODE_VERSION"

# Instalar dependências
log "📦 Instalando dependências de produção"
npm ci --only=production

# Executar testes (opcional)
if [[ "$ENV" == "staging" ]]; then
    log "🧪 Executando testes"
    npm test || {
        log_error "Testes falharam. Deploy cancelado."
        exit 1
    }
fi

# Build da aplicação
log "🔨 Compilando aplicação para $ENV"
if [[ "$ENV" == "production" ]]; then
    npm run build:backend:prod
else
    npm run build:backend
fi

# Verificar se o build foi bem-sucedido
if [[ ! -d "dist" ]]; then
    log_error "Build falhou. Diretório 'dist' não encontrado."
    exit 1
fi

# Executar migrações do banco de dados
log "🗄️  Executando migrações do banco de dados"
npm run db:migrate || {
    log_error "Migrações falharam. Verifique a conexão com o banco de dados."
    exit 1
}

# Verificar se a aplicação está rodando
if pm2 list | grep -q "sgst-backend"; then
    log "🔄 Recarregando aplicação existente"
    pm2 reload sgst-backend --env $ENV
else
    log "🚀 Iniciando nova instância da aplicação"
    pm2 start ecosystem.config.js --env $ENV
fi

# Salvar configuração do PM2
pm2 save

# Aguardar a aplicação inicializar
log "⏳ Aguardando aplicação inicializar..."
sleep 10

# Verificar se a aplicação está rodando corretamente
if pm2 list | grep -q "online.*sgst-backend"; then
    log_success "Aplicação está rodando corretamente"
else
    log_error "Aplicação não está rodando. Verificando logs..."
    pm2 logs sgst-backend --lines 20
    exit 1
fi

# Health check
log "🏥 Executando health check"
PORT=${PORT:-4002}
if curl -f http://localhost:$PORT/health > /dev/null 2>&1; then
    log_success "Health check passou"
else
    log_warning "Health check falhou. Verifique se o endpoint /health está configurado."
fi

# Limpeza de arquivos antigos
log "🧹 Limpando arquivos de backup antigos (>7 dias)"
find . -name ".env.backup.*" -mtime +7 -delete 2>/dev/null || true

# Mostrar status final
log "📊 Status da aplicação:"
pm2 status sgst-backend

log_success "Deploy do backend concluído com sucesso para ambiente: $ENV"
log "📝 Para ver os logs: pm2 logs sgst-backend"
log "📊 Para monitorar: pm2 monit"
log "🔄 Para reiniciar: pm2 restart sgst-backend"

# Notificação opcional (descomente se usar Slack/Discord)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"✅ Deploy do SGST Backend concluído com sucesso em '$ENV'"}' \
#   YOUR_WEBHOOK_URL

echo
log_success "🎉 Deploy finalizado! A aplicação está rodando em $ENV."