import { db } from '../../db';
import { 
  orders, orderItems, products, suppliers, users,
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Product
} from '@shared/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

export class OrdersModel {
  static async getOrders(): Promise<Array<Order & { supplier?: any | null; user?: any | null }>> {
    const results = await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      type: orders.type,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      customerAddress: orders.customerAddress,
      supplierId: orders.supplierId,
      totalAmount: orders.totalAmount,
      notes: orders.notes,
      userId: orders.userId,
      createdAt: orders.createdAt,
      supplier: suppliers,
      user: users
    })
      .from(orders)
      .leftJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    return results.map(row => ({
      id: row.id,
      orderNumber: row.orderNumber,
      type: row.type,
      status: row.status,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      customerAddress: row.customerAddress,
      supplierId: row.supplierId,
      totalAmount: row.totalAmount,
      notes: row.notes,
      userId: row.userId,
      createdAt: row.createdAt,
      supplier: row.supplier || null,
      user: row.user || null
    }));
  }

  static async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  static async createOrder(order: InsertOrder): Promise<Order> {
    await db.insert(orders).values(order);
    const insertedOrder = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(1);
    return insertedOrder[0];
  }

  static async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    await db.update(orders).set(order).where(eq(orders.id, id));
    const updatedOrder = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return updatedOrder[0];
  }

  static async deleteOrder(id: string): Promise<void> {
    // Delete order items first due to foreign key constraints
    await db.delete(orderItems).where(eq(orderItems.orderId, id));
    // Then delete the order
    await db.delete(orders).where(eq(orders.id, id));
  }

  static async getOrderItems(orderId: string): Promise<Array<OrderItem & { product: Product }>> {
    const results = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      product: products
    })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return results.map(row => ({
      id: row.id,
      orderId: row.orderId,
      productId: row.productId,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      totalPrice: row.totalPrice,
      product: row.product
    }));
  }

  static async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    await db.insert(orderItems).values(item);
    const insertedItem = await db.select().from(orderItems).orderBy(desc(orderItems.id)).limit(1);
    return insertedItem[0];
  }

  static async updateOrderItem(id: string, item: Partial<InsertOrderItem>): Promise<OrderItem> {
    await db.update(orderItems).set(item).where(eq(orderItems.id, id));
    const updatedItem = await db.select().from(orderItems).where(eq(orderItems.id, id)).limit(1);
    return updatedItem[0];
  }

  static async deleteOrderItem(id: string): Promise<void> {
    await db.delete(orderItems).where(eq(orderItems.id, id));
  }

  static async getPendingOrdersCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'pending'));
    
    return result[0]?.count || 0;
  }

  static async getRecentOrders(limit: number = 5): Promise<Array<Order & { supplier?: any | null; user?: any | null }>> {
    const results = await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      type: orders.type,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      customerAddress: orders.customerAddress,
      supplierId: orders.supplierId,
      totalAmount: orders.totalAmount,
      notes: orders.notes,
      userId: orders.userId,
      createdAt: orders.createdAt,
      supplier: suppliers,
      user: users
    })
      .from(orders)
      .leftJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    return results.map(row => ({
      id: row.id,
      orderNumber: row.orderNumber,
      type: row.type,
      status: row.status,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      customerAddress: row.customerAddress,
      supplierId: row.supplierId,
      totalAmount: row.totalAmount,
      notes: row.notes,
      userId: row.userId,
      createdAt: row.createdAt,
      supplier: row.supplier || null,
      user: row.user || null
    }));
  }

  static async getPendingOrders(): Promise<Array<Order & { supplier?: any | null; user?: any | null }>> {
    const results = await db.select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      type: orders.type,
      status: orders.status,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      customerAddress: orders.customerAddress,
      supplierId: orders.supplierId,
      totalAmount: orders.totalAmount,
      notes: orders.notes,
      userId: orders.userId,
      createdAt: orders.createdAt,
      supplier: suppliers,
      user: users
    })
      .from(orders)
      .leftJoin(suppliers, eq(orders.supplierId, suppliers.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.status, 'pending'))
      .orderBy(desc(orders.createdAt));

    return results.map(row => ({
      id: row.id,
      orderNumber: row.orderNumber,
      type: row.type,
      status: row.status,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      customerAddress: row.customerAddress,
      supplierId: row.supplierId,
      totalAmount: row.totalAmount,
      notes: row.notes,
      userId: row.userId,
      createdAt: row.createdAt,
      supplier: row.supplier || null,
      user: row.user || null
    }));
  }
}