import { Card } from "@/components/ui/card";
import { Box, AlertTriangle, ShoppingCart, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { LoadingState, LoadingComponents } from "@/components/ui/loading-state";
import { ErrorBoundary } from "@/components/error-boundary";

interface KPIData {
  totalProducts: number;
  lowStock: number;
  pendingOrders: number;
  monthlySales: string;
}

interface KPICardsProps {
  data: KPIData;
  isLoading: boolean;
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  return (
    <ErrorBoundary>
      <KPICardsContent data={data} isLoading={isLoading} />
    </ErrorBoundary>
  );
}

function KPICardsContent({ data, isLoading }: KPICardsProps) {
  const kpis = [
    {
      title: "Total de Produtos",
      value: data.totalProducts?.toLocaleString() || "0",
      change: "+12% vs mês anterior",
      changeType: "positive" as const,
      icon: Box,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Stock Baixo",
      value: data.lowStock?.toString() || "0",
      subtitle: "Requer atenção",
      icon: AlertTriangle,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      valueColor: "text-destructive",
    },
    {
      title: "Pedidos Pendentes",
      value: data.pendingOrders?.toString() || "0",
      change: "-8% vs ontem",
      changeType: "negative" as const,
      icon: ShoppingCart,
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      title: "Vendas do Mês",
      value: data.monthlySales || "AOA 0",
      change: "+18% vs mês anterior",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-chart-2/10",
      iconColor: "text-chart-2",
    },
  ];

  return (
    <LoadingState
      isLoading={isLoading}
      loadingComponent={<LoadingComponents.KPI />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" data-testid="kpi-cards">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="p-4 sm:p-6 hover:shadow-md transition-shadow" data-testid={`kpi-card-${index}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate" data-testid={`kpi-title-${index}`}>
                  {kpi.title}
                </p>
                <p 
                  className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold ${kpi.valueColor || 'text-foreground'} break-words`}
                  data-testid={`kpi-value-${index}`}
                >
                  {kpi.value}
                </p>
                {kpi.change && (
                  <p 
                    className={`text-sm mt-1 flex items-center gap-1 ${
                      kpi.changeType === 'positive' ? 'text-chart-2' : 'text-destructive'
                    }`}
                    data-testid={`kpi-change-${index}`}
                  >
                    {kpi.changeType === 'positive' ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {kpi.change}
                  </p>
                )}
                {kpi.subtitle && (
                  <p className="text-sm text-muted-foreground mt-1" data-testid={`kpi-subtitle-${index}`}>
                    {kpi.subtitle}
                  </p>
                )}
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${kpi.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}>
                <Icon className={`${kpi.iconColor} w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7`} />
              </div>
            </div>
          </Card>
        );
      })}
      </div>
    </LoadingState>
  );
}