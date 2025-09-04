import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  Package, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Archive,
  RotateCcw,
  MapPin
} from "lucide-react";
import { z } from "zod";

// Form schema for batch management (compatible with form inputs)
const batchSchema = z.object({
  batchNumber: z.string().min(1, "Número do lote é obrigatório"),
  productId: z.string().min(1, "Produto é obrigatório"),
  warehouseId: z.string().min(1, "Armazém é obrigatório"),
  manufacturingDate: z.string().min(1, "Data de fabrico é obrigatória"),
  expiryDate: z.string().min(1, "Data de validade é obrigatória"),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  supplierBatchRef: z.string().optional(),
  qualityStatus: z.enum(["pending", "approved", "rejected", "quarantine"]),
  notes: z.string().optional(),
});

// Tipo inferido do schema
type BatchFormData = z.infer<typeof batchSchema>;

interface Batch {
  id: string;
  batchNumber: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  remainingQuantity: number;
  supplierBatchRef?: string;
  qualityStatus: "pending" | "approved" | "rejected" | "quarantine";
  status: "active" | "consumed" | "expired" | "recalled";
  notes?: string;
  fifoPosition: number;
  daysToExpiry: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BatchManagementPage() {
  const [activeTab, setActiveTab] = useState("batches");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("fifo");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchNumber: "",
      productId: "",
      warehouseId: "",
      manufacturingDate: "",
      expiryDate: "",
      quantity: 1,
      supplierBatchRef: "",
      qualityStatus: "pending" as const,
      notes: "",
    },
  });

  // Get batches with FIFO sorting
  const { data: batches, isLoading } = useQuery({
    queryKey: ['/api/batches', { sortBy, filterStatus }],
    queryFn: async () => {
      // Demo data with FIFO/FEFO logic
      const currentDate = new Date();
      const mockBatches: Batch[] = [
        {
          id: 'batch-001',
          batchNumber: 'BTH-2025-001',
          product: { id: '1', name: 'Smartphone Samsung Galaxy A54', sku: 'SPH-001' },
          warehouse: { id: 'wh-001', name: 'Armazém Principal' },
          manufacturingDate: '2024-11-15',
          expiryDate: '2025-11-15',
          quantity: 100,
          remainingQuantity: 85,
          qualityStatus: 'approved',
          status: 'active',
          fifoPosition: 1,
          daysToExpiry: Math.floor((new Date('2025-11-15').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          location: 'A1-B2-C3',
          createdAt: '2024-11-15T10:00:00Z',
          updatedAt: '2025-01-15T14:30:00Z',
        },
        {
          id: 'batch-002',
          batchNumber: 'BTH-2025-002',
          product: { id: '1', name: 'Smartphone Samsung Galaxy A54', sku: 'SPH-001' },
          warehouse: { id: 'wh-001', name: 'Armazém Principal' },
          manufacturingDate: '2024-12-01',
          expiryDate: '2025-12-01',
          quantity: 150,
          remainingQuantity: 150,
          qualityStatus: 'approved',
          status: 'active',
          fifoPosition: 2,
          daysToExpiry: Math.floor((new Date('2025-12-01').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
          location: 'A1-B2-C4',
          createdAt: '2024-12-01T10:00:00Z',
          updatedAt: '2024-12-01T10:00:00Z',
        },
      ];

      // Apply FIFO/FEFO sorting
      if (sortBy === 'fifo') {
        return mockBatches.sort((a, b) => a.fifoPosition - b.fifoPosition);
      } else if (sortBy === 'fefo') {
        return mockBatches.sort((a, b) => a.daysToExpiry - b.daysToExpiry);
      }
      
      return mockBatches;
    }
  });

  // Get products for form
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<Array<{ id: string; name: string; sku: string; }>>;
    }
  });

  // Get warehouses for form
  const { data: warehouses } = useQuery({
    queryKey: ['/api/warehouses'],
    queryFn: async () => {
      const response = await fetch('/api/warehouses');
      if (!response.ok) throw new Error('Failed to fetch warehouses');
      return response.json() as Promise<Array<{ id: string; name: string; }>>;
    }
  });

  // Create batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async (data: BatchFormData) => {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: user?.id || 'anonymous-user'
        })
      });
      if (!response.ok) throw new Error('Failed to create batch');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/batches'] });
      toast({
        title: "Lote criado com sucesso!",
        description: "O lote foi registado no sistema com posição FIFO automática.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: BatchFormData) => {
    createBatchMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case "consumed":
        return <Badge variant="secondary"><Archive className="w-3 h-3 mr-1" />Consumido</Badge>;
      case "expired":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expirado</Badge>;
      case "recalled":
        return <Badge variant="destructive"><RotateCcw className="w-3 h-3 mr-1" />Recolhido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "approved":
        return <Badge variant="default" className="bg-green-600">Aprovado</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>;
      case "quarantine":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Quarentena</Badge>;
      default:
        return <Badge variant="outline">{quality}</Badge>;
    }
  };

  const getExpiryBadge = (daysToExpiry: number) => {
    if (daysToExpiry < 0) {
      return <Badge variant="destructive">Expirado</Badge>;
    } else if (daysToExpiry <= 7) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />{daysToExpiry}d</Badge>;
    } else if (daysToExpiry <= 30) {
      return <Badge variant="secondary"><Calendar className="w-3 h-3 mr-1" />{daysToExpiry}d</Badge>;
    } else {
      return <Badge variant="outline">{daysToExpiry}d</Badge>;
    }
  };

  const filteredBatches = batches?.filter(batch => {
    const matchesSearch = 
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && batch.status === filterStatus;
  }) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Gestão de Lotes
          </h1>
          <p className="text-muted-foreground mt-2">
            Controlo FIFO/FEFO, rastreamento de validade e gestão de lotes
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lotes Ativos</p>
              <p className="text-2xl font-bold text-foreground" data-testid="active-batches">
                {filteredBatches.filter(b => b.status === 'active').length}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% vs mês anterior
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Próximos do Vencimento</p>
              <p className="text-2xl font-bold text-foreground" data-testid="expiring-batches">
                {filteredBatches.filter(b => b.daysToExpiry <= 30).length}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Próximos 30 dias
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rotatividade Média</p>
              <p className="text-2xl font-bold text-foreground" data-testid="average-turnover">
                45d
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                -3d vs mês anterior
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa FIFO</p>
              <p className="text-2xl font-bold text-foreground" data-testid="fifo-compliance">
                98.2%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +1.2% vs mês anterior
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Procurar por lote, produto, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-batches"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="consumed">Consumido</SelectItem>
            <SelectItem value="expired">Expirado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]" data-testid="sort-method">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fifo">FIFO</SelectItem>
            <SelectItem value="fefo">FEFO</SelectItem>
            <SelectItem value="expiry">Validade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="batches" data-testid="tab-batches">
            <Package className="w-4 h-4 mr-2" />
            Lotes
          </TabsTrigger>
          <TabsTrigger value="expiry" data-testid="tab-expiry">
            <Calendar className="w-4 h-4 mr-2" />
            Controlo de Validade
          </TabsTrigger>
        </TabsList>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="add-batch-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Novo Lote</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="batchNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do Lote</FormLabel>
                            <FormControl>
                              <Input placeholder="BTH-2025-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produto</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar produto" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products?.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
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
                        name="warehouseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Armazém</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar armazém" />
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="manufacturingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Fabrico</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Validade</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createBatchMutation.isPending}>
                        {createBatchMutation.isPending ? "A criar..." : "Criar Lote"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Batches List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8">A carregar lotes...</div>
            ) : (
              filteredBatches.map((batch) => (
                <Card key={batch.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground" data-testid={`batch-${batch.id}`}>
                          {batch.batchNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {batch.product.name} ({batch.product.sku})
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {batch.warehouse.name} - {batch.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {batch.remainingQuantity}/{batch.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          FIFO #{batch.fifoPosition}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(batch.status)}
                        {getQualityBadge(batch.qualityStatus)}
                      </div>
                      <div className="flex flex-col space-y-1">
                        {getExpiryBadge(batch.daysToExpiry)}
                        <div className="text-xs text-muted-foreground">
                          Val: {new Date(batch.expiryDate).toLocaleDateString('pt-AO')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Expiry Control Tab */}
        <TabsContent value="expiry" className="space-y-4">
          <div className="grid gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Alertas de Validade</h3>
              <div className="space-y-3">
                {filteredBatches
                  .filter(batch => batch.daysToExpiry <= 30)
                  .map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{batch.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Lote: {batch.batchNumber} | Validade: {new Date(batch.expiryDate).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getExpiryBadge(batch.daysToExpiry)}
                        <Button variant="outline" size="sm">
                          Ação
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}