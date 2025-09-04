import storage from '../../storage.js';
import type { InsertBarcodeScan, BarcodeScan, Product } from '../../storage/types.js';

export class BarcodeScanningModel {
  static async getBarcodeScans(limit?: number) {
    return await storage.getBarcodeScans(limit);
  }

  static async createBarcodeScan(scan: InsertBarcodeScan) {
    return await storage.createBarcodeScan(scan);
  }

  static async getBarcodeScansByProduct(productId: string) {
    return await storage.getBarcodeScansByProduct(productId);
  }

  static async findProductByBarcode(barcode: string) {
    return await storage.findProductByBarcode(barcode);
  }

  static async updateProductLastScanned(productId: string, userId: string) {
    return await storage.updateProductLastScanned(productId, userId);
  }

  static async updateScanLocation(scanId: string, locationData: {
    locationId: string;
    coordinates?: { latitude: number; longitude: number };
    timestamp?: string;
  }) {
    return await storage.updateBarcodeScanLocation(scanId, locationData);
  }

  static async getLastProductLocation(productId: string) {
    return await storage.getLastProductLocation(productId);
  }
}