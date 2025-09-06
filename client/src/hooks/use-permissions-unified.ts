import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { apiServices } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';

/**
 * Interface para uma permissão do sistema
 */
export interface Permission {
  id: string;
  name: string;
  description?: string;
  module?: string;
  action?: string;
}

/**
 * Chaves de query para React Query
 */
export const PERMISSIONS_QUERY_KEYS = {
  all: ['permissions'] as const,
  user: (userId: string) => ['permissions', 'user', userId] as const,
  system: () => ['permissions', 'system'] as const,
} as const;

/**
 * Hook principal para gerenciamento de permissões do usuário
 * Combina carregamento otimizado com verificações de permissões
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  // const { toast } = useToast();
  const lastUserIdRef = useRef<string | null>(null);
  
  // Otimização: Removidos logs de debug para melhor performance

  // Query para carregar permissões do usuário
  const {
    data: permissions = [],
    isLoading,
    error,
    refetch
  } = useQuery<Permission[], Error>({
    queryKey: PERMISSIONS_QUERY_KEYS.user(user?.id || ''),
    queryFn: async (): Promise<Permission[]> => {
      if (!user?.id) {
        return [];
      }
      
      try {
        // Usar a rota específica para permissões do usuário
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001';
        const savedAuthData = localStorage.getItem('sgst-user');
        const authData = savedAuthData ? JSON.parse(savedAuthData) : null;
        const accessToken = authData?.accessToken;
        
        if (!accessToken) {
          throw new Error('Token de acesso não encontrado');
        }
        
        const url = `${apiUrl}/api/users/${user.id}/permissions`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const permissions = await response.json();
        return permissions || [];
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        throw error;
      }
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Evitar refetch desnecessário
  });

  // Recarregar permissões quando o usuário mudar
  const loadUserPermissions = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      return;
    }

    // Evitar recarregamento desnecessário para o mesmo usuário
    if (lastUserIdRef.current === user.id) {
      return;
    }

    lastUserIdRef.current = user.id;
    await refetch();
  }, [user?.id, isAuthenticated, refetch]);

  // Effect para carregar permissões quando necessário
  useEffect(() => {
    loadUserPermissions();
  }, [loadUserPermissions]);
  
  // Otimização: Removidos logs de debug para melhor performance

  // Memoizar conjunto de permissões para otimizar verificações
  const permissionSet = useMemo(() => {
    return new Set(permissions.map((p: Permission) => p.name));
  }, [permissions]);

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    return permissionSet.has(permission);
  }, [isAuthenticated, user, permissionSet]);

  // Função para verificar se o usuário tem qualquer uma das permissões
  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return permissionList.some(permission => permissionSet.has(permission));
  }, [isAuthenticated, user, permissionSet]);

  // Função para verificar se o usuário tem todas as permissões
  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return permissionList.every(permission => permissionSet.has(permission));
  }, [isAuthenticated, user, permissionSet]);

  // Função para verificar acesso a um módulo
  const hasModuleAccess = useCallback((module: string): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    // Debug removido
    
    // Mapear nomes de módulos para os nomes usados nas permissões
    const moduleMapping: Record<string, string[]> = {
      'dashboard': ['dashboard'],
      'products': ['products'],
      'inventory': ['inventory'],
      'orders': ['orders'],
      'warehouses': ['warehouses'],
      'suppliers': ['suppliers'],
      'customers': ['customers'],
      'users': ['users'],
      'roles': ['roles'],
      'settings': ['settings'],
      'vehicles': ['fleet'],
      'fleet': ['fleet'],
      'reports': ['reports']
    };
    
    const moduleNames = moduleMapping[module] || [module];
    
    // Verificar se tem qualquer permissão relacionada aos módulos mapeados
    for (const moduleName of moduleNames) {
      const readPermission = `${moduleName}.read`;
      const createPermission = `${moduleName}.create`;
      const updatePermission = `${moduleName}.update`;
      const deletePermission = `${moduleName}.delete`;
      
      // Debug removido
      
      if (permissionSet.has(readPermission) || 
          permissionSet.has(createPermission) || 
          permissionSet.has(updatePermission) || 
          permissionSet.has(deletePermission)) {
        return true;
      }
    }
    return false;
  }, [isAuthenticated, user, permissionSet]);

  // Funções de conveniência para operações CRUD
  const canCreate = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.create`);
  }, [hasPermission]);

  const canUpdate = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.update`);
  }, [hasPermission]);

  const canDelete = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.delete`);
  }, [hasPermission]);

  const canView = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}.view`);
  }, [hasPermission]);

  return {
    // Dados
    permissions,
    permissionSet,
    
    // Estados
    isLoading,
    error,
    
    // Funções de verificação
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    
    // Funções CRUD
    canCreate,
    canUpdate,
    canDelete,
    canView,
    
    // Funções de controle
    loadUserPermissions,
    refetch,
  };
}

/**
 * Hook para carregar todas as permissões do sistema
 */
export function useSystemPermissions() {
  const { toast } = useToast();

  const { data: systemPermissions, isLoading: isSystemLoading, error: systemError } = useQuery<Permission[], Error>({
    queryKey: PERMISSIONS_QUERY_KEYS.system(),
    queryFn: async (): Promise<Permission[]> => {
      try {
        const response = await apiServices.roles.getPermissions();
        return response.data;
      } catch (error) {
        console.error('Erro ao carregar permissões do sistema:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
    retry: 2,
  });

  // Efeito para mostrar toast de erro
  useEffect(() => {
    if (systemError) {
      console.error('Erro ao carregar permissões do sistema:', systemError);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as permissões do sistema.',
        variant: 'destructive',
      });
    }
  }, [systemError, toast]);

  return {
    data: systemPermissions,
    isLoading: isSystemLoading,
    error: systemError,
  };
}

/**
 * Hook simplificado para verificação rápida de permissões
 */
export function usePermissionCheck() {
  const { hasPermission, hasModuleAccess, isLoading } = usePermissions();
  
  return {
    hasPermission,
    hasModuleAccess,
    isLoading,
  };
}