import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Eye, 
  Truck, 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Camera,
  Zap,
  BarChart3,
  Boxes,
  MapPin,
  Wifi,
  ShieldCheck
} from 'lucide-react';

const WarehouseAutomation = () => {
  const [selectedModule, setSelectedModule] = useState('computer_vision');

  // Mock data for demonstrations
  const computerVisionData = {
    activeScans: 12,
    itemsCounted: 3247,
    accuracy: 94.7,
    damageDetected: 23,
    recentResults: [
      { id: 1, product: 'Produto A', counted: 150, expected: 150, accuracy: 100, status: 'verified' },
      { id: 2, product: 'Produto B', counted: 89, expected: 90, accuracy: 98.9, status: 'variance' },
      { id: 3, product: 'Produto C', counted: 200, expected: 200, accuracy: 100, status: 'verified' }
    ]
  };

  const smartReceivingData = {
    activeAsns: 8,
    receivingTasks: 15,
    completionRate: 89.2,
    avgReceivingTime: 42,
    recentReceipts: [
      { id: 1, asn: 'ASN-2025-001', supplier: 'Fornecedor A', status: 'completed', variance: 0 },
      { id: 2, asn: 'ASN-2025-002', supplier: 'Fornecedor B', status: 'receiving', variance: 2 },
      { id: 3, asn: 'ASN-2025-003', supplier: 'Fornecedor C', status: 'pending', variance: null }
    ]
  };

  const putawayData = {
    activeTasks: 28,
    optimizationRate: 91.5,
    ssccPallets: 156,
    crossDockRate: 34.2,
    recentTasks: [
      { id: 1, product: 'Produto X', location: 'A1-15', strategy: 'closest_empty', time: 8 },
      { id: 2, product: 'Produto Y', location: 'B2-22', strategy: 'abc_velocity', time: 12 },
      { id: 3, product: 'Produto Z', location: 'C3-08', strategy: 'cross_dock', time: 5 }
    ]
  };

  const replenishmentData = {
    activeRules: 342,
    forecastAccuracy: 87.3,
    automationRate: 65.8,
    alertsCount: 12,
    recentForecasts: [
      { id: 1, product: 'Produto Alpha', demand: 89, confidence: 91, trend: 'up' },
      { id: 2, product: 'Produto Beta', demand: 156, confidence: 88, trend: 'stable' },
      { id: 3, product: 'Produto Gamma', demand: 234, confidence: 94, trend: 'down' }
    ]
  };

  const moduleCards = [
    {
      id: 'computer_vision',
      title: 'Computer Vision Edge',
      description: 'Contagem automática e detecção de danos com IA',
      icon: Eye,
      color: 'bg-blue-500',
      features: ['Contagem Automática', 'Detecção de Danos', 'Leitura de Etiquetas', 'Validação de Dimensões']
    },
    {
      id: 'smart_receiving',
      title: 'Recebimento Inteligente',
      description: 'ASN/EDI, identificação multi-modal e automação',
      icon: Truck,
      color: 'bg-green-500',
      features: ['Integração ASN/EDI', 'Identificação Multi-modal', 'Validação Automática', 'Geração de Etiquetas']
    },
    {
      id: 'putaway_optimization',
      title: 'Putaway Otimizado',
      description: 'Slotting dinâmico e automação de cross-dock',
      icon: Package,
      color: 'bg-purple-500',
      features: ['Slotting Dinâmico', 'Cross-dock Automático', 'Paletes SSCC', 'Otimização de Rotas']
    },
    {
      id: 'intelligent_replenishment',
      title: 'Reabastecimento IA',
      description: 'Previsão de demanda e reabastecimento automático',
      icon: Brain,
      color: 'bg-orange-500',
      features: ['Previsão ML', 'Alertas Preditivos', 'Reabastecimento Auto', 'Análises Avançadas']
    }
  ];

  const renderModuleDemo = () => {
    switch (selectedModule) {
      case 'computer_vision':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-500" />
                  Contagem Automática
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Precisão</span>
                    <span className="font-semibold">{computerVisionData.accuracy}%</span>
                  </div>
                  <Progress value={computerVisionData.accuracy} className="h-2" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{computerVisionData.itemsCounted}</p>
                    <p className="text-sm text-muted-foreground">Itens contados hoje</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Detecção de Danos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{computerVisionData.damageDetected}</p>
                    <p className="text-sm text-muted-foreground">Danos detectados</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-50 p-2 rounded text-center">
                      <p className="font-semibold text-red-700">8</p>
                      <p className="text-red-600">Crítico</p>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded text-center">
                      <p className="font-semibold text-yellow-700">15</p>
                      <p className="text-yellow-600">Menor</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Resultados Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {computerVisionData.recentResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{result.product}</p>
                        <p className="text-xs text-muted-foreground">{result.counted}/{result.expected}</p>
                      </div>
                      <Badge variant={result.status === 'verified' ? 'default' : 'secondary'}>
                        {result.accuracy}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'smart_receiving':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-green-500" />
                  ASNs Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{smartReceivingData.activeAsns}</p>
                    <p className="text-sm text-muted-foreground">Em processamento</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa conclusão</span>
                    <span className="font-semibold">{smartReceivingData.completionRate}%</span>
                  </div>
                  <Progress value={smartReceivingData.completionRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{smartReceivingData.avgReceivingTime}</p>
                    <p className="text-sm text-muted-foreground">Minutos médios</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-green-50 p-2 rounded text-center">
                      <p className="font-semibold text-green-700">15 tarefas</p>
                      <p className="text-green-600">Ativas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recibos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {smartReceivingData.recentReceipts.map((receipt) => (
                    <div key={receipt.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{receipt.asn}</p>
                        <p className="text-xs text-muted-foreground">{receipt.supplier}</p>
                      </div>
                      <Badge variant={receipt.status === 'completed' ? 'default' : 'secondary'}>
                        {receipt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'putaway_optimization':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  Otimização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taxa otimização</span>
                    <span className="font-semibold">{putawayData.optimizationRate}%</span>
                  </div>
                  <Progress value={putawayData.optimizationRate} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-purple-50 p-2 rounded text-center">
                      <p className="font-semibold text-purple-700">{putawayData.activeTasks}</p>
                      <p className="text-purple-600">Tarefas ativas</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="font-semibold text-blue-700">{putawayData.crossDockRate}%</p>
                      <p className="text-blue-600">Cross-dock</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-indigo-500" />
                  Paletes SSCC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{putawayData.ssccPallets}</p>
                    <p className="text-sm text-muted-foreground">Paletes ativas</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="bg-green-50 p-1 rounded text-center">
                      <p className="font-semibold text-green-700">89</p>
                      <p className="text-green-600">Completos</p>
                    </div>
                    <div className="bg-yellow-50 p-1 rounded text-center">
                      <p className="font-semibold text-yellow-700">52</p>
                      <p className="text-yellow-600">Em curso</p>
                    </div>
                    <div className="bg-blue-50 p-1 rounded text-center">
                      <p className="font-semibold text-blue-700">15</p>
                      <p className="text-blue-600">Enviados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tarefas Otimizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {putawayData.recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{task.product}</p>
                        <p className="text-xs text-muted-foreground">{task.location} • {task.strategy}</p>
                      </div>
                      <Badge variant="outline">
                        {task.time}min
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'intelligent_replenishment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-500" />
                  IA Preditiva
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Precisão previsão</span>
                    <span className="font-semibold">{replenishmentData.forecastAccuracy}%</span>
                  </div>
                  <Progress value={replenishmentData.forecastAccuracy} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-orange-50 p-2 rounded text-center">
                      <p className="font-semibold text-orange-700">{replenishmentData.activeRules}</p>
                      <p className="text-orange-600">Regras ativas</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <p className="font-semibold text-green-700">{replenishmentData.automationRate}%</p>
                      <p className="text-green-600">Automação</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Alertas Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{replenishmentData.alertsCount}</p>
                    <p className="text-sm text-muted-foreground">Alertas ativos</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="bg-red-50 p-1 rounded text-center">
                      <p className="font-semibold text-red-700">3</p>
                      <p className="text-red-600">Crítico</p>
                    </div>
                    <div className="bg-orange-50 p-1 rounded text-center">
                      <p className="font-semibold text-orange-700">5</p>
                      <p className="text-orange-600">Alto</p>
                    </div>
                    <div className="bg-yellow-50 p-1 rounded text-center">
                      <p className="font-semibold text-yellow-700">4</p>
                      <p className="text-yellow-600">Médio</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Previsões ML</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {replenishmentData.recentForecasts.map((forecast) => (
                    <div key={forecast.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{forecast.product}</p>
                        <p className="text-xs text-muted-foreground">Demanda: {forecast.demand} • {forecast.confidence}%</p>
                      </div>
                      <Badge variant={forecast.trend === 'up' ? 'default' : forecast.trend === 'down' ? 'destructive' : 'secondary'}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {forecast.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8" data-testid="warehouse-automation-page">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Sistema de Gestão Avançado de Armazéns
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Tecnologias de ponta para Angola: IA, Computer Vision, Automação e Analytics Preditivos
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            <Wifi className="h-4 w-4 mr-1" />
            Offline-First
          </Badge>
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            <ShieldCheck className="h-4 w-4 mr-1" />
            Enterprise-Grade
          </Badge>
          <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
            <Zap className="h-4 w-4 mr-1" />
            Automação IA
          </Badge>
        </div>
      </div>

      {/* Module Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {moduleCards.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card 
              key={module.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedModule === module.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedModule(module.id)}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-3`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {module.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Demo Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            Demonstração em Tempo Real
          </CardTitle>
          <CardDescription>
            Explore as capacidades avançadas de cada módulo do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedModule} onValueChange={setSelectedModule} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="computer_vision">Computer Vision</TabsTrigger>
              <TabsTrigger value="smart_receiving">Smart Receiving</TabsTrigger>
              <TabsTrigger value="putaway_optimization">Putaway</TabsTrigger>
              <TabsTrigger value="intelligent_replenishment">IA Replenishment</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              {renderModuleDemo()}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Eye className="h-5 w-5 mr-2" />
          Iniciar Demonstração Completa
        </Button>
        <Button variant="outline" size="lg">
          <BarChart3 className="h-5 w-5 mr-2" />
          Ver Analytics Detalhados
        </Button>
      </div>
    </div>
  );
};

export default WarehouseAutomation;