/**
 * Hook para gestão de clientes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useApiMutationError, createRetryConfig } from '../use-api-error';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';
import type { ApiResponse, QueryParams, PaginatedResponse } from '../../services/api.service';
import { useToast } from '../use-toast';

// Função utilitária para gerar mensagens de erro amigáveis
function getCustomerErrorMessage(error: any, operation: string): string {
  // Verificar se é um erro de rede
  if (!navigator.onLine) {
    return 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
  }

  // Verificar códigos de status HTTP específicos
  if (error?.status || error?.response?.status) {
    const status = error.status || error.response.status;
    
    switch (status) {
      case 400:
        return 'Dados inválidos. Verifique as informações preenchidas e tente novamente.';
      case 401:
        return 'Sessão expirada. Faça login novamente para continuar.';
      case 403:
        return 'Você não tem permissão para realizar esta operação.';
      case 404:
        return 'Cliente não encontrado. Pode ter sido removido por outro usuário.';
      case 409:
        return 'Já existe um cliente com essas informações. Verifique os dados e tente novamente.';
      case 422:
        return 'Dados incompletos ou inválidos. Verifique todos os campos obrigatórios.';
      case 500:
        return 'Erro interno do servidor. Tente novamente em alguns instantes.';
      case 503:
        return 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.';
      default:
        break;
    }
  }

  // Verificar mensagens específicas do servidor
  const serverMessage = error?.message || error?.response?.data?.message || error?.response?.data?.error;
  if (serverMessage) {
    // Traduzir algumas mensagens comuns do servidor
    if (serverMessage.toLowerCase().includes('duplicate') || serverMessage.toLowerCase().includes('unique')) {
      return 'Já existe um cliente com essas informações. Verifique os dados e tente novamente.';
    }
    if (serverMessage.toLowerCase().includes('validation')) {
      return 'Dados inválidos. Verifique as informações preenchidas.';
    }
    if (serverMessage.toLowerCase().includes('not found')) {
      return 'Cliente não encontrado.';
    }
    if (serverMessage.toLowerCase().includes('timeout')) {
      return 'Operação demorou muito para responder. Tente novamente.';
    }
  }

  // Mensagens padrão baseadas na operação
  switch (operation) {
    case 'create':
      return 'Não foi possível criar o cliente. Verifique os dados e tente novamente.';
    case 'update':
      return 'Não foi possível atualizar o cliente. Verifique os dados e tente novamente.';
    case 'delete':
      return 'Não foi possível remover o cliente. Tente novamente em alguns instantes.';
    case 'activate':
      return 'Não foi possível ativar o cliente. Tente novamente em alguns instantes.';
    case 'deactivate':
      return 'Não foi possível desativar o cliente. Tente novamente em alguns instantes.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.';
  }
}

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

// Chaves de query tipadas
export const CUSTOMERS_QUERY_KEYS = {
  all: ['customers'] as const,
  lists: () => [...CUSTOMERS_QUERY_KEYS.all, 'list'] as const,
  list: (params?: QueryParams) => [...CUSTOMERS_QUERY_KEYS.lists(), params] as const,
  details: () => [...CUSTOMERS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CUSTOMERS_QUERY_KEYS.details(), id] as const,
};

// Hook principal para buscar clientes com filtros e paginação
export function useCustomers(params?: QueryParams) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();
  
  // Calcular se pode carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);
  
  return useQuery<PaginatedResponse<Customer>, Error>({
    queryKey: CUSTOMERS_QUERY_KEYS.list(params),
    queryFn: () => customersService.getCustomers(params),
    enabled: canLoadData,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    refetchOnWindowFocus: false,
    ...createRetryConfig(3),
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
      return failureCount < 3;
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
        description: getCustomerErrorMessage(error, 'create'),
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
        description: getCustomerErrorMessage(error, 'update'),
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
        description: getCustomerErrorMessage(error, 'delete'),
        variant: 'destructive',
      });
    },
  });
}

// Hook para ativar cliente
export function useActivateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Customer>, Error, string, { previousCustomer?: any }>({
    mutationFn: customersService.activateCustomer,
    onMutate: async (customerId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: CUSTOMERS_QUERY_KEYS.detail(customerId) });
      
      // Obter dados para possível rollback
      const previousCustomer = queryClient.getQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId));
      
      return { previousCustomer };
    },
    onSuccess: (response, customerId) => {
      // Atualizar cache e invalidar listas
      queryClient.setQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId), response);
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      
      // Verificação de segurança para evitar erros de propriedades undefined
      const customerName = response?.data?.name || 'Cliente';
      
      toast({
        title: 'Cliente ativado',
        description: `${customerName} foi ativado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error, customerId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousCustomer) {
        queryClient.setQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId), context.previousCustomer);
      }
      
      toast({
        title: 'Erro ao ativar cliente',
        description: getCustomerErrorMessage(error, 'activate'),
        variant: 'destructive',
      });
    },
  });
}

// Hook para desativar cliente
export function useDeactivateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Customer>, Error, string, { previousCustomer?: any }>({
    mutationFn: customersService.deactivateCustomer,
    onMutate: async (customerId) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: CUSTOMERS_QUERY_KEYS.detail(customerId) });
      
      // Obter dados para possível rollback
      const previousCustomer = queryClient.getQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId));
      
      return { previousCustomer };
    },
    onSuccess: (response, customerId) => {
      // Atualizar cache e invalidar listas
      queryClient.setQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId), response);
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEYS.lists() });
      
      // Verificação de segurança para evitar erros de propriedades undefined
      const customerName = response?.data?.name || 'Cliente';
      
      toast({
        title: 'Cliente desativado',
        description: `${customerName} foi desativado com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error, customerId, context) => {
      // Restaurar dados em caso de erro
      if (context?.previousCustomer) {
        queryClient.setQueryData(CUSTOMERS_QUERY_KEYS.detail(customerId), context.previousCustomer);
      }
      
      toast({
        title: 'Erro ao desativar cliente',
        description: getCustomerErrorMessage(error, 'deactivate'),
        variant: 'destructive',
      });
    },
  });
}