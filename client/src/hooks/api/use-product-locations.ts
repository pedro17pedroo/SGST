/**
 * Hook personalizado para gestão de localizações de produtos
 * Segue o mesmo padrão do hook de produtos com paginação e cache otimizado
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productLocationsService } from '@/services/api.service';
import { useApiMutationError, useApiQueryError } from '@/hooks/use-api-error';
import { CACHE_CONFIG } from '@/config/api';

// Tipos para localizações de produtos
export interface ProductLocation {
  id: string;
  productId: string;
  warehouseId: string;
  location: string;
  lastUpdate: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export interface ProductLocationFormData {
  productId: string;
  warehouseId: string;
  location: string;
}

export interface ProductLocationsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  productId?: string;
  warehouseId?: string;
}

export interface PaginatedProductLocationsResponse {
  data: ProductLocation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  success: boolean;
  message?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Chaves de query para cache
export const PRODUCT_LOCATIONS_QUERY_KEYS = {
  all: ['product-locations'] as const,
  lists: () => [...PRODUCT_LOCATIONS_QUERY_KEYS.all, 'list'] as const,
  list: (params: ProductLocationsQueryParams) => [
    ...PRODUCT_LOCATIONS_QUERY_KEYS.lists(),
    params,
  ] as const,
  details: () => [...PRODUCT_LOCATIONS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_LOCATIONS_QUERY_KEYS.details(), id] as const,
};



// Hook principal para buscar localizações com paginação
export function useProductLocations(params: ProductLocationsQueryParams = {}) {
  // Garantir valores padrão para paginação
  const queryParams = {
    page: 1,
    limit: 5,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as const,
    ...params,
  };

  return useQuery({
    queryKey: PRODUCT_LOCATIONS_QUERY_KEYS.list(queryParams),
    queryFn: () => productLocationsService.getProductLocations(queryParams),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// Hook para obter localização específica
export function useProductLocation(id: string) {
  return useQuery({
    queryKey: PRODUCT_LOCATIONS_QUERY_KEYS.detail(id),
    queryFn: () => productLocationsService.getProductLocation(id),
    enabled: !!id,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// Hook para criar localização
export function useCreateProductLocation() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Criar Localização');

  return useMutation({
    mutationFn: productLocationsService.createProductLocation,
    retry: 1,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_LOCATIONS_QUERY_KEYS.lists() });
      
      const successMessage = createSuccessMsg('create', 'Localização');
      handleSuccess(successMessage, 'Localização criada');
    },
    onError: (error) => {
      const errorTitle = createErrorTitle('create', 'localização');
      handleError(error, errorTitle);
    },
  });
}

// Hook para atualizar localização
export function useUpdateProductLocation() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Atualizar Localização');

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductLocationFormData> }) =>
      productLocationsService.updateProductLocation(id, data),
    retry: 1,
    onSuccess: (response, variables) => {
      queryClient.setQueryData(
        PRODUCT_LOCATIONS_QUERY_KEYS.detail(variables.id),
        response
      );
      queryClient.invalidateQueries({ queryKey: PRODUCT_LOCATIONS_QUERY_KEYS.lists() });
      
      const successMessage = createSuccessMsg('update', 'Localização');
      handleSuccess(successMessage, 'Localização atualizada');
    },
    onError: (error) => {
      const errorTitle = createErrorTitle('update', 'localização');
      handleError(error, errorTitle);
    },
  });
}

// Hook para eliminar localização
export function useDeleteProductLocation() {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess, createSuccessMsg, createErrorTitle } = useApiMutationError('Eliminar Localização');

  return useMutation({
    mutationFn: productLocationsService.deleteProductLocation,
    retry: 1,
    onMutate: async (locationId) => {
      await queryClient.cancelQueries({ queryKey: PRODUCT_LOCATIONS_QUERY_KEYS.detail(locationId) });
      
      const previousLocation = queryClient.getQueryData(PRODUCT_LOCATIONS_QUERY_KEYS.detail(locationId));
      
      return { previousLocation };
    },
    onSuccess: (_, locationId) => {
      queryClient.removeQueries({ queryKey: PRODUCT_LOCATIONS_QUERY_KEYS.detail(locationId) });
      queryClient.invalidateQueries({ queryKey: PRODUCT_LOCATIONS_QUERY_KEYS.lists() });
      
      const successMessage = createSuccessMsg('delete', 'Localização');
      handleSuccess(successMessage, 'Localização eliminada');
    },
    onError: (error, locationId, context) => {
      if (context?.previousLocation) {
        queryClient.setQueryData(PRODUCT_LOCATIONS_QUERY_KEYS.detail(locationId), context.previousLocation);
      }
      
      const errorTitle = createErrorTitle('delete', 'localização');
      handleError(error, errorTitle);
    },
  });
}