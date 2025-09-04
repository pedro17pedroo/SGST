import { db } from '../../../database/db';
import { 
  type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type Product, type Supplier, type User
} from '@shared/schema';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class OrdersModel {
  static async getOrders(): Promise<Array<Order & { supplier?: Supplier | null; user?: User | null }>> {
    const result = await db.execute(sql`
      SELECT o.id, o.order_number, o.type, o.status, o.customer_id, o.customer_name, 
             o.customer_email, o.customer_phone, o.customer_address, 
             o.supplier_id, o.total_amount, o.notes, o.user_id, o.created_at,
             s.id as s_id, s.name as s_name, s.email as s_email, 
             s.phone as s_phone, s.address as s_address, s.created_at as s_created_at,
             u.id as u_id, u.username as u_username, u.email as u_email, 
             u.role as u_role, u.is_active as u_is_active, u.created_at as u_created_at
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    return (result[0] as any).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      type: row.type,
      status: row.status,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      supplierId: row.supplier_id,
      totalAmount: row.total_amount,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at,
      supplier: row.s_id ? {
        id: row.s_id,
        name: row.s_name,
        email: row.s_email,
        phone: row.s_phone,
        address: row.s_address,
        createdAt: row.s_created_at
      } : null,
      user: row.u_id ? {
        id: row.u_id,
        username: row.u_username,
        email: row.u_email,
        password: '',
        role: row.u_role,
        isActive: row.u_is_active,
        createdAt: row.u_created_at
      } : null
    }));
  }

  static async getOrder(id: string): Promise<(Order & { supplier?: Supplier | null; user?: User | null }) | null> {
    const result = await db.execute(sql`
      SELECT o.id, o.order_number, o.type, o.status, o.customer_id, o.customer_name, 
             o.customer_email, o.customer_phone, o.customer_address, 
             o.supplier_id, o.total_amount, o.notes, o.user_id, o.created_at,
             s.id as s_id, s.name as s_name, s.email as s_email, 
             s.phone as s_phone, s.address as s_address, s.created_at as s_created_at,
             u.id as u_id, u.username as u_username, u.email as u_email, 
             u.role as u_role, u.is_active as u_is_active, u.created_at as u_created_at
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${id}
      LIMIT 1
    `);
    
    if ((result[0] as any).length === 0) return null;
    
    const row = (result[0] as any)[0];
    return {
      id: row.id,
      orderNumber: row.order_number,
      type: row.type,
      status: row.status,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      supplierId: row.supplier_id,
      totalAmount: row.total_amount,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at,
      supplier: row.s_id ? {
        id: row.s_id,
        name: row.s_name,
        email: row.s_email,
        phone: row.s_phone,
        address: row.s_address,
        createdAt: row.s_created_at
      } : null,
      user: row.u_id ? {
        id: row.u_id,
        username: row.u_username,
        email: row.u_email,
        password: '',
        role: row.u_role,
        isActive: row.u_is_active,
        createdAt: row.u_created_at
      } : null
    };
  }

  static async createOrder(orderData: InsertOrder): Promise<Order> {
    // Função para gerar orderNumber único usando UUID
    const generateOrderNumber = (type: string): string => {
      const prefix = type === 'purchase' ? 'PUR' : 'ORD';
      const year = new Date().getFullYear();
      // Usar UUID parcial para garantir unicidade
      const uuid = randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
      return `${prefix}-${year}-${uuid}`;
    };

    // Sempre gerar orderNumber único (ignorar o que vem do frontend)
    orderData.orderNumber = generateOrderNumber(orderData.type);

    await db.execute(sql`
      INSERT INTO orders (
        order_number, type, status, customer_id, customer_name, customer_email, 
        customer_phone, customer_address, supplier_id, total_amount, notes, user_id
      ) VALUES (
        ${orderData.orderNumber}, ${orderData.type}, ${orderData.status}, 
        ${orderData.customerId || null}, ${orderData.customerName || null}, ${orderData.customerEmail || null},
        ${orderData.customerPhone || null}, ${orderData.customerAddress || null}, ${orderData.supplierId || null},
        ${orderData.totalAmount || 0}, ${orderData.notes || null}, ${orderData.userId || null}
      )
    `);
    
    // Buscar o registro criado
    const created = await db.execute(sql`
      SELECT * FROM orders WHERE order_number = ${orderData.orderNumber} LIMIT 1
    `);
    
    const row = (created as any[])[0];
    return {
      id: row.id,
      orderNumber: row.order_number,
      type: row.type,
      status: row.status,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      supplierId: row.supplier_id,
      totalAmount: row.total_amount,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at
    };
  }

  static async updateOrder(id: string, orderData: Partial<InsertOrder>): Promise<Order | null> {
    const setParts = [];
    
    if (orderData.orderNumber !== undefined) {
      setParts.push(`order_number = '${orderData.orderNumber}'`);
    }
    if (orderData.type !== undefined) {
      setParts.push(`type = '${orderData.type}'`);
    }
    if (orderData.status !== undefined) {
      setParts.push(`status = '${orderData.status}'`);
    }
    if (orderData.customerId !== undefined) {
      setParts.push(`customer_id = ${orderData.customerId ? `'${orderData.customerId}'` : 'NULL'}`);
    }
    if (orderData.customerName !== undefined) {
      setParts.push(`customer_name = ${orderData.customerName ? `'${orderData.customerName}'` : 'NULL'}`);
    }
    if (orderData.customerEmail !== undefined) {
      setParts.push(`customer_email = ${orderData.customerEmail ? `'${orderData.customerEmail}'` : 'NULL'}`);
    }
    if (orderData.customerPhone !== undefined) {
      setParts.push(`customer_phone = ${orderData.customerPhone ? `'${orderData.customerPhone}'` : 'NULL'}`);
    }
    if (orderData.customerAddress !== undefined) {
      setParts.push(`customer_address = ${orderData.customerAddress ? `'${orderData.customerAddress}'` : 'NULL'}`);
    }
    if (orderData.supplierId !== undefined) {
      setParts.push(`supplier_id = ${orderData.supplierId ? `'${orderData.supplierId}'` : 'NULL'}`);
    }
    if (orderData.totalAmount !== undefined) {
      setParts.push(`total_amount = ${orderData.totalAmount}`);
    }
    if (orderData.notes !== undefined) {
      setParts.push(`notes = ${orderData.notes ? `'${orderData.notes}'` : 'NULL'}`);
    }
    if (orderData.userId !== undefined) {
      setParts.push(`user_id = ${orderData.userId ? `'${orderData.userId}'` : 'NULL'}`);
    }
    
    if (setParts.length === 0) return null;
    
    await db.execute(sql.raw(`UPDATE orders SET ${setParts.join(', ')} WHERE id = '${id}'`));
    
    const result = await db.execute(sql`
      SELECT * FROM orders WHERE id = ${id} LIMIT 1
    `);
    
    if ((result as any).length === 0) return null;
    
    const row = (result as any)[0];
    return {
      id: row.id,
      orderNumber: row.order_number,
      type: row.type,
      status: row.status,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      supplierId: row.supplier_id,
      totalAmount: row.total_amount,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at
    };
  }

  static async deleteOrder(id: string): Promise<boolean> {
    const result = await db.execute(sql`
      DELETE FROM orders WHERE id = ${id}
    `);
    return (result as any).rowsAffected > 0;
  }

  static async getOrderItems(orderId: string): Promise<Array<OrderItem & { product: Product }>> {
    const result = await db.execute(sql`
      SELECT oi.*, 
             p.id as product_id, p.name as product_name, p.description as product_description,
             p.sku, p.barcode, p.price as product_price, p.weight, p.dimensions,
             p.category_id, p.supplier_id as product_supplier_id, p.min_stock_level, 
             p.is_active as product_is_active, p.created_at as product_created_at
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${orderId}
    `);
    
    return (result[0] as any).map((row: any) => ({
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalPrice: row.total_price,
      product: {
        id: row.product_id,
        name: row.product_name,
        description: row.product_description,
        sku: row.sku,
        barcode: row.barcode,
        price: row.product_price,
        weight: row.weight,
        dimensions: row.dimensions,
        categoryId: row.category_id,
        supplierId: row.product_supplier_id,
        minStockLevel: row.min_stock_level,
        isActive: row.product_is_active,
        createdAt: row.product_created_at
      }
    }));
  }

  static async createOrderItem(itemData: InsertOrderItem): Promise<OrderItem> {
    await db.execute(sql`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
      VALUES (${itemData.orderId}, ${itemData.productId}, ${itemData.quantity}, ${itemData.unitPrice}, ${itemData.totalPrice})
    `);
    
    const result = await db.execute(sql`
      SELECT * FROM order_items 
      WHERE order_id = ${itemData.orderId} AND product_id = ${itemData.productId}
      ORDER BY id DESC LIMIT 1
    `);
    
    const row = (result as any)[0];
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalPrice: row.total_price
    };
  }

  static async updateOrderItem(id: string, itemData: Partial<InsertOrderItem>): Promise<OrderItem | null> {
    const setParts = [];
    
    if (itemData.quantity !== undefined) {
      setParts.push(`quantity = ${itemData.quantity}`);
    }
    if (itemData.unitPrice !== undefined) {
      setParts.push(`unit_price = ${itemData.unitPrice}`);
    }
    if (itemData.totalPrice !== undefined) {
      setParts.push(`total_price = ${itemData.totalPrice}`);
    }
    
    if (setParts.length === 0) return null;
    
    await db.execute(sql.raw(`UPDATE order_items SET ${setParts.join(', ')} WHERE id = '${id}'`));
    
    const result = await db.execute(sql`
      SELECT * FROM order_items WHERE id = ${id} LIMIT 1
    `);
    
    if ((result as any).length === 0) return null;
    
    const row = (result as any)[0];
    return {
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalPrice: row.total_price
    };
  }

  static async deleteOrderItem(id: string): Promise<boolean> {
    const result = await db.execute(sql`
      DELETE FROM order_items WHERE id = ${id}
    `);
    return (result as any).rowsAffected > 0;
  }

  static async getPendingOrdersCount(): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
    `);
    return (result as any)[0].count;
  }

  static async getRecentOrders(limit: number = 5): Promise<Array<Order & { supplier?: Supplier | null; user?: User | null }>> {
    const result = await db.execute(sql`
      SELECT o.id, o.order_number, o.type, o.status, o.customer_id, o.customer_name, 
             o.customer_email, o.customer_phone, o.customer_address, 
             o.supplier_id, o.total_amount, o.notes, o.user_id, o.created_at,
             s.id as s_id, s.name as s_name, s.email as s_email, 
             s.phone as s_phone, s.address as s_address, s.created_at as s_created_at,
             u.id as u_id, u.username as u_username, u.email as u_email, 
             u.role as u_role, u.is_active as u_is_active, u.created_at as u_created_at
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT ${limit}
    `);
    
    return (result[0] as any).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      type: row.type,
      status: row.status,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      supplierId: row.supplier_id,
      totalAmount: row.total_amount,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at,
      supplier: row.s_id ? {
        id: row.s_id,
        name: row.s_name,
        email: row.s_email,
        phone: row.s_phone,
        address: row.s_address,
        createdAt: row.s_created_at
      } : null,
      user: row.u_id ? {
        id: row.u_id,
        username: row.u_username,
        email: row.u_email,
        password: '',
        role: row.u_role,
        isActive: row.u_is_active,
        createdAt: row.u_created_at
      } : null
    }));
  }

  static async getPendingOrders(): Promise<Array<Order & { supplier?: Supplier | null; user?: User | null }>> {
    const result = await db.execute(sql`
      SELECT o.id, o.order_number, o.type, o.status, o.customer_id, o.customer_name, 
             o.customer_email, o.customer_phone, o.customer_address, 
             o.supplier_id, o.total_amount, o.notes, o.user_id, o.created_at,
             s.id as s_id, s.name as s_name, s.email as s_email, 
             s.phone as s_phone, s.address as s_address, s.created_at as s_created_at,
             u.id as u_id, u.username as u_username, u.email as u_email, 
             u.role as u_role, u.is_active as u_is_active, u.created_at as u_created_at
      FROM orders o
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.status = 'pending'
      ORDER BY o.created_at DESC
    `);
    
    return (result[0] as any).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      type: row.type,
      status: row.status,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      supplierId: row.supplier_id,
      totalAmount: row.total_amount,
      notes: row.notes,
      userId: row.user_id,
      createdAt: row.created_at,
      supplier: row.s_id ? {
        id: row.s_id,
        name: row.s_name,
        email: row.s_email,
        phone: row.s_phone,
        address: row.s_address,
        createdAt: row.s_created_at
      } : null,
      user: row.u_id ? {
        id: row.u_id,
        username: row.u_username,
        email: row.u_email,
        password: '',
        role: row.u_role,
        isActive: row.u_is_active,
        createdAt: row.u_created_at
      } : null
    }));
  }
}