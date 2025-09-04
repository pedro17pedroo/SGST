import { db } from '../../../database/db';
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
    await db.insert(suppliers).values(supplier);
    const newSupplier = await db.select().from(suppliers).orderBy(desc(suppliers.createdAt)).limit(1);
    return newSupplier[0];
  }

  static async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    await db.update(suppliers).set(supplier).where(eq(suppliers.id, id));
    const updatedSupplier = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return updatedSupplier[0];
  }

  static async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }
}