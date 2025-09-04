import { useState, useEffect } from 'react';
import { offlineManager } from '@/lib/offline-manager';
import { OfflineState } from '@shared/offline-types';

export function useOffline() {
  const [state, setState] = useState<OfflineState>(offlineManager.getState());

  useEffect(() => {
    const unsubscribe = offlineManager.subscribe(setState);
    return unsubscribe;
  }, []);

  const addOperation = (
    type: 'create' | 'update' | 'delete',
    entity: string,
    entityId: string,
    data: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ) => {
    return offlineManager.addOperation(type, entity, entityId, data, priority);
  };

  const triggerSync = () => {
    return offlineManager.triggerSync();
  };

  const resolveConflict = (operationId: string, resolution: 'local_wins' | 'remote_wins') => {
    return offlineManager.resolveConflictManually(operationId, resolution);
  };

  return {
    isOnline: state.isOnline,
    lastSync: state.lastSync,
    syncInProgress: state.syncInProgress,
    pendingCount: offlineManager.getPendingCount(),
    conflicts: offlineManager.getConflicts(),
    addOperation,
    triggerSync,
    resolveConflict
  };
}

// Hook específico para operações CRUD offline
export function useOfflineCRUD<T>(entity: string) {
  const offline = useOffline();

  const create = (data: T, priority?: 'low' | 'medium' | 'high' | 'critical') => {
    const id = Math.random().toString(36).substr(2, 9); // ID temporário
    return offline.addOperation('create', entity, id, data, priority);
  };

  const update = (id: string, data: Partial<T>, priority?: 'low' | 'medium' | 'high' | 'critical') => {
    return offline.addOperation('update', entity, id, data, priority);
  };

  const remove = (id: string, priority?: 'low' | 'medium' | 'high' | 'critical') => {
    return offline.addOperation('delete', entity, id, {}, priority);
  };

  return {
    ...offline,
    create,
    update,
    remove
  };
}