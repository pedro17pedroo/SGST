import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Truck, Package, Calendar, MapPin, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { OrderCombobox } from "@/components/ui/order-combobox";
import { CarrierVehicleCombobox } from "@/components/ui/carrier-vehicle-combobox";
import { LoadingState, LoadingComponents, useLoadingStates } from "@/components/ui/loading-state";
import { z } from "zod";

// Schema personalizado para o formulário de envios
const shipmentFormSchema = z.object({
  orderId: z.string().min(1, "Selecione uma encomenda"),
  carrierId: z.string().min(1, "Selecione uma transportadora"),
  vehicleId: z.string().min(1, "Selecione um veículo"),
  status: z.string().min(1, "Selecione o status do envio"),
  carrier: z.string().min(1, "Nome da transportadora é obrigatório"),
  trackingNumber: z.string().optional(),
  shippingAddress: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  estimatedDelivery: z.string().min(1, "Data prevista de entrega é obrigatória"),
});

type ShipmentFormData = z.infer<typeof shipmentFormSchema>;

// Função para gerar número de rastreamento único
const generateTrackingNumber = (): string => {
  const prefix = "TRK";
  const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos do timestamp
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 caracteres aleatórios
  return `${prefix}${timestamp}${random}`;
};

function ShipmentDialog({ shipment, trigger }: { shipment?: Shipment; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Removido: query de orders e veículos agora são feitas pelos respectivos combobox
  
  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      orderId: "",
      carrierId: "",
      vehicleId: "",
      status: "preparing",
      carrier: "",
      trackingNumber: "",
      shippingAddress: "",
      estimatedDelivery: "",
    },
  });

  // Função para gerar novo número de rastreamento
  const handleGenerateTrackingNumber = () => {
    const newTrackingNumber = generateTrackingNumber();
    form.setValue("trackingNumber", newTrackingNumber);
    toast({
      title: "Número gerado",
      description: `Novo número de rastreamento: ${newTrackingNumber}`,
    });
  };

  // Reset form values when shipment changes
  useEffect(() => {
    if (shipment) {
      form.reset({
        orderId: shipment.orderId || "",
        carrierId: (shipment as any).carrierId || "",
        vehicleId: (shipment as any).vehicleId || "",
        status: (shipment.status as any) || "preparing",
        carrier: shipment.carrier || "",
        trackingNumber: shipment.trackingNumber || "",
        shippingAddress: shipment.shippingAddress || "",
        estimatedDelivery: shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toISOString().split('T')[0] : "",
      });
    } else {
      // Para novos envios, gerar automaticamente o número de rastreamento
      const autoTrackingNumber = generateTrackingNumber();
      form.reset({
        orderId: "",
        carrierId: "",
        vehicleId: "",
        status: "preparing",
        carrier: "",
        trackingNumber: autoTrackingNumber,
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

  // Função para verificar unicidade do número de rastreamento
  const checkTrackingNumberUniqueness = async (trackingNumber: string): Promise<boolean> => {
    if (!trackingNumber) return true; // Se não há número, não precisa verificar
    
    try {
      const response = await apiRequest("GET", `/api/shipping?trackingNumber=${encodeURIComponent(trackingNumber)}`);
      const data = await response.json();
      
      // Se estamos editando um envio, excluir o próprio envio da verificação
      if (shipment) {
        return !data.some((s: Shipment) => s.trackingNumber === trackingNumber && s.id !== shipment.id);
      }
      
      // Para novos envios, verificar se não existe nenhum com esse número
      return !data.some((s: Shipment) => s.trackingNumber === trackingNumber);
    } catch (error) {
      console.error("Erro ao verificar unicidade do número de rastreamento:", error);
      return true; // Em caso de erro, permitir o envio
    }
  };

  const onSubmit = async (data: ShipmentFormData) => {
    // Verificar unicidade do número de rastreamento se fornecido
    if (data.trackingNumber) {
      const isUnique = await checkTrackingNumberUniqueness(data.trackingNumber);
      
      if (!isUnique) {
        form.setError("trackingNumber", {
          type: "manual",
          message: "Este número de rastreamento já está em uso. Por favor, gere um novo ou use um número diferente."
        });
        toast({
          title: "Número duplicado",
          description: "O número de rastreamento já está em uso no sistema.",
          variant: "destructive",
        });
        return;
      }
    }

    if (shipment) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-shipment">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {shipment ? "Editar Envio" : "Novo Envio"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
            {shipment ? "Edite as informações do envio selecionado." : "Preencha os dados para criar um novo envio. O número será gerado automaticamente."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informação sobre geração automática do número */}
            {!shipment && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Número do Envio
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Será gerado automaticamente após a criação
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Campos principais em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Estado *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                      <FormControl>
                        <SelectTrigger data-testid="select-shipment-status" className="h-11">
                          <SelectValue placeholder="Selecione o estado do envio" />
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
              
              <FormField
                control={form.control}
                name="estimatedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Data Prevista de Entrega *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field} 
                        value={field.value || ""}
                        data-testid="input-estimated-delivery"
                        className="h-11"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Encomenda */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Informações da Encomenda
              </h3>
              
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Encomenda *</FormLabel>
                    <FormControl>
                      <OrderCombobox
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Pesquisar e selecionar encomenda..."
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="h-11"
                        orderType="sale"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Transportadora e Veículo */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Seleção de Transportadora e Veículo
              </h3>
              
              <CarrierVehicleCombobox
                carrierValue={form.watch("carrierId") || ""}
                vehicleValue={form.watch("vehicleId") || ""}
                onCarrierChange={(carrierId) => {
                  form.setValue("carrierId", carrierId);
                  form.clearErrors("carrierId");
                }}
                onVehicleChange={(vehicleId) => {
                  form.setValue("vehicleId", vehicleId);
                  form.clearErrors("vehicleId");
                }}
                onCarrierSelect={(carrier) => {
                  if (carrier) {
                    form.setValue("carrier", carrier.name);
                    form.clearErrors("carrier");
                  }
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full"
              />
              
              {/* Mostrar erros de validação */}
              {form.formState.errors.carrierId && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.carrierId.message}
                </p>
              )}
              {form.formState.errors.vehicleId && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.vehicleId.message}
                </p>
              )}
            </div>

            {/* Seção de Rastreamento */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Informações de Rastreamento
              </h3>
              
              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Número de Rastreamento</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="ABC123456789" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-tracking-number"
                          className="h-11 flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateTrackingNumber}
                        className="h-11 px-3"
                        title="Gerar novo número de rastreamento"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Número gerado automaticamente. Clique no botão para gerar um novo ou edite manualmente.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de Endereço de Entrega */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Endereço de Entrega
              </h3>
              
              <FormField
                control={form.control}
                name="shippingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Endereço Completo *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Rua, número, bairro, cidade, província...&#10;Exemplo: Rua das Flores, 123, Maianga, Luanda, Luanda"
                        className="resize-none min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-shipping-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
                className="w-full sm:w-auto h-11 font-medium"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-shipment"
                className="w-full sm:w-auto h-11 font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    {shipment ? "Atualizar Envio" : "Criar Envio"}
                  </>
                )}
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
                <LoadingComponents.TableRows rows={itemsPerPage} columns={7} />
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