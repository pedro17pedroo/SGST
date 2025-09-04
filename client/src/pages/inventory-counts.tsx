import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { Plus, ClipboardList, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, User, Package } from "lucide-react";
import { z } from "zod";

const inventoryCountSchema = z.object({
  countNumber: z.string().min(1, "Número da contagem é obrigatório"),
  type: z.enum(["cycle", "full", "spot"]),
  warehouseId: z.string().min(1, "Armazém é obrigatório"),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
}) as z.ZodType<any>;

interface InventoryCount {
  id: string;
  countNumber: string;
  type: string;
  status: string;
  warehouse?: {
    id: string;
    name: string;
  } | null;
  user?: {
    id: string;
    username: string;
  } | null;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
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
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof inventoryCountSchema>>({
    resolver: zodResolver(inventoryCountSchema as any),
    defaultValues: {
      countNumber: "",
      type: "cycle",
      warehouseId: "",
      scheduledDate: "",
      notes: "",
    },
  });

  // Get inventory counts
  const { data: counts, isLoading } = useQuery({
    queryKey: ['/api/inventory-counts'],
    queryFn: async () => {
      const response = await fetch('/api/inventory-counts');
      if (!response.ok) throw new Error('Failed to fetch inventory counts');
      return response.json() as Promise<InventoryCount[]>;
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

  // Create count mutation
  const createCountMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inventoryCountSchema>) => {
      const response = await fetch('/api/inventory-counts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userId: user?.id || 'anonymous-user'
        })
      });
      if (!response.ok) throw new Error('Failed to create inventory count');
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Contagem de Inventário</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="countNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da Contagem</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="CNT-2025-001" 
                          {...field} 
                          data-testid="input-count-number"
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
                      <FormLabel>Tipo de Contagem</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-count-type">
                            <SelectValue placeholder="Seleccione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cycle">Contagem Cíclica</SelectItem>
                          <SelectItem value="full">Contagem Completa</SelectItem>
                          <SelectItem value="spot">Contagem Pontual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Armazém</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-warehouse">
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
                          placeholder="Observações sobre a contagem..." 
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
                    disabled={createCountMutation.isPending}
                    data-testid="button-submit"
                  >
                    Criar Contagem
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
                            <p className="text-sm font-medium text-foreground" data-testid={`count-number-${count.id}`}>
                              {count.countNumber}
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
                            {count.warehouse?.name || 'Armazém não encontrado'}
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
                        {count.user ? (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{count.user.username}</span>
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
      </Card>
      </div>
    </div>
  );
}