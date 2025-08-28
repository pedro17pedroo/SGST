import {
  users, categories, suppliers, warehouses, products, inventory, stockMovements, orders, orderItems, shipments,
  type User, type InsertUser, type Category, type InsertCategory, type Supplier, type InsertSupplier,
  type Warehouse, type InsertWarehouse, type Product, type InsertProduct, type Inventory, type InsertInventory,
  type StockMovement, type InsertStockMovement, type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Shipment, type InsertShipment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, ilike, sum } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    totalProducts: number;
    lowStock: number;
    pendingOrders: number;
    monthlySales: string;
  }>;
  getTopProducts(): Promise<Array<Product & { stock: number; sales: number }>>;
  getRecentActivities(): Promise<Array<StockMovement & { product: Product; user?: User }>>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<void>;
  
  // Warehouses
  getWarehouses(): Promise<Warehouse[]>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse>;
  deleteWarehouse(id: string): Promise<void>;
  
  // Products
  getProducts(): Promise<Array<Product & { category?: Category | null; supplier?: Supplier | null }>>;
  getProduct(id: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Inventory
  getLowStockProducts(): Promise<Array<Product & { stock: number; category?: Category | null }>>;
  getInventoryByWarehouse(warehouseId: string): Promise<Array<Inventory & { product: Product }>>;
  getProductInventory(productId: string): Promise<Array<Inventory & { warehouse: Warehouse }>>;
  updateInventory(productId: string, warehouseId: string, quantity: number): Promise<Inventory>;
  
  // Stock Movements
  getStockMovements(limit?: number): Promise<Array<StockMovement & { product: Product; warehouse: Warehouse; user?: User | null }>>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  
  // Orders
  getOrders(): Promise<Array<Order & { supplier?: Supplier | null; user?: User | null }>>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  deleteOrder(id: string): Promise<void>;
  
  // Order Items
  getOrderItems(orderId: string): Promise<Array<OrderItem & { product: Product }>>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Shipments
  getShipments(): Promise<Array<Shipment & { order?: Order | null; user?: User | null }>>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: string, shipment: Partial<InsertShipment>): Promise<Shipment>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDashboardStats() {
    const [totalProductsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.isActive, true));

    const [lowStockResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .innerJoin(inventory, eq(products.id, inventory.productId))
      .where(
        and(
          eq(products.isActive, true),
          sql`${inventory.quantity} <= ${products.minStockLevel}`
        )
      );

    const [pendingOrdersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(eq(orders.status, 'pending'));

    const [monthlySalesResult] = await db
      .select({ total: sql<string>`coalesce(sum(${orders.totalAmount}), 0)` })
      .from(orders)
      .where(
        and(
          eq(orders.type, 'sale'),
          sql`${orders.createdAt} >= date_trunc('month', current_date)`
        )
      );

    return {
      totalProducts: totalProductsResult.count,
      lowStock: lowStockResult.count,
      pendingOrders: pendingOrdersResult.count,
      monthlySales: `AOA ${Number(monthlySalesResult.total).toLocaleString()}`,
    };
  }

  async getTopProducts() {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        price: products.price,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        minStockLevel: products.minStockLevel,
        isActive: products.isActive,
        createdAt: products.createdAt,
        description: products.description,
        barcode: products.barcode,
        weight: products.weight,
        dimensions: products.dimensions,
        stock: sql<number>`coalesce(sum(${inventory.quantity}), 0)`,
        sales: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`
      })
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, and(eq(orderItems.orderId, orders.id), eq(orders.type, 'sale')))
      .where(eq(products.isActive, true))
      .groupBy(products.id)
      .orderBy(desc(sql`coalesce(sum(${orderItems.quantity}), 0)`))
      .limit(10);

    return result;
  }

  async getRecentActivities() {
    const result = await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        warehouseId: stockMovements.warehouseId,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        reference: stockMovements.reference,
        reason: stockMovements.reason,
        userId: stockMovements.userId,
        createdAt: stockMovements.createdAt,
        product: products,
        user: users
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .leftJoin(users, eq(stockMovements.userId, users.id))
      .orderBy(desc(stockMovements.createdAt))
      .limit(10);

    return result;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(category).returning();
    return result;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const [result] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return result;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [result] = await db.insert(suppliers).values(supplier).returning();
    return result;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [result] = await db
      .update(suppliers)
      .set(supplier)
      .where(eq(suppliers.id, id))
      .returning();
    return result;
  }

  async deleteSupplier(id: string): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return await db.select().from(warehouses).orderBy(warehouses.name);
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    const [result] = await db.insert(warehouses).values(warehouse).returning();
    return result;
  }

  async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse> {
    const [result] = await db
      .update(warehouses)
      .set(warehouse)
      .where(eq(warehouses.id, id))
      .returning();
    return result;
  }

  async deleteWarehouse(id: string): Promise<void> {
    await db.delete(warehouses).where(eq(warehouses.id, id));
  }

  async getProducts() {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        sku: products.sku,
        barcode: products.barcode,
        price: products.price,
        weight: products.weight,
        dimensions: products.dimensions,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        minStockLevel: products.minStockLevel,
        isActive: products.isActive,
        createdAt: products.createdAt,
        category: categories,
        supplier: suppliers
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .where(eq(products.isActive, true))
      .orderBy(products.name);

    return result;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [result] = await db.select().from(products).where(eq(products.id, id));
    return result || undefined;
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.name} ILIKE ${`%${query}%`} OR ${products.sku} ILIKE ${`%${query}%`}`
        )
      )
      .limit(10);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await db.insert(products).values(product).returning();
    return result;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [result] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return result;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async getLowStockProducts() {
    return await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        minStockLevel: products.minStockLevel,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        isActive: products.isActive,
        createdAt: products.createdAt,
        description: products.description,
        barcode: products.barcode,
        price: products.price,
        weight: products.weight,
        dimensions: products.dimensions,
        stock: sql<number>`coalesce(sum(${inventory.quantity}), 0)`,
        category: categories
      })
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.minStockLevel} > 0`
        )
      )
      .groupBy(products.id, categories.id)
      .having(sql`coalesce(sum(${inventory.quantity}), 0) <= ${products.minStockLevel}`)
      .orderBy(sql`coalesce(sum(${inventory.quantity}), 0) / ${products.minStockLevel}`);
  }

  async getInventoryByWarehouse(warehouseId: string) {
    return await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        lastUpdated: inventory.lastUpdated,
        product: products
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(eq(inventory.warehouseId, warehouseId));
  }

  async getProductInventory(productId: string) {
    return await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        warehouseId: inventory.warehouseId,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        lastUpdated: inventory.lastUpdated,
        warehouse: warehouses
      })
      .from(inventory)
      .innerJoin(warehouses, eq(inventory.warehouseId, warehouses.id))
      .where(eq(inventory.productId, productId));
  }

  async updateInventory(productId: string, warehouseId: string, quantity: number): Promise<Inventory> {
    const [existing] = await db
      .select()
      .from(inventory)
      .where(and(eq(inventory.productId, productId), eq(inventory.warehouseId, warehouseId)));

    if (existing) {
      const [result] = await db
        .update(inventory)
        .set({ quantity, lastUpdated: new Date() })
        .where(eq(inventory.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db
        .insert(inventory)
        .values({ productId, warehouseId, quantity })
        .returning();
      return result;
    }
  }

  async getStockMovements(limit = 50) {
    return await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        warehouseId: stockMovements.warehouseId,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        reference: stockMovements.reference,
        reason: stockMovements.reason,
        userId: stockMovements.userId,
        createdAt: stockMovements.createdAt,
        product: products,
        warehouse: warehouses,
        user: users
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .innerJoin(warehouses, eq(stockMovements.warehouseId, warehouses.id))
      .leftJoin(users, eq(stockMovements.userId, users.id))
      .orderBy(desc(stockMovements.createdAt))
      .limit(limit);
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [result] = await db.insert(stockMovements).values(movement).returning();
    return result;
  }

  async getOrders() {
    return await db
      .select({
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
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [result] = await db.select().from(orders).where(eq(orders.id, id));
    return result || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const [result] = await db
      .update(orders)
      .set(order)
      .where(eq(orders.id, id))
      .returning();
    return result;
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async getOrderItems(orderId: string) {
    return await db
      .select({
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
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [result] = await db.insert(orderItems).values(item).returning();
    return result;
  }

  async getShipments() {
    return await db
      .select({
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
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const [result] = await db.insert(shipments).values(shipment).returning();
    return result;
  }

  async updateShipment(id: string, shipment: Partial<InsertShipment>): Promise<Shipment> {
    const [result] = await db
      .update(shipments)
      .set(shipment)
      .where(eq(shipments.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
