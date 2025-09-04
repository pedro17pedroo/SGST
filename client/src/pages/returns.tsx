import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
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
  RotateCcw, 
  Package, 
  User, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
  Search,
  RefreshCw,
  DollarSign,
  Eye
} from "lucide-react";
import { z } from "zod";

// Return Schema
const returnSchema = z.object({
  returnNumber: z.string().min(1, "Número da devolução é obrigatório"),
  type: z.enum(["customer", "supplier", "internal"]),
  originalOrderId: z.string().optional(),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  reason: z.string().min(1, "Motivo é obrigatório"),
  condition: z.enum(["new", "damaged", "used", "defective"]),
  refundMethod: z.enum(["cash", "credit", "store_credit", "exchange"]),
  notes: z.string().optional(),
});



interface Return {
  id: string;
  returnNumber: string;
  type: "customer" | "supplier" | "internal";
  status: "pending" | "approved" | "rejected" | "processed" | "completed";
  originalOrder?: {
    id: string;
    orderNumber: string;
  };
  customerId?: string;
  supplier?: {
    id: string;
    name: string;
  };
  reason: string;
  condition: string;
  totalAmount: number;
  refundMethod: string;
  qualityInspection?: any;
  notes?: string;
  approvedBy?: {
    id: string;
    username: string;
  };
  processedBy?: {
    id: string;
    username: string;
  };
  user: {
    id: string;
    username: string;
  };
  returnItems: ReturnItem[];
  createdAt: string;
  approvedAt?: string;
  processedAt?: string;
}

