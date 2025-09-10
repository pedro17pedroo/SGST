import { db } from './database/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  try {
    console.log('Verificando usuário admin...');
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin'));
    console.log('Usuário admin encontrado:', adminUser.length > 0);
    if (adminUser.length > 0) {
      console.log('Dados do admin:', JSON.stringify(adminUser[0], null, 2));
    }
    
    // Verificar todos os usuários
    const allUsers = await db.select().from(users).limit(5);
    console.log('\nTodos os usuários (primeiros 5):');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}`);
    });
  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
  } finally {
    process.exit();
  }
}

checkAdmin();