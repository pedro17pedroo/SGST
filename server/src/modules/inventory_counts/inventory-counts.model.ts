import { db } from '../../../database/db';
import { inventoryCounts, inventoryCountItems } from '../../../../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { insertAndReturn, updateAndReturn } from '../../storage/utils';
import type { 
  InsertInventoryCount, 
  InventoryCount, 
  InsertInventoryCountItem,
  InventoryCountItem 
} from '../../../../shared/schema';

export class InventoryCountsModel {
  static async getInventoryCounts(warehouseId?: string) {
    try {
      console.log('🔍 Buscando contagens de inventário...', { warehouseId });
      
      let query = `
        SELECT 
          ic.id, 
          ic.count_number, 
          ic.type, 
          ic.status, 
          ic.warehouse_id, 
          ic.scheduled_date, 
          ic.completed_date, 
          ic.user_id, 
          ic.notes, 
          ic.created_at,
          w.id as warehouse_id_full,
          w.name as warehouse_name
        FROM inventory_counts ic
        LEFT JOIN warehouses w ON ic.warehouse_id = w.id
      `;
      
      if (warehouseId) {
        query += ` WHERE ic.warehouse_id = '${warehouseId}'`;
      }
      
      query += ` ORDER BY ic.created_at DESC`;
      
      console.log('📝 Query SQL:', query);
      
      const result = await db.execute(sql.raw(query));
      console.log('📊 Resultado bruto:', result);
      
      const mapped = (result[0] as any).map((row: any) => ({
        id: row.id,
        countNumber: row.count_number,
        type: row.type,
        status: row.status,
        warehouseId: row.warehouse_id,
        scheduledDate: row.scheduled_date,
        completedDate: row.completed_date,
        userId: row.user_id,
        notes: row.notes,
        createdAt: row.created_at,
        warehouse: {
          id: row.warehouse_id,
          name: row.warehouse_name || 'Armazém não encontrado'
        }
      }));
      
      console.log('✅ Resultado mapeado:', mapped);
      return mapped;
    } catch (error) {
      console.error('❌ Erro ao buscar contagens de inventário:', error);
      throw error;
    }
  }

  static async getInventoryCount(id: string) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    return null;
  }

  static async createInventoryCount(count: InsertInventoryCount) {
    return await insertAndReturn<InventoryCount>(inventoryCounts, count);
  }

  static async updateInventoryCount(id: string, count: Partial<InsertInventoryCount>) {
    return await updateAndReturn<InventoryCount>(inventoryCounts, id, count);
  }

  static async deleteInventoryCount(id: string) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    throw new Error('Inventory counts not implemented yet - tables missing');
  }

  static async getInventoryCountItems(countId: string) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    return [];
  }

  static async getInventoryCountItem(id: string) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    return {
      id,
      expectedQuantity: 0,
      countedQuantity: 0,
      variance: 0
    };
  }

  static async createInventoryCountItem(item: InsertInventoryCountItem) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    throw new Error('Inventory count items not implemented yet - tables missing');
  }

  static async updateInventoryCountItem(id: string, item: Partial<InsertInventoryCountItem>) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    throw new Error('Inventory count items not implemented yet - tables missing');
  }

  static async generateCountList(countId: string, filters: {
    warehouseId?: string;
    categoryId?: string;
    supplierIds?: string[];
  }) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    return [];
  }

  static async reconcileInventoryCount(countId: string) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    return {
      reconciled: 0,
      adjustments: []
    };
  }

  static async completeInventoryCount(countId: string) {
    // TODO: Implementar com Drizzle quando as tabelas estiverem criadas
    throw new Error('Complete inventory count not implemented yet - tables missing');
  }
}