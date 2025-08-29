import { db } from '../../db';
import { 
  shipments, orders, orderItems, products, users,
  type Shipment, type InsertShipment, type Order, type OrderItem, type Product
} from '@shared/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

export class ShippingModel {
  static async getShipments(): Promise<Array<Shipment & { order?: any | null; user?: any | null }>> {
    const results = await db.select({
      id: shipments.id,
      shipmentNumber: shipments.shipmentNumber,
      orderId: shipments.orderId,
      status: shipments.status,
      carrier: shipments.carrier,
      trackingNumber: shipments.trackingNumber,
      shippingAddress: shipments.shippingAddress,
      estimatedDelivery: shipments.estimatedDelivery,
      actualDelivery: shipments.actualDelivery,
      userId: shipments.userId,
      createdAt: shipments.createdAt,
      order: orders,
      user: users
    })
      .from(shipments)
      .leftJoin(orders, eq(shipments.orderId, orders.id))
      .leftJoin(users, eq(shipments.userId, users.id))
      .orderBy(desc(shipments.createdAt));

    return results.map(row => ({
      id: row.id,
      shipmentNumber: row.shipmentNumber,
      orderId: row.orderId,
      status: row.status,
      carrier: row.carrier,
      trackingNumber: row.trackingNumber,
      shippingAddress: row.shippingAddress,
      estimatedDelivery: row.estimatedDelivery,
      actualDelivery: row.actualDelivery,
      userId: row.userId,
      createdAt: row.createdAt,
      order: row.order || null,
      user: row.user || null
    }));
  }

  static async getShipment(id: string): Promise<Shipment | undefined> {
    const result = await db.select().from(shipments).where(eq(shipments.id, id));
    return result[0];
  }

  static async getShipmentByTrackingNumber(trackingNumber: string): Promise<(Shipment & { order?: any | null; orderItems?: Array<OrderItem & { product: Product }> }) | undefined> {
    const shipmentResults = await db.select({
      id: shipments.id,
      shipmentNumber: shipments.shipmentNumber,
      orderId: shipments.orderId,
      status: shipments.status,
      carrier: shipments.carrier,
      trackingNumber: shipments.trackingNumber,
      shippingAddress: shipments.shippingAddress,
      estimatedDelivery: shipments.estimatedDelivery,
      actualDelivery: shipments.actualDelivery,
      userId: shipments.userId,
      createdAt: shipments.createdAt,
      order: orders
    })
      .from(shipments)
      .leftJoin(orders, eq(shipments.orderId, orders.id))
      .where(eq(shipments.trackingNumber, trackingNumber))
      .limit(1);

    if (shipmentResults.length === 0) {
      return undefined;
    }

    const shipment = shipmentResults[0];

    // Get order items if there's an order
    let orderItemsData: Array<OrderItem & { product: Product }> = [];
    if (shipment.orderId) {
      const itemResults = await db.select({
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
        .where(eq(orderItems.orderId, shipment.orderId));

      orderItemsData = itemResults.map(row => ({
        id: row.id,
        orderId: row.orderId,
        productId: row.productId,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        totalPrice: row.totalPrice,
        product: row.product
      }));
    }

    return {
      id: shipment.id,
      shipmentNumber: shipment.shipmentNumber,
      orderId: shipment.orderId,
      status: shipment.status,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      shippingAddress: shipment.shippingAddress,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      userId: shipment.userId,
      createdAt: shipment.createdAt,
      order: shipment.order || null,
      orderItems: orderItemsData
    };
  }

  static async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const [newShipment] = await db.insert(shipments).values(shipment).returning();
    return newShipment;
  }

  static async updateShipment(id: string, shipment: Partial<InsertShipment>): Promise<Shipment> {
    const [updatedShipment] = await db.update(shipments).set(shipment).where(eq(shipments.id, id)).returning();
    return updatedShipment;
  }

  static async deleteShipment(id: string): Promise<void> {
    await db.delete(shipments).where(eq(shipments.id, id));
  }
}