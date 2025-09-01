import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';

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

  // Carregar permissões do utilizador
  const loadUserPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/permissions`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userPermissions = await response.json();
        setPermissions(userPermissions);
      } else {
        console.warn('Erro ao carregar permissões do utilizador');
        setPermissions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPermissions();
  }, [user, isAuthenticated]);

  // Verificar se utilizador tem permissão específica
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Verificar se tem a permissão específica
    return permissions.some(p => p.name === permission);
  };

  // Verificar se tem pelo menos uma das permissões
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };

  // Verificar se tem todas as permissões
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  };

  // Verificar se tem acesso a um módulo (permissão de leitura)
  const hasModuleAccess = (module: string): boolean => {
    return hasPermission(`${module}.read`) || hasPermission(`${module}.write`);
  };

  // Verificar se pode criar no módulo
  const canCreate = (module: string): boolean => {
    return hasPermission(`${module}.create`) || hasPermission(`${module}.write`);
  };

  // Verificar se pode editar no módulo
  const canUpdate = (module: string): boolean => {
    return hasPermission(`${module}.update`) || hasPermission(`${module}.write`);
  };

  // Verificar se pode eliminar no módulo
  const canDelete = (module: string): boolean => {
    return hasPermission(`${module}.delete`) || hasPermission(`${module}.write`);
  };

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