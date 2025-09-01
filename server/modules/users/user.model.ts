import { storage } from '../../storage';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';

export type UserCreateData = z.infer<typeof insertUserSchema>;
export type UserUpdateData = Partial<UserCreateData>;

export class UserModel {
  static async getAll() {
    return await storage.getUsers();
  }

  static async getById(id: string) {
    return await storage.getUser(id);
  }

  static async create(userData: UserCreateData) {
    const validatedData = insertUserSchema.parse(userData);
    return await storage.createUser(validatedData);
  }

  static async update(id: string, updateData: UserUpdateData) {
    const validatedData = insertUserSchema.partial().parse(updateData);
    return await storage.updateUser(id, validatedData);
  }

  static async delete(id: string) {
    return await storage.deleteUser(id);
  }

  static async getByUsername(username: string) {
    return await storage.getUserByUsername(username);
  }

  static async getByEmail(email: string) {
    return await storage.getUserByEmail(email);
  }

  // RBAC - User Roles Management
  static async getUserRoles(userId: string) {
    return await storage.getUserRoles(userId);
  }

  static async setUserRoles(userId: string, roleIds: string[]) {
    return await storage.setUserRoles(userId, roleIds);
  }

  static async addRoleToUser(userId: string, roleId: string, assignedBy?: string) {
    return await storage.addRoleToUser({ userId, roleId, assignedBy });
  }

  static async removeRoleFromUser(userId: string, roleId: string) {
    return await storage.removeRoleFromUser(userId, roleId);
  }

  static async getUserPermissions(userId: string) {
    return await storage.getUserPermissions(userId);
  }

  static async hasPermission(userId: string, permission: string) {
    return await storage.hasPermission(userId, permission);
  }
}