#!/bin/bash

# Script de Backup do Banco de Dados SGST
# Uso: ./backup-database.sh [local|remote]

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

# Configurações padrão
BACKUP_TYPE=${1:-local}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/sgst"
LOCAL_BACKUP_DIR="./backups"
RETENTION_DAYS=7
MAX_BACKUPS=30

# Carregar variáveis de ambiente
if [[ -f ".env" ]]; then
    source .env
fi

# Configurações do banco
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-sgst_production}
DB_USER=${DB_USER:-sgst_user}
DB_PASSWORD=${DB_PASSWORD}

# Verificar se a senha foi fornecida
if [[ -z "$DB_PASSWORD" ]]; then
    log_error "Senha do banco de dados não configurada. Configure DB_PASSWORD no .env"
    exit 1
fi

log "🗄️  Iniciando backup do banco de dados SGST"
log "📋 Configurações:"
echo "   • Tipo: $BACKUP_TYPE"
echo "   • Host: $DB_HOST:$DB_PORT"
echo "   • Banco: $DB_NAME"
echo "   • Usuário: $DB_USER"
echo "   • Data: $DATE"

# Verificar se mysqldump está disponível
if ! command -v mysqldump &> /dev/null; then
    log_error "mysqldump não está instalado. Instale o MySQL client."
    exit 1
fi

# Configurar diretório de backup
if [[ "$BACKUP_TYPE" == "local" ]]; then
    BACKUP_PATH="$LOCAL_BACKUP_DIR"
else
    BACKUP_PATH="$BACKUP_DIR"
fi

# Criar diretório de backup se não existir
if [[ ! -d "$BACKUP_PATH" ]]; then
    log "📁 Criando diretório de backup: $BACKUP_PATH"
    mkdir -p "$BACKUP_PATH"
fi

# Nome do arquivo de backup
BACKUP_FILE="$BACKUP_PATH/sgst_backup_$DATE.sql"
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

# Testar conexão com o banco
log "🔌 Testando conexão com o banco de dados"
if ! mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" "$DB_NAME" > /dev/null 2>&1; then
    log_error "Falha na conexão com o banco de dados. Verifique as credenciais."
    exit 1
fi
log_success "Conexão com o banco estabelecida"

# Verificar espaço em disco
AVAILABLE_SPACE=$(df "$BACKUP_PATH" | awk 'NR==2{print $4}')
log "💾 Espaço disponível: $(df -h "$BACKUP_PATH" | awk 'NR==2{print $4}')"

if [[ $AVAILABLE_SPACE -lt 1048576 ]]; then # Menos de 1GB
    log_warning "Pouco espaço em disco disponível. Considere limpeza de backups antigos."
fi

# Executar backup
log "📦 Iniciando backup do banco de dados..."
start_time=$(date +%s)

# Opções do mysqldump para backup completo
MYSQLDUMP_OPTIONS="
    --single-transaction
    --routines
    --triggers
    --events
    --add-drop-table
    --add-locks
    --create-options
    --disable-keys
    --extended-insert
    --quick
    --lock-tables=false
    --set-charset
    --comments
    --dump-date
"

# Executar mysqldump
if mysqldump $MYSQL_DUMP_OPTIONS \
    -h"$DB_HOST" \
    -P"$DB_PORT" \
    -u"$DB_USER" \
    -p"$DB_PASSWORD" \
    "$DB_NAME" > "$BACKUP_FILE"; then
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    log_success "Backup SQL criado: $BACKUP_FILE"
    log "⏱️  Tempo de execução: ${duration}s"
    
    # Verificar tamanho do backup
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "📏 Tamanho do backup: $BACKUP_SIZE"
    
    # Comprimir backup
    log "🗜️  Comprimindo backup..."
    if gzip "$BACKUP_FILE"; then
        COMPRESSED_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
        log_success "Backup comprimido: $BACKUP_FILE_GZ ($COMPRESSED_SIZE)"
    else
        log_error "Falha na compressão do backup"
        exit 1
    fi
else
    log_error "Falha no backup do banco de dados"
    exit 1
