/**
 * Hook para gestão de categorias
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';

// Tipos para categorias
interface Category {
  id: string;
  name: string;
  description?: string;
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Chaves de query tipadas
export const CATEGORIES_QUERY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORIES_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...CATEGORIES_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...CATEGORIES_QUERY_KEYS.all, 'detail', id] as const,
};

// Hook para listar categorias
export function useCategories(params?: Record<string, any>) {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.list(params),
    queryFn: () => categoriesService.getCategories(params),
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
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
  const { toast } = useToast();

  return useMutation<ApiResponse<Category>, Error, CategoryFormData>({
    mutationFn: categoriesService.createCategory,
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
      
      toast({
        title: 'Categoria criada',
        description: `${response.data.name} foi criada com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar categoria
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Category>, Error, { id: string; data: Partial<CategoryFormData> }>({
    mutationFn: ({ id, data }) => categoriesService.updateCategory(id, data),
    onSuccess: (response, { id }) => {
      // Atualizar cache específico
      queryClient.setQueryData(CATEGORIES_QUERY_KEYS.detail(id), response);
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.lists() });
      
      toast({
        title: 'Categoria atualizada',
        description: `${response.data.name} foi atualizada com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para deletar categoria
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, string, { previousCategory?: any }>({
    mutationFn: categoriesService.deleteCategory,
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
      
      toast({
        title: 'Categoria removida',
        description: 'A categoria foi removida com sucesso.',
        variant: 'default',
      });
    },
    onError: (error, categoryId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousCategory) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEYS.detail(categoryId), context.previousCategory);
      }
      
      toast({
        title: 'Erro ao remover categoria',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}