/**
 * Hook aprimorado para autenticação com React Query
 * Mantém compatibilidade com o contexto existente e adiciona funcionalidades avançadas
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api.service';
import { useAuth } from '../contexts/auth-context';
import { useToast } from './use-toast';
import { CACHE_CONFIG } from '../config/api';
// import type { User } from '../contexts/auth-context'; // Removido temporariamente

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  user: () => [...AUTH_QUERY_KEYS.all, 'user'] as const,
  permissions: () => [...AUTH_QUERY_KEYS.all, 'permissions'] as const,
  profile: () => [...AUTH_QUERY_KEYS.all, 'profile'] as const,
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Hook aprimorado para autenticação
 * Combina o contexto existente com React Query para melhor gestão de estado
 */
export function useAuthEnhanced() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obter dados do usuário atual
  const userQuery = useQuery({
    queryKey: AUTH_QUERY_KEYS.user(),
    queryFn: authService.getProfile,
    enabled: auth.isAuthenticated,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: false, // Não tentar novamente se falhar (pode ser 401)
  });

  // Query para obter permissões do usuário (simulada por enquanto)
  const permissionsQuery = useQuery({
    queryKey: AUTH_QUERY_KEYS.permissions(),
    queryFn: async () => {
      // Por enquanto, retornar permissões baseadas no papel do usuário
      if (!auth.user) return [];
      const rolePermissions: Record<string, string[]> = {
        admin: ['read', 'write', 'delete', 'manage_users', 'manage_inventory'],
        manager: ['read', 'write', 'manage_inventory'],
        employee: ['read', 'write'],
        viewer: ['read']
      };
      return rolePermissions[auth.user.role] || [];
    },
    enabled: auth.isAuthenticated,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
  });

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      return response.data; // Extrair dados da resposta da API
    },
    onSuccess: async (authData) => {
      // Usar o método login do contexto para manter compatibilidade
      await auth.login(authData);
      
      // Invalidar queries relacionadas à autenticação
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });
      
      toast({
        title: 'Sucesso',
        description: 'Login realizado com sucesso!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro no Login',
        description: error.message || 'Credenciais inválidas',
        variant: 'destructive',
      });
    },
  });

  // Mutation para logout
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Usar o método logout do contexto
      auth.logout();
      
      // Limpar todas as queries do cache
      queryClient.clear();
      
      toast({
        title: 'Logout',
        description: 'Sessão encerrada com sucesso.',
      });
    },
    onError: (error: Error) => {
      // Mesmo com erro, fazer logout local
      auth.logout();
      queryClient.clear();
      
      console.error('Erro no logout:', error);
    },
  });

  // Mutation para refresh token
  const refreshTokenMutation = useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await authService.refreshToken(refreshToken);
      return response.data; // Extrair dados da resposta da API
    },
    onSuccess: (response: RefreshTokenResponse) => {
      // Atualizar tokens no localStorage
      const savedAuthData = localStorage.getItem('sgst-user');
      if (savedAuthData) {
        try {
          const authData = JSON.parse(savedAuthData);
          const updatedAuthData = {
            ...authData,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          };
          localStorage.setItem('sgst-user', JSON.stringify(updatedAuthData));
        } catch (error) {
          console.error('Erro ao atualizar tokens:', error);
        }
      }
    },
    onError: () => {
      // Se refresh falhar, fazer logout
      auth.handleUnauthorized();
    },
  });

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permission: string): boolean => {
    if (!permissionsQuery.data || !Array.isArray(permissionsQuery.data)) return false;
    return permissionsQuery.data.includes(permission);
  };

  // Função para verificar se o usuário tem um papel específico
  const hasRole = (role: string): boolean => {
    if (!auth.user) return false;
    return auth.user.role === role;
  };

  return {
    // Estado do contexto existente
    ...auth,
    
    // Dados das queries
    userData: userQuery.data,
    permissions: permissionsQuery.data,
    
    // Estados de loading
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isRefreshingToken: refreshTokenMutation.isPending,
    isUserDataLoading: userQuery.isLoading,
    isPermissionsLoading: permissionsQuery.isLoading,
    
    // Funções de ação
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    
    // Funções de verificação
    hasPermission,
    hasRole,
    
    // Funções utilitárias
    refetchUser: userQuery.refetch,
    refetchPermissions: permissionsQuery.refetch,
    
    // Erros
    loginError: loginMutation.error,
    userError: userQuery.error,
    permissionsError: permissionsQuery.error,
  };
}

/**
 * Hook simplificado para verificação de permissões do usuário autenticado
 */
export function useUserPermissions() {
  const { permissions, hasPermission, hasRole, isPermissionsLoading } = useAuthEnhanced();
  
  return {
    permissions,
    hasPermission,
    hasRole,
    isLoading: isPermissionsLoading,
  };
}

/**
 * Hook para proteção de rotas
 */
export function useRouteProtection() {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuthEnhanced();
  
  const canAccess = (requiredPermission?: string, requiredRole?: string): boolean => {
    if (!isAuthenticated) return false;
    
    if (requiredPermission && !hasPermission(requiredPermission)) {
      return false;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      return false;
    }
    
    return true;
  };
  
  return {
    isAuthenticated,
    isLoading,
    canAccess,
    hasPermission,
    hasRole,
  };
}