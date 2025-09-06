/**
 * Hook para gestão de contagens de inventário
 * Centraliza operações de contagens físicas e auditoria de estoque
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiServices } from '../../services/api.service'; // Removed unused import
import type { QueryParams, ApiResponse } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';

// Tipos para contagens de inventário
export interface InventoryCount {
  id: string;
  name: string;
  warehouseId: string;
  warehouseName: string;
  type: 'full' | 'cycle' | 'spot';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  assignedTo: string[];
  items: InventoryCountItem[];
  discrepancies: number;
  accuracy: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface InventoryCountItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  location: string;
  expectedQuantity: number;
  countedQuantity?: number;
  discrepancy?: number;
  status: 'pending' | 'counted' | 'verified';
  countedBy?: string;
  countedAt?: string;
  notes?: string;
}

export interface InventoryCountFormData {
  name: string;
  warehouseId: string;
  type: 'full' | 'cycle' | 'spot';
  scheduledDate: string;
  assignedTo: string[];
  notes?: string;
  productIds?: string[]; // Para contagens específicas
  locations?: string[]; // Para contagens por localização
}

export interface CountItemUpdate {
  itemId: string;
  countedQuantity: number;
  notes?: string;
}

// Chaves de query para cache
export const INVENTORY_COUNTS_QUERY_KEYS = {
  all: ['inventory-counts'] as const,
  lists: () => [...INVENTORY_COUNTS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: QueryParams) => [...INVENTORY_COUNTS_QUERY_KEYS.lists(), params] as const,
  details: () => [...INVENTORY_COUNTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...INVENTORY_COUNTS_QUERY_KEYS.details(), id] as const,
  warehouses: () => ['warehouses'] as const,
  users: () => ['users'] as const,
};

/**
 * Hook para listar contagens de inventário
 */
