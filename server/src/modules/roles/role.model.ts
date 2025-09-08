import { db } from '../../../database/db';
import { roles, rolePermissions, permissions, userRoles, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const roleCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type RoleCreateData = z.infer<typeof roleCreateSchema>;
export type RoleUpdateData = Partial<RoleCreateData>;

export class RoleModel {
  static async getAll() {
    try {
      const result = await db.select().from(roles);
      return result;
    } catch (error) {
      console.error('Erro ao buscar todos os perfis:', error);
      return [];
    }
  }

  static async getById(id: string) {
    try {
      const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar perfil por ID:', error);
      return null;
    }
  }

  static async create(roleData: RoleCreateData) {
    try {
      const validatedData = roleCreateSchema.parse(roleData);
      const id = crypto.randomUUID();
      await db.insert(roles).values({ id, ...validatedData });
      return await this.getById(id);
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw new Error('Erro ao criar perfil');
    }
  }

  static async update(id: string, updateData: RoleUpdateData) {
    try {
      await db.update(roles).set(updateData).where(eq(roles.id, id));
      return await this.getById(id);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error('Erro ao atualizar perfil');
    }
  }

  static async delete(id: string) {
    try {
      await db.delete(roles).where(eq(roles.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao eliminar perfil:', error);
      return false;
    }
  }

  static async getRolePermissions(roleId: string) {
    try {
      const result = await db
        .select({
          id: permissions.id,
          name: permissions.name,
          description: permissions.description,
          resource: permissions.resource,
          action: permissions.action,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, roleId));
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar permissões do perfil:', error);
      return [];
    }
  }

  static async addPermissionToRole(roleId: string, permissionId: string) {
    try {
      const id = crypto.randomUUID();
      await db.insert(rolePermissions).values({
        id,
        roleId,
        permissionId,
      });
      
      return { id, roleId, permissionId };
    } catch (error) {
      console.error('Erro ao adicionar permissão ao perfil:', error);
      throw new Error('Erro ao adicionar permissão ao perfil');
    }
  }

  static async removePermissionFromRole(roleId: string, permissionId: string) {
    try {
      await db.delete(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId) && eq(rolePermissions.permissionId, permissionId));
      
      return true;
    } catch (error) {
      console.error('Erro ao remover permissão do perfil:', error);
      return false;
    }
  }

  static async setRolePermissions(roleId: string, permissionIds: string[]) {
    try {
      // Remove todas as permissões existentes do perfil
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      
      // Adiciona as novas permissões
      if (permissionIds.length > 0) {
        const rolePermissionData = permissionIds.map(permissionId => ({
          roleId,
          permissionId,
        }));
        
        await db.insert(rolePermissions).values(rolePermissionData);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao definir permissões do perfil:', error);
      throw new Error('Erro ao definir permissões do perfil');
    }
  }

  static async getUsersWithRole(roleId: string) {
    try {
      const result = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          isActive: users.isActive,
        })
        .from(userRoles)
        .innerJoin(users, eq(userRoles.userId, users.id))
        .where(eq(userRoles.roleId, roleId));
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar utilizadores com perfil:', error);
      return [];
    }
  }
}