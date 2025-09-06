import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  QrCode, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus,
  Search,
  MapPin,
  Weight,
  Ruler,
  User,
  Scan,
  PackageCheck,
  Trash2
} from "lucide-react";
import { z } from "zod";

// Picking List Item Schema
const pickingListItemSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantityToPick: z.number().min(1, "Quantidade deve ser maior que 0"),
  locationId: z.string().optional(),
});

// Picking List Schema
const pickingListSchema = z.object({
  orderNumber: z.string().min(1, "Número da encomenda é obrigatório"),
  warehouseId: z.string().min(1, "Armazém é obrigatório"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  notes: z.string().optional(),
});

// Packing Schema
const packingSchema = z.object({
  pickingListId: z.string().min(1, "Lista de picking é obrigatória"),
  packageType: z.string().min(1, "Tipo de embalagem é obrigatório"),
  weight: z.number().min(0, "Peso deve ser positivo"),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }),
  notes: z.string().optional(),
});

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
}

interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

interface PickingList {
  id: string;
  pickNumber?: string;
  orderNumber?: string | null;
  warehouse: {
    id: string;
    name: string;
  };
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  assignedTo?: {
    id: string;
    username: string;
  };
  items: {
    id: string;
    product: {
      id: string;
      name: string;
      sku: string;
      barcode?: string;
    };
    quantity: number;
    pickedQuantity?: number;
    location?: {
      zone?: string;
      shelf?: string;
      bin?: string;
    };
  }[];
  createdAt: string;
  completedAt?: string;
  notes?: string;
}



