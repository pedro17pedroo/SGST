import { useState, useEffect } from 'react';
import { Plus, Truck, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FleetTrackingMap } from '@/components/fleet/fleet-tracking-map';
import { VehicleAssignments } from '@/components/fleet/vehicle-assignments';

interface Vehicle {
  id: string;
  licensePlate: string;
  make: string; // Corresponde ao campo 'make' do backend
  model: string;
  year: number;
  vin?: string;
  type: string; // truck, van, car
  capacity?: string; // Campo único do backend (decimal)
  fuelType: string; // Corresponde ao campo 'fuel_type' do backend
  status: string; // available, in_use, maintenance, out_of_service
  driverId?: string;
  currentLocation?: any; // JSON do backend
  lastGpsUpdate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VehicleFormData {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  type: string;
  capacity?: string;
  fuelType: string;
  status: string;
  driverId?: string;
  isActive: boolean;
}

const initialFormData: VehicleFormData = {
  licensePlate: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  type: 'truck',
  capacity: '0',
  fuelType: 'diesel',
  status: 'available',
  driverId: 'none',
  isActive: true
};

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
    fetchUsers();
  }, []); 

  const fetchUsers = async () => {
    try {
      const response = await apiRequest('GET', '/api/users');
      const data = await response.json();
      setUsers(data.filter((user: User) => user.role === 'driver' || user.role === 'operator'));
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/fleet/vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os veículos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Preparar dados para envio, convertendo "none" para null
      const submitData = {
        ...formData,
        driverId: formData.driverId === 'none' ? null : formData.driverId
      };
      
      if (editingVehicle) {
        await apiRequest('PUT', `/api/fleet/vehicles/${editingVehicle.id}`, submitData);
        toast({
          title: "Sucesso",
          description: "Veículo atualizado com sucesso.",
        });
      } else {
        await apiRequest('POST', '/api/fleet/vehicles', submitData);
        toast({
          title: "Sucesso",
          description: "Veículo criado com sucesso.",
        });
      }
      
      setIsDialogOpen(false);
      setEditingVehicle(null);
      setFormData(initialFormData);
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar veículo.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin || '',
      type: vehicle.type,
      capacity: vehicle.capacity || '',
      fuelType: vehicle.fuelType,
      status: vehicle.status,
      driverId: vehicle.driverId || 'none',
      isActive: vehicle.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    
    try {
      await apiRequest('DELETE', `/api/fleet/vehicles/${vehicleId}`);
      toast({
        title: "Sucesso",
        description: "Veículo excluído com sucesso.",
      });
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir veículo.",
        variant: "destructive",
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'Disponível', variant: 'default' as const },
      in_use: { label: 'Em Uso', variant: 'secondary' as const },
      maintenance: { label: 'Manutenção', variant: 'secondary' as const },
      out_of_service: { label: 'Fora de Serviço', variant: 'outline' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const fuelMap = {
      gasoline: 'Gasolina',
      diesel: 'Diesel',
      electric: 'Elétrico',
      hybrid: 'Híbrido'
    };
    return fuelMap[fuelType as keyof typeof fuelMap] || fuelType;
  };

  const openNewVehicleDialog = () => {
    setEditingVehicle(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const activeVehicles = vehicles.filter(v => v.status === 'available').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const inactiveVehicles = vehicles.filter(v => v.status === 'out_of_service').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Frota</h1>
          <p className="text-muted-foreground">Gerencie sua frota de veículos, GPS e atribuições</p>
        </div>
        <Button onClick={openNewVehicleDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Veículos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos Ativos</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{maintenanceVehicles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <Truck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{inactiveVehicles}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          <TabsTrigger value="assignments">Atribuições</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por matrícula, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="in_use">Em Uso</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Veículos</CardTitle>
              <CardDescription>Gerencie todos os veículos da sua frota</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando veículos...</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum veículo encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros.' : 'Comece adicionando um novo veículo.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Combustível</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                            <div className="text-sm text-muted-foreground">Ano {vehicle.year}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm capitalize">
                            {vehicle.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {vehicle.capacity}
                          </div>
                        </TableCell>
                        <TableCell>{getFuelTypeLabel(vehicle.fuelType)}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(vehicle)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(vehicle.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <FleetTrackingMap height="600px" />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <VehicleAssignments />
        </TabsContent>
      </Tabs>

      {/* Vehicle Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle ? 'Atualize as informações do veículo.' : 'Adicione um novo veículo à frota.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Matrícula *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  required
                  placeholder="AA-00-BB"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status && typeof formData.status === 'string' ? formData.status : 'available'} onValueChange={(value) => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="in_use">Em Uso</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="out_of_service">Fora de Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Marca *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  min="1950"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin || ''}
                  onChange={(e) => setFormData({...formData, vin: e.target.value})}
                  placeholder="Número de identificação do veículo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type && typeof formData.type === 'string' ? formData.type : 'truck'} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Camião</SelectItem>
                    <SelectItem value="van">Carrinha</SelectItem>
                    <SelectItem value="car">Carro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="Ex: 1000kg, 5m³"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Combustível</Label>
                <Select value={formData.fuelType && typeof formData.fuelType === 'string' ? formData.fuelType : 'diesel'} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasoline">Gasolina</SelectItem>
                    <SelectItem value="electric">Elétrico</SelectItem>
                    <SelectItem value="hybrid">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverId">Motorista Atribuído</Label>
                <Select value={formData.driverId && typeof formData.driverId === 'string' ? formData.driverId : 'none'} onValueChange={(value) => setFormData({...formData, driverId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum motorista</SelectItem>
                    {(users || []).filter(user => 
                      user && 
                      user.id && 
                      typeof user.id === 'string' && 
                      user.id.trim() !== '' &&
                      user.username && 
                      typeof user.username === 'string' &&
                      user.username.trim() !== '' &&
                      user.email &&
                      typeof user.email === 'string' &&
                      user.email.trim() !== ''
                    ).map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Veículo Ativo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingVehicle ? 'Atualizar' : 'Criar'} Veículo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}