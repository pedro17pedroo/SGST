/**
 * Hook para gestão de dados do dashboard com React Query
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
import { useAuth } from '../../contexts/auth-context';
import { useModules } from '../../contexts/module-context';
import { useMemo } from 'react';

// Tipos para dashboard
// interface DashboardStats {
//   totalProducts: number;
//   totalOrders: number;
//   totalRevenue: string;
//   totalCustomers: number;
//   lowStockProducts: number;
//   pendingOrders: number;
//   monthlyRevenue: string;
//   monthlyOrders: number;
//   revenueGrowth: number;
//   ordersGrowth: number;
// } // Removed unused interface

// interface TopProduct {
//   id: string;
//   name: string;
//   sku: string;
//   totalSold: number;
//   revenue: string;
//   category?: string;
// } // Removed unused interface

// interface RecentActivity {
//   id: string;
//   type: 'order' | 'product' | 'customer' | 'inventory';
//   title: string;
//   description: string;
//   timestamp: string;
//   userId?: string;
//   userName?: string;
//   metadata?: Record<string, any>;
// } // Removed unused interface

// interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   message?: string;
// } // Removed unused interface

// Chaves de query para dashboard tipadas
export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  stats: () => [...DASHBOARD_QUERY_KEYS.all, 'stats'] as const,
  topProducts: (limit?: number) => [...DASHBOARD_QUERY_KEYS.all, 'topProducts', limit] as const,
  recentActivities: (limit?: number) => [...DASHBOARD_QUERY_KEYS.all, 'recentActivities', limit] as const,
};

// Hook para obter estatísticas do dashboard
export function useDashboardStats() {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('dashboard'));
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats(),
    queryFn: dashboardService.getStats,
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para obter produtos mais vendidos
export function useTopProducts(limit = 10) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('dashboard'));
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.topProducts(limit),
    queryFn: () => dashboardService.getTopProducts(),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para obter atividades recentes
export function useRecentActivities(limit = 20) {
  const { user } = useAuth();
  const { isModuleEnabled } = useModules();
  
  const canLoadData = useMemo(() => {
    return !!(user && isModuleEnabled('dashboard'));
  }, [user, isModuleEnabled]);

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentActivities(limit),
    queryFn: () => dashboardService.getRecentActivities(),
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    enabled: canLoadData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook combinado para todos os dados do dashboard
export function useDashboardData(options?: { topProductsLimit?: number; activitiesLimit?: number }) {
  const stats = useDashboardStats();
  const topProducts = useTopProducts(options?.topProductsLimit);
  const recentActivities = useRecentActivities(options?.activitiesLimit);

  return {
    stats,
    topProducts,
    recentActivities,
    isLoading: stats.isLoading || topProducts.isLoading || recentActivities.isLoading,
    isError: stats.isError || topProducts.isError || recentActivities.isError,
    error: stats.error || topProducts.error || recentActivities.error,
    refetch: () => {
      stats.refetch();
      topProducts.refetch();
      recentActivities.refetch();
    },
  };
}