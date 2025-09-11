import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS } from "@/config/api";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  AlertTriangle,
  Truck,
  Building
} from "lucide-react";
import { z } from "zod";
import { SupplierCombobox } from "@/components/ui/supplier-combobox";
import { OrderCombobox } from "@/components/ui/order-combobox";

// Return Schema
const returnSchema = z.object({
  returnNumber: z.string()
    .optional()
    .refine((val) => !val || /^RET-\d{4}-\d{3,}$/.test(val), {
      message: "Formato deve ser RET-YYYY-XXX (ex: RET-2025-001)"
    }),
  type: z.enum(["customer", "supplier", "internal"], {
    errorMap: () => ({ message: "Seleccione um tipo de devolução válido" })
  }),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    errorMap: () => ({ message: "Seleccione uma prioridade válida" })
  }).optional(),
  originalOrderId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string()
    .email("Formato de email inválido (ex: joao@exemplo.com)")
    .optional()
    .or(z.literal("")),
  customerPhone: z.string()
    .regex(/^\+244\s\d{3}\s\d{3}\s\d{3}$/, "Formato deve ser +244 XXX XXX XXX")
    .optional()
    .or(z.literal("")),
  supplierId: z.string().optional(),
  reason: z.string().min(1, "Seleccione o motivo da devolução"),
  condition: z.enum(["new", "damaged", "used", "defective"], {
    errorMap: () => ({ message: "Seleccione a condição do produto" })
  }),
  refundMethod: z.enum(["cash", "credit", "store_credit", "exchange"], {
    errorMap: () => ({ message: "Seleccione o método de reembolso" })
  }),
  notes: z.string()
    .max(500, "Observações não podem exceder 500 caracteres")
    .optional(),
  inspectionNotes: z.string()
    .max(500, "Notas de inspeção não podem exceder 500 caracteres")
    .optional(),
}).superRefine((data, ctx) => {
  // Validações condicionais para devolução de cliente
  if (data.type === "customer") {
    if (!data.customerId || data.customerId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ID do cliente é obrigatório para devoluções de cliente",
        path: ["customerId"]
      });
    }
    if (!data.customerName || data.customerName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nome do cliente é obrigatório para devoluções de cliente",
        path: ["customerName"]
      });
    }
  }
  
  // Validações condicionais para devolução a fornecedor
  if (data.type === "supplier") {
    if (!data.supplierId || data.supplierId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fornecedor é obrigatório para devoluções a fornecedor",
        path: ["supplierId"]
      });
    }
  }
});



