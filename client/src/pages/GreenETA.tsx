import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { 
  Leaf, 
  TrendingDown,
  TrendingUp,
  Truck,
  Factory,
  Lightbulb,
  Target,
  Award,
  ArrowRight,
  BarChart3,
  PieChart,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface SustainabilityReport {
  period: {
    start: string;
    end: string;
  };
  totalEmissions: number;
  totalSavings: number;
  shipmentsOptimized: number;
  averageOptimization: number;
  topSavingRoutes: Array<{
    route: string;
    savings: number;
    count: number;
  }>;
}

interface CarbonSavingsReport {
  period: string;
  totalSavings: {
    carbonSaved: number;
    costSaved: number;
    optimizedShipments: number;
    trend: string;
  };
  monthlySavings: Array<{
    month: string;
    carbonSaved: number;
    costSaved: number;
    optimizedShipments: number;
  }>;
  projectedSavings: {
    nextMonth: { carbon: number; cost: number };
    nextYear: { carbon: number; cost: number };
  };
}

const SustainabilityKPIs = () => {
  const { data: report } = useQuery<SustainabilityReport>({
    queryKey: ['/api/green-eta/reports/sustainability'],
    refetchInterval: 30000 // Update every 30 seconds
  });

  if (!report) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">CO2 Economizado</p>
              <p className="text-2xl font-bold">{report.totalSavings.toFixed(1)} kg</p>
              <p className="text-xs text-green-600">↓ {report.averageOptimization}% vs standard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Truck className="h-4 w-4 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Envios Otimizados</p>
              <p className="text-2xl font-bold">{report.shipmentsOptimized}</p>
              <p className="text-xs text-blue-600">Este período</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Award className="h-4 w-4 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Score Sustentabilidade</p>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-yellow-600">↑ +5% este mês</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-muted-foreground">Poupança Total</p>
              <p className="text-2xl font-bold">45.2k AOA</p>
              <p className="text-xs text-purple-600">Este mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CarbonSavingsChart = () => {
  const { data: savingsReport } = useQuery<CarbonSavingsReport>({
    queryKey: ['/api/green-eta/reports/carbon-savings?period=12'],
    refetchInterval: 60000
  });

  if (!savingsReport) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Poupanças de Carbono - Últimos 12 Meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savingsReport.monthlySavings.slice(-6).map((month, index) => (
            <div key={month.month} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 text-sm text-muted-foreground">
                  {month.month.split('-')[1]}/24
                </div>
                <div className="flex-1">
                  <Progress value={(month.carbonSaved / 500) * 100} className="h-2" />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{month.carbonSaved} kg CO2</div>
                <div className="text-xs text-muted-foreground">{month.optimizedShipments} envios</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {savingsReport.totalSavings.carbonSaved.toLocaleString()} kg
            </div>
            <div className="text-sm text-muted-foreground">Total CO2 poupado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(savingsReport.projectedSavings.nextYear.carbon).toLocaleString()} kg
            </div>
            <div className="text-sm text-muted-foreground">Projecção próximo ano</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GreenRecommendations = ({ warehouseId }: { warehouseId: string }) => {
  const { data: recommendations } = useQuery({
    queryKey: ['/api/green-eta/recommendations', warehouseId],
    enabled: !!warehouseId
  });

  if (!recommendations) return null;

  const allRecommendations = [
    ...(recommendations?.energyOptimization || []),
    ...(recommendations?.logisticsOptimization || []),
    ...(recommendations?.packagingOptimization || [])
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recomendações Sustentáveis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allRecommendations.slice(0, 4).map((recommendation, index) => (
          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="flex-shrink-0">
              {index < 2 && <Factory className="h-5 w-5 text-green-500" />}
              {index >= 2 && <Truck className="h-5 w-5 text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{recommendation.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {recommendation.description}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {recommendation.impact.carbon} kg CO2/ano
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {recommendation.paybackMonths} meses ROI
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium text-green-600">
                {(recommendation.impact.cost / 1000).toFixed(0)}k AOA/ano
              </div>
              <div className="text-muted-foreground text-xs">
                Invest: {(recommendation.investment / 1000).toFixed(0)}k AOA
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200">
                Potencial Total de Poupanças
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Implementando todas as recomendações: {(recommendations.estimatedSavings?.carbon || 0).toLocaleString()} kg CO2/ano
                e {(recommendations.estimatedSavings?.cost || 0).toLocaleString()} AOA poupados em {recommendations.estimatedSavings?.timeframe || '12 meses'}.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const OptimizationResults = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resultados de Otimização
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
            <div className="text-xs text-green-600 mt-1">↑ +3% vs mês anterior</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">24h</div>
            <div className="text-sm text-muted-foreground">Atraso Médio</div>
            <div className="text-xs text-blue-600 mt-1">Para opções sustentáveis</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Transporte Rodoviário</span>
            <div className="flex items-center gap-2">
              <Progress value={75} className="w-24 h-2" />
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Transporte Ferroviário</span>
            <div className="flex items-center gap-2">
              <Progress value={95} className="w-24 h-2" />
              <span className="text-sm text-muted-foreground">95%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Consolidação</span>
            <div className="flex items-center gap-2">
              <Progress value={88} className="w-24 h-2" />
              <span className="text-sm text-muted-foreground">88%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm">
            <div className="font-medium">Próximas Otimizações</div>
            <div className="text-muted-foreground">5 envios prontos para consolidar</div>
          </div>
          <Button size="sm" className="gap-2">
            Ver Detalhes
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function GreenETA() {
  const [selectedWarehouse, setSelectedWarehouse] = useState("warehouse-1");

  const { data: warehouses = [] } = useQuery<any[]>({
    queryKey: ["/api/warehouses"]
  });

  return (
    <div className="min-h-screen bg-background" data-testid="page-green-eta">
      <Header title="Green ETA" breadcrumbs={["Green ETA"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Otimização sustentável com redução da pegada de carbono
          </p>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Atualizado há 5 min
          </Badge>
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione armazém" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((warehouse: any) => (
                <SelectItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs Section */}
      <SustainabilityKPIs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <CarbonSavingsChart />
          <OptimizationResults />
        </div>

        {/* Recommendations Section */}
        <div className="space-y-6">
          {selectedWarehouse && <GreenRecommendations warehouseId={selectedWarehouse} />}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Otimização Automática</span>
                <Badge variant="default" className="bg-green-500">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Consolidação Inteligente</span>
                <Badge variant="default" className="bg-green-500">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Alertas de Sustentabilidade</span>
                <Badge variant="default" className="bg-green-500">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Relatórios Mensais</span>
                <Badge variant="secondary">Agendado</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="routes" className="w-full">
        <TabsList>
          <TabsTrigger value="routes">Rotas Ecológicas</TabsTrigger>
          <TabsTrigger value="emissions">Controle de Emissões</TabsTrigger>
          <TabsTrigger value="analytics">Análises Avançadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rotas Otimizadas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { route: "Luanda → Benguela", savings: "4.2 kg CO2", efficiency: "92%" },
                  { route: "Huambo → Lobito", savings: "3.8 kg CO2", efficiency: "88%" },
                  { route: "Cabinda → Luanda", savings: "6.1 kg CO2", efficiency: "94%" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{item.route}</div>
                      <div className="text-sm text-muted-foreground">Eficiência: {item.efficiency}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="gap-1">
                        <TrendingDown className="h-3 w-3" />
                        {item.savings}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emissions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emissões por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transporte</span>
                  <span className="text-sm font-medium">65% (2.4t CO2)</span>
                </div>
                <Progress value={65} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Armazenamento</span>
                  <span className="text-sm font-medium">20% (0.8t CO2)</span>
                </div>
                <Progress value={20} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Embalagem</span>
                  <span className="text-sm font-medium">15% (0.6t CO2)</span>
                </div>
                <Progress value={15} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meta vs. Realizado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">-23%</div>
                  <div className="text-sm text-muted-foreground">Redução este mês</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta anual</span>
                    <span>-30%</span>
                  </div>
                  <Progress value={76.7} className="h-2" />
                  <div className="text-xs text-muted-foreground text-center">
                    77% da meta atingida
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsões e Tendências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold text-blue-600">-35%</div>
                  <div className="text-sm text-muted-foreground">Projeção 6 meses</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold text-green-600">-45%</div>
                  <div className="text-sm text-muted-foreground">Projeção 12 meses</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-bold text-purple-600">95%</div>
                  <div className="text-sm text-muted-foreground">Confiança do modelo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}