import { DatabaseStorage } from '../../storage';
import type { InsertProductLocation, ProductLocation } from '../../../shared/schema';

const storage = new DatabaseStorage();

export class ProductLocationsModel {
  static async getProductLocations(warehouseId?: string) {
    return await storage.getProductLocations(warehouseId);
  }

  static async getProductLocationById(id: string) {
    return await storage.getProductLocationById(id);
  }

  static async findProductLocation(productId: string, warehouseId: string) {
    return await storage.getProductLocation(productId, warehouseId);
  }

  static async createProductLocation(location: InsertProductLocation) {
    return await storage.createProductLocation(location);
  }

  static async updateProductLocation(id: string, location: Partial<InsertProductLocation>) {
    return await storage.updateProductLocation(id, location);
  }

  static async deleteProductLocation(id: string) {
    return await storage.deleteProductLocation(id);
  }

  static async bulkAssignLocations(data: {
    productIds: string[];
    warehouseId: string;
    zone: string;
    autoAssignBins: boolean;
  }) {
    return await storage.bulkAssignProductLocations(data);
  }

  static async getWarehouseZones(warehouseId: string) {
    return await storage.getWarehouseZones(warehouseId);
  }

  static async createWarehouseZone(data: {
    warehouseId: string;
    zoneName: string;
    description?: string;
    maxCapacity?: number;
  }) {
    return await storage.createWarehouseZone(data);
  }
}