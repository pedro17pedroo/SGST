import { db } from '../../db';
import { warehouses, type Warehouse, type InsertWarehouse } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';

export class WarehousesModel {
  static async getWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses).orderBy(desc(warehouses.createdAt));
  }

  static async getWarehouse(id: string): Promise<Warehouse | undefined> {
    const result = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return result[0];
  }

  static async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [newWarehouse] = await db.insert(warehouses).values(warehouse).returning();
    return newWarehouse;
  }

  static async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse> {
    const [updatedWarehouse] = await db.update(warehouses).set(warehouse).where(eq(warehouses.id, id)).returning();
    return updatedWarehouse;
  }

  static async deleteWarehouse(id: string): Promise<void> {
    await db.delete(warehouses).where(eq(warehouses.id, id));
  }
}