import { useQuery } from "@tanstack/react-query";
import { apiServices } from "@/services/api.service";

// Tipos para Warehouse
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehousesResponse {
  data: Warehouse[];
  total: number;
  page: number;
  limit: number;
}

// Query keys
export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...warehouseKeys.lists(), { filters }] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};

// Hook para buscar warehouses
export function useWarehouses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: warehouseKeys.list(params || {}),
    queryFn: async () => {
      const response = await apiServices.warehouses.getWarehouses(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar warehouse por ID
export function useWarehouse(id: string) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: async () => {
      const response = await apiServices.warehouses.getWarehouse(id);
      return response;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}