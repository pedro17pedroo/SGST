import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Satellite, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/ui/loading-state';

interface GpsDevice {
  id: string;
  name: string;
  deviceId: string; // ID único do dispositivo
  type: 'tracker' | 'smartphone' | 'tablet' | 'obd' | 'other';
  brand?: string;
  model?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastConnection?: string;
  batteryLevel?: number;
  signalStrength?: number;
  assignedVehicleId?: string;
  assignedVehiclePlate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GpsDeviceFormData {
  name: string;
  deviceId: string;
  type: 'tracker' | 'smartphone' | 'tablet' | 'obd' | 'other';
  brand?: string;
  model?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  isActive: boolean;
}

interface VehicleGpsConfig {
  vehicleId: string;
  defaultGpsDeviceId: string | null;
  useDeviceGps: boolean;
  updateInterval: number; // em segundos
  highAccuracy: boolean;
}

interface Vehicle {
  id: string;
  license_plate: string;
  make: string;
  model: string;
}

const initialFormData: GpsDeviceFormData = {
  name: '',
  deviceId: '',
  type: 'tracker',
  brand: '',
  model: '',
  status: 'active',
  isActive: true
};

const deviceTypeLabels = {
  tracker: 'Rastreador GPS',
  smartphone: 'Smartphone',
  tablet: 'Tablet',
  obd: 'Dispositivo OBD',
  other: 'Outro'
};

const statusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  maintenance: 'Manutenção',
  error: 'Erro'
};

