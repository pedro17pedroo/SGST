import { db } from "../../../database/db";
import { inventory, stockMovements, products, warehouses, users, type Inventory, type InsertInventory, type StockMovement, type InsertStockMovement, type Product, type Warehouse, type User } from "../../../../shared/schema";
import { eq, desc, and, sum } from "drizzle-orm";
import { insertAndReturn, updateAndReturn, getSingleRecord } from "../utils";

export class InventoryStorage {
  async getInventoryByWarehouse(warehouseId: string): Promise<Array<Inventory & { product: Product }>> {
    const results = await db
      .select({
        inventory: inventory,
        product: products
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(eq(inventory.warehouseId, warehouseId));
    
    return results.map(result => ({
      ...result.inventory,
      product: result.product
    }));
  }

  async getProductInventory(productId: string): Promise<Array<Inventory & { warehouse: Warehouse }>> {
    const results = await db
      .select({
        inventory: inventory,
        warehouse: warehouses
      })
      .from(inventory)
      .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
      .where(eq(inventory.productId, productId));
    
    return results.map(result => ({
      ...result.inventory,
      warehouse: result.warehouse
    }));
  }

  async updateInventory(productId: string, warehouseId: string, quantity: number): Promise<Inventory> {
    const condition = and(eq(inventory.productId, productId), eq(inventory.warehouseId, warehouseId));
    const existing = await getSingleRecord<Inventory>(inventory, condition!);

    if (existing) {
      const result = await updateAndReturn<Inventory>(inventory, existing.id, { quantity }, inventory.id);
      if (!result) {
        throw new Error('Falha ao atualizar inventário');
      }
      return result;
    } else {
      const id = crypto.randomUUID();
      const newInventory: InsertInventory = {
        productId,
        warehouseId,
        quantity
      };
      const result = await insertAndReturn<Inventory>(inventory, newInventory, inventory.id, id);
      if (!result) {
        throw new Error('Falha ao criar inventário');
      }
      return result;
    }
  }

  async getStockMovements(limit?: number): Promise<Array<StockMovement & { product: Product; warehouse: Warehouse; user?: User | null }>> {
    const baseQuery = db
      .select({
        stockMovement: stockMovements,
        product: products,
        warehouse: warehouses,
        user: users
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .innerJoin(warehouses, eq(stockMovements.warehouseId, warehouses.id))
      .leftJoin(users, eq(stockMovements.userId, users.id))
      .orderBy(desc(stockMovements.createdAt));

    const results = limit ? await baseQuery.limit(limit) : await baseQuery;
    
    return results.map(result => ({
      ...result.stockMovement,
      product: result.product,
      warehouse: result.warehouse,
      user: result.user
    }));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<StockMovement>(stockMovements, movement, stockMovements.id, id);
    
    if (!result) {
      throw new Error('Falha ao criar movimento de estoque');
    }
    
    return result;
  }

  async getTotalStock(productId: string): Promise<number> {
    const result = await db
      .select({ total: sum(inventory.quantity) })
      .from(inventory)
      .where(eq(inventory.productId, productId));
    
    return Number(result[0]?.total) || 0;
  }

  async getWarehouseStock(warehouseId: string): Promise<number> {
    const result = await db
      .select({ total: sum(inventory.quantity) })
      .from(inventory)
      .where(eq(inventory.warehouseId, warehouseId));
    
    return Number(result[0]?.total) || 0;
  }

  async getStockMovementsByProduct(productId: string, limit?: number): Promise<Array<StockMovement & { warehouse: Warehouse; user?: User | null }>> {
    const baseQuery = db
      .select({
        stockMovement: stockMovements,
        warehouse: warehouses,
        user: users
      })
      .from(stockMovements)
      .innerJoin(warehouses, eq(stockMovements.warehouseId, warehouses.id))
      .leftJoin(users, eq(stockMovements.userId, users.id))
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt));

    const results = limit ? await baseQuery.limit(limit) : await baseQuery;
    
    return results.map(result => ({
      ...result.stockMovement,
      warehouse: result.warehouse,
      user: result.user
    }));
  }
}