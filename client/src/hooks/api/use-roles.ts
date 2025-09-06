/**
 * Hook para gestão de funções e permissões
 * Centraliza operações de controle de acesso e autorização
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiServices } from '../../services/api.service'; // Removido - não utilizado
import type { QueryParams, ApiResponse } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';

// Tipos para funções e permissões
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: string;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface UserRole {
  userId: string;
  userName: string;
  email: string;
  roles: Role[];
  isActive: boolean;
  lastLogin?: string;
}

export interface AssignRoleData {
  userId: string;
  roleIds: string[];
}

// Chaves de query para cache
export const ROLES_QUERY_KEYS = {
  all: ['roles'] as const,
  lists: () => [...ROLES_QUERY_KEYS.all, 'list'] as const,
  list: (params?: QueryParams) => [...ROLES_QUERY_KEYS.lists(), params] as const,
  details: () => [...ROLES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ROLES_QUERY_KEYS.details(), id] as const,
  permissions: () => ['permissions'] as const,
  userRoles: () => ['user-roles'] as const,
  userRole: (userId: string) => [...ROLES_QUERY_KEYS.userRoles(), userId] as const,
};

/**
 * Hook para listar funções
 */
export function useRoles(params?: QueryParams) {
  const { toast } = useToast();

  return useQuery<ApiResponse<Role[]>, Error>({
    queryKey: ROLES_QUERY_KEYS.list(params),
    queryFn: async () => {
      // Simular dados de funções
      const roles: Role[] = [
        {
          id: 'role-1',
          name: 'Administrador',
          description: 'Acesso total ao sistema',
          permissions: [],
          isSystem: true,
          userCount: 2,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'role-2',
          name: 'Gestor de Armazém',
          description: 'Gestão de inventário e operações de armazém',
          permissions: [],
          isSystem: false,
          userCount: 5,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 'role-3',
          name: 'Operador',
          description: 'Operações básicas do sistema',
          permissions: [],
          isSystem: false,
          userCount: 12,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-10T14:20:00Z',
        },
      ];

      return {
        data: roles,
        success: true,
        message: 'Funções carregadas com sucesso',
      };
    },
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar funções',
          description: 'Não foi possível carregar as funções do sistema.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para obter detalhes de uma função específica
 */
export function useRole(id: string) {
  const { toast } = useToast();

  return useQuery<ApiResponse<Role>, Error>({
    queryKey: ROLES_QUERY_KEYS.detail(id),
    queryFn: async () => {
      // Simular dados detalhados da função
      const role: Role = {
        id,
        name: 'Gestor de Armazém',
        description: 'Gestão de inventário e operações de armazém',
        permissions: [
          {
            id: 'perm-1',
            name: 'Visualizar Inventário',
            resource: 'inventory',
            action: 'read',
            description: 'Permite visualizar dados do inventário',
            category: 'Inventário',
          },
          {
            id: 'perm-2',
            name: 'Editar Inventário',
            resource: 'inventory',
            action: 'write',
            description: 'Permite editar dados do inventário',
            category: 'Inventário',
          },
          {
            id: 'perm-3',
            name: 'Gestão de Pedidos',
            resource: 'orders',
            action: 'manage',
            description: 'Permite gerir pedidos e encomendas',
            category: 'Pedidos',
          },
        ],
        isSystem: false,
        userCount: 5,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      };

      return {
        data: role,
        success: true,
        message: 'Função carregada com sucesso',
      };
    },
    enabled: !!id,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar função',
          description: 'Não foi possível carregar os detalhes da função.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para listar todas as permissões disponíveis do sistema
 */
export function useSystemPermissions() {
  const { toast } = useToast();

  return useQuery<ApiResponse<Permission[]>, Error>({
    queryKey: ROLES_QUERY_KEYS.permissions(),
    queryFn: async () => {
      // Simular dados de permissões
      const permissions: Permission[] = [
        {
          id: 'perm-1',
          name: 'Visualizar Inventário',
          resource: 'inventory',
          action: 'read',
          description: 'Permite visualizar dados do inventário',
          category: 'Inventário',
        },
        {
          id: 'perm-2',
          name: 'Editar Inventário',
          resource: 'inventory',
          action: 'write',
          description: 'Permite editar dados do inventário',
          category: 'Inventário',
        },
        {
          id: 'perm-3',
          name: 'Gestão de Pedidos',
          resource: 'orders',
          action: 'manage',
          description: 'Permite gerir pedidos e encomendas',
          category: 'Pedidos',
        },
        {
          id: 'perm-4',
          name: 'Gestão de Utilizadores',
          resource: 'users',
          action: 'manage',
          description: 'Permite gerir utilizadores do sistema',
          category: 'Utilizadores',
        },
        {
          id: 'perm-5',
          name: 'Relatórios Avançados',
          resource: 'reports',
          action: 'advanced',
          description: 'Acesso a relatórios avançados e analytics',
          category: 'Relatórios',
        },
      ];

      return {
        data: permissions,
        success: true,
        message: 'Permissões carregadas com sucesso',
      };
    },
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar permissões',
          description: 'Não foi possível carregar as permissões disponíveis.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para criar nova função
 */
export function useCreateRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Role>, Error, RoleFormData>({
    mutationFn: async (roleData) => {
      // Simular criação de função
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleData.name,
        description: roleData.description,
        permissions: [],
        isSystem: false,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return {
        data: newRole,
        success: true,
        message: 'Função criada com sucesso',
      };
    },
    onSuccess: (response) => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.lists() });
      
      toast({
        title: 'Função criada',
        description: `${response.data.name} foi criada com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar função',
        description: error.message || 'Não foi possível criar a função.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar função
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<Role>, Error, { id: string; data: RoleFormData }>({
    mutationFn: async ({ id: _ }) => {
      // Simular atualização de função
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        data: {} as Role,
        success: true,
        message: 'Função atualizada com sucesso',
      };
    },
    onSuccess: (_, { id }) => {
      // Atualizar caches
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.lists() });
      
      toast({
        title: 'Função atualizada',
        description: 'A função foi atualizada com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar função',
        description: error.message || 'Não foi possível atualizar a função.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para eliminar função
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async (_id) => {
      // Simular eliminação de função
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: undefined,
        success: true,
        message: 'Função eliminada com sucesso',
      };
    },
    onSuccess: () => {
      // Invalidar cache de listas
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEYS.userRoles() });
      
      toast({
        title: 'Função eliminada',
        description: 'A função foi eliminada com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao eliminar função',
        description: error.message || 'Não foi possível eliminar a função.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para obter funções de um utilizador
 */
export function useUserRoles(userId: string) {
  const { toast } = useToast();

  return useQuery<ApiResponse<UserRole>, Error>({
    queryKey: ROLES_QUERY_KEYS.userRole(userId),
    queryFn: async () => {
      // Simular dados de funções do utilizador
      const userRole: UserRole = {
        userId,
        userName: 'João Silva',
        email: 'joao.silva@empresa.com',
        roles: [
          {
            id: 'role-2',
            name: 'Gestor de Armazém',
            description: 'Gestão de inventário e operações de armazém',
            permissions: [],
            isSystem: false,
            userCount: 5,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
        ],
        isActive: true,
        lastLogin: '2024-01-20T14:30:00Z',
      };

      return {
        data: userRole,
        success: true,
        message: 'Funções do utilizador carregadas com sucesso',
      };
    },
    enabled: !!userId,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: () => {
        toast({
          title: 'Erro ao carregar funções',
          description: 'Não foi possível carregar as funções do utilizador.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para atribuir funções a um utilizador
 */
export function useAssignRoles() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ApiResponse<void>, Error, AssignRoleData>({
    mutationFn: async (_assignData) => {
      // Simular atribuição de funções
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        data: undefined,
        success: true,
        message: 'Funções atribuídas com sucesso',
      };
    },
    onSuccess: (_, { userId }) => {
      // Atualizar cache do utilizador
      queryClient.invalidateQueries({ 
        queryKey: ROLES_QUERY_KEYS.userRole(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ROLES_QUERY_KEYS.userRoles() 
      });
      
      toast({
        title: 'Funções atribuídas',
        description: 'As funções foram atribuídas ao utilizador com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atribuir funções',
        description: error.message || 'Não foi possível atribuir as funções.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para verificar se o utilizador tem uma permissão específica
 */
export function useHasPermission(_permission: string) {
  // Este hook seria normalmente conectado ao contexto de autenticação
  // Por agora, retorna uma simulação
  return {
    hasPermission: true, // Simular que o utilizador tem a permissão
    isLoading: false,
  };
}

/**
 * Hook para verificar se o utilizador tem uma função específica
 */
export function useHasRole(_roleName: string) {
  // Este hook seria normalmente conectado ao contexto de autenticação
  // Por agora, retorna uma simulação
  return {
    hasRole: true, // Simular que o utilizador tem a função
    isLoading: false,
  };
}