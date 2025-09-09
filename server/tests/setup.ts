import { beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuração global para testes
beforeAll(async () => {
  // Verificar se as variáveis de ambiente necessárias estão definidas
  const requiredEnvVars = [
    'DATABASE_URL',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Variáveis de ambiente em falta: ${missingVars.join(', ')}`);
    console.warn('Os testes podem falhar se a conexão com a base de dados não estiver configurada corretamente.');
  }

  console.log('🧪 Configuração de testes iniciada');
  console.log(`📊 Base de dados: ${process.env.DB_NAME || 'não configurada'}`);
  console.log(`🌐 Host: ${process.env.DB_HOST || 'não configurado'}`);
});

afterAll(async () => {
  console.log('🧹 Limpeza de testes concluída');
});