interface Return {
  id: string;
  returnNumber: string;
  type: "customer" | "supplier" | "internal";
  status: "pending" | "approved" | "rejected" | "processing" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  originalOrder?: {
    id: string;
    orderNumber: string;
  };
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  supplier?: {
    id: string;
    name: string;
  };
  reason: string;
  condition: string;
  totalAmount: number;
  refundAmount?: number;
  refundMethod: string;
  qualityInspection?: any;
  notes?: string;
  inspectionNotes?: string;
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
  updatedAt?: string;
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset da página quando a busca ou aba muda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const form = useForm<z.infer<typeof returnSchema>>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      returnNumber: "",
      type: "customer",
      priority: undefined,
      originalOrderId: "",
      customerId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      supplierId: "",
      reason: "",
      condition: "new",
      refundMethod: "cash",
      notes: "",
      inspectionNotes: "",
    },
  });

  // Mutation para gerar número de devolução
  const generateReturnNumberMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `${API_ENDPOINTS.returns.list}/generate-number`);
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue('returnNumber', data.data.returnNumber);
      toast({
        title: "Número gerado",
        description: `Número da devolução: ${data.data.returnNumber}`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Erro ao gerar número da devolução:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o número da devolução. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Gerar número automaticamente quando o diálogo abrir
  useEffect(() => {
    if (isDialogOpen && !form.getValues('returnNumber')) {
      generateReturnNumberMutation.mutate();
    }
  }, [isDialogOpen]);

  // Função para abrir modal de visualização
  const handleViewReturn = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setIsViewDialogOpen(true);
  };

  // Get returns
  const { data: returnsResponse, isLoading } = useQuery({
    queryKey: ['/api/returns', { page: currentPage, limit: itemsPerPage, search: searchQuery, status: activeTab !== 'all' ? activeTab : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(activeTab !== 'all' && { status: activeTab })
      });
      
      const response = await apiRequest('GET', `${API_ENDPOINTS.returns.list}?${params}`);
      return response.json();
    },
  });

  // Get returns stats for tab counts
  const { data: statsResponse } = useQuery({
    queryKey: ['/api/returns/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.returns.stats);
      return response.json();
    },
  });

  // Extract returns data from response
  const returns = returnsResponse?.data || [];
  const pagination = returnsResponse?.pagination || { total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false };
  const stats = statsResponse?.data || { total: 0, pending: 0, approved: 0, processing: 0, completed: 0 };



  // Get suppliers for form
  const { data: suppliersResponse } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.suppliers.list);
      return response.json();
    }
  });
  const suppliers = suppliersResponse?.data || [];

  // Get orders for form
  const { data: ordersResponse } = useQuery({
    queryKey: ['/api/orders'],
    queryFn: async () => {
      const response = await apiRequest('GET', API_ENDPOINTS.orders.list);
      return response.json();
    }
  });
  const orders = ordersResponse?.data || [];

  // Create return mutation
  const createReturnMutation = useMutation({
    mutationFn: async (data: z.infer<typeof returnSchema>) => {
      const response = await apiRequest('POST', API_ENDPOINTS.returns.create, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/returns/stats'] });
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
    mutationFn: async (returnId: string) => {
      const response = await apiRequest('POST', API_ENDPOINTS.returns.approve(returnId), {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/returns/stats'] });
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
    mutationFn: async (returnId: string) => {
      const response = await apiRequest('POST', API_ENDPOINTS.returns.process(returnId), {});
      return response.json();
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

  // Complete return mutation
  const completeReturnMutation = useMutation({
    mutationFn: async (returnId: string) => {
      const response = await apiRequest('PUT', API_ENDPOINTS.returns.update(returnId), {
        status: 'completed'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      toast({
        title: "Devolução concluída!",
        description: "A devolução foi marcada como concluída.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao concluir devolução",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: z.infer<typeof returnSchema>) => {
    // Mapear os dados para o formato esperado pelo backend
    const mappedData = {
      ...data,
      // Mapear originalOrderId para orderNumber se necessário
      orderNumber: data.originalOrderId || '',
      // Adicionar array de items vazio por padrão (será implementado posteriormente)
      items: []
    };
    
    createReturnMutation.mutate(mappedData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "approved":
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Aprovada</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeitada</Badge>;
      case "processing":
        return <Badge variant="default"><RefreshCw className="w-3 h-3 mr-1" />Em Processamento</Badge>;
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
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  const filteredReturns = useMemo(() => {
    const filtered = returns?.filter((returnItem: Return) => {
      const matchesSearch = 
        returnItem.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        returnItem.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (returnItem.originalOrder?.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (returnItem.supplier?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === "all") return matchesSearch;
      if (activeTab === "pending") return matchesSearch && returnItem.status === "pending";
      if (activeTab === "approved") return matchesSearch && returnItem.status === "approved";
      if (activeTab === "processing") return matchesSearch && returnItem.status === "processing";
      if (activeTab === "completed") return matchesSearch && returnItem.status === "completed";
      
      return matchesSearch;
    }) || [];
    
    return filtered;
  }, [returns, searchQuery, activeTab]);

  // Paginação
  const totalItems = filteredReturns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReturns = filteredReturns.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Devoluções" breadcrumbs={["Gestão de Devoluções"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar devoluções..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
              data-testid="input-search-returns"
            />
          </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-return-button">
              <Plus className="w-4 h-4 mr-2" />
              Nova Devolução
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Nova Devolução
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-2">
                Preencha os dados abaixo para registar uma nova devolução no sistema
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Seção 1: Informações Básicas */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Informações Básicas
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dados gerais da devolução
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="returnNumber"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Número da Devolução *
                            <Badge variant="secondary" className="text-xs">
                              Gerado Automaticamente
                            </Badge>
                          </FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input 
                                  placeholder="Será gerado automaticamente..." 
                                  {...field} 
                                  data-testid="input-return-number"
                                  readOnly
                                  disabled
                                  className={`h-10 bg-gray-50 dark:bg-gray-800 cursor-not-allowed ${
                                    fieldState.error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                  }`}
                                />
                                {field.value && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => generateReturnNumberMutation.mutate()}
                                disabled={generateReturnNumberMutation.isPending}
                                className="h-10 px-3"
                                title="Regenerar número"
                              >
                                {generateReturnNumberMutation.isPending ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          {fieldState.error && (
                            <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              <FormMessage className="text-xs" />
                            </div>
                          )}
                          {!fieldState.error && field.value && (
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Número gerado com sucesso
                            </p>
                          )}
                          {!fieldState.error && !field.value && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              O número será gerado automaticamente ao criar a devolução
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Prioridade
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                data-testid="select-priority" 
                                className={`h-10 ${
                                  fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                }`}
                              >
                                <SelectValue placeholder="Seleccione a prioridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">
                                <span className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Baixa
                                </span>
                              </SelectItem>
                              <SelectItem value="medium">
                                <span className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Média
                                </span>
                              </SelectItem>
                              <SelectItem value="high">
                                <span className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  Alta
                                </span>
                              </SelectItem>
                              <SelectItem value="urgent">
                                <span className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  Urgente
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldState.error && (
                            <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              <FormMessage className="text-xs" />
                            </div>
                          )}
                          {!fieldState.error && (
                            <FormMessage className="text-xs" />
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Tipo de Devolução *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              data-testid="select-return-type" 
                              className={`h-10 ${
                                fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : ''
                              }`}
                            >
                              <SelectValue placeholder="Seleccione o tipo de devolução" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="customer">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Devolução de Cliente
                              </div>
                            </SelectItem>
                            <SelectItem value="supplier">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Devolução a Fornecedor
                              </div>
                            </SelectItem>
                            <SelectItem value="internal">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Devolução Interna
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.error && (
                          <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <FormMessage className="text-xs" />
                          </div>
                        )}
                        {!fieldState.error && (
                          <FormMessage className="text-xs" />
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                {/* Seção 2: Informações do Cliente (condicional) */}
                {form.watch("type") === "customer" && (
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Informações do Cliente
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Dados do cliente e encomenda original
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="originalOrderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Encomenda Original</FormLabel>
                          <FormControl>
                            <OrderCombobox
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              onOrderSelect={(order) => {
                                if (order) {
                                  // Preencher automaticamente os dados do cliente usando os campos diretos da encomenda
                                  if (order.customerId) {
                                    form.setValue('customerId', order.customerId)
                                  }
                                  if (order.customerName) {
                                    form.setValue('customerName', order.customerName)
                                  }
                                  if (order.customerEmail) {
                                    form.setValue('customerEmail', order.customerEmail)
                                  }
                                  if (order.customerPhone) {
                                     form.setValue('customerPhone', order.customerPhone)
                                   }
                                   
                                   // Fallback para o objeto customer aninhado se os campos diretos não estiverem disponíveis
                                  if (!order.customerId && order.customer?.id) {
                                    form.setValue('customerId', order.customer.id)
                                  }
                                  if (!order.customerName && order.customer?.name) {
                                    form.setValue('customerName', order.customer.name)
                                  }
                                  if (!order.customerEmail && order.customer?.email) {
                                    form.setValue('customerEmail', order.customer.email)
                                  }
                                  if (!order.customerPhone && order.customer?.phone) {
                                    form.setValue('customerPhone', order.customer.phone)
                                  }
                                }
                              }}
                              placeholder="Pesquisar encomenda..."
                              orderType="sale"
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerId"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <User className="w-4 h-4" />
                              ID do Cliente *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="CUST-001" 
                                {...field} 
                                data-testid="input-customer-id"
                                className={`h-10 ${
                                  fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                }`}
                              />
                            </FormControl>
                            {fieldState.error && (
                              <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                <FormMessage className="text-xs" />
                              </div>
                            )}
                            {!fieldState.error && (
                              <FormMessage className="text-xs" />
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Nome do Cliente *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="João Silva" 
                                {...field} 
                                data-testid="input-customer-name"
                                className={`h-10 ${
                                  fieldState.error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : ''
                                }`}
                              />
                            </FormControl>
                            {fieldState.error && (
                              <div className="flex items-center mt-1 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                <FormMessage className="text-xs" />
                              </div>
                            )}
                            {!fieldState.error && (
                              <FormMessage className="text-xs" />
                            )}
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Email do Cliente</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="joao@exemplo.com" 
                                {...field} 
                                data-testid="input-customer-email"
                                className="h-10"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Telefone do Cliente</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+244 900 000 000" 
                                {...field} 
                                data-testid="input-customer-phone"
                                className="h-10"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Seção 3: Informações do Fornecedor (condicional) */}
                {form.watch("type") === "supplier" && (
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Informações do Fornecedor
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Seleccione o fornecedor para esta devolução
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Fornecedor *</FormLabel>
                          <FormControl>
                            <SupplierCombobox
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              placeholder="Pesquisar fornecedor..."
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Seção 4: Detalhes da Devolução */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Detalhes da Devolução
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Informações sobre o motivo e condição dos produtos
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Motivo da Devolução *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-reason" className="h-10">
                                <SelectValue placeholder="Seleccione o motivo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="damaged">💥 Produto danificado</SelectItem>
                              <SelectItem value="wrong_item">❌ Item errado</SelectItem>
                              <SelectItem value="defective">⚠️ Produto defeituoso</SelectItem>
                              <SelectItem value="excess">📦 Excesso de stock</SelectItem>
                              <SelectItem value="quality_issue">🔍 Problema de qualidade</SelectItem>
                              <SelectItem value="not_as_described">📝 Não conforme descrição</SelectItem>
                              <SelectItem value="customer_change_mind">💭 Cliente mudou de opinião</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Condição do Produto *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-condition" className="h-10">
                                <SelectValue placeholder="Seleccione a condição" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">✨ Novo</SelectItem>
                              <SelectItem value="used">🔄 Usado</SelectItem>
                              <SelectItem value="damaged">💥 Danificado</SelectItem>
                              <SelectItem value="defective">⚠️ Defeituoso</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="refundMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Método de Reembolso *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-refund-method" className="h-10">
                              <SelectValue placeholder="Seleccione o método de reembolso" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">💰 Dinheiro</SelectItem>
                            <SelectItem value="credit">💳 Crédito na conta</SelectItem>
                            <SelectItem value="store_credit">🏪 Crédito da loja</SelectItem>
                            <SelectItem value="exchange">🔄 Troca</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Seção 5: Observações */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Observações e Notas
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Informações adicionais sobre a devolução
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Observações Gerais</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detalhes adicionais sobre a devolução, contexto, ou informações relevantes..." 
                              {...field} 
                              data-testid="textarea-notes"
                              className="min-h-[80px] resize-none"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="inspectionNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Notas de Inspeção</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações detalhadas sobre a inspeção do produto, estado físico, funcionalidade..." 
                              {...field} 
                              data-testid="textarea-inspection-notes"
                              className="min-h-[80px] resize-none"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                    className="h-10 px-6"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReturnMutation.isPending}
                    data-testid="button-submit"
                    className="h-10 px-6 bg-primary hover:bg-primary/90"
                  >
                    {createReturnMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        A processar...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Criar Devolução
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Visualização de Devolução */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Devolução</DialogTitle>
              <DialogDescription>
                Visualize todas as informações detalhadas desta devolução
              </DialogDescription>
            </DialogHeader>
            {selectedReturn && (
              <div className="space-y-6">
                {/* Cabeçalho da Devolução */}
                <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{selectedReturn.returnNumber}</h3>
                      {selectedReturn.priority && (
                        <Badge variant={getPriorityColor(selectedReturn.priority)}>
                          {getPriorityLabel(selectedReturn.priority)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedReturn.status)}
                      {getTypeBadge(selectedReturn.type)}
                      {getConditionBadge(selectedReturn.condition)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-lg font-semibold">{formatCurrency(selectedReturn.totalAmount || 0)}</div>
                    {selectedReturn.refundAmount && (
                      <div className="text-sm text-muted-foreground">
                        Reembolso: {formatCurrency(selectedReturn.refundAmount)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações do Cliente/Fornecedor */}
                {(selectedReturn.customerName || selectedReturn.supplier) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">
                      {selectedReturn.type === 'customer' ? 'Informações do Cliente' : 
                       selectedReturn.type === 'supplier' ? 'Informações do Fornecedor' : 
                       'Informações'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                      {selectedReturn.customerName && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Nome:</span>
                          <p className="text-sm">{selectedReturn.customerName}</p>
                        </div>
                      )}
                      {selectedReturn.customerEmail && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Email:</span>
                          <p className="text-sm">{selectedReturn.customerEmail}</p>
                        </div>
                      )}
                      {selectedReturn.customerPhone && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Telefone:</span>
                          <p className="text-sm">{selectedReturn.customerPhone}</p>
                        </div>
                      )}
                      {selectedReturn.supplier && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Fornecedor:</span>
                          <p className="text-sm">{selectedReturn.supplier.name}</p>
                        </div>
                      )}
                      {selectedReturn.originalOrder && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Encomenda Original:</span>
                          <p className="text-sm">{selectedReturn.originalOrder.orderNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Motivo e Condição */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Detalhes da Devolução</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Motivo:</span>
                      <p className="text-sm">{selectedReturn.reason}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Condição:</span>
                      <p className="text-sm">{selectedReturn.condition}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Método de Reembolso:</span>
                      <p className="text-sm">{selectedReturn.refundMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Produtos Devolvidos */}
                {selectedReturn.returnItems && selectedReturn.returnItems.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Produtos Devolvidos</h4>
                    <div className="space-y-2">
                      {selectedReturn.returnItems.map((item: ReturnItem) => (
                        <div key={item.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{item.product?.name || 'Produto não identificado'}</span>
                              <Badge variant="outline">{item.product?.sku || 'N/A'}</Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(item.refundAmount || 0)}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatCurrency(item.unitPrice || 0)} × {item.quantity || 0}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Quantidade:</span>
                              <p>{item.quantity || 0}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Condição:</span>
                              <p>{item.condition}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Restituível:</span>
                              <p>{item.restockable ? 'Sim' : 'Não'}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Restituído:</span>
                              <p>{item.restocked ? 'Sim' : 'Não'}</p>
                            </div>
                          </div>
                          {item.qualityNotes && (
                            <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                              <span className="font-medium text-muted-foreground">Notas de Qualidade:</span>
                              <p className="mt-1">{item.qualityNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {(selectedReturn.notes || selectedReturn.inspectionNotes) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Observações</h4>
                    <div className="space-y-3">
                      {selectedReturn.notes && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Observações Gerais:</span>
                          <p className="text-sm mt-1">{selectedReturn.notes}</p>
                        </div>
                      )}
                      {selectedReturn.inspectionNotes && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-sm font-medium text-muted-foreground">Notas de Inspeção:</span>
                          <p className="text-sm mt-1">{selectedReturn.inspectionNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Histórico */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">Histórico</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                      <span>Criada por {selectedReturn.user?.username || 'N/A'}</span>
                      <span>{new Date(selectedReturn.createdAt).toLocaleString('pt-AO')}</span>
                    </div>
                    {selectedReturn.approvedAt && (
                      <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                        <span>Aprovada{selectedReturn.approvedBy ? ` por ${selectedReturn.approvedBy.username}` : ''}</span>
                        <span>{new Date(selectedReturn.approvedAt).toLocaleString('pt-AO')}</span>
                      </div>
                    )}
                    {selectedReturn.processedAt && (
                      <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                        <span>Processada{selectedReturn.processedBy ? ` por ${selectedReturn.processedBy.username}` : ''}</span>
                        <span>{new Date(selectedReturn.processedAt).toLocaleString('pt-AO')}</span>
                      </div>
                    )}
                    {selectedReturn.updatedAt && selectedReturn.updatedAt !== selectedReturn.createdAt && (
                      <div className="flex items-center justify-between p-2 bg-muted/20 rounded text-sm">
                        <span>Última atualização</span>
                        <span>{new Date(selectedReturn.updatedAt).toLocaleString('pt-AO')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  {selectedReturn.status === 'pending' && (
                    <Button 
                      onClick={() => {
                        approveReturnMutation.mutate(selectedReturn.id);
                        setIsViewDialogOpen(false);
                      }}
                      disabled={approveReturnMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar
                    </Button>
                  )}
                  {selectedReturn.status === 'approved' && (
                    <Button 
                      onClick={() => {
                        processReturnMutation.mutate(selectedReturn.id);
                        setIsViewDialogOpen(false);
                      }}
                      disabled={processReturnMutation.isPending}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Processar
                    </Button>
                  )}
                  {selectedReturn.status === 'processing' && (
                    <Button 
                      onClick={() => {
                        completeReturnMutation.mutate(selectedReturn.id);
                        setIsViewDialogOpen(false);
                      }}
                      disabled={completeReturnMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Concluir
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Todas ({stats.total || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Pendentes ({stats.pending || 0})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovadas ({stats.approved || 0})
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Em Processamento ({stats.processing || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Concluídas ({stats.completed || 0})
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
                {paginatedReturns.map((returnItem: Return) => (
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
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground" data-testid={`return-number-${returnItem.id}`}>
                              {returnItem.returnNumber}
                            </h3>
                            {returnItem.priority && (
                              <Badge 
                                variant={getPriorityColor(returnItem.priority)}
                                className="text-xs"
                              >
                                {getPriorityLabel(returnItem.priority)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{returnItem.reason}</span>
                            {returnItem.originalOrder && (
                              <>
                                <span>•</span>
                                <span>Encomenda: {returnItem.originalOrder?.orderNumber}</span>
                              </>
                            )}
                            {returnItem.supplier && (
                              <>
                                <span>•</span>
                                <span>Fornecedor: {returnItem.supplier?.name}</span>
                              </>
                            )}
                          </div>
                          {(returnItem.customerName || returnItem.customerEmail || returnItem.customerPhone) && (
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                              <User className="w-3 h-3" />
                              {returnItem.customerName && <span>{returnItem.customerName}</span>}
                              {returnItem.customerEmail && (
                                <>
                                  {returnItem.customerName && <span>•</span>}
                                  <span>{returnItem.customerEmail}</span>
                                </>
                              )}
                              {returnItem.customerPhone && (
                                <>
                                  {(returnItem.customerName || returnItem.customerEmail) && <span>•</span>}
                                  <span>{returnItem.customerPhone}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(returnItem.status)}
                        {getTypeBadge(returnItem.type)}
                        {getConditionBadge(returnItem.condition)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Total:</span> {formatCurrency(returnItem.totalAmount || 0)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Items:</span> {returnItem.returnItems?.length || 0}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <span className="font-medium">Criado por:</span> {returnItem.user?.username || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {(returnItem.returnItems?.length || 0) > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Produtos Devolvidos</h4>
                        <div className="grid gap-2">
                          {returnItem.returnItems?.slice(0, 3).map((item: ReturnItem) => (
                            <div 
                              key={item.id} 
                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                              data-testid={`return-item-product-${item.id}`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{item.product?.name || 'Produto não identificado'}</span>
                                <span className="text-xs text-muted-foreground">({item.product?.sku || 'N/A'})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">Qtd: {item.quantity || 0}</Badge>
                                <Badge variant="secondary">{formatCurrency(item.refundAmount || 0)}</Badge>
                                {item.restockable && (
                                  <Badge variant={item.restocked ? "default" : "outline"}>
                                    {item.restocked ? "Restocked" : "A restituir"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                          {(returnItem.returnItems?.length || 0) > 3 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{(returnItem.returnItems?.length || 0) - 3} mais produtos...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notas e informações adicionais */}
                    {(returnItem.notes || returnItem.inspectionNotes) && (
                      <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                        {returnItem.notes && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Observações:</span>
                            <p className="text-sm text-foreground mt-1">{returnItem.notes}</p>
                          </div>
                        )}
                        {returnItem.inspectionNotes && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Notas de Inspeção:</span>
                            <p className="text-sm text-foreground mt-1">{returnItem.inspectionNotes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Criada: {new Date(returnItem.createdAt).toLocaleString('pt-AO')} por {returnItem.user?.username || 'N/A'}</div>
                        {returnItem.approvedAt && (
                          <div>Aprovada: {new Date(returnItem.approvedAt).toLocaleString('pt-AO')}
                            {returnItem.approvedBy && ` por ${returnItem.approvedBy.username}`}
                          </div>
                        )}
                        {returnItem.processedAt && (
                          <div>Processada: {new Date(returnItem.processedAt).toLocaleString('pt-AO')}
                            {returnItem.processedBy && ` por ${returnItem.processedBy.username}`}
                          </div>
                        )}
                        {returnItem.updatedAt && returnItem.updatedAt !== returnItem.createdAt && (
                          <div>Atualizada: {new Date(returnItem.updatedAt).toLocaleString('pt-AO')}</div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewReturn(returnItem)}
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
                        {returnItem.status === 'processing' && (
                          <Button 
                            size="sm"
                            onClick={() => completeReturnMutation.mutate(returnItem.id)}
                            disabled={completeReturnMutation.isPending}
                            data-testid={`complete-return-${returnItem.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {paginatedReturns.length === 0 && (
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
            
            {/* Paginação */}
            {filteredReturns.length > 0 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Itens por página:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
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
                     Página {pagination.page} de {pagination.totalPages} ({filteredReturns.length} devoluções)
                   </span>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}