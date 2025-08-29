import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("operator"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Warehouses table
export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  barcode: varchar("barcode", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: json("dimensions"), // {length, width, height}
  categoryId: uuid("category_id").references(() => categories.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  minStockLevel: integer("min_stock_level").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  quantity: integer("quantity").notNull().default(0),
  reservedQuantity: integer("reserved_quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Stock movements table
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  type: varchar("type", { length: 50 }).notNull(), // 'in', 'out', 'transfer', 'adjustment'
  quantity: integer("quantity").notNull(),
  reference: varchar("reference", { length: 255 }), // Order ID, transfer ID, etc.
  reason: text("reason"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'sale', 'purchase'
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  customerAddress: text("customer_address"),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  notes: text("notes"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
});

// Shipments table
export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentNumber: varchar("shipment_number", { length: 100 }).notNull().unique(),
  orderId: uuid("order_id").references(() => orders.id),
  status: varchar("status", { length: 50 }).notNull().default("preparing"),
  carrier: varchar("carrier", { length: 255 }),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  shippingAddress: text("shipping_address"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product locations table for warehouse organization (RF1.5)
export const productLocations = pgTable("product_locations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  zone: varchar("zone", { length: 50 }), // A, B, C
  shelf: varchar("shelf", { length: 50 }), // A1, B2, C3
  bin: varchar("bin", { length: 50 }), // A1-01, B2-15
  lastScanned: timestamp("last_scanned"),
  scannedByUserId: uuid("scanned_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory counts table for cycle counting (RF1.4)
export const inventoryCounts = pgTable("inventory_counts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  countNumber: varchar("count_number", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'cycle', 'full', 'spot'
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  userId: uuid("user_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory count items table
export const inventoryCountItems = pgTable("inventory_count_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  countId: uuid("count_id").notNull().references(() => inventoryCounts.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  expectedQuantity: integer("expected_quantity").notNull(),
  countedQuantity: integer("counted_quantity"),
  variance: integer("variance"), // countedQuantity - expectedQuantity
  reconciled: boolean("reconciled").notNull().default(false),
  countedByUserId: uuid("counted_by_user_id").references(() => users.id),
  countedAt: timestamp("counted_at"),
});

// Barcode scans table for tracking (RF2.1)
export const barcodeScans = pgTable("barcode_scans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  scannedCode: varchar("scanned_code", { length: 255 }).notNull(),
  scanType: varchar("scan_type", { length: 50 }).notNull(), // 'barcode', 'qr', 'rfid'
  productId: uuid("product_id").references(() => products.id),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  locationId: uuid("location_id").references(() => productLocations.id),
  scanPurpose: varchar("scan_purpose", { length: 100 }).notNull(), // 'inventory', 'picking', 'receiving', 'shipping'
  userId: uuid("user_id").notNull().references(() => users.id),
  metadata: json("metadata"), // Additional data like GPS coordinates, device info
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  stockMovements: many(stockMovements),
  shipments: many(shipments),
  inventoryCounts: many(inventoryCounts),
  barcodeScans: many(barcodeScans),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
  orders: many(orders),
}));

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  inventory: many(inventory),
  stockMovements: many(stockMovements),
  productLocations: many(productLocations),
  inventoryCounts: many(inventoryCounts),
  barcodeScans: many(barcodeScans),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  inventory: many(inventory),
  stockMovements: many(stockMovements),
  orderItems: many(orderItems),
  productLocations: many(productLocations),
  inventoryCountItems: many(inventoryCountItems),
  barcodeScans: many(barcodeScans),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [inventory.warehouseId],
    references: [warehouses.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [stockMovements.warehouseId],
    references: [warehouses.id],
  }),
  user: one(users, {
    fields: [stockMovements.userId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [orders.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  shipments: many(shipments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
  user: one(users, {
    fields: [shipments.userId],
    references: [users.id],
  }),
}));

// Product location relations
export const productLocationsRelations = relations(productLocations, ({ one, many }) => ({
  product: one(products, {
    fields: [productLocations.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [productLocations.warehouseId],
    references: [warehouses.id],
  }),
  scannedByUser: one(users, {
    fields: [productLocations.scannedByUserId],
    references: [users.id],
  }),
  barcodeScans: many(barcodeScans),
}));

// Inventory count relations
export const inventoryCountsRelations = relations(inventoryCounts, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [inventoryCounts.warehouseId],
    references: [warehouses.id],
  }),
  user: one(users, {
    fields: [inventoryCounts.userId],
    references: [users.id],
  }),
  countItems: many(inventoryCountItems),
}));

// Inventory count items relations
export const inventoryCountItemsRelations = relations(inventoryCountItems, ({ one }) => ({
  count: one(inventoryCounts, {
    fields: [inventoryCountItems.countId],
    references: [inventoryCounts.id],
  }),
  product: one(products, {
    fields: [inventoryCountItems.productId],
    references: [products.id],
  }),
  countedByUser: one(users, {
    fields: [inventoryCountItems.countedByUserId],
    references: [users.id],
  }),
}));

// Barcode scans relations
export const barcodeScansRelations = relations(barcodeScans, ({ one }) => ({
  product: one(products, {
    fields: [barcodeScans.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [barcodeScans.warehouseId],
    references: [warehouses.id],
  }),
  location: one(productLocations, {
    fields: [barcodeScans.locationId],
    references: [productLocations.id],
  }),
  user: one(users, {
    fields: [barcodeScans.userId],
    references: [users.id],
  }),
}));

// Returns table for managing product returns (RF3.3)
export const returns = pgTable("returns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  returnNumber: varchar("return_number", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'customer', 'supplier', 'internal'
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected, processed, completed
  originalOrderId: uuid("original_order_id").references(() => orders.id),
  customerId: varchar("customer_id", { length: 255 }), // Customer identifier for customer returns
  supplierId: uuid("supplier_id").references(() => suppliers.id), // For supplier returns
  reason: varchar("reason", { length: 255 }), // damaged, wrong_item, defective, excess, etc.
  condition: varchar("condition", { length: 50 }), // new, damaged, used, defective
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  refundMethod: varchar("refund_method", { length: 50 }), // cash, credit, store_credit, exchange
  qualityInspection: json("quality_inspection"), // Inspection results
  notes: text("notes"),
  approvedBy: uuid("approved_by").references(() => users.id),
  processedBy: uuid("processed_by").references(() => users.id),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  processedAt: timestamp("processed_at"),
});

// Return items table for detailed return information
export const returnItems = pgTable("return_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  returnId: uuid("return_id").notNull().references(() => returns.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  originalOrderItemId: uuid("original_order_item_id").references(() => orderItems.id),
  quantity: integer("quantity").notNull(),
  reason: varchar("reason", { length: 255 }),
  condition: varchar("condition", { length: 50 }),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  restockable: boolean("restockable").notNull().default(true),
  restocked: boolean("restocked").notNull().default(false),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id), // Where to restock
  qualityNotes: text("quality_notes"),
});

// Picking Lists table for RF2.4 - Picking & Packing
export const pickingLists = pgTable("picking_lists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pickNumber: varchar("pick_number", { length: 100 }).notNull().unique(),
  orderId: uuid("order_id").references(() => orders.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high, urgent
  assignedTo: uuid("assigned_to").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull().default("order"), // order, transfer, replenishment
  scheduledDate: timestamp("scheduled_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedTime: integer("estimated_time"), // in minutes
  actualTime: integer("actual_time"), // in minutes
  notes: text("notes"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Picking List Items table
export const pickingListItems = pgTable("picking_list_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pickingListId: uuid("picking_list_id").notNull().references(() => pickingLists.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  locationId: uuid("location_id").references(() => productLocations.id),
  quantityToPick: integer("quantity_to_pick").notNull(),
  quantityPicked: integer("quantity_picked").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, picked, partial, not_found, substituted
  pickedBy: uuid("picked_by").references(() => users.id),
  pickedAt: timestamp("picked_at"),
  notes: text("notes"),
  substitutedWith: uuid("substituted_with").references(() => products.id), // If substituted with another product
});

// Alerts and Notifications table (RF4.2)
export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 50 }).notNull(), // low_stock, reorder_point, expiry, quality, system
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high, critical
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, acknowledged, resolved, dismissed
  entityType: varchar("entity_type", { length: 50 }), // product, warehouse, order, supplier
  entityId: uuid("entity_id"),
  userId: uuid("user_id").references(() => users.id), // User responsible or affected
  acknowledgedBy: uuid("acknowledged_by").references(() => users.id),
  resolvedBy: uuid("resolved_by").references(() => users.id),
  metadata: json("metadata"), // Additional context data
  scheduledFor: timestamp("scheduled_for"), // For scheduled notifications
  expiresAt: timestamp("expires_at"), // Auto-dismiss after this time
  createdAt: timestamp("created_at").defaultNow(),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
});

// Notification preferences for users
export const notificationPreferences = pgTable("notification_preferences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  channel: varchar("channel", { length: 20 }).notNull(), // email, sms, push, in_app
  enabled: boolean("enabled").notNull().default(true),
  threshold: json("threshold"), // Custom thresholds for this user
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Picking Lists relations
export const pickingListsRelations = relations(pickingLists, ({ one, many }) => ({
  order: one(orders, {
    fields: [pickingLists.orderId],
    references: [orders.id],
  }),
  warehouse: one(warehouses, {
    fields: [pickingLists.warehouseId],
    references: [warehouses.id],
  }),
  assignedUser: one(users, {
    fields: [pickingLists.assignedTo],
    references: [users.id],
  }),
  user: one(users, {
    fields: [pickingLists.userId],
    references: [users.id],
  }),
  items: many(pickingListItems),
}));

// Picking List Items relations
export const pickingListItemsRelations = relations(pickingListItems, ({ one }) => ({
  pickingList: one(pickingLists, {
    fields: [pickingListItems.pickingListId],
    references: [pickingLists.id],
  }),
  product: one(products, {
    fields: [pickingListItems.productId],
    references: [products.id],
  }),
  location: one(productLocations, {
    fields: [pickingListItems.locationId],
    references: [productLocations.id],
  }),
  pickedByUser: one(users, {
    fields: [pickingListItems.pickedBy],
    references: [users.id],
  }),
  substitutedProduct: one(products, {
    fields: [pickingListItems.substitutedWith],
    references: [products.id],
  }),
}));

// Return relations
export const returnsRelations = relations(returns, ({ one, many }) => ({
  originalOrder: one(orders, {
    fields: [returns.originalOrderId],
    references: [orders.id],
  }),
  supplier: one(suppliers, {
    fields: [returns.supplierId],
    references: [suppliers.id],
  }),
  approvedByUser: one(users, {
    fields: [returns.approvedBy],
    references: [users.id],
  }),
  processedByUser: one(users, {
    fields: [returns.processedBy],
    references: [users.id],
  }),
  user: one(users, {
    fields: [returns.userId],
    references: [users.id],
  }),
  returnItems: many(returnItems),
}));

export const returnItemsRelations = relations(returnItems, ({ one }) => ({
  return: one(returns, {
    fields: [returnItems.returnId],
    references: [returns.id],
  }),
  product: one(products, {
    fields: [returnItems.productId],
    references: [products.id],
  }),
  originalOrderItem: one(orderItems, {
    fields: [returnItems.originalOrderItemId],
    references: [orderItems.id],
  }),
  warehouse: one(warehouses, {
    fields: [returnItems.warehouseId],
    references: [warehouses.id],
  }),
}));

// Alert relations
export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
  acknowledgedByUser: one(users, {
    fields: [alerts.acknowledgedBy],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [alerts.resolvedBy],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
});

export const insertProductLocationSchema = createInsertSchema(productLocations).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryCountSchema = createInsertSchema(inventoryCounts).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryCountItemSchema = createInsertSchema(inventoryCountItems).omit({
  id: true,
});

export const insertBarcodeScanSchema = createInsertSchema(barcodeScans).omit({
  id: true,
  createdAt: true,
});

export const insertReturnSchema = createInsertSchema(returns).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
  processedAt: true,
});

export const insertReturnItemSchema = createInsertSchema(returnItems).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  acknowledgedAt: true,
  resolvedAt: true,
});

export const insertPickingListSchema = createInsertSchema(pickingLists).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertPickingListItemSchema = createInsertSchema(pickingListItems).omit({
  id: true,
  pickedAt: true,
});

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type ProductLocation = typeof productLocations.$inferSelect;
export type InsertProductLocation = z.infer<typeof insertProductLocationSchema>;
export type InventoryCount = typeof inventoryCounts.$inferSelect;
export type InsertInventoryCount = z.infer<typeof insertInventoryCountSchema>;
export type InventoryCountItem = typeof inventoryCountItems.$inferSelect;
export type InsertInventoryCountItem = z.infer<typeof insertInventoryCountItemSchema>;
export type BarcodeScan = typeof barcodeScans.$inferSelect;
export type InsertBarcodeScan = z.infer<typeof insertBarcodeScanSchema>;
export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type PickingList = typeof pickingLists.$inferSelect;
export type InsertPickingList = z.infer<typeof insertPickingListSchema>;
export type PickingListItem = typeof pickingListItems.$inferSelect;
export type InsertPickingListItem = z.infer<typeof insertPickingListItemSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
