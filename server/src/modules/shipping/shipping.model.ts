import { db } from '../../../database/db';
import { 
  shipments, orders, orderItems, products, users,
  type Shipment, type InsertShipment, type Order, type OrderItem, type Product, type User
} from '@shared/schema';
import { desc, eq, sql, and } from 'drizzle-orm';

// Contador para geração de números de envio
let nextShipmentNumber = 1;

export class ShippingModel {
  /**
   * Gera um número único de envio
   */
  static async generateShipmentNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const shipmentNumber = `SHP-${currentYear}-${String(nextShipmentNumber).padStart(6, '0')}`;
      
      // Verifica se o número já existe no banco de dados
      const existingShipment = await db.select()
        .from(shipments)
        .where(eq(shipments.shipmentNumber, shipmentNumber))
        .limit(1);
      
      if (existingShipment.length === 0) {
        nextShipmentNumber++;
        return shipmentNumber;
      }
      
      // Se já existe, incrementa e tenta novamente
      nextShipmentNumber++;
      attempts++;
    }
    
    // Se não conseguir gerar após muitas tentativas, usa timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `SHP-${currentYear}-${timestamp}`;
  }
  
  /**
   * Valida se um número de envio é único
   */
  static async validateShipmentNumberUniqueness(shipmentNumber: string): Promise<boolean> {
    const existingShipment = await db.select()
      .from(shipments)
      .where(eq(shipments.shipmentNumber, shipmentNumber))
      .limit(1);
    return existingShipment.length === 0;
  }
  static async getShipments(): Promise<Array<Shipment & { order?: Order | null; user?: User | null }>> {
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
      vehicleId: shipments.vehicleId,
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
      vehicleId: row.vehicleId,
      createdAt: row.createdAt,
      order: row.order || null,
      user: row.user || null
    }));
  }

  static async getShipment(id: string): Promise<Shipment | undefined> {
    const result = await db.select().from(shipments).where(eq(shipments.id, id));
    return result[0];
  }

  static async getShipmentByTrackingNumber(trackingNumber: string): Promise<(Shipment & { order?: Order | null; orderItems?: Array<OrderItem & { product: Product }> }) | undefined> {
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
      vehicleId: shipments.vehicleId,
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
      vehicleId: shipment.vehicleId,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
      userId: shipment.userId,
      createdAt: shipment.createdAt,
      order: shipment.order || null,
      orderItems: orderItemsData
    };
  }

  static async createShipment(shipment: Omit<InsertShipment, 'shipmentNumber'>): Promise<Shipment> {
    // Gera automaticamente o número do envio
    const shipmentNumber = await this.generateShipmentNumber();
    
    // Cria o objeto completo do envio com o número gerado
    const completeShipment: InsertShipment = {
      ...shipment,
      shipmentNumber
    };
    
    await db.insert(shipments).values(completeShipment);
    const newShipment = await db.select().from(shipments).orderBy(desc(shipments.createdAt)).limit(1);
    return newShipment[0];
  }

  static async updateShipment(id: string, shipment: Partial<InsertShipment>): Promise<Shipment> {
    await db.update(shipments).set(shipment).where(eq(shipments.id, id));
    const updatedShipment = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
    return updatedShipment[0];
  }

  static async deleteShipment(id: string): Promise<void> {
    await db.delete(shipments).where(eq(shipments.id, id));
  }
}