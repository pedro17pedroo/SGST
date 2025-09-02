import { CRDTOperation } from '@shared/offline-types';

interface DeviceStatus {
  deviceId: string;
  lastSync: number;
  operationCount: number;
  conflictCount: number;
}

export class OfflineSyncModel {
  // Simulação de armazenamento para operações sincronizadas
  private static syncedOperations: Map<string, CRDTOperation[]> = new Map();
  private static deviceStatus: Map<string, DeviceStatus> = new Map();
  private static conflicts: Map<string, any> = new Map();

  static async processOperations(
    operations: CRDTOperation[], 
    deviceId: string
  ): Promise<Array<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }>> {
    const results = [];

    for (const operation of operations) {
      try {
        const result = await this.processOperation(operation, deviceId);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Atualizar status do dispositivo
    await this.updateDeviceStatus(deviceId, operations.length, results);

    return results;
  }

  private static async processOperation(
    operation: CRDTOperation,
    deviceId: string
  ): Promise<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }> {
    
    // Verificar se existe operação conflitante
    const existingOperations = this.syncedOperations.get(operation.entityId) || [];
    const conflictingOp = existingOperations.find(op => 
      op.entityId === operation.entityId && 
      op.deviceId !== operation.deviceId &&
      Math.abs(op.timestamp - operation.timestamp) < 60000 // 60 segundos de janela para conflito
    );

    if (conflictingOp) {
      // Detectar conflito
      console.log(`⚠️ Conflito detectado para entidade ${operation.entityId}`);
      
      const conflictData = {
        localOperation: operation,
        remoteOperation: conflictingOp,
        conflictType: this.getConflictType(operation, conflictingOp)
      };

      this.conflicts.set(operation.id, conflictData);

      return {
        success: false,
        conflict: true,
        conflictData
      };
    }

    // Aplicar operação baseada no tipo
    const success = await this.applyOperation(operation);

    if (success) {
      // Armazenar operação sincronizada
      const ops = this.syncedOperations.get(operation.entityId) || [];
      ops.push(operation);
      this.syncedOperations.set(operation.entityId, ops);

      console.log(`✅ Operação ${operation.type} aplicada para ${operation.entity}:${operation.entityId}`);
    }

    return { success };
  }

  private static getConflictType(op1: CRDTOperation, op2: CRDTOperation): string {
    if (op1.type === 'delete' && op2.type === 'update') return 'delete_update';
    if (op1.type === 'update' && op2.type === 'delete') return 'update_delete';
    if (op1.type === 'create' && op2.type === 'create') return 'duplicate_create';
    return 'concurrent_update';
  }

  private static async applyOperation(operation: CRDTOperation): Promise<boolean> {
    try {
      // Aqui integraria com os models existentes baseado na entidade
      switch (operation.entity) {
        case 'products':
          return await this.applyProductOperation(operation);
        case 'inventory':
          return await this.applyInventoryOperation(operation);
        case 'orders':
          return await this.applyOrderOperation(operation);
        case 'shipments':
          return await this.applyShipmentOperation(operation);
        default:
          console.log(`⚠️ Entidade não suportada: ${operation.entity}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao aplicar operação ${operation.id}:`, error);
      return false;
    }
  }

  private static async applyProductOperation(operation: CRDTOperation): Promise<boolean> {
    // Simulação - integraria com ProductModel real
    console.log(`🔄 Aplicando operação ${operation.type} em produto ${operation.entityId}`);
    
    // Aqui faria a operação real no banco de dados
    // Exemplo: ProductModel.create/update/delete(operation.data)
    
    return true;
  }

  private static async applyInventoryOperation(operation: CRDTOperation): Promise<boolean> {
    console.log(`📦 Aplicando operação ${operation.type} em inventário ${operation.entityId}`);
    
    // Integraria com InventoryModel real
    // Operações críticas como movimentos de stock precisam de validação extra
    
    return true;
  }

  private static async applyOrderOperation(operation: CRDTOperation): Promise<boolean> {
    console.log(`📋 Aplicando operação ${operation.type} em encomenda ${operation.entityId}`);
    
    // Integraria com OrderModel real
    
    return true;
  }

  private static async applyShipmentOperation(operation: CRDTOperation): Promise<boolean> {
    console.log(`🚚 Aplicando operação ${operation.type} em envio ${operation.entityId}`);
    
    // Integraria com ShipmentModel real
    
    return true;
  }

  private static async updateDeviceStatus(
    deviceId: string, 
    operationCount: number, 
    results: any[]
  ): Promise<void> {
    const currentStatus = this.deviceStatus.get(deviceId) || {
      deviceId,
      lastSync: 0,
      operationCount: 0,
      conflictCount: 0
    };

    const conflictCount = results.filter(r => r.conflict).length;

    this.deviceStatus.set(deviceId, {
      ...currentStatus,
      lastSync: Date.now(),
      operationCount: currentStatus.operationCount + operationCount,
      conflictCount: currentStatus.conflictCount + conflictCount
    });
  }

  static async getDeviceStatus(deviceId: string): Promise<DeviceStatus | null> {
    return this.deviceStatus.get(deviceId) || null;
  }

  static async resolveConflict(
    operationId: string, 
    resolution: 'local_wins' | 'remote_wins', 
    deviceId: string
  ): Promise<boolean> {
    const conflict = this.conflicts.get(operationId);
    
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    console.log(`🔧 Resolvendo conflito ${operationId} com resolução: ${resolution}`);

    if (resolution === 'local_wins') {
      // Aplicar operação local
      const success = await this.applyOperation(conflict.localOperation);
      if (success) {
        this.conflicts.delete(operationId);
      }
      return success;
    } else {
      // Manter operação remota (já aplicada)
      this.conflicts.delete(operationId);
      return true;
    }
  }

  // Métodos utilitários para limpeza e manutenção
  static getStats(): {
    totalOperations: number;
    activeDevices: number;
    pendingConflicts: number;
  } {
    const totalOperations = Array.from(this.syncedOperations.values())
      .reduce((total, ops) => total + ops.length, 0);
    
    return {
      totalOperations,
      activeDevices: this.deviceStatus.size,
      pendingConflicts: this.conflicts.size
    };
  }

  static clearOldOperations(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - olderThanMs;
    let removedCount = 0;

    for (const [entityId, operations] of Array.from(this.syncedOperations.entries())) {
      const filtered = operations.filter((op: CRDTOperation) => op.timestamp > cutoff);
      removedCount += operations.length - filtered.length;
      
      if (filtered.length === 0) {
        this.syncedOperations.delete(entityId);
      } else {
        this.syncedOperations.set(entityId, filtered);
      }
    }

    console.log(`🧹 Limpeza: removidas ${removedCount} operações antigas`);
    return removedCount;
  }
}