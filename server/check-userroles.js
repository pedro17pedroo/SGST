import { db } from './database/db.js';
import { userRoles, users, roles } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function checkUserRoles() {
  try {
    console.log('Verificando userRoles...');
    
    // Verificar todos os userRoles
    const allUserRoles = await db.select().from(userRoles);
    console.log('Total userRoles:', allUserRoles.length);
    console.log('UserRoles:', allUserRoles);
    
    // Verificar userRoles com joins
    const userRolesWithDetails = await db
      .select({
        userId: userRoles.userId,
        roleId: userRoles.roleId,
        username: users.username,
        roleName: roles.name
      })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id));
    
    console.log('UserRoles com detalhes:', userRolesWithDetails);
    
    // Verificar especificamente o admin
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin'));
    console.log('Admin user:', adminUser);
    
    if (adminUser.length > 0) {
      const adminRoles = await db.select().from(userRoles).where(eq(userRoles.userId, adminUser[0].id));
      console.log('Admin roles:', adminRoles);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
  
  process.exit(0);
}

checkUserRoles();