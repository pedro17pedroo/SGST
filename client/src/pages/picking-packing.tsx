import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
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
  PackageCheck
} from "lucide-react";
import { z } from "zod";

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

interface PickingList {
  id: string;
  orderNumber: string;
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

interface PackingTask {
  id: string;
  pickingList: {
    id: string;
    orderNumber: string;
  };
  packageType: string;
  status: "pending" | "in_progress" | "completed";
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  trackingNumber?: string;
  packedBy?: {
    id: string;
    username: string;
  };
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export default function PickingPackingPage() {
  const [activeTab, setActiveTab] = useState("picking");
  const [isPickingDialogOpen, setIsPickingDialogOpen] = useState(false);
  const [isPackingDialogOpen, setIsPackingDialogOpen] = useState(false);
  const [selectedPickingList, setSelectedPickingList] = useState<PickingList | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pickingForm = useForm<z.infer<typeof pickingListSchema>>({
    resolver: zodResolver(pickingListSchema),
    defaultValues: {
      orderNumber: "",
      warehouseId: "",
      priority: "normal",
      notes: "",
    },
  });

  const packingForm = useForm<z.infer<typeof packingSchema>>({
    resolver: zodResolver(packingSchema),
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
      // Demo data for now - replace with actual API call
      return [
        {
          id: 'pick-001',
          orderNumber: 'ORD-2025-001',
          warehouse: { id: 'wh-001', name: 'Armazém Principal' },
          status: 'pending' as const,
          priority: 'high' as const,
          items: [
            {
              id: 'item-001',
              product: {
                id: '1',
                name: 'Smartphone Samsung Galaxy A54',
                sku: 'SPH-001',
                barcode: '7891234567890'
              },
              quantity: 2,
              location: { zone: 'A', shelf: 'A1', bin: 'A1-01' }
            },
            {
              id: 'item-002',
              product: {
                id: '3',
                name: 'Monitor LG 24" Full HD',
                sku: 'MON-003',
                barcode: '7891234567892'
              },
              quantity: 1,
              location: { zone: 'B', shelf: 'B2', bin: 'B2-15' }
            }
          ],
          createdAt: new Date().toISOString(),
          notes: 'Prioridade alta - cliente VIP'
        },
        {
          id: 'pick-002',
          orderNumber: 'ORD-2025-002',
          warehouse: { id: 'wh-001', name: 'Armazém Principal' },
          status: 'in_progress' as const,
          priority: 'normal' as const,
          assignedTo: { id: 'user-002', username: 'Maria Operadora' },
          items: [
            {
              id: 'item-003',
              product: {
                id: '4',
                name: 'Fones JBL Tune 510BT',
                sku: 'FON-004',
                barcode: '7891234567893'
              },
              quantity: 3,
              pickedQuantity: 2,
              location: { zone: 'C', shelf: 'C1', bin: 'C1-08' }
            }
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }
      ] as PickingList[];
    }
  });

  // Get packing tasks
  const { data: packingTasks, isLoading: isLoadingPacking } = useQuery({
    queryKey: ['/api/packing-tasks'],
    queryFn: async () => {
      // Demo data for now - replace with actual API call
      return [
        {
          id: 'pack-001',
          pickingList: { id: 'pick-003', orderNumber: 'ORD-2025-003' },
          packageType: 'Caixa Média',
          status: 'completed' as const,
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 15 },
          trackingNumber: 'TRK-001-2025',
          packedBy: { id: 'user-001', username: 'João Admin' },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'pack-002',
          pickingList: { id: 'pick-002', orderNumber: 'ORD-2025-002' },
          packageType: 'Caixa Pequena',
          status: 'pending' as const,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        }
      ] as PackingTask[];
    }
  });

  // Get warehouses for form
  const { data: warehouses } = useQuery({
    queryKey: ['/api/warehouses'],
    queryFn: async () => {
      const response = await fetch('/api/warehouses');
      if (!response.ok) throw new Error('Failed to fetch warehouses');
      return response.json() as Promise<Warehouse[]>;
    }
  });

  // Create picking list mutation
  const createPickingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof pickingListSchema>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'new-pick', ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/picking-lists'] });
      toast({
        title: "Lista de picking criada com sucesso!",
        description: "A lista foi criada e está pronta para ser processada.",
      });
      setIsPickingDialogOpen(false);
      pickingForm.reset();
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'new-pack', ...data };
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
    createPickingMutation.mutate(data);
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

  const handleStartPicking = (pickingList: PickingList) => {
    toast({
      title: "Picking iniciado",
      description: `Iniciando picking para ${pickingList.orderNumber}`,
    });
  };

  const handleScanItem = (pickingList: PickingList, itemId: string) => {
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

  const filteredPickingLists = pickingLists?.filter(list => 
    list.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredPackingTasks = packingTasks?.filter(task => 
    task.pickingList.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.packageType.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Button data-testid="add-picking-list">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Lista de Picking
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Nova Lista de Picking</DialogTitle>
                </DialogHeader>
                <Form {...pickingForm}>
                  <form onSubmit={pickingForm.handleSubmit(onPickingSubmit)} className="space-y-4">
                    <FormField
                      control={pickingForm.control}
                      name="orderNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da Encomenda</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="ORD-2025-001" 
                              {...field} 
                              data-testid="input-order-number"
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
                          <FormLabel>Armazém</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-warehouse-picking">
                                <SelectValue placeholder="Seleccione o armazém" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warehouses?.map((warehouse) => (
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

                    <FormField
                      control={pickingForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue placeholder="Seleccione a prioridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
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
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações especiais..." 
                              {...field} 
                              data-testid="textarea-picking-notes"
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
                        onClick={() => setIsPickingDialogOpen(false)}
                        data-testid="button-cancel-picking"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createPickingMutation.isPending}
                        data-testid="button-submit-picking"
                      >
                        Criar Lista
                      </Button>
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
                {filteredPickingLists.map((list) => (
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
                            {list.orderNumber}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{list.warehouse.name}</span>
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
                        {list.items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                            data-testid={`picking-item-${item.id}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-sm">
                                <span className="font-medium">{item.product.name}</span>
                                <span className="text-muted-foreground ml-2">({item.product.sku})</span>
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
                              onClick={() => handleScanItem(list, item.id)}
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
                              {pickingLists?.filter(list => list.status === 'completed').map((list) => (
                                <SelectItem key={list.id} value={list.id}>
                                  {list.orderNumber}
                                </SelectItem>
                              ))}
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
                {filteredPackingTasks.map((task) => (
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
                            {task.pickingList.orderNumber}
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