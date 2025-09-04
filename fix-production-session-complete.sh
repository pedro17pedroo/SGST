#!/bin/bash

# Script de Correção Completa - Problema de Sessão em Produção
# Este script resolve TODOS os problemas de sessão de uma vez

echo "🔧 CORREÇÃO COMPLETA - PROBLEMA DE SESSÃO EM PRODUÇÃO"
echo "===================================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script no diretório raiz do projeto (onde está o package.json)"
    exit 1
fi

echo "📋 Passo 1: Parar o serviço PM2..."
pm2 stop API-gstock
echo ""

echo "📋 Passo 2: Fazer backup do index.js atual..."
if [ -f "index.js" ]; then
    cp index.js index.js.backup-$(date +%Y%m%d-%H%M%S)
    echo "✅ Backup criado: index.js.backup-$(date +%Y%m%d-%H%M%S)"
else
    echo "⚠️  index.js não existe, continuando..."
fi
echo ""

echo "📋 Passo 3: Remover connect-session-sequelize incompatível..."
npm uninstall connect-session-sequelize
echo ""

echo "📋 Passo 4: Instalar connect-session-sequelize compatível com Node.js v18..."
npm install connect-session-sequelize@7.1.7
echo ""

echo "📋 Passo 5: Criar diretório src/config se não existir..."
mkdir -p src/config
echo "✅ Diretório src/config criado/verificado"
echo ""

echo "📋 Passo 6: Aguardando upload manual dos arquivos..."
echo "⚠️  AÇÃO MANUAL NECESSÁRIA:"
echo "   1. Faça upload do arquivo 'server/dist/index.js' para substituir o 'index.js' atual"
echo "   2. Faça upload do arquivo 'server/src/config/session.ts' para 'src/config/session.ts'"
echo ""
echo "💡 Após fazer o upload dos arquivos, pressione ENTER para continuar..."
read -p "Pressione ENTER após fazer o upload dos arquivos: "

echo "📋 Passo 7: Verificar se os arquivos foram atualizados..."
if [ -f "src/config/session.ts" ]; then
    echo "✅ src/config/session.ts existe"
else
    echo "❌ ERRO: src/config/session.ts não foi encontrado!"
    echo "   Por favor, faça upload do arquivo antes de continuar."
    exit 1
fi

if grep -q "SequelizeStore" index.js 2>/dev/null; then
    echo "✅ index.js contém SequelizeStore"
else
    echo "❌ ERRO: index.js não contém SequelizeStore!"
    echo "   Por favor, faça upload do arquivo dist/index.js atualizado."
    exit 1
fi
echo ""

echo "📋 Passo 8: Instalar dependências adicionais se necessário..."
npm install
echo ""

echo "📋 Passo 9: Reiniciar o serviço PM2..."
pm2 start index.js --name "API-gstock"
echo ""

echo "📋 Passo 10: Aguardar inicialização..."
sleep 5
echo ""

echo "📋 Passo 11: Verificar logs do PM2..."
echo "🔍 Logs recentes (últimas 20 linhas):"
pm2 logs API-gstock --lines 20
echo ""

echo "📋 Passo 12: Verificar status do PM2..."
pm2 list
echo ""

echo "🎯 CORREÇÃO COMPLETA!"
echo "===================="
echo "✅ Script de correção executado com sucesso!"
echo ""
echo "🔍 PRÓXIMOS PASSOS PARA TESTE:"
echo "1. Verifique se não há erros nos logs do PM2 acima"
echo "2. Teste o login no frontend"
echo "3. Verifique se as requisições subsequentes funcionam (não retornam 401)"
echo ""
echo "💡 Se ainda houver problemas:"
echo "   - Execute: pm2 logs API-gstock --lines 50"
echo "   - Verifique se o SequelizeStore está sendo usado"
echo "   - Confirme que não há mensagens de MemoryStore nos logs"
echo ""
echo "🚀 A aplicação deve estar funcionando corretamente agora!"