import {
  type User, type InsertUser, type Category, type InsertCategory, type Supplier, type InsertSupplier,
  type Warehouse, type InsertWarehouse, type Product, type InsertProduct, type Inventory, type InsertInventory,
  type StockMovement, type InsertStockMovement, type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Shipment, type InsertShipment, type ProductLocation, type InsertProductLocation,
  type InventoryCount, type InsertInventoryCount, type InventoryCountItem, type InsertInventoryCountItem,
  type BarcodeScan, type InsertBarcodeScan,
  type PickingList, type InsertPickingList, type PickingListItem, type InsertPickingListItem,
  type Vehicle, type InsertVehicle, type VehicleMaintenance, type InsertVehicleMaintenance,
  type GpsTracking, type InsertGpsTracking, type Geofence, type InsertGeofence,
  type VehicleAssignment, type InsertVehicleAssignment, type GeofenceAlert, type InsertGeofenceAlert,
  type GpsSession, type InsertGpsSession, type Role, type InsertRole, type Permission, type InsertPermission,
  type RolePermission, type InsertRolePermission, type UserRole, type InsertUserRole
} from "../../../shared/schema";

// Tipos temporários para Returns até serem implementados no schema
export type Return = {
  id: string;
  orderId: string;
  returnNumber: string;
  reason: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertReturn = Omit<Return, 'id' | 'createdAt' | 'updatedAt'>;

export type ReturnItem = {
  id: string;
  returnId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  condition: string;
  createdAt: Date;
};

export type InsertReturnItem = Omit<ReturnItem, 'id' | 'createdAt'>;

// Re-export all types for convenience
export {
  type User, type InsertUser, type Category, type InsertCategory, type Supplier, type InsertSupplier,
  type Warehouse, type InsertWarehouse, type Product, type InsertProduct, type Inventory, type InsertInventory,
  type StockMovement, type InsertStockMovement, type Order, type InsertOrder, type OrderItem, type InsertOrderItem,
  type Shipment, type InsertShipment, type ProductLocation, type InsertProductLocation,
  type InventoryCount, type InsertInventoryCount, type InventoryCountItem, type InsertInventoryCountItem,
  type BarcodeScan, type InsertBarcodeScan,
  type PickingList, type InsertPickingList, type PickingListItem, type InsertPickingListItem,
  type Vehicle, type InsertVehicle, type VehicleMaintenance, type InsertVehicleMaintenance,
  type GpsTracking, type InsertGpsTracking, type Geofence, type InsertGeofence,
  type VehicleAssignment, type InsertVehicleAssignment, type GeofenceAlert, type InsertGeofenceAlert,
  type GpsSession, type InsertGpsSession, type Role, type InsertRole, type Permission, type InsertPermission,
  type RolePermission, type InsertRolePermission, type UserRole, type InsertUserRole
};

// Common interfaces
export interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  pendingOrders: number;
  monthlySales: string;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  warehouseId?: string;
  categoryId?: string;
  supplierId?: string;
  limit?: number;
}

export interface BatchFilters {
  warehouseId?: string;
  status?: string;
  expiryDate?: Date;
}

export interface PickingFilters {
  warehouseId?: string;
  status?: string;
  assignedUserId?: string;
}