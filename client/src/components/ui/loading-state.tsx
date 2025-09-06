import { cn } from "@/lib/utils";
import { InlineLoading, CardLoading } from "@/components/ui/loading-spinner";
import { 
  KPISkeleton, 
  TableSkeleton, 
  ProductListSkeleton, 
  FormSkeleton, 
  CardSkeleton, 
  ActivityListSkeleton, 
  ChartSkeleton, 
  MenuSkeleton, 
  DetailsSkeleton, 
  VehicleListSkeleton 
} from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onRetry?: () => void;
  className?: string;
}

/**
 * Componente universal para gerenciar estados de loading, erro e vazio
 */
export function LoadingState({
  isLoading,
  error,
  isEmpty = false,
  children,
  loadingComponent,
  emptyComponent,
  errorComponent,
  onRetry,
  className,
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        {loadingComponent || <InlineLoading text="Carregando..." />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("w-full", className)}>
        {errorComponent || (
          <ErrorState 
            error={error} 
            onRetry={onRetry} 
          />
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn("w-full", className)}>
        {emptyComponent || <EmptyState />}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

/**
 * Componente para estado de erro
 */
export function ErrorState({ 
  error, 
  onRetry, 
  className 
}: { 
  error: Error; 
  onRetry?: () => void; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className
    )}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Ocorreu um erro
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {error.message || "Algo deu errado. Tente novamente."}
      </p>
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Tentar novamente</span>
        </Button>
      )}
    </div>
  );
}

/**
 * Componente para estado vazio
 */
export function EmptyState({ 
  title = "Nenhum item encontrado", 
  description = "Não há dados para exibir no momento.", 
  icon, 
  action, 
  className 
}: { 
  title?: string; 
  description?: string; 
  icon?: React.ReactNode; 
  action?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className
    )}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {description}
      </p>
      {action && action}
    </div>
  );
}

/**
 * Hook para estados de loading padronizados
 */
export function useLoadingStates<T>(data: T[] | null, isLoading: boolean, error: Error | null) {
  const isEmpty = !isLoading && !error && (!data || data.length === 0);
  
  return {
    isLoading,
    error,
    isEmpty,
    hasData: !isLoading && !error && data && data.length > 0,
  };
}

/**
 * Componentes de loading específicos para diferentes contextos
 */
export const LoadingComponents = {
  KPI: () => <KPISkeleton />,
  Table: (props?: { rows?: number; columns?: number }) => <TableSkeleton {...props} />,
  ProductList: (props?: { count?: number; isMobile?: boolean }) => <ProductListSkeleton {...props} />,
  Form: (props?: { fields?: number }) => <FormSkeleton {...props} />,
  Cards: (props?: { count?: number }) => <CardSkeleton {...props} />,
  Activities: (props?: { count?: number }) => <ActivityListSkeleton {...props} />,
  Chart: (props?: { height?: string }) => <ChartSkeleton {...props} />,
  Menu: (props?: { items?: number }) => <MenuSkeleton {...props} />,
  Details: () => <DetailsSkeleton />,
  Vehicles: (props?: { count?: number }) => <VehicleListSkeleton {...props} />,
  Spinner: (props?: { text?: string; size?: "sm" | "md" | "lg" }) => <InlineLoading {...props} />,
  Card: (props?: { title?: string; description?: string }) => <CardLoading {...props} />,
};

/**
 * Wrapper para páginas com loading
 */
export function PageLoadingWrapper({ 
  isLoading, 
  error, 
  onRetry, 
  children, 
  loadingComponent, 
  className 
}: {
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className={cn("container mx-auto p-4", className)}>
        {loadingComponent || (
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <LoadingComponents.KPI />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LoadingComponents.Chart />
              <LoadingComponents.Activities />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("container mx-auto p-4", className)}>
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

/**
 * Componente para loading de dados em tempo real
 */
export function RealtimeLoadingIndicator({ 
  isUpdating, 
  lastUpdate, 
  className 
}: { 
  isUpdating: boolean; 
  lastUpdate?: Date; 
  className?: string; 
}) {
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "agora mesmo";
    if (minutes === 1) return "há 1 minuto";
    return `há ${minutes} minutos`;
  };

  return (
    <div className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}>
      <div className={cn(
        "w-2 h-2 rounded-full",
        isUpdating ? "bg-green-500 animate-pulse" : "bg-gray-400"
      )} />
      <span>
        {isUpdating ? "Atualizando..." : lastUpdate ? `Atualizado ${formatLastUpdate(lastUpdate)}` : "Nunca atualizado"}
      </span>
    </div>
  );
}

/**
 * Componente para progresso de loading
 */
export function LoadingProgress({ 
  progress, 
  text, 
  className 
}: { 
  progress: number; 
  text?: string; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {text || "Carregando..."}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}