import { DatabaseStorage } from '../../storage';

const storage = new DatabaseStorage();

export class ReportsModel {
  static async getInventoryTurnoverReport(filters: {
    startDate: Date;
    endDate: Date;
    warehouseId?: string;
    categoryId?: string;
  }) {
    return await storage.getInventoryTurnoverReport(filters);
  }

  static async getObsoleteInventoryReport(filters: {
    daysWithoutMovement: number;
    warehouseId?: string;
    minValue: number;
  }) {
    return await storage.getObsoleteInventoryReport(filters);
  }

  static async getProductPerformanceReport(filters: {
    startDate: Date;
    endDate: Date;
    limit?: number;
  }) {
    return await storage.getProductPerformanceReport(filters);
  }

  static async getWarehouseEfficiencyReport(warehouseId?: string) {
    return await storage.getWarehouseEfficiencyReport(warehouseId);
  }

  static async getStockValuationReport(warehouseId?: string) {
    return await storage.getStockValuationReport(warehouseId);
  }

  static async getSupplierPerformanceReport(filters: {
    startDate: Date;
    endDate: Date;
    supplierId?: string;
  }) {
    return await storage.getSupplierPerformanceReport(filters);
  }
}