export function GpsDeviceManagement() {
  const [devices, setDevices] = useState<GpsDevice[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<GpsDevice | null>(null);
  const [formData, setFormData] = useState<GpsDeviceFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleConfigs, setVehicleConfigs] = useState<VehicleGpsConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'devices' | 'vehicle-config'>('devices');
  const { toast } = useToast();

  // Inicializar configurações dos veículos
  useEffect(() => {
    const initialConfigs: VehicleGpsConfig[] = mockVehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      defaultGpsDeviceId: devices.find(device => device.assignedVehicleId === vehicle.id)?.id || null,
      useDeviceGps: false,
      updateInterval: 30,
      highAccuracy: true
    }));
    setVehicleConfigs(initialConfigs);
  }, [devices]);

  // Mock data para veículos
  const mockVehicles = [
    { id: 'vehicle-1', license_plate: 'LD-123-AB', make: 'Toyota', model: 'Hilux' },
    { id: 'vehicle-2', license_plate: 'LD-456-CD', make: 'Nissan', model: 'Navara' },
    { id: 'vehicle-3', license_plate: 'LD-789-EF', make: 'Ford', model: 'Ranger' },
    { id: 'vehicle-4', license_plate: 'LD-012-GH', make: 'Isuzu', model: 'D-Max' }
  ];

  // Simulação de dados - em produção, isso viria de uma API
  useEffect(() => {
    const mockDevices: GpsDevice[] = [
      {
        id: '1',
        name: 'Rastreador Principal 001',
        deviceId: 'GPS-001-ABC123',
        type: 'tracker',
        brand: 'TechGPS',
        model: 'TG-4000',
        status: 'active',
        lastConnection: new Date().toISOString(),
        batteryLevel: 85,
        signalStrength: 92,
        assignedVehicleId: 'vehicle-1',
        assignedVehiclePlate: 'LD-123-AB',
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Smartphone Motorista João',
        deviceId: 'PHONE-002-XYZ789',
        type: 'smartphone',
        brand: 'Samsung',
        model: 'Galaxy S23',
        status: 'active',
        lastConnection: new Date(Date.now() - 300000).toISOString(), // 5 min atrás
        batteryLevel: 67,
        signalStrength: 78,
        isActive: true,
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Rastreador Backup 003',
        deviceId: 'GPS-003-DEF456',
        type: 'tracker',
        brand: 'GlobalTrack',
        model: 'GT-2500',
        status: 'maintenance',
        lastConnection: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
        batteryLevel: 12,
        signalStrength: 0,
        isActive: false,
        createdAt: '2024-01-10T08:15:00Z',
        updatedAt: new Date().toISOString()
      }
    ];
    setDevices(mockDevices);
  }, []);

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.assignedVehiclePlate?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingDevice) {
        // Atualizar dispositivo existente
        const updatedDevice: GpsDevice = {
          ...editingDevice,
          ...formData,
          updatedAt: new Date().toISOString()
        };
        setDevices(prev => prev.map(d => d.id === editingDevice.id ? updatedDevice : d));
        toast({
          title: "Dispositivo Atualizado",
          description: "As informações do dispositivo GPS foram atualizadas com sucesso.",
        });
      } else {
        // Criar novo dispositivo
        const newDevice: GpsDevice = {
          id: Date.now().toString(),
          ...formData,
          lastConnection: new Date().toISOString(),
          batteryLevel: 100,
          signalStrength: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDevices(prev => [...prev, newDevice]);
        toast({
          title: "Dispositivo Criado",
          description: "Novo dispositivo GPS adicionado com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingDevice(null);
      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar dispositivo GPS.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (device: GpsDevice) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      deviceId: device.deviceId,
      type: device.type,
      brand: device.brand || '',
      model: device.model || '',
      status: device.status,
      isActive: device.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (deviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este dispositivo GPS?')) return;

    try {
      setLoading(true);
      // Simulação de API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDevices(prev => prev.filter(d => d.id !== deviceId));
      
      // Atualizar configurações dos veículos
      setVehicleConfigs(prev => 
        prev.map(config => 
          config.defaultGpsDeviceId === deviceId 
            ? { ...config, defaultGpsDeviceId: null }
            : config
        )
      );
      
      toast({
        title: "Dispositivo Excluído",
        description: "Dispositivo GPS removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir dispositivo GPS.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar configuração de veículo
  const updateVehicleConfig = (vehicleId: string, updates: Partial<VehicleGpsConfig>) => {
    setVehicleConfigs(prev => 
      prev.map(config => 
        config.vehicleId === vehicleId 
          ? { ...config, ...updates }
          : config
      )
    );
    
    toast({
      title: "Configuração atualizada",
      description: "As configurações de GPS do veículo foram atualizadas."
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, icon: CheckCircle },
      inactive: { variant: 'secondary' as const, icon: XCircle },
      maintenance: { variant: 'outline' as const, icon: RefreshCw },
      error: { variant: 'destructive' as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const formatLastConnection = (timestamp?: string) => {
    if (!timestamp) return 'Nunca';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-PT');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Satellite className="h-6 w-6" />
            Gestão de Dispositivos GPS
          </h2>
          <p className="text-muted-foreground">
            Gerencie dispositivos GPS e configure rastreamento por veículo
          </p>
        </div>
        {activeTab === 'devices' && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Dispositivo
          </Button>
        )}
      </div>

      {/* Abas */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'devices' | 'vehicle-config')}>
        <TabsList>
          <TabsTrigger value="devices">Dispositivos GPS</TabsTrigger>
          <TabsTrigger value="vehicle-config">Configuração por Veículo</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispositivos GPS</CardTitle>
              <CardDescription>
                Configure e gerencie dispositivos GPS para rastreamento da frota
              </CardDescription>
            </CardHeader>
        
        <CardContent>
          {/* Barra de pesquisa */}
          <div className="mb-6">
            <Input
              placeholder="Pesquisar dispositivos por nome, ID, marca ou veículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Ativos</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {devices.filter(d => d.status === 'active').length}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Manutenção</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {devices.filter(d => d.status === 'maintenance').length}
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Com Erro</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {devices.filter(d => d.status === 'error').length}
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Satellite className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{devices.length}</p>
            </div>
          </div>

          {/* Tabela de dispositivos */}
          <LoadingState isLoading={loading}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>ID do Dispositivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Veículo Atribuído</TableHead>
                  <TableHead>Última Conexão</TableHead>
                  <TableHead>Bateria</TableHead>
                  <TableHead>Sinal</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{device.name}</div>
                        {device.brand && device.model && (
                          <div className="text-sm text-muted-foreground">
                            {device.brand} {device.model}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {device.deviceId}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {deviceTypeLabels[device.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell>
                      {device.assignedVehiclePlate ? (
                        <Badge variant="secondary">{device.assignedVehiclePlate}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatLastConnection(device.lastConnection)}
                    </TableCell>
                    <TableCell>
                      {device.batteryLevel !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                device.batteryLevel > 50 ? 'bg-green-500' :
                                device.batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${device.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-xs">{device.batteryLevel}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {device.signalStrength !== undefined ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                device.signalStrength > 70 ? 'bg-green-500' :
                                device.signalStrength > 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${device.signalStrength}%` }}
                            />
                          </div>
                          <span className="text-xs">{device.signalStrength}%</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(device)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(device.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </LoadingState>

          {filteredDevices.length === 0 && !loading && (
            <div className="text-center py-8">
              <Satellite className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum dispositivo encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar os termos de pesquisa.' : 'Adicione o primeiro dispositivo GPS.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="vehicle-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de GPS por Veículo</CardTitle>
              <CardDescription>
                Configure qual dispositivo GPS cada veículo deve usar e suas preferências de rastreamento
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {mockVehicles.map((vehicle) => {
                  const config = vehicleConfigs.find(c => c.vehicleId === vehicle.id);
                  if (!config) return null;
                  
                  const availableDevices = devices.filter(device => 
                    device.assignedVehicleId === null || device.assignedVehicleId === vehicle.id
                  );
                  
                  return (
                    <Card key={vehicle.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{vehicle.license_plate}</h3>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.make} {vehicle.model}
                            </p>
                          </div>
                          <Badge variant={config.defaultGpsDeviceId ? "default" : "secondary"}>
                            {config.defaultGpsDeviceId ? "Configurado" : "Sem GPS"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Dispositivo GPS Padrão</Label>
                            <Select
                              value={config.defaultGpsDeviceId || "none"}
                              onValueChange={(value) => 
                                updateVehicleConfig(vehicle.id, {
                                  defaultGpsDeviceId: value === "none" ? null : value
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar dispositivo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhum dispositivo</SelectItem>
                                {availableDevices.map((device) => (
                                  <SelectItem key={device.id} value={device.id}>
                                    {device.name} ({device.deviceId})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Usar GPS do Dispositivo</Label>
                              <Switch
                                checked={config.useDeviceGps}
                                onCheckedChange={(checked) => 
                                  updateVehicleConfig(vehicle.id, { useDeviceGps: checked })
                                }
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Permitir uso do GPS do dispositivo móvel como alternativa
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Intervalo de Atualização: {config.updateInterval}s</Label>
                            <Slider
                              value={[config.updateInterval]}
                              onValueChange={([value]) => 
                                updateVehicleConfig(vehicle.id, { updateInterval: value })
                              }
                              min={10}
                              max={300}
                              step={10}
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Alta Precisão</Label>
                              <Switch
                                checked={config.highAccuracy}
                                onCheckedChange={(checked) => 
                                  updateVehicleConfig(vehicle.id, { highAccuracy: checked })
                                }
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Usar GPS de alta precisão (consome mais bateria)
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar dispositivo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDevice ? 'Editar Dispositivo GPS' : 'Novo Dispositivo GPS'}
            </DialogTitle>
            <DialogDescription>
              {editingDevice ? 'Atualize as informações do dispositivo GPS.' : 'Adicione um novo dispositivo GPS ao sistema.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Dispositivo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Ex: Rastreador Principal 001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceId">ID do Dispositivo *</Label>
                <Input
                  id="deviceId"
                  value={formData.deviceId}
                  onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                  required
                  placeholder="Ex: GPS-001-ABC123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Dispositivo</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tracker">Rastreador GPS</SelectItem>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="obd">Dispositivo OBD</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Ex: TechGPS, Samsung"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Ex: TG-4000, Galaxy S23"
                />
              </div>
              
              <div className="col-span-2 space-y-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Dispositivo Ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (editingDevice ? 'Atualizar' : 'Criar')} Dispositivo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}