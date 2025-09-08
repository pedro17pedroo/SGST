import { db } from '../../../database/db';
import { sql, eq, and, desc, asc, gte, lte, isNull } from 'drizzle-orm';
import { batches, products, warehouses, users } from '../../../../shared/schema';
import type { Batch, InsertBatch } from '../../../../shared/schema';

/**
 * Classe para gestão de lotes no storage
 * Implementa operações CRUD e funcionalidades específicas de batch management
 */
export class BatchStorage {
  /**
   * Obter todos os lotes com filtros opcionais
   */
  async getBatches(filters: {
    warehouseId?: string;
    productId?: string;
    status?: string;
    expiryAlert?: boolean;
  } = {}): Promise<Batch[]> {
    let query = db.select().from(batches);
    const conditions = [];

    if (filters.warehouseId) {
      conditions.push(eq(batches.warehouseId, filters.warehouseId));
    }

    if (filters.productId) {
      conditions.push(eq(batches.productId, filters.productId));
    }

    if (filters.status) {
      conditions.push(eq(batches.status, filters.status));
    }

    if (filters.expiryAlert) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      conditions.push(lte(batches.expiryDate, thirtyDaysFromNow));
    }

    if (conditions.length > 0) {
      const result = await query.where(and(...conditions)).orderBy(asc(batches.fifoPosition), asc(batches.createdAt));
      return result;
    }

