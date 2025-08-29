import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, Package, DollarSign, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function to format currency
const formatCurrency = (value: number) => {
  return `${value.toLocaleString('pt-AO')} AOA`;
};

function ReportCard({ title, value, change, icon: Icon, color }: {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const [dateRange, setDateRange] = useState("30");

  // Real API queries for reports
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: inventoryTurnover, isLoading: isLoadingTurnover } = useQuery({
    queryKey: ["/api/reports/inventory-turnover", dateRange],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      return fetch(`/api/reports/inventory-turnover?${params}`).then(res => res.json());
    },
  });

  const { data: obsoleteInventory, isLoading: isLoadingObsolete } = useQuery({
    queryKey: ["/api/reports/obsolete-inventory", dateRange],
    queryFn: () => {
      const params = new URLSearchParams({
        daysWithoutMovement: dateRange,
        minValue: "1000"
      });
      
      return fetch(`/api/reports/obsolete-inventory?${params}`).then(res => res.json());
    },
  });

  const { data: productPerformance, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ["/api/reports/product-performance", dateRange],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: "10"
      });
      
      return fetch(`/api/reports/product-performance?${params}`).then(res => res.json());
    },
  });

  const { data: stockValuation, isLoading: isLoadingValuation } = useQuery({
    queryKey: ["/api/reports/stock-valuation"],
  });

  const { data: supplierPerformance, isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ["/api/reports/supplier-performance", dateRange],
    queryFn: () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));
      
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      return fetch(`/api/reports/supplier-performance?${params}`).then(res => res.json());
    },
  });

  const { data: warehouseEfficiency, isLoading: isLoadingWarehouse } = useQuery({
    queryKey: ["/api/reports/warehouse-efficiency"],
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-reports">
            Relatórios e Análises
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada de desempenho e tendências
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button data-testid="button-export">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard
          title="Valor Total do Stock"
          value={stockValuation?.summary ? formatCurrency(stockValuation.summary.totalRetailValue) : "Carregando..."}
          change={`${stockValuation?.summary?.totalProducts || 0} produtos`}
          icon={DollarSign}
          color="green"
        />
        <ReportCard
          title="Produtos em Stock"
          value={stockValuation?.summary?.totalUnits?.toString() || "Carregando..."}
          change="Total de unidades"
          icon={Package}
          color="blue"
        />
        <ReportCard
          title="Potencial de Lucro"
          value={stockValuation?.summary ? formatCurrency(stockValuation.summary.totalPotentialProfit) : "Carregando..."}
          change="Margem estimada"
          icon={TrendingUp}
          color="purple"
        />
        <ReportCard
          title="Fornecedores Ativos"
          value={supplierPerformance?.length?.toString() || "Carregando..."}
          change="Total de fornecedores"
          icon={FileText}
          color="orange"
        />
      </div>

      {/* Main Content - Tabs for different report types */}
      <Tabs defaultValue="turnover" className="space-y-4">
        <TabsList>
          <TabsTrigger value="turnover" data-testid="tab-turnover">Rotatividade</TabsTrigger>
          <TabsTrigger value="obsolete" data-testid="tab-obsolete">Stock Obsoleto</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Desempenho</TabsTrigger>
          <TabsTrigger value="valuation" data-testid="tab-valuation">Avaliação</TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">Fornecedores</TabsTrigger>
        </TabsList>

        <TabsContent value="turnover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Rotatividade do Inventário</CardTitle>
              <p className="text-sm text-muted-foreground">
                Análise da taxa de rotatividade por produto e categoria
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingTurnover ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">Produtos Analisados</div>
                      <div className="text-2xl font-bold text-blue-900">{inventoryTurnover?.length || 0}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Alta Rotatividade</div>
                      <div className="text-2xl font-bold text-green-900">
                        {inventoryTurnover?.filter(item => item.turnoverRatio > 2).length || 0}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-yellow-600">Média Rotatividade</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {inventoryTurnover?.filter(item => item.turnoverRatio >= 1 && item.turnoverRatio <= 2).length || 0}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-red-600">Baixa Rotatividade</div>
                      <div className="text-2xl font-bold text-red-900">
                        {inventoryTurnover?.filter(item => item.turnoverRatio < 1).length || 0}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Produto</th>
                          <th className="text-left p-2">SKU</th>
                          <th className="text-left p-2">Categoria</th>
                          <th className="text-right p-2">Stock Médio</th>
                          <th className="text-right p-2">Vendas Totais</th>
                          <th className="text-right p-2">Taxa de Rotatividade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryTurnover?.slice(0, 10).map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2 text-sm text-gray-600">{item.sku}</td>
                            <td className="p-2">{item.categoryName || 'Sem categoria'}</td>
                            <td className="p-2 text-right">{item.avgStock || 0}</td>
                            <td className="p-2 text-right">{item.totalSold || 0}</td>
                            <td className="p-2 text-right">
                              <Badge variant={item.turnoverRatio > 2 ? "default" : item.turnoverRatio >= 1 ? "secondary" : "destructive"}>
                                {item.turnoverRatio?.toFixed(2) || "0.00"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obsolete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Stock Obsoleto</CardTitle>
              <p className="text-sm text-muted-foreground">
                Produtos sem movimento há mais de {dateRange} dias
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingObsolete ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-red-600">Produtos Obsoletos</div>
                      <div className="text-2xl font-bold text-red-900">{obsoleteInventory?.length || 0}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-orange-600">Valor Total</div>
                      <div className="text-2xl font-bold text-orange-900">
                        {formatCurrency(obsoleteInventory?.reduce((sum, item) => sum + (item.totalValue || 0), 0) || 0)}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-yellow-600">Unidades</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {obsoleteInventory?.reduce((sum, item) => sum + (item.currentStock || 0), 0) || 0}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Produto</th>
                          <th className="text-left p-2">SKU</th>
                          <th className="text-left p-2">Armazém</th>
                          <th className="text-right p-2">Stock Atual</th>
                          <th className="text-right p-2">Preço Unitário</th>
                          <th className="text-right p-2">Valor Total</th>
                          <th className="text-right p-2">Dias sem Movimento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {obsoleteInventory?.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2 text-sm text-gray-600">{item.sku}</td>
                            <td className="p-2">{item.warehouseName}</td>
                            <td className="p-2 text-right">{item.currentStock}</td>
                            <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(item.totalValue)}</td>
                            <td className="p-2 text-right">
                              <Badge variant="destructive">
                                {item.daysWithoutMovement} dias
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Desempenho de Produtos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Top produtos por receita nos últimos {dateRange} dias
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingPerformance ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Receita Total</div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(productPerformance?.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) || 0)}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">Unidades Vendidas</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {productPerformance?.reduce((sum, item) => sum + (item.totalSales || 0), 0) || 0}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">Produtos Ativos</div>
                      <div className="text-2xl font-bold text-purple-900">{productPerformance?.length || 0}</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Produto</th>
                          <th className="text-left p-2">SKU</th>
                          <th className="text-left p-2">Categoria</th>
                          <th className="text-right p-2">Vendas</th>
                          <th className="text-right p-2">Receita</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productPerformance?.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2 text-sm text-gray-600">{item.sku}</td>
                            <td className="p-2">{item.categoryName || 'Sem categoria'}</td>
                            <td className="p-2 text-right">{item.totalSales || 0}</td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(item.totalRevenue || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Avaliação de Stock</CardTitle>
              <p className="text-sm text-muted-foreground">
                Valor total do inventário por categoria e armazém
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingValuation ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">Produtos em Stock</div>
                      <div className="text-2xl font-bold text-blue-900">{stockValuation?.summary?.totalProducts || 0}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Unidades Totais</div>
                      <div className="text-2xl font-bold text-green-900">{stockValuation?.summary?.totalUnits || 0}</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-yellow-600">Valor de Venda</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(stockValuation?.summary?.totalRetailValue || 0)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">Potencial de Lucro</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {formatCurrency(stockValuation?.summary?.totalPotentialProfit || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Produto</th>
                          <th className="text-left p-2">Categoria</th>
                          <th className="text-left p-2">Armazém</th>
                          <th className="text-right p-2">Stock</th>
                          <th className="text-right p-2">Preço Unit.</th>
                          <th className="text-right p-2">Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockValuation?.items?.slice(0, 15).map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2">{item.categoryName || 'Sem categoria'}</td>
                            <td className="p-2">{item.warehouseName}</td>
                            <td className="p-2 text-right">{item.currentStock}</td>
                            <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(item.totalRetailValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Desempenho de Fornecedores</CardTitle>
              <p className="text-sm text-muted-foreground">
                Análise de desempenho dos fornecedores nos últimos {dateRange} dias
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingSuppliers ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Carregando dados...</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">Fornecedores Ativos</div>
                      <div className="text-2xl font-bold text-blue-900">{supplierPerformance?.length || 0}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Total de Encomendas</div>
                      <div className="text-2xl font-bold text-green-900">
                        {supplierPerformance?.reduce((sum, item) => sum + (item.totalOrders || 0), 0) || 0}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-yellow-600">Valor Total</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(supplierPerformance?.reduce((sum, item) => sum + (item.totalAmount || 0), 0) || 0)}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">Taxa Média de Entrega</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {(supplierPerformance?.reduce((sum, item) => sum + (item.deliveryRate || 0), 0) / (supplierPerformance?.length || 1) || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Fornecedor</th>
                          <th className="text-right p-2">Encomendas</th>
                          <th className="text-right p-2">Valor Total</th>
                          <th className="text-right p-2">Valor Médio</th>
                          <th className="text-right p-2">Taxa de Entrega</th>
                          <th className="text-right p-2">Variedade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierPerformance?.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-2">{item.supplierName}</td>
                            <td className="p-2 text-right">{item.totalOrders || 0}</td>
                            <td className="p-2 text-right">{formatCurrency(item.totalAmount || 0)}</td>
                            <td className="p-2 text-right">{formatCurrency(item.avgOrderAmount || 0)}</td>
                            <td className="p-2 text-right">
                              <Badge variant={item.deliveryRate >= 80 ? "default" : item.deliveryRate >= 60 ? "secondary" : "destructive"}>
                                {item.deliveryRate?.toFixed(1) || "0.0"}%
                              </Badge>
                            </td>
                            <td className="p-2 text-right">{item.productVariety || 0} produtos</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}