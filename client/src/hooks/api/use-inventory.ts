/**
 * Hook para gestão de inventário
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para inventário
interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStock: number;
  maxStock: number;
  location?: string;
  lastUpdated: string;
}

// interface InventorySummary {
//   totalProducts: number;
//   totalQuantity: number;
//   lowStockItems: number;
//   outOfStockItems: number;
//   totalValue: number;
// }

interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  reference?: string;
  createdAt: string;
  createdBy: string;
}

interface InventoryUpdateData {
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  reference?: string;
}

// interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Chaves de query tipadas
export const INVENTORY_QUERY_KEYS = {
  all: ['inventory'] as const,
  lists: () => [...INVENTORY_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...INVENTORY_QUERY_KEYS.lists(), params] as const,
  summary: () => [...INVENTORY_QUERY_KEYS.all, 'summary'] as const,
  movements: (params?: Record<string, any>) => [...INVENTORY_QUERY_KEYS.all, 'movements', params] as const,
  detail: (productId: string, warehouseId: string) => [...INVENTORY_QUERY_KEYS.all, 'detail', productId, warehouseId] as const,
};

// Hook para listar inventário
export function useInventory(params?: Record<string, any>) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  // Calcular se pode carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.list(params),
    queryFn: () => inventoryService.getInventory(params),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook para obter resumo do inventário
export function useInventorySummary() {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  // Calcular se pode carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.summary(),
    queryFn: inventoryService.getInventorySummary,
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook para obter movimentos de inventário
export function useInventoryMovements(params?: Record<string, any>) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  // Calcular se pode carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.movements(params),
    queryFn: () => inventoryService.getInventoryMovements(params),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook para atualizar inventário
export function useUpdateInventory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<InventoryItem>, Error, InventoryUpdateData>({
    mutationFn: inventoryService.updateInventory,
    onSuccess: (response, variables) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        INVENTORY_QUERY_KEYS.detail(variables.productId, variables.warehouseId),
        response
      );
      
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.movements() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Inventário atualizado',
        description: `Estoque de ${response.data.productName} foi atualizado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar inventário',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para criar movimento de inventário
export function useCreateInventoryMovement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<InventoryMovement>, Error, {
    productId: string;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    reason: string;
    reference?: string;
  }>({
    mutationFn: inventoryService.createInventoryMovement,
    onSuccess: (_, variables) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.summary() });
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.movements() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      const actionText = variables.type === 'IN' ? 'entrada' : 
                        variables.type === 'OUT' ? 'saída' : 'ajuste';
      
      toast({
        title: 'Movimento registrado',
        description: `Movimento de ${actionText} registrado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar movimento',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}