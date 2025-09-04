import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Wifi, 
  WifiOff, 
  Battery, 
  Map, 
  MessageSquare, 
  Phone, 
  Download, 
  Upload, 
  Signal, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe
} from 'lucide-react';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  signalStrength: number;
  latency: number;
  bandwidth: number;
  provider: string;
  lastCheck: number;
}

interface OfflineMap {
  id: string;
  region: string;
  province: string;
  packageSize: number;
  lastUpdated: number;
  version: string;
}

interface SyncStats {
  totalPending: number;
  criticalPending: number;
  normalPending: number;
  lowPriorityPending: number;
  successRate: number;
  lastSuccessfulSync: number;
}

export default function AngolaOperationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deviceId] = useState(() => 
    localStorage.getItem('deviceId') || `device-${Math.random().toString(36).substr(2, 9)}`
  );

  // Network Status
  const { data: networkStatus } = useQuery<NetworkStatus>({
    queryKey: ['/api/angola/network/status', deviceId],
    refetchInterval: 5000,
  });

  // Offline Maps
  const { data: offlineMaps } = useQuery<OfflineMap[]>({
    queryKey: ['/api/angola/offline-maps'],
  });

  // Sync Queue Status
  const { data: syncStatus } = useQuery<{ stats: SyncStats; networkStatus: NetworkStatus }>({
    queryKey: ['/api/angola/sync/status', deviceId],
    refetchInterval: 10000,
  });

  // SMS Configuration
  const [smsConfig, setSmsConfig] = useState({
    phoneNumber: '',
    provider: 'unitel' as 'unitel' | 'movicel' | 'africell'
  });

  // Mutations
  const reportNetworkFailureMutation = useMutation({
    mutationFn: async (data: { duration: number; affectedOperations: string[] }) => {
      const response = await apiRequest('POST', '/api/angola/network-failure', { ...data, deviceId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Falha de rede registrada', description: 'Sistema de fallback ativado automaticamente' });
      queryClient.invalidateQueries();
    }
  });

  const downloadMapMutation = useMutation({
    mutationFn: async (mapId: string) => {
      const response = await apiRequest('POST', '/api/angola/offline-maps/download', { mapId, deviceId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Download iniciado', description: 'Mapa offline será baixado em segundo plano' });
    }
  });

  const configureSMSMutation = useMutation({
    mutationFn: async (config: typeof smsConfig) => {
      const response = await apiRequest('POST', '/api/angola/sms/configure', { ...config, deviceId });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'SMS fallback configurado', description: 'Sistema pronto para operação offline' });
    }
  });

  const processSyncMutation = useMutation({
    mutationFn: async (force: boolean = false) => {
      const response = await apiRequest('POST', '/api/angola/sync/process', { deviceId, force });
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Sincronização processada', 
        description: `${data.result.successful} itens sincronizados com sucesso` 
      });
      queryClient.invalidateQueries();
    }
  });

  const simulateNetworkFailure = () => {
    reportNetworkFailureMutation.mutate({
      duration: 45000,
      affectedOperations: ['inventory_sync', 'order_processing', 'tracking_updates']
    });
  };

  const getConnectionIcon = (connectionType: string, isOnline: boolean) => {
    if (!isOnline) return <WifiOff className="w-4 h-4 text-red-500" />;
    
    switch (connectionType) {
      case 'wifi':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case '4g':
      case '3g':
        return <Signal className="w-4 h-4 text-blue-500" />;
      case '2g':
        return <Signal className="w-4 h-4 text-orange-500" />;
      default:
        return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSignalColor = (strength: number) => {
    if (strength > 70) return 'text-green-500';
    if (strength > 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  useEffect(() => {
    localStorage.setItem('deviceId', deviceId);
  }, [deviceId]);

  return (
    <div className="min-h-screen bg-background" data-testid="angola-operations-page">
      <Header title="Operações Angola" breadcrumbs={["Operações Angola"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Sistema robusto para operação em condições desafiadoras de infraestrutura
          </p>
        <Badge variant="outline" className="text-sm">
          Device: {deviceId.slice(-6)}
        </Badge>
      </div>

      <Tabs defaultValue="network" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network" data-testid="tab-network">Rede & Energia</TabsTrigger>
          <TabsTrigger value="maps" data-testid="tab-maps">Mapas Offline</TabsTrigger>
          <TabsTrigger value="fallback" data-testid="tab-fallback">SMS/USSD</TabsTrigger>
          <TabsTrigger value="sync" data-testid="tab-sync">Buffer & Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="network-status-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getConnectionIcon(networkStatus?.connectionType || 'none', networkStatus?.isOnline || false)}
                  Status da Rede
                </CardTitle>
                <CardDescription>Monitoramento em tempo real da conectividade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Conexão:</span>
                  <Badge variant={networkStatus?.isOnline ? 'default' : 'destructive'}>
                    {networkStatus?.isOnline ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                
                {networkStatus?.isOnline && (
                  <>
                    <div className="flex justify-between items-center">
                      <span>Tipo:</span>
                      <span className="font-mono text-sm">{networkStatus.connectionType.toUpperCase()}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Sinal:</span>
                        <span className={`font-mono text-sm ${getSignalColor(networkStatus.signalStrength)}`}>
                          {networkStatus.signalStrength}%
                        </span>
                      </div>
                      <Progress value={networkStatus.signalStrength} className="w-full" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Latência:</span>
                      <span className="font-mono text-sm">{networkStatus.latency}ms</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Operadora:</span>
                      <span className="font-mono text-sm capitalize">{networkStatus.provider}</span>
                    </div>
                  </>
                )}

                <Button 
                  onClick={simulateNetworkFailure}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  data-testid="simulate-network-failure"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Simular Falha de Rede
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="power-status-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="w-5 h-5" />
                  Gestão de Energia
                </CardTitle>
                <CardDescription>Proteção automática em falhas de energia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Bateria Simulada:</span>
                    <span className="font-mono text-sm">85%</span>
                  </div>
                  <Progress value={85} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Auto-save ativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Operações críticas protegidas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Backup a cada 30s</span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Sistema configurado para shutdown automático com bateria menor que 15%</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maps" className="space-y-6">
          <Card data-testid="offline-maps-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Mapas Offline - Angola
              </CardTitle>
              <CardDescription>
                Pacotes de navegação para operação sem conectividade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(offlineMaps) ? offlineMaps.map((map) => (
                  <div 
                    key={map.id} 
                    className="border rounded-lg p-4 space-y-3"
                    data-testid={`map-package-${map.province.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{map.province}</h4>
                        <p className="text-sm text-muted-foreground">{map.region}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        v{map.version}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Tamanho:</span>
                        <span className="font-mono">{formatFileSize(map.packageSize * 1024 * 1024)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Atualizado:</span>
                        <span className="font-mono">{formatTimeAgo(map.lastUpdated)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => downloadMapMutation.mutate(map.id)}
                      disabled={downloadMapMutation.isPending}
                      size="sm"
                      className="w-full"
                      data-testid={`download-map-${map.province.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {downloadMapMutation.isPending ? 'Baixando...' : 'Baixar'}
                    </Button>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhum mapa offline disponível</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fallback" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="sms-config-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Configuração SMS
                </CardTitle>
                <CardDescription>Fallback via SMS para confirmação de entregas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="+244 900 000 000"
                    value={smsConfig.phoneNumber}
                    onChange={(e) => setSmsConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    data-testid="input-phone-number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Operadora</Label>
                  <Select
                    value={smsConfig.provider}
                    onValueChange={(value: typeof smsConfig.provider) => 
                      setSmsConfig(prev => ({ ...prev, provider: value }))
                    }
                  >
                    <SelectTrigger data-testid="select-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unitel">Unitel</SelectItem>
                      <SelectItem value="movicel">Movicel</SelectItem>
                      <SelectItem value="africell">Africell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => configureSMSMutation.mutate(smsConfig)}
                  disabled={!smsConfig.phoneNumber || configureSMSMutation.isPending}
                  className="w-full"
                  data-testid="configure-sms"
                >
                  {configureSMSMutation.isPending ? 'Configurando...' : 'Configurar SMS'}
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="ussd-info-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Sistema USSD
                </CardTitle>
                <CardDescription>Menu USSD para confirmações básicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <p className="font-semibold mb-2">Menu Principal USSD:</p>
                  <p>*7777*SGST#</p>
                  <div className="mt-3 space-y-1">
                    <p>1 - Confirmar Entrega</p>
                    <p>2 - Reportar Problema</p>
                    <p>3 - Status da Encomenda</p>
                    <p>0 - Sair</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Funciona em qualquer telemóvel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Sem necessidade de internet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Disponível 24/7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="sync-stats-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Fila de Sincronização
                </CardTitle>
                <CardDescription>Status do buffer local e sincronização diferida</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {syncStatus?.stats && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{syncStatus.stats.criticalPending}</div>
                        <div className="text-xs text-red-600">Crítico</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{syncStatus.stats.normalPending}</div>
                        <div className="text-xs text-orange-600">Normal</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Pendente:</span>
                        <span className="font-bold">{syncStatus.stats.totalPending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Sucesso:</span>
                        <span className="font-bold">{syncStatus.stats.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Última Sincronização:</span>
                        <span className="font-mono text-sm">{formatTimeAgo(syncStatus.stats.lastSuccessfulSync)}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => processSyncMutation.mutate(false)}
                      disabled={processSyncMutation.isPending || !networkStatus?.isOnline}
                      className="w-full"
                      data-testid="process-sync"
                    >
                      {processSyncMutation.isPending ? 'Sincronizando...' : 'Processar Sincronização'}
                    </Button>

                    {!networkStatus?.isOnline && (
                      <Button 
                        onClick={() => processSyncMutation.mutate(true)}
                        disabled={processSyncMutation.isPending}
                        variant="outline"
                        className="w-full"
                        data-testid="force-sync"
                      >
                        Forçar Sincronização (Modo Teste)
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card data-testid="buffer-config-card">
              <CardHeader>
                <CardTitle>Configuração do Buffer</CardTitle>
                <CardDescription>Gestão inteligente de prioridades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold text-red-600">Operações Críticas</div>
                      <div className="text-sm text-muted-foreground">Inventário, entregas, pagamentos</div>
                    </div>
                    <Badge variant="destructive">Prioridade 1</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold text-orange-600">Operações Normais</div>
                      <div className="text-sm text-muted-foreground">Atualizações de status, relatórios</div>
                    </div>
                    <Badge variant="outline">Prioridade 2</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-semibold text-blue-600">Baixa Prioridade</div>
                      <div className="text-sm text-muted-foreground">Analytics, logs, estatísticas</div>
                    </div>
                    <Badge variant="secondary">Prioridade 3</Badge>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Retry inteligente:</strong> Operações falham são tentadas novamente 
                    automaticamente com backoff exponencial até 5 tentativas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}