# CORREÇÃO URGENTE - PROBLEMA DE SESSÃO EM PRODUÇÃO

## 🚨 PROBLEMA IDENTIFICADO

O servidor em produção ainda está a usar o **MemoryStore** (visível nos logs) porque:
1. O arquivo `index.js` em produção não foi atualizado com as novas configurações
2. A versão do Node.js (v18.20.8) é incompatível com `connect-session-sequelize@8.0.2` (requer Node >= 22)

## ⚡ SOLUÇÃO IMEDIATA

### Opção 1: Downgrade do connect-session-sequelize (RECOMENDADO)

```bash
# No servidor de produção
cd /var/www/gstock/back

# Remover versão incompatível
npm uninstall connect-session-sequelize

# Instalar versão compatível com Node 18
npm install connect-session-sequelize@7.1.7

# Copiar arquivos atualizados do desenvolvimento
# (você precisa fazer upload dos arquivos dist/index.js e src/config/session.ts)

# Reiniciar o serviço
pm2 restart API-gstock
```

### Opção 2: Atualizar Node.js (MAIS COMPLEXO)

```bash
# Atualizar Node.js para versão 22+
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versão
node --version

# Reinstalar dependências
npm install --production

# Reiniciar serviço
pm2 restart API-gstock
```

## 📋 COMANDOS PARA EXECUTAR AGORA

```bash
# 1. Parar o serviço atual
pm2 stop API-gstock

# 2. Fazer backup
cp index.js index.js.backup

# 3. Instalar versão compatível
npm uninstall connect-session-sequelize
npm install connect-session-sequelize@7.1.7

# 4. Copiar arquivos atualizados (você precisa fazer upload)
# - dist/index.js (do seu ambiente de desenvolvimento)
# - criar pasta src/config/ e copiar session.ts

# 5. Reiniciar
pm2 start index.js --name "API-gstock"
```

## 🔍 VERIFICAÇÃO

Após a correção, os logs devem mostrar:
- ✅ "Sequelize session store configurado"
- ❌ Não deve aparecer "MemoryStore is not designed for production"

## 📁 ARQUIVOS NECESSÁRIOS

Você precisa copiar estes arquivos do desenvolvimento para produção:

1. **dist/index.js** - Arquivo principal compilado
2. **src/config/session.ts** - Configuração de sessão

## 🎯 RESULTADO ESPERADO

Após esta correção:
- Login funcionará normalmente
- Sessões serão persistidas entre requisições
- Erro 401 em requisições subsequentes será resolvido
- Cookies de sessão serão definidos corretamente