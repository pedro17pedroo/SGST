import React from 'react';
import { usePermissions } from '../../hooks/use-permissions';
import { useAuth } from '../../contexts/auth-context';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  module?: string;
  action?: 'read' | 'create' | 'update' | 'delete';
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showForUnauthenticated?: boolean;
}

export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  module,
  action,
  roles = [],
  children,
  fallback = null,
  showForUnauthenticated = false
}: PermissionGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess, canCreate, canUpdate, canDelete } = usePermissions();

  // Se não estiver autenticado
  if (!isAuthenticated) {
    return showForUnauthenticated ? <>{children}</> : <>{fallback}</>;
  }

  // Verificar roles se especificado
  if (roles.length > 0) {
    const hasRole = user && roles.includes(user.role);
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  // Verificar módulo e ação específica
  if (module && action) {
    let hasAccess = false;
    
    switch (action) {
      case 'read':
        hasAccess = hasModuleAccess(module);
        break;
      case 'create':
        hasAccess = canCreate(module);
        break;
      case 'update':
        hasAccess = canUpdate(module);
        break;
      case 'delete':
        hasAccess = canDelete(module);
        break;
    }
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Verificar permissão única
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
  }

  // Verificar lista de permissões
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Hook para verificar permissões em componentes
export function usePermissionCheck() {
  const { user, isAuthenticated } = useAuth();
  const permissions = usePermissions();

  const checkPermission = (
    permission?: string,
    permissionList?: string[],
    requireAll = false,
    module?: string,
    action?: 'read' | 'create' | 'update' | 'delete',
    rolesList?: string[]
  ): boolean => {
    if (!isAuthenticated) return false;

    // Verificar roles
    if (rolesList && rolesList.length > 0) {
      const hasRole = user && rolesList.includes(user.role);
      if (!hasRole) return false;
    }

    // Verificar módulo e ação
    if (module && action) {
      switch (action) {
        case 'read':
          if (!permissions.hasModuleAccess(module)) return false;
          break;
        case 'create':
          if (!permissions.canCreate(module)) return false;
          break;
        case 'update':
          if (!permissions.canUpdate(module)) return false;
          break;
        case 'delete':
          if (!permissions.canDelete(module)) return false;
          break;
      }
    }

    // Verificar permissão específica
    if (permission && !permissions.hasPermission(permission)) {
      return false;
    }

    // Verificar lista de permissões
    if (permissionList && permissionList.length > 0) {
      const hasRequiredPermissions = requireAll 
        ? permissions.hasAllPermissions(permissionList)
        : permissions.hasAnyPermission(permissionList);
      
      if (!hasRequiredPermissions) return false;
    }

    return true;
  };

  return { checkPermission, ...permissions };
}