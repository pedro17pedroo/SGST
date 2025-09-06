import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminUser() {
  let connection;
  try {
    console.log('🔍 Verificando utilizador admin...');
    
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
      'SELECT id, username, email FROM users WHERE email = ?',
      ['admin@bebidas-angola.ao']
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
    
    // Buscar roles do utilizador
    const [userRoles] = await connection.execute(`
      SELECT ur.id, ur.user_id, ur.role_id, r.name as role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, [adminUser.id]);
    
    console.log(`   Roles: ${userRoles.length}`);
    
    for (const userRole of userRoles) {
      console.log(`   Role: ${userRole.role_name}`);
      
      // Buscar permissões do role
      const [permissions] = await connection.execute(`
        SELECT p.name as permission_name
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
      `, [userRole.role_id]);
      
      console.log(`   Permissões: ${permissions.length}`);
      permissions.forEach((perm, index) => {
        console.log(`     ${index + 1}. ${perm.permission_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar utilizador admin:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAdminUser();