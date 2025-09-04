require('dotenv').config();
const mysql = require('mysql2/promise');

async function testCategory() {
  let connection;
  try {
    // Criar conexão
    connection = await mysql.createConnection({
      host: '193.203.166.230',
      port: 3306,
      user: 'u824538998_gstock',
      password: 'Gstock.2025',
      database: 'u824538998_gstock_db'
    });
    
    console.log('✅ Conectado à base de dados');
    
    // Verificar se a tabela categories existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'categories'");
    
    if (tables.length === 0) {
      console.log('❌ Tabela categories não existe');
      
      // Criar tabela categories
      await connection.execute(`
        CREATE TABLE categories (
          id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabela categories criada');
    } else {
      console.log('✅ Tabela categories já existe');
    }
    
    // Testar inserção de categoria
    const [result] = await connection.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      ['Teste', 'Categoria de teste']
    );
    
    console.log('✅ Categoria criada com sucesso:', result.insertId);
    
    // Listar categorias
    const [categories] = await connection.execute('SELECT * FROM categories');
    console.log('📋 Categorias existentes:', categories.length);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testCategory();