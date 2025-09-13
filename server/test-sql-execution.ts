import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testSQLExecution() {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não encontrada nas variáveis de ambiente');
    }
    
    const url = new URL(process.env.DATABASE_URL);
    
    connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: parseInt(url.port || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ Conectado ao banco de dados!');
    
    // Testar criação da tabela vehicle_types
    console.log('🔄 Criando tabela vehicle_types...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vehicle_types (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'commercial',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela vehicle_types criada!');
    
    // Testar criação da tabela fuel_types
    console.log('🔄 Criando tabela fuel_types...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS fuel_types (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50) NOT NULL DEFAULT 'liquid',
        unit VARCHAR(20) NOT NULL DEFAULT 'litros',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela fuel_types criada!');
    
    // Verificar se as tabelas existem
    console.log('🔍 Verificando tabelas...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'vehicle_types'");
    console.log('📊 Tabelas vehicle_types encontradas:', (tables as any[]).length);
    
    const [fuelTables] = await connection.execute("SHOW TABLES LIKE 'fuel_types'");
    console.log('📊 Tabelas fuel_types encontradas:', (fuelTables as any[]).length);
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada.');
    }
  }
}

// Executar o teste
testSQLExecution().then(() => {
  console.log('✅ Teste concluído!');
}).catch((error) => {
  console.error('❌ Erro no teste:', error instanceof Error ? error.message : String(error));
});