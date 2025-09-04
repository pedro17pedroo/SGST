# 🔧 SOLUÇÃO DEFINITIVA - PROBLEMA DE SESSÃO EM PRODUÇÃO

## 🚨 SITUAÇÃO ATUAL
O login funciona mas as requisições subsequentes retornam 401 (Unauthorized). Isso acontece porque:

1. **Node.js v18.20.8** é incompatível com **connect-session-sequelize@8.0.2**
2. O **index.js em produção** ainda não foi atualizado com o SequelizeStore
3. O **MemoryStore** ainda está sendo usado (não persiste sessões)

## 🎯 SOLUÇÃO COMPLETA

### OPÇÃO 1: CORREÇÃO AUTOMÁTICA (RECOMENDADA)

1. **No servidor de produção**, execute:
   ```bash
   # Fazer upload dos scripts
   # diagnose-production-session.sh
   # fix-production-session-complete.sh
   
   # Executar diagnóstico primeiro
   ./diagnose-production-session.sh
   
   # Executar correção completa
   ./fix-production-session-complete.sh
   ```

2. **Durante a execução**, quando solicitado:
   - Faça upload do arquivo `server/dist/index.js` → `index.js` (raiz)
   - Faça upload do arquivo `server/src/config/session.ts` → `src/config/session.ts`

### OPÇÃO 2: CORREÇÃO MANUAL

1. **Parar o PM2:**
   ```bash
   pm2 stop API-gstock
   ```

2. **Fazer backup:**
   ```bash
   cp index.js index.js.backup
   ```

3. **Corrigir dependência:**
   ```bash
   npm uninstall connect-session-sequelize
   npm install connect-session-sequelize@7.1.7
   ```

4. **Criar diretório:**
   ```bash
   mkdir -p src/config
   ```

5. **Fazer upload dos arquivos:**
   - `server/dist/index.js` → `index.js` (substituir)
   - `server/src/config/session.ts` → `src/config/session.ts` (novo)

6. **Reiniciar PM2:**
   ```bash
   pm2 start index.js --name "API-gstock"
   pm2 logs API-gstock
   ```

## 🔍 VERIFICAÇÃO DA CORREÇÃO

Após aplicar a correção, verifique:

1. **Logs do PM2 devem mostrar:**
   ```
   ✅ SequelizeStore initialized
   ✅ Sessions table synced
   ❌ NÃO deve aparecer "MemoryStore"
   ```

2. **Teste de autenticação:**
   ```bash
   # Login deve funcionar
   curl -X POST https://gstock-api.tatusolutions.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@bebidas-angola.ao","password":"admin123"}' \
     -c cookies.txt
   
   # Requisição subsequente deve funcionar (não retornar 401)
   curl -X GET https://gstock-api.tatusolutions.com/api/inventory/summary \
     -b cookies.txt
   ```

## 📁 ARQUIVOS NECESSÁRIOS

### 1. index.js (atualizado)
Localização local: `server/dist/index.js`
Destino produção: `index.js` (raiz)

**Características importantes:**
- Usa `SequelizeStore` em vez de `MemoryStore`
- Configuração de cookies para HTTPS
- CORS configurado para produção

### 2. session.ts
Localização local: `server/src/config/session.ts`
Destino produção: `src/config/session.ts`

**Características importantes:**
- Configuração do `connect-session-sequelize`
- Store SQLite para persistência
- Sincronização automática da tabela de sessões

## 🚨 PONTOS CRÍTICOS

1. **Versão do connect-session-sequelize:**
   - ❌ v8.0.2 (requer Node.js >= 22)
   - ✅ v7.1.7 (compatível com Node.js v18)

2. **Arquivos que DEVEM ser atualizados:**
   - `index.js` (principal - contém toda a lógica)
   - `src/config/session.ts` (configuração do store)

3. **Verificação obrigatória:**
   - Logs do PM2 não devem mencionar "MemoryStore"
   - Deve aparecer "SequelizeStore initialized"

## 🎯 RESULTADO ESPERADO

Após a correção:
- ✅ Login funciona normalmente
- ✅ Sessões persistem entre requisições
- ✅ Requisições subsequentes NÃO retornam 401
- ✅ Cookies funcionam corretamente com HTTPS
- ✅ Sistema totalmente funcional em produção

## 🆘 SE AINDA NÃO FUNCIONAR

1. **Verificar logs detalhados:**
   ```bash
   pm2 logs API-gstock --lines 50
   ```

2. **Verificar se os arquivos foram realmente atualizados:**
   ```bash
   grep -n "SequelizeStore" index.js
   grep -n "MemoryStore" index.js  # NÃO deve retornar nada
   ```

3. **Verificar dependências:**
   ```bash
   npm list connect-session-sequelize
   ```

4. **Reiniciar completamente:**
   ```bash
   pm2 delete API-gstock
   pm2 start index.js --name "API-gstock"
   ```

---

**💡 Esta solução resolve definitivamente o problema de sessão em produção!**