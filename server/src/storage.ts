import { Storage } from "./storage/index";
import { createStandardDelegate } from "./storage/base/BaseStorageDelegate";
import { db } from "../database/db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  users, products, warehouses, barcodeScans, productLocations, categories,
  type User, type Product, type Warehouse, type BarcodeScan, type ProductLocation,
  type Category, type InsertCategory, type UpdateCategory
} from "../../shared/schema";
import type {
  InsertUser, Supplier, InsertSupplier,
  InsertWarehouse, InsertProduct, Inventory, InsertInventory,
  StockMovement, InsertStockMovement, Order, InsertOrder, OrderItem, InsertOrderItem,
  Shipment, InsertShipment, InsertProductLocation,
  InventoryCount, InsertInventoryCount, InventoryCountItem, InsertInventoryCountItem,
  InsertBarcodeScan,
  PickingList, InsertPickingList, PickingListItem, InsertPickingListItem,
  Vehicle, InsertVehicle, VehicleMaintenance, InsertVehicleMaintenance,
  GpsTracking, InsertGpsTracking, Geofence, InsertGeofence,
  VehicleAssignment, InsertVehicleAssignment, GeofenceAlert, InsertGeofenceAlert,
  GpsSession, InsertGpsSession, Role, InsertRole, Permission, InsertPermission,
  RolePermission, InsertRolePermission, UserRole, InsertUserRole,
  Return, InsertReturn, ReturnItem, InsertReturnItem,
  DashboardStats
} from "./storage/types";

// Create a storage instance
const storage = new Storage();

// Create standard delegates for common CRUD operations
const userDelegate = createStandardDelegate<User, InsertUser>('User', () => storage.users);
const productDelegate = createStandardDelegate<Product, InsertProduct>('Product', () => storage.products);
const supplierDelegate = createStandardDelegate<Supplier, InsertSupplier>('Supplier', () => storage.suppliers);
const warehouseDelegate = createStandardDelegate<Warehouse, InsertWarehouse>('Warehouse', () => storage.warehouses);

// Export the storage interface for backward compatibility
export interface IStorage {
  // Users
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  getTopProducts(): Promise<Array<Product & { stock: number; sales: number }>>;
  getRecentActivities(): Promise<Array<StockMovement & { product: Product; user?: User | null }>>;
  
  // Products
  getProducts(): Promise<Array<Product & { category?: Category | null; supplier?: Supplier | null }>>;
  getProduct(id: string): Promise<Product | undefined>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getLowStockProducts(): Promise<Array<Product & { stock: number; category?: Category | null }>>;
  
  // Inventory
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
  
  // Barcode Scanning
  getBarcodeScans(limit?: number): Promise<BarcodeScan[]>;
  createBarcodeScan(scan: InsertBarcodeScan): Promise<BarcodeScan>;
  getBarcodeScansByProduct(productId: string): Promise<BarcodeScan[]>;
  findProductByBarcode(barcode: string): Promise<Product | undefined>;
  updateProductLastScanned(productId: string, userId: string): Promise<void>;
 updateBarcodeScanLocation(scanId: string, locationData: any): Promise<BarcodeScan>;
  getLastProductLocation(productId: string): Promise<any>;
  
  // Batch Management
  getBatches(filters: { warehouseId?: string; productId?: string; status?: string; expiryAlert?: boolean }): Promise<any[]>;
  getBatchById(id: string): Promise<any>;
  getBatchByNumber(batchNumber: string): Promise<any>;
  createBatch(data: any): Promise<any>;
  updateBatch(id: string, data: any): Promise<any>;
  deleteBatch(id: string): Promise<void>;
  addProductsToBatch(batchId: string, data: any): Promise<any>;
  removeProductFromBatch(batchId: string, quantity: number): Promise<void>;
  getBatchExpiryAlerts(batchId: string): Promise<any[]>;
  getExpiringProducts(daysAhead: number, warehouseId?: string): Promise<any[]>;
  getExpiredProducts(warehouseId?: string): Promise<any[]>;
  extendBatchExpiry(batchIds: string[], data: any): Promise<any>;
  getBatchHistory(batchNumber: string): Promise<any[]>;
  getBatchLocation(batchNumber: string): Promise<any>;
}

