import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Power, PowerOff, UserCheck, Phone, Mail } from 'lucide-react';
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
import { PermissionGuard } from '@/components/auth/permission-guard';
import { Header } from '@/components/layout/header';

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
  customerType: 'individual' | 'company';
  creditLimit: string;
  paymentTerms: 'cash' | 'credit_30' | 'credit_60' | 'credit_90';
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar clientes
  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    enabled: true,
  });

  // Buscar estatísticas
  const { data: customerStats } = useQuery<{
    total: number;
    active: number;
    individual: number;
    company: number;
  }>({
    queryKey: ['/api/customers/stats'],
    enabled: true,
  });

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
      paymentTerms: 'cash',
      discount: '0',
      notes: '',
    },
  });

  // Mutation para criar cliente
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
      form.reset();
      toast({ title: 'Cliente criado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar cliente', variant: 'destructive' });
    },
  });

  // Mutation para atualizar cliente
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerFormData }) => {
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
      setEditingCustomer(null);
      form.reset();
      toast({ title: 'Cliente atualizado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar cliente', variant: 'destructive' });
    },
  });

  // Mutation para desativar cliente
  const deactivateCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/customers/${id}/deactivate`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Erro ao desativar cliente');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/stats'] });
      toast({ title: 'Cliente desativado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao desativar cliente', variant: 'destructive' });
    },
  });

  // Mutation para ativar cliente
  const activateCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/customers/${id}/activate`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Erro ao ativar cliente');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers/stats'] });
      toast({ title: 'Cliente ativado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao ativar cliente', variant: 'destructive' });
    },
  });

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submeter formulário
  const onSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createCustomerMutation.mutate(data);
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
      deactivateCustomerMutation.mutate(customerId);
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
      activateCustomerMutation.mutate(customerId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Clientes" breadcrumbs={['Clientes']} />
      
      <div className="container mx-auto p-6 space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Pesquisar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
                data-testid="customer-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="btn-add-customer">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
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
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-3 gap-4">
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

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateDialogOpen(false);
                        setEditingCustomer(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}>
                        {editingCustomer ? 'Atualizar' : 'Criar'}
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
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-4 animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-muted rounded"></div>
                        <div className="w-8 h-8 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
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
                          {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}