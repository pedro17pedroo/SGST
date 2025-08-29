import { Card } from "@/components/ui/card";
import { Box, AlertTriangle, ShoppingCart, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="card-mobile animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" data-testid="kpi-cards">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="card-mobile" data-testid={`kpi-card-${index}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground" data-testid={`kpi-title-${index}`}>
                  {kpi.title}
                </p>
                <p 
                  className={`text-xl sm:text-2xl lg:text-3xl font-bold ${kpi.valueColor || 'text-foreground'}`}
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
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`${kpi.iconColor} text-xl`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}