// Implementation class that delegates to the modular storage
export class StorageImpl implements IStorage {
  // Users - usando delegação padrão onde possível
  async getUsers(): Promise<User[]> {
    return userDelegate.getAll();
  }

  async getUser(id: string): Promise<User | undefined> {
    return userDelegate.getById(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return storage.users.getUserByUsername(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return storage.users.getUserByEmail(email);
  }

  async createUser(user: InsertUser): Promise<User> {
    return userDelegate.create(user);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    return userDelegate.update(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    return userDelegate.delete(id);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return storage.getDashboardStats();
  }

  async getTopProducts(): Promise<Array<Product & { stock: number; sales: number }>> {
    return storage.getTopProducts();
  }

  async getRecentActivities(): Promise<Array<StockMovement & { product: Product; user?: User | null }>> {
    return storage.getRecentActivities();
  }

  // Products
  async getProducts(): Promise<Array<Product & { category?: Category | null; supplier?: Supplier | null }>> {
    return storage.products.getProducts();
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return storage.products.getProduct(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return storage.products.searchProducts(query);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    return storage.products.createProduct(product);
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    return storage.products.updateProduct(id, product);
  }

  async deleteProduct(id: string): Promise<void> {
    return storage.products.deleteProduct(id);
  }

  async getLowStockProducts(): Promise<Array<Product & { stock: number; category?: Category | null }>> {
    return storage.products.getLowStockProducts();
  }

  // Inventory
  async getInventoryByWarehouse(warehouseId: string): Promise<Array<Inventory & { product: Product }>> {
    return storage.inventory.getInventoryByWarehouse(warehouseId);
  }

  async getProductInventory(productId: string): Promise<Array<Inventory & { warehouse: Warehouse }>> {
    return storage.inventory.getProductInventory(productId);
  }

  async updateInventory(productId: string, warehouseId: string, quantity: number): Promise<Inventory> {
    return storage.inventory.updateInventory(productId, warehouseId, quantity);
  }

  // Stock Movements
  async getStockMovements(limit?: number): Promise<Array<StockMovement & { product: Product; warehouse: Warehouse; user?: User | null }>> {
    return storage.inventory.getStockMovements(limit);
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    return storage.inventory.createStockMovement(movement);
  }

  // Orders
  async getOrders(): Promise<Array<Order & { supplier?: Supplier | null; user?: User | null }>> {
    return storage.orders.getOrders();
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return storage.orders.getOrder(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    return storage.orders.createOrder(order);
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    return storage.orders.updateOrder(id, order);
  }

  async deleteOrder(id: string): Promise<void> {
    return storage.orders.deleteOrder(id);
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<Array<OrderItem & { product: Product }>> {
    return storage.orders.getOrderItems(orderId);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    return storage.orders.createOrderItem(item);
  }

  // Barcode Scanning
  async getBarcodeScans(limit: number = 100): Promise<BarcodeScan[]> {
    return storage.barcodeScans.getBarcodeScans('', { limit });
  }

  async createBarcodeScan(scan: InsertBarcodeScan): Promise<BarcodeScan> {
    return storage.barcodeScans.createBarcodeScan({
      productId: scan.productId,
      warehouseId: scan.warehouseId,
      userId: scan.userId,
      scannedCode: scan.scannedCode,
      scanType: scan.scanType || 'manual',
      locationId: scan.locationId,
      scanPurpose: scan.scanPurpose || 'inventory',
      metadata: scan.metadata
    });
  }

  async getBarcodeScansByProduct(productId: string): Promise<BarcodeScan[]> {
    return storage.barcodeScans.getBarcodeScansForProduct(productId);
  }

  async findProductByBarcode(barcode: string): Promise<Product | undefined> {
    return storage.barcodeScans.getProductByBarcode(barcode);
  }

  async updateProductLastScanned(productId: string, userId: string): Promise<void> {
    // Note: The products table doesn't have lastScanned fields yet
    // For now, we'll just track this via barcode scans
    // In a future migration, we could add lastScanned and scannedByUserId to products table
    console.log(`Product ${productId} scanned by user ${userId}`);
  }

  async updateBarcodeScanLocation(scanId: string, locationData: any): Promise<BarcodeScan> {
    return storage.barcodeScans.updateBarcodeScanLocation(scanId, locationData);
  }

  async getLastProductLocation(productId: string): Promise<any> {
    const scans = await storage.barcodeScans.getBarcodeScansForProduct(productId);
    return scans.length > 0 ? scans[0] : undefined;
  }

  // Batch Management
  async getBatches(filters: { warehouseId?: string; productId?: string; status?: string; expiryAlert?: boolean }): Promise<any[]> {
    return storage.batches.getBatches(filters);
  }

  async getBatchById(id: string): Promise<any> {
    return storage.batches.getBatch(id);
  }

  async getBatchByNumber(batchNumber: string): Promise<any> {
    return storage.batches.getBatchByNumber(batchNumber);
  }

  async createBatch(data: any): Promise<any> {
    return storage.batches.createBatch(data);
  }

  async updateBatch(id: string, data: any): Promise<any> {
    return storage.batches.updateBatch(id, data);
  }

  async deleteBatch(id: string): Promise<void> {
    return storage.batches.deleteBatch(id);
  }

  async addProductsToBatch(batchId: string, data: any): Promise<any> {
    return storage.batches.addProductsToBatch(batchId, data);
  }

  async removeProductFromBatch(batchId: string, quantity: number): Promise<void> {
    await storage.batches.removeProductFromBatch(batchId, quantity);
  }

  async getBatchExpiryAlerts(batchId: string): Promise<any[]> {
    const result = await storage.batches.getBatchExpiryAlerts(batchId);
    return Array.isArray(result) ? result : [];
  }

  async getExpiringProducts(daysAhead: number, warehouseId?: string): Promise<any[]> {
    const result = await storage.batches.getExpiringProducts(daysAhead, warehouseId);
    return Array.isArray(result) ? result : [];
  }

  async getExpiredProducts(warehouseId?: string): Promise<any[]> {
    const result = await storage.batches.getExpiredProducts(warehouseId);
    return Array.isArray(result) ? result : [];
  }

  async extendBatchExpiry(batchIds: string[], data: any): Promise<any> {
    return storage.batches.extendBatchExpiry(batchIds, data);
  }

  async getBatchHistory(batchNumber: string): Promise<any[]> {
    return storage.batches.getBatchHistory(batchNumber);
  }

  async getBatchLocation(batchNumber: string): Promise<any> {
    return storage.batches.getBatchLocation(batchNumber);
  }

  // Placeholder methods for features not yet implemented in modules
  // These throw errors to indicate they need implementation
  
  // Categories
  async getCategories(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ categories: Category[]; total: number }> {
    const categories = await storage.categories.getCategories();
    return { categories, total: categories.length };
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const category = await storage.categories.getCategoryByName(name);
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    return storage.categories.createCategory({
      name: category.name,
      description: category.description
    });
  }

  async updateCategory(id: string, category: UpdateCategory): Promise<Category> {
    const result = await storage.categories.updateCategory(id, {
      name: category.name,
      description: category.description
    });
    if (!result) {
      throw new Error('Failed to update category');
    }
    return result;
  }

  async deleteCategory(id: string): Promise<void> {
    return storage.categories.deleteCategory(id);
  }

  // Suppliers - usando delegação padrão
  async getSuppliers(): Promise<Supplier[]> {
    return supplierDelegate.getAll();
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    return supplierDelegate.create(supplier);
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    return supplierDelegate.update(id, supplier);
  }

  async deleteSupplier(id: string): Promise<void> {
    return supplierDelegate.delete(id);
  }

  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    return storage.warehouses.getWarehouses();
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    return storage.warehouses.createWarehouse({
      name: warehouse.name,
      address: warehouse.address,
      type: warehouse.type,
      isActive: warehouse.isActive
    });
  }

  async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse> {
    return storage.warehouses.updateWarehouse(id, {
      name: warehouse.name,
      address: warehouse.address,
      type: warehouse.type,
      isActive: warehouse.isActive
    });
  }

  async deleteWarehouse(id: string): Promise<void> {
    return storage.warehouses.deleteWarehouse(id);
  }

  async getWarehouseById(id: string): Promise<Warehouse | undefined> {
    const warehouse = await storage.warehouses.getWarehouse(id);
    return warehouse || undefined;
  }

  // All other methods that were in the original file but not yet modularized
  // would throw similar errors indicating they need to be implemented
}

// Export the default storage instance for backward compatibility
export default new StorageImpl();
