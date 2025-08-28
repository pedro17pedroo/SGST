import { Header } from "@/components/layout/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { ProductsTable } from "@/components/dashboard/products-table";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function Dashboard() {
  const { stats, topProducts, activities, isLoadingStats, isLoadingProducts, isLoadingActivities } = useDashboardData();

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-page">
      <Header title="Dashboard" breadcrumbs={["Dashboard"]} />
      
      <div className="p-6 space-y-6">
        <KPICards data={stats} isLoading={isLoadingStats} />
        <ChartsSection />
        <RecentActivities activities={activities} isLoading={isLoadingActivities} />
        <ProductsTable products={topProducts} isLoading={isLoadingProducts} />
      </div>
    </div>
  );
}
