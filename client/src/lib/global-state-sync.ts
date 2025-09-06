import { queryClient } from './queryClient';
import { FrontendModuleManager } from '../config/modules';

// Tipos para eventos do sistema
export interface SystemEvent {
  type: string;
  payload: any;
  timestamp: number;
  source: string;
}

export interface StateChangeEvent extends SystemEvent {
  type: 'state_change';
  payload: {
    context: 'auth' | 'modules' | 'permissions' | 'data';
    action: string;
    data: any;
    previousData?: any;
  };
}

export interface DataSyncEvent extends SystemEvent {
  type: 'data_sync';
  payload: {
    entity: string;
    action: 'create' | 'update' | 'delete' | 'refresh';
    id?: string;
    data?: any;
  };
}

export interface ModuleChangeEvent extends SystemEvent {
  type: 'module_change';
  payload: {
    moduleId: string;
    enabled: boolean;
    permissions?: string[];
  };
}

export interface PermissionChangeEvent extends SystemEvent {
  type: 'permission_change';
  payload: {
    userId: string;
    permissions: string[];
    addedPermissions?: string[];
    removedPermissions?: string[];
  };
}

type GlobalEvent = StateChangeEvent | DataSyncEvent | ModuleChangeEvent | PermissionChangeEvent;

// Listener para eventos globais
type EventListener<T extends GlobalEvent = GlobalEvent> = (event: T) => void;

// Classe principal para gerenciamento de estado global
class GlobalStateManager {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventHistory: GlobalEvent[] = [];
  private maxHistorySize = 100;
  private isInitialized = false;

  // Inicializar o gerenciador
  initialize() {
    if (this.isInitialized) {
      return;
    }
    
    // Configurar listeners para mudanças no React Query
    this.setupQueryClientListeners();
    
    // Configurar listeners para mudanças de módulos
    this.setupModuleListeners();
    
    this.isInitialized = true;
  }

  // Configurar listeners do React Query
  private setupQueryClientListeners() {
    // Listener para mudanças no cache do React Query
    queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' || event.type === 'added') {
        this.emit({
          type: 'data_sync',
          payload: {
            entity: event.query.queryKey[0] as string,
            action: event.type === 'added' ? 'create' : 'update',
            data: event.query.state.data
          },
          timestamp: Date.now(),
          source: 'react-query'
        });
      }
    });

    // Listener para mudanças nas mutations
    queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.mutation.state.status === 'success') {
        const mutationKey = event.mutation.options.mutationKey;
        if (mutationKey && mutationKey.length > 0) {
          this.emit({
            type: 'data_sync',
            payload: {
              entity: mutationKey[0] as string,
              action: this.getMutationAction(mutationKey),
              data: event.mutation.state.data
            },
            timestamp: Date.now(),
            source: 'react-query-mutation'
          });
        }
      }
    });
  }

  // Configurar listeners para mudanças de módulos
  private setupModuleListeners() {
    // Listener para mudanças de módulos
    FrontendModuleManager.addModuleChangeListener(() => {
      this.emit({
        type: 'module_change',
        payload: {
          moduleId: 'all',
          enabled: true,
          permissions: []
        },
        timestamp: Date.now(),
        source: 'module-manager'
      });
    });

    // Listener para mudanças de permissões
    FrontendModuleManager.addPermissionChangeListener((permissions) => {
      this.emit({
        type: 'permission_change',
        payload: {
          userId: 'current',
          permissions
        },
        timestamp: Date.now(),
        source: 'module-manager'
      });
    });
  }

  // Determinar ação da mutation baseada na chave
  private getMutationAction(mutationKey: readonly unknown[]): 'create' | 'update' | 'delete' | 'refresh' {
    const keyStr = [...mutationKey].join('_').toLowerCase();
    if (keyStr.includes('create') || keyStr.includes('add')) return 'create';
    if (keyStr.includes('update') || keyStr.includes('edit')) return 'update';
    if (keyStr.includes('delete') || keyStr.includes('remove')) return 'delete';
    return 'refresh';
  }

  // Emitir evento global
  emit<T extends GlobalEvent>(event: T): void {
    // Adicionar ao histórico
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notificar listeners específicos do tipo
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Erro ao executar listener para evento ${event.type}:`, error);
        }
      });
    }

    // Notificar listeners globais
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Erro ao executar listener global:', error);
        }
      });
    }


  }

  // Adicionar listener para tipo específico ou todos os eventos
  on<T extends GlobalEvent>(eventType: T['type'] | '*', listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener as EventListener);
    
    // Retornar função para remover o listener
    return () => {
      const typeListeners = this.listeners.get(eventType);
      if (typeListeners) {
        typeListeners.delete(listener as EventListener);
        if (typeListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  // Remover listener
  off<T extends GlobalEvent>(eventType: T['type'] | '*', listener: EventListener<T>): void {
    const typeListeners = this.listeners.get(eventType);
    if (typeListeners) {
      typeListeners.delete(listener as EventListener);
      if (typeListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  // Obter histórico de eventos
  getEventHistory(eventType?: string, limit?: number): GlobalEvent[] {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(event => event.type === eventType);
    }
    
    if (limit) {
      events = events.slice(-limit);
    }
    
    return events;
  }

  // Limpar histórico
  clearHistory(): void {
    this.eventHistory = [];
  }

  // Sincronizar estado entre contextos
  syncContexts(): void {
    this.emit({
      type: 'state_change',
      payload: {
        context: 'data',
        action: 'sync_all',
        data: null
      },
      timestamp: Date.now(),
      source: 'global-state-manager'
    });
  }

  // Invalidar cache específico
  invalidateCache(queryKey: string[]): void {
    queryClient.invalidateQueries({ queryKey });
    
    this.emit({
      type: 'data_sync',
      payload: {
        entity: queryKey[0],
        action: 'refresh'
      },
      timestamp: Date.now(),
      source: 'cache-invalidation'
    });
  }

  // Invalidar todo o cache
  invalidateAllCache(): void {
    queryClient.invalidateQueries();
    
    this.emit({
      type: 'data_sync',
      payload: {
        entity: 'all',
        action: 'refresh'
      },
      timestamp: Date.now(),
      source: 'cache-invalidation'
    });
  }

  // Obter estatísticas do sistema
  getStats() {
    return {
      totalEvents: this.eventHistory.length,
      activeListeners: Array.from(this.listeners.entries()).reduce(
        (acc, [type, listeners]) => ({ ...acc, [type]: listeners.size }),
        {}
      ),
      recentEvents: this.getEventHistory(undefined, 10),
      isInitialized: this.isInitialized
    };
  }
}

// Instância singleton
export const globalStateManager = new GlobalStateManager();

// Hook para usar o sistema de eventos globais
export function useGlobalEvents() {
  return {
    emit: globalStateManager.emit.bind(globalStateManager),
    on: globalStateManager.on.bind(globalStateManager),
    off: globalStateManager.off.bind(globalStateManager),
    getHistory: globalStateManager.getEventHistory.bind(globalStateManager),
    syncContexts: globalStateManager.syncContexts.bind(globalStateManager),
    invalidateCache: globalStateManager.invalidateCache.bind(globalStateManager),
    invalidateAllCache: globalStateManager.invalidateAllCache.bind(globalStateManager),
    getStats: globalStateManager.getStats.bind(globalStateManager)
  };
}

// Função para inicializar o sistema globalmente
export function initializeGlobalStateSync() {
  globalStateManager.initialize();
}

// Exportar apenas os tipos que não foram declarados como interface
export type { GlobalEvent, EventListener };