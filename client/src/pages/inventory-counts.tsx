import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInventoryCounts } from "@/hooks/api/use-inventory-counts";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Plus, ClipboardList, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, User, Package, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";
import { WarehouseCombobox } from "@/components/ui/warehouse-combobox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

const inventoryCountSchema = z.object({
  name: z.string()
    .min(1, "Nome da contagem é obrigatório")
    .min(3, "Nome da contagem deve ter pelo menos 3 caracteres")
    .max(50, "Nome da contagem deve ter no máximo 50 caracteres"),
  type: z.enum(["cycle", "full", "spot"], {
    required_error: "Tipo de contagem é obrigatório",
    invalid_type_error: "Selecione um tipo de contagem válido",
  }),
  warehouseId: z.string()
    .min(1, "Armazém é obrigatório")
    .uuid("Selecione um armazém válido"),
  scheduledDate: z.string()
    .min(1, "Data programada é obrigatória")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "A data programada deve ser hoje ou no futuro"),
  notes: z.string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .optional(),
}) as z.ZodType<any>;

interface InventoryCount {
  id: string;
  name: string;
  warehouseId: string;
  warehouseName: string;
  type: 'full' | 'cycle' | 'spot';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  assignedTo: string[];
  discrepancies: number;
  accuracy: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export default function InventoryCountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof inventoryCountSchema>>({
    resolver: zodResolver(inventoryCountSchema as any),
    mode: "onChange", // Validação em tempo real
    defaultValues: {
      countNumber: "",
      type: "cycle",
      warehouseId: "",
      scheduledDate: "",
      notes: "",
    },
  });