    // Ordenar por posição FIFO (primeiro a entrar, primeiro a sair)
    const result = await query.orderBy(asc(batches.fifoPosition), asc(batches.createdAt));
    return result;
  }

  /**
   * Obter lote por ID
   */
  async getBatch(id: string): Promise<Batch | null> {
    const result = await db
      .select()
      .from(batches)
      .where(eq(batches.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Obter lote por número do lote
   */
  async getBatchByNumber(batchNumber: string): Promise<Batch | null> {
    const result = await db
      .select()
      .from(batches)
      .where(eq(batches.batchNumber, batchNumber))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Criar novo lote
   */
  async createBatch(data: InsertBatch): Promise<Batch> {
    // Calcular posição FIFO baseada na data de fabricação
    const fifoPosition = await this.calculateFifoPosition(data.productId, data.warehouseId, data.manufacturingDate);
    
    const batchData = {
      ...data,
      fifoPosition,
      remainingQuantity: data.remainingQuantity || data.quantity,
    };

    const result = await db.insert(batches).values(batchData);
    const insertedId = result[0].insertId;
    
    const newBatch = await this.getBatch(insertedId.toString());
    if (!newBatch) {
      throw new Error('Erro ao criar lote');
    }
    
    return newBatch;
  }

  /**
   * Atualizar lote
   */
  async updateBatch(id: string, data: Partial<InsertBatch>): Promise<Batch | null> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await db.update(batches).set(updateData).where(eq(batches.id, id));
    return this.getBatch(id);
  }

  /**
   * Deletar lote
   */
  async deleteBatch(id: string): Promise<void> {
    await db.delete(batches).where(eq(batches.id, id));
  }

  /**
   * Obter lotes por produto
   */
  async getBatchesByProduct(productId: string): Promise<Batch[]> {
    return this.getBatches({ productId });
  }

  /**
   * Obter lotes por armazém
   */
  async getBatchesByWarehouse(warehouseId: string): Promise<Batch[]> {
    return this.getBatches({ warehouseId });
  }

  /**
   * Obter produtos que expiram em X dias
   */
  async getExpiringProducts(daysAhead: number, warehouseId?: string): Promise<Batch[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);

    const conditions = [
      lte(batches.expiryDate, targetDate),
      eq(batches.status, 'active')
    ];

    if (warehouseId) {
      conditions.push(eq(batches.warehouseId, warehouseId));
    }

    return await db
      .select()
      .from(batches)
      .where(and(...conditions))
      .orderBy(asc(batches.expiryDate));
  }

  /**
   * Obter produtos já expirados
   */
  async getExpiredProducts(warehouseId?: string): Promise<Batch[]> {
    const now = new Date();

    const conditions = [
      lte(batches.expiryDate, now),
      eq(batches.status, 'active')
    ];

    if (warehouseId) {
      conditions.push(eq(batches.warehouseId, warehouseId));
    }

    return await db
      .select()
      .from(batches)
      .where(and(...conditions))
      .orderBy(asc(batches.expiryDate));
  }

  /**
   * Obter alertas de expiração para um lote específico
   */
  async getBatchExpiryAlerts(batchId: string): Promise<Batch[]> {
    const batch = await this.getBatch(batchId);
    if (!batch) {
      return [];
    }

    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + 7); // Alerta 7 dias antes

    // Se o lote expira em 7 dias ou menos, retorna como alerta
    if (batch.expiryDate && batch.expiryDate <= warningDate) {
      return [batch];
    }

    return [];
  }

  /**
   * Estender data de validade de lotes
   */
  async extendBatchExpiry(batchIds: string[], newExpiryDate: Date): Promise<Batch[]> {
    for (const batchId of batchIds) {
      await db
        .update(batches)
        .set({ 
          expiryDate: newExpiryDate,
          updatedAt: new Date()
        })
        .where(eq(batches.id, batchId));
    }

    // Retornar lotes atualizados
    const updatedBatches = [];
    for (const batchId of batchIds) {
      const batch = await this.getBatch(batchId);
      if (batch) {
        updatedBatches.push(batch);
      }
    }

    return updatedBatches;
  }

  /**
   * Obter histórico de um lote
   */
  async getBatchHistory(batchNumber: string): Promise<any[]> {
    // Esta funcionalidade requereria uma tabela de auditoria/histórico
    // Por agora, retornamos informações básicas do lote
    const batch = await this.getBatchByNumber(batchNumber);
    if (!batch) {
      return [];
    }

    return [
      {
        action: 'created',
        timestamp: batch.createdAt,
        details: `Lote ${batchNumber} criado`,
      },
      {
        action: 'updated',
        timestamp: batch.updatedAt,
        details: `Lote ${batchNumber} atualizado`,
      },
    ];
  }

  /**
   * Obter localização de um lote
   */
  async getBatchLocation(batchNumber: string): Promise<{ location: string | null; warehouse: string } | null> {
    const result = await db
      .select({
        location: batches.location,
        warehouseName: warehouses.name,
      })
      .from(batches)
      .leftJoin(warehouses, eq(batches.warehouseId, warehouses.id))
      .where(eq(batches.batchNumber, batchNumber))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    return {
      location: result[0].location,
      warehouse: result[0].warehouseName || 'Desconhecido',
    };
  }

  /**
   * Verificar se um lote existe
   */
  async batchExists(batchNumber: string): Promise<boolean> {
    const result = await db
      .select({ id: batches.id })
      .from(batches)
      .where(eq(batches.batchNumber, batchNumber))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Calcular posição FIFO para um novo lote
   */
  private async calculateFifoPosition(productId: string, warehouseId: string, manufacturingDate: Date): Promise<number> {
    // Obter o maior número de posição FIFO para o produto no armazém
    const result = await db
      .select({ maxPosition: sql<number>`MAX(${batches.fifoPosition})` })
      .from(batches)
      .where(
        and(
          eq(batches.productId, productId),
          eq(batches.warehouseId, warehouseId)
        )
      );

    const maxPosition = result[0]?.maxPosition || 0;
    return maxPosition + 1;
  }

  /**
   * Atualizar status de qualidade de um lote
   */
  async updateBatchQuality(id: string, qualityData: {
    qualityStatus: 'pending' | 'approved' | 'rejected' | 'quarantine';
    notes?: string;
  }): Promise<Batch | null> {
    await db
      .update(batches)
      .set({
        qualityStatus: qualityData.qualityStatus,
        notes: qualityData.notes,
        updatedAt: new Date(),
      })
      .where(eq(batches.id, id));

    return this.getBatch(id);
  }

  /**
   * Adicionar produtos a um lote (atualizar quantidade)
   */
  async addProductsToBatch(batchId: string, quantity: number): Promise<Batch | null> {
    const batch = await this.getBatch(batchId);
    if (!batch) {
      throw new Error('Lote não encontrado');
    }

    const newQuantity = batch.quantity + quantity;
    const newRemainingQuantity = batch.remainingQuantity + quantity;

    await db
      .update(batches)
      .set({
        quantity: newQuantity,
        remainingQuantity: newRemainingQuantity,
        updatedAt: new Date(),
      })
      .where(eq(batches.id, batchId));

    return this.getBatch(batchId);
  }

  /**
   * Remover produtos de um lote (reduzir quantidade)
   */
  async removeProductFromBatch(batchId: string, quantity: number): Promise<Batch | null> {
    const batch = await this.getBatch(batchId);
    if (!batch) {
      throw new Error('Lote não encontrado');
    }

    if (batch.remainingQuantity < quantity) {
      throw new Error('Quantidade insuficiente no lote');
    }

    const newRemainingQuantity = batch.remainingQuantity - quantity;

    await db
      .update(batches)
      .set({
        remainingQuantity: newRemainingQuantity,
        updatedAt: new Date(),
      })
      .where(eq(batches.id, batchId));

    return this.getBatch(batchId);
  }
}