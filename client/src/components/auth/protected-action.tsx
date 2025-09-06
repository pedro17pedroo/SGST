import React from 'react';
import { PermissionGuard } from './permission-guard';
import { usePermissions } from '@/hooks/use-permissions-unified';

interface ProtectedActionProps {
  module: string;
  action: 'create' | 'update' | 'delete' | 'read';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission?: string;
}

/**
 * Componente para proteger ações específicas (botões, links, etc.)
 * Usa o PermissionGuard internamente mas com uma interface mais simples
 */
export const ProtectedAction = React.memo(function ProtectedAction({
  module,
  action,
  children,
  fallback = null,
  permission
}: ProtectedActionProps) {
  return (
    <PermissionGuard
      module={module}
      action={action}
      permission={permission}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
});

/**
 * Hook para verificar se uma ação é permitida
 */
export function useActionPermission(module: string, action: 'create' | 'update' | 'delete' | 'read') {
  const { hasModuleAccess, canCreate, canUpdate, canDelete, canView } = usePermissions();
  
  const isAllowed = React.useMemo(() => {
    if (!hasModuleAccess(module)) return false;
    
    switch (action) {
      case 'create':
        return canCreate(module);
      case 'update':
        return canUpdate(module);
      case 'delete':
        return canDelete(module);
      case 'read':
        return canView(module);
      default:
        return false;
    }
  }, [module, action, hasModuleAccess, canCreate, canUpdate, canDelete, canView]);
  
  return isAllowed;
}

/**
 * Componente para proteger botões de ação
 */
export const ProtectedButton = React.memo(function ProtectedButton({
  module,
  action,
  children,
  ...buttonProps
}: ProtectedActionProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const isAllowed = useActionPermission(module, action);
  
  if (!isAllowed) {
    return null;
  }
  
  return (
    <button {...buttonProps}>
      {children}
    </button>
  );
});