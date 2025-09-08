import { useEffect, useCallback, useRef } from 'react';
import { useGlobalEvents, type GlobalEvent, type EventListener } from '../lib/global-state-sync';
import { useQueryClient } from '@tanstack/react-query';

// Hook para sincronização automática de estado
export function useGlobalStateSync() {
  const { syncContexts, invalidateCache, invalidateAllCache, getStats } = useGlobalEvents();
  const queryClient = useQueryClient();

  // Sincronizar todos os contextos
  const syncAll = useCallback(() => {
    syncContexts();
  }, [syncContexts]);

  // Invalidar cache específico
  const invalidateQuery = useCallback((queryKey: string[]) => {
    invalidateCache(queryKey);
  }, [invalidateCache]);

  // Invalidar todo o cache
  const invalidateAll = useCallback(() => {
    invalidateAllCache();
  }, [invalidateAllCache]);

  // Refetch de queries específicas
  const refetchQuery = useCallback((queryKey: string[]) => {
    queryClient.refetchQueries({ queryKey });
  }, [queryClient]);

  // Refetch de todas as queries
  const refetchAll = useCallback(() => {
    queryClient.refetchQueries();
  }, [queryClient]);

  return {
    syncAll,
    invalidateQuery,
    invalidateAll,
    refetchQuery,
    refetchAll,
    getStats
  };
}

// Hook para escutar eventos globais específicos
export function useGlobalEventListener<T extends GlobalEvent>(
  eventType: T['type'] | '*',
  callback: EventListener<T>,
  deps: React.DependencyList = []
) {
  const { on } = useGlobalEvents();
  const callbackRef = useRef(callback);

  // Atualizar callback ref quando deps mudarem
  useEffect(() => {
    callbackRef.current = callback;
  }, deps);

  useEffect(() => {
    const wrappedCallback: EventListener<T> = (event) => {
      callbackRef.current(event);
    };

    const unsubscribe = on(eventType, wrappedCallback);
    return unsubscribe;
  }, [eventType, on]);
}

// Hook para escutar mudanças de dados específicas
export function useDataSyncListener(
  entity: string,
  callback: (action: 'create' | 'update' | 'delete' | 'refresh', data?: any) => void,
  deps: React.DependencyList = []
) {
  useGlobalEventListener(
    'data_sync',
    (event) => {
      if (event.type === 'data_sync' && 
          ('entity' in event.payload) &&
          (event.payload.entity === entity || event.payload.entity === 'all')) {
        callback(event.payload.action, event.payload.data);
      }
    },
    deps
  );
}

// Hook para escutar mudanças de módulos
export function useModuleChangeListener(
  callback: (moduleId: string, enabled: boolean, permissions?: string[]) => void,
  deps: React.DependencyList = []
) {
  useGlobalEventListener(
    'module_change',
    (event) => {
      if (event.type === 'module_change' && 'moduleId' in event.payload) {
        callback(event.payload.moduleId, event.payload.enabled, event.payload.permissions);
      }
    },
    deps
  );
}

// Hook para escutar mudanças de permissões
export function usePermissionChangeListener(
  callback: (userId: string, permissions: string[]) => void,
  deps: React.DependencyList = []
) {
  useGlobalEventListener(
    'permission_change',
    (event) => {
      if (event.type === 'permission_change' && 'userId' in event.payload) {
        callback(event.payload.userId, event.payload.permissions);
      }
    },
    deps
  );
}

// Hook para escutar mudanças de estado de contextos
export function useStateChangeListener(
  context: 'auth' | 'modules' | 'permissions' | 'data' | '*',
  callback: (action: string, data: any, previousData?: any) => void,
  deps: React.DependencyList = []
) {
  useGlobalEventListener(
    'state_change',
    (event) => {
      if (event.type === 'state_change' && 
          'context' in event.payload &&
          (context === '*' || event.payload.context === context)) {
        callback(event.payload.action, event.payload.data, event.payload.previousData);
      }
    },
    deps
  );
}

// Hook para monitorar performance do sistema de sincronização
export function useGlobalStateStats() {
  const { getStats } = useGlobalEvents();
  
  return {
    getStats,
    // Função para obter estatísticas formatadas
    getFormattedStats: useCallback(() => {
      const stats = getStats();
      return {
        ...stats,
        totalListeners: Object.values(stats.activeListeners).reduce((sum: number, count: unknown) => sum + (count as number), 0),
        recentEventTypes: stats.recentEvents.map(event => event.type),
        lastEventTime: stats.recentEvents.length > 0 
          ? new Date(stats.recentEvents[stats.recentEvents.length - 1].timestamp).toLocaleString()
          : 'Nenhum evento'
      };
    }, [getStats])
  };
}

// Hook para debug do sistema de sincronização
export function useGlobalStateDebug() {
  const { getHistory, getStats } = useGlobalEvents();
  
  return {
    // Obter histórico completo
    getFullHistory: () => getHistory(),
    
    // Obter eventos por tipo
    getEventsByType: (eventType: string) => getHistory(eventType),
    
    // Obter eventos recentes
    getRecentEvents: (limit: number = 10) => getHistory(undefined, limit),
    
    // Obter estatísticas detalhadas
    getDetailedStats: () => {
      const stats = getStats();
      const history = getHistory();
      
      const eventTypeCounts = history.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const sourceCounts = history.reduce((acc, event) => {
        acc[event.source] = (acc[event.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        ...stats,
        eventTypeCounts,
        sourceCounts,
        averageEventsPerMinute: history.length > 0 
          ? (history.length / ((Date.now() - history[0].timestamp) / 60000)) || 0
          : 0
      };
    },
    
    // Log de debug formatado
    logDebugInfo: () => {
      console.group('🔄 Global State Sync Debug');
      
      console.groupEnd();
    }
  };
}