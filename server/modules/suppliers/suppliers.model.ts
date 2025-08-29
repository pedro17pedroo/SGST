import { db } from '../../db';
import { suppliers, type Supplier, type InsertSupplier } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';

export class SuppliersModel {
  static async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  static async getSupplier(id: string): Promise<Supplier | undefined> {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return result[0];
  }

  static async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  static async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updatedSupplier] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updatedSupplier;
  }

  static async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }
}