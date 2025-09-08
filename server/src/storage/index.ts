import { UserStorage } from "./modules/users";
import { ProductStorage } from "./modules/products";
import { OrderStorage } from "./modules/orders";
import { InventoryStorage } from "./modules/inventory";
import { FleetStorage } from "./modules/fleet";
import { CategoryStorage } from "./modules/categories";
import { WarehouseStorage } from "./modules/warehouses";
import { BarcodeScanStorage } from "./modules/barcodeScans";
import { db } from "../../database/db";
import { sql, count } from "drizzle-orm";
import { products, orders, stockMovements, users, type Product, type StockMovement, type User } from "../../../shared/schema";
import type { DashboardStats } from "./types";

export class Storage {
  public users: UserStorage;
  public products: ProductStorage;
  public orders: OrderStorage;
  public inventory: InventoryStorage;
  public fleet: FleetStorage;
  public categories: CategoryStorage;
  public warehouses: WarehouseStorage;
  public barcodeScans: BarcodeScanStorage;

  constructor() {
    this.users = new UserStorage();
    this.products = new ProductStorage();
    this.orders = new OrderStorage();
    this.inventory = new InventoryStorage();
    this.fleet = new FleetStorage();
    this.categories = new CategoryStorage();
    this.warehouses = new WarehouseStorage();
    this.barcodeScans = new BarcodeScanStorage();
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const [totalProductsResult, lowStockResult, pendingOrdersResult] = await Promise.all([
      db.select({ count: count() }).from(products),
      this.products.getLowStockProducts(),
      this.orders.getOrdersByStatus('pending')
    ]);

    // Calculate monthly sales (simplified)
    const monthlySalesResult = await db
      .select({ total: sql`COALESCE(SUM(CAST(total_amount AS DECIMAL(10,2))), 0)` })
      .from(orders)
      .where(sql`DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`);

    return {
      totalProducts: totalProductsResult[0].count,
      lowStock: lowStockResult.length,
      pendingOrders: pendingOrdersResult.length,
      monthlySales: String(monthlySalesResult[0]?.total || '0')
    };
  }

  async getTopProducts(): Promise<Array<Product & { stock: number; sales: number }>> {
    // This is a simplified implementation
    // In a real scenario, you'd want to calculate actual sales data
    const topProducts = await this.products.getProducts();
    
    return topProducts.slice(0, 10).map(product => ({
      ...product,
      stock: 0, // Would need to calculate from inventory
      sales: 0  // Would need to calculate from order items
    }));
  }

  async getRecentActivities(): Promise<Array<StockMovement & { product: Product; user?: User | null }>> {
    return this.inventory.getStockMovements(20);
  }

  // Legacy method compatibility - delegate to appropriate modules
  async getUsers() { return this.users.getUsers(); }
  async getUser(id: string) { return this.users.getUser(id); }
  async getUserByUsername(username: string) { return this.users.getUserByUsername(username); }
  async getUserByEmail(email: string) { return this.users.getUserByEmail(email); }
  async createUser(user: any) { return this.users.createUser(user); }
  async updateUser(id: string, user: any) { return this.users.updateUser(id, user); }
  async deleteUser(id: string) { return this.users.deleteUser(id); }

  async getProducts() { return this.products.getProducts(); }
  async getProduct(id: string) { return this.products.getProduct(id); }
  async searchProducts(query: string) { return this.products.searchProducts(query); }
  async createProduct(product: any) { return this.products.createProduct(product); }
  async updateProduct(id: string, product: any) { return this.products.updateProduct(id, product); }
  async deleteProduct(id: string) { return this.products.deleteProduct(id); }
  async getLowStockProducts() { return this.products.getLowStockProducts(); }

  async getOrders() { return this.orders.getOrders(); }
  async getOrder(id: string) { return this.orders.getOrder(id); }
  async createOrder(order: any) { return this.orders.createOrder(order); }
  async updateOrder(id: string, order: any) { return this.orders.updateOrder(id, order); }
  async deleteOrder(id: string) { return this.orders.deleteOrder(id); }
  async getOrderItems(orderId: string) { return this.orders.getOrderItems(orderId); }
  async createOrderItem(item: any) { return this.orders.createOrderItem(item); }

