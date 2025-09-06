import React, { useMemo } from 'react';
import { useAuthPermissions } from '../../hooks/use-auth-permissions';
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

export const PermissionGuard = React.memo(function PermissionGuard({
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
  const { user, isAuthenticated, isReady } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasModuleAccess, isLoading } = useAuthPermissions();

  const hasAccess = useMemo(() => {
    // Se deve mostrar para usuários não autenticados
    if (!isAuthenticated && showForUnauthenticated) {
      return true;
    }

    // Se não está autenticado e não deve mostrar para não autenticados
    if (!isAuthenticated) {
      return false;
    }

    // Se o sistema não está pronto (auth ou permissões carregando), não mostrar
    if (!isReady || isLoading) {
      return false;
    }

    // Verificar roles se especificadas
    if (roles && roles.length > 0) {
      if (!user?.role || !roles.includes(user.role)) {
        return false;
      }
    }

    // Verificar módulo se especificado
    if (module) {
      if (!hasModuleAccess(module)) {
        return false;
      }
    }

    // Verificar permissão específica
    if (permission) {
      return hasPermission(permission);
    }

    // Verificar lista de permissões
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        return hasAllPermissions(permissions);
      } else {
        return hasAnyPermission(permissions);
      }
    }

    // Verificar permissão baseada em módulo e ação
    if (module && action) {
      const modulePermission = `${module}.${action}`;
      return hasPermission(modulePermission);
    }

    // Se chegou até aqui sem especificar critérios, permitir acesso
    return true;
  }, [
    isAuthenticated,
    isReady,
    showForUnauthenticated,
    user?.role,
    roles,
    module,
    permission,
    permissions,
    requireAll,
    action,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess
  ]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
});

// Hook para verificar permissões em componentes
export function usePermissionCheck() {
  const { user, isAuthenticated } = useAuth();
  const permissions = useAuthPermissions();

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
      const modulePermission = `${module}.${action}`;
      if (!permissions.hasPermission(modulePermission)) {
        return false;
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