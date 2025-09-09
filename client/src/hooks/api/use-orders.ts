/**
 * Hook para gestão de encomendas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para pedidos
interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: string;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderFormData {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: string;
  }[];
  notes?: string;
  deliveryDate?: string;
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
export const ORDERS_QUERY_KEYS = {
  all: ['orders'] as const,
  lists: () => [...ORDERS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...ORDERS_QUERY_KEYS.lists(), params] as const,
  details: () => [...ORDERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ORDERS_QUERY_KEYS.details(), id] as const,
  recent: () => [...ORDERS_QUERY_KEYS.all, 'recent'] as const,
};

// Hook para listar pedidos
export function useOrders(params?: Record<string, any>) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return user && isModuleEnabled('orders');
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.list(params),
    queryFn: () => ordersService.getOrders(params),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: !!canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook para obter pedido específico
export function useOrder(id: string) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return user && isModuleEnabled('orders') && !!id;
  }, [user, isModuleEnabled, id]);

  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.detail(id),
    queryFn: () => ordersService.getOrder(id),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: !!canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para 404
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook para pedidos recentes
export function useRecentOrders() {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return user && isModuleEnabled('orders');
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.recent(),
    queryFn: ordersService.getRecentOrders,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    enabled: !!canLoadData,
    refetchOnWindowFocus: false,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook para criar pedido
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Order>, Error, OrderFormData>({
    mutationFn: ordersService.createOrder,
    onSuccess: (response) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.recent() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      
      toast({
        title: 'Pedido criado',
        description: `Pedido ${response.data.orderNumber} foi criado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar pedido',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar pedido
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Order>, Error, { id: string; data: Partial<OrderFormData> }>({
    mutationFn: ({ id, data }) => ordersService.updateOrder(id, data),
    onSuccess: (response, variables) => {
      // Atualizar cache específico
      queryClient.setQueryData(
        ORDERS_QUERY_KEYS.detail(variables.id),
        response
      );
      
      // Invalidar listas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.recent() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Pedido atualizado',
        description: `Pedido ${response.data.orderNumber} foi atualizado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar pedido',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para deletar pedido
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, string, { previousOrder?: any }>({
    mutationFn: ordersService.deleteOrder,
    onMutate: async (orderId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ORDERS_QUERY_KEYS.detail(orderId) });
      
      // Obter dados para possível rollback
      const previousOrder = queryClient.getQueryData(ORDERS_QUERY_KEYS.detail(orderId));
      
      // Remover do cache otimisticamente
      queryClient.removeQueries({ queryKey: ORDERS_QUERY_KEYS.detail(orderId) });
      
      return { previousOrder };
    },
    onSuccess: () => {
      // Invalidar listas para refletir mudanças
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.recent() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: 'Pedido removido',
        description: 'Pedido foi removido com sucesso.',
        variant: 'default',
      });
    },
    onError: (error, orderId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousOrder) {
        queryClient.setQueryData(ORDERS_QUERY_KEYS.detail(orderId), context.previousOrder);
      }
      
      toast({
        title: 'Erro ao remover pedido',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}