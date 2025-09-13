import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Building2, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";


// Schema de validação para transportadoras
const carrierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  type: z.enum(["internal", "external"], {
    required_error: "Tipo é obrigatório",
  }),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type CarrierFormData = z.infer<typeof carrierSchema>;

interface Carrier {
  id: string;
  name: string;
  code: string;
  type: "internal" | "external";
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CarriersResponse {
  carriers: Carrier[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const initialFormData: CarrierFormData = {
  name: "",
  code: "",
  type: "external" as const,
  email: "",
  phone: "",
  address: "",
  contactPerson: "",
  notes: "",
  isActive: true,
};

function CarrierDialog({ 
  trigger, 
  carrier, 
  onSuccess 
}: { 
  trigger: React.ReactNode; 
  carrier?: Carrier; 
  onSuccess?: () => void; 
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isEditing = !!carrier;

  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierSchema),
    defaultValues: carrier ? {
      name: carrier.name,
      code: carrier.code,
      type: carrier.type,
      email: carrier.email || "",
      phone: carrier.phone || "",
      address: carrier.address || "",
      contactPerson: carrier.contactPerson || "",
      notes: carrier.notes || "",
      isActive: carrier.isActive,
    } : initialFormData,
  });

  const createMutation = useMutation({
    mutationFn: (data: CarrierFormData) => apiRequest("POST", "/api/carriers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({
        title: "Sucesso",
        description: "Transportadora criada com sucesso",
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar transportadora",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CarrierFormData) => apiRequest("PUT", `/api/carriers/${carrier?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({
        title: "Sucesso",
        description: "Transportadora atualizada com sucesso",
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar transportadora",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CarrierFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (open && carrier) {
      form.reset({
        name: carrier.name,
        code: carrier.code,
        type: carrier.type,
        email: carrier.email || "",
        phone: carrier.phone || "",
        address: carrier.address || "",
        contactPerson: carrier.contactPerson || "",
        notes: carrier.notes || "",
        isActive: carrier.isActive,
      });
    } else if (open && !carrier) {
      form.reset(initialFormData);
    }
  }, [open, carrier, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transportadora" : "Nova Transportadora"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize as informações da transportadora" 
              : "Adicione uma nova transportadora ao sistema"
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da transportadora" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código *</FormLabel>
                    <FormControl>
                      <Input placeholder="Código único" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="internal">Interna</SelectItem>
                        <SelectItem value="external">Externa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pessoa de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contacto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+244 xxx xxx xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo da transportadora" 
                      className="resize-none" 
                      {...field} 
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
                      placeholder="Observações adicionais" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Ativa</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Transportadora ativa no sistema
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? "Guardando..." 
                  : isEditing ? "Atualizar" : "Criar"
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function CarrierCard({ carrier }: { carrier: Carrier }) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/carriers/${carrier.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carriers"] });
      toast({
        title: "Sucesso",
        description: "Transportadora eliminada com sucesso",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar transportadora",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja eliminar esta transportadora?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{carrier.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={carrier.type === "internal" ? "default" : "outline"}>
                  {carrier.type === "internal" ? "Interna" : "Externa"}
                </Badge>
                <Badge variant={carrier.isActive ? "default" : "secondary"}>
                  {carrier.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <CarrierDialog
              trigger={
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              }
              carrier={carrier}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <span className="font-medium w-16">Código:</span>
            <span>{carrier.code}</span>
          </div>
          {carrier.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="w-4 h-4 mr-2" />
              <span>{carrier.email}</span>
            </div>
          )}
          {carrier.phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              <span>{carrier.phone}</span>
            </div>
          )}
          {carrier.contactPerson && (
            <div className="flex items-center text-muted-foreground">
              <span className="font-medium w-16">Contacto:</span>
              <span>{carrier.contactPerson}</span>
            </div>
          )}
          {carrier.address && (
            <div className="text-muted-foreground">
              <span className="font-medium">Endereço:</span>
              <p className="mt-1 text-xs">{carrier.address}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Carriers() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const { data: carriersResponse, isLoading, error } = useQuery({
    queryKey: ["/api/carriers", { page: currentPage, limit: itemsPerPage, search, type: typeFilter, status: statusFilter }],
    queryFn: async (): Promise<CarriersResponse> => {
      const response = await apiRequest("GET", `/api/carriers?page=${currentPage}&limit=${itemsPerPage}&search=${search}&type=${typeFilter}&status=${statusFilter}`);
      return await response.json();
    },
  });

  const carriers = carriersResponse?.carriers || [];
  const pagination = carriersResponse ? {
    total: carriersResponse.totalCount,
    page: carriersResponse.currentPage,
    limit: itemsPerPage,
    totalPages: carriersResponse.totalPages,
  } : null;

  // Filtrar transportadoras localmente também
  const filteredCarriers = carriers.filter((carrier: Carrier) => {
    const matchesSearch = search === "" || 
      carrier.name.toLowerCase().includes(search.toLowerCase()) ||
      carrier.code.toLowerCase().includes(search.toLowerCase()) ||
      (carrier.email && carrier.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = typeFilter === "all" || carrier.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && carrier.isActive) ||
      (statusFilter === "inactive" && !carrier.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Transportadoras" breadcrumbs={["Transportadoras"]} />
      
      <div className="px-6 py-4 space-y-6">
        {/* Filtros e Nova Transportadora */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Pesquisar por nome, código ou email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="internal">Interna</SelectItem>
                    <SelectItem value="external">Externa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="inactive">Inativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CarrierDialog
                trigger={
                  <Button className="w-full lg:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transportadora
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de transportadoras */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando transportadoras...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <h3 className="text-lg font-medium mb-2">Erro ao carregar transportadoras</h3>
              <p className="text-sm">{error.message}</p>
            </div>
          </div>
        ) : filteredCarriers.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma transportadora encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {search || typeFilter !== "all" || statusFilter !== "all"
                ? "Tente ajustar os filtros de pesquisa"
                : "Comece por adicionar a primeira transportadora"
              }
            </p>
            {!search && typeFilter === "all" && statusFilter === "all" && (
              <CarrierDialog
                trigger={
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transportadora
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCarriers.map((carrier: Carrier) => (
              <CarrierCard key={carrier.id} carrier={carrier} />
            ))}
          </div>
        )}

        {/* Paginação */}
        {pagination && (
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
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} transportadoras)
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
                disabled={currentPage === pagination.totalPages}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}