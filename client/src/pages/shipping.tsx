import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Truck, Package, Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Shipment, type Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { VehicleCombobox } from "@/components/ui/vehicle-combobox";
import { LoadingState, LoadingComponents, useLoadingStates } from "@/components/ui/loading-state";
import { z } from "zod";

// Schema personalizado para o formulário de envios
const shipmentFormSchema = z.object({
  shipmentNumber: z.string().optional(),
  orderId: z.string().min(1, "Pedido é obrigatório"),
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  shippingAddress: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentFormSchema>;

function ShipmentDialog({ shipment, trigger }: { shipment?: Shipment; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  // Removido: query de veículos agora é feita pelo VehicleCombobox
  
  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      shipmentNumber: `SHP-${Date.now()}`,
      orderId: "",
      vehicleId: "",
      status: "preparing",
      carrier: "",
      trackingNumber: "",
      shippingAddress: "",
      estimatedDelivery: "",
    },
  });

  // Reset form values when shipment changes
  useEffect(() => {
    if (shipment) {
      form.reset({
        shipmentNumber: shipment.shipmentNumber || `SHP-${Date.now()}`,
        orderId: shipment.orderId || "",
        vehicleId: (shipment as any).vehicleId || "",
        status: (shipment.status as any) || "preparing",
        carrier: shipment.carrier || "",
        trackingNumber: shipment.trackingNumber || "",
        shippingAddress: shipment.shippingAddress || "",
        estimatedDelivery: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toISOString().split('T')[0] : "",
      });
    } else {
      form.reset({
        shipmentNumber: `SHP-${Date.now()}`,
        orderId: "",
        vehicleId: "",
        status: "preparing",
        carrier: "",
        trackingNumber: "",
        shippingAddress: "",
        estimatedDelivery: "",
      });
    }
  }, [shipment, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ShipmentFormData) => {
      const response = await apiRequest("POST", "/api/shipping", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Envio criado",
        description: "O envio foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o envio.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ShipmentFormData) => {
      const response = await apiRequest("PUT", `/api/shipping/${shipment?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping"] });
      setOpen(false);
      form.reset();
      toast({
        title: "Envio atualizado",
        description: "O envio foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o envio.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShipmentFormData) => {
    if (shipment) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-shipment">
        <DialogHeader>
          <DialogTitle>
            {shipment ? "Editar Envio" : "Novo Envio"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shipmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Envio</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="SHP-001" 
                        {...field}
                        value={field.value as string}
                        data-testid="input-shipment-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                      <FormControl>
                        <SelectTrigger data-testid="select-shipment-status">
                          <SelectValue placeholder="Estado do envio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="preparing">Preparando</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="in_transit">Em Trânsito</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Encomenda</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger data-testid="select-order">
                        <SelectValue placeholder="Selecione a encomenda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders && orders.length > 0 ? orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNumber} - {order.customerName}
                        </SelectItem>
                      )) : (
                        <SelectItem value="" disabled>
                          Nenhuma encomenda disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veículo</FormLabel>
                  <FormControl>
                    <VehicleCombobox
                      value={(field.value as string) || ""}
                      onValueChange={field.onChange}
                      placeholder="Selecione o veículo"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="carrier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transportadora</FormLabel>
                    <FormControl>
                      <Input 
                          placeholder="Nome da transportadora" 
                          {...field}
                          value={(field.value as string) || ""}
                          data-testid="input-carrier"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Rastreamento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ABC123456789" 
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-tracking-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shippingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço de Entrega</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo para entrega"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-shipping-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedDelivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Prevista de Entrega</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      {...field} 
                      value={field.value || ""}
                      data-testid="input-estimated-delivery"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-shipment"
              >
                {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ShipmentRow({ shipment }: { shipment: Shipment & { order?: Order | null } }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "in_transit": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      preparing: "Preparando",
      shipped: "Enviado",
      in_transit: "Em Trânsito",
      delivered: "Entregue",
      cancelled: "Cancelado"
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <TableRow data-testid={`row-shipment-${shipment.id}`}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Truck className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-medium" data-testid={`text-shipment-number-${shipment.id}`}>
              {shipment.shipmentNumber}
            </div>
            <div className="text-sm text-muted-foreground">
              {shipment.carrier || "Sem transportadora"}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(shipment.status)}>
          {getStatusLabel(shipment.status)}
        </Badge>
      </TableCell>
      <TableCell>
        {shipment.order ? (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span data-testid={`text-order-${shipment.id}`}>
              {shipment.order.orderNumber}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {shipment.trackingNumber ? (
          <span className="font-mono text-sm" data-testid={`text-tracking-${shipment.id}`}>
            {shipment.trackingNumber}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {shipment.shippingAddress ? (
          <div className="max-w-xs truncate" title={shipment.shippingAddress}>
            {shipment.shippingAddress}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {shipment.estimatedDelivery ? (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(shipment.estimatedDelivery).toLocaleDateString('pt-AO')}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <ShipmentDialog
          shipment={shipment}
          trigger={
            <Button variant="ghost" size="sm" data-testid={`button-edit-${shipment.id}`}>
              <Edit className="h-4 w-4" />
            </Button>
          }
        />
      </TableCell>
    </TableRow>
  );
}

export default function Shipping() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const { data: shipments = [], isLoading, error } = useQuery<Array<Shipment & { order?: Order | null }>>({    queryKey: ["/api/shipping"],
  });

  const filteredShipments = shipments.filter((shipment: Shipment) =>
    shipment.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
    (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
    (shipment.carrier && shipment.carrier.toLowerCase().includes(search.toLowerCase()))
  );

  // Paginação
  const totalItems = filteredShipments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, endIndex);

  const loadingStates = useLoadingStates(paginatedShipments, isLoading, error);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Envios" breadcrumbs={["Gestão de Envios"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir envios e rastreamento de encomendas
          </p>
        <ShipmentDialog
          trigger={
            <Button data-testid="button-add-shipment">
              <Plus className="mr-2 h-4 w-4" />
              Novo Envio
            </Button>
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar envios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          data-testid="input-search-shipments"
        />
      </div>

      <LoadingState
        isLoading={loadingStates.isLoading}
        error={loadingStates.error}
        isEmpty={loadingStates.isEmpty}
        loadingComponent={
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Envio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Encomenda</TableHead>
                  <TableHead>Rastreamento</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Entrega Prevista</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <LoadingComponents.Table rows={itemsPerPage} columns={7} />
              </TableBody>
            </Table>
          </div>
        }
        emptyComponent={
          <Card>
            <CardContent className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum envio encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {search ? "Tente ajustar os termos de pesquisa." : "Comece criando o primeiro envio."}
              </p>
              {!search && (
                <ShipmentDialog
                  trigger={
                    <Button data-testid="button-add-first-shipment">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Envio
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        }
      >
        {totalItems > 0 ? (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Envio</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Encomenda</TableHead>
                    <TableHead>Rastreamento</TableHead>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Entrega Prevista</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedShipments.map((shipment: Shipment & { order?: Order | null }) => (
                    <ShipmentRow key={shipment.id} shipment={shipment} />
                  ))}
                </TableBody>
              </Table>
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
                  Página {currentPage} de {totalPages} ({totalItems} envios)
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
          </div>
        ) : null}
      </LoadingState>
      </div>
    </div>
  );
}