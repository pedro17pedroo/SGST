import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Package, Clock, Search, Edit, Trash2 } from "lucide-react";
import { z } from "zod";

const productLocationSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  warehouseId: z.string().min(1, "Armazém é obrigatório"),
  zone: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
});

interface ProductLocation {
  id: string;
  productId: string;
  warehouseId: string;
  zone?: string;
  shelf?: string;
  bin?: string;
  lastScanned?: string;
  scannedByUserId?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
}

interface Warehouse {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export default function ProductLocationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ProductLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof productLocationSchema>>({
    resolver: zodResolver(productLocationSchema),
    defaultValues: {
      productId: "",
      warehouseId: "",
      zone: "",
      shelf: "",
      bin: "",
    },
  });

  // Get product locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['/api/product-locations'],
    queryFn: async () => {
      const response = await fetch('/api/product-locations');
      if (!response.ok) throw new Error('Failed to fetch product locations');
      return response.json() as Promise<ProductLocation[]>;
    }
  });

  // Get products for form
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json() as Promise<Product[]>;
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

  // Create/Update location mutation
  const saveLocationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productLocationSchema>) => {
      const url = editingLocation 
        ? `/api/product-locations/${editingLocation.id}` 
        : '/api/product-locations';
      const method = editingLocation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`Failed to ${editingLocation ? 'update' : 'create'} location`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-locations'] });
      toast({
        title: `Localização ${editingLocation ? 'atualizada' : 'criada'} com sucesso!`,
        description: `A localização do produto foi ${editingLocation ? 'atualizada' : 'criada'}.`,
      });
      setIsDialogOpen(false);
      setEditingLocation(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: `Erro ao ${editingLocation ? 'atualizar' : 'criar'} localização`,
        description: error.message,
      });
    }
  });

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/product-locations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete location');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-locations'] });
      toast({
        title: "Localização removida com sucesso!",
        description: "A localização do produto foi removida.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao remover localização",
        description: error.message,
      });
    }
  });

  const onSubmit = (data: z.infer<typeof productLocationSchema>) => {
    saveLocationMutation.mutate(data);
  };

  const handleEdit = (location: ProductLocation) => {
    setEditingLocation(location);
    form.reset({
      productId: location.productId,
      warehouseId: location.warehouseId,
      zone: location.zone || "",
      shelf: location.shelf || "",
      bin: location.bin || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta localização?")) {
      deleteLocationMutation.mutate(id);
    }
  };

  const formatLocationCode = (location: ProductLocation) => {
    const parts = [];
    if (location.zone) parts.push(location.zone);
    if (location.shelf) parts.push(location.shelf);
    if (location.bin) parts.push(location.bin);
    return parts.length > 0 ? parts.join("-") : "Sem localização";
  };

  const filteredLocations = locations?.filter(location => 
    location.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.warehouse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatLocationCode(location).toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Localizações de Produtos
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerir a organização e localização dos produtos nos armazéns
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingLocation(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="add-location-button">
              <Plus className="w-4 h-4 mr-2" />
              Nova Localização
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Editar" : "Nova"} Localização de Produto
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product">
                            <SelectValue placeholder="Seleccione o produto" />
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

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="A, B, C..." 
                            {...field} 
                            data-testid="input-zone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shelf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prateleira</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="A1, B2..." 
                            {...field} 
                            data-testid="input-shelf"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bin</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="A1-01..." 
                            {...field} 
                            data-testid="input-bin"
                          />
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
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saveLocationMutation.isPending}
                    data-testid="button-submit"
                  >
                    {editingLocation ? "Atualizar" : "Criar"} Localização
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
            placeholder="Procurar produtos, SKU, armazéns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-locations"
          />
        </div>
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
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="w-8 h-8 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Produto
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Armazém
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Localização
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Último Escaneamento
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations && filteredLocations.length > 0 ? (
                  filteredLocations.map((location) => (
                    <tr 
                      key={location.id} 
                      className="table-hover border-b border-border last:border-0"
                      data-testid={`location-row-${location.id}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground" data-testid={`product-name-${location.id}`}>
                              {location.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {location.product.sku}
                              {location.product.barcode && (
                                <span className="ml-2">| {location.product.barcode}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground" data-testid={`warehouse-name-${location.id}`}>
                            {location.warehouse.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" data-testid={`location-code-${location.id}`}>
                          {formatLocationCode(location)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {location.lastScanned ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(location.lastScanned).toLocaleDateString('pt-PT')}</span>
                          </div>
                        ) : (
                          "Nunca"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(location)}
                            data-testid={`edit-location-${location.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(location.id)}
                            data-testid={`delete-location-${location.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">
                        {searchQuery ? "Nenhuma localização encontrada" : "Nenhuma localização registada"}
                      </p>
                      <p className="text-sm">
                        {searchQuery 
                          ? "Tente ajustar os termos de pesquisa" 
                          : "Crie uma nova localização para organizar os produtos"
                        }
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}