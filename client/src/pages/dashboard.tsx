import { Header } from "@/components/layout/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { ProductsTable } from "@/components/dashboard/products-table";
import { StockAlerts } from "@/components/inventory/stock-alerts";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function Dashboard() {
  const { stats, topProducts, activities, isLoadingStats, isLoadingProducts, isLoadingActivities } = useDashboardData();

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Header title="Dashboard" breadcrumbs={["Dashboard"]} />
      
      <div className="px-6 py-4 space-y-6">
        <KPICards data={stats} isLoading={isLoadingStats} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <ChartsSection />
          </div>
          <div className="lg:col-span-1">
            <StockAlerts />
          </div>
        </div>
        <RecentActivities activities={activities} isLoading={isLoadingActivities} />
        <ProductsTable products={topProducts} isLoading={isLoadingProducts} />
      </div>
    </div>
  );
}
