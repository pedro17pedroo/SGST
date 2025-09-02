#!/bin/bash

# Script de Deploy do Frontend SGST
# Uso: ./deploy-frontend.sh [production|staging]

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

log "🚀 Iniciando deploy do frontend para ambiente: $ENV"

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    log_error "package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
fi

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    log_error "Nginx não está instalado. Instale com: sudo apt install nginx"
    exit 1
fi

# Configurações baseadas no ambiente
if [[ "$ENV" == "production" ]]; then
    WEB_ROOT="/var/www/html"
    ENV_FILE=".env.frontend.production"
else
    WEB_ROOT="/var/www/html-staging"
    ENV_FILE=".env.frontend.staging"
fi

# Backup do diretório web atual
if [[ -d "$WEB_ROOT" ]]; then
    log "📦 Fazendo backup do diretório web atual"
    sudo cp -r "$WEB_ROOT" "${WEB_ROOT}.backup.$(date +%Y%m%d_%H%M%S)"
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
log "📦 Instalando dependências"
npm ci

# Configurar variáveis de ambiente
log "⚙️  Configurando variáveis de ambiente para $ENV"
if [[ -f "$ENV_FILE" ]]; then
    cp "$ENV_FILE" ".env.local"
    log_success "Arquivo de ambiente copiado: $ENV_FILE -> .env.local"
else
    log_warning "Arquivo $ENV_FILE não encontrado. Usando configurações padrão."
fi

# Executar testes do frontend (opcional)
if [[ "$ENV" == "staging" ]]; then
    log "🧪 Executando testes do frontend"
    npm run test:frontend || {
        log_warning "Testes do frontend falharam, mas continuando deploy..."
    }
fi

# Executar verificação de tipos
log "🔍 Verificando tipos TypeScript"
npm run check:frontend || {
    log_error "Verificação de tipos falhou. Deploy cancelado."
    exit 1
}

# Build da aplicação
log "🔨 Compilando aplicação para $ENV"
if [[ "$ENV" == "production" ]]; then
    npm run build:frontend:prod
else
    npm run build:frontend
fi

# Verificar se o build foi bem-sucedido
if [[ ! -d "dist/public" ]]; then
    log_error "Build falhou. Diretório 'dist/public' não encontrado."
    exit 1
fi

# Verificar tamanho do build
BUILD_SIZE=$(du -sh dist/public | cut -f1)
log "📏 Tamanho do build: $BUILD_SIZE"

# Criar diretório web se não existir
if [[ ! -d "$WEB_ROOT" ]]; then
    log "📁 Criando diretório web: $WEB_ROOT"
    sudo mkdir -p "$WEB_ROOT"
fi

# Copiar arquivos para o diretório web
log "📋 Copiando arquivos para $WEB_ROOT"
sudo cp -r dist/public/* "$WEB_ROOT/"

# Configurar permissões
log "🔐 Configurando permissões"
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# Verificar configuração do Nginx
log "🔧 Verificando configuração do Nginx"
sudo nginx -t || {
    log_error "Configuração do Nginx inválida. Verifique os arquivos de configuração."
    exit 1
}

# Recarregar Nginx
log "🔄 Recarregando Nginx"
sudo systemctl reload nginx || {
    log_error "Falha ao recarregar Nginx"
    exit 1
}

# Verificar se Nginx está rodando
if sudo systemctl is-active --quiet nginx; then
    log_success "Nginx está rodando corretamente"
else
    log_error "Nginx não está rodando"
    sudo systemctl status nginx
    exit 1
fi

# Health check
log "🏥 Executando health check"
if [[ "$ENV" == "production" ]]; then
    HEALTH_URL="http://localhost/health"
else
    HEALTH_URL="http://localhost:8080/health"
fi

if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
    log_success "Health check passou"
else
    log_warning "Health check falhou. Verifique se o endpoint /health está configurado no Nginx."
fi

# Limpeza de backups antigos
log "🧹 Limpando backups antigos (>7 dias)"
sudo find /var/www -name "*.backup.*" -mtime +7 -delete 2>/dev/null || true

# Limpeza de cache do navegador (opcional)
log "🗑️  Limpando cache de build antigo"
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf dist 2>/dev/null || true

# Verificar espaço em disco
DISK_USAGE=$(df -h "$WEB_ROOT" | awk 'NR==2{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -gt 80 ]]; then
    log_warning "Uso de disco alto: ${DISK_USAGE}%. Considere limpeza."
else
    log "💾 Uso de disco: ${DISK_USAGE}%"
fi

# Mostrar informações do deploy
log "📊 Informações do deploy:"
echo "   • Ambiente: $ENV"
echo "   • Diretório web: $WEB_ROOT"
echo "   • Tamanho do build: $BUILD_SIZE"
echo "   • Data/hora: $(date)"
echo "   • Commit: $(git rev-parse --short HEAD)"
echo "   • Branch: $(git branch --show-current)"

# Verificar principais arquivos
log "📁 Verificando arquivos principais:"
for file in "index.html" "assets" "favicon.ico"; do
    if [[ -e "$WEB_ROOT/$file" ]]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (não encontrado)"
    fi
done

# Notificação opcional (descomente se usar Slack/Discord)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"✅ Deploy do SGST Frontend concluído com sucesso em '$ENV'"}' \
#   YOUR_WEBHOOK_URL

log_success "Deploy do frontend concluído com sucesso para ambiente: $ENV"
log "🌐 Para acessar: http://localhost (ou seu domínio configurado)"
log "📝 Para ver logs do Nginx: sudo tail -f /var/log/nginx/access.log"
log "🔧 Para verificar status: sudo systemctl status nginx"

echo
log_success "🎉 Deploy finalizado! O frontend está disponível em $ENV."