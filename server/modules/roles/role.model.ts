import { storage } from '../../storage';
import { insertRoleSchema, insertRolePermissionSchema } from '@shared/schema';
import { z } from 'zod';

export type RoleCreateData = z.infer<typeof insertRoleSchema>;
export type RoleUpdateData = Partial<RoleCreateData>;

export class RoleModel {
  static async getAll() {
    return await storage.getRoles();
  }

  static async getById(id: string) {
    return await storage.getRole(id);
  }

  static async create(roleData: RoleCreateData) {
    const validatedData = insertRoleSchema.parse(roleData);
    return await storage.createRole(validatedData);
  }

  static async update(id: string, updateData: RoleUpdateData) {
    const validatedData = insertRoleSchema.partial().parse(updateData);
    return await storage.updateRole(id, validatedData);
  }

  static async delete(id: string) {
    return await storage.deleteRole(id);
  }

  static async getRolePermissions(roleId: string) {
    return await storage.getRolePermissions(roleId);
  }

  static async addPermissionToRole(roleId: string, permissionId: string) {
    const validatedData = insertRolePermissionSchema.parse({ roleId, permissionId });
    return await storage.addPermissionToRole(validatedData);
  }

  static async removePermissionFromRole(roleId: string, permissionId: string) {
    return await storage.removePermissionFromRole(roleId, permissionId);
  }

  static async setRolePermissions(roleId: string, permissionIds: string[]) {
    return await storage.setRolePermissions(roleId, permissionIds);
  }

  static async getUsersWithRole(roleId: string) {
    return await storage.getUsersWithRole(roleId);
  }
}