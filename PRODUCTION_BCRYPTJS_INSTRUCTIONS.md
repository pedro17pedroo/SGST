# 🔧 Instruções para Aplicar Correção do bcryptjs no Servidor de Produção

## 📋 Situação Atual
O servidor de produção está apresentando erro do `bcrypt` devido à falta de dependências nativas para compilação:
```
Error: Could not locate the bindings file. Tried:
 → /var/www/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node
```

## ✅ Solução: Substituir bcrypt por bcryptjs

O `bcryptjs` é uma implementação JavaScript pura do bcrypt que:
- ✅ **Não requer compilação nativa**
- ✅ **100% compatível com bcrypt**
- ✅ **Mesma API e funcionalidades**
- ✅ **Funciona em qualquer ambiente Node.js**

## 🚀 Aplicação da Correção

### Opção 1: Script Automático (Recomendado)

1. **Fazer upload do script** para o servidor:
   ```bash
   scp PRODUCTION_BCRYPTJS_APPLY.sh root@srv943012:/var/www/gstock/back/
   ```

2. **Executar o script** no servidor:
   ```bash
   ssh root@srv943012
   cd /var/www/gstock/back
   chmod +x PRODUCTION_BCRYPTJS_APPLY.sh
   bash PRODUCTION_BCRYPTJS_APPLY.sh
   ```

### Opção 2: Comandos Manuais

Se preferir executar manualmente:

```bash
# 1. Parar o serviço
pm2 stop API-gstock

# 2. Navegar para o diretório
cd /var/www/gstock/back

# 3. Remover bcrypt e instalar bcryptjs
npm uninstall bcrypt
npm install bcryptjs@^2.4.3 @types/bcryptjs@^2.4.6

# 4. Atualizar imports (substituir bcrypt por bcryptjs)
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/import.*bcrypt.*from.*["'"'"']bcrypt["'"'"']/import bcryptjs from "bcryptjs"/g'
find . -name "*.ts" -o -name "*.js" | xargs sed -i 's/bcrypt\./bcryptjs\./g'

# 5. Recompilar (se necessário)
npm run build

# 6. Reiniciar serviço
pm2 start API-gstock

# 7. Verificar status
pm2 status API-gstock
pm2 logs API-gstock --lines 10
```

## 🔍 Verificação Pós-Correção

Após aplicar a correção, verifique:

1. **Status do PM2:**
   ```bash
   pm2 status API-gstock
   ```
   - Status deve estar "online"
   - Não deve haver restarts frequentes

2. **Logs do serviço:**
   ```bash
   pm2 logs API-gstock --lines 20
   ```
   - Não deve haver erros de bcrypt
   - Deve mostrar "serving on port 4002"

3. **Teste de funcionalidade:**
   ```bash
   curl -X POST http://localhost:4002/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

## 📦 Dependências Finais

Após a correção, o `package.json` deve conter:

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6"
  }
}
```

**Removido:** `bcrypt: ^6.0.0` (que causava o erro)

## 🎯 Vantagens da Solução

- **✅ Sem dependências nativas:** Não requer `node-gyp`, `python`, ou `build-essential`
- **✅ Portabilidade total:** Funciona em qualquer servidor Linux
- **✅ Compatibilidade:** API idêntica ao bcrypt original
- **✅ Manutenção:** Sem problemas de compilação em atualizações
- **✅ Performance:** Desempenho similar ao bcrypt nativo

## 🆘 Rollback (Se Necessário)

Se houver problemas, para reverter:

```bash
pm2 stop API-gstock
npm uninstall bcryptjs @types/bcryptjs
npm install bcrypt@^6.0.0
# Reverter imports manualmente
pm2 start API-gstock
```

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verificar logs: `pm2 logs API-gstock`
2. Verificar status: `pm2 status`
3. Reiniciar se necessário: `pm2 restart API-gstock`

---

**✅ Esta solução resolve definitivamente o problema de build nativo do bcrypt no servidor de produção.**