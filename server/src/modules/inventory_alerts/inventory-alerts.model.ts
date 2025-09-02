import { DatabaseStorage } from '../../storage';

const storage = new DatabaseStorage();

export class InventoryAlertsModel {
  static async getAlerts(filters: any) {
    return await storage.getInventoryAlerts(filters);
  }

  static async getAlertById(id: string) {
    return await storage.getInventoryAlertById(id);
  }

  static async createAlert(data: any) {
    return await storage.createInventoryAlert(data);
  }

  static async updateAlert(id: string, data: any) {
    return await storage.updateInventoryAlert(id, data);
  }

  static async deleteAlert(id: string) {
    return await storage.deleteInventoryAlert(id);
  }

  static async getLowStockAlerts(warehouseId?: string) {
    return await storage.getLowStockAlerts(warehouseId);
  }

  static async getOverstockAlerts(warehouseId?: string) {
    return await storage.getOverstockAlerts(warehouseId);
  }

  static async getExpiryAlerts(warehouseId?: string, daysAhead: number = 30) {
    return await storage.getExpiryAlerts(warehouseId, daysAhead);
  }

  static async getDeadStockAlerts(warehouseId?: string, days: number = 90) {
    return await storage.getDeadStockAlerts(warehouseId, days);
  }

  static async getAlertSettings(warehouseId?: string) {
    return await storage.getAlertSettings(warehouseId);
  }

  static async updateAlertSettings(warehouseId: string, data: any) {
    return await storage.updateAlertSettings(warehouseId, data);
  }

  static async acknowledgeAlert(id: string, data: any) {
    return await storage.acknowledgeAlert(id, data);
  }

  static async resolveAlert(id: string, data: any) {
    return await storage.resolveAlert(id, data);
  }

  static async bulkAlertAction(alertIds: string[], data: any) {
    return await storage.bulkAlertAction(alertIds, data);
  }
}