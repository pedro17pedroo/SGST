import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Box, 
  Eye, 
  Settings, 
  Play, 
  Pause, 
  RotateCw,
  ZoomIn,
  ZoomOut,
  Map,
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Package,
  Truck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WarehouseZone {
  id: string;
  name: string;
  type: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
    z?: number;
    floor?: number;
  };
  capacity: {
    maxItems: number;
    maxWeight: number;
    maxVolume: number;
  };
  currentUtilization: {
    items: number;
    weight: number;
    volume: number;
    percentage: number;
  };
}

interface WarehouseViewer {
  zones: WarehouseZone[];
  layouts: any;
  realTimeData: any[];
  metadata: {
    totalZones: number;
    activeEntities: number;
    lastUpdate: string;
  };
}

interface Simulation {
  id: string;
  name: string;
  type: string;
  status: string;
  results?: any;
  createdAt: string;
}

const ZoneTypeColors = {
  picking: "bg-blue-500",
  storage: "bg-green-500",
  receiving: "bg-orange-500",
  shipping: "bg-purple-500",
  staging: "bg-yellow-500"
};

const ZoneCard = ({ zone }: { zone: WarehouseZone }) => {
  return (
    <Card className="h-32 border-2 border-dashed hover:border-solid transition-all cursor-pointer" 
          data-testid={`zone-card-${zone.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{zone.name}</CardTitle>
          <div className={`w-3 h-3 rounded-full ${ZoneTypeColors[zone.type as keyof typeof ZoneTypeColors] || 'bg-gray-500'}`}></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Utilização</span>
          <span>{zone.currentUtilization.percentage}%</span>
        </div>
        <Progress value={zone.currentUtilization.percentage} className="h-2" />
        <div className="text-xs text-muted-foreground">
          {zone.currentUtilization.items} / {zone.capacity.maxItems} itens
        </div>
      </CardContent>
    </Card>
  );
};

const WarehouseVisualization = ({ warehouseId, viewMode }: { warehouseId: string; viewMode: '2d' | '3d' }) => {
  const { data: viewerData, isLoading } = useQuery<WarehouseViewer>({
    queryKey: ['/api/digital-twin/viewer', warehouseId],
    enabled: !!warehouseId
  });

  if (isLoading || !viewerData) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative h-96 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border overflow-hidden">
      {/* Visualization Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="sm" variant="outline" className="bg-white/90">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white/90">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" className="bg-white/90">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Warehouse Layout */}
      <div className="absolute inset-0 p-8">
        <div className="grid grid-cols-4 gap-4 h-full">
          {viewerData.zones.map((zone) => (
            <div
              key={zone.id}
              className="relative"
              style={{
                gridColumn: `span ${Math.ceil(zone.coordinates.width / 25)}`,
                gridRow: `span ${Math.ceil(zone.coordinates.height / 25)}`
              }}
            >
              <ZoneCard zone={zone} />
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity Overlay */}
      {viewerData.realTimeData.map((entity, index) => (
        <div
          key={index}
          className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse"
          style={{
            left: `${(entity.position?.x || 0) * 2}px`,
            top: `${(entity.position?.y || 0) * 2}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 rounded-lg p-3 border">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{viewerData.metadata.totalZones} Zonas</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>{viewerData.metadata.activeEntities} Ativos</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>Ao vivo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SimulationPanel = ({ warehouseId }: { warehouseId: string }) => {
  const [selectedSimulation, setSelectedSimulation] = useState<string>("");
  const { toast } = useToast();

  const { data: simulations = [], refetch } = useQuery<Simulation[]>({
    queryKey: ['/api/digital-twin/simulations', warehouseId],
    enabled: !!warehouseId
  });

  const runSimulationMutation = useMutation({
    mutationFn: async (simulationId: string) => {
      const response = await apiRequest("POST", `/api/digital-twin/simulations/${simulationId}/run`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Simulação iniciada",
        description: "A simulação está sendo executada.",
      });
      refetch();
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Simulações Disponíveis</h3>
        <Button 
          size="sm" 
          onClick={() => selectedSimulation && runSimulationMutation.mutate(selectedSimulation)}
          disabled={!selectedSimulation || runSimulationMutation.isPending}
        >
          <Play className="h-4 w-4 mr-2" />
          Executar
        </Button>
      </div>

      <Select value={selectedSimulation} onValueChange={setSelectedSimulation}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma simulação" />
        </SelectTrigger>
        <SelectContent>
          {simulations.map((sim) => (
            <SelectItem key={sim.id} value={sim.id}>
              {sim.name} ({sim.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid gap-4">
        {simulations.slice(0, 3).map((simulation) => (
          <Card key={simulation.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{simulation.name}</div>
              <Badge variant={
                simulation.status === 'completed' ? 'default' : 
                simulation.status === 'running' ? 'secondary' : 
                'outline'
              }>
                {simulation.status === 'completed' ? 'Concluída' :
                 simulation.status === 'running' ? 'Executando' : 'Pendente'}
              </Badge>
            </div>
            
            {simulation.results && (
              <div className="text-sm text-muted-foreground space-y-1">
                {simulation.type === 'picking_optimization' && (
                  <div>
                    Otimização: {simulation.results.routeOptimization}% mais eficiente
                  </div>
                )}
                {simulation.type === 'capacity_planning' && (
                  <div>
                    Capacidade atual: {simulation.results.currentCapacity} itens
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function WarehouseTwin() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [isRealTime, setIsRealTime] = useState(true);

  const { data: warehouses = [] } = useQuery<any[]>({
    queryKey: ["/api/warehouses"]
  });

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouse]);

  return (
    <div className="p-8 space-y-6" data-testid="page-warehouse-twin">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Twin Operacional</h1>
          <p className="text-muted-foreground">
            Visualização 3D/2D do armazém com simulação em tempo real
          </p>
        </div>
        <div className="flex items-center gap-4">
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

          <div className="flex gap-2 border rounded-md p-1">
            <Button
              size="sm"
              variant={viewMode === '2d' ? 'default' : 'ghost'}
              onClick={() => setViewMode('2d')}
              data-testid="button-view-2d"
            >
              <Map className="h-4 w-4 mr-1" />
              2D
            </Button>
            <Button
              size="sm"
              variant={viewMode === '3d' ? 'default' : 'ghost'}
              onClick={() => setViewMode('3d')}
              data-testid="button-view-3d"
            >
              <Box className="h-4 w-4 mr-1" />
              3D
            </Button>
          </div>

          <Button
            size="sm"
            variant={isRealTime ? 'default' : 'outline'}
            onClick={() => setIsRealTime(!isRealTime)}
            data-testid="button-real-time"
          >
            {isRealTime ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isRealTime ? 'Pausar' : 'Ao Vivo'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Main Visualization */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visualização {viewMode.toUpperCase()} - Armazém
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Tempo Real
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedWarehouse && (
                <WarehouseVisualization 
                  warehouseId={selectedWarehouse} 
                  viewMode={viewMode} 
                />
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Eficiência Geral</p>
                    <p className="text-2xl font-bold">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Operadores Ativos</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground">Movimentos/Hora</p>
                    <p className="text-2xl font-bold">145</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Controlo do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Atualização Automática</span>
                <Button 
                  size="sm" 
                  variant={isRealTime ? 'default' : 'outline'}
                  onClick={() => setIsRealTime(!isRealTime)}
                >
                  {isRealTime ? 'Ativo' : 'Inativo'}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Configurações de Visualização</span>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Mostrar Tudo</SelectItem>
                    <SelectItem value="zones">Apenas Zonas</SelectItem>
                    <SelectItem value="workers">Apenas Operadores</SelectItem>
                    <SelectItem value="equipment">Apenas Equipamentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="simulations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simulations">Simulações</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simulations" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  {selectedWarehouse && <SimulationPanel warehouseId={selectedWarehouse} />}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Zona A-12 sobrelotada</p>
                      <p className="text-muted-foreground">Utilização: 98%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Truck className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Novo envio chegando</p>
                      <p className="text-muted-foreground">ETA: 15 min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}