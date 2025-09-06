import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useModules } from "@/contexts/module-context";
import { useMemo } from "react";
// import { useEffect } from "react"; // Removido temporariamente

interface KPIData {
  totalProducts: number;
  lowStock: number;
  pendingOrders: number;
  monthlySales: string;
}

interface ProductWithStock {
  id: string;
  name: string;
  sku: string;
  price: string;
  categoryId: string | null;
  stock: number;
  sales: number;
  category?: {
    name: string;
  } | null;
}

interface Activity {
  id: string;
  type: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product: {
    name: string;
  };
  user?: {
    username: string;
  };
}

export function useDashboardData() {
  const { isAuthenticated, isReady } = useAuth();
  const { isLoading: isModulesLoading } = useModules();

  // Calcular se o sistema está pronto para carregar dados
  const canLoadData = useMemo(() => {
    return isAuthenticated && isReady && !isModulesLoading;
  }, [isAuthenticated, isReady, isModulesLoading]);

  const { 
    data: stats = { totalProducts: 0, lowStock: 0, pendingOrders: 0, monthlySales: "AOA 0" }, 
    isLoading: isLoadingStats 
  } = useQuery<KPIData>({
    queryKey: ["/api/dashboard/stats"],
    enabled: canLoadData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const { 
    data: topProducts = [], 
    isLoading: isLoadingProducts 
  } = useQuery<ProductWithStock[]>({
    queryKey: ["/api/dashboard/top-products"],
    enabled: canLoadData,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const { 
    data: activities = [], 
    isLoading: isLoadingActivities 
  } = useQuery<Activity[]>({
    queryKey: ["/api/dashboard/recent-activities"],
    enabled: canLoadData,
    staleTime: 2 * 60 * 1000, // 2 minutos (mais frequente para atividades)
    refetchOnWindowFocus: false,
  });

  // Estado de loading efetivo que considera o estado do sistema
  const effectiveLoadingStats = !canLoadData || isLoadingStats;
  const effectiveLoadingProducts = !canLoadData || isLoadingProducts;
  const effectiveLoadingActivities = !canLoadData || isLoadingActivities;

  return {
    stats,
    topProducts,
    activities,
    isLoadingStats: effectiveLoadingStats,
    isLoadingProducts: effectiveLoadingProducts,
    isLoadingActivities: effectiveLoadingActivities,
    canLoadData,
  };
}
