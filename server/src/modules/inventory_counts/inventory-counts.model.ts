import { db } from '../../../database/db';
import { inventoryCounts, inventoryCountItems } from '../../../../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { insertAndReturn, updateAndReturn } from '../../storage/utils';
import { inventoryCounts as inventoryCountsTable } from '../../../../shared/schema';
import { randomUUID } from 'crypto';
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

  static async getInventoryCount(id: string): Promise<InventoryCount | null> {
    try {
      const result = await db
        .select()
        .from(inventoryCounts)
        .where(eq(inventoryCounts.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      throw new Error(`Erro ao buscar contagem de inventário: ${error}`);
    }
  }

  static async createInventoryCount(count: InsertInventoryCount) {
    const id = randomUUID();
    const countData = { ...count, id };
    return await insertAndReturn<InventoryCount>(inventoryCounts, countData, inventoryCountsTable.id, id);
  }

  static async updateInventoryCount(id: string, count: Partial<InsertInventoryCount>): Promise<InventoryCount | null> {
    try {
      await db
        .update(inventoryCounts)
        .set(count)
        .where(eq(inventoryCounts.id, id));
      
      return await this.getInventoryCount(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar contagem de inventário: ${error}`);
    }
  }

  static async deleteInventoryCount(id: string): Promise<boolean> {
    try {
      // Verificar se a contagem existe antes de deletar
      const existingCount = await this.getInventoryCount(id);
      if (!existingCount) {
        return false;
      }
      
      // Primeiro, deletar todos os itens da contagem
      await db
        .delete(inventoryCountItems)
        .where(eq(inventoryCountItems.countId, id));
      
      // Depois, deletar a contagem
      await db
        .delete(inventoryCounts)
        .where(eq(inventoryCounts.id, id));
      
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar contagem de inventário: ${error}`);
    }
  }

  static async getInventoryCountItems(countId: string): Promise<InventoryCountItem[]> {
    try {
      const result = await db
        .select()
        .from(inventoryCountItems)
        .where(eq(inventoryCountItems.countId, countId));
      
      return result;
    } catch (error) {
      throw new Error(`Erro ao buscar itens da contagem: ${error}`);
    }
  }

  static async getInventoryCountItem(id: string): Promise<InventoryCountItem | null> {
    try {
      const result = await db
        .select()
        .from(inventoryCountItems)
        .where(eq(inventoryCountItems.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      throw new Error(`Erro ao buscar item da contagem: ${error}`);
    }
  }

  static async createInventoryCountItem(item: InsertInventoryCountItem): Promise<InventoryCountItem> {
    try {
      const newItem = {
        id: randomUUID(),
        ...item
      };
      
      await db.insert(inventoryCountItems).values(newItem);
      
      const result = await this.getInventoryCountItem(newItem.id);
      if (!result) {
        throw new Error('Falha ao criar item da contagem');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Erro ao criar item da contagem: ${error}`);
    }
  }

  static async updateInventoryCountItem(id: string, item: Partial<InsertInventoryCountItem>): Promise<InventoryCountItem | null> {
    try {
      await db
        .update(inventoryCountItems)
        .set(item)
        .where(eq(inventoryCountItems.id, id));
      
      return await this.getInventoryCountItem(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar item da contagem: ${error}`);
    }
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