/**
 * Hook para gestão de tracking público e portal do cliente
 * Centraliza operações de rastreamento de encomendas
 */

import { useQuery } from '@tanstack/react-query';
// import { apiServices } from '../../services/api.service';
import type { QueryParams, ApiResponse } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';

// Tipos para tracking
export interface TrackingInfo {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  currentLocation: string;
  estimatedDelivery: string;
  history: TrackingEvent[];
  order?: {
    id: string;
    orderNumber: string;
    customerName: string;
    items: OrderItem[];
  };
}

export interface TrackingEvent {
  id: string;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: string;
}

// Chaves de query para cache
export const TRACKING_QUERY_KEYS = {
  all: ['tracking'] as const,
  public: () => [...TRACKING_QUERY_KEYS.all, 'public'] as const,
  publicTracking: (trackingNumber: string) => [...TRACKING_QUERY_KEYS.public(), trackingNumber] as const,
  customer: () => [...TRACKING_QUERY_KEYS.all, 'customer'] as const,
  customerOrders: (customerId: string) => [...TRACKING_QUERY_KEYS.customer(), 'orders', customerId] as const,
  customerTracking: (customerId: string, trackingNumber: string) => [
    ...TRACKING_QUERY_KEYS.customer(), 
    customerId, 
    trackingNumber
  ] as const,
};

/**
 * Hook para tracking público
 * Permite rastrear encomendas sem autenticação
 */
export function usePublicTracking(trackingNumber: string, enabled = true) {
  const { toast } = useToast();

  return useQuery<ApiResponse<TrackingInfo>, Error>({
    queryKey: TRACKING_QUERY_KEYS.publicTracking(trackingNumber),
    queryFn: async () => {
      // Simular chamada à API de tracking público
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/public/tracking/${trackingNumber}`);
      if (!response.ok) {
        throw new Error('Número de rastreamento não encontrado');
      }
      return response.json();
    },
    enabled: enabled && !!trackingNumber,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para 404
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Erro no rastreamento',
          description: error.message || 'Não foi possível obter informações de rastreamento.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para tracking no portal do cliente
 * Permite ao cliente ver todas as suas encomendas
 */
export function useCustomerOrders(customerId: string, params?: QueryParams) {
  const { toast } = useToast();

  return useQuery<ApiResponse<TrackingInfo[]>, Error>({
    queryKey: TRACKING_QUERY_KEYS.customerOrders(customerId),
    queryFn: async () => {
      // Simular chamada à API do portal do cliente
      const queryString = params ? new URLSearchParams(params as any).toString() : '';
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/customer/${customerId}/orders?${queryString}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar encomendas');
      }
      return response.json();
    },
    enabled: !!customerId,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Erro ao carregar encomendas',
          description: error.message || 'Não foi possível carregar suas encomendas.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para tracking específico no portal do cliente
 */
export function useCustomerTracking(customerId: string, trackingNumber: string, enabled = true) {
  const { toast } = useToast();

  return useQuery<ApiResponse<TrackingInfo>, Error>({
    queryKey: TRACKING_QUERY_KEYS.customerTracking(customerId, trackingNumber),
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
      const response = await fetch(`${apiUrl}/api/customer/${customerId}/tracking/${trackingNumber}`);
      if (!response.ok) {
        throw new Error('Rastreamento não encontrado');
      }
      return response.json();
    },
    enabled: enabled && !!customerId && !!trackingNumber,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        toast({
          title: 'Erro no rastreamento',
          description: error.message || 'Não foi possível obter informações de rastreamento.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para refrescar tracking
 * Útil para atualizações manuais
 */
export function useRefreshTracking() {
  const { toast } = useToast();

  return {
    refreshPublicTracking: (_trackingNumber: string) => {
      // Invalidar cache específico
      // queryClient.invalidateQueries({ queryKey: TRACKING_QUERY_KEYS.publicTracking(trackingNumber) });
      toast({
        title: 'Atualizando rastreamento',
        description: 'Buscando informações mais recentes...',
      });
    },
    refreshCustomerOrders: (_customerId: string) => {
      // queryClient.invalidateQueries({ queryKey: TRACKING_QUERY_KEYS.customerOrders(customerId) });
      toast({
        title: 'Atualizando encomendas',
        description: 'Carregando informações mais recentes...',
      });
    },
  };
}