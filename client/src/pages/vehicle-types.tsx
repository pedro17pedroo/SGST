import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { fleetService } from '@/services/api.service';
import { apiRequest } from '@/lib/queryClient';

interface VehicleType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VehicleTypeFormData {
  name: string;
  description: string;
  isActive: boolean;
}

const initialFormData: VehicleTypeFormData = {
  name: '',
  description: '',
  isActive: true
};

export default function VehicleTypesPage() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<VehicleType | null>(null);
  const [formData, setFormData] = useState<VehicleTypeFormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar tipos de veículo
  const fetchVehicleTypes = async () => {
    try {
      setLoading(true);
      const response = await fleetService.getVehicleTypes();
      if (response.success) {
        setVehicleTypes(response.data);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar tipos de veículo',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar tipos de veículo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar tipos de veículo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  // Filtrar tipos de veículo
  const filteredTypes = vehicleTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingType) {
        // Atualizar tipo existente
        const response = await fetch(`/api/vehicle-types/${editingType.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          toast({
            title: 'Sucesso',
            description: 'Tipo de veículo atualizado com sucesso'
          });
        } else {
          throw new Error('Erro ao atualizar tipo de veículo');
        }
      } else {
        // Criar novo tipo
        const response = await apiRequest('POST', '/api/vehicle-types', formData);
        
        if (response.ok) {
          toast({
            title: 'Sucesso',
            description: 'Tipo de veículo criado com sucesso'
          });
        } else {
          throw new Error('Erro ao criar tipo de veículo');
        }
      }
      
      setIsDialogOpen(false);
      setEditingType(null);
      setFormData(initialFormData);
      fetchVehicleTypes();
    } catch (error) {
      console.error('Erro ao salvar tipo de veículo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar tipo de veículo',
        variant: 'destructive'
      });
    }
  };

  // Eliminar tipo
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este tipo de veículo?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/vehicle-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Tipo de veículo eliminado com sucesso'
        });
        fetchVehicleTypes();
      } else {
        throw new Error('Erro ao eliminar tipo de veículo');
      }
    } catch (error) {
      console.error('Erro ao eliminar tipo de veículo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao eliminar tipo de veículo',
        variant: 'destructive'
      });
    }
  };

  // Abrir diálogo para edição
  const handleEdit = (type: VehicleType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      isActive: type.isActive
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo para criação
  const handleCreate = () => {
    setEditingType(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Veículo</h1>
          <p className="text-muted-foreground">
            Gerir os tipos de veículo disponíveis no sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar tipos de veículo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tipos */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Veículo</CardTitle>
          <CardDescription>
            {filteredTypes.length} tipo(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando tipos de veículo...</p>
            </div>
          ) : filteredTypes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum tipo de veículo encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell>{type.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={type.isActive ? 'default' : 'secondary'}>
                        {type.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(type.createdAt).toLocaleDateString('pt-AO')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(type.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Diálogo de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Editar Tipo de Veículo' : 'Novo Tipo de Veículo'}
            </DialogTitle>
            <DialogDescription>
              {editingType 
                ? 'Atualize as informações do tipo de veículo'
                : 'Adicione um novo tipo de veículo ao sistema'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Camião, Carrinha, Carro"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição do tipo de veículo"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingType ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}