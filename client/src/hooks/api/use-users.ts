/**
 * Hook para gestão de utilizadores
 * Centraliza todas as operações relacionadas com utilizadores e funções
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/api.service';
import type { QueryParams } from '../../services/api.service';
import { useToast } from '../use-toast';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Chaves de consulta para cache
export const USERS_QUERY_KEYS = {
  users: (params?: QueryParams) => ['users', params],
  user: (id: string) => ['users', 'user', id],
  usersByRole: (role: string) => ['users', 'role', role],
} as const;

/**
 * Hook para obter lista de utilizadores
 */
export function useUsers(params?: QueryParams) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  return useQuery({
    queryKey: USERS_QUERY_KEYS.users(params),
    queryFn: () => usersService.getUsers(params),
    enabled: canLoadData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obter utilizador específico
 */
export function useUser(id: string) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading && !!id;
  }, [isAuthenticated, isReady, isModulesLoading, id]);

  return useQuery({
    queryKey: USERS_QUERY_KEYS.user(id),
    queryFn: () => usersService.getUser(id),
    enabled: canLoadData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obter utilizadores por função
 */
export function useUsersByRole(role: string) {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading && !!role;
  }, [isAuthenticated, isReady, isModulesLoading, role]);

  return useQuery({
    queryKey: USERS_QUERY_KEYS.usersByRole(role),
    queryFn: () => usersService.getUsersByRole(role),
    enabled: canLoadData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obter condutores (drivers)
 */
export function useDrivers() {
  return useUsersByRole('driver');
}

/**
 * Hook para obter operadores
 */
export function useOperators() {
  return useUsersByRole('operator');
}

/**
 * Hook para criar utilizador
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersService.createUser,
    onSuccess: (_data) => {
      // Invalidar cache de utilizadores
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: 'Sucesso',
        description: 'Utilizador criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar utilizador.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar utilizador
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      usersService.updateUser(id, data),
    onSuccess: (data, variables) => {
      // Atualizar cache específico do utilizador
      queryClient.setQueryData(
        USERS_QUERY_KEYS.user(variables.id),
        data
      );
      
      // Invalidar lista de utilizadores
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: 'Sucesso',
        description: 'Utilizador atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar utilizador.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para eliminar utilizador
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: (_data, userId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.user(userId) });
      
      // Invalidar lista de utilizadores
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: 'Sucesso',
        description: 'Utilizador eliminado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao eliminar utilizador.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para obter utilizadores filtrados por múltiplas funções
 */
export function useUsersByMultipleRoles(roles: string[]) {
  return useQuery({
    queryKey: ['users', 'multiple-roles', roles],
    queryFn: async () => {
      const promises = roles.map(role => usersService.getUsersByRole(role));
      const results = await Promise.all(promises);
      
      // Combinar resultados e remover duplicados
      const allUsers = results.flatMap(result => result.data || []);
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      return {
        data: uniqueUsers,
        success: true,
      };
    },
    enabled: roles.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obter estatísticas de utilizadores
 */
export function useUsersStats() {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: async () => {
      const response = await usersService.getUsers();
      const users = response.data || [];
      
      const stats = {
        total: users.length,
        active: users.filter((u: any) => u.isActive).length,
        inactive: users.filter((u: any) => !u.isActive).length,
        byRole: users.reduce((acc: any, user: any) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}),
      };
      
      return {
        data: stats,
        success: true,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}