import { Storage } from "./storage/index";
import type {
  User, InsertUser, Category, InsertCategory, Supplier, InsertSupplier,
  Warehouse, InsertWarehouse, Product, InsertProduct, Inventory, InsertInventory,
  StockMovement, InsertStockMovement, Order, InsertOrder, OrderItem, InsertOrderItem,
  Shipment, InsertShipment, ProductLocation, InsertProductLocation,
  InventoryCount, InsertInventoryCount, InventoryCountItem, InsertInventoryCountItem,
  BarcodeScan, InsertBarcodeScan,
  PickingList, InsertPickingList, PickingListItem, InsertPickingListItem,
  Vehicle, InsertVehicle, VehicleMaintenance, InsertVehicleMaintenance,
  GpsTracking, InsertGpsTracking, Geofence, InsertGeofence,
  VehicleAssignment, InsertVehicleAssignment, GeofenceAlert, InsertGeofenceAlert,
  GpsSession, InsertGpsSession, Role, InsertRole, Permission, InsertPermission,
  RolePermission, InsertRolePermission, UserRole, InsertUserRole,
  Return, InsertReturn, ReturnItem, InsertReturnItem,
  DashboardStats
} from "./storage/types";

// Create the main storage instance
const storage = new Storage();

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
}

// Implementation class that delegates to the modular storage
export class StorageImpl implements IStorage {
  // Users
  async getUsers(): Promise<User[]> {
    return storage.users.getUsers();
  }

  async getUser(id: string): Promise<User | undefined> {
    return storage.users.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return storage.users.getUserByUsername(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return storage.users.getUserByEmail(email);
  }

  async createUser(user: InsertUser): Promise<User> {
    return storage.users.createUser(user);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    return storage.users.updateUser(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    return storage.users.deleteUser(id);
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

  // Placeholder methods for features not yet implemented in modules
  // These throw errors to indicate they need implementation
  
  // Categories
  async getCategories(): Promise<Category[]> {
    throw new Error("Categories module not implemented yet");
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    throw new Error("Categories module not implemented yet");
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    throw new Error("Categories module not implemented yet");
  }

  async deleteCategory(id: string): Promise<void> {
    throw new Error("Categories module not implemented yet");
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    throw new Error("Suppliers module not implemented yet");
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    throw new Error("Suppliers module not implemented yet");
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    throw new Error("Suppliers module not implemented yet");
  }

  async deleteSupplier(id: string): Promise<void> {
    throw new Error("Suppliers module not implemented yet");
  }

  // Warehouses
  async getWarehouses(): Promise<Warehouse[]> {
    throw new Error("Warehouses module not implemented yet");
  }

  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> {
    throw new Error("Warehouses module not implemented yet");
  }

  async updateWarehouse(id: string, warehouse: Partial<InsertWarehouse>): Promise<Warehouse> {
    throw new Error("Warehouses module not implemented yet");
  }

  async deleteWarehouse(id: string): Promise<void> {
    throw new Error("Warehouses module not implemented yet");
  }

  // All other methods that were in the original file but not yet modularized
  // would throw similar errors indicating they need to be implemented
}

// Export the default storage instance for backward compatibility
export default new StorageImpl();
