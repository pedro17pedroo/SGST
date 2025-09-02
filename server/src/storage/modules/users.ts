import { db } from "../../../database/db";
import { users, type User, type InsertUser } from "../../../../shared/schema";
import { eq, ilike } from "drizzle-orm";
import { insertAndReturn, updateAndReturn, safeDelete, getSingleRecord } from "../utils";

export class UserStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const query = db.select().from(users).where(eq(users.id, id)).limit(1);
    const result = await getSingleRecord<User>(query);
    return result || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const query = db.select().from(users).where(eq(users.username, username)).limit(1);
    const result = await getSingleRecord<User>(query);
    return result || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const query = db.select().from(users).where(eq(users.email, email)).limit(1);
    const result = await getSingleRecord<User>(query);
    return result || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    return insertAndReturn<User>(users, user, eq(users.email, user.email));
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    return updateAndReturn<User>(users, id, user);
  }

  async deleteUser(id: string): Promise<void> {
    await safeDelete(users, id);
  }

  async searchUsers(query: string): Promise<User[]> {
    return await db.select().from(users)
      .where(
        ilike(users.username, `%${query}%`)
      );
  }
}