# Correção Urgente - Problemas de Compatibilidade Node.js

## Problemas Identificados

1. ❌ **Node.js 18.20.8** no servidor (better-sqlite3 requer Node.js 20+)
2. ❌ **Comando 'make' em falta** (necessário para compilar dependências nativas)
3. ❌ **better-sqlite3@12.2.0** incompatível com Node.js 18

## Soluções Disponíveis

### Opção 1: Atualizar Node.js (Recomendado)

#### 1.1. Instalar Node.js 20 LTS:
```bash
# Baixar e instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versão
node --version  # Deve mostrar v20.x.x
npm --version
```

#### 1.2. Instalar ferramentas de build:
```bash
# Instalar make e ferramentas de compilação
sudo apt-get update
sudo apt-get install -y build-essential

# Verificar se make está disponível
which make
```

#### 1.3. Reinstalar dependências:
```bash
cd /var/www/gstock/back

# Limpar instalação anterior
rm -rf node_modules package-lock.json

# Reinstalar
npm install --production

# Iniciar serviço
pm2 start index.js --name "API-gstock"
```

### Opção 2: Usar Versão Compatível do better-sqlite3

#### 2.1. Modificar package.json para usar versão compatível:
```bash
cd /var/www/gstock/back

# Backup do package.json
cp package.json package.json.backup

# Editar package.json para usar better-sqlite3 compatível
sed -i 's/"better-sqlite3": "^12.2.0"/"better-sqlite3": "^8.7.0"/' package.json
```

#### 2.2. Instalar ferramentas de build:
```bash
sudo apt-get update
sudo apt-get install -y build-essential python3
```

#### 2.3. Reinstalar dependências:
```bash
# Limpar instalação anterior
rm -rf node_modules package-lock.json

# Instalar com versão compatível
npm install --production

# Iniciar serviço
pm2 start index.js --name "API-gstock"
```

### Opção 3: Remover better-sqlite3 (Se não for usado)

#### 3.1. Verificar se better-sqlite3 é realmente necessário:
```bash
cd /var/www/gstock/back

# Procurar uso do better-sqlite3 no código
grep -r "better-sqlite3" .
grep -r "sqlite" .
```

#### 3.2. Se não for usado, remover do package.json:
```bash
# Backup
cp package.json package.json.backup

# Remover better-sqlite3
npm uninstall better-sqlite3

# Ou editar manualmente o package.json removendo a linha:
# "better-sqlite3": "^12.2.0",
```

#### 3.3. Reinstalar sem better-sqlite3:
```bash
rm -rf node_modules package-lock.json
npm install --production
pm2 start index.js --name "API-gstock"
```

### Opção 4: Usar MySQL apenas (Recomendado para Produção)

#### 4.1. Verificar se o projeto usa MySQL:
```bash
cd /var/www/gstock/back
grep -r "mysql" .
cat .env | grep DATABASE_URL
```

#### 4.2. Modificar package.json para remover SQLite:
```json
{
  "dependencies": {
    "@hono/node-server": "^1.13.7",
    "@hono/zod-validator": "^0.4.1",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/express-session": "^1.18.2",
    "@types/jsonwebtoken": "^9.0.10",
    "bcrypt": "^6.0.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "drizzle-orm": "^0.36.4",
    "drizzle-zod": "^0.8.3",
    "express": "^5.1.0",
    "express-session": "^1.18.2",
    "hono": "^4.6.14",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.14.4",
    "nanoid": "^5.1.5",
    "zod": "^3.23.8"
  }
}
```

#### 4.3. Instalar apenas dependências necessárias:
```bash
rm -rf node_modules package-lock.json
npm install --production
```

## Comandos de Verificação

### Verificar versões:
```bash
node --version
npm --version
which make
python3 --version
```

### Verificar se o serviço inicia:
```bash
pm2 list
pm2 logs API-gstock --lines 10
```

### Testar a API:
```bash
curl http://localhost:4002/health
```

## Solução Rápida (Mais Provável de Funcionar)

```bash
# 1. Instalar ferramentas de build
sudo apt-get update
sudo apt-get install -y build-essential python3

# 2. Atualizar Node.js para versão 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Verificar versões
node --version
npm --version

# 4. Reinstalar dependências
cd /var/www/gstock/back
rm -rf node_modules package-lock.json
npm install --production

# 5. Iniciar serviço
pm2 delete API-gstock 2>/dev/null || true
pm2 start index.js --name "API-gstock"

# 6. Verificar
pm2 status
pm2 logs API-gstock --lines 5
curl http://localhost:4002/health
```

## Alternativa Sem Atualizar Node.js

Se não puder atualizar o Node.js:

```bash
# 1. Instalar ferramentas de build
sudo apt-get update
sudo apt-get install -y build-essential python3

# 2. Modificar package.json para usar better-sqlite3 compatível
cd /var/www/gstock/back
cp package.json package.json.backup
sed -i 's/"better-sqlite3": "^12.2.0"/"better-sqlite3": "^8.7.0"/' package.json

# 3. Reinstalar
rm -rf node_modules package-lock.json
npm install --production

# 4. Iniciar
pm2 delete API-gstock 2>/dev/null || true
pm2 start index.js --name "API-gstock"
```

## Verificação Final

Após qualquer solução:

```bash
# Status do PM2
pm2 status

# Logs do serviço
pm2 logs API-gstock --lines 10

# Teste da API
curl http://localhost:4002/health

# Se funcionar, salvar configuração
pm2 save
```

## Prevenção

Para evitar problemas futuros:

1. **Manter Node.js atualizado** (versão LTS)
2. **Usar Docker** para consistência entre ambientes
3. **Testar dependências** antes do deploy
4. **Documentar versões** no README

## Resumo dos Comandos Essenciais

```bash
# Solução completa (recomendada)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
cd /var/www/gstock/back
rm -rf node_modules package-lock.json
npm install --production
pm2 delete API-gstock 2>/dev/null || true
pm2 start index.js --name "API-gstock"
pm2 status && curl http://localhost:4002/health
```