import { useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Permission } from './use-permissions-unified';

/**
 * Hook simplificado para usar permissões do AuthContext
 * Garante reatividade automática quando as permissões mudam
 */
export function useAuthPermissions() {
  const { permissions, permissionsLoading, isAuthenticated, refreshPermissions } = useAuth();

  // Memoizar conjunto de permissões para otimizar verificações
  const permissionSet = useMemo(() => {
    return new Set(permissions.map((p: Permission) => p.name));
  }, [permissions]);

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = useCallback((permission: string): boolean => {
    if (!isAuthenticated) return false;
    return permissionSet.has(permission);
  }, [isAuthenticated, permissionSet]);

  // Função para verificar se o usuário tem qualquer uma das permissões
  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    if (!isAuthenticated) return false;
    return permissionList.some(permission => permissionSet.has(permission));
  }, [isAuthenticated, permissionSet]);

  // Função para verificar se o usuário tem todas as permissões
  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    if (!isAuthenticated) return false;
    return permissionList.every(permission => permissionSet.has(permission));
  }, [isAuthenticated, permissionSet]);

  // Função para verificar acesso a um módulo
  const hasModuleAccess = useCallback((module: string): boolean => {
    if (!isAuthenticated) {
      return false;
    }
    
    // Mapear nomes de módulos para os nomes usados nas permissões
    const moduleMapping: Record<string, string[]> = {
      'dashboard': ['dashboard.read'],
      'products': ['products.read'],
      'inventory': ['inventory.read'],
      'orders': ['orders.read'],
      'warehouses': ['warehouses.read'],
      'customers': ['customers.read'],
      'suppliers': ['suppliers.read'],
      'users': ['users.read'],
      'roles': ['roles.read'],
      'settings': ['settings.read'],
      'reports': ['reports.read'],
      'fleet': ['fleet.read'],
      'picking': ['picking.read'],
      'shipping': ['shipping.read'],
      'returns': ['returns.read'],
      'product_locations': ['inventory.read'],
      'inventory_counts': ['inventory.count'],
      'alerts': ['inventory.read'],
      'advanced_analytics': ['reports.read'],
      'ai_analytics': ['reports.read'],
      'angola_operations': ['orders.read'],
      'fleet_management': ['fleet.read']
    };
    
    const requiredPermissions = moduleMapping[module] || [`${module}.read`];
    return hasAnyPermission(requiredPermissions);
  }, [isAuthenticated, hasAnyPermission]);

  return {
    permissions,
    isLoading: permissionsLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    refreshPermissions,
    permissionCount: permissions.length
  };
}

/**
 * Hook para verificação simples de permissão
 */
export function usePermissionCheck() {
  const { hasPermission } = useAuthPermissions();
  return hasPermission;
}

/**
 * Hook para verificação de acesso a módulo
 */
export function useModuleAccess() {
  const { hasModuleAccess } = useAuthPermissions();
  return hasModuleAccess;
}