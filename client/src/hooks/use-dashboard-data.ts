import { useQuery } from "@tanstack/react-query";

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
  const { 
    data: stats = { totalProducts: 0, lowStock: 0, pendingOrders: 0, monthlySales: "AOA 0" }, 
    isLoading: isLoadingStats 
  } = useQuery<KPIData>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { 
    data: topProducts = [], 
    isLoading: isLoadingProducts 
  } = useQuery<ProductWithStock[]>({
    queryKey: ["/api/dashboard/top-products"],
  });

  const { 
    data: activities = [], 
    isLoading: isLoadingActivities 
  } = useQuery<Activity[]>({
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
