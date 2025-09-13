import { useState, useEffect } from 'react';
import { Plus, Truck, AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { useToast } from '@/hooks/use-toast';
import { LoadingState, LoadingComponents, useLoadingStates } from '@/components/ui/loading-state';
import { FleetTrackingMap } from '@/components/fleet/fleet-tracking-map';
import { VehicleAssignments } from '@/components/fleet/vehicle-assignments';
import { GpsDeviceManagement } from '@/components/fleet/gps-device-management';
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from '@/hooks/api/use-fleet';
import { useDrivers, useOperators } from '@/hooks/api/use-users';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { fleetService } from '@/services/api.service';
import { Header } from '@/components/layout/header';

interface Vehicle {
  id: string;
  licensePlate: string;
  make: string; // Marca do veículo
  model: string;
  year: number;
  color?: string; // Cor do veículo
  vin?: string;
  vehicleTypeId: string; // ID do tipo de veículo
  capacity: string; // Capacidade em decimal (string)
  fuelTypeId: string; // ID do tipo de combustível
  status: string; // available, in_use, maintenance, out_of_service
  carrierId: string; // ID da transportadora proprietária
  driverId?: string | null;
  currentLocation?: string; // JSON string do backend
  lastGpsUpdate?: string | null;
  // Campos de GPS
  gpsType: 'default' | 'external' | 'none'; // Tipo de GPS: padrão (dispositivo), externo ou nenhum
  gpsDeviceId?: string | null; // ID do dispositivo GPS externo (se aplicável)
  gpsEnabled: boolean; // Se o GPS está habilitado para este veículo
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VehicleFormData {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string; // Campo obrigatório adicionado
  vin?: string;
  vehicleTypeId: string;
  capacity?: string;
  fuelTypeId: string;
  status: string;
  carrierId: string;
  driverId?: string;
  // Campos de GPS
  gpsType: 'default' | 'external' | 'none';
  gpsDeviceId?: string;
  gpsEnabled: boolean;
  isActive: boolean;
}

interface VehicleType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface FuelType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const initialFormData: VehicleFormData = {
  licensePlate: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  color: '', // Campo obrigatório adicionado
  vin: '',
  vehicleTypeId: '',
  capacity: '0',
  fuelTypeId: '',
  status: 'available',
  carrierId: '',
  driverId: 'none',
  // Configurações padrão de GPS
  gpsType: 'default',
  gpsDeviceId: '',
  gpsEnabled: true,
  isActive: true
};

// interface User { // Removido - não utilizado
//   id: string;
//   username: string;
//   email: string;
//   role: string;
// }

export default function FleetPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [carrierFilter, setCarrierFilter] = useState<string>('all');
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // const { toast } = useToast();

  // Usar hooks centralizados
  const { data: vehiclesResponse, isLoading: loading, error } = useVehicles();
  const { data: driversResponse } = useDrivers();
  const { data: operatorsResponse } = useOperators();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();
  
  // Hook para buscar transportadoras ativas
  const { data: carriers = [] } = useQuery({
    queryKey: ['carriers', 'active'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/carriers/active');
      return await response.json();
    }
  });
  
  // Buscar tipos de veículo e combustível
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const [vehicleTypesResponse, fuelTypesResponse] = await Promise.all([
          fleetService.getVehicleTypes(),
          fleetService.getFuelTypes()
        ]);
        
        // Corrigir o mapeamento dos dados do backend
        if (vehicleTypesResponse.success && (vehicleTypesResponse.data as any)?.vehicleTypes && Array.isArray((vehicleTypesResponse.data as any).vehicleTypes)) {
          setVehicleTypes((vehicleTypesResponse.data as any).vehicleTypes.filter((type: VehicleType) => type.isActive));
        }
        
        if (fuelTypesResponse.success && (fuelTypesResponse.data as any)?.fuelTypes && Array.isArray((fuelTypesResponse.data as any).fuelTypes)) {
          setFuelTypes((fuelTypesResponse.data as any).fuelTypes.filter((fuel: FuelType) => fuel.isActive));
        }
      } catch (error) {
        console.error('Erro ao buscar tipos:', error);
      }
    };
    
    fetchTypes();
  }, []);

  // Extrair dados das respostas
  const vehicles = vehiclesResponse?.data || [];
  const drivers = driversResponse?.data || [];
  const operators = operatorsResponse?.data || [];
  const users = [...drivers, ...operators];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados para envio, convertendo "none" para null
    const submitData = {
      ...formData,
      driverId: formData.driverId === 'none' ? null : formData.driverId
    };
    
    try {
      if (editingVehicle) {
        await updateVehicleMutation.mutateAsync({ id: editingVehicle.id, data: submitData });
      } else {
        await createVehicleMutation.mutateAsync(submitData);
      }
      
      setIsDialogOpen(false);
      setEditingVehicle(null);
      setFormData(initialFormData);
    } catch (error) {
      // Erro já tratado pelos hooks
      console.error('Erro ao salvar veículo:', error);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color || '', // Campo cor adicionado
      vin: vehicle.vin || '',
      vehicleTypeId: vehicle.vehicleTypeId,
      capacity: vehicle.capacity || '',
      fuelTypeId: vehicle.fuelTypeId,
      status: vehicle.status,
      carrierId: vehicle.carrierId || '',
      driverId: vehicle.driverId || 'none',
      // Campos de GPS com valores padrão se não existirem
      gpsType: vehicle.gpsType || 'default',
      gpsDeviceId: vehicle.gpsDeviceId || '',
      gpsEnabled: vehicle.gpsEnabled ?? true,
      isActive: vehicle.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este veículo?')) return;
    
    try {
      await deleteVehicleMutation.mutateAsync(vehicleId);
    } catch (error) {
      // Erro já tratado pelo hook
      console.error('Erro ao eliminar veículo:', error);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesCarrier = carrierFilter === 'all' || vehicle.carrierId === carrierFilter;
    return matchesSearch && matchesStatus && matchesCarrier;
  });

  // Lógica de paginação
  const totalVehicles = filteredVehicles.length;
  const totalPages = Math.ceil(totalVehicles / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const loadingStates = useLoadingStates(paginatedVehicles, loading, error);

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

  const getFuelTypeLabel = (fuelTypeId: string) => {
    const fuelType = fuelTypes.find((f: any) => f.id === fuelTypeId);
    return fuelType ? fuelType.name : 'N/A';
  };

  const getVehicleTypeLabel = (vehicleTypeId: string) => {
    const vehicleType = vehicleTypes.find((v: any) => v.id === vehicleTypeId);
    return vehicleType ? vehicleType.name : 'N/A';
  };

  const getCarrierName = (carrierId: string) => {
    const carrier = carriers.find((c: any) => c.id === carrierId);
    return carrier ? carrier.name : 'N/A';
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
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Frota" breadcrumbs={["Gestão de Frota"]} />
      
      <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie sua frota de veículos, GPS e atribuições
          </p>
          <Button onClick={openNewVehicleDialog} className="w-full sm:w-auto">
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
          <TabsTrigger value="gps-devices">Dispositivos GPS</TabsTrigger>
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
            <Select value={carrierFilter} onValueChange={setCarrierFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por transportadora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Transportadoras</SelectItem>
                {carriers.map((carrier: any) => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.name}
                  </SelectItem>
                ))}
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
              <LoadingState
                isLoading={loadingStates.isLoading}
                error={loadingStates.error}
                isEmpty={loadingStates.isEmpty}
                loadingComponent={<LoadingComponents.Table />}
                emptyComponent={
                  <div className="text-center py-8">
                    <Truck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum veículo encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros.' : 'Comece adicionando um novo veículo.'}
                    </p>
                  </div>
                }
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Veículo</TableHead>
                      <TableHead>Transportadora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Combustível</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                            <div className="text-sm text-muted-foreground">Ano {vehicle.year}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getCarrierName(vehicle.carrierId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm capitalize">
                            {getVehicleTypeLabel(vehicle.vehicleTypeId)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {vehicle.capacity} kg
                          </div>
                        </TableCell>
                        <TableCell>{getFuelTypeLabel(vehicle.fuelTypeId)}</TableCell>
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
              </LoadingState>
              
              {/* Paginação */}
              {paginatedVehicles.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Itens por página:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages} ({totalVehicles} veículos)
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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

        <TabsContent value="gps-devices" className="space-y-4">
          <GpsDeviceManagement />
        </TabsContent>
      </Tabs>

      {/* Vehicle Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingVehicle ? 'Editar Veículo' : 'Adicionar Novo Veículo'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingVehicle ? 'Atualize as informações do veículo na frota.' : 'Preencha os dados para adicionar um novo veículo à frota.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção: Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Truck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate" className="text-sm font-medium flex items-center gap-1">
                    Matrícula <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                    required
                    placeholder="Ex: AA-00-BB"
                    className={`${!formData.licensePlate && 'border-red-200 focus:border-red-500'}`}
                  />
                  {!formData.licensePlate && (
                    <p className="text-xs text-red-500">Matrícula é obrigatória</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make" className="text-sm font-medium flex items-center gap-1">
                    Marca <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    required
                    placeholder="Ex: Toyota, Mercedes, Volvo"
                    className={`${!formData.make && 'border-red-200 focus:border-red-500'}`}
                  />
                  {!formData.make && (
                    <p className="text-xs text-red-500">Marca é obrigatória</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-medium flex items-center gap-1">
                    Modelo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    required
                    placeholder="Ex: Corolla, Actros, FH16"
                    className={`${!formData.model && 'border-red-200 focus:border-red-500'}`}
                  />
                  {!formData.model && (
                    <p className="text-xs text-red-500">Modelo é obrigatório</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium flex items-center gap-1">
                    Ano de Fabricação <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || new Date().getFullYear()})}
                    required
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    placeholder={`Ex: ${new Date().getFullYear()}`}
                    className={`${(!formData.year || formData.year < 1950) && 'border-red-200 focus:border-red-500'}`}
                  />
                  {(!formData.year || formData.year < 1950) && (
                    <p className="text-xs text-red-500">Ano válido é obrigatório</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="text-sm font-medium flex items-center gap-1">
                    Cor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    required
                    placeholder="Ex: Branco, Azul, Vermelho"
                    className={`${!formData.color && 'border-red-200 focus:border-red-500'}`}
                  />
                  {!formData.color && (
                    <p className="text-xs text-red-500">Cor é obrigatória</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vin" className="text-sm font-medium">
                    VIN (Opcional)
                  </Label>
                  <Input
                    id="vin"
                    value={formData.vin || ''}
                    onChange={(e) => setFormData({...formData, vin: e.target.value.toUpperCase()})}
                    placeholder="Número de identificação do veículo"
                    maxLength={17}
                  />
                  <p className="text-xs text-muted-foreground">Código único de 17 caracteres</p>
                </div>
              </div>
            </div>

            {/* Seção: Especificações Técnicas */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Especificações Técnicas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleTypeId" className="text-sm font-medium">
                    Tipo de Veículo
                  </Label>
                  <Select value={formData.vehicleTypeId || ''} onValueChange={(value) => setFormData({...formData, vehicleTypeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-medium">
                    Capacidade de Carga
                  </Label>
                  <Input
                    id="capacity"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="Ex: 1000kg, 5m³, 20 toneladas"
                  />
                  <p className="text-xs text-muted-foreground">Especifique peso ou volume máximo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelTypeId" className="text-sm font-medium">
                    Tipo de Combustível
                  </Label>
                  <Select value={formData.fuelTypeId || ''} onValueChange={(value) => setFormData({...formData, fuelTypeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o combustível" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((fuel) => (
                        <SelectItem key={fuel.id} value={fuel.id}>
                          {fuel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Seção: Atribuições e Status */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Search className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Atribuições e Status</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carrierId" className="text-sm font-medium flex items-center gap-1">
                    Transportadora <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.carrierId || ''} onValueChange={(value) => setFormData({...formData, carrierId: value})}>
                    <SelectTrigger className={`${!formData.carrierId && 'border-red-200'}`}>
                      <SelectValue placeholder="Selecione a transportadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((carrier: any) => (
                        <SelectItem key={carrier.id} value={carrier.id}>
                          {carrier.name} ({carrier.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.carrierId && (
                    <p className="text-xs text-red-500">Transportadora é obrigatória</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status Operacional
                  </Label>
                  <Select value={formData.status || 'available'} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">🟢 Disponível</SelectItem>
                      <SelectItem value="in_use">🔵 Em Uso</SelectItem>
                      <SelectItem value="maintenance">🟡 Em Manutenção</SelectItem>
                      <SelectItem value="out_of_service">🔴 Fora de Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverId" className="text-sm font-medium">
                    Motorista Atribuído
                  </Label>
                  <Select value={formData.driverId || 'none'} onValueChange={(value) => setFormData({...formData, driverId: value})}>
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
              </div>
            </div>

            {/* Seção: Configuração GPS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
                <h3 className="text-sm font-semibold text-foreground">Sistema de Rastreamento GPS</h3>
              </div>
              
              <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="gpsEnabled"
                    checked={formData.gpsEnabled}
                    onChange={(e) => setFormData({...formData, gpsEnabled: e.target.checked})}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="gpsEnabled" className="text-sm font-medium cursor-pointer">
                    Ativar rastreamento GPS para este veículo
                  </Label>
                </div>

                {formData.gpsEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="gpsType" className="text-sm font-medium">
                        Tipo de GPS
                      </Label>
                      <Select value={formData.gpsType} onValueChange={(value: 'default' | 'external' | 'none') => setFormData({...formData, gpsType: value, gpsDeviceId: value === 'default' ? '' : formData.gpsDeviceId})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de GPS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">📱 GPS Padrão (Dispositivo Atual)</SelectItem>
                          <SelectItem value="external">🛰️ Dispositivo GPS Externo</SelectItem>
                          <SelectItem value="none">❌ Sem GPS</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {formData.gpsType === 'default' && 'Utiliza o GPS do dispositivo que acessa o sistema'}
                        {formData.gpsType === 'external' && 'Utiliza um dispositivo GPS específico'}
                        {formData.gpsType === 'none' && 'Veículo sem rastreamento GPS'}
                      </p>
                    </div>

                    {formData.gpsType === 'external' && (
                      <div className="space-y-2">
                        <Label htmlFor="gpsDeviceId" className="text-sm font-medium">
                          ID do Dispositivo GPS
                        </Label>
                        <Input
                          id="gpsDeviceId"
                          value={formData.gpsDeviceId || ''}
                          onChange={(e) => setFormData({...formData, gpsDeviceId: e.target.value})}
                          placeholder="Ex: GPS001, TRACKER123"
                        />
                        <p className="text-xs text-muted-foreground">
                          ID do dispositivo previamente configurado no sistema
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Status do Veículo */}
            <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg border">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Veículo ativo na frota
              </Label>
              <p className="text-xs text-muted-foreground ml-auto">
                Desmarque para desativar temporariamente o veículo
              </p>
            </div>

            <DialogFooter className="gap-2 pt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.licensePlate || !formData.make || !formData.model || !formData.color || !formData.carrierId}
                className="min-w-[120px]"
              >
                {editingVehicle ? 'Atualizar Veículo' : 'Criar Veículo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}