interface ReturnItem {
  id: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
  quantity: number;
  reason: string;
  condition: string;
  unitPrice: number;
  refundAmount: number;
  restockable: boolean;
  restocked: boolean;
  warehouse?: {
    id: string;
    name: string;
  };
  qualityNotes?: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Order {
  id: string;
  orderNumber: string;
  type: string;
}

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof returnSchema>>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      returnNumber: "",
      type: "customer",
      originalOrderId: "",
      customerId: "",
      supplierId: "",
      reason: "",
      condition: "new",
      refundMethod: "cash",
      notes: "",
    },
  });

  // Get returns
  const { data: returns, isLoading } = useQuery({
    queryKey: ['/api/returns'],
    queryFn: async () => {
      // Demo data for now - replace with actual API call
      return [
        {
          id: 'ret-001',
          returnNumber: 'RET-2025-001',
          type: 'customer' as const,
          status: 'pending' as const,
          originalOrder: { id: 'ord-001', orderNumber: 'ORD-2025-001' },
          customerId: 'cust-001',
          reason: 'Produto danificado',
          condition: 'damaged',
          totalAmount: 180000,
          refundMethod: 'credit',
          user: { id: 'user-001', username: 'João Admin' },
          returnItems: [
            {
              id: 'ritem-001',
              product: {
                id: '1',
                name: 'Smartphone Samsung Galaxy A54',
                sku: 'SPH-001',
                price: 180000
              },
              quantity: 1,
              reason: 'Produto danificado na entrega',
              condition: 'damaged',
              unitPrice: 180000,
              refundAmount: 180000,
              restockable: false,
              restocked: false,
            }
          ],
          createdAt: new Date().toISOString(),
          notes: 'Cliente relatou dano na embalagem'
        },
        {
          id: 'ret-002',
          returnNumber: 'RET-2025-002',
          type: 'supplier' as const,
          status: 'approved' as const,
          supplier: { id: 'sup-001', name: 'TechSup Angola' },
          reason: 'Mercadoria com defeito',
          condition: 'defective',
          totalAmount: 95000,
          refundMethod: 'credit',
          approvedBy: { id: 'user-001', username: 'João Admin' },
          user: { id: 'user-002', username: 'Maria Operadora' },
          returnItems: [
            {
              id: 'ritem-002',
              product: {
                id: '3',
                name: 'Monitor LG 24" Full HD',
                sku: 'MON-003',
                price: 95000
              },
              quantity: 1,
              reason: 'Defeito no painel',
              condition: 'defective',
              unitPrice: 95000,
              refundAmount: 95000,
              restockable: false,
              restocked: false,
            }
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          approvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'ret-003',
          returnNumber: 'RET-2025-003',
          type: 'internal' as const,
          status: 'completed' as const,
          reason: 'Excesso de stock',
          condition: 'new',
          totalAmount: 35000,
          refundMethod: 'store_credit',
          processedBy: { id: 'user-001', username: 'João Admin' },
          user: { id: 'user-003', username: 'Carlos Supervisor' },
          returnItems: [
            {
              id: 'ritem-003',
              product: {
                id: '4',
                name: 'Fones JBL Tune 510BT',
                sku: 'FON-004',
                price: 35000
              },
              quantity: 1,
              reason: 'Excesso de inventário',
              condition: 'new',
              unitPrice: 35000,
              refundAmount: 35000,
              restockable: true,
              restocked: true,
              warehouse: { id: 'wh-001', name: 'Armazém Principal' }
            }
          ],
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          processedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }
      ] as Return[];
    }
  });



  // Get suppliers for form
  const { data: suppliers } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json() as Promise<Supplier[]>;
    }
  });

  // Get orders for form
  const { data: orders } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json() as Promise<Order[]>;
    }
  });

  // Create return mutation
  const createReturnMutation = useMutation({
    mutationFn: async (data: z.infer<typeof returnSchema>) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: 'new-return', ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      toast({
        title: "Devolução criada com sucesso!",
        description: "A devolução foi registada no sistema.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar devolução",
        description: error.message,
      });
    }
  });

  // Approve return mutation
  const approveReturnMutation = useMutation({
    mutationFn: async (_returnId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      toast({
        title: "Devolução aprovada!",
        description: "A devolução foi aprovada e pode ser processada.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao aprovar devolução",
        description: error.message,
      });
    }
  });

  // Process return mutation
  const processReturnMutation = useMutation({
    mutationFn: async (_returnId: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      toast({
        title: "Devolução processada!",
        description: "A devolução foi processada e o reembolso foi efetuado.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao processar devolução",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: z.infer<typeof returnSchema>) => {
    createReturnMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "approved":
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      case "processed":
        return <Badge variant="default"><RefreshCw className="w-3 h-3 mr-1" />Processada</Badge>;
      case "completed":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Concluída</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "customer":
        return <Badge variant="outline">Cliente</Badge>;
      case "supplier":
        return <Badge variant="secondary">Fornecedor</Badge>;
      case "internal":
        return <Badge variant="default">Interno</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "new":
        return <Badge variant="default">Novo</Badge>;
      case "damaged":
        return <Badge variant="destructive">Danificado</Badge>;
      case "used":
        return <Badge variant="secondary">Usado</Badge>;
      case "defective":
        return <Badge variant="destructive">Defeituoso</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredReturns = returns?.filter(returnItem => {
    const matchesSearch = 
      returnItem.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (returnItem.originalOrder?.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (returnItem.supplier?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pending") return matchesSearch && returnItem.status === "pending";
    if (activeTab === "approved") return matchesSearch && returnItem.status === "approved";
    if (activeTab === "completed") return matchesSearch && (returnItem.status === "processed" || returnItem.status === "completed");
    
    return matchesSearch;
  }) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Gestão de Devoluções
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerir devoluções de clientes, fornecedores e reembolsos
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-return-button">
              <Plus className="w-4 h-4 mr-2" />
              Nova Devolução
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Nova Devolução</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="returnNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Devolução</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="RET-2025-001" 
                          {...field} 
                          data-testid="input-return-number"
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
                      <FormLabel>Tipo de Devolução</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-return-type">
                            <SelectValue placeholder="Seleccione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="customer">Devolução de Cliente</SelectItem>
                          <SelectItem value="supplier">Devolução a Fornecedor</SelectItem>
                          <SelectItem value="internal">Devolução Interna</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "customer" && (
                  <>
                    <FormField
                      control={form.control}
                      name="originalOrderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Encomenda Original</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-original-order">
                                <SelectValue placeholder="Seleccione a encomenda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {orders?.filter(order => order.type === 'sale').map((order) => (
                                <SelectItem key={order.id} value={order.id}>
                                  {order.orderNumber}
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
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID do Cliente</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="CUST-001" 
                              {...field} 
                              data-testid="input-customer-id"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {form.watch("type") === "supplier" && (
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-supplier">
                              <SelectValue placeholder="Seleccione o fornecedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers?.map((supplier) => (
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
                )}

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo da Devolução</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-reason">
                            <SelectValue placeholder="Seleccione o motivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="damaged">Produto danificado</SelectItem>
                          <SelectItem value="wrong_item">Item errado</SelectItem>
                          <SelectItem value="defective">Produto defeituoso</SelectItem>
                          <SelectItem value="excess">Excesso de stock</SelectItem>
                          <SelectItem value="quality_issue">Problema de qualidade</SelectItem>
                          <SelectItem value="not_as_described">Não conforme descrição</SelectItem>
                          <SelectItem value="customer_change_mind">Cliente mudou de opinião</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição do Produto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-condition">
                            <SelectValue placeholder="Seleccione a condição" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="used">Usado</SelectItem>
                          <SelectItem value="damaged">Danificado</SelectItem>
                          <SelectItem value="defective">Defeituoso</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="refundMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Reembolso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-refund-method">
                            <SelectValue placeholder="Seleccione o método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                          <SelectItem value="credit">Crédito na conta</SelectItem>
                          <SelectItem value="store_credit">Crédito da loja</SelectItem>
                          <SelectItem value="exchange">Troca</SelectItem>
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
                          placeholder="Detalhes adicionais sobre a devolução..." 
                          {...field} 
                          data-testid="textarea-notes"
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
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReturnMutation.isPending}
                    data-testid="button-submit"
                  >
                    Criar Devolução
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Procurar devoluções, motivos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-returns"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all-returns">
            Todas ({returns?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending-returns">
            <Clock className="w-4 h-4 mr-2" />
            Pendentes ({returns?.filter(r => r.status === "pending").length || 0})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved-returns">
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovadas ({returns?.filter(r => r.status === "approved").length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-returns">
            <CheckCircle className="w-4 h-4 mr-2" />
            Concluídas ({returns?.filter(r => r.status === "processed" || r.status === "completed").length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReturns.map((returnItem) => (
                  <div 
                    key={returnItem.id} 
                    className="border border-border rounded-lg p-4 space-y-3"
                    data-testid={`return-item-${returnItem.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <RotateCcw className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground" data-testid={`return-number-${returnItem.id}`}>
                            {returnItem.returnNumber}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{returnItem.reason}</span>
                            {returnItem.originalOrder && (
                              <>
                                <span>•</span>
                                <span>Encomenda: {returnItem.originalOrder.orderNumber}</span>
                              </>
                            )}
                            {returnItem.supplier && (
                              <>
                                <span>•</span>
                                <span>Fornecedor: {returnItem.supplier.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(returnItem.status)}
                        {getTypeBadge(returnItem.type)}
                        {getConditionBadge(returnItem.condition)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Total:</span> {formatCurrency(returnItem.totalAmount)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Items:</span> {returnItem.returnItems.length}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Criado por:</span> {returnItem.user.username}
                        </span>
                      </div>
                    </div>

                    {returnItem.returnItems.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Produtos Devolvidos</h4>
                        <div className="grid gap-2">
                          {returnItem.returnItems.slice(0, 3).map((item) => (
                            <div 
                              key={item.id} 
                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                              data-testid={`return-item-product-${item.id}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{item.product.name}</span>
                                <span className="text-xs text-muted-foreground">({item.product.sku})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Qtd: {item.quantity}</Badge>
                                <Badge variant="secondary">{formatCurrency(item.refundAmount)}</Badge>
                                {item.restockable && (
                                  <Badge variant={item.restocked ? "default" : "outline"}>
                                    {item.restocked ? "Restocked" : "A restituir"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                          {returnItem.returnItems.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{returnItem.returnItems.length - 3} mais produtos...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        <div>Criada: {new Date(returnItem.createdAt).toLocaleString('pt-PT')}</div>
                        {returnItem.approvedAt && (
                          <div>Aprovada: {new Date(returnItem.approvedAt).toLocaleString('pt-PT')}</div>
                        )}
                        {returnItem.processedAt && (
                          <div>Processada: {new Date(returnItem.processedAt).toLocaleString('pt-PT')}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            // TODO: Implementar visualização de detalhes da devolução
                          }}
                          data-testid={`view-return-${returnItem.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {returnItem.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => approveReturnMutation.mutate(returnItem.id)}
                              disabled={approveReturnMutation.isPending}
                              data-testid={`approve-return-${returnItem.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Aprovar
                            </Button>
                          </>
                        )}
                        {returnItem.status === 'approved' && (
                          <Button 
                            size="sm"
                            onClick={() => processReturnMutation.mutate(returnItem.id)}
                            disabled={processReturnMutation.isPending}
                            data-testid={`process-return-${returnItem.id}`}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Processar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredReturns.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      {searchQuery ? "Nenhuma devolução encontrada" : "Nenhuma devolução registada"}
                    </p>
                    <p className="text-sm">
                      {searchQuery 
                        ? "Tente ajustar os termos de pesquisa" 
                        : "Crie uma nova devolução para começar"
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
  );
}