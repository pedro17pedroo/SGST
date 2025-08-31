import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign, 
  Activity, 
  AlertTriangle, 
  Users, 
  Warehouse,
  Download,
  Filter,
  PieChart as PieChartIcon,
  Target,
  Calendar,
  Brain,
  Clock,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  ComposedChart 
} from 'recharts';

// Advanced Analytics Data
const performanceMetrics = [
  { month: 'Jan', revenue: 1450000, profit: 470000, margin: 32.4, orders: 245, returns: 12 },
  { month: 'Fev', revenue: 1320000, profit: 400000, margin: 30.3, orders: 218, returns: 15 },
  { month: 'Mar', revenue: 1580000, profit: 520000, margin: 32.9, orders: 267, returns: 8 },
  { month: 'Abr', revenue: 1720000, profit: 580000, margin: 33.7, orders: 289, returns: 18 },
  { month: 'Mai', revenue: 1650000, profit: 545000, margin: 33.0, orders: 275, returns: 14 },
  { month: 'Jun', revenue: 1890000, profit: 650000, margin: 34.4, orders: 312, returns: 9 },
];

const categoryAnalytics = [
  { 
    category: 'Smartphones', 
    revenue: 485000, 
    units: 156, 
    avgPrice: 3109, 
    margin: 18.5, 
    growth: 12.3,
    inventory: 89,
    turnover: 4.2
  },
  { 
    category: 'Laptops', 
    revenue: 380000, 
    units: 89, 
    avgPrice: 4270, 
    margin: 22.1, 
    growth: 8.7,
    inventory: 45,
    turnover: 3.8
  },
  { 
    category: 'Monitores', 
    revenue: 290000, 
    units: 145, 
    avgPrice: 2000, 
    margin: 15.3, 
    growth: -2.1,
    inventory: 78,
    turnover: 5.1
  },
  { 
    category: 'Acessórios', 
    revenue: 125000, 
    units: 312, 
    avgPrice: 401, 
    margin: 35.2, 
    growth: 18.9,
    inventory: 234,
    turnover: 6.8
  },
];

const warehouseEfficiency = [
  { warehouse: 'Principal', efficiency: 87, accuracy: 98.5, costs: 45000, capacity: 85 },
  { warehouse: 'Norte', efficiency: 92, accuracy: 97.8, costs: 32000, capacity: 72 },
  { warehouse: 'Sul', efficiency: 78, accuracy: 96.2, costs: 38000, capacity: 91 },
  { warehouse: 'Centro', efficiency: 85, accuracy: 99.1, costs: 28000, capacity: 64 },
];

const supplierPerformance = [
  { supplier: 'TechSup Angola', onTime: 95, quality: 98, cost: 85, satisfaction: 9.2 },
  { supplier: 'ElectroMax', onTime: 88, quality: 92, cost: 78, satisfaction: 8.5 },
  { supplier: 'InfoTech Lda', onTime: 92, quality: 95, cost: 82, satisfaction: 8.8 },
  { supplier: 'Digital Solutions', onTime: 85, quality: 89, cost: 76, satisfaction: 8.1 },
];

