import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, TrendingUp, TrendingDown } from "lucide-react";
import { StockAlerts } from "@/components/inventory/stock-alerts";
import { StockMovementForm } from "@/components/inventory/stock-movement-form";

interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  product: {
    name: string;
    sku: string;
    minStockLevel: number;
  };
  warehouse: {
    name: string;
  };
}

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showMovementForm, setShowMovementForm] = useState(false);
  
  // For now, we'll get inventory data from products with stock calculations
  const { data: products = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/products"],
  });

  const { data: warehouses = [] } = useQuery<any[]>({
    queryKey: ["/api/warehouses"],
  });

  // Mock inventory data for now - in a real app this would come from the API
  const inventoryItems = products.map(product => ({
    id: `inv-${product.id}`,
    productId: product.id,
    warehouseId: warehouses[0]?.id || 'default',
    quantity: Math.floor(Math.random() * 100),
    reservedQuantity: Math.floor(Math.random() * 10),
    product: {
      name: product.name,
      sku: product.sku,
      minStockLevel: product.minStockLevel || 10,
    },
    warehouse: {
      name: warehouses[0]?.name || 'Armazém Principal',
    },
  }));

  const filteredItems = inventoryItems.filter((item) =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (quantity: number, minLevel: number) => {
    if (quantity <= minLevel * 0.5) {
      return { label: "Crítico", variant: "destructive" as const, icon: TrendingDown };
    }
    if (quantity <= minLevel) {
      return { label: "Baixo", variant: "secondary" as const, icon: TrendingDown };
    }
    return { label: "Normal", variant: "outline" as const, icon: TrendingUp };
  };

  return (
    <div className="min-h-screen bg-background" data-testid="inventory-page">
      <Header title="Inventário" breadcrumbs={["Inventário"]} />
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    placeholder="Pesquisar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                    data-testid="inventory-search"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <Button onClick={() => setShowMovementForm(true)} data-testid="add-movement-button">
                <Plus className="w-4 h-4 mr-2" />
                Registar Movimento
              </Button>
            </div>

            <Card className="p-6">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 py-4 animate-pulse">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/6"></div>
                        </div>
                        <div className="h-4 bg-muted rounded w-20"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-6 bg-muted rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Produto
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Armazém
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Stock Atual
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Reservado
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Disponível
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((item) => {
                          const available = item.quantity - item.reservedQuantity;
                          const status = getStockStatus(item.quantity, item.product.minStockLevel);
                          const StatusIcon = status.icon;

                          return (
                            <tr 
                              key={item.id} 
                              className="table-hover border-b border-border last:border-0"
                              data-testid={`inventory-row-${item.id}`}
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-sm font-medium text-foreground" data-testid={`product-name-${item.id}`}>
                                    {item.product.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    SKU: {item.product.sku}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground" data-testid={`warehouse-${item.id}`}>
                                {item.warehouse.name}
                              </td>
                              <td className="py-3 px-4">
                                <span 
                                  className={`text-sm font-medium ${
                                    item.quantity <= item.product.minStockLevel ? "text-destructive" : "text-foreground"
                                  }`}
                                  data-testid={`stock-quantity-${item.id}`}
                                >
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`reserved-${item.id}`}>
                                {item.reservedQuantity}
                              </td>
                              <td className="py-3 px-4 text-sm text-foreground" data-testid={`available-${item.id}`}>
                                {available}
                              </td>
                              <td className="py-3 px-4" data-testid={`status-${item.id}`}>
                                <Badge variant={status.variant} className="flex items-center gap-1 w-fit">
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground" data-testid="no-inventory">
                            {searchQuery ? "Nenhum produto encontrado" : "Nenhum item no inventário"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>

          <div>
            <StockAlerts />
          </div>
        </div>

        <StockMovementForm 
          open={showMovementForm} 
          onOpenChange={setShowMovementForm}
        />
      </div>
    </div>
  );
}
