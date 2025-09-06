import { db } from '../../../database/db';
import { users, roles, userRoles, permissions, rolePermissions } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const userCreateSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
});

const userUpdateSchema = userCreateSchema.partial();

type UserCreateData = z.infer<typeof userCreateSchema>;
type UserUpdateData = z.infer<typeof userUpdateSchema>;

export class UserModel {
  // Buscar todos os utilizadores
  static async getAll() {
    const result = await db.select().from(users).orderBy(users.createdAt);
    return result;
  }

  // Buscar utilizador por ID
  static async getById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  // Criar novo utilizador
  static async create(userData: UserCreateData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'user',
      isActive: userData.isActive ?? true,
    }).returning();
    
    return result[0] || { id: 'generated-id', ...userData, password: hashedPassword };
  }

  // Atualizar utilizador
  static async update(id: string, userData: UserUpdateData) {
    const updateData: any = { ...userData };
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, id));
    
    return this.getById(id);
  }

  // Eliminar utilizador
  static async delete(id: string) {
    await db.delete(users).where(eq(users.id, id));
    return { success: true, message: 'Utilizador eliminado com sucesso' };
  }

  // Buscar utilizador por nome de utilizador
  static async getByUsername(username: string) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }

  // Buscar utilizador por email
  static async getByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  // Buscar roles do utilizador
  static async getUserRoles(userId: string) {
    // Buscar IDs dos roles do utilizador
     const userRoleIds = await db
       .select()
       .from(userRoles)
       .where(eq(userRoles.userId, userId));
    
    if (userRoleIds.length === 0) {
      return [];
    }
    
    // Buscar detalhes dos roles
     const roleIds = userRoleIds.map((ur: { roleId: string }) => ur.roleId);
     const result = await db
       .select()
       .from(roles)
       .where(inArray(roles.id, roleIds));
    
    return result;
  }

  // Atribuir role ao utilizador
  static async assignRole(userId: string, roleId: string) {
    // Verificar se a atribuição já existe
     const existing = await db.select()
       .from(userRoles)
       .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
    
    if (existing.length > 0) {
      return { success: true, message: 'Role já atribuído' };
    }
    
    await db.insert(userRoles).values({
      userId,
      roleId,
    });
    
    return { success: true, message: 'Role atribuído com sucesso' };
  }

  // Remover role do utilizador
  static async removeRole(userId: string, roleId: string) {
    await db.delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
    
    return { success: true, message: 'Role removido com sucesso' };
  }

  // Buscar permissões do utilizador
  static async getUserPermissions(userId: string) {
    // Buscar roles do utilizador
     const userRoleIds = await db
       .select()
       .from(userRoles)
       .where(eq(userRoles.userId, userId));
     
     if (userRoleIds.length === 0) {
       return [];
     }
     
     // Buscar permissões dos roles
     const roleIds = userRoleIds.map((ur: any) => ur.roleId);
     const rolePermissionIds = await db
       .select()
       .from(rolePermissions)
       .where(inArray(rolePermissions.roleId, roleIds));
     
     if (rolePermissionIds.length === 0) {
       return [];
     }
     
     // Buscar detalhes das permissões
     const permissionIds = rolePermissionIds.map((rp: any) => rp.permissionId);
     const result = await db
       .select()
       .from(permissions)
       .where(inArray(permissions.id, permissionIds));
    
    return result;
  }

  // Verificar se utilizador tem permissão específica
  static async hasPermission(userId: string, permissionName: string) {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some((permission: any) => permission.name === permissionName);
  }
}