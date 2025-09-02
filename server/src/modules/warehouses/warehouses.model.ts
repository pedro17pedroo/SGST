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
    await db.insert(warehouses).values(warehouse);
    const newWarehouse = await db.select().from(warehouses).orderBy(desc(warehouses.createdAt)).limit(1);
    return newWarehouse[0];
  }

  static async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse> {
    await db.update(warehouses).set(warehouse).where(eq(warehouses.id, id));
    const updatedWarehouse = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    return updatedWarehouse[0];
  }

  static async deleteWarehouse(id: string): Promise<void> {
    await db.delete(warehouses).where(eq(warehouses.id, id));
  }
}