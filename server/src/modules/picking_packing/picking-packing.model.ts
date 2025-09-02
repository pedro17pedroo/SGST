import { DatabaseStorage } from '../../storage';

const storage = new DatabaseStorage();

export class PickingPackingModel {
  static async getPickingLists(filters: {
    warehouseId?: string;
    status?: string;
    assignedToUserId?: string;
  }) {
    return await storage.getPickingLists(filters);
  }

  static async getPickingListById(id: string) {
    return await storage.getPickingListById(id);
  }

  static async createPickingList(data: any) {
    return await storage.createPickingList(data);
  }

  static async updatePickingList(id: string, data: any) {
    return await storage.updatePickingList(id, data);
  }

  static async deletePickingList(id: string) {
    return await storage.deletePickingList(id);
  }

  static async startPicking(id: string, userId: string) {
    return await storage.startPicking(id, userId);
  }

  static async completePicking(id: string) {
    return await storage.completePicking(id);
  }

  static async pickItem(itemId: string, data: any) {
    return await storage.pickItem(itemId, data);
  }

  static async verifyPickedItem(itemId: string, data: any) {
    return await storage.verifyPickedItem(itemId, data);
  }

  static async createPickingWave(data: any) {
    return await storage.createPickingWave(data);
  }

  static async getPickingWave(waveId: string) {
    return await storage.getPickingWave(waveId);
  }

  static async assignWaveToUser(waveId: string, userId: string) {
    return await storage.assignWaveToUser(waveId, userId);
  }

  static async getPackingTasks(filters: { warehouseId?: string; status?: string }) {
    return await storage.getPackingTasks(filters);
  }

  static async createPackingTask(data: any) {
    return await storage.createPackingTask(data);
  }

  static async packItems(id: string, data: any) {
    return await storage.packItems(id, data);
  }

  static async completePackaging(id: string) {
    return await storage.completePackaging(id);
  }

  static async generateShippingLabel(data: any) {
    return await storage.generateShippingLabel(data);
  }

  static async getShippingInfo(id: string) {
    return await storage.getShippingInfo(id);
  }
}