export function useInventoryCounts(params?: QueryParams) {
  const { toast } = useToast();

  return useQuery<ApiResponse<InventoryCount[]>, Error>({
    queryKey: INVENTORY_COUNTS_QUERY_KEYS.list(params),
    queryFn: async () => {
      // Simular dados de contagens
      const counts: InventoryCount[] = [
        {
          id: 'count-1',
          name: 'Contagem Mensal - Janeiro 2024',
          warehouseId: 'warehouse-1',
          warehouseName: 'Armazém Principal',
          type: 'full',
          status: 'completed',
          scheduledDate: '2024-01-15T09:00:00Z',
          startedAt: '2024-01-15T09:15:00Z',
          completedAt: '2024-01-15T17:30:00Z',
          assignedTo: ['user-1', 'user-2', 'user-3'],
          items: [],
          discrepancies: 12,
          accuracy: 98.5,
          notes: 'Contagem completa realizada com sucesso',
          createdBy: 'user-admin',
          createdAt: '2024-01-10T10:00:00Z',
        },
        {
          id: 'count-2',
          name: 'Contagem Cíclica - Zona A',
          warehouseId: 'warehouse-1',
          warehouseName: 'Armazém Principal',
          type: 'cycle',
          status: 'in_progress',
          scheduledDate: '2024-01-20T14:00:00Z',
          startedAt: '2024-01-20T14:05:00Z',
          assignedTo: ['user-2'],
          items: [],
          discrepancies: 0,
          accuracy: 0,
          createdBy: 'user-admin',
          createdAt: '2024-01-18T11:00:00Z',
        },
      ];

      return {
        data: counts,
        success: true,
        message: 'Contagens carregadas com sucesso',
      };
    },
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar contagens',
          description: 'Não foi possível carregar as contagens de inventário.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para obter detalhes de uma contagem específica
 */
export function useInventoryCount(id: string) {
  const { toast } = useToast();

  return useQuery<ApiResponse<InventoryCount>, Error>({
    queryKey: INVENTORY_COUNTS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      // Simular dados detalhados da contagem
      const count: InventoryCount = {
        id,
        name: 'Contagem Mensal - Janeiro 2024',
        warehouseId: 'warehouse-1',
        warehouseName: 'Armazém Principal',
        type: 'full',
        status: 'in_progress',
        scheduledDate: '2024-01-15T09:00:00Z',
        startedAt: '2024-01-15T09:15:00Z',
        assignedTo: ['user-1', 'user-2'],
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            productName: 'Produto A',
            sku: 'SKU-001',
            location: 'A-01-01',
            expectedQuantity: 100,
            countedQuantity: 98,
            discrepancy: -2,
            status: 'counted',
            countedBy: 'user-1',
            countedAt: '2024-01-15T10:30:00Z',
          },
          {
            id: 'item-2',
            productId: 'prod-2',
            productName: 'Produto B',
            sku: 'SKU-002',
            location: 'A-01-02',
            expectedQuantity: 50,
            status: 'pending',
          },
        ],
        discrepancies: 1,
        accuracy: 99.0,
        createdBy: 'user-admin',
        createdAt: '2024-01-10T10:00:00Z',
      };

      return {
        data: count,
        success: true,
        message: 'Contagem carregada com sucesso',
      };
    },
    enabled: !!id,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar contagem',
          description: 'Não foi possível carregar os detalhes da contagem.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para criar nova contagem de inventário
 */
export function useCreateInventoryCount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<InventoryCount>, Error, InventoryCountFormData>({
    mutationFn: async (countData) => {
      // Simular criação de contagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCount: InventoryCount = {
        id: `count-${Date.now()}`,
        name: countData.name,
        warehouseId: countData.warehouseId,
        warehouseName: 'Armazém Selecionado',
        type: countData.type,
        status: 'planned',
        scheduledDate: countData.scheduledDate,
        assignedTo: countData.assignedTo,
        items: [],
        discrepancies: 0,
        accuracy: 0,
        notes: countData.notes,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
      };
      
      return {
        data: newCount,
        success: true,
        message: 'Contagem criada com sucesso',
      };
    },
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: INVENTORY_COUNTS_QUERY_KEYS.lists() });
      
      toast({
        title: 'Contagem criada',
        description: `${response.data.name} foi criada com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar contagem',
        description: error.message || 'Não foi possível criar a contagem.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para iniciar contagem
 */
export function useStartInventoryCount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<InventoryCount>, Error, string>({
    mutationFn: async () => {
      // Simular início da contagem
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: {} as InventoryCount,
        success: true,
        message: 'Contagem iniciada com sucesso',
      };
    },
    onSuccess: (_, countId) => {
      // Atualizar cache específico
      queryClient.invalidateQueries({ 
        queryKey: INVENTORY_COUNTS_QUERY_KEYS.detail(countId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: INVENTORY_COUNTS_QUERY_KEYS.lists() 
      });
      
      toast({
        title: 'Contagem iniciada',
        description: 'A contagem foi iniciada com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao iniciar contagem',
        description: error.message || 'Não foi possível iniciar a contagem.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar item da contagem
 */
export function useUpdateCountItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<InventoryCountItem>, Error, { countId: string; update: CountItemUpdate }>({
    mutationFn: async () => {
      // Simular atualização do item
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        data: {} as InventoryCountItem,
        success: true,
        message: 'Item atualizado com sucesso',
      };
    },
    onSuccess: (_, { countId }) => {
      // Atualizar cache da contagem
      queryClient.invalidateQueries({ 
        queryKey: INVENTORY_COUNTS_QUERY_KEYS.detail(countId) 
      });
      
      toast({
        title: 'Item atualizado',
        description: 'A contagem do item foi registrada.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar item',
        description: error.message || 'Não foi possível atualizar o item.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para finalizar contagem
 */
export function useCompleteInventoryCount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<InventoryCount>, Error, string>({
    mutationFn: async () => {
      // Simular finalização da contagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        data: {} as InventoryCount,
        success: true,
        message: 'Contagem finalizada com sucesso',
      };
    },
    onSuccess: (_, countId) => {
      // Atualizar caches
      queryClient.invalidateQueries({ 
        queryKey: INVENTORY_COUNTS_QUERY_KEYS.detail(countId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: INVENTORY_COUNTS_QUERY_KEYS.lists() 
      });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Contagem finalizada',
        description: 'A contagem foi finalizada e o inventário foi atualizado.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao finalizar contagem',
        description: error.message || 'Não foi possível finalizar a contagem.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para obter armazéns disponíveis
 */
export function useWarehousesForCounts() {
  const { toast } = useToast();

  return useQuery<any[], Error>({
    queryKey: INVENTORY_COUNTS_QUERY_KEYS.warehouses(),
    queryFn: async () => {
      // Simular dados de armazéns
      return [
        { id: 'warehouse-1', name: 'Armazém Principal' },
        { id: 'warehouse-2', name: 'Centro de Distribuição' },
      ];
    },
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar armazéns',
          description: 'Não foi possível carregar a lista de armazéns.',
          variant: 'destructive',
        });
      },
    },
  });
}