import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { type Product, type Warehouse, type Inventory } from "@shared/schema";
import { useInventoryMovements, useCreateInventoryMovement } from "@/hooks/api/use-inventory";
import type { InventoryMovement } from "@/hooks/api/use-inventory";
import { useProducts } from "@/hooks/api/use-products";
import { useWarehouses } from "@/hooks/api/use-warehouses";
import { ErrorBoundary } from "@/components/error-boundary";

interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: "in" | "out" | "transfer" | "adjustment";
  quantity: number;
  reason: string;
  createdAt: string;
  userId?: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    username: string;
  } | null;
}

type MovementFormData = {
  productId: string;
  warehouseId: string;
  type: "in" | "out" | "transfer";
  quantity: number;
  reason: string;
};

function StockMovementDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const { data: productsResponse } = useProducts();
  const products = productsResponse?.data || [];

  const { data: warehousesResponse } = useWarehouses();
  const warehouses = warehousesResponse?.data || [];

  const form = useForm<MovementFormData>({
    defaultValues: {
      type: "in",
      quantity: 1,
      reason: "",
      productId: "",
      warehouseId: "",
    },
  });

  const createMovement = useCreateInventoryMovement();

  const onSubmit = (data: MovementFormData) => {
    // Validação manual básica
    if (!data.productId || !data.warehouseId || !data.reason || data.quantity <= 0) {
      return; // O formulário já deve ter validação
    }
    
    // Mapear o tipo para o formato esperado pelo hook
    const movementType = data.type === 'in' ? 'IN' : data.type === 'out' ? 'OUT' : 'ADJUSTMENT';
    
    createMovement.mutate({
      productId: data.productId,
      type: movementType as 'IN' | 'OUT' | 'ADJUSTMENT',
      quantity: data.quantity,
      reason: data.reason,
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg" data-testid="dialog-stock-movement">
        <DialogHeader>
          <DialogTitle>Registrar Movimento de Stock</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-movement-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in">Entrada</SelectItem>
                      <SelectItem value="out">Saída</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-product">
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Armazém</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-warehouse">
                        <SelectValue placeholder="Selecione o armazém" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Quantidade"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      data-testid="input-quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Motivo do movimento"
                      {...field}
                      data-testid="input-reason"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMovement.isPending} data-testid="button-save-movement">
                {createMovement.isPending ? "Registrando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function LowStockAlert({ product }: { product: Product & { stock: number } }) {
  return (
    <Card className="h-full" data-testid={`low-stock-${product.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-base">Stock Baixo</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">{product.name}</span>
            <Badge variant="outline">
              {product.sku}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stock atual:</span>
            <span className="font-medium text-destructive">{product.stock} unidades</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mínimo:</span>
            <span>{product.minStockLevel} unidades</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MovementCard({ movement }: { movement: InventoryMovement }) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "out":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "in":
        return "bg-green-100 text-green-800";
      case "out":
        return "bg-red-100 text-red-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case "in":
        return "Entrada";
      case "out":
        return "Saída";
      case "transfer":
        return "Transferência";
      default:
        return type;
    }
  };

  return (
    <Card data-testid={`movement-${movement.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getMovementIcon(movement.type)}
            <div>
              <p className="font-medium">{movement.product?.name}</p>
              <p className="text-sm text-muted-foreground">
                {movement.warehouse?.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getMovementColor(movement.type)}>
              {getMovementLabel(movement.type)}
            </Badge>
            <p className="text-sm font-medium mt-1">
              {movement.quantity} unidades
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{movement.reason}</span>
            <span className="text-muted-foreground">
              {new Date(movement.createdAt).toLocaleDateString('pt-AO')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Inventory() {
  return (
    <ErrorBoundary>
      <InventoryContent />
    </ErrorBoundary>
  );
}

function InventoryContent() {
  const [search, setSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const isMobile = useIsMobile();

  // Reset da página quando a busca muda
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedWarehouse, selectedType]);

  // Construir parâmetros de consulta
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };
    
    if (search) params.search = search;
    if (selectedWarehouse !== 'all') params.warehouseId = selectedWarehouse;
    if (selectedType !== 'all') params.type = selectedType;
    
    return params;
  }, [currentPage, itemsPerPage, search, selectedWarehouse, selectedType]);

  // TODO: Implementar hook para produtos com baixo stock
  // Por enquanto, usar dados vazios até o hook estar disponível
  const lowStockProducts: Array<Product & { stock: number }> = [];
  const isLoadingLowStock = false;

  const { data: movementsResponse, isLoading: isLoadingMovements, error: movementsError } = useInventoryMovements(queryParams);
  const recentMovements: InventoryMovement[] = (movementsResponse as any)?.data || [];
  const pagination = (movementsResponse as any)?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Inventário" breadcrumbs={["Gestão de Inventário"]} />
      
      <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Controlar níveis de stock e movimentos
          </p>
        <StockMovementDialog
          trigger={
            <Button data-testid="button-add-movement" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {isMobile ? 'Movimento' : 'Registrar Movimento'}
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" data-testid="tab-alerts">Alertas de Stock</TabsTrigger>
          <TabsTrigger value="movements" data-testid="tab-movements">Movimentos Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {isLoadingLowStock ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-32">
                  <CardContent className="p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : lowStockProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <LowStockAlert key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Todos os produtos com stock adequado</h3>
              <p className="text-muted-foreground">
                Nenhum produto com stock abaixo do nível mínimo.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar movimentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                data-testid="input-search-movements"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="in">Entrada</SelectItem>
                  <SelectItem value="out">Saída</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Armazém" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos armazéns</SelectItem>
                  {/* TODO: Adicionar lista de armazéns quando disponível */}
                </SelectContent>
              </Select>
            </div>
          </div>

          {movementsError ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar movimentos</h3>
              <p className="text-muted-foreground mb-4">
                {(movementsError as any)?.message || 'Ocorreu um erro ao carregar os movimentos de inventário. Verifique sua conexão e tente novamente.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  data-testid="button-reload-page"
                >
                  Recarregar página
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    setCurrentPage(1);
                    setSearch('');
                    setSelectedType('all');
                    setSelectedWarehouse('all');
                  }}
                  data-testid="button-reset-filters"
                >
                  Limpar filtros
                </Button>
              </div>
            </div>
          ) : isLoadingMovements ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="h-24">
                  <CardContent className="p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !isLoadingMovements && recentMovements.length === 0 && (search || selectedType !== 'all' || selectedWarehouse !== 'all') ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum movimento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não foram encontrados movimentos com os filtros aplicados. Tente ajustar os critérios de pesquisa.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearch('');
                  setSelectedType('all');
                  setSelectedWarehouse('all');
                  setCurrentPage(1);
                }}
                data-testid="button-clear-filters"
              >
                Limpar filtros
              </Button>
            </div>
          ) : recentMovements.length > 0 ? (
            <>
              <div className="space-y-4">
                {recentMovements.map((movement) => (
                  <MovementCard key={movement.id} movement={movement} />
                ))}
              </div>
              
              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} movimentos
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      data-testid="pagination-previous"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm px-2">
                      Página {currentPage} de {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      data-testid="pagination-next"
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum movimento registrado</h3>
              <p className="text-muted-foreground mb-4">
                Ainda não há movimentos de inventário registrados no sistema. Comece registrando o primeiro movimento.
              </p>
              <StockMovementDialog
                trigger={
                  <Button data-testid="button-first-movement">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar primeiro movimento
                  </Button>
                }
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}