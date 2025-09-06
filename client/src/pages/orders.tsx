import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Package, Calendar, DollarSign, User as UserIcon, Building } from "lucide-react";
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

type OrderFormData = {
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
  
  const form = useForm<OrderFormData>({
    defaultValues: {
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
    },
  });

  // Atualizar formulário quando cliente é selecionado
  useEffect(() => {
    if (selectedCustomer) {
      form.setValue("customerId", selectedCustomer.id);
      form.setValue("customerName", selectedCustomer.name);
      form.setValue("customerEmail", selectedCustomer.email || "");
      form.setValue("customerPhone", selectedCustomer.phone || selectedCustomer.mobile || "");
      
      // Construir endereço completo
      const addressParts = [
        selectedCustomer.address,
        selectedCustomer.city,
        selectedCustomer.province,
        selectedCustomer.postalCode,
        selectedCustomer.country
      ].filter(Boolean);
      
      form.setValue("customerAddress", addressParts.join(", "));
    }
  }, [selectedCustomer, form]);

  // Função para lidar com a criação de novo cliente
  const handleCustomerCreated = (customer: Customer) => {
    setNewlyCreatedCustomer(customer);
    setShowAddCustomerModal(false);
  };

  // Função para lidar com a seleção de cliente (incluindo recém-criado)
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    // Limpar referência do cliente recém-criado após seleção
    if (newlyCreatedCustomer && customer?.id === newlyCreatedCustomer.id) {
      setNewlyCreatedCustomer(null);
    }
  };

  // Reset form values when order changes
  useEffect(() => {
    if (order) {
      form.reset({
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
      });
      // Se há um customerId, limpar o cliente selecionado para evitar conflitos
      if ((order as any).customerId) {
        setSelectedCustomer(null);
      }
    } else {
      form.reset({
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
      });
      setSelectedCustomer(null);
    }
  }, [order, form]);

  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();

  const handleSubmit = (data: OrderFormData) => {
    const formattedData = {
      ...data,
      supplierId: data.supplierId === "none" ? undefined : data.supplierId,
      customerId: data.customerId || "",
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-order">
        <DialogHeader>
          <DialogTitle>
            {order ? "Editar Encomenda" : "Nova Encomenda"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              
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
                        <SelectItem value="processing">Em Processamento</SelectItem>
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
                    <FormLabel>Valor Total (AOA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0.00" 
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

            {/* Seleção de Cliente */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <FormLabel className="text-base font-medium">Cliente</FormLabel>
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
              
              {/* Campos ocultos para manter compatibilidade */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <Input type="hidden" {...field} value={field.value || ""} />
                )}
              />
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <Input type="hidden" {...field} value={field.value || ""} />
                )}
              />
              
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <Input type="hidden" {...field} value={field.value || ""} />
                )}
              />
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <Input type="hidden" {...field} value={field.value || ""} />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço do Cliente</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo para entrega"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-customer-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre a encomenda"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-order-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                data-testid="button-save-order"
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      
      {/* Modal para adicionar novo cliente */}
      <AddCustomerModal
        open={showAddCustomerModal}
        onOpenChange={setShowAddCustomerModal}
        onCustomerCreated={(customer: any) => handleCustomerCreated(customer)}
      />
    </Dialog>
  );
}

function OrderCard({ order }: { order: Order & { supplier?: Supplier | null } }) {
  const deleteMutation = useDeleteOrder();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "Pendente",
      processing: "Processamento",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeIcon = (type: string) => {
    return type === "sale" ? <DollarSign className="h-4 w-4" /> : <Package className="h-4 w-4" />;
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow" data-testid={`card-order-${order.id}`}>
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              {getTypeIcon(order.type)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg truncate" data-testid={`text-order-number-${order.id}`}>
                {order.orderNumber}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {order.type === "sale" ? "Venda" : "Compra"}
              </p>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <OrderDialog
              order={order}
              trigger={
                <Button variant="ghost" size="sm" data-testid={`button-edit-${order.id}`} className="h-8 w-8 p-0">
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate(order.id)}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${order.id}`}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge className={`${getStatusColor(order.status)} text-xs`}>
              {getStatusLabel(order.status)}
            </Badge>
            <span className="text-sm sm:text-lg font-semibold text-primary truncate" data-testid={`text-order-amount-${order.id}`}>
              {Number(order.totalAmount || 0).toLocaleString()} AOA
            </span>
          </div>
          
          {order.customerName && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate" data-testid={`text-customer-${order.id}`}>
                {order.customerName}
              </span>
            </div>
          )}

          {order.supplier && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Building className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate" data-testid={`text-supplier-${order.id}`}>
                {order.supplier.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {new Date(order.createdAt || "").toLocaleDateString('pt-AO')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Orders() {
  const [search, setSearch] = useState("");
  
  const { data: ordersResponse, isLoading } = useOrders();
  const orders = ordersResponse?.data || [];

  const filteredOrders = orders.filter((order: Order) =>
    (order.orderNumber && order.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
    (order.customerName && order.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Encomendas" breadcrumbs={["Gestão de Encomendas"]} />
      
      <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerir encomendas de vendas e compras
          </p>
          <OrderDialog
            trigger={
              <Button data-testid="button-add-order" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nova Encomenda</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            placeholder="Pesquisar encomendas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:max-w-sm"
            data-testid="input-search-orders"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-48">
                <CardHeader className="animate-pulse p-4 sm:p-6">
                  <div className="h-5 sm:h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="animate-pulse p-4 sm:p-6">
                  <div className="space-y-2">
                    <div className="h-3 sm:h-4 bg-muted rounded"></div>
                    <div className="h-3 sm:h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredOrders.map((order: Order & { supplier?: Supplier | null }) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full text-center py-8 sm:py-12">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma encomenda encontrada</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 px-4">
                  {search ? "Tente ajustar os termos de pesquisa." : "Comece criando a primeira encomenda."}
                </p>
                {!search && (
                  <OrderDialog
                    trigger={
                      <Button data-testid="button-add-first-order" className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Primeira Encomenda
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}