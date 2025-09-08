import { testConnection } from './database/db';

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  try {
    await testConnection();
    console.log('✅ Conexão com o banco de dados bem-sucedida!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na conexão com o banco de dados:', error);
    process.exit(1);
  }
}

testDatabaseConnection();