  // Auto-gerar número da contagem quando o diálogo abre
  useEffect(() => {
    if (isDialogOpen && !form.getValues("countNumber")) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
      const autoNumber = `CNT-${year}${month}${day}-${time}`;
      form.setValue("countNumber", autoNumber);
    }
  }, [isDialogOpen, form]);

  // Definir data padrão para hoje
  useEffect(() => {
    if (isDialogOpen && !form.getValues("scheduledDate")) {
      const today = new Date();
      const todayString = today.toISOString().slice(0, 16); // formato datetime-local
      form.setValue("scheduledDate", todayString);
    }
  }, [isDialogOpen, form]);

  // Construir parâmetros de consulta
  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
    };
  }, [currentPage, itemsPerPage]);

  // Get inventory counts with pagination
  const { data: countsResponse, isLoading } = useInventoryCounts(queryParams);
  
  // Extrair dados da resposta
  const counts = countsResponse?.data || [];
  const pagination = countsResponse?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };

  // Get warehouses for form
  const { data: warehouses } = useQuery({
    queryKey: ['/api/warehouses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/warehouses');
      const result = await response.json();
      // Garantir que sempre retornamos um array
      return (result.data || []) as Warehouse[];
    }
  });

  // Create count mutation
  const createCountMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inventoryCountSchema>) => {
      // Gerar countNumber baseado no nome e timestamp
      const countNumber = `${data.name.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`;
      
      // Converter scheduledDate para formato ISO datetime
      const scheduledDateISO = data.scheduledDate ? new Date(data.scheduledDate).toISOString() : undefined;
      
      const response = await apiRequest('POST', '/api/inventory-counts', {
         ...data,
         countNumber,
         scheduledDate: scheduledDateISO,
         userId: user?.id || 'anonymous-user'
       });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-counts'] });
      toast({
        title: "Contagem criada com sucesso!",
        description: "A contagem de inventário foi criada.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar contagem",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: z.infer<typeof inventoryCountSchema>) => {
    createCountMutation.mutate(data);
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "cycle":
        return "Cíclica";
      case "full":
        return "Completa";
      case "spot":
        return "Pontual";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Contagens de Inventário" breadcrumbs={["Contagens de Inventário"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir contagens cíclicas e completas do inventário
          </p>
        
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-count-button">
                <Plus className="w-4 h-4 mr-2" />
                Nova Contagem
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Nova Contagem de Inventário
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Configure uma nova contagem para controlar e verificar o inventário do armazém selecionado.
                  </DialogDescription>
              </div>
            </div>
            {/* Indicador de progresso do formulário */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progresso do formulário</span>
                <span>{Math.round(((form.watch("name") ? 1 : 0) + 
                                  (form.watch("type") ? 1 : 0) + 
                                  (form.watch("warehouseId") ? 1 : 0) + 
                                  (form.watch("scheduledDate") ? 1 : 0)) / 4 * 100)}%</span>
              </div>
              <Progress 
                value={((form.watch("name") ? 1 : 0) + 
                        (form.watch("type") ? 1 : 0) + 
                        (form.watch("warehouseId") ? 1 : 0) + 
                        (form.watch("scheduledDate") ? 1 : 0)) / 4 * 100} 
                className="h-2"
              />
            </div>
          </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ClipboardList className="h-4 w-4" />
                      Informações Básicas
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <ClipboardList className="h-4 w-4" />
                              Nome da Contagem *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Contagem Mensal Janeiro" 
                                {...field} 
                                data-testid="input-count-name"
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
                            <FormLabel className="flex items-center gap-2">
                              Tipo de Contagem *
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-xs">
                                      <strong>Cíclica:</strong> Contagem regular programada<br/>
                                      <strong>Completa:</strong> Contagem completa do inventário<br/>
                                      <strong>Pontual:</strong> Contagem pontual de itens específicos
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-count-type">
                                  <SelectValue placeholder="Seleccione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cycle">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    Contagem Cíclica
                                  </div>
                                </SelectItem>
                                <SelectItem value="full">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    Contagem Completa
                                  </div>
                                </SelectItem>
                                <SelectItem value="spot">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                    Contagem Pontual
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Localização */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Localização
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Armazém *</FormLabel>
                          <FormControl>
                            <WarehouseCombobox
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Pesquise e selecione um armazém..."
                              data-testid="select-warehouse"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Programação e Observações */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Programação e Detalhes
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduledDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Programada</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field} 
                                data-testid="input-scheduled-date"
                              />
                            </FormControl>
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
                                placeholder="Adicione observações sobre a contagem..." 
                                className="min-h-[100px] resize-none"
                                {...field} 
                                data-testid="textarea-notes"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              Opcional: Detalhes adicionais sobre a contagem
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      form.reset();
                      setIsDialogOpen(false);
                    }}
                    className="sm:w-auto w-full"
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCountMutation.isPending || !form.formState.isValid}
                    className="sm:w-auto w-full"
                    data-testid="button-submit"
                  >
                    {createCountMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Contagem
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-4 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Contagem
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Armazém
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Programada
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Responsável
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {counts && counts.length > 0 ? (
                  counts.map((count) => (
                    <tr 
                      key={count.id} 
                      className="table-hover border-b border-border last:border-0"
                      data-testid={`count-row-${count.id}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground" data-testid={`count-name-${count.id}`}>
                              {count.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Criada: {new Date(count.createdAt).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" data-testid={`count-type-${count.id}`}>
                          {getTypeLabel(count.type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground" data-testid={`warehouse-name-${count.id}`}>
                            {count.warehouseName || 'Armazém não encontrado'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4" data-testid={`count-status-${count.id}`}>
                        {getStatusBadge(count.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {count.scheduledDate ? (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(count.scheduledDate).toLocaleDateString('pt-PT')}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {count.createdBy ? (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{count.createdBy}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`view-count-${count.id}`}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Nenhuma contagem encontrada</p>
                      <p className="text-sm">Crie uma nova contagem de inventário para começar</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginação */}
        {countsResponse && counts.length > 0 && (
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
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} contagens)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNumber = i + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                {pagination.totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === pagination.totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage >= pagination.totalPages}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}