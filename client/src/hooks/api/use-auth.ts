/**
 * Hook para gestão de autenticação
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/api.service';
import { useToast } from '../use-toast';
import { CACHE_CONFIG } from '../../config/api';

// Tipos para autenticação
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   permissions: string[];
//   avatar?: string;
//   isActive: boolean;
//   lastLogin?: string;
//   createdAt: string;
// }

// interface AuthResponse {
//   user: User;
//   token: string;
//   refreshToken?: string;
//   expiresIn: number;
// } // Removed unused interface

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Chaves de query para autenticação
export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  user: () => [...AUTH_QUERY_KEYS.all, 'user'] as const,
  profile: () => [...AUTH_QUERY_KEYS.all, 'profile'] as const,
};

// Hook para obter usuário atual
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user(),
    queryFn: authService.getProfile,
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: false, // Não tentar novamente para autenticação
  });
}

// Hook para login
export function useLogin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>, Error, LoginCredentials>({
    mutationFn: authService.login,
    onSuccess: (response) => {
      // Armazenar dados do usuário no cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.user(), {
        success: true,
        data: response.data.user,
      });
      
      // Invalidar todos os caches para garantir dados atualizados
      queryClient.invalidateQueries();
      
      toast({
        title: 'Login realizado',
        description: `Bem-vindo, ${response.data.user.name}!`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro de autenticação',
        description: error.message || 'Credenciais inválidas.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para logout
export function useLogout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Limpar todos os caches
      queryClient.clear();
      
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
        variant: 'default',
      });
    },
    onError: (error) => {
      // Mesmo com erro, limpar caches locais
      queryClient.clear();
      
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer logout.',
        variant: 'destructive',
      });
    },
  });
}

// Hook para atualizar token
export function useRefreshToken() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ accessToken: string; refreshToken: string }>, Error, string>({
    mutationFn: authService.refreshToken,
    onSuccess: () => {
      // Invalidar cache do usuário para recarregar com novo token
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user() });
      
      toast({
        title: 'Token atualizado',
        description: 'Sua sessão foi renovada com sucesso.',
        variant: 'default',
      });
    },
    onError: () => {
      // Em caso de erro, fazer logout
      queryClient.clear();
      
      toast({
        title: 'Sessão expirada',
        description: 'Por favor, faça login novamente.',
        variant: 'destructive',
      });
    },
  });
}