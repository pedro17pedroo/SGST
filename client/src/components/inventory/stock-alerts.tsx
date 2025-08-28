import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Package } from "lucide-react";
import { Link } from "wouter";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStockLevel: number;
  category?: {
    name: string;
  } | null;
}

export function StockAlerts() {
  const { data: lowStockProducts = [], isLoading } = useQuery<LowStockProduct[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const getCriticalityLevel = (stock: number, minLevel: number) => {
    const percentage = (stock / minLevel) * 100;
    if (percentage <= 25) return { level: "critical", color: "destructive" as const };
    if (percentage <= 50) return { level: "warning", color: "secondary" as const };
    return { level: "low", color: "outline" as const };
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded w-48"></div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="stock-alerts">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground" data-testid="stock-alerts-title">
            Alertas de Stock
          </h3>
          <Badge variant="destructive" data-testid="alerts-count">
            {lowStockProducts.length}
          </Badge>
        </div>
        <Link href="/inventory">
          <Button variant="outline" size="sm" data-testid="view-inventory">
            Ver Inventário
          </Button>
        </Link>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="text-center py-8" data-testid="no-alerts">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Nenhum produto com stock baixo
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Todos os produtos têm níveis adequados de stock
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lowStockProducts.map((product) => {
            const criticality = getCriticalityLevel(product.stock, product.minStockLevel);
            
            return (
              <div 
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`stock-alert-${product.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    criticality.level === 'critical' ? 'bg-destructive' :
                    criticality.level === 'warning' ? 'bg-yellow-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <p className="font-medium text-foreground" data-testid={`product-name-${product.id}`}>
                      {product.name}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span data-testid={`product-sku-${product.id}`}>SKU: {product.sku}</span>
                      {product.category && (
                        <>
                          <span>•</span>
                          <span data-testid={`product-category-${product.id}`}>{product.category.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground" data-testid={`current-stock-${product.id}`}>
                      Stock: {product.stock}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`min-stock-${product.id}`}>
                      Mín: {product.minStockLevel}
                    </p>
                  </div>
                  
                  <Badge variant={criticality.color} data-testid={`criticality-${product.id}`}>
                    {criticality.level === 'critical' ? 'Crítico' :
                     criticality.level === 'warning' ? 'Atenção' : 'Baixo'}
                  </Badge>
                  
                  <div className="flex items-center text-muted-foreground">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
          
          {lowStockProducts.length > 5 && (
            <div className="pt-3 border-t">
              <Link href="/inventory">
                <Button variant="ghost" className="w-full" data-testid="view-all-alerts">
                  Ver todos os alertas ({lowStockProducts.length})
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}