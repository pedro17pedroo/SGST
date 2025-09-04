import { CRDTOperation, SyncEvent, OfflineState, ConflictResolution, SyncConfig } from '@shared/offline-types';
import { nanoid } from 'nanoid';

class OfflineManager {
  private state: OfflineState;
  private config: SyncConfig;
  private syncInterval: number | null = null;
  private listeners: Set<(state: OfflineState) => void> = new Set();

  constructor() {
    this.config = {
      maxRetries: 5,
      retryDelayMs: 2000,
      syncIntervalMs: 30000, // 30 segundos
      batchSize: 50,
      priorityWeights: { critical: 1, high: 2, medium: 3, low: 4 },
      conflictResolutionStrategy: 'vector_clock'
    };

    this.state = {
      isOnline: navigator.onLine,
      lastSync: 0,
      pendingOperations: this.loadPendingOperations(),
      conflictResolution: [],
      syncInProgress: false,
      deviceId: this.getOrCreateDeviceId()
    };

    this.setupNetworkListeners();
    this.startSyncLoop();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('sgst_device_id');
    if (!deviceId) {
      deviceId = nanoid();
      localStorage.setItem('sgst_device_id', deviceId);
    }
    return deviceId;
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.notifyListeners();
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.notifyListeners();
    });
  }

  private startSyncLoop() {
    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && !this.state.syncInProgress) {
        this.triggerSync();
      }
    }, this.config.syncIntervalMs);
  }

  // Adicionar operação CRDT para sincronização posterior
  addOperation(
    type: 'create' | 'update' | 'delete',
    entity: string,
    entityId: string,
    data: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): string {
    const operation: CRDTOperation = {
      id: nanoid(),
      type,
      entity,
      entityId,
      data,
      timestamp: Date.now(),
      deviceId: this.state.deviceId,
      version: this.getNextVersion(entityId),
      vectorClock: this.generateVectorClock()
    };

    const syncEvent: SyncEvent = {
      id: nanoid(),
      operation,
      status: 'pending',
      retryCount: 0,
      priority
    };

    this.state.pendingOperations.push(syncEvent);
    this.savePendingOperations();
    this.notifyListeners();

    // Tentar sincronizar imediatamente se estiver online
    if (this.state.isOnline && priority === 'critical') {
      this.triggerSync();
    }

    return operation.id;
  }

  private getNextVersion(entityId: string): number {
    const existingOps = this.state.pendingOperations
      .filter(op => op.operation.entityId === entityId)
      .map(op => op.operation.version);
    
    return existingOps.length > 0 ? Math.max(...existingOps) + 1 : 1;
  }

  private generateVectorClock(): Record<string, number> {
    // Implementação básica de vector clock
    const clock: Record<string, number> = {};
    clock[this.state.deviceId] = Date.now();
    return clock;
  }

  // Sincronização com retry inteligente
  async triggerSync(): Promise<void> {
    if (this.state.syncInProgress || !this.state.isOnline) {
      return;
    }

    this.state.syncInProgress = true;
    this.notifyListeners();

    try {
      const pendingOps = this.state.pendingOperations
        .filter(op => op.status === 'pending' || op.status === 'failed')
        .sort((a, b) => {
          // Prioridade primeiro, depois timestamp
          const priorityDiff = this.config.priorityWeights[a.priority] - this.config.priorityWeights[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.operation.timestamp - b.operation.timestamp;
        })
        .slice(0, this.config.batchSize);

      if (pendingOps.length === 0) {
        this.state.syncInProgress = false;
        this.notifyListeners();
        return;
      }

      // Sincronizar em lotes
      const results = await this.syncBatch(pendingOps);
      
      // Processar resultados
      for (let i = 0; i < pendingOps.length; i++) {
        const op = pendingOps[i];
        const result = results[i];

        if (result.success) {
          op.status = 'synced';
          this.removePendingOperation(op.id);
        } else if (result.conflict) {
          // Resolver conflito
          await this.handleConflict(op, result.conflictData);
        } else {
          // Falha na sincronização
          op.status = 'failed';
          op.retryCount++;
          op.lastRetry = Date.now();
          op.error = result.error;

          // Remover se exceder máximo de tentativas
          if (op.retryCount >= this.config.maxRetries) {
            this.removePendingOperation(op.id);
          }
        }
      }

      this.state.lastSync = Date.now();
      this.savePendingOperations();

    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      this.state.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async syncBatch(operations: SyncEvent[]): Promise<Array<{
    success: boolean;
    conflict?: boolean;
    conflictData?: any;
    error?: string;
  }>> {
    try {
      const response = await fetch('/api/offline-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operations: operations.map(op => op.operation),
          deviceId: this.state.deviceId
        })
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.results;

    } catch (error) {
      // Retornar falha para todas as operações
      return operations.map(() => ({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  private async handleConflict(localOp: SyncEvent, conflictData: any): Promise<void> {
    const conflict: ConflictResolution = {
      operationId: localOp.id,
      conflictType: this.determineConflictType(localOp.operation, conflictData.remoteOperation),
      localVersion: localOp.operation,
      remoteVersion: conflictData.remoteOperation,
      resolution: this.resolveConflict(localOp.operation, conflictData.remoteOperation)
    };

    if (conflict.resolution === 'manual') {
      // Adicionar à lista de conflitos para resolução manual
      this.state.conflictResolution.push(conflict);
    } else {
      // Resolução automática
      conflict.resolvedAt = Date.now();
      
      if (conflict.resolution === 'local_wins') {
        // Manter operação local, tentar sincronizar novamente
        localOp.status = 'pending';
        localOp.retryCount = 0;
      } else if (conflict.resolution === 'remote_wins') {
        // Aceitar versão remota, descartar local
        this.removePendingOperation(localOp.id);
      }
    }

    this.notifyListeners();
  }

  private determineConflictType(local: CRDTOperation, remote: CRDTOperation): ConflictResolution['conflictType'] {
    if (local.type === 'delete' && remote.type === 'update') {
      return 'delete_update';
    }
    if (local.type === 'create' && remote.type === 'create') {
      return 'create_duplicate';
    }
    return 'concurrent_update';
  }

  private resolveConflict(local: CRDTOperation, remote: CRDTOperation): ConflictResolution['resolution'] {
    switch (this.config.conflictResolutionStrategy) {
      case 'last_write_wins':
        return local.timestamp > remote.timestamp ? 'local_wins' : 'remote_wins';
      
      case 'vector_clock':
        return this.compareVectorClocks(local.vectorClock, remote.vectorClock);
      
      default:
        return 'manual';
    }
  }

  private compareVectorClocks(local: Record<string, number>, remote: Record<string, number>): ConflictResolution['resolution'] {
    const allDevices = new Set([...Object.keys(local), ...Object.keys(remote)]);
    let localGreater = false;
    let remoteGreater = false;

    for (const device of Array.from(allDevices)) {
      const localTime = local[device] || 0;
      const remoteTime = remote[device] || 0;

      if (localTime > remoteTime) localGreater = true;
      if (remoteTime > localTime) remoteGreater = true;
    }

    if (localGreater && !remoteGreater) return 'local_wins';
    if (remoteGreater && !localGreater) return 'remote_wins';
    return 'manual'; // Conflito real, precisa resolução manual
  }

  private removePendingOperation(operationId: string): void {
    this.state.pendingOperations = this.state.pendingOperations.filter(op => op.id !== operationId);
  }

  private loadPendingOperations(): SyncEvent[] {
    try {
      const stored = localStorage.getItem('sgst_pending_operations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private savePendingOperations(): void {
    localStorage.setItem('sgst_pending_operations', JSON.stringify(this.state.pendingOperations));
  }

  // API pública
  subscribe(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): OfflineState {
    return { ...this.state };
  }

  getPendingCount(): number {
    return this.state.pendingOperations.filter(op => op.status === 'pending' || op.status === 'failed').length;
  }

  getConflicts(): ConflictResolution[] {
    return this.state.conflictResolution.filter(c => !c.resolvedAt);
  }

  async resolveConflictManually(operationId: string, resolution: 'local_wins' | 'remote_wins'): Promise<void> {
    const conflict = this.state.conflictResolution.find(c => c.operationId === operationId);
    if (!conflict) return;

    conflict.resolution = resolution;
    conflict.resolvedAt = Date.now();

    const operation = this.state.pendingOperations.find(op => op.id === operationId);
    if (operation) {
      if (resolution === 'local_wins') {
        operation.status = 'pending';
        operation.retryCount = 0;
      } else {
        this.removePendingOperation(operationId);
      }
    }

    this.notifyListeners();
    this.triggerSync();
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.listeners.clear();
  }
}

export const offlineManager = new OfflineManager();