const predictiveData = [
  { month: 'Jul', predicted: 1950000, confidence: 85, demand: 'Alto' },
  { month: 'Ago', predicted: 2100000, confidence: 82, demand: 'Muito Alto' },
  { month: 'Set', predicted: 1850000, confidence: 78, demand: 'Alto' },
  { month: 'Out', predicted: 2250000, confidence: 75, demand: 'Crítico' },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff8042', '#8dd1e1', '#d084d0'];

// AI Analytics Component using real API data
function AIAnalyticsSection() {
  // Get demand forecast data
  const { data: demandForecast, isLoading: isLoadingForecast } = useQuery({
    queryKey: ['/api/analytics/demand-forecast'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/demand-forecast');
      if (!response.ok) throw new Error('Failed to fetch demand forecast');
      return response.json();
    }
  });

  // Get turnover analysis data
  const { data: turnoverAnalysis, isLoading: isLoadingTurnover } = useQuery({
    queryKey: ['/api/analytics/turnover-analysis'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/turnover-analysis');
      if (!response.ok) throw new Error('Failed to fetch turnover analysis');
      return response.json();
    }
  });

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge variant="default">Alta ({(confidence * 100).toFixed(0)}%)</Badge>;
    if (confidence >= 0.6) return <Badge variant="secondary">Média ({(confidence * 100).toFixed(0)}%)</Badge>;
    return <Badge variant="outline">Baixa ({(confidence * 100).toFixed(0)}%)</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="default" className="bg-green-500"><TrendingUp className="w-3 h-3 mr-1" />Saudável</Badge>;
      case "attention":
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Atenção</Badge>;
      case "critical":
        return <Badge variant="destructive"><TrendingDown className="w-3 h-3 mr-1" />Crítico</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case "liquidate":
        return <Badge variant="destructive">Liquidar</Badge>;
      case "discount":
        return <Badge variant="secondary">Descontar</Badge>;
      case "return":
        return <Badge variant="outline">Devolver</Badge>;
      default:
        return <Badge variant="outline">{recommendation}</Badge>;
    }
  };

  return (
    <>
      {/* AI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Algoritmo IA</p>
              <p className="text-xs text-muted-foreground">Machine Learning</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Período</p>
              <p className="text-xs text-muted-foreground">{demandForecast?.period || "30 dias"}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Última Atualização</p>
              <p className="text-xs text-muted-foreground">
                {demandForecast && new Date(demandForecast.generatedAt).toLocaleString('pt-PT')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Demand Forecast Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-primary" />
          Previsões de Demanda com IA
        </h3>
        
        {isLoadingForecast ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {demandForecast?.predictions?.map((prediction: any) => (
              <div 
                key={prediction.productId} 
                className="border border-border rounded-lg p-4 space-y-3"
                data-testid={`prediction-${prediction.productId}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{prediction.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Stock Atual: {prediction.currentStock} unidades
                      </p>
                    </div>
                  </div>
                  {getConfidenceBadge(prediction.confidence)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Demanda Prevista</span>
                      <span className="font-medium">{prediction.predictedDemand} un.</span>
                    </div>
                    <Progress 
                      value={(prediction.predictedDemand / prediction.currentStock) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Reposição Sugerida</span>
                      <span className="font-medium text-orange-600">{prediction.recommendedReorder} un.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Fator Sazonal: {prediction.seasonalFactor}x
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">
                        {prediction.currentStock < prediction.predictedDemand ? (
                          <Badge variant="destructive">Stock Baixo</Badge>
                        ) : (
                          <Badge variant="default">OK</Badge>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Turnover Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Análise de Rotatividade por Categoria
          </h3>
          
          {isLoadingTurnover ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {turnoverAnalysis?.categories.map((category: any) => (
                <div 
                  key={category.categoryId} 
                  className="border border-border rounded-lg p-4"
                  data-testid={`category-${category.categoryId}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{category.categoryName}</h4>
                    {getStatusBadge(category.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Taxa de Rotatividade</p>
                      <p className="font-semibold text-lg">{category.turnoverRate}x</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dias Médios de Venda</p>
                      <p className="font-semibold text-lg">{category.averageDaysToSell}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Produtos Rápidos</p>
                      <p className="font-semibold text-green-600">{category.fastMovingProducts}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Produtos Lentos</p>
                      <p className="font-semibold text-red-600">{category.slowMovingProducts}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Itens Obsoletos
          </h3>
          
          {isLoadingTurnover ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {turnoverAnalysis?.obsoleteItems.map((item: any) => (
                <div 
                  key={item.productId} 
                  className="border border-border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10"
                  data-testid={`obsolete-${item.productId}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{item.productName}</h4>
                    {getRecommendationBadge(item.recommendation)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {item.daysInStock} dias em stock
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        AOA {item.currentValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Summary Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo de Análises com IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Categorias Saudáveis</p>
            <p className="text-2xl font-bold text-green-600">
              {turnoverAnalysis?.categories.filter((c: any) => c.status === 'healthy').length || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Requer Atenção</p>
            <p className="text-2xl font-bold text-yellow-600">
              {turnoverAnalysis?.categories.filter((c: any) => c.status === 'attention').length || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Itens Obsoletos</p>
            <p className="text-2xl font-bold text-red-600">
              {turnoverAnalysis?.obsoleteItems.length || 0}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Valor Obsoleto</p>
            <p className="text-2xl font-bold text-blue-600">
              AOA {turnoverAnalysis?.obsoleteItems.reduce((sum: number, item: any) => sum + item.currentValue, 0).toLocaleString() || '0'}
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}

export default function AdvancedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("6m");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Analytics Avançadas" breadcrumbs={["Analytics Avançadas"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Análises preditivas, métricas avançadas e insights de negócio
          </p>
          
          <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]" data-testid="time-range-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Último mês</SelectItem>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button data-testid="export-analytics">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="predictive" data-testid="tab-predictive">
            <Target className="w-4 h-4 mr-2" />
            Preditiva
          </TabsTrigger>
          <TabsTrigger value="efficiency" data-testid="tab-efficiency">
            <Activity className="w-4 h-4 mr-2" />
            Eficiência
          </TabsTrigger>
          <TabsTrigger value="suppliers" data-testid="tab-suppliers">
            <Users className="w-4 h-4 mr-2" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="total-revenue">
                    {formatCurrency(9610000)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2% vs período anterior
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Margem Média</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="avg-margin">
                    32.8%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1% vs período anterior
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rotação Stock</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="inventory-turnover">
                    4.7x
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8.5% vs período anterior
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eficiência Geral</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="overall-efficiency">
                    86%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5.3% vs período anterior
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Performance Financeira</h3>
                <Badge variant="outline">Últimos 6 meses</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'revenue' || name === 'profit') return [formatCurrency(Number(value)), name];
                    if (name === 'margin') return [`${value}%`, name];
                    return [value, name];
                  }} />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Receita" />
                  <Bar yAxisId="left" dataKey="profit" fill="#82ca9d" name="Lucro" />
                  <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#ffc658" strokeWidth={3} name="Margem %" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Análise por Categoria</h3>
                <Badge variant="outline">Este mês</Badge>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryAnalytics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, revenue }) => `${category}: ${formatCurrency(revenue)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Receita"]} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Category Performance Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Detalhada por Categoria</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Receita</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Unidades</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Preço Médio</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Margem</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Crescimento</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rotação</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryAnalytics.map((category, index) => (
                    <tr key={index} className="border-b border-border last:border-0" data-testid={`category-row-${index}`}>
                      <td className="py-3 px-4 text-sm font-medium">{category.category}</td>
                      <td className="py-3 px-4 text-sm">{formatCurrency(category.revenue)}</td>
                      <td className="py-3 px-4 text-sm">{category.units}</td>
                      <td className="py-3 px-4 text-sm">{formatCurrency(category.avgPrice)}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant={category.margin > 20 ? "default" : "secondary"}>
                          {formatPercentage(category.margin)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center">
                          {category.growth > 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                          )}
                          <span className={category.growth > 0 ? "text-green-600" : "text-red-600"}>
                            {formatPercentage(Math.abs(category.growth))}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{category.turnover}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Predictive Analytics Tab - Using Real API Data */}
        <TabsContent value="predictive" className="space-y-6">
          <AIAnalyticsSection />
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Eficiência dos Armazéns</h3>
              <Badge variant="outline">Métricas atuais</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseEfficiency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="warehouse" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency" fill="#8884d8" name="Eficiência %" />
                <Bar dataKey="accuracy" fill="#82ca9d" name="Precisão %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Custos Operacionais</h3>
              <div className="space-y-4">
                {warehouseEfficiency.map((warehouse, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{warehouse.warehouse}</p>
                      <p className="text-sm text-muted-foreground">Capacidade: {warehouse.capacity}%</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(warehouse.costs)}/mês</p>
                      <Badge variant={warehouse.efficiency > 85 ? "default" : "secondary"}>
                        {warehouse.efficiency}% eficiência
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Métricas de Qualidade</h3>
              <div className="space-y-4">
                {warehouseEfficiency.map((warehouse, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{warehouse.warehouse}</p>
                      <p className="text-sm text-muted-foreground">Precisão de picking</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={warehouse.accuracy > 98 ? "default" : "secondary"}>
                        {warehouse.accuracy}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Scorecard de Fornecedores</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fornecedor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pontualidade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Qualidade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Custo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Satisfação</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Score Geral</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierPerformance.map((supplier, index) => {
                    const overallScore = (supplier.onTime + supplier.quality + supplier.cost + (supplier.satisfaction * 10)) / 4;
                    return (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-sm font-medium">{supplier.supplier}</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={supplier.onTime > 90 ? "default" : "secondary"}>
                            {supplier.onTime}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={supplier.quality > 95 ? "default" : "secondary"}>
                            {supplier.quality}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={supplier.cost > 80 ? "default" : "outline"}>
                            {supplier.cost}/100
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{supplier.satisfaction}/10</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant={overallScore > 85 ? "default" : "secondary"}>
                            {overallScore.toFixed(1)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Insights Chave</h3>
              <div className="space-y-4">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <p className="font-medium text-green-800 dark:text-green-200">Crescimento Forte</p>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Categoria "Acessórios" apresenta crescimento de 18.9% com maior margem (35.2%)
                  </p>
                </div>

                <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Atenção Requerida</p>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Monitores com crescimento negativo (-2.1%) - rever estratégia de preços
                  </p>
                </div>

                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <p className="font-medium text-blue-800 dark:text-blue-200">Oportunidade</p>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Armazém Norte com maior eficiência (92%) - replicar boas práticas
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Ações Recomendadas</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-red-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Otimizar Stock de Monitores</p>
                    <p className="text-xs text-muted-foreground">Reduzir 15% do inventário atual</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-yellow-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expandir Categoria Acessórios</p>
                    <p className="text-xs text-muted-foreground">Aumentar variedade e stock</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Melhorar Armazém Sul</p>
                    <p className="text-xs text-muted-foreground">Implementar práticas do Norte</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-green-600">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Renegociar com Digital Solutions</p>
                    <p className="text-xs text-muted-foreground">Melhorar termos de qualidade</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}