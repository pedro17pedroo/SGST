import { UserStorage } from "./modules/users";
import { ProductStorage } from "./modules/products";
import { OrderStorage } from "./modules/orders";
import { InventoryStorage } from "./modules/inventory";
import { db } from "../../database/db";
import { sql, count } from "drizzle-orm";
import { products, orders, stockMovements, users, type Product, type StockMovement, type User } from "../../../shared/schema";
import type { DashboardStats } from "./types";

export class Storage {
  public users: UserStorage;
  public products: ProductStorage;
  public orders: OrderStorage;
  public inventory: InventoryStorage;

  constructor() {
    this.users = new UserStorage();
    this.products = new ProductStorage();
    this.orders = new OrderStorage();
    this.inventory = new InventoryStorage();
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const [totalProductsResult, lowStockResult, pendingOrdersResult] = await Promise.all([
      db.select({ count: count() }).from(products),
      this.products.getLowStockProducts(),
      this.orders.getOrdersByStatus('pending')
    ]);

    // Calculate monthly sales (simplified)
    const monthlySalesResult = await db
      .select({ total: sql`COALESCE(SUM(CAST(total_amount AS DECIMAL(10,2))), 0)` })
      .from(orders)
      .where(sql`DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);

    return {
      totalProducts: totalProductsResult[0].count,
      lowStock: lowStockResult.length,
      pendingOrders: pendingOrdersResult.length,
      monthlySales: String(monthlySalesResult[0]?.total || '0')
    };
  }

  async getTopProducts(): Promise<Array<Product & { stock: number; sales: number }>> {
    // This is a simplified implementation
    // In a real scenario, you'd want to calculate actual sales data
    const topProducts = await this.products.getProducts();
    
    return topProducts.slice(0, 10).map(product => ({
      ...product,
      stock: 0, // Would need to calculate from inventory
      sales: 0  // Would need to calculate from order items
    }));
  }

  async getRecentActivities(): Promise<Array<StockMovement & { product: Product; user?: User | null }>> {
    return this.inventory.getStockMovements(20);
  }

  // Legacy method compatibility - delegate to appropriate modules
  async getUsers() { return this.users.getUsers(); }
  async getUser(id: string) { return this.users.getUser(id); }
  async getUserByUsername(username: string) { return this.users.getUserByUsername(username); }
  async getUserByEmail(email: string) { return this.users.getUserByEmail(email); }
  async createUser(user: any) { return this.users.createUser(user); }
  async updateUser(id: string, user: any) { return this.users.updateUser(id, user); }
  async deleteUser(id: string) { return this.users.deleteUser(id); }

  async getProducts() { return this.products.getProducts(); }
  async getProduct(id: string) { return this.products.getProduct(id); }
  async searchProducts(query: string) { return this.products.searchProducts(query); }
  async createProduct(product: any) { return this.products.createProduct(product); }
  async updateProduct(id: string, product: any) { return this.products.updateProduct(id, product); }
  async deleteProduct(id: string) { return this.products.deleteProduct(id); }
  async getLowStockProducts() { return this.products.getLowStockProducts(); }

  async getOrders() { return this.orders.getOrders(); }
  async getOrder(id: string) { return this.orders.getOrder(id); }
  async createOrder(order: any) { return this.orders.createOrder(order); }
  async updateOrder(id: string, order: any) { return this.orders.updateOrder(id, order); }
  async deleteOrder(id: string) { return this.orders.deleteOrder(id); }
  async getOrderItems(orderId: string) { return this.orders.getOrderItems(orderId); }
  async createOrderItem(item: any) { return this.orders.createOrderItem(item); }

  async getInventoryByWarehouse(warehouseId: string) { return this.inventory.getInventoryByWarehouse(warehouseId); }
  async getProductInventory(productId: string) { return this.inventory.getProductInventory(productId); }
  async updateInventory(productId: string, warehouseId: string, quantity: number) { 
    return this.inventory.updateInventory(productId, warehouseId, quantity); 
  }
  async getStockMovements(limit?: number) { return this.inventory.getStockMovements(limit); }
  async createStockMovement(movement: any) { return this.inventory.createStockMovement(movement); }
}

// Export a singleton instance for backward compatibility
export const storage = new Storage();

// Export all types
export * from "./types";