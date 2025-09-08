import storage from '../../storage.js';

export class BatchManagementModel {
  static async getBatches(filters: {
    warehouseId?: string;
    productId?: string;
    status?: string;
    expiryAlert?: boolean;
  }) {
    return await storage.getBatches(filters);
  }

  static async getBatchById(id: string) {
    return await storage.getBatchById(id);
  }

  static async getBatchByNumber(batchNumber: string) {
    return await storage.getBatchByNumber(batchNumber);
  }

  static async createBatch(data: any) {
    return await storage.createBatch(data);
  }

  static async updateBatch(id: string, data: any) {
    return await storage.updateBatch(id, data);
  }

  static async deleteBatch(id: string) {
    return await storage.deleteBatch(id);
  }

  static async addProductsToBatch(batchId: string, data: any) {
    return await storage.addProductsToBatch(batchId, data);
  }

  static async removeProductFromBatch(batchId: string, quantity: number) {
    return await storage.removeProductFromBatch(batchId, quantity);
  }

  static async getExpiryAlerts(batchId: string) {
    return await storage.getBatchExpiryAlerts(batchId);
  }

  static async getExpiringProducts(daysAhead: number, warehouseId?: string) {
    return await storage.getExpiringProducts(daysAhead, warehouseId);
  }

  static async getExpiredProducts(warehouseId?: string) {
    return await storage.getExpiredProducts(warehouseId);
  }

  static async extendBatchExpiry(batchIds: string[], data: any) {
    return await storage.extendBatchExpiry(batchIds, data);
  }

  static async getBatchHistory(batchNumber: string) {
    return await storage.getBatchHistory(batchNumber);
  }

  static async getBatchLocation(batchNumber: string) {
    return await storage.getBatchLocation(batchNumber);
  }
}