#!/bin/bash

# Script para corrigir problema de sessão em produção
# Execute este script no servidor de produção

echo "🚨 CORREÇÃO URGENTE - PROBLEMA DE SESSÃO"
echo "==========================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório /var/www/gstock/back"
    exit 1
fi

# Parar o serviço
echo "⏹️  Parando serviço API-gstock..."
pm2 stop API-gstock

# Fazer backup
echo "💾 Fazendo backup do index.js atual..."
cp index.js index.js.backup.$(date +%Y%m%d_%H%M%S)

# Remover versão incompatível e instalar versão compatível
echo "📦 Atualizando connect-session-sequelize para versão compatível..."
npm uninstall connect-session-sequelize
npm install connect-session-sequelize@7.1.7

if [ $? -ne 0 ]; then
    echo "❌ Erro na instalação. Restaurando backup..."
    pm2 start index.js --name "API-gstock"
    exit 1
fi

echo "✅ Dependências atualizadas com sucesso!"

# Criar diretório para configuração se não existir
mkdir -p src/config

echo "📁 Estrutura de diretórios criada"

# Instruções para upload de arquivos
echo ""
echo "📋 PRÓXIMOS PASSOS MANUAIS:"
echo "1. Faça upload do arquivo 'dist/index.js' do seu ambiente de desenvolvimento"
echo "2. Faça upload do arquivo 'src/config/session.ts' do seu ambiente de desenvolvimento"
echo "3. Execute: pm2 start index.js --name 'API-gstock'"
echo "4. Verifique os logs: pm2 logs API-gstock"
echo ""
echo "🎯 Após o upload, execute:"
echo "   pm2 start index.js --name 'API-gstock'"
echo "   pm2 logs API-gstock --lines 20"
echo ""
echo "✅ Script de preparação concluído!"
echo "⚠️  Aguardando upload dos arquivos atualizados..."