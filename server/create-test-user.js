import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: '193.203.166.230',
    port: 3306,
    user: 'u824538998_gstock',
    password: 'Gstock.2025',
    database: 'u824538998_gstock_db'
  });

  try {
    // Verificar se a tabela users existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log('❌ Tabela users não existe. Execute as migrações primeiro.');
      return;
    }

    // Verificar se já existe um utilizador admin
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE username = 'admin'"
    );

    if (existingUsers.length > 0) {
      console.log('✅ Utilizador admin já existe:', existingUsers[0]);
      return;
    }

    // Criar hash da password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Inserir utilizador de teste
    const [result] = await connection.execute(
      `INSERT INTO users (id, username, email, password, role, isActive, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['admin-001', 'admin', 'admin@sgst.com', hashedPassword, 'admin', true]
    );

    console.log('✅ Utilizador de teste criado com sucesso:', {
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

  } catch (error) {
    console.error('❌ Erro ao criar utilizador de teste:', error.message);
  } finally {
    await connection.end();
  }
}

createTestUser().catch(console.error);