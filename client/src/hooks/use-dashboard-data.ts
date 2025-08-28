import { useQuery } from "@tanstack/react-query";

export function useDashboardData() {
  const { 
    data: stats = { totalProducts: 0, lowStock: 0, pendingOrders: 0, monthlySales: "AOA 0" }, 
    isLoading: isLoadingStats 
  } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { 
    data: topProducts = [], 
    isLoading: isLoadingProducts 
  } = useQuery({
    queryKey: ["/api/dashboard/top-products"],
  });

  const { 
    data: activities = [], 
    isLoading: isLoadingActivities 
  } = useQuery({
    queryKey: ["/api/dashboard/recent-activities"],
  });

  return {
    stats,
    topProducts,
    activities,
    isLoadingStats,
    isLoadingProducts,
    isLoadingActivities,
  };
}
