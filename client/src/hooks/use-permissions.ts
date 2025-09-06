import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/auth-context';
import { apiRequest } from '../lib/queryClient';

// Cache para permissões por usuário
const permissionsCache = new Map<string, { permissions: Permission[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Carregar permissões do utilizador com cache
  const loadUserPermissions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions([]);
      setLoading(false);
      lastUserIdRef.current = null;
      return;
    }

    // Evitar recarregar se for o mesmo usuário
    if (lastUserIdRef.current === user.id) {
      return;
    }

    // Verificar cache primeiro
    const cached = permissionsCache.get(user.id);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setPermissions(cached.permissions);
      lastUserIdRef.current = user.id;
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest('GET', `/api/users/${user.id}/permissions`);
      const userPermissions = await response.json();
      
      // Atualizar cache
      permissionsCache.set(user.id, {
        permissions: userPermissions,
        timestamp: Date.now()
      });
      
      setPermissions(userPermissions);
      lastUserIdRef.current = user.id;
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissions([]);
      lastUserIdRef.current = null;
      // Remover do cache em caso de erro
      permissionsCache.delete(user.id);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    loadUserPermissions();
  }, [loadUserPermissions]);

  // Memoizar conjunto de permissões para otimizar verificações
  const permissionSet = useMemo(() => {
    return new Set(permissions.map(p => p.name));
  }, [permissions]);

  // Verificar se utilizador tem permissão específica
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Verificar se tem a permissão específica usando Set para melhor performance
    return permissionSet.has(permission);
  }, [isAuthenticated, user?.role, permissionSet]);

  // Verificar se tem pelo menos uma das permissões
  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  // Verificar se tem todas as permissões
  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  // Verificar se tem acesso a um módulo (permissão de leitura)
  const hasModuleAccess = useCallback((module: string): boolean => {
    return hasPermission(`${module}.read`) || hasPermission(`${module}.write`);
  }, [hasPermission]);

  // Verificar se pode criar no módulo
  const canCreate = useCallback((module: string): boolean => {
    return hasPermission(`${module}.create`) || hasPermission(`${module}.write`);
  }, [hasPermission]);

  // Verificar se pode editar no módulo
  const canUpdate = useCallback((module: string): boolean => {
    return hasPermission(`${module}.update`) || hasPermission(`${module}.write`);
  }, [hasPermission]);

  // Verificar se pode eliminar no módulo
  const canDelete = useCallback((module: string): boolean => {
    return hasPermission(`${module}.delete`) || hasPermission(`${module}.write`);
  }, [hasPermission]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    canCreate,
    canUpdate,
    canDelete,
    reload: loadUserPermissions
  };
}