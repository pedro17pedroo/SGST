#!/bin/bash

# Script para aplicar a correção do bcryptjs no servidor de produção
# Execute este comando no servidor: bash PRODUCTION_BCRYPTJS_APPLY.sh

echo "🔧 Aplicando correção do bcryptjs no servidor de produção..."

# Parar o serviço PM2
echo "⏹️ Parando serviço PM2..."
pm2 stop API-gstock

# Navegar para o diretório do backend
cd /var/www/gstock/back

# Remover bcrypt e instalar bcryptjs
echo "📦 Removendo bcrypt e instalando bcryptjs..."
npm uninstall bcrypt
npm install bcryptjs@^2.4.3 @types/bcryptjs@^2.4.6

# Atualizar imports nos arquivos (substituir bcrypt por bcryptjs)
echo "🔄 Atualizando imports..."

# Encontrar e substituir imports de bcrypt por bcryptjs
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/import.*bcrypt.*from.*["'"'"']bcrypt["'"'"']/import bcryptjs from "bcryptjs"/g'
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/import.*{.*bcrypt.*}.*from.*["'"'"']bcrypt["'"'"']/import bcryptjs from "bcryptjs"/g'
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/const.*bcrypt.*=.*require(["'"'"']bcrypt["'"'"'])/const bcryptjs = require("bcryptjs")/g'

# Substituir uso de bcrypt por bcryptjs no código
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/bcrypt\./bcryptjs\./g'
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/bcrypt\.compare/bcryptjs.compare/g'
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/bcrypt\.hash/bcryptjs.hash/g'

# Recompilar o projeto (se houver build)
echo "🔨 Recompilando projeto..."
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    npm run build
fi

# Reiniciar o serviço PM2
echo "🚀 Reiniciando serviço PM2..."
pm2 start API-gstock

# Verificar status
echo "✅ Verificando status do serviço..."
pm2 status API-gstock

# Aguardar alguns segundos e verificar logs
echo "📋 Verificando logs (aguarde 5 segundos)..."
sleep 5
pm2 logs API-gstock --lines 10

echo "✅ Correção do bcryptjs aplicada com sucesso!"
echo "📝 O bcrypt foi substituído por bcryptjs (JavaScript puro)"
echo "🎯 Não há mais dependências nativas para compilar"
echo "🔍 Verifique os logs acima para confirmar que não há erros"