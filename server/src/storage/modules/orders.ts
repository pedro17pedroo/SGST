import { db } from "../../../database/db";
import { orders, orderItems, suppliers, users, products, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Supplier, type User, type Product } from "../../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { insertAndReturn, updateAndReturn, safeDelete, getSingleRecord } from "../utils";

export class OrderStorage {
  async getOrders(): Promise<Array<Order & { supplier?: Supplier | null; user?: User | null }>> {
    const results = await db
      .select({
        order: orders,
        supplier: suppliers,
        user: users
      })
      .from(orders)
      .leftJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));
    
    return results.map(result => ({
      ...result.order,
      supplier: result.supplier,
      user: result.user
    }));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const query = db.select().from(orders).where(eq(orders.id, id)).limit(1);
    const result = await getSingleRecord<Order>(query);
    return result || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    return insertAndReturn<Order>(orders, order);
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    return updateAndReturn<Order>(orders, id, order);
  }

  async deleteOrder(id: string): Promise<void> {
    await safeDelete(orders, id);
  }

  async getOrderItems(orderId: string): Promise<Array<OrderItem & { product: Product }>> {
    const results = await db
      .select({
        orderItem: orderItems,
        product: products
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    
    return results.map(result => ({
      ...result.orderItem,
      product: result.product
    }));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    return insertAndReturn<OrderItem>(orderItems, item);
  }

  async updateOrderItem(id: string, item: Partial<InsertOrderItem>): Promise<OrderItem> {
    return updateAndReturn<OrderItem>(orderItems, id, item);
  }

  async deleteOrderItem(id: string): Promise<void> {
    await safeDelete(orderItems, id);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.status, status))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersBySupplier(supplierId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.supplierId, supplierId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
}