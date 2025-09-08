import { db } from "../../../database/db";
import { sql, eq } from "drizzle-orm";
import { warehouses, type Warehouse, type InsertWarehouse } from "../../../../shared/schema";
import { insertAndReturn, updateAndReturn, safeDelete } from "../utils";
import { ErrorHandler, NotFoundError } from "../base/StorageError";

export class WarehouseStorage {
  /**
   * Buscar todos os armazéns
   */
  async getWarehouses(): Promise<Warehouse[]> {
    return await ErrorHandler.executeWithErrorHandling(
      () => db.select().from(warehouses),
      'WarehouseStorage.getWarehouses'
    );
  }

  /**
   * Buscar armazém por ID
   */
  async getWarehouse(id: string): Promise<Warehouse | null> {
    ErrorHandler.validateId(id);
    
    return await ErrorHandler.executeWithErrorHandling(async () => {
      const result = await db.select().from(warehouses).where(eq(warehouses.id, id));
      return result[0] || null;
    }, 'WarehouseStorage.getWarehouse');
  }

  /**
   * Criar novo armazém
   */
  async createWarehouse(data: InsertWarehouse): Promise<Warehouse> {
    ErrorHandler.validateRequired(data.name, 'name');
    
    const id = crypto.randomUUID();
    const result = await ErrorHandler.executeWithErrorHandling(
      () => insertAndReturn<Warehouse>(warehouses, data, warehouses.id, id),
      'WarehouseStorage.createWarehouse'
    );
    
    if (!result) {
      throw new Error('Falha ao criar armazém');
    }
    
    return result;
  }

  /**
   * Atualizar armazém
   */
  async updateWarehouse(id: string, data: Partial<InsertWarehouse>): Promise<Warehouse> {
    ErrorHandler.validateId(id);
    
    const result = await ErrorHandler.executeWithErrorHandling(
      () => updateAndReturn<Warehouse>(warehouses, id, data, warehouses.id),
      'WarehouseStorage.updateWarehouse'
    );
    
    if (!result) {
      throw new NotFoundError('Armazém não encontrado');
    }
    
    return result;
  }

  /**
   * Deletar armazém
   */
  async deleteWarehouse(id: string): Promise<void> {
    ErrorHandler.validateId(id);
    
    return await ErrorHandler.executeWithErrorHandling(
      () => safeDelete(warehouses, id, warehouses.id),
      'WarehouseStorage.deleteWarehouse'
    );
  }

  /**
   * Buscar armazéns ativos
   */
  async getActiveWarehouses(): Promise<Warehouse[]> {
    return await ErrorHandler.executeWithErrorHandling(
      () => this.getWarehouses(),
      'WarehouseStorage.getActiveWarehouses'
    );
  }

  /**
   * Buscar armazém por nome
   */
  async getWarehouseByName(name: string): Promise<Warehouse | null> {
    try {
      // Implementação simplificada - busca todos e filtra
      const warehouses = await this.getWarehouses();
      return warehouses.find(w => w.name === name) || null;
    } catch (error) {
      console.error('Erro ao buscar armazém por nome:', error);
      return null;
    }
  }
}