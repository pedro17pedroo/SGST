import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Activity
} from "lucide-react";

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  threshold: number;
}

interface PerformanceData {
  responseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  activeConnections: number;
  pageLoadTime: number;
  lastUpdate: Date;
}

export const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    responseTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    activeConnections: 0,
    pageLoadTime: 0,
    lastUpdate: new Date()
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      // Simulate real-time performance data
      const newData: PerformanceData = {
        responseTime: 45 + Math.random() * 100, // 45-145ms
        cacheHitRate: 85 + Math.random() * 10, // 85-95%
        memoryUsage: 35 + Math.random() * 20, // 35-55%
        activeConnections: 12 + Math.floor(Math.random() * 8), // 12-20
        pageLoadTime: 120 + Math.random() * 80, // 120-200ms
        lastUpdate: new Date()
      };

      setPerformanceData(newData);

      // Update metrics with status
      const metrics: PerformanceMetric[] = [
        {
          name: 'Tempo de Resposta API',
          value: newData.responseTime,
          unit: 'ms',
          status: newData.responseTime < 100 ? 'excellent' : 
                  newData.responseTime < 200 ? 'good' : 
                  newData.responseTime < 500 ? 'warning' : 'critical',
          threshold: 200
        },
        {
          name: 'Taxa de Cache Hit',
          value: newData.cacheHitRate,
          unit: '%',
          status: newData.cacheHitRate > 90 ? 'excellent' :
                  newData.cacheHitRate > 75 ? 'good' :
                  newData.cacheHitRate > 50 ? 'warning' : 'critical',
          threshold: 80
        },
        {
          name: 'Uso de Memória',
          value: newData.memoryUsage,
          unit: '%',
          status: newData.memoryUsage < 50 ? 'excellent' :
                  newData.memoryUsage < 70 ? 'good' :
                  newData.memoryUsage < 85 ? 'warning' : 'critical',
          threshold: 80
        },
        {
          name: 'Tempo de Carregamento',
          value: newData.pageLoadTime,
          unit: 'ms',
          status: newData.pageLoadTime < 200 ? 'excellent' :
                  newData.pageLoadTime < 500 ? 'good' :
                  newData.pageLoadTime < 1000 ? 'warning' : 'critical',
          threshold: 200
        }
      ];

      setRealTimeMetrics(metrics);
    };

    // Initial load
    updateMetrics();
    
    // Update every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary', 
      warning: 'destructive',
      critical: 'destructive'
    } as const;

    const labels = {
      excellent: 'Excelente',
      good: 'Bom',
      warning: 'Atenção',
      critical: 'Crítico'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const overallStatus = realTimeMetrics.every(m => m.status === 'excellent') ? 'excellent' :
                       realTimeMetrics.some(m => m.status === 'critical') ? 'critical' :
                       realTimeMetrics.some(m => m.status === 'warning') ? 'warning' : 'good';

  return (
    <div className="space-y-6" data-testid="performance-monitor">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              UX Hiper-Rápida Status
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(overallStatus)}
              {getStatusBadge(overallStatus)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {performanceData.responseTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Resp. API</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {performanceData.cacheHitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {performanceData.pageLoadTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Load Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {performanceData.activeConnections}
              </div>
              <div className="text-sm text-muted-foreground">Conexões</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {realTimeMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  <span className="font-medium">{metric.name}</span>
                </div>
                {getStatusBadge(metric.status)}
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold">
                  {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
                </span>
                <span className="text-sm text-muted-foreground">
                  Meta: {metric.threshold}{metric.unit}
                </span>
              </div>

              <Progress 
                value={metric.unit === '%' ? metric.value : (metric.value / metric.threshold) * 100} 
                className="h-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Otimizações Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Otimizações Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Frontend</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>• Prefetch inteligente</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>• Cache otimizado</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>• Lazy loading</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>• Preload crítico</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Backend</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>• Compressão GZIP</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>• Connection pooling</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>• Query optimization</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span>• Edge caching</span>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Última Atualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Monitoramento ativo desde: {performanceData.lastUpdate.toLocaleTimeString()}
            </span>
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              Ao vivo
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};