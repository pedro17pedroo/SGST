import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Truck, AlertTriangle, Calendar, Activity as ActivityIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingState, EmptyState, LoadingComponents } from "@/components/ui/loading-state";

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

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  action?: string;
  icon: typeof AlertTriangle;
}

interface RecentActivitiesProps {
  activities: Activity[];
  isLoading: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Stock crítico em 23 produtos",
    description: "Recomenda-se reabastecer imediatamente",
    action: "Ver produtos →",
    icon: AlertTriangle,
  },
  {
    id: "2",
    type: "warning",
    title: "5 pedidos aguardam aprovação",
    description: "Valor total: AOA 125,450",
    action: "Revisar pedidos →",
    icon: Calendar,
  },
  {
    id: "3",
    type: "info",
    title: "Inventário mensal agendado",
    description: "Próxima contagem: 15 de Janeiro",
    action: "Preparar inventário →",
    icon: Calendar,
  },
];

export function RecentActivities({ activities, isLoading }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "in":
        return Plus;
      case "out":
        return Truck;
      default:
        return AlertTriangle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "in":
        return "bg-primary/10 text-primary";
      case "out":
        return "bg-chart-3/10 text-chart-3";
      default:
        return "bg-destructive/10 text-destructive";
    }
  };

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return {
          container: "bg-destructive/10 border-destructive/20",
          icon: "text-destructive",
          action: "text-destructive hover:text-destructive/80",
        };
      case "warning":
        return {
          container: "bg-chart-3/10 border-chart-3/20",
          icon: "text-chart-3",
          action: "text-chart-3 hover:text-chart-3/80",
        };
      case "info":
        return {
          container: "bg-chart-2/10 border-chart-2/20",
          icon: "text-chart-2",
          action: "text-chart-2 hover:text-chart-2/80",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6" data-testid="recent-activities">
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4" data-testid="activities-title">
          Atividades Recentes
        </h3>
        <LoadingState
          isLoading={isLoading}
          isEmpty={activities.length === 0}
          loadingComponent={<LoadingComponents.Activities count={3} />}
          emptyComponent={
            <EmptyState 
              title="Nenhuma atividade recente"
              description="Não há atividades para exibir no momento."
              icon={<ActivityIcon className="h-12 w-12 text-muted-foreground" />}
            />
          }
        >
          <div className="space-y-3 sm:space-y-4">
            {activities.slice(0, 5).map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);

              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 pb-3 border-b border-border last:border-0"
                  data-testid={`activity-${activity.id}`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 ${iconColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground break-words" data-testid={`activity-description-${activity.id}`}>
                      {activity.type === "in" ? "Entrada" : "Saída"} de {activity.quantity}x "{activity.product.name}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`activity-time-${activity.id}`}>
                      {formatDistanceToNow(new Date(activity.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })} {activity.user ? `por ${activity.user.username}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </LoadingState>
        <Button variant="ghost" className="w-full mt-3 sm:mt-4" data-testid="view-all-activities">
          Ver todas as atividades
        </Button>
      </Card>

      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4" data-testid="alerts-title">
          Alertas Importantes
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {mockAlerts.map((alert) => {
            const Icon = alert.icon;
            const styles = getAlertStyles(alert.type);

            return (
              <div 
                key={alert.id} 
                className={`p-3 sm:p-4 ${styles.container} border rounded-lg`}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`${styles.icon} mt-1 w-4 h-4 flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground" data-testid={`alert-title-${alert.id}`}>
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" data-testid={`alert-description-${alert.id}`}>
                      {alert.description}
                    </p>
                    {alert.action && (
                      <button 
                        className={`text-xs ${styles.action} font-medium mt-2 hover:underline`}
                        data-testid={`alert-action-${alert.id}`}
                      >
                        {alert.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