  async getInventoryByWarehouse(warehouseId: string) { return this.inventory.getInventoryByWarehouse(warehouseId); }
  async getProductInventory(productId: string) { return this.inventory.getProductInventory(productId); }
  async updateInventory(productId: string, warehouseId: string, quantity: number) { 
    return this.inventory.updateInventory(productId, warehouseId, quantity); 
  }
  async getStockMovements(limit?: number) { return this.inventory.getStockMovements(limit); }
  async createStockMovement(movement: any) { return this.inventory.createStockMovement(movement); }

  // Fleet management methods
  async getVehicles() { return this.fleet.getVehicles(); }
  async getVehicle(id: string) { return this.fleet.getVehicle(id); }
  async getVehicleByLicensePlate(licensePlate: string) { return this.fleet.getVehicleByLicensePlate(licensePlate); }
  async createVehicle(vehicle: any) { return this.fleet.createVehicle(vehicle); }
  async updateVehicle(id: string, vehicle: any) { return this.fleet.updateVehicle(id, vehicle); }
  async deleteVehicle(id: string) { return this.fleet.deleteVehicle(id); }
  async getVehiclesByStatus(status: string) { return this.fleet.getVehiclesByStatus(status); }
  async getAvailableVehicles() { return this.fleet.getAvailableVehicles(); }
  async getVehicleMaintenance(vehicleId: string) { return this.fleet.getVehicleMaintenance(vehicleId); }
  async createVehicleMaintenance(maintenance: any) { return this.fleet.createVehicleMaintenance(maintenance); }
  async updateMaintenance(id: string, maintenance: any) { return this.fleet.updateMaintenance(id, maintenance); }
  async getUpcomingMaintenance() { return this.fleet.getUpcomingMaintenance(); }
  async trackGPS(tracking: any) { return this.fleet.trackGPS(tracking); }
  async getVehicleCurrentLocation(vehicleId: string) { return this.fleet.getVehicleCurrentLocation(vehicleId); }
  async getVehicleLocationHistory(vehicleId: string, options: any) { return this.fleet.getVehicleLocationHistory(vehicleId, options); }
  async getAllVehicleLocations() { return this.fleet.getAllVehicleLocations(); }
  async updateGPSStatus(vehicleId: string, status: string) { return this.fleet.updateGPSStatus(vehicleId, status); }
  async getVehicleAssignments() { return this.fleet.getVehicleAssignments(); }
  async getAssignment(id: string) { return this.fleet.getAssignment(id); }
  async createAssignment(assignment: any) { return this.fleet.createAssignment(assignment); }
  async updateAssignment(id: string, assignment: any) { return this.fleet.updateAssignment(id, assignment); }
  async getVehicleActiveAssignments(vehicleId: string) { return this.fleet.getVehicleActiveAssignments(vehicleId); }
  async getDriverActiveAssignments(driverId: string) { return this.fleet.getDriverActiveAssignments(driverId); }
  async getGeofences() { return this.fleet.getGeofences(); }
  async getGeofence(id: string) { return this.fleet.getGeofence(id); }
  async createGeofence(geofence: any) { return this.fleet.createGeofence(geofence); }
  async updateGeofence(id: string, geofence: any) { return this.fleet.updateGeofence(id, geofence); }
  async deleteGeofence(id: string) { return this.fleet.deleteGeofence(id); }
  async getActiveGeofences() { return this.fleet.getActiveGeofences(); }
  async getGeofenceAlerts() { return this.fleet.getGeofenceAlerts(); }
  async createGeofenceAlert(alert: any) { return this.fleet.createGeofenceAlert(alert); }
  async acknowledgeGeofenceAlert(id: string) { return this.fleet.acknowledgeGeofenceAlert(id); }
  async getActiveGeofenceAlerts() { return this.fleet.getActiveGeofenceAlerts(); }
  async createGPSSession(session: any) { return this.fleet.createGPSSession(session); }
  async updateGPSSession(id: string, session: any) { return this.fleet.updateGPSSession(id, session); }
  async getActiveGPSSessions() { return this.fleet.getActiveGPSSessions(); }
  async endGPSSession(id: string) { return this.fleet.endGPSSession(id); }
}

// Export a singleton instance for backward compatibility
export const storage = new Storage();

// Export all types
export * from "./types";