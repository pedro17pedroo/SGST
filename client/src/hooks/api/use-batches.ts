/**
 * Hook para gestão de lotes
 * Centraliza todas as operações relacionadas com lotes e controlo de qualidade
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';
import type { QueryParams, ApiResponse } from '../../services/api.service';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para lotes
export interface Batch {
  id: string;
  batchNumber: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  remainingQuantity: number;
  supplierBatchRef?: string;
  qualityStatus: 'pending' | 'approved' | 'rejected' | 'quarantine';
  status: 'active' | 'consumed' | 'expired' | 'recalled';
  notes?: string;
  fifoPosition: number;
  daysToExpiry: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchFormData {
  batchNumber: string;
  productId: string;
  warehouseId: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  supplierBatchRef?: string;
  qualityStatus: 'pending' | 'approved' | 'rejected' | 'quarantine';
  notes?: string;
}

// Chaves de consulta para cache
export const BATCHES_QUERY_KEYS = {
  all: ['batches'] as const,
  lists: () => [...BATCHES_QUERY_KEYS.all, 'list'] as const,
  list: (params?: QueryParams) => [...BATCHES_QUERY_KEYS.lists(), params] as const,
  details: () => [...BATCHES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BATCHES_QUERY_KEYS.details(), id] as const,
  expiring: () => [...BATCHES_QUERY_KEYS.all, 'expiring'] as const,
  byProduct: (productId: string) => [...BATCHES_QUERY_KEYS.all, 'product', productId] as const,
  byWarehouse: (warehouseId: string) => [...BATCHES_QUERY_KEYS.all, 'warehouse', warehouseId] as const,
} as const;

// Hook para listar lotes
export function useBatches(params?: QueryParams) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('inventory'));
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: BATCHES_QUERY_KEYS.list(params),
    queryFn: () => batchesService.getBatches(params),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para obter lote específico
export function useBatch(id: string) {
  return useQuery({
    queryKey: BATCHES_QUERY_KEYS.detail(id),
    queryFn: () => batchesService.getBatch(id),
    enabled: !!id,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
  });
}

// Hook para lotes próximos do vencimento
export function useExpiringBatches(days: number = 30) {
  return useQuery({
    queryKey: [...BATCHES_QUERY_KEYS.expiring(), days],
    queryFn: () => batchesService.getExpiringBatches(days),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
  });
}

// Hook para lotes por produto
export function useBatchesByProduct(productId: string) {
  return useQuery({
    queryKey: BATCHES_QUERY_KEYS.byProduct(productId),
    queryFn: () => batchesService.getBatchesByProduct(productId),
    enabled: !!productId,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
  });
}

// Hook para lotes por armazém
export function useBatchesByWarehouse(warehouseId: string) {
  return useQuery({
    queryKey: BATCHES_QUERY_KEYS.byWarehouse(warehouseId),
    queryFn: () => batchesService.getBatchesByWarehouse(warehouseId),
    enabled: !!warehouseId,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
  });
}

// Hook para criar lote
export function useCreateBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Batch>, Error, BatchFormData>({
    mutationFn: batchesService.createBatch,
    onSuccess: (response) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Lote criado',
        description: `Lote ${response.data.batchNumber} foi criado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar lote',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar lote
export function useUpdateBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Batch>, Error, { id: string; data: Partial<BatchFormData> }>({
    mutationFn: ({ id, data }) => batchesService.updateBatch(id, data),
    onSuccess: (response, variables) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        BATCHES_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // Invalidar listas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: 'Lote atualizado',
        description: `Lote ${response.data.batchNumber} foi atualizado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar lote',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar status de qualidade
export function useUpdateBatchQuality() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Batch>, Error, { id: string; qualityStatus: Batch['qualityStatus']; notes?: string }>({
    mutationFn: ({ id, qualityStatus, notes }) => batchesService.updateBatchQuality(id, { qualityStatus, notes }),
    onSuccess: (response, variables) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        BATCHES_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEYS.lists() });
      
      const statusText = {
        pending: 'pendente',
        approved: 'aprovado',
        rejected: 'rejeitado',
        quarantine: 'em quarentena'
      }[variables.qualityStatus];
      
      toast({
        title: 'Status de qualidade atualizado',
        description: `Lote ${response.data.batchNumber} marcado como ${statusText}.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para deletar lote
export function useDeleteBatch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: batchesService.deleteBatch,
    onSuccess: (_, id) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: BATCHES_QUERY_KEYS.detail(id) });
      
      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: BATCHES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: 'Lote removido',
        description: 'Lote foi removido com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover lote',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}