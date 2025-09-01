import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, UserCheck, UserX, Phone, Mail, MapPin, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/auth/permission-guard';

// Schema de validação
const customerSchema = z.object({
  customerNumber: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Angola'),
  taxNumber: z.string().optional(),
  customerType: z.enum(['individual', 'company']).default('individual'),
  creditLimit: z.string().default('0'),
  paymentTerms: z.enum(['cash', 'credit_30', 'credit_60', 'credit_90']).default('cash'),
  discount: z.string().default('0'),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface Customer {
  id: string;
  customerNumber: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  taxNumber?: string;
  customerType: 'individual' | 'company';
  creditLimit: string;
  paymentTerms: 'cash' | 'credit_30' | 'credit_60' | 'credit_90';
  discount: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['/api/customers'],
    enabled: true,
  });

  const { data: customerStats } = useQuery({
    queryKey: ['/api/customers/stats'],
    enabled: true,
  });

  // Mutations
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar cliente');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/stats'] });
      setIsCreateDialogOpen(false);
      toast({ description: 'Cliente criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        variant: 'destructive',
        description: error.message || 'Erro ao criar cliente'
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CustomerFormData> }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao atualizar cliente');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/stats'] });
      setIsEditDialogOpen(false);
      setSelectedCustomer(null);
      toast({ description: 'Cliente atualizado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        variant: 'destructive',
        description: error.message || 'Erro ao atualizar cliente'
      });
    },
  });

  const toggleCustomerStatusMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'activate' | 'deactivate' }) => {
      const response = await fetch(`/api/customers/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Erro ao ${action === 'activate' ? 'ativar' : 'desativar'} cliente`);
      return response.json();
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/stats'] });
      toast({ 
        description: `Cliente ${action === 'activate' ? 'ativado' : 'desativado'} com sucesso!` 
      });
    },
    onError: (error: any) => {
      toast({ 
        variant: 'destructive',
        description: error.message || 'Erro ao alterar status do cliente'
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao eliminar cliente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/stats'] });
      toast({ description: 'Cliente eliminado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ 
        variant: 'destructive',
        description: error.message || 'Erro ao eliminar cliente'
      });
    },
  });

  // Forms
  const createForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerType: 'individual',
      country: 'Angola',
      creditLimit: '0',
      paymentTerms: 'cash',
      discount: '0',
    },
  });

  const editForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleCreateCustomer = (data: CustomerFormData) => {
    createCustomerMutation.mutate(data);
  };

  const handleEditCustomer = (data: CustomerFormData) => {
    if (!selectedCustomer) return;
    updateCustomerMutation.mutate({ id: selectedCustomer.id, data });
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    editForm.reset({
      customerNumber: customer.customerNumber,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      mobile: customer.mobile || '',
      address: customer.address || '',
      city: customer.city || '',
      province: customer.province || '',
      postalCode: customer.postalCode || '',
      country: customer.country,
      taxNumber: customer.taxNumber || '',
      customerType: customer.customerType,
      creditLimit: customer.creditLimit,
      paymentTerms: customer.paymentTerms,
      discount: customer.discount,
      notes: customer.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleToggleStatus = (customer: Customer) => {
    const action = customer.isActive ? 'deactivate' : 'activate';
    toggleCustomerStatusMutation.mutate({ id: customer.id, action });
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este cliente?')) {
      deleteCustomerMutation.mutate(id);
    }
  };

  const formatPaymentTerms = (terms: string) => {
    const mapping = {
      cash: 'À vista',
      credit_30: '30 dias',
      credit_60: '60 dias',
      credit_90: '90 dias',
    };
    return mapping[terms as keyof typeof mapping] || terms;
  };

  const formatCustomerType = (type: string) => {
    return type === 'individual' ? 'Pessoa Física' : 'Empresa';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="page-title">
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground">
            Gerir informações e histórico de clientes
          </p>
        </div>
        <PermissionGuard module="customers" action="create">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="btn-add-customer">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha as informações do cliente
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateCustomer)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do cliente" {...field} data-testid="input-customer-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="customerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-customer-type">
                                <SelectValue placeholder="Selecionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="individual">Pessoa Física</SelectItem>
                              <SelectItem value="company">Empresa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="cliente@exemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="+244 xxx xxx xxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={createForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Luanda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Província</FormLabel>
                          <FormControl>
                            <Input placeholder="Luanda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="taxNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIF</FormLabel>
                          <FormControl>
                            <Input placeholder="000000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Termos de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar termos" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">À vista</SelectItem>
                              <SelectItem value="credit_30">30 dias</SelectItem>
                              <SelectItem value="credit_60">60 dias</SelectItem>
                              <SelectItem value="credit_90">90 dias</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="creditLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limite de Crédito (AOA)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Observações adicionais" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createCustomerMutation.isPending} data-testid="btn-save-customer">
                      {createCustomerMutation.isPending ? 'Criando...' : 'Criar Cliente'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      {/* Stats Cards */}
      {customerStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{customerStats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pessoas Físicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.individual}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customerStats.company}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Lista de todos os clientes registados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, número, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                data-testid="input-search-customers"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Termos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Carregando clientes...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum cliente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer: Customer) => (
                    <TableRow key={customer.id} data-testid={`customer-row-${customer.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            #{customer.customerNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="w-3 h-3 mr-1" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.city && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {customer.city}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatCustomerType(customer.customerType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatPaymentTerms(customer.paymentTerms)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                          {customer.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                            data-testid={`btn-view-${customer.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <PermissionGuard module="customers" action="update">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(customer)}
                              data-testid={`btn-edit-${customer.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard module="customers" action="update">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(customer)}
                              data-testid={`btn-toggle-${customer.id}`}
                            >
                              {customer.isActive ? (
                                <UserX className="w-4 h-4 text-orange-500" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-green-500" />
                              )}
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard module="customers" action="delete">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              data-testid={`btn-delete-${customer.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}