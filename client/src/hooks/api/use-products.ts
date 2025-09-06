/**
 * Hook otimizado para gestão de produtos com React Query
 * Implementa boas práticas de cache, tratamento de erros e tipagem
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useApiMutationError, createRetryConfig } from '../use-api-error';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';
import type { QueryParams, ApiResponse, PaginatedResponse } from '../../services/api.service';

// Tipos específicos para produtos
export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  price: string;
  weight: string | null;
  categoryId: string | null;
  supplierId: string | null;
  minStockLevel: number | null;
  isActive: boolean;
  category?: {
    name: string;
  } | null;
  supplier?: {
    name: string;
  } | null;
}

export interface ProductFormData {
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: string;
  weight?: string;
  categoryId?: string;
  supplierId?: string;
  minStockLevel?: string;
}

// Chaves de query organizadas e tipadas
export const PRODUCTS_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCTS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: QueryParams) => [...PRODUCTS_QUERY_KEYS.lists(), params] as const,
  details: () => [...PRODUCTS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCTS_QUERY_KEYS.details(), id] as const,
};

// Hook principal para buscar produtos com cache inteligente
export function useProducts(params?: QueryParams) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();
  
  // Calcular se pode carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);
  
  return useQuery<PaginatedResponse<Product>, Error>({
    queryKey: PRODUCTS_QUERY_KEYS.list(params),
    queryFn: () => productsService.getProducts(params),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    ...createRetryConfig(3),
  });
}

// Hook para obter produto específico
export function useProduct(id: string) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  // Calcular se pode carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading && !!id;
  }, [isAuthenticated, isReady, isModulesLoading, id]);

  return useQuery<ApiResponse<Product>, Error>({
    queryKey: PRODUCTS_QUERY_KEYS.detail(id),
    queryFn: () => productsService.getProduct(id),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    refetchOnWindowFocus: false,
    ...createRetryConfig(3),
  });
}

// Hook para criar produto com feedback otimizado
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Criar Produto');

  return useMutation<ApiResponse<Product>, Error, ProductFormData>({
    mutationFn: productsService.createProduct,
    ...createRetryConfig(1), // Apenas 1 tentativa para operações de criação
    onSuccess: (data) => {
      // Invalidar cache de produtos e dashboard
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'topProducts'] });
      
      const successMessage = createSuccessMsg('create', 'Produto', data.data.name);
      handleSuccess(successMessage, 'Produto criado');
    },
    onError: (error) => {
      const errorTitle = createErrorTitle('create', 'produto');
      handleError(error, errorTitle);
    },
  });
}

// Hook para atualizar produto com otimização de cache
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Atualizar Produto');

  return useMutation<ApiResponse<Product>, Error, { id: string; data: ProductFormData }>({
    mutationFn: ({ id, data }) => productsService.updateProduct(id, data),
    ...createRetryConfig(1),
    onSuccess: (response, variables) => {
      // Atualizar cache específico com dados otimistas
      queryClient.setQueryData(
        PRODUCTS_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // Invalidar listas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      const successMessage = createSuccessMsg('update', 'Produto', response.data.name);
      handleSuccess(successMessage, 'Produto atualizado');
    },
    onError: (error) => {
      const errorTitle = createErrorTitle('update', 'produto');
      handleError(error, errorTitle);
    },
  });
}

// Hook para eliminar produto com confirmação
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Eliminar Produto');

  return useMutation<ApiResponse, Error, string, { previousProduct?: any }>({
    mutationFn: productsService.deleteProduct,
    ...createRetryConfig(1),
    onMutate: async (productId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEYS.detail(productId) });
      
      // Obter dados atuais para rollback
      const previousProduct = queryClient.getQueryData(PRODUCTS_QUERY_KEYS.detail(productId));
      
      return { previousProduct };
    },
    onSuccess: (_, productId) => {
      // Remover do cache e invalidar listas
      queryClient.removeQueries({ queryKey: PRODUCTS_QUERY_KEYS.detail(productId) });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      const successMessage = createSuccessMsg('delete', 'Produto');
      handleSuccess(successMessage, 'Produto eliminado');
    },
    onError: (error, productId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousProduct) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEYS.detail(productId), context.previousProduct);
      }
      
      const errorTitle = createErrorTitle('delete', 'produto');
      handleError(error, errorTitle);
    },
  });
}

// Hook para ativar produto com atualização otimista
export function useActivateProduct() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Ativar Produto');

  return useMutation<{ success: boolean; message: string; product: any }, Error, string, { previousProduct?: any }>({
    mutationFn: productsService.activateProduct,
    ...createRetryConfig(1),
    onMutate: async (productId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEYS.detail(productId) });
      
      // Atualização otimista
      const previousProduct = queryClient.getQueryData(PRODUCTS_QUERY_KEYS.detail(productId));
      if (previousProduct && typeof previousProduct === 'object' && 'data' in previousProduct) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEYS.detail(productId), {
          ...previousProduct,
          data: { ...(previousProduct as any).data, isActive: true }
        });
      }
      
      return { previousProduct };
    },
    onSuccess: (response, productId) => {
      // Atualizar cache com dados do servidor
      queryClient.setQueryData(PRODUCTS_QUERY_KEYS.detail(productId), response);
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      const successMessage = createSuccessMsg('activate', 'Produto', response.product.name);
      handleSuccess(successMessage, 'Produto ativado');
    },
    onError: (error, productId, context) => {
      // Reverter atualização otimista
      if (context?.previousProduct) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEYS.detail(productId), context.previousProduct);
      }
      
      const errorTitle = createErrorTitle('activate', 'produto');
      handleError(error, errorTitle);
    },
  });
}

// Hook para desativar produto com atualização otimista
export function useDeactivateProduct() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Desativar Produto');

  return useMutation<{ success: boolean; message: string; product: any }, Error, string, { previousProduct?: any }>({
    mutationFn: productsService.deactivateProduct,
    ...createRetryConfig(1),
    onMutate: async (productId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEYS.detail(productId) });
      
      // Atualização otimista
      const previousProduct = queryClient.getQueryData(PRODUCTS_QUERY_KEYS.detail(productId));
      if (previousProduct && typeof previousProduct === 'object' && 'data' in previousProduct) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEYS.detail(productId), {
          ...previousProduct,
          data: { ...(previousProduct as any).data, isActive: false }
        });
      }
      
      return { previousProduct };
    },
    onSuccess: (response, productId) => {
      // Atualizar cache com dados do servidor
      queryClient.setQueryData(PRODUCTS_QUERY_KEYS.detail(productId), response);
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      const successMessage = createSuccessMsg('deactivate', 'Produto', response.product.name);
      handleSuccess(successMessage, 'Produto desativado');
    },
    onError: (error, productId, context) => {
      // Reverter atualização otimista
      if (context?.previousProduct) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEYS.detail(productId), context.previousProduct);
      }
      
      const errorTitle = createErrorTitle('deactivate', 'produto');
      handleError(error, errorTitle);
    },
  });
}