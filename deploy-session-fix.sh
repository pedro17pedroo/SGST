#!/bin/bash

# Script para fazer deploy da correção de sessão

echo "🚀 Iniciando deploy da correção de sessão..."

# Navegar para o diretório do servidor
cd server

# Fazer build da aplicação
echo "📦 Fazendo build da aplicação..."
npm run build:prod

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Abortando deploy."
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Copiar arquivos para o servidor (assumindo que você tem acesso SSH)
echo "📤 Fazendo upload dos arquivos..."

# Nota: Você precisará ajustar estes comandos conforme sua configuração de deploy
echo "⚠️  ATENÇÃO: Você precisa fazer o upload dos seguintes arquivos para o servidor:"
echo "   - dist/index.js"
echo "   - dist/index.js.map"
echo "   - package.json (com as novas dependências)"
echo "   - src/config/session.ts"

echo "📋 Comandos para executar no servidor:"
echo "   1. npm install (para instalar as novas dependências)"
echo "   2. Reiniciar o serviço (pm2 restart API-gstock ou similar)"

echo "🔧 Alterações implementadas:"
echo "   ✓ Adicionado session store persistente com Sequelize"
echo "   ✓ Configuração de sessão otimizada para produção"
echo "   ✓ Suporte a SQLite para armazenamento de sessões"

echo "🎯 Isso deve resolver o problema de sessões não persistindo após o login."