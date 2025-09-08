import { db } from '../../../database/db';
import { barcodeScans, products } from '../../../../shared/schema';
import { eq, desc } from 'drizzle-orm';
import type { BarcodeScan, InsertBarcodeScan, Product } from '../../../../shared/schema';

export class BarcodeScanStorage {
  async getBarcodeScans(query: string, options: { limit: number }): Promise<BarcodeScan[]> {
    try {
      return await db
        .select()
        .from(barcodeScans)
        .orderBy(desc(barcodeScans.createdAt))
        .limit(options.limit);
    } catch (error) {
      console.error('Erro ao buscar scans de código de barras:', error);
      return [];
    }
  }

  async createBarcodeScan(scan: InsertBarcodeScan): Promise<BarcodeScan> {
    try {
      await db.insert(barcodeScans).values(scan);
      
      // Buscar o scan criado
      const [newScan] = await db
        .select()
        .from(barcodeScans)
        .where(eq(barcodeScans.scannedCode, scan.scannedCode))
        .orderBy(desc(barcodeScans.createdAt))
        .limit(1);
      
      if (!newScan) {
        throw new Error('Falha ao criar scan de código de barras');
      }
      
      return newScan;
    } catch (error) {
      console.error('Erro ao criar scan de código de barras:', error);
      throw error;
    }
  }

  async getBarcodeScansForProduct(productId: string): Promise<BarcodeScan[]> {
    try {
      return await db
        .select()
        .from(barcodeScans)
        .where(eq(barcodeScans.productId, productId))
        .orderBy(desc(barcodeScans.createdAt));
    } catch (error) {
      console.error('Erro ao buscar scans para produto:', error);
      return [];
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    try {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.barcode, barcode))
        .limit(1);
      
      return result[0] || undefined;
    } catch (error) {
      console.error('Erro ao buscar produto por código de barras:', error);
      return undefined;
    }
  }

  async updateBarcodeScanLocation(scanId: string, locationData: any): Promise<BarcodeScan> {
    try {
      await db
        .update(barcodeScans)
        .set({
          locationId: locationData.location || null
        })
        .where(eq(barcodeScans.id, scanId));
      
      // Buscar o scan atualizado
      const [updatedScan] = await db
        .select()
        .from(barcodeScans)
        .where(eq(barcodeScans.id, scanId))
        .limit(1);
      
      if (!updatedScan) {
        throw new Error('Scan de código de barras não encontrado');
      }
      
      return updatedScan;
    } catch (error) {
      console.error('Erro ao atualizar localização do scan:', error);
      throw error;
    }
  }
}