/**
 * Hook para gestão de clientes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para clientes
interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  taxNumber?: string;
  customerType: 'distribuidor' | 'restaurante' | 'bar' | 'hotel' | 'supermercado' | 'individual' | 'company';
  creditLimit: string;
  paymentTerms: string;
  discount: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
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
export const CUSTOMERS_QUERY_KEYS = {
  all: ['customers'] as const,
  lists: () => [...CUSTOMERS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...CUSTOMERS_QUERY_KEYS.lists(), params] as const,
  detail: (id: string) => [...CUSTOMERS_QUERY_KEYS.all, 'detail', id] as const,
};

// Hook para listar clientes
export function useCustomers(params?: Record<string, any>) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return user && isModuleEnabled('customers');
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.list(params),
    queryFn: () => customersService.getCustomers(params),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: !!canLoadData,
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

// Hook para obter cliente específico
export function useCustomer(id: string) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return user && isModuleEnabled('customers') && !!id;
  }, [user, isModuleEnabled, id]);

  return useQuery({
    queryKey: CUSTOMERS_QUERY_KEYS.detail(id),
    queryFn: () => customersService.getCustomer(id),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: !!canLoadData,
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

// Hook para criar cliente
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Customer>, Error, CustomerFormData>({
    mutationFn: customersService.createCustomer,
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      
      toast({
        title: 'Cliente criado',
        description: `${response.data.name} foi criado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar cliente
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Customer>, Error, { id: string; data: Partial<CustomerFormData> }>({
    mutationFn: ({ id, data }) => customersService.updateCustomer(id, data),
    onSuccess: (response, { id }) => {
      // Atualizar cache específico
      queryClient.setQueryData(CUSTOMERS_QUERY_KEYS.detail(id), response);
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      
      toast({
        title: 'Cliente atualizado',
        description: `${response.data.name} foi atualizado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para deletar cliente
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<any, Error, string, { previousCustomer?: any }>({
    mutationFn: customersService.deleteCustomer,
    onMutate: async (customerId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: CUSTOMERS_QUERY_KEYS.detail(customerId) });
      
      // Obter dados para possível rollback
      const previousCustomer = queryClient.getQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId));
      
      return { previousCustomer };
    },
    onSuccess: (_, customerId) => {
      // Remover do cache e invalidar listas
      queryClient.removeQueries({ queryKey: CUSTOMERS_QUERY_KEYS.detail(customerId) });
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      
      toast({
        title: 'Cliente removido',
        description: 'O cliente foi removido com sucesso.',
        variant: 'default',
      });
    },
    onError: (error, customerId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousCustomer) {
        queryClient.setQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId), context.previousCustomer);
      }
      
      toast({
        title: 'Erro ao remover cliente',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });
}