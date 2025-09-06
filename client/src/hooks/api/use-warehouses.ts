/**
 * Hook para gestão de armazéns
 * Centraliza todas as operações relacionadas com armazéns e localizações
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehousesService } from '../../services/api.service';
import type { QueryParams } from '../../services/api.service';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Chaves de consulta para cache
export const WAREHOUSES_QUERY_KEYS = {
  warehouses: (params?: QueryParams) => ['warehouses', params],
  warehouse: (id: string) => ['warehouses', 'warehouse', id],
  stats: () => ['warehouses', 'stats'],
} as const;

/**
 * Hook para obter lista de armazéns
 */
export function useWarehouses(params?: QueryParams) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  return useQuery({
    queryKey: WAREHOUSES_QUERY_KEYS.warehouses(params),
    queryFn: () => warehousesService.getWarehouses(params),
    enabled: canLoadData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obter armazém específico
 */
export function useWarehouse(id: string) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading && !!id;
  }, [isAuthenticated, isReady, isModulesLoading, id]);

  return useQuery({
    queryKey: WAREHOUSES_QUERY_KEYS.warehouse(id),
    queryFn: () => warehousesService.getWarehouse(id),
    enabled: canLoadData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obter armazéns ativos
 */
export function useActiveWarehouses() {
  return useQuery({
    queryKey: ['warehouses', 'active'],
    queryFn: () => warehousesService.getWarehouses({ isActive: true }),
    staleTime: 10 * 60 * 1000, // 10 minutos (dados mais estáveis)
  });
}

/**
 * Hook para criar armazém
 */
export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: warehousesService.createWarehouse,
    onSuccess: (_data) => {
      // Invalidar cache de armazéns
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      
      toast({
        title: 'Sucesso',
        description: 'Armazém criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar armazém.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar armazém
 */
export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      warehousesService.updateWarehouse(id, data),
    onSuccess: (data, variables) => {
      // Atualizar cache específico do armazém
      queryClient.setQueryData(
        WAREHOUSES_QUERY_KEYS.warehouse(variables.id),
        data
      );
      
      // Invalidar lista de armazéns
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      
      toast({
        title: 'Sucesso',
        description: 'Armazém atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar armazém.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para eliminar armazém
 */
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: warehousesService.deleteWarehouse,
    onSuccess: (_data, warehouseId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: WAREHOUSES_QUERY_KEYS.warehouse(warehouseId) });
      
      // Invalidar lista de armazéns
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      
      // Invalidar inventário (pode estar relacionado)
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: 'Sucesso',
        description: 'Armazém eliminado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao eliminar armazém.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para obter estatísticas de armazéns
 */
export function useWarehousesStats() {
  return useQuery({
    queryKey: WAREHOUSES_QUERY_KEYS.stats(),
    queryFn: async () => {
      const response = await warehousesService.getWarehouses();
      const warehouses = response.data || [];
      
      const stats = {
        total: warehouses.length,
        active: warehouses.filter((w: any) => w.isActive).length,
        inactive: warehouses.filter((w: any) => !w.isActive).length,
        totalCapacity: warehouses.reduce((sum: number, w: any) => sum + (w.capacity || 0), 0),
        averageCapacity: warehouses.length > 0 
          ? warehouses.reduce((sum: number, w: any) => sum + (w.capacity || 0), 0) / warehouses.length 
          : 0,
        byType: warehouses.reduce((acc: any, warehouse: any) => {
          const type = warehouse.type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        byLocation: warehouses.reduce((acc: any, warehouse: any) => {
          const location = warehouse.location || 'unknown';
          acc[location] = (acc[location] || 0) + 1;
          return acc;
        }, {}),
      };
      
      return {
        data: stats,
        success: true,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });
}

/**
 * Hook para obter armazéns por localização
 */
export function useWarehousesByLocation(location: string) {
  return useQuery({
    queryKey: ['warehouses', 'location', location],
    queryFn: () => warehousesService.getWarehouses({ location }),
    enabled: !!location,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook para obter armazéns com capacidade disponível
 */
export function useWarehousesWithCapacity(minCapacity?: number) {
  return useQuery({
    queryKey: ['warehouses', 'with-capacity', minCapacity],
    queryFn: async () => {
      const response = await warehousesService.getWarehouses({ isActive: true });
      const warehouses = response.data || [];
      
      const filtered = warehouses.filter((warehouse: any) => {
        const availableCapacity = (warehouse.capacity || 0) - (warehouse.usedCapacity || 0);
        return minCapacity ? availableCapacity >= minCapacity : availableCapacity > 0;
      });
      
      return {
        ...response,
        data: filtered,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}