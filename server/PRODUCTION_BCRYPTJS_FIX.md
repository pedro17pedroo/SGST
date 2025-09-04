# Correção do bcrypt com bcryptjs - Servidor de Produção

## Problema Resolvido
O erro `Error: No native build was found for platform=linux arch=x64 runtime=node abi=108` do bcrypt foi resolvido substituindo-o por bcryptjs, que é uma implementação JavaScript pura que não requer compilação nativa.

## Alterações Realizadas

### 1. Dependências Atualizadas
- **Removido**: `bcrypt@^6.0.0`
- **Adicionado**: `bcryptjs@^2.4.3` + `@types/bcryptjs`

### 2. Imports Atualizados
- `src/modules/auth/auth.controller.ts`: `import * as bcrypt from 'bcryptjs';`
- `src/modules/users/user.model.ts`: `import bcrypt from 'bcryptjs';`
- `src/seed.ts`: `import bcrypt from 'bcryptjs';`

### 3. Novo Build Gerado
- Arquivo `dist/index.js` recompilado com bcryptjs (1.7MB)
- Todas as dependências empacotadas, exceto mysql2 e drizzle-orm

## Comando Único para Servidor de Produção

```bash
# Parar serviço PM2, atualizar dependências e reiniciar
pm2 stop API-gstock && \
rm -rf node_modules package-lock.json && \
npm install bcryptjs @types/bcryptjs && \
npm uninstall bcrypt && \
pm2 start index.js --name "API-gstock"
```

## Passos Detalhados (Alternativa)

### 1. Parar o Serviço
```bash
pm2 stop API-gstock
```

### 2. Fazer Upload do Novo dist/index.js
- Substituir o arquivo `dist/index.js` no servidor pelo novo arquivo compilado

### 3. Atualizar Dependências
```bash
# Limpar dependências antigas
rm -rf node_modules package-lock.json

# Instalar nova dependência
npm install bcryptjs

# Remover dependência antiga (se ainda existir)
npm uninstall bcrypt
```

### 4. Reiniciar Serviço
```bash
pm2 start index.js --name "API-gstock"
```

## Verificação Pós-Correção

### 1. Verificar Status do PM2
```bash
pm2 status
pm2 logs API-gstock --lines 20
```

### 2. Testar API de Saúde
```bash
curl http://localhost:3000/health
```

### 3. Testar Autenticação
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Vantagens do bcryptjs

✅ **Sem Compilação Nativa**: JavaScript puro, funciona em qualquer ambiente Node.js
✅ **Compatibilidade Total**: API idêntica ao bcrypt original
✅ **Sem Dependências de Build**: Não requer build-essential, make, g++
✅ **Portabilidade**: Funciona em qualquer arquitetura (x64, ARM, etc.)
✅ **Manutenção**: Menos problemas de compatibilidade entre versões do Node.js

## Dependências Finais

### Empacotadas no dist/index.js:
- bcryptjs (nova)
- nanoid
- dotenv
- hono
- @hono/node-server
- @hono/zod-validator
- cors
- express
- express-session
- jsonwebtoken
- zod

### Externas (devem estar no node_modules):
- mysql2
- drizzle-orm

## Notas Importantes

- ⚠️ **Performance**: bcryptjs é ligeiramente mais lento que bcrypt nativo, mas a diferença é mínima para a maioria dos casos
- ✅ **Segurança**: Mantém o mesmo nível de segurança do bcrypt original
- ✅ **Compatibilidade**: Hashes gerados são compatíveis entre bcrypt e bcryptjs
- ✅ **Estabilidade**: Elimina problemas de compilação nativa em diferentes ambientes

Esta solução resolve definitivamente o problema de build nativo do bcrypt no servidor de produção.