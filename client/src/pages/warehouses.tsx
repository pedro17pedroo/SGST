import { useState, useEffect, useMemo } from "react";
import { Plus, Search, MapPin, Package, Edit, Power, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState, LoadingComponents } from "@/components/ui/loading-state";
import { useForm } from "react-hook-form";
import { type Warehouse } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  useWarehouses, 
  useCreateWarehouse, 
  useUpdateWarehouse,
  useToggleWarehouseStatus 
} from "@/hooks/api/use-warehouses";

// Simple form data type without zod validation to avoid compatibility issues
type WarehouseFormData = {
  name: string;
  type: string;
  address?: string;
  isActive: boolean;
};

function WarehouseDialog({ warehouse, trigger }: { warehouse?: Warehouse; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
    
    const form = useForm<WarehouseFormData>({
    defaultValues: {
      name: "",
      address: "",
      isActive: true,
      type: "local",
    },
  });

  // Reset form values when warehouse changes
  useEffect(() => {
    if (warehouse) {
      form.reset({
        name: warehouse.name || "",
        address: warehouse.address || "",
        isActive: warehouse.isActive ?? true,
        type: warehouse.type as "central" | "regional" | "local" || "local",
      });
    } else {
      form.reset({
        name: "",
        address: "",
        isActive: true,
        type: "local",
      });
    }
  }, [warehouse, form]);

  const createWarehouseMutation = useCreateWarehouse();

  const handleCreateWarehouse = async (data: WarehouseFormData) => {
    try {
      await createWarehouseMutation.mutateAsync(data);
      setOpen(false);
      form.reset();
      toast({
        title: "Armazém criado",
        description: "O armazém foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o armazém.",
        variant: "destructive",
      });
    }
  };

  const updateWarehouseMutation = useUpdateWarehouse();

  const handleUpdateWarehouse = async (data: WarehouseFormData) => {
    if (!warehouse?.id) return;
    
    try {
      await updateWarehouseMutation.mutateAsync({ id: warehouse.id, data });
      setOpen(false);
      form.reset();
      toast({
        title: "Armazém atualizado",
        description: "O armazém foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o armazém.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: WarehouseFormData) => {
    // Basic validation
    if (!data.name || data.name.trim() === "") {
      toast({
        title: "Erro de validação",
        description: "Nome do armazém é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (warehouse) {
      handleUpdateWarehouse(data);
    } else {
      handleCreateWarehouse(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl" data-testid="dialog-warehouse">
        <DialogHeader>
          <DialogTitle>
            {warehouse ? "Editar Armazém" : "Novo Armazém"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Armazém</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Armazém Central Luanda" 
                        {...field} 
                        data-testid="input-warehouse-name"
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
                    <FormLabel>Tipo de Armazém</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-warehouse-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="regional">Regional</SelectItem>
                        <SelectItem value="local">Local</SelectItem>
                      </SelectContent>
                    </Select>
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
                      placeholder="Endereço completo do armazém"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-warehouse-address"
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
                    <FormLabel className="text-base">
                      Armazém Ativo
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Armazéns inativos não aparecem nas operações
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-warehouse-active"
                    />
                  </FormControl>
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
                disabled={createWarehouseMutation.isPending || updateWarehouseMutation.isPending}
                data-testid="button-save-warehouse"
              >
                {createWarehouseMutation.isPending || updateWarehouseMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function WarehouseCard({ warehouse }: { warehouse: Warehouse }) {
  const toggleStatusMutation = useToggleWarehouseStatus();

  const handleToggleActive = async () => {
    try {
      await toggleStatusMutation.mutateAsync(warehouse.id);
    } catch (error) {
      // O toast já é exibido pelo hook
    }
  };

  return (
    <Card className="h-full" data-testid={`card-warehouse-${warehouse.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg" data-testid={`text-warehouse-name-${warehouse.id}`}>
              {warehouse.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                {warehouse.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <WarehouseDialog
              warehouse={warehouse}
              trigger={
                <Button variant="ghost" size="sm" data-testid={`button-edit-${warehouse.id}`}>
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleActive}
              disabled={toggleStatusMutation.isPending}
              data-testid={`button-toggle-${warehouse.id}`}
              title={warehouse.isActive ? "Desativar armazém" : "Ativar armazém"}
            >
              <Power className={`h-4 w-4 ${warehouse.isActive ? 'text-red-500' : 'text-green-500'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {warehouse.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span className="text-muted-foreground" data-testid={`text-warehouse-address-${warehouse.id}`}>
                {warehouse.address}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">0 produtos</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Warehouses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const sortBy = "name";
  const sortOrder: "asc" | "desc" = "asc";

  // Reset da página quando a busca muda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Construir parâmetros de consulta
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
    };
    
    if (searchQuery) params.search = searchQuery;
    
    return params;
  }, [currentPage, itemsPerPage, searchQuery, sortBy, sortOrder]);

  // Usar hooks centralizados
  const { data: warehousesResponse, isLoading, error } = useWarehouses(queryParams);
  const warehouses = warehousesResponse?.data || [];
  const pagination = warehousesResponse?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Armazéns" breadcrumbs={["Gestão de Armazéns"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir e organizar os seus locais de armazenamento
          </p>
        <WarehouseDialog
          trigger={
            <Button data-testid="button-add-warehouse">
              <Plus className="mr-2 h-4 w-4" />
              Novo Armazém
            </Button>
          }
        />
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar armazéns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          data-testid="input-search-warehouses"
        />
      </div>

      <LoadingState 
         isLoading={isLoading} 
         error={error}
         isEmpty={warehouses.length === 0}
         loadingComponent={
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <LoadingComponents.Cards count={6} />
           </div>
         }
         emptyComponent={
           <div className="col-span-full text-center py-12">
             <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <h3 className="text-lg font-semibold mb-2">Nenhum armazém encontrado</h3>
             <p className="text-muted-foreground mb-4">
               {searchQuery ? "Tente ajustar os termos de pesquisa." : "Comece criando o primeiro armazém."}
             </p>
             {!searchQuery && (
               <WarehouseDialog
                 trigger={
                   <Button data-testid="button-add-first-warehouse">
                     <Plus className="mr-2 h-4 w-4" />
                     Criar Primeiro Armazém
                   </Button>
                 }
               />
             )}
           </div>
         }
       >
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {warehouses.map((warehouse: Warehouse) => (
             <WarehouseCard key={warehouse.id} warehouse={warehouse} />
           ))}
         </div>
       </LoadingState>

      {/* Paginação */}
      {warehouses.length > 0 && (
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
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} armazéns)
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