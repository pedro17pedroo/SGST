import { DatabaseStorage } from '../../storage';
import type { 
  InsertInventoryCount, 
  InventoryCount, 
  InsertInventoryCountItem,
  InventoryCountItem 
} from '../../../shared/schema';

const storage = new DatabaseStorage();

export class InventoryCountsModel {
  static async getInventoryCounts(warehouseId?: string) {
    return await storage.getInventoryCounts(warehouseId);
  }

  static async getInventoryCount(id: string) {
    return await storage.getInventoryCount(id);
  }

  static async createInventoryCount(count: InsertInventoryCount) {
    return await storage.createInventoryCount(count);
  }

  static async updateInventoryCount(id: string, count: Partial<InsertInventoryCount>) {
    return await storage.updateInventoryCount(id, count);
  }

  static async deleteInventoryCount(id: string) {
    return await storage.deleteInventoryCount(id);
  }

  static async getInventoryCountItems(countId: string) {
    return await storage.getInventoryCountItems(countId);
  }

  static async getInventoryCountItem(id: string) {
    // This method needs to be added to storage
    return await storage.getInventoryCountItem(id);
  }

  static async createInventoryCountItem(item: InsertInventoryCountItem) {
    return await storage.createInventoryCountItem(item);
  }

  static async updateInventoryCountItem(id: string, item: Partial<InsertInventoryCountItem>) {
    return await storage.updateInventoryCountItem(id, item);
  }

  static async generateCountList(countId: string, filters: {
    warehouseId?: string;
    categoryId?: string;
    supplierIds?: string[];
  }) {
    // Generate list of products to count based on filters
    return await storage.generateInventoryCountList(countId, filters);
  }

  static async reconcileInventoryCount(countId: string) {
    // Apply count variances to actual inventory
    return await storage.reconcileInventoryCount(countId);
  }

  static async completeInventoryCount(countId: string) {
    // Mark count as completed and update status
    return await storage.completeInventoryCount(countId);
  }
}