fi

# Verificar integridade do backup
log "🔍 Verificando integridade do backup..."
if gzip -t "$BACKUP_FILE_GZ"; then
    log_success "Backup íntegro"
else
    log_error "Backup corrompido"
    exit 1
fi

# Criar backup de metadados
METADATA_FILE="$BACKUP_PATH/sgst_metadata_$DATE.json"
log "📋 Criando arquivo de metadados: $METADATA_FILE"

cat > "$METADATA_FILE" << EOF
{
  "backup_date": "$(date -Iseconds)",
  "database_name": "$DB_NAME",
  "database_host": "$DB_HOST:$DB_PORT",
  "backup_file": "$(basename "$BACKUP_FILE_GZ")",
  "backup_size": "$COMPRESSED_SIZE",
  "backup_duration": "${duration}s",
  "mysql_version": "$(mysql --version)",
  "backup_type": "$BACKUP_TYPE",
  "git_commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF

# Limpeza de backups antigos
log "🧹 Limpando backups antigos (>$RETENTION_DAYS dias)"
find "$BACKUP_PATH" -name "sgst_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$BACKUP_PATH" -name "sgst_metadata_*.json" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Manter apenas os últimos N backups
BACKUP_COUNT=$(find "$BACKUP_PATH" -name "sgst_backup_*.sql.gz" | wc -l)
if [[ $BACKUP_COUNT -gt $MAX_BACKUPS ]]; then
    log "🗑️  Removendo backups excedentes (mantendo últimos $MAX_BACKUPS)"
    find "$BACKUP_PATH" -name "sgst_backup_*.sql.gz" -type f -printf '%T@ %p\n' | \
        sort -n | head -n -$MAX_BACKUPS | cut -d' ' -f2- | xargs rm -f
    find "$BACKUP_PATH" -name "sgst_metadata_*.json" -type f -printf '%T@ %p\n' | \
        sort -n | head -n -$MAX_BACKUPS | cut -d' ' -f2- | xargs rm -f
fi

# Upload para armazenamento remoto (opcional)
if [[ "$BACKUP_TYPE" == "remote" && -n "$REMOTE_BACKUP_URL" ]]; then
    log "☁️  Enviando backup para armazenamento remoto..."
    
    # Exemplo para AWS S3 (descomente e configure)
    # aws s3 cp "$BACKUP_FILE_GZ" "$REMOTE_BACKUP_URL/$(basename "$BACKUP_FILE_GZ")"
    # aws s3 cp "$METADATA_FILE" "$REMOTE_BACKUP_URL/$(basename "$METADATA_FILE")"
    
    # Exemplo para rsync (descomente e configure)
    # rsync -avz "$BACKUP_FILE_GZ" "$REMOTE_BACKUP_URL/"
    # rsync -avz "$METADATA_FILE" "$REMOTE_BACKUP_URL/"
    
    log_warning "Upload remoto não configurado. Configure REMOTE_BACKUP_URL e descomente as linhas apropriadas."
fi

# Estatísticas finais
log "📊 Estatísticas do backup:"
echo "   • Arquivo: $(basename "$BACKUP_FILE_GZ")"
echo "   • Tamanho: $COMPRESSED_SIZE"
echo "   • Duração: ${duration}s"
echo "   • Local: $BACKUP_PATH"
echo "   • Backups totais: $(find "$BACKUP_PATH" -name "sgst_backup_*.sql.gz" | wc -l)"

# Notificação opcional (descomente se usar Slack/Discord)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"✅ Backup do SGST Database concluído: '$COMPRESSED_SIZE' em '${duration}s'"}' \
#   YOUR_WEBHOOK_URL

log_success "Backup do banco de dados concluído com sucesso!"
log "📁 Arquivo: $BACKUP_FILE_GZ"
log "📋 Metadados: $METADATA_FILE"
log "🔄 Para restaurar: zcat $BACKUP_FILE_GZ | mysql -u$DB_USER -p $DB_NAME"

echo
log_success "🎉 Backup finalizado!"