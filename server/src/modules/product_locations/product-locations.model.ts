import { db } from '../../../database/db';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class ProductLocationsModel {
  static async getProductLocations(warehouseId?: string): Promise<any[]> {
    let query = `
      SELECT pl.id, pl.product_id, pl.warehouse_id, pl.zone, pl.shelf, pl.bin, 
             pl.last_scanned, pl.scanned_by_user_id, pl.created_at,
             p.id as p_id, p.name as p_name, p.sku as p_sku, p.barcode as p_barcode,
             w.id as w_id, w.name as w_name
      FROM product_locations pl
      LEFT JOIN products p ON pl.product_id = p.id
      LEFT JOIN warehouses w ON pl.warehouse_id = w.id
    `;
    
    if (warehouseId) {
      query += ` WHERE pl.warehouse_id = '${warehouseId}'`;
    }
    
    query += ` ORDER BY pl.created_at DESC`;
    
    const result = await db.execute(sql.raw(query));
    
    return (result[0] as any).map((row: any) => ({
      id: row.id,
      productId: row.product_id,
      warehouseId: row.warehouse_id,
      zone: row.zone,
      shelf: row.shelf,
      bin: row.bin,
      lastScanned: row.last_scanned,
      scannedByUserId: row.scanned_by_user_id,
      createdAt: row.created_at,
      product: row.p_id ? {
        id: row.p_id,
        name: row.p_name,
        sku: row.p_sku,
        barcode: row.p_barcode
      } : null,
      warehouse: row.w_id ? {
        id: row.w_id,
        name: row.w_name
      } : null
    }));
  }

  static async getProductLocationById(id: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT pl.id, pl.product_id, pl.warehouse_id, pl.zone, pl.shelf, pl.bin, 
             pl.last_scanned, pl.scanned_by_user_id, pl.created_at,
             p.id as p_id, p.name as p_name, p.sku as p_sku, p.barcode as p_barcode,
             w.id as w_id, w.name as w_name
      FROM product_locations pl
      LEFT JOIN products p ON pl.product_id = p.id
      LEFT JOIN warehouses w ON pl.warehouse_id = w.id
      WHERE pl.id = ${id}
      LIMIT 1
    `);
    
    if ((result[0] as any).length === 0) return null;
    
    const row = (result[0] as any)[0];
    return {
      id: row.id,
      productId: row.product_id,
      warehouseId: row.warehouse_id,
      zone: row.zone,
      shelf: row.shelf,
      bin: row.bin,
      lastScanned: row.last_scanned,
      scannedByUserId: row.scanned_by_user_id,
      createdAt: row.created_at,
      product: row.p_id ? {
        id: row.p_id,
        name: row.p_name,
        sku: row.p_sku,
        barcode: row.p_barcode
      } : null,
      warehouse: row.w_id ? {
        id: row.w_id,
        name: row.w_name
      } : null
    };
  }

  static async findProductLocation(productId: string, warehouseId: string): Promise<any> {
    const result = await db.execute(sql`
      SELECT pl.id, pl.product_id, pl.warehouse_id, pl.zone, pl.shelf, pl.bin, 
             pl.last_scanned, pl.scanned_by_user_id, pl.created_at,
             p.id as p_id, p.name as p_name, p.sku as p_sku, p.barcode as p_barcode,
             w.id as w_id, w.name as w_name
      FROM product_locations pl
      LEFT JOIN products p ON pl.product_id = p.id
      LEFT JOIN warehouses w ON pl.warehouse_id = w.id
      WHERE pl.product_id = ${productId} AND pl.warehouse_id = ${warehouseId}
      LIMIT 1
    `);
    
    if ((result[0] as any).length === 0) return null;
    
    const row = (result[0] as any)[0];
    return {
      id: row.id,
      productId: row.product_id,
      warehouseId: row.warehouse_id,
      zone: row.zone,
      shelf: row.shelf,
      bin: row.bin,
      lastScanned: row.last_scanned,
      scannedByUserId: row.scanned_by_user_id,
      createdAt: row.created_at,
      product: row.p_id ? {
        id: row.p_id,
        name: row.p_name,
        sku: row.p_sku,
        barcode: row.p_barcode
      } : null,
      warehouse: row.w_id ? {
        id: row.w_id,
        name: row.w_name
      } : null
    };
  }

  static async createProductLocation(location: any): Promise<any> {
    const id = randomUUID();
    const now = new Date();
    
    await db.execute(sql`
      INSERT INTO product_locations (id, product_id, warehouse_id, zone, shelf, bin, created_at)
      VALUES (${id}, ${location.productId}, ${location.warehouseId}, ${location.zone || null}, ${location.shelf || null}, ${location.bin || null}, ${now})
    `);
    
    // Buscar a localização recém-criada com as relações
    return await this.getProductLocationById(id);
  }

  static async updateProductLocation(id: string, location: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    
    if (location.zone !== undefined) {
      updates.push('zone = ?');
      values.push(location.zone);
    }
    if (location.shelf !== undefined) {
      updates.push('shelf = ?');
      values.push(location.shelf);
    }
    if (location.bin !== undefined) {
      updates.push('bin = ?');
      values.push(location.bin);
    }
    if (location.lastScanned !== undefined) {
      updates.push('last_scanned = ?');
      values.push(location.lastScanned);
    }
    if (location.scannedByUserId !== undefined) {
      updates.push('scanned_by_user_id = ?');
      values.push(location.scannedByUserId);
    }
    
    if (updates.length > 0) {
       const query = `UPDATE product_locations SET ${updates.join(', ')} WHERE id = '${id}'`;
       await db.execute(sql.raw(query));
     }
    
    // Retornar a localização atualizada com as relações
    return await this.getProductLocationById(id);
  }

  static async deleteProductLocation(id: string): Promise<void> {
    await db.execute(sql`
      DELETE FROM product_locations WHERE id = ${id}
    `);
  }

  static async bulkAssignLocations(data: {
    productIds: string[];
    warehouseId: string;
    zone: string;
    autoAssignBins: boolean;
  }): Promise<{ assigned: number; failed: number }> {
    let assigned = 0;
    let failed = 0;

    for (const productId of data.productIds) {
      try {
        // Verificar se já existe uma localização para este produto neste armazém
        const existing = await this.findProductLocation(productId, data.warehouseId);
        
        if (!existing) {
          const locationData = {
            productId,
            warehouseId: data.warehouseId,
            zone: data.zone,
            shelf: data.autoAssignBins ? `${data.zone}-${String(assigned + 1).padStart(2, '0')}` : undefined,
            bin: data.autoAssignBins ? `${data.zone}-${String(assigned + 1).padStart(2, '0')}-01` : undefined
          };
          
          await this.createProductLocation(locationData);
          assigned++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
      }
    }

    return { assigned, failed };
  }

  static async getWarehouseZones(warehouseId: string): Promise<string[]> {
    const result = await db.execute(sql`
      SELECT DISTINCT zone FROM product_locations 
      WHERE warehouse_id = ${warehouseId} AND zone IS NOT NULL
      ORDER BY zone
    `);
    
    return (result[0] as any).map((row: any) => row.zone);
  }

  static async createWarehouseZone(data: {
    warehouseId: string;
    zoneName: string;
    description?: string;
    maxCapacity?: number;
  }): Promise<any> {
    // Para simplificar, vamos apenas retornar os dados fornecidos
    // Em uma implementação real, isso seria salvo em uma tabela de zonas
    return {
      id: `zone_${Date.now()}`,
      ...data,
      createdAt: new Date()
    };
  }
}