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
}