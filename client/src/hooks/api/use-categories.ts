/**
 * Hook otimizado para gestão de categorias com React Query
 * Implementa boas práticas de cache, tratamento de erros e tipagem
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
import { useApiMutationError, createRetryConfig } from '../use-api-error';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';
import type { QueryParams, ApiResponse, PaginatedResponse } from '../../services/api.service';

// Tipos para categorias
export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  description?: string;
}

// interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// } // Removed unused interface



// Chaves de query organizadas e tipadas
export const CATEGORIES_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORIES_QUERY_KEYS.all, 'list'] as const,
  list: (params?: QueryParams) => [...CATEGORIES_QUERY_KEYS.lists(), params] as const,
  details: () => [...CATEGORIES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CATEGORIES_QUERY_KEYS.details(), id] as const,
};

// Hook principal para buscar categorias com cache inteligente
export function useCategories(params?: QueryParams) {
  const { isAuthenticated, isReady, user } = useAuth();
  const { isLoading: isModulesLoading } = useModules();
  
  // Calcular se pode carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  // Debug logs removidos para melhor performance do console
  
  return useQuery<PaginatedResponse<Category>, Error>({
    queryKey: CATEGORIES_QUERY_KEYS.list(params),
    queryFn: async () => {
      const response = await categoriesService.getCategories(params);
      return response as PaginatedResponse<Category>;
    },
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    refetchOnWindowFocus: false,
    ...createRetryConfig(3),
  });
}

// Hook para obter categoria específica
export function useCategory(id: string) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.detail(id),
    queryFn: () => categoriesService.getCategory(id),
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    enabled: !!id,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para 404
      if (error?.status === 404) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para criar categoria
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Criar Categoria');

  return useMutation<ApiResponse<Category>, Error, CategoryFormData>({
    mutationFn: categoriesService.createCategory,
    ...createRetryConfig(1), // Apenas 1 tentativa para operações de criação
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
      
      const successMessage = createSuccessMsg('create', 'Categoria', response.data.name);
      handleSuccess(successMessage, 'Categoria criada');
    },
    onError: (error) => {
      const errorTitle = createErrorTitle('create', 'categoria');
      handleError(error, errorTitle);
    },
  });
}

// Hook para atualizar categoria
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Atualizar Categoria');

  return useMutation<ApiResponse<Category>, Error, { id: string; data: Partial<CategoryFormData> }>({
    mutationFn: ({ id, data }) => categoriesService.updateCategory(id, data),
    ...createRetryConfig(1),
    onSuccess: (response, { id }) => {
      // Atualizar cache específico
      queryClient.setQueryData(CATEGORIES_QUERY_KEYS.detail(id), response);
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
      
      const successMessage = createSuccessMsg('update', 'Categoria', response.data.name);
      handleSuccess(successMessage, 'Categoria atualizada');
    },
    onError: (error) => {
      const errorTitle = createErrorTitle('update', 'categoria');
      handleError(error, errorTitle);
    },
  });
}

// Hook para alternar status da categoria (ativar/desativar)
export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createErrorTitle } = useApiMutationError('Alternar Status da Categoria');

  return useMutation<any, Error, string, { previousCategory?: any }>({
    mutationFn: categoriesService.toggleCategoryStatus,
    ...createRetryConfig(1),
    onMutate: async (categoryId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEYS.detail(categoryId) });
      
      // Obter dados para possível rollback
      const previousCategory = queryClient.getQueryData(CATEGORIES_QUERY_KEYS.detail(categoryId));
      
      return { previousCategory };
    },
    onSuccess: (response, categoryId) => {
      // Atualizar cache específico
      queryClient.setQueryData(CATEGORIES_QUERY_KEYS.detail(categoryId), response);
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
      
      const category = response.data;
      const action = category.isActive ? 'ativada' : 'desativada';
      const successMessage = `Categoria ${category.name} foi ${action} com sucesso`;
      handleSuccess(successMessage, 'Status alterado');
    },
    onError: (error, categoryId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousCategory) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEYS.detail(categoryId), context.previousCategory);
      }
      
      const errorTitle = createErrorTitle('update', 'status da categoria');
      handleError(error, errorTitle);
    },
  });
}

// Hook para deletar categoria (mantido para compatibilidade)
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Deletar Categoria');

  return useMutation<any, Error, string, { previousCategory?: any }>({
    mutationFn: categoriesService.deleteCategory,
    ...createRetryConfig(1),
    onMutate: async (categoryId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEYS.detail(categoryId) });
      
      // Obter dados para possível rollback
      const previousCategory = queryClient.getQueryData(CATEGORIES_QUERY_KEYS.detail(categoryId));
      
      return { previousCategory };
    },
    onSuccess: (_, categoryId) => {
      // Remover do cache e invalidar listas
      queryClient.removeQueries({ queryKey: CATEGORIES_QUERY_KEYS.detail(categoryId) });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
      
      const successMessage = createSuccessMsg('delete', 'Categoria');
      handleSuccess(successMessage, 'Categoria removida');
    },
    onError: (error, categoryId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousCategory) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEYS.detail(categoryId), context.previousCategory);
      }
      
      const errorTitle = createErrorTitle('delete', 'categoria');
      handleError(error, errorTitle);
    },
  });
}