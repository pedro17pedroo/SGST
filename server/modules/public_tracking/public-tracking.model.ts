import { db } from '../../db';
import { 
  shipments, orders, orderItems, products,
  type Shipment, type Order, type OrderItem, type Product
} from '@shared/schema';
import { eq } from 'drizzle-orm';

export class PublicTrackingModel {
  static async trackShipment(trackingNumber: string): Promise<(Shipment & { order?: any | null; orderItems?: Array<OrderItem & { product: Product }> }) | undefined> {
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

  static async getShipmentHistory(trackingNumber: string): Promise<Array<{ status: string; timestamp: Date | null; note?: string }>> {
    // For now, return basic status history based on shipment status
    // In a real system, this would come from a shipment_events table
    const shipment = await this.trackShipment(trackingNumber);
    
    if (!shipment) {
      return [];
    }

    const history = [
      {
        status: 'pending',
        timestamp: shipment.createdAt,
        note: 'Envio criado'
      }
    ];

    if (shipment.estimatedDelivery) {
      history.push({
        status: 'shipped',
        timestamp: shipment.estimatedDelivery,
        note: 'Entrega estimada'
      });
    }

    if (shipment.actualDelivery) {
      history.push({
        status: 'delivered',
        timestamp: shipment.actualDelivery,
        note: 'Produto entregue'
      });
    }

    return history.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return a.timestamp.getTime() - b.timestamp.getTime();
    });
  }
}