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
    const result = await getSingleRecord<Order>(orders, eq(orders.id, id));
    return result || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = crypto.randomUUID();
    const result = await insertAndReturn<Order>(orders, order, orders.id, id);
    
    if (!result) {
      throw new Error('Falha ao criar pedido');
    }
    
    return result;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const result = await updateAndReturn<Order>(orders, id, order, orders.id);
    
    if (!result) {
      throw new Error('Pedido não encontrado');
    }
    
    return result;
  }

  async deleteOrder(id: string): Promise<void> {
    await safeDelete(orders, id, orders.id);
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
    const id = crypto.randomUUID();
    const result = await insertAndReturn<OrderItem>(orderItems, item, orderItems.id, id);
    
    if (!result) {
      throw new Error('Falha ao criar item do pedido');
    }
    
    return result;
  }

  async updateOrderItem(id: string, item: Partial<InsertOrderItem>): Promise<OrderItem> {
    const result = await updateAndReturn<OrderItem>(orderItems, id, item, orderItems.id);
    
    if (!result) {
      throw new Error('Item do pedido não encontrado');
    }
    
    return result;
  }

  async deleteOrderItem(id: string): Promise<void> {
    await safeDelete(orderItems, id, orderItems.id);
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