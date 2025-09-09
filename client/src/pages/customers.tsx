import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Power, PowerOff, UserCheck, Phone, Mail, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile.tsx';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Header } from '@/components/layout/header';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/api/use-customers';

// Tipo para dados do formulário
interface CustomerFormData {
  customerNumber?: string;
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
  customerType: 'distribuidor' | 'restaurante' | 'bar' | 'hotel' | 'supermercado' | 'individual' | 'company';
  creditLimit: string;
  paymentTerms: string;
  discount: string;
  notes?: string;
}

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
  customerType: 'distribuidor' | 'restaurante' | 'bar' | 'hotel' | 'supermercado' | 'individual' | 'company';
  creditLimit: string;
  paymentTerms: string;
  discount: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Buscar clientes
  const { data: customersResponse, isLoading } = useCustomers();
  const customers = customersResponse?.data || [];
  
  // Calcular estatísticas baseadas nos filtros aplicados
  const customerStats = useMemo(() => {
    const filtered = statusFilter === 'all' ? customers : customers.filter(c => 
      statusFilter === 'active' ? c.isActive : !c.isActive
    );
    
    return {
      total: filtered.length,
      active: filtered.filter(c => c.isActive).length,
      individual: filtered.filter(c => c.customerType === 'individual').length,
      company: filtered.filter(c => ['company', 'distribuidor', 'restaurante', 'bar', 'hotel', 'supermercado'].includes(c.customerType)).length,
    };
  }, [customers, statusFilter]);

   // Resetar página quando filtros mudarem
   useEffect(() => {
     setCurrentPage(1);
   }, [searchTerm, statusFilter, typeFilter]);

   // Formulário
  const form = useForm<CustomerFormData>({
    defaultValues: {
      customerNumber: '',
      name: '',
      email: '',
      phone: '',
      mobile: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Angola',
      taxNumber: '',
      customerType: 'individual',
      creditLimit: '0',
      paymentTerms: '30 dias',
      discount: '0',
      notes: '',
    },
  });

  // Mutation para criar cliente
  const createCustomerMutation = useCreateCustomer();
  
  const handleCreateCustomer = async (data: CustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
      form.reset();
      toast({ title: 'Cliente criado com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao criar cliente', variant: 'destructive' });
    }
  };

  // Mutation para atualizar cliente
  const updateCustomerMutation = useUpdateCustomer();
  
  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!editingCustomer?.id) return;
    
    try {
      await updateCustomerMutation.mutateAsync({ id: editingCustomer.id, data });
      setEditingCustomer(null);
      form.reset();
      toast({ title: 'Cliente atualizado com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar cliente', variant: 'destructive' });
    }
  };

  // Mutation para deletar cliente
  const deleteCustomerMutation = useDeleteCustomer();
  
  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomerMutation.mutateAsync(id);
      toast({ title: 'Cliente removido com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao remover cliente', variant: 'destructive' });
    }
  };

  // Filtrar e paginar clientes
  const { filteredCustomers, totalPages, paginatedCustomers } = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && customer.isActive) ||
        (statusFilter === 'inactive' && !customer.isActive);
      
      const matchesType = typeFilter === 'all' || customer.customerType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      filteredCustomers: filtered,
      totalPages,
      paginatedCustomers: paginated
    };
  }, [customers, searchTerm, statusFilter, typeFilter, currentPage, itemsPerPage]);

  // Submeter formulário
  const onSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      handleUpdateCustomer(data);
    } else {
      handleCreateCustomer(data);
    }
  };

  // Editar cliente
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    form.reset({
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
  };

  // Desativar cliente
  const handleDeactivate = async (customerId: string) => {
    const result = await Swal.fire({
      title: 'Desativar Cliente',
      text: 'Tem certeza que deseja desativar este cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, desativar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      handleDeleteCustomer(customerId);
    }
  };

  // Ativar cliente
  const handleActivate = async (customerId: string) => {
    const result = await Swal.fire({
      title: 'Ativar Cliente',
      text: 'Tem certeza que deseja ativar este cliente?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      handleDeleteCustomer(customerId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Clientes" breadcrumbs={['Clientes']} />
      
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            <div className="relative flex-1 sm:flex-none">
              <Input
                placeholder="Pesquisar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
                data-testid="customer-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="individual">Pessoa Física</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="distribuidor">Distribuidor</SelectItem>
                  <SelectItem value="restaurante">Restaurante</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="supermercado">Supermercado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <PermissionGuard module="customers" action="create">
            <Dialog open={isCreateDialogOpen || !!editingCustomer} onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                setEditingCustomer(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="btn-add-customer" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {isMobile ? 'Novo' : 'Novo Cliente'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Criar Novo Cliente'}</DialogTitle>
                  <DialogDescription>
                    {editingCustomer ? 'Edite as informações do cliente.' : 'Preencha as informações do novo cliente.'}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customerType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Província</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código Postal</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                      <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingCustomer(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="w-full sm:w-auto" disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}>
                        {createCustomerMutation.isPending || updateCustomerMutation.isPending
                          ? 'Salvando...'
                          : editingCustomer
                          ? 'Atualizar'
                          : 'Criar'}
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
          <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pessoas Físicas</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.individual}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerStats.company}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Lista de todos os clientes registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : isMobile ? (
              // Versão Mobile - Cards
              <div className="space-y-4">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => (
                    <Card key={customer.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{customer.name}</h3>
                            <p className="text-xs text-muted-foreground">{customer.customerNumber}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={customer.customerType === 'company' ? 'default' : 'secondary'} className="text-xs">
                              {customer.customerType === 'company' ? 'Empresa' : 'PF'}
                            </Badge>
                            <Badge variant={customer.isActive ? 'default' : 'secondary'} className="text-xs">
                              {customer.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                        
                        {(customer.email || customer.phone) && (
                          <div className="space-y-1">
                            {customer.email && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">
                            {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <div className="flex items-center gap-1">
                            <PermissionGuard module="customers" action="update">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(customer)}
                                data-testid={`btn-edit-customer-${customer.id}`}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard module="customers" action="update">
                              {customer.isActive ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeactivate(customer.id)}
                                  data-testid={`btn-deactivate-customer-${customer.id}`}
                                  title="Desativar cliente"
                                  className="h-8 w-8 p-0"
                                >
                                  <PowerOff className="w-3 h-3 text-red-500" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleActivate(customer.id)}
                                  data-testid={`btn-activate-customer-${customer.id}`}
                                  title="Ativar cliente"
                                  className="h-8 w-8 p-0"
                                >
                                  <Power className="w-3 h-3 text-green-500" />
                                </Button>
                              )}
                            </PermissionGuard>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                  </div>
                )}
                
                {/* Paginação Mobile */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Versão Desktop - Tabela
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium">Contato</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Data de Criação</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.length > 0 ? (
                      paginatedCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.customerNumber}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={customer.customerType === 'company' ? 'default' : 'secondary'}>
                              {customer.customerType === 'company' ? 'Empresa' : 'Pessoa Física'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
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
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={customer.isActive ? 'default' : 'secondary'}>
                              {customer.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <PermissionGuard module="customers" action="update">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(customer)}
                                  data-testid={`btn-edit-customer-${customer.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </PermissionGuard>
                              <PermissionGuard module="customers" action="update">
                                {customer.isActive ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeactivate(customer.id)}
                                    data-testid={`btn-deactivate-customer-${customer.id}`}
                                    title="Desativar cliente"
                                  >
                                    <PowerOff className="w-4 h-4 text-red-500" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleActivate(customer.id)}
                                    data-testid={`btn-activate-customer-${customer.id}`}
                                    title="Ativar cliente"
                                  >
                                    <Power className="w-4 h-4 text-green-500" />
                                  </Button>
                                )}
                              </PermissionGuard>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* Paginação Desktop */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} clientes
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="h-8 w-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}