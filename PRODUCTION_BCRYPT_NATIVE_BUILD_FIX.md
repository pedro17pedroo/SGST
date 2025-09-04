# Correção - Erro de Build Nativo do bcrypt

## Problema Identificado
O erro `No native build was found for platform=linux arch=x64 runtime=node abi=108` ocorre porque o bcrypt precisa ser compilado nativamente para a plataforma Linux do servidor, mas as ferramentas de build necessárias não estão instaladas.

## Erro Específico
```
Error: No native build was found for platform=linux arch=x64 runtime=node abi=108 uv=1 libc=glibc node=18.20.8
    loaded from: /var/www/gstock/back
    at Function.Co.resolve.Co.path (/var/www/node_modules/node-gyp-build/node-gyp-build.js:60:9)
    at Co (/var/www/node_modules/node-gyp-build/node-gyp-build.js:22:30)
    at /var/www/node_modules/bcrypt/bcrypt.js:2:18
```

## Causa Raiz
1. O bcrypt é uma dependência nativa que precisa ser compilada para cada plataforma
2. O servidor Linux não possui as ferramentas de build necessárias (`build-essential`, `make`, `g++`)
3. O `npm install` não consegue compilar o bcrypt durante a instalação

## Soluções Disponíveis

### Opção 1: Instalar Ferramentas de Build (Recomendado)
```bash
# Atualizar repositórios
sudo apt update

# Instalar ferramentas de build essenciais
sudo apt install -y build-essential python3-dev

# Navegar para o diretório do projeto
cd /var/www/gstock/back

# Parar o serviço PM2
pm2 delete API-gstock

# Limpar node_modules e reinstalar com compilação nativa
rm -rf node_modules package-lock.json
npm install --production

# Reiniciar o serviço
pm2 start index.js --name "API-gstock"
```

### Opção 2: Usar bcryptjs (Alternativa JavaScript Pura)
Substituir bcrypt por bcryptjs que não requer compilação nativa:

```bash
# No ambiente local, alterar package.json
# Substituir "bcrypt": "^6.0.0" por "bcryptjs": "^2.4.3"

# Atualizar imports no código (se necessário)
# De: import bcrypt from 'bcrypt'
# Para: import bcrypt from 'bcryptjs'

# Recompilar e fazer deploy
npm run build
```

### Opção 3: Usar Binários Pré-compilados
```bash
# Forçar instalação com binários pré-compilados
cd /var/www/gstock/back
pm2 delete API-gstock
rm -rf node_modules
npm install --production --build-from-source=false
pm2 start index.js --name "API-gstock"
```

## Comando Único (Opção 1 - Recomendado)
```bash
# Executar como root no servidor
sudo apt update && sudo apt install -y build-essential python3-dev && \
cd /var/www/gstock/back && \
pm2 delete API-gstock && \
rm -rf node_modules package-lock.json && \
npm install --production && \
pm2 start index.js --name "API-gstock" && \
pm2 status
```

## Verificação Pós-Correção
```bash
# Verificar se o serviço está rodando
pm2 status

# Verificar logs para confirmar que não há erros
pm2 logs API-gstock --lines 20

# Testar a API
curl -k https://gstock-api.tatusolutions.com/health

# Verificar se o bcrypt foi compilado corretamente
node -e "console.log(require('bcrypt').hashSync('test', 10))"
```

## Prevenção de Problemas Futuros

### 1. Manter Ferramentas de Build Instaladas
```bash
# Verificar se as ferramentas estão instaladas
which make
which g++
which python3
```

### 2. Usar Docker (Recomendado para Produção)
Considerar usar containers Docker que já incluem todas as dependências:

```dockerfile
FROM node:18-alpine
RUN apk add --no-cache make g++ python3
# ... resto da configuração
```

### 3. Alternativa bcryptjs
Para evitar problemas de compilação nativa, considerar migrar para bcryptjs:

**Vantagens:**
- JavaScript puro (sem compilação nativa)
- API compatível com bcrypt
- Funciona em qualquer plataforma

**Desvantagens:**
- Ligeiramente mais lento que bcrypt nativo
- Menos otimizado para performance

## Dependências Nativas no Projeto
Atualmente o projeto usa estas dependências que podem precisar de compilação:
- `bcrypt` - Hash de senhas (nativo)
- `mysql2` - Driver MySQL (pode usar binários pré-compilados)

## Próximos Passos
1. Escolher uma das opções de solução
2. Executar os comandos no servidor
3. Verificar se o serviço inicia sem erros
4. Testar funcionalidades que usam bcrypt (login, registro)
5. Considerar migração para bcryptjs se problemas persistirem

## Notas Importantes
- A Opção 1 é a mais robusta e recomendada
- A Opção 2 (bcryptjs) requer alterações no código
- A Opção 3 pode não funcionar se não houver binários pré-compilados disponíveis
- Sempre fazer backup antes de executar comandos destrutivos como `rm -rf node_modules`