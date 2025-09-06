/**
 * Hook para gestão de envios
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shippingService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para envios
// interface Vehicle {
//   id: string;
//   licensePlate: string;
//   model: string;
//   capacity: number;
//   isAvailable: boolean;
//   driverId?: string;
//   driverName?: string;
// }

interface Shipment {
  id: string;
  trackingNumber: string;
  orderId: string;
  orderNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId?: string;
  driverName?: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  origin: string;
  destination: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentFormData {
  orderId: string;
  vehicleId: string;
  driverId?: string;
  destination: string;
  estimatedDelivery?: string;
  notes?: string;
}

// interface TrackingInfo {
//   trackingNumber: string;
//   status: string;
//   currentLocation?: string;
//   estimatedDelivery?: string;
//   history: {
//     status: string;
//     location: string;
//     timestamp: string;
//     notes?: string;
//   }[];
// }

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
export const SHIPPING_QUERY_KEYS = {
  all: ['shipping'] as const,
  lists: () => [...SHIPPING_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...SHIPPING_QUERY_KEYS.lists(), params] as const,
  details: () => [...SHIPPING_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SHIPPING_QUERY_KEYS.details(), id] as const,
  vehicles: () => [...SHIPPING_QUERY_KEYS.all, 'vehicles'] as const,
  tracking: (trackingNumber: string) => [...SHIPPING_QUERY_KEYS.all, 'tracking', trackingNumber] as const,
};

// Hook para listar envios
export function useShipments(params?: Record<string, any>) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('shipping'));
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.list(params),
    queryFn: () => shippingService.getShipments(params),
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

// Hook para obter envio específico
export function useShipment(id: string) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('shipping') && id);
  }, [user, isModuleEnabled, id]);

  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.detail(id),
    queryFn: () => shippingService.getShipment(id),
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

// Hook para veículos disponíveis
export function useAvailableVehicles() {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('shipping'));
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.vehicles(),
    queryFn: shippingService.getAvailableVehicles,
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

// Hook para rastreamento
export function useTrackShipment(trackingNumber: string) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('shipping') && trackingNumber);
  }, [user, isModuleEnabled, trackingNumber]);

  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.tracking(trackingNumber),
    queryFn: () => shippingService.trackShipment(trackingNumber),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status === 404) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para criar envio
export function useCreateShipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Shipment>, Error, ShipmentFormData>({
    mutationFn: shippingService.createShipment,
    onSuccess: (response) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: SHIPPING_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SHIPPING_QUERY_KEYS.vehicles() });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Envio criado',
        description: `Envio ${response.data.trackingNumber} foi criado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar envio',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar envio
export function useUpdateShipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Shipment>, Error, { id: string; data: Partial<ShipmentFormData> }>({
    mutationFn: ({ id, data }) => shippingService.updateShipment(id, data),
    onSuccess: (response, variables) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        SHIPPING_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // Invalidar listas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: SHIPPING_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Envio atualizado',
        description: `Envio ${response.data.trackingNumber} foi atualizado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar envio',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}