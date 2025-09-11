import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Package, Calendar, DollarSign, User as UserIcon, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { type Order, type Supplier, type Customer } from "@shared/schema";
import { useOrders, useCreateOrder, useUpdateOrder, useDeleteOrder } from "@/hooks/api/use-orders";
import { useSuppliers } from "@/hooks/api/use-suppliers";
import { CustomerCombobox } from "@/components/ui/customer-combobox";
import { AddCustomerModal } from "@/components/ui/add-customer-modal";
import { OrderFilters, type OrderFilters as OrderFiltersType } from "@/components/orders/order-filters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";

type OrderFormData = {
  orderNumber?: string;
  type: "sale" | "purchase";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  supplierId?: string;
  totalAmount: string;
  notes?: string;
  userId?: string;
  items?: {
    productId: string;
    quantity: number;
    unitPrice: string;
  }[];
};

function OrderDialog({ order, trigger }: { order?: Order; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<Customer | null>(null);
  const { data: suppliersResponse } = useSuppliers();
  const suppliers = suppliersResponse?.data || [];
  const { user } = useAuth();

  const form = useForm<OrderFormData>({
    defaultValues: {
      orderNumber: "",
      type: "sale",
      status: "pending",
      customerId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      supplierId: "",
      totalAmount: "0",
      notes: "",
      userId: user?.id || "",
    },
  });

  const handleCustomerSelect = (customer: Customer | null) => {
    if (!customer) return;
    setSelectedCustomer(customer);
    form.setValue("customerId", customer.id);
    form.setValue("customerName", customer.name);
    form.setValue("customerEmail", customer.email || "");
    form.setValue("customerPhone", customer.phone || "");
    form.setValue("customerAddress", customer.address || "");
  };

  const handleCustomerCreated = (customer: Customer) => {
    setNewlyCreatedCustomer(customer);
    handleCustomerSelect(customer);
    setShowAddCustomerModal(false);
  };

  useEffect(() => {
    if (order) {
      form.reset({
        orderNumber: order.orderNumber || "",
        type: (order.type as any) || "sale",
        status: (order.status as any) || "pending",
        customerId: (order as any).customerId || "",
        customerName: order.customerName || "",
        customerEmail: order.customerEmail || "",
        customerPhone: order.customerPhone || "",
        customerAddress: order.customerAddress || "",
        supplierId: order.supplierId || "",
        totalAmount: order.totalAmount || "0",
        notes: order.notes || "",
        userId: (order as any).userId || user?.id || "",
      });
      if ((order as any).customerId) {
        setSelectedCustomer(null);
      }
    } else {
      form.reset({
        orderNumber: "",
        type: "sale",
        status: "pending",
        customerId: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        supplierId: "",
        totalAmount: "0",
        notes: "",
        userId: user?.id || "",
      });
      setSelectedCustomer(null);
    }
  }, [order, form, user?.id]);

  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();

  const handleSubmit = (data: OrderFormData) => {
    const formattedData = {
      ...data,
      supplierId: data.supplierId === "none" ? undefined : data.supplierId,
      customerId: data.customerId || "",
      userId: data.userId || user?.id || "",
      items: data.items || [],
    };
    
    if (order) {
      updateMutation.mutate({ id: order.id, data: formattedData }, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        }
      });
    } else {
      createMutation.mutate(formattedData, {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        }
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const onSubmit = handleSubmit;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-order">
        <DialogHeader>
          <DialogTitle>
            {order ? "Editar Encomenda" : "Nova Encomenda"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Encomenda</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Será gerado automaticamente se vazio"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-order-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-order-type">
                            <SelectValue placeholder="Tipo de encomenda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sale">Venda</SelectItem>
                          <SelectItem value="purchase">Compra</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Estado e Valor</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-order-status">
                            <SelectValue placeholder="Estado da encomenda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="shipped">Enviado</SelectItem>
                          <SelectItem value="delivered">Entregue</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (Kz)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          placeholder="0,00" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-order-total"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Cliente</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-xs w-full sm:w-auto"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo Cliente
                </Button>
              </div>
              
              <CustomerCombobox
                value={form.watch("customerId")}
                onValueChange={(value) => form.setValue("customerId", value)}
                onCustomerSelect={handleCustomerSelect}
                onAddNewCustomer={() => setShowAddCustomerModal(true)}
                placeholder="Pesquisar cliente..."
                newlyCreatedCustomer={newlyCreatedCustomer}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome do cliente"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-customer-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="email@exemplo.com"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-customer-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+244 xxx xxx xxx"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-customer-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço de Entrega</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Endereço completo para entrega"
                        className="resize-none min-h-[80px]"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-customer-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informações Adicionais</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-supplier">
                            <SelectValue placeholder="Selecione o fornecedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum fornecedor</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          value={user?.username || "Usuário atual"}
                          disabled
                          className="bg-gray-50 dark:bg-gray-800"
                          data-testid="input-user-id"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre a encomenda"
                        className="resize-none min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-order-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
                className="w-full sm:w-auto order-2 sm:order-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !user?.id}
                data-testid="button-save-order"
                className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Criando Encomenda..." : order ? "Atualizar Encomenda" : "Criar Encomenda"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      
      <AddCustomerModal
          open={showAddCustomerModal}
          onOpenChange={setShowAddCustomerModal}
          onCustomerCreated={(customer: any) => customer && handleCustomerCreated(customer)}
        />
    </Dialog>
  );
}

function OrderCard({ order }: { order: Order & { supplier?: Supplier | null } }) {
  const deleteMutation = useDeleteOrder();

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja eliminar esta encomenda?")) {
      deleteMutation.mutate(order.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "processing":
        return "Em Processamento";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregue";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatCurrency = (value: string | number | null) => {
     if (!value) return 'Kz 0,00';
     const numValue = typeof value === 'string' ? parseFloat(value) : value;
     return new Intl.NumberFormat('pt-AO', {
       style: 'currency',
       currency: 'AOA',
       minimumFractionDigits: 2
     }).format(numValue).replace('AOA', 'Kz');
   };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="font-semibold text-lg">
                {order.orderNumber || `#${order.id.slice(0, 8)}`}
              </h3>
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{order.customerName || "Cliente não informado"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>{order.type === "sale" ? "Venda" : "Compra"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                 <DollarSign className="h-4 w-4" />
                 <span className="font-medium">{formatCurrency(order.totalAmount || "0")}</span>
               </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(order.createdAt || "").toLocaleDateString('pt-AO')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <OrderDialog
              order={order}
              trigger={
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Orders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filters, setFilters] = useState<OrderFiltersType>({});
  const isMobile = useIsMobile();
  
  const queryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: filters.search || undefined,
    status: filters.status || undefined,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    customerId: filters.customerId || undefined,
    orderType: filters.orderType || undefined,
    minValue: filters.minValue,
    maxValue: filters.maxValue,
  };
  
  const { data: ordersResponse, isLoading } = useOrders(queryParams);
  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatCurrency = (value: string | number | null) => {
     if (!value) return 'Kz 0,00';
     const numValue = typeof value === 'string' ? parseFloat(value) : value;
     return new Intl.NumberFormat('pt-AO', {
       style: 'currency',
       currency: 'AOA',
       minimumFractionDigits: 2
     }).format(numValue).replace('AOA', 'Kz');
   };

  return (
    <div className="space-y-6">
      <Header title="Gestão de Encomendas" breadcrumbs={["Gestão de Encomendas"]} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <OrderFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            className="flex-1"
          />
          
          <OrderDialog
            trigger={
              <Button className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Nova Encomenda
              </Button>
            }
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma encomenda encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                {Object.keys(filters).length > 0 
                  ? "Não foram encontradas encomendas com os filtros aplicados."
                  : "Comece criando a sua primeira encomenda."
                }
              </p>
              <OrderDialog
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Encomenda
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>

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
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} encomendas)
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
                  disabled={currentPage === pagination.totalPages}
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}