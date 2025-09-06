import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function testAdminPassword() {
  let connection;
  try {
    console.log('🔍 Testando passwords do utilizador admin...');
    
    // Conectar à base de dados usando DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não encontrado no .env');
    }
    
    // Parse da URL: mysql://user:password@host:port/database
    const url = new URL(databaseUrl);
    connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1) // Remove o '/' inicial
    });

    // Buscar o utilizador admin
    const [users] = await connection.execute(
      'SELECT id, username, email, password FROM users WHERE username = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.log('❌ Utilizador admin não encontrado!');
      return;
    }

    const adminUser = users[0];
    console.log('✅ Utilizador admin encontrado:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password Hash: ${adminUser.password.substring(0, 20)}...`);
    
    // Testar passwords comuns
    const passwordsToTest = [
      '123456',
      'admin123',
      'admin',
      'password',
      'bebidas123',
      'angola123',
      'sgst123'
    ];
    
    console.log('\n🔐 Testando passwords...');
    
    for (const testPassword of passwordsToTest) {
      const isMatch = await bcrypt.compare(testPassword, adminUser.password);
      console.log(`   ${testPassword}: ${isMatch ? '✅ MATCH!' : '❌ No match'}`);
      
      if (isMatch) {
        console.log(`\n🎉 Password encontrada: ${testPassword}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testAdminPassword();