const dotenv = require('dotenv');
dotenv.config();

const mysql = require('mysql2/promise');

async function addCostPriceColumn() {
  let connection;
  
  try {
    // Criar conexão com o banco de dados
    connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('Conectado ao banco de dados...');
    
    // Verificar se a coluna já existe
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'cost_price' AND TABLE_SCHEMA = DATABASE()"
    );
    
    if (columns.length > 0) {
      console.log('A coluna cost_price já existe na tabela products.');
      return;
    }
    
    // Adicionar a coluna cost_price
    await connection.execute(
      "ALTER TABLE products ADD COLUMN cost_price DECIMAL(10,2) NOT NULL DEFAULT 0"
    );
    
    console.log('Coluna cost_price adicionada com sucesso à tabela products!');
    
  } catch (error) {
    console.error('Erro ao adicionar coluna cost_price:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexão fechada.');
    }
  }
}

addCostPriceColumn();