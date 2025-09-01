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

// Customers table - Gestão de Clientes
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerNumber: varchar("customer_number", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("Angola"),
  taxNumber: varchar("tax_number", { length: 50 }),
  customerType: varchar("customer_type", { length: 50 }).notNull().default("individual"), // individual, company
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).default("0"),
  paymentTerms: varchar("payment_terms", { length: 50 }).default("cash"), // cash, credit_30, credit_60, credit_90
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"), // Percentage discount
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  customerId: uuid("customer_id").references(() => customers.id), // Nova referência para cliente
  // Manter campos legacy temporariamente para migração
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
  vehicleId: uuid("vehicle_id").references(() => vehicles.id), // Assigned vehicle for this shipment
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

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
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
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
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
  vehicle: one(vehicles, {
    fields: [shipments.vehicleId],
    references: [vehicles.id],
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

// ===== ADVANCED WAREHOUSE MANAGEMENT FEATURES =====
// RF2.1 - Advanced Shipment Notice (ASN) for Smart Receiving
export const asn = pgTable("asn", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  asnNumber: varchar("asn_number", { length: 100 }).notNull().unique(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  poNumber: varchar("po_number", { length: 100 }), // Purchase Order reference
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_transit, arrived, receiving, completed, cancelled
  transportMode: varchar("transport_mode", { length: 50 }), // truck, rail, air, sea
  carrier: varchar("carrier", { length: 255 }),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  ediData: json("edi_data"), // Raw EDI/API data
  containerNumbers: json("container_numbers"), // Array of container/trailer numbers
  sealNumbers: json("seal_numbers"), // Array of seal numbers
  totalWeight: decimal("total_weight", { precision: 10, scale: 3 }),
  totalVolume: decimal("total_volume", { precision: 10, scale: 3 }),
  documentUrl: varchar("document_url", { length: 500 }), // Link to shipping documents
  notes: text("notes"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ASN Line Items for detailed shipment contents
export const asnLineItems = pgTable("asn_line_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  asnId: uuid("asn_id").notNull().references(() => asn.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  expectedQuantity: integer("expected_quantity").notNull(),
  unitOfMeasure: varchar("unit_of_measure", { length: 20 }).notNull().default("EA"), // EA, CS, PLT, etc.
  lotNumber: varchar("lot_number", { length: 100 }),
  expiryDate: timestamp("expiry_date"),
  serialNumbers: json("serial_numbers"), // Array of serial numbers if tracked
  palletId: varchar("pallet_id", { length: 100 }), // SSCC or internal pallet ID
  packaging: varchar("packaging", { length: 50 }), // box, case, pallet, loose
  expectedWeight: decimal("expected_weight", { precision: 8, scale: 3 }),
  expectedDimensions: json("expected_dimensions"), // {length, width, height}
  notes: text("notes"),
});

// RF2.1 - Receiving Receipts for tracking actual received items
export const receivingReceipts = pgTable("receiving_receipts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptNumber: varchar("receipt_number", { length: 100 }).notNull().unique(),
  asnId: uuid("asn_id").references(() => asn.id),
  orderId: uuid("order_id").references(() => orders.id), // For non-ASN receipts
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  status: varchar("status", { length: 50 }).notNull().default("receiving"), // receiving, completed, discrepancy, rejected
  receivingMethod: varchar("receiving_method", { length: 50 }).notNull(), // manual, barcode, rfid, computer_vision
  totalExpected: integer("total_expected"),
  totalReceived: integer("total_received").notNull().default(0),
  discrepancies: integer("discrepancies").notNull().default(0),
  damageReported: boolean("damage_reported").notNull().default(false),
  qualityInspection: json("quality_inspection"), // Inspection results
  receivedBy: uuid("received_by").notNull().references(() => users.id),
  supervisorApproval: uuid("supervisor_approval").references(() => users.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

// Receiving Receipt Line Items for detailed receiving records
export const receivingReceiptItems = pgTable("receiving_receipt_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  receiptId: uuid("receipt_id").notNull().references(() => receivingReceipts.id),
  asnLineItemId: uuid("asn_line_item_id").references(() => asnLineItems.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  expectedQuantity: integer("expected_quantity").notNull(),
  receivedQuantity: integer("received_quantity").notNull(),
  variance: integer("variance"), // receivedQuantity - expectedQuantity
  varianceReason: varchar("variance_reason", { length: 255 }), // short, overage, damage, wrong_item
  condition: varchar("condition", { length: 50 }).notNull().default("good"), // good, damaged, expired, defective
  lotNumber: varchar("lot_number", { length: 100 }),
  expiryDate: timestamp("expiry_date"),
  serialNumbers: json("serial_numbers"),
  actualWeight: decimal("actual_weight", { precision: 8, scale: 3 }),
  actualDimensions: json("actual_dimensions"),
  locationId: uuid("location_id").references(() => productLocations.id), // Where item was placed
  cvCountingId: uuid("cv_counting_id"), // Reference to computer vision count
  scannedCodes: json("scanned_codes"), // Barcodes/RFID tags scanned
  qualityNotes: text("quality_notes"),
  receivedAt: timestamp("received_at").defaultNow(),
});

// RF2.1 - Computer Vision Counting Results
export const cvCountingResults = pgTable("cv_counting_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 100 }).notNull(), // Grouping multiple counts in one session
  imageUrl: varchar("image_url", { length: 500 }), // Path to captured image
  videoUrl: varchar("video_url", { length: 500 }), // Path to captured video
  productId: uuid("product_id").references(() => products.id),
  detectedCount: integer("detected_count").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }), // 0.0 to 1.0
  algorithm: varchar("algorithm", { length: 50 }), // yolo_v8, detectron2, custom
  boundingBoxes: json("bounding_boxes"), // Array of detection coordinates
  dimensions: json("dimensions"), // Measured dimensions from CV
  weight: decimal("weight", { precision: 8, scale: 3 }), // Estimated weight
  damage: json("damage"), // Damage detection results
  manualVerification: boolean("manual_verification").notNull().default(false),
  manualCount: integer("manual_count"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, verified, rejected
  metadata: json("metadata"), // Camera settings, lighting conditions, etc.
  processingTime: integer("processing_time"), // Milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// RF2.3 - Putaway Rules for Dynamic Slotting
export const putawayRules = pgTable("putaway_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  priority: integer("priority").notNull().default(1), // 1 = highest priority
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  productCriteria: json("product_criteria"), // {categoryId, supplierId, weight, dimensions, abc_class}
  locationCriteria: json("location_criteria"), // {zone, shelf_type, height_range, accessibility}
  strategy: varchar("strategy", { length: 50 }).notNull(), // fixed, random, closest_empty, abc_velocity, fifo, lifo
  crossDockEligible: boolean("cross_dock_eligible").notNull().default(false),
  crossDockCriteria: json("cross_dock_criteria"), // Rules for automatic cross-docking
  maxCapacityUtilization: decimal("max_capacity_utilization", { precision: 5, scale: 4 }).default('0.8500'), // 85% max
  isActive: boolean("is_active").notNull().default(true),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// RF2.3 - Putaway Tasks for guided putaway
export const putawayTasks = pgTable("putaway_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskNumber: varchar("task_number", { length: 100 }).notNull().unique(),
  receiptItemId: uuid("receipt_item_id").notNull().references(() => receivingReceiptItems.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  quantity: integer("quantity").notNull(),
  suggestedLocationId: uuid("suggested_location_id").references(() => productLocations.id),
  actualLocationId: uuid("actual_location_id").references(() => productLocations.id),
  ruleApplied: uuid("rule_applied").references(() => putawayRules.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  isCrossDock: boolean("is_cross_dock").notNull().default(false),
  crossDockOrder: uuid("cross_dock_order").references(() => orders.id),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  travelDistance: decimal("travel_distance", { precision: 8, scale: 2 }), // Meters
  estimatedTime: integer("estimated_time"), // Minutes
  actualTime: integer("actual_time"), // Minutes
  notes: text("notes"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// RF2.3 - SSCC Pallets for automatic pallet generation
export const ssccPallets = pgTable("sscc_pallets", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ssccCode: varchar("sscc_code", { length: 18 }).notNull().unique(), // 18-digit SSCC
  palletType: varchar("pallet_type", { length: 50 }).notNull(), // euro, standard, custom
  status: varchar("status", { length: 50 }).notNull().default("building"), // building, completed, shipped, received
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  locationId: uuid("location_id").references(() => productLocations.id),
  maxWeight: decimal("max_weight", { precision: 10, scale: 3 }).notNull().default('1000.000'),
  maxHeight: decimal("max_height", { precision: 8, scale: 2 }).notNull().default('200.00'), // cm
  currentWeight: decimal("current_weight", { precision: 10, scale: 3 }).notNull().default('0.000'),
  currentHeight: decimal("current_height", { precision: 8, scale: 2 }).notNull().default('0.00'),
  itemCount: integer("item_count").notNull().default(0),
  mixedProducts: boolean("mixed_products").notNull().default(false),
  palletLabel: json("pallet_label"), // Label generation data
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  buildStartedAt: timestamp("build_started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pallet Items for tracking what's on each pallet
export const palletItems = pgTable("pallet_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  palletId: uuid("pallet_id").notNull().references(() => ssccPallets.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  lotNumber: varchar("lot_number", { length: 100 }),
  expiryDate: timestamp("expiry_date"),
  serialNumbers: json("serial_numbers"),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: json("dimensions"),
  position: json("position"), // {x, y, z} coordinates on pallet
  addedAt: timestamp("added_at").defaultNow(),
  addedBy: uuid("added_by").references(() => users.id),
});

// RF3.2 - Replenishment Rules for Intelligent Replenishment
export const replenishmentRules = pgTable("replenishment_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  locationId: uuid("location_id").references(() => productLocations.id), // Specific pick location
  strategy: varchar("strategy", { length: 50 }).notNull(), // min_max, demand_based, velocity_based, time_based
  minLevel: integer("min_level").notNull(),
  maxLevel: integer("max_level").notNull(),
  reorderPoint: integer("reorder_point").notNull(),
  replenishQuantity: integer("replenish_quantity").notNull(),
  leadTimeDays: integer("lead_time_days").notNull().default(1),
  safetyStock: integer("safety_stock").notNull().default(0),
  abcClassification: varchar("abc_classification", { length: 1 }), // A, B, C
  velocityCategory: varchar("velocity_category", { length: 20 }), // fast, medium, slow
  seasonalFactor: decimal("seasonal_factor", { precision: 5, scale: 4 }).default('1.0000'),
  mlModelId: varchar("ml_model_id", { length: 100 }), // Reference to ML model used
  isActive: boolean("is_active").notNull().default(true),
  lastCalculated: timestamp("last_calculated"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RF3.2 - Demand Forecasting for ML predictions
export const demandForecasts = pgTable("demand_forecasts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  forecastDate: timestamp("forecast_date").notNull(),
  forecastPeriod: varchar("forecast_period", { length: 20 }).notNull(), // daily, weekly, monthly
  predictedDemand: decimal("predicted_demand", { precision: 10, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }), // 0.0 to 1.0
  actualDemand: decimal("actual_demand", { precision: 10, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 4 }), // Calculated after actual data is available
  modelVersion: varchar("model_version", { length: 50 }),
  algorithm: varchar("algorithm", { length: 50 }), // arima, lstm, prophet, linear_regression
  features: json("features"), // Features used in prediction
  metadata: json("metadata"), // Model parameters and other data
  createdAt: timestamp("created_at").defaultNow(),
});

// RF3.2 - Replenishment Tasks for automatic replenishment
export const replenishmentTasks = pgTable("replenishment_tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  taskNumber: varchar("task_number", { length: 100 }).notNull().unique(),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  fromLocationId: uuid("from_location_id").notNull().references(() => productLocations.id), // Source location
  toLocationId: uuid("to_location_id").notNull().references(() => productLocations.id), // Destination (pick) location
  ruleId: uuid("rule_id").notNull().references(() => replenishmentRules.id),
  triggerReason: varchar("trigger_reason", { length: 100 }).notNull(), // min_level, reorder_point, prediction, manual
  quantityRequired: integer("quantity_required").notNull(),
  quantityAvailable: integer("quantity_available").notNull(),
  quantityToMove: integer("quantity_to_move").notNull(),
  quantityMoved: integer("quantity_moved").notNull().default(0),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high, urgent
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, assigned, in_progress, completed, cancelled
  assignedTo: uuid("assigned_to").references(() => users.id),
  urgencyScore: decimal("urgency_score", { precision: 5, scale: 2 }), // Calculated urgency based on velocity
  estimatedStockout: timestamp("estimated_stockout"), // When stock will run out
  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  userId: uuid("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Picking velocity tracking for replenishment optimization
export const pickingVelocity = pgTable("picking_velocity", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  locationId: uuid("location_id").references(() => productLocations.id),
  date: timestamp("date").notNull(),
  period: varchar("period", { length: 20 }).notNull(), // hourly, daily, weekly
  totalPicked: integer("total_picked").notNull().default(0),
  pickingEvents: integer("picking_events").notNull().default(0),
  averagePickTime: decimal("average_pick_time", { precision: 8, scale: 2 }), // Seconds
  peakHour: integer("peak_hour"), // Hour of day with most picks (0-23)
  velocityScore: decimal("velocity_score", { precision: 8, scale: 4 }), // Calculated velocity metric
  abcClass: varchar("abc_class", { length: 1 }), // A, B, C classification
  trendDirection: varchar("trend_direction", { length: 10 }), // up, down, stable
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Advanced warehouse management insert schemas
export const insertAsnSchema = createInsertSchema(asn).omit({
  id: true,
  createdAt: true,
});

export const insertAsnLineItemSchema = createInsertSchema(asnLineItems).omit({
  id: true,
});

export const insertReceivingReceiptSchema = createInsertSchema(receivingReceipts).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertReceivingReceiptItemSchema = createInsertSchema(receivingReceiptItems).omit({
  id: true,
  receivedAt: true,
});

export const insertCvCountingResultSchema = createInsertSchema(cvCountingResults).omit({
  id: true,
  createdAt: true,
});

export const insertPutawayRuleSchema = createInsertSchema(putawayRules).omit({
  id: true,
  createdAt: true,
  effectiveFrom: true,
});

export const insertPutawayTaskSchema = createInsertSchema(putawayTasks).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertSsccPalletSchema = createInsertSchema(ssccPallets).omit({
  id: true,
  createdAt: true,
  buildStartedAt: true,
  completedAt: true,
});

export const insertPalletItemSchema = createInsertSchema(palletItems).omit({
  id: true,
  addedAt: true,
});

export const insertReplenishmentRuleSchema = createInsertSchema(replenishmentRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastCalculated: true,
});

export const insertDemandForecastSchema = createInsertSchema(demandForecasts).omit({
  id: true,
  createdAt: true,
});

export const insertReplenishmentTaskSchema = createInsertSchema(replenishmentTasks).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertPickingVelocitySchema = createInsertSchema(pickingVelocity).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
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

// Advanced warehouse management types
export type Asn = typeof asn.$inferSelect;
export type InsertAsn = z.infer<typeof insertAsnSchema>;
export type AsnLineItem = typeof asnLineItems.$inferSelect;
export type InsertAsnLineItem = z.infer<typeof insertAsnLineItemSchema>;
export type ReceivingReceipt = typeof receivingReceipts.$inferSelect;
export type InsertReceivingReceipt = z.infer<typeof insertReceivingReceiptSchema>;
export type ReceivingReceiptItem = typeof receivingReceiptItems.$inferSelect;
export type InsertReceivingReceiptItem = z.infer<typeof insertReceivingReceiptItemSchema>;
export type CvCountingResult = typeof cvCountingResults.$inferSelect;
export type InsertCvCountingResult = z.infer<typeof insertCvCountingResultSchema>;
export type PutawayRule = typeof putawayRules.$inferSelect;
export type InsertPutawayRule = z.infer<typeof insertPutawayRuleSchema>;
export type PutawayTask = typeof putawayTasks.$inferSelect;
export type InsertPutawayTask = z.infer<typeof insertPutawayTaskSchema>;
export type SsccPallet = typeof ssccPallets.$inferSelect;
export type InsertSsccPallet = z.infer<typeof insertSsccPalletSchema>;
export type PalletItem = typeof palletItems.$inferSelect;
export type InsertPalletItem = z.infer<typeof insertPalletItemSchema>;
export type ReplenishmentRule = typeof replenishmentRules.$inferSelect;
export type InsertReplenishmentRule = z.infer<typeof insertReplenishmentRuleSchema>;
export type DemandForecast = typeof demandForecasts.$inferSelect;
export type InsertDemandForecast = z.infer<typeof insertDemandForecastSchema>;
export type ReplenishmentTask = typeof replenishmentTasks.$inferSelect;
export type InsertReplenishmentTask = z.infer<typeof insertReplenishmentTaskSchema>;
export type PickingVelocity = typeof pickingVelocity.$inferSelect;
export type InsertPickingVelocity = z.infer<typeof insertPickingVelocitySchema>;

// Digital Twin Operacional - Visualização 3D/2D
export const warehouseZones = pgTable("warehouse_zones", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'picking', 'storage', 'receiving', 'shipping', 'staging'
  coordinates: json("coordinates"), // {x, y, width, height, z, floor}
  capacity: json("capacity"), // {maxItems, maxWeight, maxVolume}
  currentUtilization: json("current_utilization"), // {items, weight, volume, percentage}
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const warehouseLayout = pgTable("warehouse_layout", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  name: varchar("name", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }).notNull().default("1.0"),
  layoutData: json("layout_data"), // Complete 3D/2D layout structure
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const digitalTwinSimulations = pgTable("digital_twin_simulations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'picking_optimization', 'putaway_simulation', 'capacity_planning'
  parameters: json("parameters"), // Simulation input parameters
  results: json("results"), // Simulation output results
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'running', 'completed', 'failed'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const realTimeVisualization = pgTable("real_time_visualization", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // 'worker', 'equipment', 'product', 'order'
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  position: json("position"), // {x, y, z, floor, zone}
  status: varchar("status", { length: 50 }).notNull(),
  metadata: json("metadata"), // Additional context data
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas for Digital Twin
export const insertWarehouseZoneSchema = createInsertSchema(warehouseZones);
export const insertWarehouseLayoutSchema = createInsertSchema(warehouseLayout);
export const insertDigitalTwinSimulationSchema = createInsertSchema(digitalTwinSimulations);
export const insertRealTimeVisualizationSchema = createInsertSchema(realTimeVisualization);

// Export types for Digital Twin
export type WarehouseZone = typeof warehouseZones.$inferSelect;
export type InsertWarehouseZone = z.infer<typeof insertWarehouseZoneSchema>;
export type WarehouseLayout = typeof warehouseLayout.$inferSelect;
export type InsertWarehouseLayout = z.infer<typeof insertWarehouseLayoutSchema>;
export type DigitalTwinSimulation = typeof digitalTwinSimulations.$inferSelect;
export type InsertDigitalTwinSimulation = z.infer<typeof insertDigitalTwinSimulationSchema>;
export type RealTimeVisualization = typeof realTimeVisualization.$inferSelect;
export type InsertRealTimeVisualization = z.infer<typeof insertRealTimeVisualizationSchema>;

// Triple-Ledger Traceability - Sistema Anti-fraude com WORM Storage
export const auditTrail = pgTable("audit_trail", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tableName: varchar("table_name", { length: 255 }).notNull(),
  recordId: varchar("record_id", { length: 255 }).notNull(),
  operation: varchar("operation", { length: 50 }).notNull(), // 'CREATE', 'UPDATE', 'DELETE'
  oldValues: json("old_values"),
  newValues: json("new_values"),
  userId: uuid("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  checksum: varchar("checksum", { length: 64 }).notNull(), // SHA-256 hash
  previousHash: varchar("previous_hash", { length: 64 }), // Chain to previous record
  signature: text("signature"), // Digital signature
  wormStored: boolean("worm_stored").default(false),
  blockchainHash: varchar("blockchain_hash", { length: 64 }) // Optional blockchain reference
});

export const wormStorage = pgTable("worm_storage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: uuid("audit_id").references(() => auditTrail.id).notNull(),
  dataHash: varchar("data_hash", { length: 64 }).notNull(),
  encryptedData: text("encrypted_data").notNull(),
  accessCount: integer("access_count").default(0),
  firstAccess: timestamp("first_access"),
  lastAccess: timestamp("last_access"),
  retention: timestamp("retention").notNull(),
  immutable: boolean("immutable").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const fraudDetection = pgTable("fraud_detection", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  alertType: varchar("alert_type", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  description: text("description").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  evidenceData: json("evidence_data"),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'investigating', 'resolved', 'false_positive'
  investigatedBy: uuid("investigated_by").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Auto-Slotting Inteligente - Machine Learning para otimização de layout
export const slottingAnalytics = pgTable("slotting_analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").references(() => products.id).notNull(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id).notNull(),
  currentLocation: varchar("current_location", { length: 100 }),
  recommendedLocation: varchar("recommended_location", { length: 100 }),
  rotationFrequency: decimal("rotation_frequency", { precision: 10, scale: 4 }),
  pickingDistance: decimal("picking_distance", { precision: 10, scale: 2 }),
  affinityScore: decimal("affinity_score", { precision: 5, scale: 2 }),
  seasonalityFactor: decimal("seasonality_factor", { precision: 5, scale: 2 }),
  lastOptimization: timestamp("last_optimization"),
  improvementPotential: decimal("improvement_potential", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'approved', 'implemented'
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const productAffinity = pgTable("product_affinity", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productA: uuid("product_a").references(() => products.id).notNull(),
  productB: uuid("product_b").references(() => products.id).notNull(),
  affinityScore: decimal("affinity_score", { precision: 5, scale: 2 }).notNull(),
  coOccurrenceCount: integer("co_occurrence_count").default(0),
  lastCalculated: timestamp("last_calculated").defaultNow().notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 })
});

export const slottingRules = pgTable("slotting_rules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  conditions: json("conditions").notNull(),
  actions: json("actions").notNull(),
  priority: integer("priority").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const mlModels = pgTable("ml_models", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  modelType: varchar("model_type", { length: 100 }).notNull(), // 'slotting_optimization', 'demand_forecast', 'affinity_analysis'
  version: varchar("version", { length: 50 }).notNull(),
  parameters: json("parameters"),
  trainingData: json("training_data"),
  accuracy: decimal("accuracy", { precision: 5, scale: 4 }),
  status: varchar("status", { length: 50 }).default("training"), // 'training', 'ready', 'deployed', 'deprecated'
  lastTraining: timestamp("last_training"),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const optimizationJobs = pgTable("optimization_jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  jobType: varchar("job_type", { length: 100 }).notNull(),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  parameters: json("parameters"),
  results: json("results"),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'running', 'completed', 'failed'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  executionTime: integer("execution_time"), // in seconds
  improvementMetrics: json("improvement_metrics"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Insert schemas for Triple-Ledger and Auto-Slotting
export const insertAuditTrailSchema = createInsertSchema(auditTrail).omit({
  id: true,
  timestamp: true,
  checksum: true,
  previousHash: true
});

export const insertWormStorageSchema = createInsertSchema(wormStorage).omit({
  id: true,
  createdAt: true,
  accessCount: true,
  firstAccess: true,
  lastAccess: true
});

export const insertFraudDetectionSchema = createInsertSchema(fraudDetection).omit({
  id: true,
  createdAt: true
});

export const insertSlottingAnalyticsSchema = createInsertSchema(slottingAnalytics).omit({
  id: true,
  createdAt: true,
  lastOptimization: true
});

export const insertProductAffinitySchema = createInsertSchema(productAffinity).omit({
  id: true,
  lastCalculated: true
});

export const insertSlottingRulesSchema = createInsertSchema(slottingRules).omit({
  id: true,
  createdAt: true
});

export const insertMlModelsSchema = createInsertSchema(mlModels).omit({
  id: true,
  createdAt: true,
  lastTraining: true,
  deployedAt: true
});

export const insertOptimizationJobsSchema = createInsertSchema(optimizationJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true
});

// Export types for Triple-Ledger and Auto-Slotting
export type AuditTrail = typeof auditTrail.$inferSelect;
export type InsertAuditTrail = z.infer<typeof insertAuditTrailSchema>;
export type WormStorage = typeof wormStorage.$inferSelect;
export type InsertWormStorage = z.infer<typeof insertWormStorageSchema>;
export type FraudDetection = typeof fraudDetection.$inferSelect;
export type InsertFraudDetection = z.infer<typeof insertFraudDetectionSchema>;
export type SlottingAnalytics = typeof slottingAnalytics.$inferSelect;
export type InsertSlottingAnalytics = z.infer<typeof insertSlottingAnalyticsSchema>;
export type ProductAffinity = typeof productAffinity.$inferSelect;
export type InsertProductAffinity = z.infer<typeof insertProductAffinitySchema>;
export type SlottingRules = typeof slottingRules.$inferSelect;
export type InsertSlottingRules = z.infer<typeof insertSlottingRulesSchema>;
export type MlModels = typeof mlModels.$inferSelect;
export type InsertMlModels = z.infer<typeof insertMlModelsSchema>;
export type OptimizationJobs = typeof optimizationJobs.$inferSelect;
export type InsertOptimizationJobs = z.infer<typeof insertOptimizationJobsSchema>;

// ===== FLEET MANAGEMENT & GPS TRACKING SYSTEM =====

// Vehicles table - Core fleet management
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  licensePlate: varchar("license_plate", { length: 20 }).notNull().unique(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  capacityKg: decimal("capacity_kg", { precision: 10, scale: 2 }),
  capacityM3: decimal("capacity_m3", { precision: 10, scale: 3 }),
  fuelType: varchar("fuel_type", { length: 20 }).notNull(), // 'gasolina', 'diesel', 'eletrico', 'hibrido'
  status: varchar("status", { length: 20 }).notNull().default("ativo"), // 'ativo', 'manutencao', 'inativo'
  insuranceExpiry: timestamp("insurance_expiry"),
  inspectionExpiry: timestamp("inspection_expiry"),
  driverId: uuid("driver_id").references(() => users.id), // Current assigned driver
  gpsDeviceId: varchar("gps_device_id", { length: 100 }), // Hardware GPS device identifier
  isGpsActive: boolean("is_gps_active").notNull().default(false),
  lastGpsUpdate: timestamp("last_gps_update"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicle maintenance history
export const vehicleMaintenance = pgTable("vehicle_maintenance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  type: varchar("type", { length: 50 }).notNull(), // 'preventiva', 'corretiva', 'urgente', 'inspecao'
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  serviceProvider: varchar("service_provider", { length: 255 }),
  maintenanceDate: timestamp("maintenance_date").notNull(),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  mileage: integer("mileage"), // Kilometragem na altura da manutenção
  status: varchar("status", { length: 20 }).notNull().default("concluida"), // 'agendada', 'em_progresso', 'concluida', 'cancelada'
  performedBy: uuid("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// GPS tracking data - Real-time location tracking
export const gpsTracking = pgTable("gps_tracking", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  speed: decimal("speed", { precision: 5, scale: 2 }), // km/h
  heading: decimal("heading", { precision: 5, scale: 2 }), // degrees 0-360
  altitude: decimal("altitude", { precision: 7, scale: 2 }), // meters
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // meters
  batteryLevel: integer("battery_level"), // 0-100
  signalStrength: integer("signal_strength"), // dBm
  isEngineOn: boolean("is_engine_on"),
  userId: uuid("user_id").references(() => users.id), // Driver/operator who sent this data
  deviceType: varchar("device_type", { length: 50 }).default("mobile"), // 'mobile', 'tablet', 'gps_device'
  metadata: json("metadata"), // Additional device/sensor data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Geofences for monitoring zones
export const geofences = pgTable("geofences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'warehouse', 'customer', 'restricted', 'service_area'
  warehouseId: uuid("warehouse_id").references(() => warehouses.id), // If linked to a warehouse
  polygonCoordinates: json("polygon_coordinates").notNull(), // Array of lat/lng points
  radius: decimal("radius", { precision: 10, scale: 2 }), // For circular geofences (meters)
  alertOnEnter: boolean("alert_on_enter").notNull().default(false),
  alertOnExit: boolean("alert_on_exit").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle assignments to orders/shipments
export const vehicleAssignments = pgTable("vehicle_assignments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  orderId: uuid("order_id").references(() => orders.id),
  shipmentId: uuid("shipment_id").references(() => shipments.id),
  driverId: uuid("driver_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("atribuido"), // 'atribuido', 'carregando', 'em_transito', 'entregue', 'cancelado'
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // 'baixa', 'normal', 'alta', 'urgente'
  estimatedDeparture: timestamp("estimated_departure"),
  actualDeparture: timestamp("actual_departure"),
  estimatedArrival: timestamp("estimated_arrival"),
  actualArrival: timestamp("actual_arrival"),
  estimatedDistance: decimal("estimated_distance", { precision: 10, scale: 2 }), // km
  actualDistance: decimal("actual_distance", { precision: 10, scale: 2 }), // km
  loadCapacityUsed: decimal("load_capacity_used", { precision: 5, scale: 2 }), // Percentage 0-100
  deliveryInstructions: text("delivery_instructions"),
  currentLocation: json("current_location"), // {lat, lng, address, lastUpdate}
  routeData: json("route_data"), // Planned and actual route information
  deliveryProof: json("delivery_proof"), // Photos, signatures, GPS coordinates
  notes: text("notes"),
  assignedBy: uuid("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Geofence alerts and violations
export const geofenceAlerts = pgTable("geofence_alerts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  geofenceId: uuid("geofence_id").notNull().references(() => geofences.id),
  alertType: varchar("alert_type", { length: 20 }).notNull(), // 'enter', 'exit', 'dwell', 'speed'
  triggerLocation: json("trigger_location").notNull(), // {lat, lng, timestamp}
  driverId: uuid("driver_id").references(() => users.id),
  assignmentId: uuid("assignment_id").references(() => vehicleAssignments.id),
  status: varchar("status", { length: 20 }).notNull().default("ativo"), // 'ativo', 'reconhecido', 'resolvido'
  acknowledgedBy: uuid("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  metadata: json("metadata"), // Additional context (speed, duration, etc.)
  createdAt: timestamp("created_at").defaultNow(),
});

// GPS session tracking for mandatory GPS enforcement
export const gpsSessions = pgTable("gps_sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  sessionType: varchar("session_type", { length: 20 }).notNull(), // 'login', 'driving', 'manual'
  status: varchar("status", { length: 20 }).notNull(), // 'ativo', 'pausado', 'finalizado', 'falha'
  deviceInfo: json("device_info"), // Device model, OS, app version
  gpsPermission: boolean("gps_permission").notNull(),
  gpsAccuracy: decimal("gps_accuracy", { precision: 5, scale: 2 }), // meters
  startLocation: json("start_location"), // {lat, lng, address}
  endLocation: json("end_location"), // {lat, lng, address}
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }), // km
  totalDuration: integer("total_duration"), // minutes
  trackingPoints: integer("tracking_points").default(0), // Number of GPS points recorded
  violations: json("violations"), // GPS accuracy issues, permission denials
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Vehicle relations
export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  driver: one(users, {
    fields: [vehicles.driverId],
    references: [users.id],
  }),
  maintenance: many(vehicleMaintenance),
  gpsTracking: many(gpsTracking),
  assignments: many(vehicleAssignments),
  shipments: many(shipments),
  geofenceAlerts: many(geofenceAlerts),
  gpsSessions: many(gpsSessions),
}));

// Vehicle maintenance relations
export const vehicleMaintenanceRelations = relations(vehicleMaintenance, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleMaintenance.vehicleId],
    references: [vehicles.id],
  }),
  performedByUser: one(users, {
    fields: [vehicleMaintenance.performedBy],
    references: [users.id],
  }),
}));

// GPS tracking relations
export const gpsTrackingRelations = relations(gpsTracking, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [gpsTracking.vehicleId],
    references: [vehicles.id],
  }),
  user: one(users, {
    fields: [gpsTracking.userId],
    references: [users.id],
  }),
}));

// Geofences relations
export const geofencesRelations = relations(geofences, ({ one, many }) => ({
  warehouse: one(warehouses, {
    fields: [geofences.warehouseId],
    references: [warehouses.id],
  }),
  createdBy: one(users, {
    fields: [geofences.createdBy],
    references: [users.id],
  }),
  alerts: many(geofenceAlerts),
}));

// Vehicle assignments relations
export const vehicleAssignmentsRelations = relations(vehicleAssignments, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleAssignments.vehicleId],
    references: [vehicles.id],
  }),
  order: one(orders, {
    fields: [vehicleAssignments.orderId],
    references: [orders.id],
  }),
  shipment: one(shipments, {
    fields: [vehicleAssignments.shipmentId],
    references: [shipments.id],
  }),
  driver: one(users, {
    fields: [vehicleAssignments.driverId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [vehicleAssignments.assignedBy],
    references: [users.id],
  }),
  geofenceAlerts: many(geofenceAlerts),
}));

// Geofence alerts relations
export const geofenceAlertsRelations = relations(geofenceAlerts, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [geofenceAlerts.vehicleId],
    references: [vehicles.id],
  }),
  geofence: one(geofences, {
    fields: [geofenceAlerts.geofenceId],
    references: [geofences.id],
  }),
  driver: one(users, {
    fields: [geofenceAlerts.driverId],
    references: [users.id],
  }),
  assignment: one(vehicleAssignments, {
    fields: [geofenceAlerts.assignmentId],
    references: [vehicleAssignments.id],
  }),
  acknowledgedBy: one(users, {
    fields: [geofenceAlerts.acknowledgedBy],
    references: [users.id],
  }),
}));

// GPS sessions relations
export const gpsSessionsRelations = relations(gpsSessions, ({ one }) => ({
  user: one(users, {
    fields: [gpsSessions.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [gpsSessions.vehicleId],
    references: [vehicles.id],
  }),
}));

// Insert schemas for fleet management
export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastGpsUpdate: true,
});

export const insertVehicleMaintenanceSchema = createInsertSchema(vehicleMaintenance).omit({
  id: true,
  createdAt: true,
});

export const insertGpsTrackingSchema = createInsertSchema(gpsTracking).omit({
  id: true,
  timestamp: true,
});

export const insertGeofenceSchema = createInsertSchema(geofences).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleAssignmentSchema = createInsertSchema(vehicleAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGeofenceAlertSchema = createInsertSchema(geofenceAlerts).omit({
  id: true,
  createdAt: true,
  acknowledgedAt: true,
});

export const insertGpsSessionSchema = createInsertSchema(gpsSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
});

// ===== ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM =====

// Roles table - System roles/profiles (e.g., manager, operator, viewer)
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table - System permissions (e.g., products.read, orders.create)
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  module: varchar("module", { length: 50 }).notNull(), // products, orders, inventory, etc.
  action: varchar("action", { length: 50 }).notNull(), // read, create, update, delete
  resource: varchar("resource", { length: 50 }), // specific resource if needed
  createdAt: timestamp("created_at").defaultNow(),
});

// Role permissions junction table - What permissions each role has
export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User roles junction table - What roles each user has
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  assignedBy: uuid("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// RBAC Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

// Update users relations to include user roles
export const usersRelationsUpdated = relations(users, ({ many }) => ({
  orders: many(orders),
  stockMovements: many(stockMovements),
  shipments: many(shipments),
  inventoryCounts: many(inventoryCounts),
  barcodeScans: many(barcodeScans),
  userRoles: many(userRoles),
  assignedRoles: many(userRoles, { relationName: "assignedRoles" }),
}));

// Insert schemas for RBAC
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

// Types for RBAC
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// Types for fleet management
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type VehicleMaintenance = typeof vehicleMaintenance.$inferSelect;
export type InsertVehicleMaintenance = z.infer<typeof insertVehicleMaintenanceSchema>;
export type GpsTracking = typeof gpsTracking.$inferSelect;
export type InsertGpsTracking = z.infer<typeof insertGpsTrackingSchema>;
export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = z.infer<typeof insertGeofenceSchema>;
export type VehicleAssignment = typeof vehicleAssignments.$inferSelect;
export type InsertVehicleAssignment = z.infer<typeof insertVehicleAssignmentSchema>;
export type GeofenceAlert = typeof geofenceAlerts.$inferSelect;
export type InsertGeofenceAlert = z.infer<typeof insertGeofenceAlertSchema>;
export type GpsSession = typeof gpsSessions.$inferSelect;
export type InsertGpsSession = z.infer<typeof insertGpsSessionSchema>;
