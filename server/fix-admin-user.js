import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixAdminUser() {
  let connection;
  try {
    console.log('🔧 Corrigindo utilizador admin...');
    
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

    // Verificar se o utilizador antigo existe
    const [oldUsers] = await connection.execute(
      'SELECT id, username, email FROM users WHERE id = ?',
      ['c08c248e-8a80-11f0-aefa-34b4ed86d8a9']
    );

    if (oldUsers.length > 0) {
      console.log('✅ Utilizador antigo encontrado:', oldUsers[0]);
      
      // Buscar o role de Administrador
      const [adminRoles] = await connection.execute(
        'SELECT id FROM roles WHERE name = ?',
        ['Administrador']
      );
      
      if (adminRoles.length > 0) {
        const adminRoleId = adminRoles[0].id;
        console.log('✅ Role Administrador encontrado:', adminRoleId);
        
        // Verificar se já existe userRole para este utilizador
        const [existingUserRoles] = await connection.execute(
          'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?',
          ['c08c248e-8a80-11f0-aefa-34b4ed86d8a9', adminRoleId]
        );
        
        if (existingUserRoles.length === 0) {
          // Criar userRole para o utilizador antigo
          await connection.execute(
            'INSERT INTO user_roles (id, user_id, role_id, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [`${Date.now()}-old-admin-role`, 'c08c248e-8a80-11f0-aefa-34b4ed86d8a9', adminRoleId]
          );
          console.log('✅ UserRole criado para o utilizador antigo!');
        } else {
          console.log('ℹ️ UserRole já existe para o utilizador antigo');
        }
      } else {
        console.log('❌ Role Administrador não encontrado!');
      }
    } else {
      console.log('ℹ️ Utilizador antigo não encontrado');
    }
    
    // Verificar o resultado
    const [userRoles] = await connection.execute(`
      SELECT ur.id, ur.user_id, ur.role_id, r.name as role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, ['c08c248e-8a80-11f0-aefa-34b4ed86d8a9']);
    
    console.log(`✅ UserRoles para utilizador antigo: ${userRoles.length}`);
    userRoles.forEach(role => {
      console.log(`   - ${role.role_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir utilizador admin:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixAdminUser();