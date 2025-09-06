/**
 * Hook para gestão de fornecedores
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para fornecedores
interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SupplierFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
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
export const SUPPLIERS_QUERY_KEYS = {
  all: ['suppliers'] as const,
  lists: () => [...SUPPLIERS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...SUPPLIERS_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...SUPPLIERS_QUERY_KEYS.all, 'detail', id] as const,
};

// Hook para listar fornecedores
export function useSuppliers(params?: Record<string, any>) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('suppliers'));
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEYS.list(params),
    queryFn: () => suppliersService.getSuppliers(params),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para obter fornecedor específico
export function useSupplier(id: string) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('suppliers') && id);
  }, [user, isModuleEnabled, id]);

  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEYS.detail(id),
    queryFn: () => suppliersService.getSupplier(id),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para 404
      if (error?.status === 404) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para criar fornecedor
export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Supplier>, Error, SupplierFormData>({
    mutationFn: suppliersService.createSupplier,
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEYS.lists() });
      
      toast({
        title: 'Fornecedor criado',
        description: `${response.data.name} foi criado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar fornecedor',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar fornecedor
export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Supplier>, Error, { id: string; data: Partial<SupplierFormData> }>({
    mutationFn: ({ id, data }) => suppliersService.updateSupplier(id, data),
    onSuccess: (response, { id }) => {
      // Atualizar cache específico
      queryClient.setQueryData(SUPPLIERS_QUERY_KEYS.detail(id), response);
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEYS.lists() });
      
      toast({
        title: 'Fornecedor atualizado',
        description: `${response.data.name} foi atualizado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para deletar fornecedor
export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, string, { previousSupplier?: any }>({
    mutationFn: suppliersService.deleteSupplier,
    onMutate: async (supplierId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: SUPPLIERS_QUERY_KEYS.detail(supplierId) });
      
      // Obter dados para possível rollback
      const previousSupplier = queryClient.getQueryData(SUPPLIERS_QUERY_KEYS.detail(supplierId));
      
      return { previousSupplier };
    },
    onSuccess: (_, supplierId) => {
      // Remover do cache e invalidar listas
      queryClient.removeQueries({ queryKey: SUPPLIERS_QUERY_KEYS.detail(supplierId) });
      queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEYS.lists() });
      
      toast({
        title: 'Fornecedor removido',
        description: 'O fornecedor foi removido com sucesso.',
        variant: 'default',
      });
    },
    onError: (error, supplierId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousSupplier) {
        queryClient.setQueryData(SUPPLIERS_QUERY_KEYS.detail(supplierId), context.previousSupplier);
      }
      
      toast({
        title: 'Erro ao remover fornecedor',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}