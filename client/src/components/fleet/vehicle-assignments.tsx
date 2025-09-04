import { useState, useEffect } from 'react';
import { Plus, Truck, MapPin, Calendar, Clock, User, Package, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface VehicleAssignment {
  id: string;
  vehicleId: string;
  vehicle?: {
    licensePlate: string;
    brand: string;
    model: string;
    status: string;
  };
  shipmentId: string;
  driverId?: string;
  driver?: {
    name: string;
    email: string;
  };
  status: 'atribuido' | 'carregando' | 'em_transito' | 'entregue' | 'cancelado';
  estimatedDeparture?: string;
  actualDeparture?: string;
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt: string;
  updatedAt: string;
  shipment?: {
    id: string;
    trackingNumber: string;
    origin: string;
    destination: string;
    weight?: number;
  };
}

interface AssignmentFormData {
  vehicleId: string;
  shipmentId: string;
  driverId?: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
}

export function VehicleAssignments() {
  const [assignments, setAssignments] = useState<VehicleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    vehicleId: '',
    shipmentId: '',
    driverId: '',
    estimatedDeparture: '',
    estimatedArrival: ''
  });
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableShipments, setAvailableShipments] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchAvailableResources();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/fleet/assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Erro ao carregar atribuições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as atribuições.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      const [vehiclesRes, shipmentsRes, driversRes] = await Promise.all([
        apiRequest('GET', '/api/fleet/vehicles/available'),
        apiRequest('GET', '/api/shipping?status=pending'),
        apiRequest('GET', '/api/users?role=driver')
      ]);

      const [vehicles, shipments, drivers] = await Promise.all([
        vehiclesRes.json(),
        shipmentsRes.json(),
        driversRes.json()
      ]);

      setAvailableVehicles(vehicles);
      setAvailableShipments(shipments);
      setAvailableDrivers(drivers);
    } catch (error) {
      console.error('Erro ao carregar recursos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest('POST', '/api/fleet/assignments', formData);
      toast({
        title: "Sucesso",
        description: "Atribuição criada com sucesso.",
      });
      
      setIsDialogOpen(false);
      setFormData({
        vehicleId: '',
        shipmentId: '',
        driverId: '',
        estimatedDeparture: '',
        estimatedArrival: ''
      });
      fetchAssignments();
      fetchAvailableResources();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar atribuição.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (assignmentId: string, status: string) => {
    try {
      await apiRequest('PUT', `/api/fleet/assignments/${assignmentId}`, { status });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status.",
        variant: "destructive",
      });
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.shipment?.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      atribuido: { label: 'Atribuído', variant: 'outline' as const },
      carregando: { label: 'Carregando', variant: 'secondary' as const },
      em_transito: { label: 'Em Trânsito', variant: 'default' as const },
      entregue: { label: 'Entregue', variant: 'secondary' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.atribuido;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusActions = (assignment: VehicleAssignment) => {
    const currentStatus = assignment.status;
    const actions = [];

    if (currentStatus === 'atribuido') {
      actions.push(
        <Button
          key="start-loading"
          size="sm"
          variant="outline"
          onClick={() => handleUpdateStatus(assignment.id, 'carregando')}
        >
          Iniciar Carregamento
        </Button>
      );
    }

    if (currentStatus === 'carregando') {
      actions.push(
        <Button
          key="start-transit"
          size="sm"
          variant="outline"
          onClick={() => handleUpdateStatus(assignment.id, 'em_transito')}
        >
          Iniciar Trânsito
        </Button>
      );
    }

    if (currentStatus === 'em_transito') {
      actions.push(
        <Button
          key="complete"
          size="sm"
          variant="outline"
          onClick={() => handleUpdateStatus(assignment.id, 'entregue')}
        >
          Marcar Entregue
        </Button>
      );
    }

    if (['atribuido', 'carregando'].includes(currentStatus)) {
      actions.push(
        <Button
          key="cancel"
          size="sm"
          variant="destructive"
          onClick={() => handleUpdateStatus(assignment.id, 'cancelado')}
        >
          Cancelar
        </Button>
      );
    }

    return actions.length > 0 ? (
      <div className="flex gap-1 flex-wrap">{actions}</div>
    ) : (
      <span className="text-muted-foreground text-sm">Sem ações</span>
    );
  };

  const openNewAssignmentDialog = () => {
    setIsDialogOpen(true);
  };

  const assignedCount = assignments.filter(a => a.status === 'atribuido').length;
  const inTransitCount = assignments.filter(a => a.status === 'em_transito').length;
  const deliveredCount = assignments.filter(a => a.status === 'entregue').length;

  return (
    <div className="space-y-4">
      {/* Header and Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Atribuições Veículo-Envio</h2>
          <p className="text-muted-foreground">Gerencie as atribuições de veículos para envios</p>
        </div>
        <Button onClick={openNewAssignmentDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Atribuição
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atribuições</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atribuídas</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{assignedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inTransitCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{deliveredCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por matrícula, rastreamento ou motorista..."
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
            <SelectItem value="atribuido">Atribuído</SelectItem>
            <SelectItem value="carregando">Carregando</SelectItem>
            <SelectItem value="em_transito">Em Trânsito</SelectItem>
            <SelectItem value="entregue">Entregue</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Atribuições</CardTitle>
          <CardDescription>Acompanhe o progresso de todas as atribuições veículo-envio</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando atribuições...</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhuma atribuição encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' ? 'Tente ajustar os filtros.' : 'Comece criando uma nova atribuição.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Envio</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Horários</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{assignment.vehicle?.licensePlate}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.vehicle?.brand} {assignment.vehicle?.model}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-mono text-sm">{assignment.shipment?.trackingNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {assignment.shipment?.origin} → {assignment.shipment?.destination}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.driver ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{assignment.driver.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não atribuído</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {assignment.estimatedDeparture && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Saída: {new Date(assignment.estimatedDeparture).toLocaleString('pt-PT')}</span>
                          </div>
                        )}
                        {assignment.estimatedArrival && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>Chegada: {new Date(assignment.estimatedArrival).toLocaleString('pt-PT')}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusActions(assignment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Atribuição Veículo-Envio</DialogTitle>
            <DialogDescription>
              Atribua um veículo a um envio específico com motorista e horários estimados.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Veículo *</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => setFormData({...formData, vehicleId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shipmentId">Envio *</Label>
                <Select value={formData.shipmentId} onValueChange={(value) => setFormData({...formData, shipmentId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um envio" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableShipments.map((shipment: any) => (
                      <SelectItem key={shipment.id} value={shipment.id}>
                        {shipment.trackingNumber} - {shipment.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="driverId">Motorista</Label>
                <Select value={formData.driverId} onValueChange={(value) => setFormData({...formData, driverId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver: any) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDeparture">Saída Estimada</Label>
                <Input
                  id="estimatedDeparture"
                  type="datetime-local"
                  value={formData.estimatedDeparture}
                  onChange={(e) => setFormData({...formData, estimatedDeparture: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedArrival">Chegada Estimada</Label>
                <Input
                  id="estimatedArrival"
                  type="datetime-local"
                  value={formData.estimatedArrival}
                  onChange={(e) => setFormData({...formData, estimatedArrival: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!formData.vehicleId || !formData.shipmentId}>
                Criar Atribuição
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}