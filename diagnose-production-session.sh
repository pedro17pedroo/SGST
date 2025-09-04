#!/bin/bash

# Script de Diagnóstico Completo - Problema de Sessão em Produção
# Este script verifica o estado atual do servidor e identifica o que precisa ser corrigido

echo "🔍 DIAGNÓSTICO COMPLETO - PROBLEMA DE SESSÃO EM PRODUÇÃO"
echo "============================================================"
echo ""

# 1. Verificar versão do Node.js
echo "📋 1. VERSÃO DO NODE.JS:"
node --version
echo ""

# 2. Verificar se connect-session-sequelize está instalado e qual versão
echo "📋 2. CONNECT-SESSION-SEQUELIZE:"
if npm list connect-session-sequelize 2>/dev/null; then
    echo "✅ connect-session-sequelize está instalado"
else
    echo "❌ connect-session-sequelize NÃO está instalado"
fi
echo ""

# 3. Verificar se o diretório src/config existe
echo "📋 3. DIRETÓRIO src/config:"
if [ -d "src/config" ]; then
    echo "✅ Diretório src/config existe"
    if [ -f "src/config/session.ts" ]; then
        echo "✅ Arquivo src/config/session.ts existe"
        echo "📄 Conteúdo do session.ts:"
        head -10 src/config/session.ts
    else
        echo "❌ Arquivo src/config/session.ts NÃO existe"
    fi
else
    echo "❌ Diretório src/config NÃO existe"
fi
echo ""

# 4. Verificar o index.js atual
echo "📋 4. ARQUIVO INDEX.JS ATUAL:"
if [ -f "index.js" ]; then
    echo "✅ index.js existe"
    echo "📄 Primeiras linhas do index.js:"
    head -20 index.js
    echo ""
    echo "🔍 Procurando por 'MemoryStore' no index.js:"
    if grep -n "MemoryStore" index.js; then
        echo "❌ PROBLEMA: MemoryStore ainda está sendo usado!"
    else
        echo "✅ MemoryStore não encontrado no index.js"
    fi
    echo ""
    echo "🔍 Procurando por 'SequelizeStore' no index.js:"
    if grep -n "SequelizeStore" index.js; then
        echo "✅ SequelizeStore encontrado no index.js"
    else
        echo "❌ PROBLEMA: SequelizeStore não encontrado no index.js!"
    fi
else
    echo "❌ index.js NÃO existe"
fi
echo ""

# 5. Verificar status do PM2
echo "📋 5. STATUS DO PM2:"
pm2 list
echo ""

# 6. Verificar logs recentes do PM2
echo "📋 6. LOGS RECENTES DO PM2 (últimas 20 linhas):"
pm2 logs API-gstock --lines 20
echo ""

# 7. Verificar se há backup do index.js
echo "📋 7. BACKUP DO INDEX.JS:"
if [ -f "index.js.backup" ]; then
    echo "✅ Backup index.js.backup existe"
else
    echo "❌ Backup index.js.backup NÃO existe"
fi
echo ""

# 8. Verificar dependências no package.json
echo "📋 8. DEPENDÊNCIAS RELACIONADAS À SESSÃO:"
if [ -f "package.json" ]; then
    echo "🔍 Procurando dependências de sessão no package.json:"
    grep -A 5 -B 5 "session" package.json || echo "Nenhuma dependência de sessão encontrada"
else
    echo "❌ package.json NÃO existe"
fi
echo ""

echo "🎯 RESUMO DO DIAGNÓSTICO:"
echo "========================"
echo "1. Execute este script no servidor de produção"
echo "2. Analise cada seção para identificar problemas"
echo "3. Os principais pontos a verificar são:"
echo "   - Versão do Node.js (deve ser >= 22 para connect-session-sequelize@8.x)"
echo "   - Presença do connect-session-sequelize instalado"
echo "   - Existência dos arquivos src/config/session.ts"
echo "   - Se o index.js foi atualizado (não deve ter MemoryStore)"
echo "   - Logs do PM2 para erros específicos"
echo ""
echo "💡 Após o diagnóstico, execute as correções necessárias!"