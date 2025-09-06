import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Laptop, Smartphone, Headphones, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { LoadingState, EmptyState, LoadingComponents } from "@/components/ui/loading-state";
import { ErrorBoundary } from "@/components/error-boundary";

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

interface ProductsTableProps {
  products: ProductWithStock[];
  isLoading: boolean;
}

export function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary>
      <ProductsTableContent products={products} isLoading={isLoading} isMobile={isMobile} />
    </ErrorBoundary>
  );
}

function ProductsTableContent({ products, isLoading, isMobile }: ProductsTableProps & { isMobile: boolean }) {
  
  const getProductIcon = (categoryName?: string) => {
    if (!categoryName) return Laptop;
    
    const name = categoryName.toLowerCase();
    if (name.includes("computador") || name.includes("laptop")) return Laptop;
    if (name.includes("smartphone") || name.includes("telefone")) return Smartphone;
    if (name.includes("acessório") || name.includes("fone")) return Headphones;
    return Laptop;
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) {
      return { label: "Stock Baixo", variant: "destructive" as const };
    }
    return { label: "Ativo", variant: "secondary" as const };
  };

  const loadingComponent = (
    <Card className="card-mobile">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 sm:h-6 bg-muted rounded w-32 sm:w-48 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-24 sm:w-32 animate-pulse"></div>
      </div>
      <LoadingComponents.ProductList count={5} isMobile={isMobile} />
    </Card>
  );

  const emptyComponent = (
    <Card className="card-mobile">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          {isMobile ? "Top Produtos" : "Produtos Mais Vendidos"}
        </h3>
        <Button variant="ghost" size={isMobile ? "sm" : "default"} className="button-mobile">
          {isMobile ? "Ver todos" : "Ver todos os produtos →"}
        </Button>
      </div>
      <EmptyState 
        title="Nenhum produto encontrado"
        description="Não há produtos para exibir no momento."
        icon={<Package className="h-12 w-12 text-muted-foreground" />}
      />
    </Card>
  );

  return (
    <LoadingState
      isLoading={isLoading}
      isEmpty={products.length === 0}
      loadingComponent={loadingComponent}
      emptyComponent={emptyComponent}
    >
      <Card className="card-mobile" data-testid="products-table">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground" data-testid="products-table-title">
            {isMobile ? "Top Produtos" : "Produtos Mais Vendidos"}
          </h3>
          <Button variant="ghost" size={isMobile ? "sm" : "default"} className="button-mobile" data-testid="view-all-products">
            {isMobile ? "Ver todos" : "Ver todos os produtos →"}
          </Button>
        </div>
      {isMobile ? (
        <div className="space-y-3">
          {products.length > 0 ? (
            products.slice(0, 5).map((product) => {
              const Icon = getProductIcon(product.category?.name);
              const stockStatus = getStockStatus(product.stock);

              return (
                <div 
                  key={product.id} 
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className="text-muted-foreground text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground" data-testid={`product-name-${product.id}`}>
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`product-category-${product.id}`}>
                          {product.category?.name || "Sem categoria"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={stockStatus.variant} className="text-xs">
                      {stockStatus.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">SKU:</span>
                      <p className="font-medium" data-testid={`product-sku-${product.id}`}>{product.sku}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stock:</span>
                      <p 
                        className={`font-medium ${
                          product.stock <= 5 ? "text-destructive" : "text-foreground"
                        }`}
                        data-testid={`product-stock-${product.id}`}
                      >
                        {product.stock}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vendas:</span>
                      <p className="font-medium" data-testid={`product-sales-${product.id}`}>
                        {product.sales}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-mobile">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Produto
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  SKU
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Stock
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Vendas (30d)
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.slice(0, 5).map((product) => {
                  const Icon = getProductIcon(product.category?.name);
                  const stockStatus = getStockStatus(product.stock);

                  return (
                    <tr 
                      key={product.id} 
                      className="table-hover border-b border-border last:border-0"
                      data-testid={`product-row-${product.id}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Icon className="text-muted-foreground text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground" data-testid={`product-name-${product.id}`}>
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground" data-testid={`product-category-${product.id}`}>
                              {product.category?.name || "Sem categoria"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`product-sku-${product.id}`}>
                        {product.sku}
                      </td>
                      <td className="py-3 px-4" data-testid={`product-stock-${product.id}`}>
                        <span 
                          className={`text-sm font-medium ${
                            product.stock <= 5 ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground" data-testid={`product-sales-${product.id}`}>
                        {product.sales} unidades
                      </td>
                      <td className="py-3 px-4" data-testid={`product-status-${product.id}`}>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              ) : null}
            </tbody>
          </table>
        </div>
      )}
      </Card>
    </LoadingState>
  );
}
