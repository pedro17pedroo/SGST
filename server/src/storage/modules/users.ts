import { db } from "../../../database/db";
import { users, type User, type InsertUser } from "../../../../shared/schema";
import { eq, ilike } from "drizzle-orm";
import { insertAndReturn, updateAndReturn, safeDelete, getSingleRecord } from "../utils";
import { ErrorHandler, NotFoundError, ValidationError } from "../base/StorageError";

export class UserStorage {
  async getUsers(): Promise<User[]> {
    return await ErrorHandler.executeWithErrorHandling(
      () => db.select().from(users),
      'UserStorage.getUsers'
    );
  }

  async getUser(id: string): Promise<User | undefined> {
    ErrorHandler.validateId(id);
    
    return await ErrorHandler.executeWithErrorHandling(async () => {
      const result = await getSingleRecord<User>(users, eq(users.id, id));
      return result || undefined;
    }, 'UserStorage.getUser');
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    ErrorHandler.validateRequired(username, 'username');
    
    return await ErrorHandler.executeWithErrorHandling(async () => {
      const result = await getSingleRecord<User>(users, eq(users.username, username));
      return result || undefined;
    }, 'UserStorage.getUserByUsername');
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    ErrorHandler.validateRequired(email, 'email');
    
    return await ErrorHandler.executeWithErrorHandling(async () => {
      const result = await getSingleRecord<User>(users, eq(users.email, email));
      return result || undefined;
    }, 'UserStorage.getUserByEmail');
  }

  async createUser(user: InsertUser): Promise<User> {
    ErrorHandler.validateRequired(user.username, 'username');
    ErrorHandler.validateRequired(user.email, 'email');
    ErrorHandler.validateRequired(user.password, 'password');
    
    const id = crypto.randomUUID();
    const result = await ErrorHandler.executeWithErrorHandling(
      () => insertAndReturn<User>(users, user, users.id, id),
      'UserStorage.createUser'
    );
    
    if (!result) {
      throw new Error('Falha ao criar usuário');
    }
    
    return result;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    ErrorHandler.validateId(id);
    
    const result = await ErrorHandler.executeWithErrorHandling(
      () => updateAndReturn<User>(users, id, user, users.id),
      'UserStorage.updateUser'
    );
    
    if (!result) {
      throw new NotFoundError('Usuário não encontrado');
    }
    
    return result;
  }

  async deleteUser(id: string): Promise<void> {
    ErrorHandler.validateId(id);
    
    return await ErrorHandler.executeWithErrorHandling(
      () => safeDelete(users, id, users.id),
      'UserStorage.deleteUser'
    );
  }

  async searchUsers(query: string): Promise<User[]> {
    ErrorHandler.validateRequired(query, 'query');
    
    return await ErrorHandler.executeWithErrorHandling(
      () => db.select().from(users).where(ilike(users.username, `%${query}%`)),
      'UserStorage.searchUsers'
    );
  }
}