// Tipos para sistema Offline-First com CRDTs e sincronização
export interface CRDTOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: any;
  timestamp: number;
  deviceId: string;
  version: number;
  vectorClock: Record<string, number>;
}

export interface SyncEvent {
  id: string;
  operation: CRDTOperation;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastRetry?: number;
  error?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface OfflineState {
  isOnline: boolean;
  lastSync: number;
  pendingOperations: SyncEvent[];
  conflictResolution: ConflictResolution[];
  syncInProgress: boolean;
  deviceId: string;
}

export interface ConflictResolution {
  operationId: string;
  conflictType: 'concurrent_update' | 'delete_update' | 'create_duplicate';
  localVersion: CRDTOperation;
  remoteVersion: CRDTOperation;
  resolution: 'local_wins' | 'remote_wins' | 'merge' | 'manual';
  resolvedAt?: number;
}

export interface SyncConfig {
  maxRetries: number;
  retryDelayMs: number;
  syncIntervalMs: number;
  batchSize: number;
  priorityWeights: Record<string, number>;
  conflictResolutionStrategy: 'last_write_wins' | 'vector_clock' | 'manual';
}