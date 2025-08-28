import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Laptop, Smartphone, Headphones } from "lucide-react";

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

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="products-table">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground" data-testid="products-table-title">
          Produtos Mais Vendidos
        </h3>
        <Button variant="ghost" data-testid="view-all-products">
          Ver todos os produtos →
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
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
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <Icon className="text-muted-foreground" />
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
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground" data-testid="no-products">
                  Nenhum produto encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
