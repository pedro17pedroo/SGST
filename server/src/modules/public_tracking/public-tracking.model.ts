import { db } from '../../../database/db';
import { 
  shipments, orders, orderItems, products,
  type Shipment, type Order, type OrderItem, type Product
} from '../../../../shared/schema';
import { eq, or, sql } from 'drizzle-orm';

export class PublicTrackingModel {
  static async trackShipment(trackingNumber: string): Promise<(Shipment & { order?: any | null; orderItems?: Array<OrderItem & { product: Product }> }) | undefined> {
    // Use Drizzle ORM to search by both tracking_number and shipment_number
    const shipmentData = await db.select()
      .from(shipments)
      .where(
        or(
          eq(shipments.trackingNumber, trackingNumber),
          eq(shipments.shipmentNumber, trackingNumber)
        )
      )
      .limit(1);
  
    if (!shipmentData || shipmentData.length === 0) {
      return undefined;
    }
  
    const shipment = shipmentData[0];

    // Get order data if there's an order
    let orderData = null;
    if (shipment.orderId) {
      const orderResult = await db.select()
        .from(orders)
        .where(eq(orders.id, shipment.orderId))
        .limit(1);
      
      if (orderResult && orderResult.length > 0) {
        orderData = orderResult[0];
      }
    }

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
      const itemRows = itemResults as any;
      
      if (itemRows && itemRows.length > 0) {
        orderItemsData = itemRows.map((row: any) => ({
          id: row.id,
          orderId: row.order_id,
          productId: row.product_id,
          quantity: row.quantity,
          unitPrice: row.unit_price,
          totalPrice: row.total_price,
          product: {
            id: row.product_id,
            name: row.product_name,
            sku: row.product_sku,
            description: row.product_description,
            price: row.product_price,
            barcode: null,
            weight: null,
            dimensions: null,
            categoryId: null,
            supplierId: null,
            minStockLevel: 0,
            isActive: true,
            createdAt: null
          }
        }));
      }
    }

    return {
      id: shipmentData.id,
      shipmentNumber: shipmentData.shipment_number,
      orderId: shipmentData.order_id,
      vehicleId: shipmentData.vehicle_id,
      status: shipmentData.status,
      carrier: shipmentData.carrier,
      trackingNumber: shipmentData.tracking_number,
      shippingAddress: shipmentData.shipping_address,
      estimatedDelivery: shipmentData.estimated_delivery,
      actualDelivery: shipmentData.actual_delivery,
      userId: shipmentData.user_id,
      createdAt: shipmentData.created_at,
      order: orderData,
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
    // Implementação temporária usando SQL raw
    const productQuery = sql`
      SELECT id, name, sku, barcode
      FROM products 
      WHERE barcode = ${barcode}
      LIMIT 1
    `;
    
    const productResults = await db.execute(productQuery);
    const productRows = productResults as any;
    
    if (!productRows || productRows.length === 0 || !productRows[0] || productRows[0].length === 0) {
      return null;
    }
    
    const product = productRows[0][0];
    
    return {
      barcode,
      productName: product.name || 'Produto sem nome',
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
    // Implementação temporária usando SQL raw
    const productQuery = sql`
      SELECT id, name, sku, barcode
      FROM products 
      WHERE barcode = ${barcode}
      LIMIT 1
    `;
    
    const productResults = await db.execute(productQuery);
    const productRows = productResults as any;
    
    if (!productRows || productRows.length === 0 || !productRows[0] || productRows[0].length === 0) {
      return null;
    }
    
    const product = productRows[0][0];
    
    return {
      barcode,
      productName: product.name || 'Produto sem nome',
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