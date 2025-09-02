import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, decimal, boolean, timestamp, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("operator"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customers table - Gestão de Clientes
export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
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
export const suppliers = mysqlTable("suppliers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Warehouses table
export const warehouses = mysqlTable("warehouses", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  barcode: varchar("barcode", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: json("dimensions"), // {length, width, height}
  categoryId: varchar("category_id", { length: 36 }).references(() => categories.id),
  supplierId: varchar("supplier_id", { length: 36 }).references(() => suppliers.id),
  minStockLevel: int("min_stock_level").default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory table
export const inventory = mysqlTable("inventory", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  quantity: int("quantity").notNull().default(0),
  reservedQuantity: int("reserved_quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Stock movements table
export const stockMovements = mysqlTable("stock_movements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  type: varchar("type", { length: 50 }).notNull(), // 'in', 'out', 'transfer', 'adjustment'
  quantity: int("quantity").notNull(),
  reference: varchar("reference", { length: 255 }), // Order ID, transfer ID, etc.
  reason: text("reason"),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderNumber: varchar("order_number", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'sale', 'purchase'
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  customerId: varchar("customer_id", { length: 36 }).references(() => customers.id), // Nova referência para cliente
  // Campos de cliente para compatibilidade
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  customerAddress: text("customer_address"),
  supplierId: varchar("supplier_id", { length: 36 }).references(() => suppliers.id),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  notes: text("notes"),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order items table
export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
});

// Vehicles table - Fleet Management
export const vehicles = mysqlTable("vehicles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  licensePlate: varchar("license_plate", { length: 20 }).notNull().unique(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: int("year").notNull(),
  vin: varchar("vin", { length: 50 }),
  type: varchar("type", { length: 50 }).notNull(), // truck, van, car
  capacity: decimal("capacity", { precision: 8, scale: 2 }), // in kg or cubic meters
  fuelType: varchar("fuel_type", { length: 50 }).default("gasoline"),
  status: varchar("status", { length: 50 }).notNull().default("available"), // available, in_use, maintenance, out_of_service
  driverId: varchar("driver_id", { length: 36 }).references(() => users.id),
  currentLocation: json("current_location"), // {lat, lng, address}
  lastGpsUpdate: timestamp("last_gps_update"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shipments table
export const shipments = mysqlTable("shipments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  shipmentNumber: varchar("shipment_number", { length: 100 }).notNull().unique(),
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id),
  vehicleId: varchar("vehicle_id", { length: 36 }).references(() => vehicles.id), // Assigned vehicle for this shipment
  status: varchar("status", { length: 50 }).notNull().default("preparing"),
  carrier: varchar("carrier", { length: 255 }),
  trackingNumber: varchar("tracking_number", { length: 255 }),
  shippingAddress: text("shipping_address"),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualDelivery: timestamp("actual_delivery"),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product locations table
export const productLocations = mysqlTable("product_locations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  zone: varchar("zone", { length: 50 }), // A, B, C
  shelf: varchar("shelf", { length: 50 }), // A1, B2, C3
  bin: varchar("bin", { length: 50 }), // A1-01, B2-15
  lastScanned: timestamp("last_scanned"),
  scannedByUserId: varchar("scanned_by_user_id", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory counts table
export const inventoryCounts = mysqlTable("inventory_counts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  countNumber: varchar("count_number", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'cycle', 'full', 'spot'
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory count items table
export const inventoryCountItems = mysqlTable("inventory_count_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  countId: varchar("count_id", { length: 36 }).notNull().references(() => inventoryCounts.id),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  expectedQuantity: int("expected_quantity").notNull(),
  countedQuantity: int("counted_quantity"),
  variance: int("variance"), // countedQuantity - expectedQuantity
  reconciled: boolean("reconciled").notNull().default(false),
  countedByUserId: varchar("counted_by_user_id", { length: 36 }).references(() => users.id),
  countedAt: timestamp("counted_at"),
});

// Barcode scans table
export const barcodeScans = mysqlTable("barcode_scans", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  scannedCode: varchar("scanned_code", { length: 255 }).notNull(),
  scanType: varchar("scan_type", { length: 50 }).notNull(), // 'barcode', 'qr', 'rfid'
  productId: varchar("product_id", { length: 36 }).references(() => products.id),
  warehouseId: varchar("warehouse_id", { length: 36 }).references(() => warehouses.id),
  locationId: varchar("location_id", { length: 36 }).references(() => productLocations.id),
  scanPurpose: varchar("scan_purpose", { length: 100 }).notNull(), // 'inventory', 'picking', 'receiving', 'shipping'
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  metadata: json("metadata"), // Additional data like GPS coordinates, device info
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle maintenance table
export const vehicleMaintenance = mysqlTable("vehicle_maintenance", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  vehicleId: varchar("vehicle_id", { length: 36 }).notNull().references(() => vehicles.id),
  type: varchar("type", { length: 50 }).notNull(), // 'routine', 'repair', 'inspection'
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  performedBy: varchar("performed_by", { length: 36 }).references(() => users.id),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"), // scheduled, in_progress, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// GPS tracking table
export const gpsTracking = mysqlTable("gps_tracking", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  vehicleId: varchar("vehicle_id", { length: 36 }).notNull().references(() => vehicles.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  speed: decimal("speed", { precision: 5, scale: 2 }), // km/h
  heading: decimal("heading", { precision: 5, scale: 2 }), // degrees
  altitude: decimal("altitude", { precision: 8, scale: 2 }), // meters
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // meters
  timestamp: timestamp("timestamp").defaultNow(),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  metadata: json("metadata"), // Additional GPS data
});

// Geofences table
export const geofences = mysqlTable("geofences", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'circle', 'polygon'
  coordinates: json("coordinates").notNull(), // For circle: {lat, lng, radius}, for polygon: [{lat, lng}, ...]
  warehouseId: varchar("warehouse_id", { length: 36 }).references(() => warehouses.id),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vehicle assignments table
export const vehicleAssignments = mysqlTable("vehicle_assignments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  vehicleId: varchar("vehicle_id", { length: 36 }).notNull().references(() => vehicles.id),
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id),
  shipmentId: varchar("shipment_id", { length: 36 }).references(() => shipments.id),
  driverId: varchar("driver_id", { length: 36 }).notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("assigned"), // assigned, in_progress, completed, cancelled
  assignedBy: varchar("assigned_by", { length: 36 }).references(() => users.id),
  startLocation: json("start_location"), // {lat, lng, address}
  endLocation: json("end_location"), // {lat, lng, address}
  estimatedDuration: int("estimated_duration"), // minutes
  actualDuration: int("actual_duration"), // minutes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Geofence alerts table
export const geofenceAlerts = mysqlTable("geofence_alerts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  vehicleId: varchar("vehicle_id", { length: 36 }).notNull().references(() => vehicles.id),
  geofenceId: varchar("geofence_id", { length: 36 }).notNull().references(() => geofences.id),
  driverId: varchar("driver_id", { length: 36 }).references(() => users.id),
  assignmentId: varchar("assignment_id", { length: 36 }).references(() => vehicleAssignments.id),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'entry', 'exit', 'violation'
  location: json("location").notNull(), // {lat, lng}
  isAcknowledged: boolean("is_acknowledged").notNull().default(false),
  acknowledgedBy: varchar("acknowledged_by", { length: 36 }).references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // low, medium, high, critical
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// GPS sessions table
export const gpsSessions = mysqlTable("gps_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id", { length: 36 }).references(() => vehicles.id),
  sessionType: varchar("session_type", { length: 50 }).notNull(), // 'delivery', 'pickup', 'maintenance', 'other'
  startLocation: json("start_location"), // {lat, lng, address}
  endLocation: json("end_location"), // {lat, lng, address}
  totalDistance: decimal("total_distance", { precision: 8, scale: 2 }), // km
  totalDuration: int("total_duration"), // minutes
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, completed, cancelled
  notes: text("notes"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Roles table
export const roles = mysqlTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table
export const permissions = mysqlTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  module: varchar("module", { length: 50 }).notNull(), // products, orders, inventory, etc.
  action: varchar("action", { length: 50 }).notNull(), // read, create, update, delete
  resource: varchar("resource", { length: 50 }), // specific resource if needed
  createdAt: timestamp("created_at").defaultNow(),
});

// Role permissions table
export const rolePermissions = mysqlTable("role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  roleId: varchar("role_id", { length: 36 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: varchar("permission_id", { length: 36 }).notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Picking Lists table
export const pickingLists = mysqlTable("picking_lists", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  pickNumber: varchar("pick_number", { length: 100 }).notNull().unique(),
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id),
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, in_progress, completed, cancelled
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // low, normal, high, urgent
  assignedTo: varchar("assigned_to", { length: 36 }).references(() => users.id),
  type: varchar("type", { length: 50 }).notNull().default("individual"), // individual, batch, wave
  scheduledDate: timestamp("scheduled_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  estimatedTime: int("estimated_time"), // minutes
  actualTime: int("actual_time"), // minutes
  notes: text("notes"),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Picking List Items table
export const pickingListItems = mysqlTable("picking_list_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  pickingListId: varchar("picking_list_id", { length: 36 }).notNull().references(() => pickingLists.id),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  locationId: varchar("location_id", { length: 36 }).references(() => productLocations.id),
  quantityToPick: int("quantity_to_pick").notNull(),
  quantityPicked: int("quantity_picked").default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, picked, substituted, cancelled
  pickedBy: varchar("picked_by", { length: 36 }).references(() => users.id),
  pickedAt: timestamp("picked_at"),
  notes: text("notes"),
  substitutedWith: varchar("substituted_with", { length: 36 }).references(() => products.id),
});

// User roles table
export const userRoles = mysqlTable("user_roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: varchar("role_id", { length: 36 }).notNull().references(() => roles.id, { onDelete: "cascade" }),
  assignedBy: varchar("assigned_by", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  stockMovements: many(stockMovements),
  shipments: many(shipments),
  inventoryCounts: many(inventoryCounts),
  barcodeScans: many(barcodeScans),
  userRoles: many(userRoles),
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

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
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

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastGpsUpdate: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertPickingListSchema = createInsertSchema(pickingLists).omit({
  id: true,
  createdAt: true,
});

export const insertPickingListItemSchema = createInsertSchema(pickingListItems).omit({
  id: true,
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
});

export const insertGpsSessionSchema = createInsertSchema(gpsSessions).omit({
  id: true,
  startedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  id: true,
  createdAt: true,
});

// Type exports
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
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type PickingList = typeof pickingLists.$inferSelect;
export type InsertPickingList = z.infer<typeof insertPickingListSchema>;
export type PickingListItem = typeof pickingListItems.$inferSelect;
export type InsertPickingListItem = z.infer<typeof insertPickingListItemSchema>;
export type ProductLocation = typeof productLocations.$inferSelect;
export type InsertProductLocation = z.infer<typeof insertProductLocationSchema>;
export type InventoryCount = typeof inventoryCounts.$inferSelect;
export type InsertInventoryCount = z.infer<typeof insertInventoryCountSchema>;
export type InventoryCountItem = typeof inventoryCountItems.$inferSelect;
export type InsertInventoryCountItem = z.infer<typeof insertInventoryCountItemSchema>;
export type BarcodeScan = typeof barcodeScans.$inferSelect;
export type InsertBarcodeScan = z.infer<typeof insertBarcodeScanSchema>;
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
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
