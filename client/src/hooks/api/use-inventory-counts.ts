/**
 * Hook para gestão de contagens de inventário
 * Centraliza operações de contagens físicas e auditoria de estoque
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiServices } from '../../services/api.service';
import type { QueryParams, ApiResponse, PaginatedResponse } from '../../services/api.service';
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

  return useQuery<PaginatedResponse<InventoryCount>, Error>({
    queryKey: INVENTORY_COUNTS_QUERY_KEYS.list(params),
    queryFn: async () => {
      try {
        const response = await apiServices.inventoryCounts.getInventoryCounts(params);
        return response;
      } catch (error: any) {
        console.error('Erro ao carregar contagens de inventário:', error);
        toast({
          title: 'Erro ao carregar contagens',
          description: error.message || 'Não foi possível carregar as contagens de inventário.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
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
      try {
        const response = await apiServices.inventoryCounts.getInventoryCount(id);
        return response;
      } catch (error: any) {
        console.error('Erro ao carregar detalhes da contagem:', error);
        toast({
          title: 'Erro ao carregar contagem',
          description: error.message || 'Não foi possível carregar os detalhes da contagem.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!id,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
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
      try {
        const response = await apiServices.inventoryCounts.createInventoryCount(countData);
        return response;
      } catch (error: any) {
        console.error('Erro ao criar contagem:', error);
        throw error;
      }
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
    mutationFn: async (countId) => {
      try {
        const response = await apiServices.inventoryCounts.startInventoryCount(countId);
        return response;
      } catch (error: any) {
        console.error('Erro ao iniciar contagem:', error);
        throw error;
      }
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
    mutationFn: async ({ countId, update }) => {
      try {
        const response = await apiServices.inventoryCounts.updateInventoryCountItem(countId, update.itemId, {
          countedQuantity: update.countedQuantity,
          notes: update.notes
        });
        return response;
      } catch (error: any) {
        console.error('Erro ao atualizar item da contagem:', error);
        throw error;
      }
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
    mutationFn: async (countId) => {
      try {
        const response = await apiServices.inventoryCounts.completeInventoryCount(countId);
        return response;
      } catch (error: any) {
        console.error('Erro ao finalizar contagem:', error);
        throw error;
      }
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