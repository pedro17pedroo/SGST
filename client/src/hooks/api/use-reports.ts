/**
 * Hook para gestão de relatórios
 */

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../../services/api.service';
import { CACHE_CONFIG, RETRY_CONFIG } from '../../config/api';
// import { RETRY_CONFIG } from '../../config/api'; // Removido - não utilizado

// Tipos para relatórios
// interface SalesReportData {
//   totalSales: number;
//   totalRevenue: string;
//   averageOrderValue: string;
//   topProducts: {
//     productId: string;
//     productName: string;
//     quantitySold: number;
//     revenue: string;
//   }[];
//   salesByPeriod: {
//     period: string;
//     sales: number;
//     revenue: string;
//   }[];
//   salesByCategory: {
//     categoryId: string;
//     categoryName: string;
//     sales: number;
//     revenue: string;
//   }[];
// }

// interface InventoryReportData {
//   totalProducts: number;
//   totalValue: string;
//   lowStockItems: {
//     productId: string;
//     productName: string;
//     currentStock: number;
//     minStock: number;
//   }[];
//   outOfStockItems: {
//     productId: string;
//     productName: string;
//     lastStockDate: string;
//   }[];
//   topMovingProducts: {
//     productId: string;
//     productName: string;
//     movementCount: number;
//   }[];
//   stockByCategory: {
//     categoryId: string;
//     categoryName: string;
//     totalItems: number;
//     totalValue: string;
//   }[];
// }

// interface PerformanceReportData {
//   orderFulfillmentRate: number;
//   averageDeliveryTime: number;
//   customerSatisfactionRate: number;
//   returnRate: number;
//   topPerformingProducts: {
//     productId: string;
//     productName: string;
//     performanceScore: number;
//   }[];
//   monthlyPerformance: {
//     month: string;
//     ordersProcessed: number;
//     fulfillmentRate: number;
//     averageDeliveryTime: number;
//   }[];
// }

interface ReportParams {
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
  categoryId?: string;
  customerId?: string;
  supplierId?: string;
}
//   groupBy?: 'day' | 'week' | 'month' | 'year';
//   limit?: number;
// }

// interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   message?: string;
// }

// Chaves de query tipadas
export const REPORTS_QUERY_KEYS = {
  all: ['reports'] as const,
  sales: (params?: ReportParams) => [...REPORTS_QUERY_KEYS.all, 'sales', params] as const,
  inventory: (params?: ReportParams) => [...REPORTS_QUERY_KEYS.all, 'inventory', params] as const,
  performance: (params?: ReportParams) => [...REPORTS_QUERY_KEYS.all, 'performance', params] as const,
};

// Hook para relatório de vendas
export function useSalesReport(params?: ReportParams) {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.sales(params),
    queryFn: () => reportsService.getSalesReport(params),
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: (failureCount, error: any) => {
      // Não tentar novamente para erros 4xx
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para relatório de inventário
export function useInventoryReport(params?: ReportParams) {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.inventory(params),
    queryFn: () => reportsService.getInventoryReport(params),
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}

// Hook para relatório de performance
export function usePerformanceReport(params?: ReportParams) {
  return useQuery({
    queryKey: REPORTS_QUERY_KEYS.performance(params),
    queryFn: () => reportsService.getPerformanceReport(params),
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < RETRY_CONFIG.read.retry;
    },
  });
}