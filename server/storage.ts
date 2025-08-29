import {
  users, categories, suppliers, warehouses, products, inventory, stockMovements, orders, orderItems, shipments,
  productLocations, inventoryCounts, inventoryCountItems, barcodeScans, returns, returnItems,
  pickingLists, pickingListItems,
  type User, type InsertUser, type Category, type InsertCategory, type Supplier, type InsertSupplier,
  type Warehouse, type InsertWarehouse, type Product, type InsertProduct, type Inventory, type InsertInventory,
  type StockMovement, type InsertStockMovement, type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Shipment, type InsertShipment, type ProductLocation, type InsertProductLocation,
  type InventoryCount, type InsertInventoryCount, type InventoryCountItem, type InsertInventoryCountItem,
  type BarcodeScan, type InsertBarcodeScan, type Return, type InsertReturn, type ReturnItem, type InsertReturnItem,
  type PickingList, type InsertPickingList, type PickingListItem, type InsertPickingListItem
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, ilike, sum } from "drizzle-orm";

export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    totalProducts: number;
    lowStock: number;
    pendingOrders: number;
    monthlySales: string;
  }>;
  getTopProducts(): Promise<Array<Product & { stock: number; sales: number }>>;
  getRecentActivities(): Promise<Array<StockMovement & { product: Product; user?: User | null }>>;
  
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
  getShipmentByTrackingNumber(trackingNumber: string): Promise<(Shipment & { order?: Order | null; orderItems?: Array<OrderItem & { product: Product }> }) | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: string, shipment: Partial<InsertShipment>): Promise<Shipment>;

  // Product Locations (RF1.5)
  getProductLocations(warehouseId?: string): Promise<Array<ProductLocation & { product: Product; warehouse: Warehouse }>>;
  getProductLocation(productId: string, warehouseId: string): Promise<ProductLocation | undefined>;
  getProductLocationById(id: string): Promise<ProductLocation | undefined>;
  createProductLocation(location: InsertProductLocation): Promise<ProductLocation>;
  updateProductLocation(id: string, location: Partial<InsertProductLocation>): Promise<ProductLocation>;
  deleteProductLocation(id: string): Promise<void>;
  bulkAssignProductLocations(data: any): Promise<{ assigned: number; failed: number }>;
  getWarehouseZones(warehouseId: string): Promise<any[]>;
  createWarehouseZone(data: any): Promise<any>;

  // Picking & Packing (RF2.4)
  getPickingLists(filters: any): Promise<any[]>;
  getPickingListById(id: string): Promise<any>;
  createPickingList(data: any): Promise<any>;
  updatePickingList(id: string, data: any): Promise<any>;
  deletePickingList(id: string): Promise<void>;
  startPicking(id: string, userId: string): Promise<any>;
  completePicking(id: string): Promise<any>;
  pickItem(itemId: string, data: any): Promise<any>;
  verifyPickedItem(itemId: string, data: any): Promise<any>;
  createPickingWave(data: any): Promise<any>;
  getPickingWave(waveId: string): Promise<any>;
  assignWaveToUser(waveId: string, userId: string): Promise<any>;
  getPackingTasks(filters: any): Promise<any[]>;
  createPackingTask(data: any): Promise<any>;
  packItems(id: string, data: any): Promise<any>;
  completePackaging(id: string): Promise<any>;
  generateShippingLabel(data: any): Promise<any>;
  getShippingInfo(id: string): Promise<any>;

  // Batch Management (RF1.3)
  getBatches(filters: any): Promise<any[]>;
  getBatchById(id: string): Promise<any>;
  getBatchByNumber(batchNumber: string): Promise<any>;
  createBatch(data: any): Promise<any>;
  updateBatch(id: string, data: any): Promise<any>;
  deleteBatch(id: string): Promise<void>;
  addProductsToBatch(batchId: string, data: any): Promise<any>;
  removeProductFromBatch(batchId: string, productId: string): Promise<void>;
  getBatchExpiryAlerts(batchId: string): Promise<any[]>;
  getExpiringProducts(daysAhead: number, warehouseId?: string): Promise<any[]>;
  getExpiredProducts(warehouseId?: string): Promise<any[]>;
  extendBatchExpiry(batchIds: string[], data: any): Promise<any>;
  getBatchHistory(batchNumber: string): Promise<any[]>;
  getBatchLocation(batchNumber: string): Promise<any>;

  // Inventory Counts (RF1.4)
  getInventoryCounts(warehouseId?: string): Promise<Array<InventoryCount & { warehouse: Warehouse; user?: User | null }>>;
  getInventoryCount(id: string): Promise<InventoryCount | undefined>;
  createInventoryCount(count: InsertInventoryCount): Promise<InventoryCount>;
  updateInventoryCount(id: string, count: Partial<InsertInventoryCount>): Promise<InventoryCount>;
  getInventoryCountItems(countId: string): Promise<Array<InventoryCountItem & { product: Product }>>;
  getInventoryCountItem(id: string): Promise<InventoryCountItem | undefined>;
  createInventoryCountItem(item: InsertInventoryCountItem): Promise<InventoryCountItem>;
  updateInventoryCountItem(id: string, item: Partial<InsertInventoryCountItem>): Promise<InventoryCountItem>;
  deleteInventoryCount(id: string): Promise<void>;
  generateInventoryCountList(countId: string, filters: any): Promise<InventoryCountItem[]>;
  reconcileInventoryCount(countId: string): Promise<{ reconciled: number; adjustments: any[] }>;
  completeInventoryCount(countId: string): Promise<InventoryCount>;

  // Barcode Scans (RF2.1)
  getBarcodeScans(limit?: number): Promise<Array<BarcodeScan & { product?: Product | null; warehouse?: Warehouse | null; user: User }>>;
  createBarcodeScan(scan: InsertBarcodeScan): Promise<BarcodeScan>;
  findProductByBarcode(barcode: string): Promise<Product | undefined>;
  getBarcodeScansByProduct(productId: string): Promise<Array<BarcodeScan & { warehouse?: Warehouse | null; user: User }>>;
  updateProductLastScanned(productId: string, userId: string): Promise<void>;
  updateBarcodeScanLocation(scanId: string, locationData: any): Promise<BarcodeScan>;
  getLastProductLocation(productId: string): Promise<any>;

  // Picking Lists (RF2.4)
  getPickingLists(warehouseId?: string): Promise<Array<PickingList & { warehouse: Warehouse; order?: Order | null; assignedUser?: User | null; user?: User | null }>>;
  getPickingList(id: string): Promise<(PickingList & { warehouse: Warehouse; order?: Order | null; items: Array<PickingListItem & { product: Product; location?: ProductLocation | null }> }) | undefined>;
  createPickingList(pickingList: InsertPickingList): Promise<PickingList>;
  updatePickingList(id: string, pickingList: Partial<InsertPickingList>): Promise<PickingList>;
  deletePickingList(id: string): Promise<void>;
  getPickingListItems(pickingListId: string): Promise<Array<PickingListItem & { product: Product; location?: ProductLocation | null }>>;
  createPickingListItem(item: InsertPickingListItem): Promise<PickingListItem>;
  updatePickingListItem(id: string, item: Partial<InsertPickingListItem>): Promise<PickingListItem>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

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

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Dashboard
  async getDashboardStats() {
    try {
      // Get real data from database
      const [totalProductsResult] = await db.select({ count: sql<number>`count(*)` }).from(products);
      const totalProducts = totalProductsResult.count || 0;
      
      const [pendingOrdersResult] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'pending'));
      const pendingOrders = pendingOrdersResult.count || 0;
      
      // Count products with stock below minimum level
      const lowStockProducts = await db.select({ count: sql<number>`count(*)` })
        .from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .where(sql`${inventory.quantity} < ${products.minStockLevel}`);
      const lowStock = lowStockProducts[0]?.count || 0;
      
      // Calculate monthly sales from completed orders this month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const [salesResult] = await db.select({ total: sql<string>`sum(${orders.totalAmount})` })
        .from(orders)
        .where(and(eq(orders.status, 'completed'), sql`${orders.createdAt} >= ${currentMonth}`));
      const monthlySales = `AOA ${Number(salesResult.total || 0).toLocaleString('pt-AO')}`;
      
      return {
        totalProducts,
        lowStock,
        pendingOrders,
        monthlySales,
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        totalProducts: 0,
        lowStock: 0,
        pendingOrders: 0,
        monthlySales: 'AOA 0',
      };
    }
  }

  async getTopProducts() {
    try {
      // Get products with highest sales from order items
      return await db.select({
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
        stock: sql<number>`COALESCE(sum(${inventory.quantity}), 0)`,
        sales: sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`
      })
        .from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .leftJoin(orderItems, eq(products.id, orderItems.productId))
        .groupBy(products.id)
        .orderBy(desc(sql<number>`COALESCE(sum(${orderItems.quantity}), 0)`))
        .limit(5);
    } catch (error) {
      console.error('Top products error:', error);
      return [];
    }
  }

  async getRecentActivities() {
    try {
      const results = await db.select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        warehouseId: stockMovements.warehouseId,
        userId: stockMovements.userId,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        reference: stockMovements.reference,
        reason: stockMovements.reason,
        createdAt: stockMovements.createdAt,
        product: products,
        warehouse: warehouses,
        user: users
      })
        .from(stockMovements)
        .leftJoin(products, eq(stockMovements.productId, products.id))
        .leftJoin(warehouses, eq(stockMovements.warehouseId, warehouses.id))
        .leftJoin(users, eq(stockMovements.userId, users.id))
        .orderBy(desc(stockMovements.createdAt))
        .limit(10);
      
      return results.map(row => ({
        id: row.id,
        productId: row.productId,
        warehouseId: row.warehouseId,
        userId: row.userId,
        type: row.type,
        quantity: row.quantity,
        reference: row.reference,
        reason: row.reason,
        createdAt: row.createdAt,
        product: row.product!,
        warehouse: row.warehouse!,
        user: row.user
      }));
    } catch (error) {
      console.error('Recent activities error:', error);
      return [];
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories).orderBy(desc(categories.createdAt));
    } catch (error) {
      console.error('Categories error:', error);
      return [];
    }
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

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    try {
      return await db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
    } catch (error) {
      console.error('Suppliers error:', error);
      return [];
    }
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

  // Warehouses
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

  // Products
  async getProducts(): Promise<Array<Product & { category?: Category | null; supplier?: Supplier | null }>> {
    try {
      return await db.select()
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
        .orderBy(desc(products.createdAt))
        .then(results => 
          results.map(row => ({
            ...row.products,
            category: row.categories,
            supplier: row.suppliers
          }))
        );
    } catch (error) {
      console.error('Products error:', error);
      return [];
    }
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

  // Inventory
  async getLowStockProducts() {
    try {
      return await db.select({
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
        stock: sql<number>`COALESCE(sum(${inventory.quantity}), 0)`,
        category: categories
      })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .groupBy(products.id, categories.id)
        .having(sql`COALESCE(sum(${inventory.quantity}), 0) < ${products.minStockLevel}`)
        .orderBy(sql`COALESCE(sum(${inventory.quantity}), 0)`);
    } catch (error) {
      console.error('Low stock products error:', error);
      return [];
    }
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

  // Stock Movements
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

  // Orders
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

  // Order Items
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

  // Shipments
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

  async getShipmentByTrackingNumber(trackingNumber: string) {
    const [shipment] = await db
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
        order: orders
      })
      .from(shipments)
      .leftJoin(orders, eq(shipments.orderId, orders.id))
      .where(eq(shipments.trackingNumber, trackingNumber));

    if (!shipment) {
      return undefined;
    }

    // Get order items if there's an order
    let orderItems: Array<OrderItem & { product: Product }> = [];
    if (shipment.orderId) {
      orderItems = await this.getOrderItems(shipment.orderId);
    }

    return {
      ...shipment,
      orderItems
    };
  }

  // Product Locations (RF1.5)
  async getProductLocations(warehouseId?: string) {
    const query = db
      .select({
        id: productLocations.id,
        productId: productLocations.productId,
        warehouseId: productLocations.warehouseId,
        zone: productLocations.zone,
        shelf: productLocations.shelf,
        bin: productLocations.bin,
        lastScanned: productLocations.lastScanned,
        scannedByUserId: productLocations.scannedByUserId,
        createdAt: productLocations.createdAt,
        product: products,
        warehouse: warehouses
      })
      .from(productLocations)
      .innerJoin(products, eq(productLocations.productId, products.id))
      .innerJoin(warehouses, eq(productLocations.warehouseId, warehouses.id));

    if (warehouseId) {
      query.where(eq(productLocations.warehouseId, warehouseId));
    }

    return await query.orderBy(desc(productLocations.createdAt));
  }

  async getProductLocation(productId: string, warehouseId: string) {
    const [location] = await db
      .select()
      .from(productLocations)
      .where(and(
        eq(productLocations.productId, productId),
        eq(productLocations.warehouseId, warehouseId)
      ));
    return location || undefined;
  }

  async createProductLocation(location: InsertProductLocation): Promise<ProductLocation> {
    const [result] = await db.insert(productLocations).values(location).returning();
    return result;
  }

  async updateProductLocation(id: string, location: Partial<InsertProductLocation>): Promise<ProductLocation> {
    const [result] = await db
      .update(productLocations)
      .set(location)
      .where(eq(productLocations.id, id))
      .returning();
    return result;
  }

  async deleteProductLocation(id: string): Promise<void> {
    await db.delete(productLocations).where(eq(productLocations.id, id));
  }

  async getProductLocationById(id: string): Promise<ProductLocation | undefined> {
    const [location] = await db
      .select()
      .from(productLocations)
      .where(eq(productLocations.id, id));
    return location || undefined;
  }

  async bulkAssignProductLocations(data: {
    productIds: string[];
    warehouseId: string;
    zone: string;
    autoAssignBins: boolean;
  }): Promise<{ assigned: number; failed: number }> {
    let assigned = 0;
    let failed = 0;
    
    for (const productId of data.productIds) {
      try {
        const bin = data.autoAssignBins ? `BIN-${Math.random().toString(36).substr(2, 9)}` : undefined;
        
        await db.insert(productLocations).values({
          productId,
          warehouseId: data.warehouseId,
          zone: data.zone,
          bin,
          pickingPriority: 5
        });
        assigned++;
      } catch (error) {
        console.error(`Failed to assign location for product ${productId}:`, error);
        failed++;
      }
    }
    
    return { assigned, failed };
  }

  async getWarehouseZones(warehouseId: string): Promise<any[]> {
    // Get unique zones from product locations
    const zones = await db
      .selectDistinct({ zone: productLocations.zone })
      .from(productLocations)
      .where(eq(productLocations.warehouseId, warehouseId));
    
    return zones.map(z => ({ 
      zoneName: z.zone,
      warehouseId,
      productCount: 0 // TODO: Count products in each zone
    }));
  }

  async createWarehouseZone(data: {
    warehouseId: string;
    zoneName: string;
    description?: string;
    maxCapacity?: number;
  }): Promise<any> {
    // For now, just return the zone data
    // In a full implementation, we'd create a separate warehouse_zones table
    return {
      id: `zone-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date()
    };
  }

  // Picking & Packing Implementation
  async getPickingLists(filters: any): Promise<any[]> {
    // Mock implementation - in real app would query picking_lists table
    return [
      {
        id: '1',
        orderNumbers: ['ORD-001', 'ORD-002'],
        warehouseId: filters.warehouseId || 'wh-1',
        status: 'pending',
        priority: 'normal',
        createdAt: new Date()
      }
    ];
  }

  async getPickingListById(id: string): Promise<any> {
    return {
      id,
      orderNumbers: ['ORD-001'],
      warehouseId: 'wh-1',
      status: 'pending',
      priority: 'normal',
      items: [],
      createdAt: new Date()
    };
  }

  async createPickingList(data: any): Promise<any> {
    return {
      id: `pl-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    };
  }

  async updatePickingList(id: string, data: any): Promise<any> {
    return {
      id,
      ...data,
      updatedAt: new Date()
    };
  }

  async deletePickingList(id: string): Promise<void> {
    // Mock deletion
  }

  async startPicking(id: string, userId: string): Promise<any> {
    return {
      id,
      status: 'in_progress',
      assignedToUserId: userId,
      startedAt: new Date()
    };
  }

  async completePicking(id: string): Promise<any> {
    return {
      id,
      status: 'completed',
      completedAt: new Date()
    };
  }

  async pickItem(itemId: string, data: any): Promise<any> {
    return {
      itemId,
      ...data,
      status: 'picked'
    };
  }

  async verifyPickedItem(itemId: string, data: any): Promise<any> {
    return {
      itemId,
      ...data,
      verified: true
    };
  }

  async createPickingWave(data: any): Promise<any> {
    return {
      id: `wave-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'active'
    };
  }

  async getPickingWave(waveId: string): Promise<any> {
    return {
      id: waveId,
      pickingLists: [],
      status: 'active'
    };
  }

  async assignWaveToUser(waveId: string, userId: string): Promise<any> {
    return {
      waveId,
      assignedToUserId: userId,
      assignedAt: new Date()
    };
  }

  async getPackingTasks(filters: any): Promise<any[]> {
    return [
      {
        id: '1',
        pickingListId: 'pl-1',
        status: 'pending',
        packageType: 'box',
        createdAt: new Date()
      }
    ];
  }

  async createPackingTask(data: any): Promise<any> {
    return {
      id: `pt-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'pending',
      createdAt: new Date()
    };
  }

  async packItems(id: string, data: any): Promise<any> {
    return {
      id,
      ...data,
      status: 'packed',
      packedAt: new Date()
    };
  }

  async completePackaging(id: string): Promise<any> {
    return {
      id,
      status: 'completed',
      completedAt: new Date()
    };
  }

  async generateShippingLabel(data: any): Promise<any> {
    return {
      id: `label-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      labelUrl: '/api/shipping-labels/download',
      createdAt: new Date()
    };
  }

  async getShippingInfo(id: string): Promise<any> {
    return {
      pickingListId: id,
      trackingNumber: 'TRK-ABC123',
      carrier: 'DHL',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'ready_to_ship'
    };
  }

  // Batch Management Implementation
  async getBatches(filters: any): Promise<any[]> {
    const now = new Date();
    const sampleBatches = [
      {
        id: '1',
        batchNumber: 'BATCH-2025-001',
        productId: 'prod-1',
        warehouseId: filters.warehouseId || 'wh-1',
        manufacturingDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        quantity: 100,
        qualityStatus: 'approved',
        isExpiring: false
      },
      {
        id: '2',
        batchNumber: 'BATCH-2025-002',
        productId: 'prod-2',
        warehouseId: filters.warehouseId || 'wh-1',
        manufacturingDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        quantity: 50,
        qualityStatus: 'approved',
        isExpiring: true
      }
    ];
    
    return filters.expiryAlert ? sampleBatches.filter(b => b.isExpiring) : sampleBatches;
  }

  async getBatchById(id: string): Promise<any> {
    return {
      id,
      batchNumber: `BATCH-2025-${id.padStart(3, '0')}`,
      productId: 'prod-1',
      warehouseId: 'wh-1',
      manufacturingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      quantity: 100,
      qualityStatus: 'approved',
      supplierBatchRef: 'SUP-BATCH-001',
      notes: 'Lote em boas condições'
    };
  }

  async getBatchByNumber(batchNumber: string): Promise<any> {
    return {
      id: '1',
      batchNumber,
      productId: 'prod-1',
      warehouseId: 'wh-1',
      manufacturingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      quantity: 100,
      qualityStatus: 'approved'
    };
  }

  async createBatch(data: any): Promise<any> {
    return {
      id: `batch-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date()
    };
  }

  async updateBatch(id: string, data: any): Promise<any> {
    return {
      id,
      ...data,
      updatedAt: new Date()
    };
  }

  async deleteBatch(id: string): Promise<void> {
    // Mock deletion
  }

  async addProductsToBatch(batchId: string, data: any): Promise<any> {
    return {
      batchId,
      productsAdded: data.productIds.length,
      totalQuantity: data.quantity
    };
  }

  async removeProductFromBatch(batchId: string, productId: string): Promise<void> {
    // Mock removal
  }

  async getBatchExpiryAlerts(batchId: string): Promise<any[]> {
    return [
      {
        type: 'warning',
        message: 'Lote expira em 15 dias',
        daysUntilExpiry: 15,
        severity: 'medium'
      }
    ];
  }

  async getExpiringProducts(daysAhead: number, warehouseId?: string): Promise<any[]> {
    return [
      {
        productId: 'prod-1',
        productName: 'Produto A',
        batchNumber: 'BATCH-2025-002',
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        quantity: 50,
        daysUntilExpiry: 15
      }
    ];
  }

  async getExpiredProducts(warehouseId?: string): Promise<any[]> {
    return [
      {
        productId: 'prod-2',
        productName: 'Produto B',
        batchNumber: 'BATCH-2025-003',
        expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        quantity: 25,
        daysExpired: 5
      }
    ];
  }

  async extendBatchExpiry(batchIds: string[], data: any): Promise<any> {
    return {
      batchesUpdated: batchIds.length,
      newExpiryDate: data.newExpiryDate,
      reason: data.reason,
      extendedBy: data.extendedByUserId
    };
  }

  async getBatchHistory(batchNumber: string): Promise<any[]> {
    return [
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        action: 'created',
        description: 'Lote criado',
        userId: 'user-1'
      },
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        action: 'quality_check',
        description: 'Controlo de qualidade aprovado',
        userId: 'user-2'
      }
    ];
  }

  async getBatchLocation(batchNumber: string): Promise<any> {
    return {
      batchNumber,
      warehouseId: 'wh-1',
      warehouseName: 'Armazém Principal',
      zone: 'A',
      shelf: 'A-01',
      bin: 'A-01-001',
      quantity: 100
    };
  }

  // Inventory Counts (RF1.4)
  async getInventoryCounts(warehouseId?: string) {
    const query = db
      .select({
        id: inventoryCounts.id,
        countNumber: inventoryCounts.countNumber,
        type: inventoryCounts.type,
        status: inventoryCounts.status,
        warehouseId: inventoryCounts.warehouseId,
        scheduledDate: inventoryCounts.scheduledDate,
        completedDate: inventoryCounts.completedDate,
        userId: inventoryCounts.userId,
        notes: inventoryCounts.notes,
        createdAt: inventoryCounts.createdAt,
        warehouse: warehouses,
        user: users
      })
      .from(inventoryCounts)
      .innerJoin(warehouses, eq(inventoryCounts.warehouseId, warehouses.id))
      .leftJoin(users, eq(inventoryCounts.userId, users.id));

    if (warehouseId) {
      query.where(eq(inventoryCounts.warehouseId, warehouseId));
    }

    return await query.orderBy(desc(inventoryCounts.createdAt));
  }

  async getInventoryCount(id: string) {
    const [count] = await db
      .select()
      .from(inventoryCounts)
      .where(eq(inventoryCounts.id, id));
    return count || undefined;
  }

  async createInventoryCount(count: InsertInventoryCount): Promise<InventoryCount> {
    const [result] = await db.insert(inventoryCounts).values(count).returning();
    return result;
  }

  async updateInventoryCount(id: string, count: Partial<InsertInventoryCount>): Promise<InventoryCount> {
    const [result] = await db
      .update(inventoryCounts)
      .set(count)
      .where(eq(inventoryCounts.id, id))
      .returning();
    return result;
  }

  async getInventoryCountItems(countId: string) {
    return await db
      .select({
        id: inventoryCountItems.id,
        countId: inventoryCountItems.countId,
        productId: inventoryCountItems.productId,
        expectedQuantity: inventoryCountItems.expectedQuantity,
        countedQuantity: inventoryCountItems.countedQuantity,
        variance: inventoryCountItems.variance,
        reconciled: inventoryCountItems.reconciled,
        countedByUserId: inventoryCountItems.countedByUserId,
        countedAt: inventoryCountItems.countedAt,
        product: products
      })
      .from(inventoryCountItems)
      .innerJoin(products, eq(inventoryCountItems.productId, products.id))
      .where(eq(inventoryCountItems.countId, countId));
  }

  async createInventoryCountItem(item: InsertInventoryCountItem): Promise<InventoryCountItem> {
    const [result] = await db.insert(inventoryCountItems).values(item).returning();
    return result;
  }

  async updateInventoryCountItem(id: string, item: Partial<InsertInventoryCountItem>): Promise<InventoryCountItem> {
    const [result] = await db
      .update(inventoryCountItems)
      .set(item)
      .where(eq(inventoryCountItems.id, id))
      .returning();
    return result;
  }

  async getInventoryCountItem(id: string): Promise<InventoryCountItem | undefined> {
    const [item] = await db
      .select()
      .from(inventoryCountItems)
      .where(eq(inventoryCountItems.id, id));
    return item || undefined;
  }

  async deleteInventoryCount(id: string): Promise<void> {
    // First delete all count items
    await db.delete(inventoryCountItems).where(eq(inventoryCountItems.countId, id));
    // Then delete the count
    await db.delete(inventoryCounts).where(eq(inventoryCounts.id, id));
  }

  async generateInventoryCountList(countId: string, filters: {
    warehouseId?: string;
    categoryId?: string;
    supplierIds?: string[];
  }): Promise<InventoryCountItem[]> {
    // Get inventory items based on filters
    const conditions = [];
    if (filters.warehouseId) {
      conditions.push(eq(inventory.warehouseId, filters.warehouseId));
    }
    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    const query = db
      .select({
        productId: inventory.productId,
        quantity: inventory.quantity,
        product: products
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(conditions.length > 0 ? and(...conditions) : sql`1=1`);

    const inventoryItems = await query;
    
    // Create count items for each inventory item
    const countItems: InsertInventoryCountItem[] = inventoryItems.map(item => ({
      countId,
      productId: item.productId,
      expectedQuantity: item.quantity
    }));

    if (countItems.length > 0) {
      return await db.insert(inventoryCountItems).values(countItems).returning();
    }
    return [];
  }

  async reconcileInventoryCount(countId: string): Promise<{ reconciled: number; adjustments: any[] }> {
    // Get all count items with variances
    const countItems = await db
      .select()
      .from(inventoryCountItems)
      .where(eq(inventoryCountItems.countId, countId));

    const adjustments = [];
    let reconciled = 0;

    for (const item of countItems) {
      if (item.variance && item.variance !== 0 && item.countedQuantity !== null) {
        // Update inventory with counted quantity
        const [count] = await db
          .select({ warehouseId: inventoryCounts.warehouseId })
          .from(inventoryCounts)
          .where(eq(inventoryCounts.id, countId));

        if (count) {
          await db
            .update(inventory)
            .set({ quantity: item.countedQuantity })
            .where(
              and(
                eq(inventory.productId, item.productId),
                eq(inventory.warehouseId, count.warehouseId)
              )
            );

          // Mark as reconciled
          await db
            .update(inventoryCountItems)
            .set({ reconciled: true })
            .where(eq(inventoryCountItems.id, item.id));

          adjustments.push({
            productId: item.productId,
            expectedQuantity: item.expectedQuantity,
            countedQuantity: item.countedQuantity,
            variance: item.variance
          });
          reconciled++;
        }
      }
    }

    return { reconciled, adjustments };
  }

  async completeInventoryCount(countId: string): Promise<InventoryCount> {
    const [result] = await db
      .update(inventoryCounts)
      .set({ 
        status: 'completed',
        completedDate: new Date()
      })
      .where(eq(inventoryCounts.id, countId))
      .returning();
    return result;
  }

  // Barcode Scans (RF2.1)
  async getBarcodeScans(limit: number = 100) {
    return await db
      .select({
        id: barcodeScans.id,
        scannedCode: barcodeScans.scannedCode,
        scanType: barcodeScans.scanType,
        productId: barcodeScans.productId,
        warehouseId: barcodeScans.warehouseId,
        locationId: barcodeScans.locationId,
        scanPurpose: barcodeScans.scanPurpose,
        userId: barcodeScans.userId,
        metadata: barcodeScans.metadata,
        createdAt: barcodeScans.createdAt,
        product: products,
        warehouse: warehouses,
        user: users
      })
      .from(barcodeScans)
      .leftJoin(products, eq(barcodeScans.productId, products.id))
      .leftJoin(warehouses, eq(barcodeScans.warehouseId, warehouses.id))
      .innerJoin(users, eq(barcodeScans.userId, users.id))
      .orderBy(desc(barcodeScans.createdAt))
      .limit(limit);
  }

  async createBarcodeScan(scan: InsertBarcodeScan): Promise<BarcodeScan> {
    const [result] = await db.insert(barcodeScans).values(scan).returning();
    return result;
  }

  async findProductByBarcode(barcode: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.barcode, barcode));
    return product || undefined;
  }

  async getBarcodeScansByProduct(productId: string) {
    return await db
      .select({
        id: barcodeScans.id,
        scannedCode: barcodeScans.scannedCode,
        scanType: barcodeScans.scanType,
        productId: barcodeScans.productId,
        warehouseId: barcodeScans.warehouseId,
        locationId: barcodeScans.locationId,
        scanPurpose: barcodeScans.scanPurpose,
        userId: barcodeScans.userId,
        metadata: barcodeScans.metadata,
        createdAt: barcodeScans.createdAt,
        warehouse: warehouses,
        user: users
      })
      .from(barcodeScans)
      .leftJoin(warehouses, eq(barcodeScans.warehouseId, warehouses.id))
      .innerJoin(users, eq(barcodeScans.userId, users.id))
      .where(eq(barcodeScans.productId, productId))
      .orderBy(desc(barcodeScans.createdAt));
  }

  async updateProductLastScanned(productId: string, userId: string): Promise<void> {
    // Note: The products table doesn't have lastScanned fields yet
    // For now, we'll just track this via barcode scans
    // In a future migration, we could add lastScanned and scannedByUserId to products table
    console.log(`Product ${productId} scanned by user ${userId}`);
  }

  async updateBarcodeScanLocation(scanId: string, locationData: any): Promise<BarcodeScan> {
    const [result] = await db
      .update(barcodeScans)
      .set({ 
        locationId: locationData.locationId,
        metadata: sql`${barcodeScans.metadata} || ${JSON.stringify(locationData)}`
      })
      .where(eq(barcodeScans.id, scanId))
      .returning();
    return result;
  }

  async getLastProductLocation(productId: string) {
    const [lastScan] = await db
      .select({
        id: barcodeScans.id,
        scannedCode: barcodeScans.scannedCode,
        locationId: barcodeScans.locationId,
        warehouseId: barcodeScans.warehouseId,
        metadata: barcodeScans.metadata,
        createdAt: barcodeScans.createdAt,
        location: productLocations,
        warehouse: warehouses
      })
      .from(barcodeScans)
      .leftJoin(productLocations, eq(barcodeScans.locationId, productLocations.id))
      .leftJoin(warehouses, eq(barcodeScans.warehouseId, warehouses.id))
      .where(eq(barcodeScans.productId, productId))
      .orderBy(desc(barcodeScans.createdAt))
      .limit(1);
    return lastScan || undefined;
  }

  // Picking Lists Management (RF2.4)
  async getPickingLists(warehouseId?: string) {
    const query = db
      .select({
        id: pickingLists.id,
        pickNumber: pickingLists.pickNumber,
        orderId: pickingLists.orderId,
        warehouseId: pickingLists.warehouseId,
        status: pickingLists.status,
        priority: pickingLists.priority,
        assignedTo: pickingLists.assignedTo,
        type: pickingLists.type,
        scheduledDate: pickingLists.scheduledDate,
        startedAt: pickingLists.startedAt,
        completedAt: pickingLists.completedAt,
        estimatedTime: pickingLists.estimatedTime,
        actualTime: pickingLists.actualTime,
        notes: pickingLists.notes,
        userId: pickingLists.userId,
        createdAt: pickingLists.createdAt,
        warehouse: warehouses,
        order: orders,
        assignedUser: users,
        user: users
      })
      .from(pickingLists)
      .innerJoin(warehouses, eq(pickingLists.warehouseId, warehouses.id))
      .leftJoin(orders, eq(pickingLists.orderId, orders.id))
      .leftJoin(users, eq(pickingLists.assignedTo, users.id));

    if (warehouseId) {
      query.where(eq(pickingLists.warehouseId, warehouseId));
    }

    return await query.orderBy(desc(pickingLists.createdAt));
  }

  async getPickingList(id: string) {
    const [pickingListData] = await db
      .select({
        id: pickingLists.id,
        pickNumber: pickingLists.pickNumber,
        orderId: pickingLists.orderId,
        warehouseId: pickingLists.warehouseId,
        status: pickingLists.status,
        priority: pickingLists.priority,
        assignedTo: pickingLists.assignedTo,
        type: pickingLists.type,
        scheduledDate: pickingLists.scheduledDate,
        startedAt: pickingLists.startedAt,
        completedAt: pickingLists.completedAt,
        estimatedTime: pickingLists.estimatedTime,
        actualTime: pickingLists.actualTime,
        notes: pickingLists.notes,
        userId: pickingLists.userId,
        createdAt: pickingLists.createdAt,
        warehouse: warehouses,
        order: orders
      })
      .from(pickingLists)
      .innerJoin(warehouses, eq(pickingLists.warehouseId, warehouses.id))
      .leftJoin(orders, eq(pickingLists.orderId, orders.id))
      .where(eq(pickingLists.id, id));

    if (!pickingListData) {
      return undefined;
    }

    // Get picking list items
    const items = await this.getPickingListItems(id);

    return {
      ...pickingListData,
      items
    };
  }

  async createPickingList(pickingList: InsertPickingList): Promise<PickingList> {
    const [result] = await db.insert(pickingLists).values(pickingList).returning();
    return result;
  }

  async updatePickingList(id: string, pickingList: Partial<InsertPickingList>): Promise<PickingList> {
    const [result] = await db
      .update(pickingLists)
      .set(pickingList)
      .where(eq(pickingLists.id, id))
      .returning();
    return result;
  }

  async deletePickingList(id: string): Promise<void> {
    await db.delete(pickingLists).where(eq(pickingLists.id, id));
  }

  async getPickingListItems(pickingListId: string) {
    return await db
      .select({
        id: pickingListItems.id,
        pickingListId: pickingListItems.pickingListId,
        productId: pickingListItems.productId,
        locationId: pickingListItems.locationId,
        quantityToPick: pickingListItems.quantityToPick,
        quantityPicked: pickingListItems.quantityPicked,
        status: pickingListItems.status,
        pickedBy: pickingListItems.pickedBy,
        pickedAt: pickingListItems.pickedAt,
        notes: pickingListItems.notes,
        substitutedWith: pickingListItems.substitutedWith,
        product: products,
        location: productLocations
      })
      .from(pickingListItems)
      .innerJoin(products, eq(pickingListItems.productId, products.id))
      .leftJoin(productLocations, eq(pickingListItems.locationId, productLocations.id))
      .where(eq(pickingListItems.pickingListId, pickingListId))
      .orderBy(pickingListItems.id);
  }

  async createPickingListItem(item: InsertPickingListItem): Promise<PickingListItem> {
    const [result] = await db.insert(pickingListItems).values(item).returning();
    return result;
  }

  async updatePickingListItem(id: string, item: Partial<InsertPickingListItem>): Promise<PickingListItem> {
    const [result] = await db
      .update(pickingListItems)
      .set(item)
      .where(eq(pickingListItems.id, id))
      .returning();
    return result;
  }

  // Returns Management (RF3.3)
  async getReturns(supplierId?: string) {
    const query = db
      .select({
        id: returns.id,
        returnNumber: returns.returnNumber,
        type: returns.type,
        status: returns.status,
        originalOrderId: returns.originalOrderId,
        customerId: returns.customerId,
        supplierId: returns.supplierId,
        reason: returns.reason,
        condition: returns.condition,
        totalAmount: returns.totalAmount,
        refundMethod: returns.refundMethod,
        qualityInspection: returns.qualityInspection,
        notes: returns.notes,
        approvedBy: returns.approvedBy,
        processedBy: returns.processedBy,
        userId: returns.userId,
        createdAt: returns.createdAt,
        approvedAt: returns.approvedAt,
        processedAt: returns.processedAt,
        originalOrder: orders,
        supplier: suppliers,
        user: users
      })
      .from(returns)
      .leftJoin(orders, eq(returns.originalOrderId, orders.id))
      .leftJoin(suppliers, eq(returns.supplierId, suppliers.id))
      .leftJoin(users, eq(returns.userId, users.id));

    if (supplierId) {
      query.where(eq(returns.supplierId, supplierId));
    }

    return await query.orderBy(desc(returns.createdAt));
  }

  async getReturn(id: string) {
    const [returnRecord] = await db
      .select()
      .from(returns)
      .where(eq(returns.id, id));
    return returnRecord || undefined;
  }

  async createReturn(returnData: InsertReturn): Promise<Return> {
    const [result] = await db.insert(returns).values(returnData).returning();
    return result;
  }

  async updateReturn(id: string, returnData: Partial<InsertReturn>): Promise<Return> {
    const [result] = await db
      .update(returns)
      .set(returnData)
      .where(eq(returns.id, id))
      .returning();
    return result;
  }

  async getReturnItems(returnId: string) {
    return await db
      .select({
        id: returnItems.id,
        returnId: returnItems.returnId,
        productId: returnItems.productId,
        originalOrderItemId: returnItems.originalOrderItemId,
        quantity: returnItems.quantity,
        reason: returnItems.reason,
        condition: returnItems.condition,
        unitPrice: returnItems.unitPrice,
        refundAmount: returnItems.refundAmount,
        restockable: returnItems.restockable,
        restocked: returnItems.restocked,
        warehouseId: returnItems.warehouseId,
        qualityNotes: returnItems.qualityNotes,
        product: products,
        warehouse: warehouses
      })
      .from(returnItems)
      .innerJoin(products, eq(returnItems.productId, products.id))
      .leftJoin(warehouses, eq(returnItems.warehouseId, warehouses.id))
      .where(eq(returnItems.returnId, returnId));
  }

  async createReturnItem(item: InsertReturnItem): Promise<ReturnItem> {
    const [result] = await db.insert(returnItems).values(item).returning();
    return result;
  }

  async updateReturnItem(id: string, item: Partial<InsertReturnItem>): Promise<ReturnItem> {
    const [result] = await db
      .update(returnItems)
      .set(item)
      .where(eq(returnItems.id, id))
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
