import { db } from '../../../database/db';
import { 
  shipments, orders, orderItems, products,
  type Shipment, type Order, type OrderItem, type Product
} from '../../../../shared/schema';
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
      vehicleId: shipments.vehicleId, // Added missing vehicleId property
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
      vehicleId: shipment.vehicleId, // Added missing vehicleId property
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

  static async getEstimatedDelivery(trackingNumber: string) {
    // Implementação temporária
    const shipment = await this.trackShipment(trackingNumber);
    if (!shipment) {
      return null;
    }
    
    return {
      trackingNumber,
      estimatedDelivery: shipment.estimatedDelivery,
      status: shipment.status,
      carrier: shipment.carrier
    };
  }

  static async getProductLocation(barcode: string) {
    // Implementação temporária
    const product = await db.select()
      .from(products)
      .where(eq(products.barcode, barcode))
      .limit(1);
    
    if (product.length === 0) {
      return null;
    }
    
    return {
      barcode,
      productName: product[0].name,
      location: {
        warehouse: 'Armazém Principal',
        zone: 'A',
        aisle: '01',
        shelf: '03',
        bin: '05'
      },
      lastUpdated: new Date()
    };
  }

  static async getProductJourney(barcode: string) {
    // Implementação temporária
    const product = await db.select()
      .from(products)
      .where(eq(products.barcode, barcode))
      .limit(1);
    
    if (product.length === 0) {
      return null;
    }
    
    return {
      barcode,
      productName: product[0].name,
      journey: [
        {
          stage: 'received',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          location: 'Doca de Recebimento',
          note: 'Produto recebido'
        },
        {
          stage: 'putaway',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          location: 'Armazém Principal - A01-03-05',
          note: 'Produto armazenado'
        },
        {
          stage: 'picked',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          location: 'Área de Picking',
          note: 'Produto separado para envio'
        }
      ]
    };
  }

  static async getBatchProducts(batchNumber: string) {
    // Implementação temporária
    return {
      batchNumber,
      products: [
        {
          barcode: '123456789',
          name: 'Produto Exemplo 1',
          quantity: 50,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          barcode: '987654321',
          name: 'Produto Exemplo 2',
          quantity: 25,
          expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
        }
      ],
      totalQuantity: 75,
      status: 'active'
    };
  }

  static async getBatchStatus(batchNumber: string) {
    // Implementação temporária
    return {
      batchNumber,
      status: 'active',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalProducts: 75,
      availableProducts: 60,
      reservedProducts: 15,
      location: 'Armazém Principal - Zona A'
    };
  }

  static async getShipmentStatus(trackingNumber: string) {
    // Implementação temporária
    return {
      trackingNumber,
      status: 'in_transit',
      lastUpdate: new Date(),
      location: 'Centro de Distribuição - Luanda',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };
  }

  static async subscribeToNotifications(data: {
    trackingNumber: string;
    email?: string;
    phone?: string;
    notificationTypes: string[];
  }) {
    // Implementação temporária
    return {
      subscriptionId: `sub-${Date.now()}`,
      trackingNumber: data.trackingNumber,
      email: data.email,
      phone: data.phone,
      notificationTypes: data.notificationTypes,
      status: 'active',
      createdAt: new Date()
    };
  }
}