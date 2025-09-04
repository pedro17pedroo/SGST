import dotenv from "dotenv";
dotenv.config();

import { db } from "./database/db";
import { users, roles, userRoles } from "../shared/schema";
import { eq } from "drizzle-orm";

async function checkRoles() {
  console.log("🔍 Verificando sistema de roles...");
  
  try {
    // Verificar roles na tabela roles
    console.log("\n1. Verificando tabela 'roles':");
    const allRoles = await db.select().from(roles);
    console.log(`📊 Total de roles: ${allRoles.length}`);
    
    if (allRoles.length > 0) {
      allRoles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.name} (${role.id}) - Ativo: ${role.isActive}`);
      });
    } else {
      console.log("❌ Nenhum role encontrado na tabela 'roles'!");
    }
    
    // Verificar user_roles
    console.log("\n2. Verificando tabela 'user_roles':");
    const allUserRoles = await db.select().from(userRoles);
    console.log(`📊 Total de user_roles: ${allUserRoles.length}`);
    
    if (allUserRoles.length > 0) {
      for (const userRole of allUserRoles) {
        const user = await db.select().from(users).where(eq(users.id, userRole.userId)).limit(1);
        const role = await db.select().from(roles).where(eq(roles.id, userRole.roleId)).limit(1);
        
        console.log(`- User: ${user[0]?.username} -> Role: ${role[0]?.name}`);
      }
    } else {
      console.log("❌ Nenhuma associação user_role encontrada!");
    }
    
    // Verificar campo role na tabela users (sistema antigo)
    console.log("\n3. Verificando campo 'role' na tabela 'users' (sistema antigo):");
    const usersWithRoles = await db.select({
      username: users.username,
      role: users.role
    }).from(users);
    
    usersWithRoles.forEach(user => {
      console.log(`- ${user.username}: ${user.role}`);
    });
    
  } catch (error) {
    console.error("❌ Erro ao verificar roles:", error);
  }
  
  process.exit(0);
}

checkRoles();