import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "secondary" | "destructive";
  className?: string;
  text?: string;
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const variantClasses = {
  default: "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary-foreground",
  destructive: "text-destructive",
};

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
  text,
  showText = false,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center space-x-2">
        <Loader2 
          className={cn(
            "animate-spin",
            sizeClasses[size],
            variantClasses[variant]
          )} 
        />
        {(showText || text) && (
          <span className={cn(
            "text-sm font-medium",
            variantClasses[variant]
          )}>
            {text || "Carregando..."}
          </span>
        )}
      </div>
    </div>
  );
}

// Spinner para botões
export function ButtonSpinner({ 
  size = "sm", 
  className 
}: { 
  size?: "sm" | "md"; 
  className?: string; 
}) {
  return (
    <Loader2 
      className={cn(
        "animate-spin",
        size === "sm" ? "h-4 w-4" : "h-5 w-5",
        className
      )} 
    />
  );
}

// Spinner para refresh/atualização
export function RefreshSpinner({ 
  isRefreshing, 
  size = "md", 
  className 
}: { 
  isRefreshing: boolean; 
  size?: "sm" | "md" | "lg"; 
  className?: string; 
}) {
  return (
    <RefreshCw 
      className={cn(
        sizeClasses[size],
        isRefreshing && "animate-spin",
        "text-muted-foreground",
        className
      )} 
    />
  );
}

// Loading overlay para páginas inteiras
export function LoadingOverlay({ 
  isLoading, 
  text, 
  className 
}: { 
  isLoading: boolean; 
  text?: string; 
  className?: string; 
}) {
  if (!isLoading) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-lg shadow-lg border">
        <LoadingSpinner size="lg" variant="primary" />
        {text && (
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Loading inline para seções específicas
export function InlineLoading({ 
  text, 
  size = "md", 
  className 
}: { 
  text?: string; 
  size?: "sm" | "md" | "lg"; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex items-center justify-center py-8",
      className
    )}>
      <div className="flex flex-col items-center space-y-3">
        <LoadingSpinner size={size} variant="primary" />
        {text && (
          <p className="text-sm text-muted-foreground">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Loading para cards
export function CardLoading({ 
  title, 
  description, 
  className 
}: { 
  title?: string; 
  description?: string; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <LoadingSpinner size="lg" variant="primary" className="mb-4" />
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}

// Loading dots animados
export function LoadingDots({ 
  size = "md", 
  className 
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string; 
}) {
  const dotSize = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-current rounded-full animate-pulse",
            dotSize[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
}

// Loading para tabelas
export function TableLoading({ 
  // rows = 5, // Removed unused parameter 
  message = "Carregando dados...", 
  className 
}: { 
  rows?: number; 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={cn("text-center py-8", className)}>
      <LoadingSpinner size="lg" variant="primary" className="mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Loading para listas
export function ListLoading({ 
  message = "Carregando itens...", 
  className 
}: { 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12",
      className
    )}>
      <LoadingSpinner size="lg" variant="primary" className="mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Loading para formulários
export function FormLoading({ 
  message = "Processando...", 
  className 
}: { 
  message?: string; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex items-center justify-center p-6 bg-muted/50 rounded-lg",
      className
    )}>
      <div className="flex items-center space-x-3">
        <LoadingSpinner size="md" variant="primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {message}
        </span>
      </div>
    </div>
  );
}