export default function PickingPackingPage() {
  const [activeTab, setActiveTab] = useState("picking");
  const [isPickingDialogOpen, setIsPickingDialogOpen] = useState(false);
  const [isPackingDialogOpen, setIsPackingDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pickingItems, setPickingItems] = useState<Array<z.infer<typeof pickingListItemSchema>>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pickingForm = useForm<z.infer<typeof pickingListSchema>>({
    resolver: zodResolver(pickingListSchema as any),
    defaultValues: {
      orderNumber: "",
      warehouseId: "",
      priority: "normal",
      notes: "",
    },
  });

  const packingForm = useForm<z.infer<typeof packingSchema>>({
    resolver: zodResolver(packingSchema as any),
    defaultValues: {
      pickingListId: "",
      packageType: "",
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      notes: "",
    },
  });

  // Get picking lists
  const { data: pickingLists, isLoading: isLoadingPicking } = useQuery({
    queryKey: ['/api/picking-lists'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/picking-lists');
      return await response.json();
    }
  });

  // Get packing tasks
  const { data: packingTasks, isLoading: isLoadingPacking } = useQuery({
    queryKey: ['/api/packing-tasks'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/packing-tasks');
      return await response.json();
    }
  });

  // Get warehouses for form
  const { data: warehouses } = useQuery({
    queryKey: ['/api/warehouses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/warehouses');
      return await response.json();
    }
  });

  // Get products
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products');
      return await response.json();
    }
  });

  // Get product locations
  const { data: productLocations } = useQuery({
    queryKey: ['/api/product-locations', pickingForm.watch('warehouseId')],
    queryFn: async () => {
      const warehouseId = pickingForm.getValues('warehouseId');
      if (!warehouseId) return [];
      const response = await apiRequest('GET', `/api/product-locations?warehouseId=${warehouseId}`);
      return await response.json();
    },
    enabled: !!pickingForm.watch('warehouseId')
  });

  // Create picking list mutation
  const createPickingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof pickingListSchema> & { items?: z.infer<typeof pickingListItemSchema>[] }) => {
      return await apiRequest('POST', '/api/picking-lists', {
        orderNumbers: [data.orderNumber],
        warehouseId: data.warehouseId,
        priority: data.priority,
        notes: data.notes,
        pickingType: 'individual',
        items: data.items || []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/picking-lists'] });
      toast({
        title: "Lista de picking criada com sucesso!",
        description: "A lista foi criada e está pronta para ser processada.",
      });
      setIsPickingDialogOpen(false);
      pickingForm.reset();
      setPickingItems([]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar lista de picking",
        description: error.message,
      });
    }
  });

  // Create packing task mutation
  const createPackingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof packingSchema>) => {
      return await apiRequest('POST', '/api/packing-tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/packing-tasks'] });
      toast({
        title: "Tarefa de embalagem criada com sucesso!",
        description: "A tarefa foi criada e está pronta para ser processada.",
      });
      setIsPackingDialogOpen(false);
      packingForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar tarefa de embalagem",
        description: error.message,
      });
    }
  });

  const onPickingSubmit = (data: z.infer<typeof pickingListSchema>) => {
    // Validar se há pelo menos um item
    if (pickingItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Deve adicionar pelo menos um item à lista de picking.",
      });
      return;
    }

    // Validar se todos os itens têm produto selecionado
    const invalidItems = pickingItems.filter(item => !item.productId || item.quantityToPick <= 0);
    
    if (invalidItems.length > 0) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "Todos os itens devem ter um produto selecionado e quantidade maior que 0.",
      });
      return;
    }

    const submitData = {
      ...data,
      items: pickingItems
    };
    
    createPickingMutation.mutate(submitData);
  };

  const addPickingItem = () => {
    setPickingItems([...pickingItems, {
      productId: "",
      quantityToPick: 1,
      locationId: ""
    }]);
  };

  const removePickingItem = (index: number) => {
    setPickingItems(pickingItems.filter((_, i) => i !== index));
  };

  const updatePickingItem = (index: number, field: keyof z.infer<typeof pickingListItemSchema>, value: any) => {
    const updatedItems = [...pickingItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPickingItems(updatedItems);
  };

  const onPackingSubmit = (data: z.infer<typeof packingSchema>) => {
    createPackingMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "in_progress":
        return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Em Progresso</Badge>;
      case "completed":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Concluída</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgente</Badge>;
      case "high":
        return <Badge variant="secondary">Alta</Badge>;
      case "normal":
        return <Badge variant="outline">Normal</Badge>;
      case "low":
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Start picking list mutation
  const startPickingMutation = useMutation({
    mutationFn: async (pickingListId: string) => {
      return await apiRequest('POST', `/api/picking-lists/${pickingListId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/picking-lists'] });
      toast({
        title: "Picking iniciado com sucesso!",
        description: "A lista de picking foi iniciada e está pronta para ser processada.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar picking",
        description: error.message,
      });
    }
  });

  const handleStartPicking = (pickingList: PickingList) => {
    startPickingMutation.mutate(pickingList.id);
  };

  const handleScanItem = () => {
    toast({
      title: "Item escaneado",
      description: "Item confirmado na lista de picking",
    });
  };

  const formatLocationCode = (location?: { zone?: string; shelf?: string; bin?: string }) => {
    if (!location) return "Sem localização";
    const parts = [];
    if (location.zone) parts.push(location.zone);
    if (location.shelf) parts.push(location.shelf);
    if (location.bin) parts.push(location.bin);
    return parts.length > 0 ? parts.join("-") : "Sem localização";
  };

  const filteredPickingLists = pickingLists?.filter((list: PickingList) => 
    list && list.warehouse && 
    ((list.orderNumber && list.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (list.pickNumber && list.pickNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
    list.warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const filteredPackingTasks = packingTasks?.filter((task: any) => 
    task && task.pickingList && task.pickingList.orderNumber && task.packageType &&
    (task.pickingList.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.packageType.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Picking, Packing & Shipping" breadcrumbs={["Picking, Packing & Shipping"]} />
      
      <div className="px-6 py-4 space-y-6">

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Procurar encomendas, listas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-operations"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="picking" data-testid="tab-picking">
            <Package className="w-4 h-4 mr-2" />
            Picking Lists
          </TabsTrigger>
          <TabsTrigger value="packing" data-testid="tab-packing">
            <PackageCheck className="w-4 h-4 mr-2" />
            Packing & Shipping
          </TabsTrigger>
        </TabsList>

        {/* Picking Lists Tab */}
        <TabsContent value="picking" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Listas de Picking</h2>
            <Dialog open={isPickingDialogOpen} onOpenChange={setIsPickingDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-picking-list" className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Lista de Picking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                  <DialogTitle className="text-xl font-semibold">Criar Nova Lista de Picking</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Preencha os dados abaixo para criar uma nova lista de picking
                  </p>
                </DialogHeader>
                <Form {...pickingForm}>
                  <form onSubmit={pickingForm.handleSubmit(onPickingSubmit)} className="space-y-6 pt-4">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-semibold mb-3">Informações Básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={pickingForm.control}
                            name="orderNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Número da Encomenda *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: ORD-2025-001" 
                                    {...field} 
                                    data-testid="input-order-number"
                                    className="h-10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={pickingForm.control}
                            name="warehouseId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Armazém *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-warehouse-picking" className="h-10">
                                      <SelectValue placeholder="Seleccione o armazém" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {warehouses?.filter((warehouse: Warehouse) => warehouse.name).map((warehouse: Warehouse) => (
                                      <SelectItem key={warehouse.id} value={warehouse.id}>
                                        {warehouse.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={pickingForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Prioridade</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-priority" className="h-10">
                                    <SelectValue placeholder="Seleccione a prioridade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                      Baixa
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="normal">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                      Normal
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="high">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                                      Alta
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="urgent">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                      Urgente
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={pickingForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">Observações</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Observações especiais..." 
                                  {...field} 
                                  data-testid="textarea-picking-notes"
                                  className="min-h-[80px] resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Seção de Itens */}
                    <div className="space-y-4 border-t pt-6">
                      <div className="flex items-center justify-between mb-4 p-4 bg-muted/30 rounded-lg border">
                        <div>
                          <FormLabel className="text-base font-semibold flex items-center">
                            <Package className="h-5 w-5 mr-2 text-primary" />
                            Itens da Lista de Picking
                          </FormLabel>
                          <p className="text-sm text-muted-foreground mt-1">
                            Adicione os produtos que devem ser coletados nesta lista
                          </p>
                        </div>
                        <Button 
                          type="button" 
                          variant="default" 
                          size="sm"
                          onClick={addPickingItem}
                          data-testid="add-picking-item"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Item
                        </Button>
                      </div>
                      
                      {pickingItems.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted rounded-lg bg-muted/10">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                              <Package className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <h4 className="text-base font-medium text-muted-foreground mb-2">Nenhum item adicionado</h4>
                            <p className="text-sm text-muted-foreground/75 mb-4">Clique em "Adicionar Item" para começar a criar sua lista</p>
                            <Button
                              type="button"
                              onClick={addPickingItem}
                              variant="outline"
                              size="sm"
                              className="border-primary/50 text-primary hover:bg-primary/10"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Primeiro Item
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {pickingItems.map((item, index) => (
                        <div key={index} className="border border-border rounded-lg p-4 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-semibold text-primary">{index + 1}</span>
                              </div>
                              <h4 className="text-sm font-semibold text-foreground">Item {index + 1}</h4>
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePickingItem(index)}
                              data-testid={`remove-item-${index}`}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Produto */}
                            <div>
                              <FormLabel className="text-sm font-medium mb-2 block">Produto *</FormLabel>
                              <Select 
                                value={item.productId} 
                                onValueChange={(value) => updatePickingItem(index, 'productId', value)}
                              >
                                <SelectTrigger data-testid={`select-product-${index}`} className="h-10">
                                  <SelectValue placeholder="Seleccione o produto" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products?.filter((product: Product) => product.name && product.sku).map((product: Product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{product.name}</span>
                                        <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Quantidade */}
                            <div>
                              <FormLabel className="text-sm font-medium mb-2 block">Quantidade *</FormLabel>
                              <Input 
                                type="number" 
                                min="1" 
                                value={item.quantityToPick}
                                onChange={(e) => updatePickingItem(index, 'quantityToPick', parseInt(e.target.value) || 1)}
                                data-testid={`input-quantity-${index}`}
                                placeholder="Ex: 10"
                                className="h-10"
                              />
                            </div>
                            
                            {/* Localização */}
                            <div>
                              <FormLabel className="text-sm font-medium mb-2 block">Localização</FormLabel>
                              <Select 
                                value={item.locationId || ""} 
                                onValueChange={(value) => updatePickingItem(index, 'locationId', value)}
                              >
                                <SelectTrigger data-testid={`select-location-${index}`} className="h-10">
                                  <SelectValue placeholder="Seleccione a localização" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="no-location">
                                    <div className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                      Sem localização específica
                                    </div>
                                  </SelectItem>
                                  {productLocations?.filter((location: any) => 
                                    location.productId === item.productId
                                  ).map((location: any) => (
                                    <SelectItem key={location.id} value={location.id}>
                                      <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                                        {[location.zone, location.shelf, location.bin].filter(Boolean).join('-') || 'Localização sem código'}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t">
                      <div className="text-sm text-muted-foreground">
                        {pickingItems.length > 0 && (
                          <span>{pickingItems.length} item(s) adicionado(s)</span>
                        )}
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsPickingDialogOpen(false)}
                          data-testid="button-cancel-picking"
                          className="min-w-[100px]"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPickingMutation.isPending || pickingItems.length === 0}
                          data-testid="button-submit-picking"
                          className="min-w-[120px] bg-primary hover:bg-primary/90"
                        >
                          {createPickingMutation.isPending ? "Criando..." : "Criar Lista"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            {isLoadingPicking ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPickingLists.map((list: PickingList) => (
                  <div 
                    key={list.id} 
                    className="border border-border rounded-lg p-4 space-y-3"
                    data-testid={`picking-list-${list.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid={`order-number-${list.id}`}>
                            {list.orderNumber || list.pickNumber || 'N/A'}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{list.warehouse?.name || 'Armazém não encontrado'}</span>
                            {list.assignedTo && (
                              <>
                                <span>•</span>
                                <User className="w-4 h-4" />
                                <span>{list.assignedTo.username}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(list.status)}
                        {getPriorityBadge(list.priority)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Items ({list.items.length})</h4>
                      <div className="grid gap-2">
                        {list.items.map((item: any) => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                            data-testid={`picking-item-${item.id}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-sm">
                                <span className="font-medium">{item.product?.name || 'Produto não encontrado'}</span>
                                <span className="text-muted-foreground ml-2">({item.product?.sku || 'N/A'})</span>
                              </div>
                              <Badge variant="outline">
                                Qtd: {item.pickedQuantity || 0}/{item.quantity}
                              </Badge>
                              <Badge variant="secondary">
                                {formatLocationCode(item.location)}
                              </Badge>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleScanItem()}
                              data-testid={`scan-item-${item.id}`}
                            >
                              <Scan className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Criada: {new Date(list.createdAt).toLocaleString('pt-PT')}
                      </span>
                      <div className="flex space-x-2">
                        {list.status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStartPicking(list)}
                            data-testid={`start-picking-${list.id}`}
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Iniciar Picking
                          </Button>
                        )}
                        {list.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`create-packing-${list.id}`}
                            onClick={() => {
                              packingForm.setValue('pickingListId', list.id);
                              setIsPackingDialogOpen(true);
                            }}
                          >
                            <PackageCheck className="w-4 h-4 mr-2" />
                            Criar Embalagem
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPickingLists.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {searchQuery ? "Nenhuma lista encontrada" : "Nenhuma lista de picking"}
                    </p>
                    <p className="text-sm">
                      {searchQuery 
                        ? "Tente ajustar os termos de pesquisa" 
                        : "Crie uma nova lista de picking para começar"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Packing & Shipping Tab */}
        <TabsContent value="packing" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tarefas de Embalagem & Envio</h2>
            <Dialog open={isPackingDialogOpen} onOpenChange={setIsPackingDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-packing-task">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Tarefa de Embalagem
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Nova Tarefa de Embalagem</DialogTitle>
                </DialogHeader>
                <Form {...packingForm}>
                  <form onSubmit={packingForm.handleSubmit(onPackingSubmit)} className="space-y-4">
                    <FormField
                      control={packingForm.control}
                      name="pickingListId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lista de Picking</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-picking-list">
                                <SelectValue placeholder="Seleccione a lista de picking" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(() => {
                                // Debug: Log das listas de picking disponíveis
                          
                                
                                const filteredLists = pickingLists?.filter((list: PickingList) => {
                                  const isCompleted = list.status === 'completed';
                                  const hasIdentifier = list.orderNumber || list.pickNumber;
                                  

                                  
                                  return isCompleted && hasIdentifier;
                                });
                                
                          
                                
                                return filteredLists?.map((list: PickingList) => (
                                  <SelectItem key={list.id} value={list.id}>
                                    {list.orderNumber || list.pickNumber}
                                  </SelectItem>
                                ));
                              })()}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={packingForm.control}
                      name="packageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Embalagem</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-package-type">
                                <SelectValue placeholder="Seleccione o tipo de embalagem" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="envelope">Envelope</SelectItem>
                              <SelectItem value="caixa-pequena">Caixa Pequena</SelectItem>
                              <SelectItem value="caixa-media">Caixa Média</SelectItem>
                              <SelectItem value="caixa-grande">Caixa Grande</SelectItem>
                              <SelectItem value="palete">Palete</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={packingForm.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (kg)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.0" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-weight"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={packingForm.control}
                        name="dimensions.length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comprimento (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-length"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={packingForm.control}
                        name="dimensions.width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Largura (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-width"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={packingForm.control}
                        name="dimensions.height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altura (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-height"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={packingForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Instruções especiais de embalagem..." 
                              {...field} 
                              data-testid="textarea-packing-notes"
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
                        onClick={() => setIsPackingDialogOpen(false)}
                        data-testid="button-cancel-packing"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPackingMutation.isPending}
                        data-testid="button-submit-packing"
                      >
                        Criar Tarefa
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="p-6">
            {isLoadingPacking ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPackingTasks.map((task: any) => (
                  <div 
                    key={task.id} 
                    className="border border-border rounded-lg p-4 space-y-3"
                    data-testid={`packing-task-${task.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
                          <PackageCheck className="w-6 h-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid={`packing-order-${task.id}`}>
                            {task.pickingList?.orderNumber || 'N/A'}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{task.packageType}</span>
                            {task.weight && (
                              <>
                                <span>•</span>
                                <Weight className="w-4 h-4" />
                                <span>{task.weight}kg</span>
                              </>
                            )}
                            {task.dimensions && (
                              <>
                                <span>•</span>
                                <Ruler className="w-4 h-4" />
                                <span>
                                  {task.dimensions.length}×{task.dimensions.width}×{task.dimensions.height}cm
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(task.status)}
                        {task.trackingNumber && (
                          <Badge variant="outline" data-testid={`tracking-${task.id}`}>
                            {task.trackingNumber}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        <div>Criada: {new Date(task.createdAt).toLocaleString('pt-PT')}</div>
                        {task.completedAt && (
                          <div>Concluída: {new Date(task.completedAt).toLocaleString('pt-PT')}</div>
                        )}
                        {task.packedBy && (
                          <div>Por: {task.packedBy.username}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {task.status === 'pending' && (
                          <Button 
                            size="sm"
                            data-testid={`start-packing-${task.id}`}
                          >
                            <PackageCheck className="w-4 h-4 mr-2" />
                            Iniciar Embalagem
                          </Button>
                        )}
                        {task.status === 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`create-shipping-${task.id}`}
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Criar Envio
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPackingTasks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <PackageCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {searchQuery ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa de embalagem"}
                    </p>
                    <p className="text-sm">
                      {searchQuery 
                        ? "Tente ajustar os termos de pesquisa" 
                        : "Crie uma nova tarefa de embalagem para começar"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}