import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Truck, Package, Calendar, MapPin, User as UserIcon } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { insertShipmentSchema, type Shipment, type Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const shipmentFormSchema = insertShipmentSchema.extend({
  shipmentNumber: z.string().min(1, "Número do envio é obrigatório"),
  status: z.enum(["preparing", "shipped", "in_transit", "delivered", "cancelled"]).default("preparing"),
  estimatedDelivery: z.string().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentFormSchema>;

function ShipmentDialog({ shipment, trigger }: { shipment?: Shipment; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });
  
  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      shipmentNumber: `SHP-${Date.now()}`,
      orderId: "",
      status: "preparing",
      carrier: "",
      trackingNumber: "",
      shippingAddress: "",
      estimatedDelivery: "",
    },
  });

  // Reset form values when shipment changes
  React.useEffect(() => {
    if (shipment) {
      form.reset({
        shipmentNumber: shipment.shipmentNumber || `SHP-${Date.now()}`,
        orderId: shipment.orderId || "",
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
      const response = await apiRequest("POST", "/api/shipments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
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
      const response = await apiRequest("PUT", `/api/shipments/${shipment?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNumber} - {order.customerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        value={field.value || ""}
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

function ShipmentCard({ shipment }: { shipment: Shipment & { order?: Order | null } }) {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "shipped": return "bg-blue-100 text-blue-800";
      case "in_transit": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
    <Card className="h-full" data-testid={`card-shipment-${shipment.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg" data-testid={`text-shipment-number-${shipment.id}`}>
                {shipment.shipmentNumber}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {shipment.carrier || "Sem transportadora"}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <ShipmentDialog
              shipment={shipment}
              trigger={
                <Button variant="ghost" size="sm" data-testid={`button-edit-${shipment.id}`}>
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge className={getStatusColor(shipment.status)}>
            {getStatusLabel(shipment.status)}
          </Badge>
          
          {shipment.order && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground" data-testid={`text-order-${shipment.id}`}>
                {shipment.order.orderNumber}
              </span>
            </div>
          )}

          {shipment.trackingNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-mono" data-testid={`text-tracking-${shipment.id}`}>
                {shipment.trackingNumber}
              </span>
            </div>
          )}

          {shipment.shippingAddress && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs line-clamp-2">
                {shipment.shippingAddress}
              </span>
            </div>
          )}

          {shipment.estimatedDelivery && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {new Date(shipment.estimatedDelivery).toLocaleDateString('pt-AO')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Shipping() {
  const [search, setSearch] = useState("");
  
  const { data: shipments = [], isLoading } = useQuery<Array<Shipment & { order?: Order | null }>>({
    queryKey: ["/api/shipments"],
  });

  const filteredShipments = shipments.filter((shipment: Shipment) =>
    shipment.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
    (shipment.trackingNumber && shipment.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
    (shipment.carrier && shipment.carrier.toLowerCase().includes(search.toLowerCase()))
  );

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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-48">
              <CardHeader className="animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShipments.map((shipment: Shipment & { order?: Order | null }) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
          {filteredShipments.length === 0 && (
            <div className="col-span-full text-center py-12">
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
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}