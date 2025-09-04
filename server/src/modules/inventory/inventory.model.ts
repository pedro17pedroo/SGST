import { db } from '../../../database/db';
import { 
  inventory, products, warehouses, categories,
  type Inventory, type InsertInventory, type Product, type Warehouse
} from '@shared/schema';
import { desc, eq, sql, and, lt } from 'drizzle-orm';

export class InventoryModel {
  static async getLowStockProducts(): Promise<Array<Product & { stock: number; category?: any | null }>> {
    try {
      const results = await db.select({
        id: products.id,
        name: products.name,
        description: products.description,
        sku: products.sku,
        barcode: products.barcode,
        price: products.price,
        weight: products.weight,
        dimensions: products.dimensions,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        minStockLevel: products.minStockLevel,
        isActive: products.isActive,
        createdAt: products.createdAt,
        stock: sql<number>`COALESCE(sum(${inventory.quantity}), 0)`,
        category: categories
      })
        .from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .groupBy(products.id, categories.id)
        .having(sql`COALESCE(sum(${inventory.quantity}), 0) < ${products.minStockLevel}`)
        .orderBy(desc(products.createdAt));

      return results.map((row: any) => ({
        ...row,
        category: row.category || null
      }));
    } catch (error) {
      console.error('Low stock products error:', error);
      return [];
    }
  }

  static async getInventoryByWarehouse(warehouseId: string): Promise<Array<Inventory & { product: Product }>> {
    const results = await db.select({
      id: inventory.id,
      productId: inventory.productId,
      warehouseId: inventory.warehouseId,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      lastUpdated: inventory.lastUpdated,
      product: products
    })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(eq(inventory.warehouseId, warehouseId))
      .orderBy(desc(inventory.lastUpdated));

    return results.map((row: any) => ({
      id: row.id,
      productId: row.productId,
      warehouseId: row.warehouseId,
      quantity: row.quantity,
      reservedQuantity: row.reservedQuantity,
      lastUpdated: row.lastUpdated,
      product: row.product
    }));
  }

  static async getProductInventory(productId: string): Promise<Array<Inventory & { warehouse: Warehouse }>> {
    const results = await db.select({
      id: inventory.id,
      productId: inventory.productId,
      warehouseId: inventory.warehouseId,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      lastUpdated: inventory.lastUpdated,
      warehouse: warehouses
    })
      .from(inventory)
      .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
      .where(eq(inventory.productId, productId))
      .orderBy(desc(inventory.lastUpdated));

    return results.map((row: any) => ({
      id: row.id,
      productId: row.productId,
      warehouseId: row.warehouseId,
      quantity: row.quantity,
      reservedQuantity: row.reservedQuantity,
      lastUpdated: row.lastUpdated,
      warehouse: row.warehouse
    }));
  }

  static async updateInventory(productId: string, warehouseId: string, quantity: number): Promise<Inventory> {
    // Check if inventory record exists
    const existingInventory = await db.select()
      .from(inventory)
      .where(and(eq(inventory.productId, productId), eq(inventory.warehouseId, warehouseId)))
      .limit(1);

    if (existingInventory.length > 0) {
      // Update existing inventory
      await db.update(inventory)
        .set({ quantity })
        .where(and(eq(inventory.productId, productId), eq(inventory.warehouseId, warehouseId)));
      const updated = await db.select().from(inventory)
        .where(and(eq(inventory.productId, productId), eq(inventory.warehouseId, warehouseId)))
        .limit(1);
      return updated[0];
    } else {
      // Create new inventory record
      await db.insert(inventory)
        .values({ productId, warehouseId, quantity, reservedQuantity: 0 });
      const newInventory = await db.select().from(inventory)
        .where(and(eq(inventory.productId, productId), eq(inventory.warehouseId, warehouseId)))
        .limit(1);
      return newInventory[0];
    }
  }

  static async getAllInventory(): Promise<Array<Inventory & { product: Product; warehouse: Warehouse }>> {
    const results = await db.select({
      id: inventory.id,
      productId: inventory.productId,
      warehouseId: inventory.warehouseId,
      quantity: inventory.quantity,
      reservedQuantity: inventory.reservedQuantity,
      lastUpdated: inventory.lastUpdated,
      product: products,
      warehouse: warehouses
    })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
      .orderBy(desc(inventory.lastUpdated));

    return results.map((row: any) => ({
      id: row.id,
      productId: row.productId,
      warehouseId: row.warehouseId,
      quantity: row.quantity,
      reservedQuantity: row.reservedQuantity,
      lastUpdated: row.lastUpdated,
      product: row.product,
      warehouse: row.warehouse
    }));
  }

  static async getInventorySummary() {
    try {
      const [totalProducts] = await db.select({
        count: sql<number>`count(distinct ${products.id})`
      }).from(products);

      const [totalStock] = await db.select({
        total: sql<number>`COALESCE(sum(${inventory.quantity}), 0)`
      }).from(inventory);

      const lowStockResults = await db.select({
        count: sql<number>`count(distinct ${products.id})`
      })
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .groupBy(products.id, products.minStockLevel)
      .having(sql`COALESCE(sum(${inventory.quantity}), 0) < ${products.minStockLevel}`);

      return {
        totalProducts: totalProducts.count || 0,
        totalStock: totalStock.total || 0,
        lowStockProducts: lowStockResults.length > 0 ? lowStockResults[0].count || 0 : 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting inventory summary:', error);
      return {
        totalProducts: 0,
        totalStock: 0,
        lowStockProducts: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}