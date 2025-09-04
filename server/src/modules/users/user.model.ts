import { db } from '../../../database/db';
import { users, insertUserSchema, roles, userRoles, permissions, rolePermissions, type User, type Role, type Permission } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export type UserCreateData = z.infer<typeof insertUserSchema>;
export type UserUpdateData = Partial<UserCreateData>;

export class UserModel {
  static async getAll(): Promise<User[]> {
    try {
      // Usar query builder do Drizzle; removido orderBy para evitar possíveis incompatibilidades
      const result = await db.select().from(users);
      console.log(`📊 Usuários encontrados: ${result.length}`);
      // Logging persistente para diagnóstico
      try {
        const logPath = path.join(process.cwd(), 'server.log');
        const ids = Array.isArray(result) ? result.map((u: any) => u.id).slice(0, 10).join(',') : '';
        const line = `[${new Date().toISOString()}] UserModel.getAll -> count=${result.length}, ids=${ids}\n`;
        fs.appendFileSync(logPath, line);
      } catch (e) {
        // ignorar erros de logging para não afetar a resposta
      }
      return result;
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar utilizador por ID:', error);
      return null;
    }
  }

  static async create(userData: UserCreateData): Promise<User> {
    try {
      const validatedData = insertUserSchema.parse(userData);
      
      // Hash da password se fornecida
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }
      
      const result = await db.insert(users).values(validatedData).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      throw new Error('Erro ao criar utilizador');
    }
  }

  static async update(id: string, updateData: UserUpdateData): Promise<User> {
    try {
      const validatedData = insertUserSchema.partial().parse(updateData);
      
      // Hash da password se fornecida
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }
      
      const result = await db.update(users).set(validatedData).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      throw new Error('Erro ao atualizar utilizador');
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
      throw new Error('Erro ao eliminar utilizador');
    }
  }

  static async getByUsername(username: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar utilizador por username:', error);
      return null;
    }
  }

  static async getByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar utilizador por email:', error);
      return null;
    }
  }

  // RBAC - User Roles Management
  static async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const result = await db
        .select({
          id: roles.id,
          name: roles.name,
          description: roles.description,
          isActive: roles.isActive,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));
      
      return result as Role[];
    } catch (error) {
      console.error('Erro ao buscar perfis do utilizador:', error);
      return [];
    }
  }

  static async setUserRoles(userId: string, roleIds: string[]): Promise<boolean> {
    try {
      // Remove todos os roles existentes do usuário
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
      
      // Adiciona os novos roles
      if (roleIds.length > 0) {
        const userRoleData = roleIds.map(roleId => ({
          userId,
          roleId,
        }));
        
        await db.insert(userRoles).values(userRoleData);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao definir perfis do utilizador:', error);
      throw new Error('Erro ao definir perfis do utilizador');
    }
  }

  static async addRoleToUser(userId: string, roleId: string, assignedBy?: string): Promise<any> {
    try {
      const result = await db.insert(userRoles).values({
        userId,
        roleId,
        assignedBy,
      }).returning();
      
      return result[0];
    } catch (error) {
      console.error('Erro ao adicionar perfil ao utilizador:', error);
      throw new Error('Erro ao adicionar perfil ao utilizador');
    }
  }

  static async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    try {
      await db.delete(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
      
      return true;
    } catch (error) {
      console.error('Erro ao remover perfil do utilizador:', error);
      throw new Error('Erro ao remover perfil do utilizador');
    }
  }

  static async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const result = await db
        .select({
          id: permissions.id,
          name: permissions.name,
          description: permissions.description,
          resource: permissions.resource,
          action: permissions.action,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(userRoles.userId, userId));
      
      return result as Permission[];
    } catch (error) {
      console.error('Erro ao buscar permissões do utilizador:', error);
      return [];
    }
  }

  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return userPermissions.some(p => p.name === permission);
    } catch (error) {
      console.error('Erro ao verificar permissão do utilizador:', error);
      return false;
    }
  }
}