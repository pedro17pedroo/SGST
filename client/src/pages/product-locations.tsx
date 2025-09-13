import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductLocations, useCreateProductLocation, useUpdateProductLocation, useDeleteProductLocation } from "@/hooks/api/use-product-locations";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Package, Clock, Search, Edit, Trash2, Tag, Building, Hash, FileText, Check, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";


const productLocationSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  warehouseId: z.string().min(1, "Armazém é obrigatório"),
  zone: z.string()
    .min(1, "Zona é obrigatória")
    .max(10, "Zona deve ter no máximo 10 caracteres")
    .regex(/^[A-Z0-9]+$/i, "Zona deve conter apenas letras e números")
    .transform(val => val.toUpperCase()),
  shelf: z.string()
    .min(1, "Prateleira é obrigatória")
    .max(15, "Prateleira deve ter no máximo 15 caracteres")
    .regex(/^[A-Z0-9-]+$/i, "Prateleira deve conter apenas letras, números e hífens")
    .transform(val => val.toUpperCase()),
  bin: z.string()
    .min(1, "Bin é obrigatório")
    .max(20, "Bin deve ter no máximo 20 caracteres")
    .regex(/^[A-Z0-9-]+$/i, "Bin deve conter apenas letras, números e hífens")
    .transform(val => val.toUpperCase()),
  quantity: z.number({
    required_error: "Quantidade é obrigatória",
    invalid_type_error: "Quantidade deve ser um número válido"
  })
    .min(1, "Quantidade deve ser maior que zero")
    .max(999999, "Quantidade deve ser menor que 1.000.000")
    .int("Quantidade deve ser um número inteiro"),
  observations: z.string()
    .max(500, "Observações devem ter no máximo 500 caracteres")
    .trim()
    .optional()
    .or(z.literal("")),
});

type ProductLocationFormData = z.infer<typeof productLocationSchema>;

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
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchValue, setProductSearchValue] = useState("");
  const [warehouseSearchOpen, setWarehouseSearchOpen] = useState(false);
  const [warehouseSearchValue, setWarehouseSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log('🔄 ProductLocationsPage renderizado');
  console.log('🔄 Estado do diálogo:', isDialogOpen);
  
  // Monitor component mount
  useEffect(() => {
    console.log('🔄 Componente montado - iniciando carregamento de dados');
  }, []);

  const form = useForm<ProductLocationFormData>({
    resolver: zodResolver(productLocationSchema as any),
    defaultValues: {
      productId: "",
      warehouseId: "",
      zone: "",
      shelf: "",
      bin: "",
    },
  });

  // Construir parâmetros de consulta
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: 'created_at',
      sortOrder: 'desc',
    };
    
    if (searchQuery) params.search = searchQuery;
    
    return params;
  }, [currentPage, itemsPerPage, searchQuery]);

  // Get product locations with pagination
  const { data: locationsResponse, isLoading } = useProductLocations(queryParams);
  
  // Extrair dados da resposta
  const locations = locationsResponse?.data || [];
  const pagination = locationsResponse?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };

  // Get products for form
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      // Carregar todos os produtos sem limitação de paginação
      const response = await apiRequest('GET', '/api/products?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch products');
      const result = await response.json();
      const productsData = Array.isArray(result.data) ? result.data as Product[] : [];
      console.log('🔍 Produtos carregados:', productsData);
      console.log('🔍 Total de produtos:', productsData.length);
      console.log('🔍 Procurando por "Teste 1":', productsData.filter(p => p.name.toLowerCase().includes('teste')));
      return productsData;
    },
    staleTime: 30 * 1000, // 30 seconds - more frequent updates
    retry: 3,
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on component mount
    refetchOnReconnect: true, // Refetch when reconnecting
    enabled: true // Always enabled
  });

  // Get warehouses for form
  const { data: warehouses = [], isLoading: warehousesLoading, error: warehousesError } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      try {
        console.log('🏢 Iniciando chamada para carregar armazéns...');
        const response = await apiRequest('GET', '/api/warehouses');
        console.log('🏢 Resposta da API de armazéns:', response.status, response.statusText);
        
        if (!response.ok) {
          console.error('🏢 Erro na resposta da API:', response.status, response.statusText);
          throw new Error(`Failed to fetch warehouses: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🏢 Dados recebidos da API de armazéns:', result);
        
        // A API retorna { success: true, data: [...], pagination: {...} }
        if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
          console.log('🏢 Armazéns carregados com sucesso:', result.data.length, 'itens');
          console.log('🏢 Lista de armazéns:', result.data);
          return result.data;
        } else if (Array.isArray(result)) {
          console.log('🏢 Armazéns em formato de array:', result.length, 'itens');
          return result;
        } else {
          console.warn('🏢 Formato de dados inesperado dos armazéns:', result);
          return [];
        }
      } catch (error) {
        console.error('🏢 Erro ao carregar armazéns:', error);
        throw error; // Propagar o erro em vez de retornar array vazio
      }
    },
    staleTime: 0, // Sem cache para debug
    gcTime: 0, // Sem cache para debug
    retry: false, // Sem retry para debug
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: true
  });
  
  // Ensure warehouses is always an array
  const safeWarehouses = Array.isArray(warehouses) ? warehouses : [];
  console.log('🏢 SafeWarehouses processados:', safeWarehouses.length, 'itens');
  console.log('🏢 Estado de carregamento:', { warehousesLoading, warehousesError });
  
  // Monitor warehouses data changes
  useEffect(() => {
    console.log('🏢 Dados de armazéns mudaram:', {
      warehouses: warehouses?.length || 0,
      safeWarehouses: safeWarehouses.length,
      loading: warehousesLoading,
      error: warehousesError
    });
  }, [warehouses, safeWarehouses, warehousesLoading, warehousesError]);

  // Filter warehouses based on search
  const filteredWarehouses = safeWarehouses.filter((warehouse) => {
    if (!warehouseSearchValue) return true;
    
    const searchLower = warehouseSearchValue.toLowerCase();
    const nameMatch = warehouse.name.toLowerCase().includes(searchLower);
    const addressMatch = warehouse.address && warehouse.address.toLowerCase().includes(searchLower);
    
    return nameMatch || addressMatch;
  });
  console.log('🏢 Armazéns filtrados:', filteredWarehouses.length, 'itens');
  console.log('🏢 Lista filtrada:', filteredWarehouses.map(w => ({ id: w.id, name: w.name })));



  // Hooks para mutações
  const createLocationMutation = useCreateProductLocation();
  const updateLocationMutation = useUpdateProductLocation();
  const deleteLocationMutation = useDeleteProductLocation();

  const onSubmit = (data: z.infer<typeof productLocationSchema>) => {
    if (editingLocation) {
      updateLocationMutation.mutate({ id: editingLocation.id, data });
    } else {
      createLocationMutation.mutate(data);
    }
    setIsDialogOpen(false);
    setEditingLocation(null);
    form.reset();
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

  // Não precisamos mais filtrar localmente, pois a API já faz isso
  const filteredLocations = locations || [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Localizações de Produtos" breadcrumbs={["Localizações de Produtos"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir a organização e localização dos produtos nos armazéns
          </p>
        
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
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Editar" : "Nova"} Localização de Produto
              </DialogTitle>
              <DialogDescription>
                {editingLocation ? "Edite a localização do produto selecionado." : "Defina a localização de um produto no armazém."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Seção: Informações do Produto */}
                 <div className="space-y-4">
                   <div className="border-b pb-3 mb-4">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                         <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                       </div>
                       <h3 className="text-lg font-semibold text-foreground">Informações do Produto</h3>
                     </div>
                     <p className="text-sm text-muted-foreground ml-11">Selecione e identifique o produto</p>
                   </div>
                  
                  <FormField
                      control={form.control}
                      name="productId"
                      render={({ field }) => {
                        // Ensure products is always an array and has valid data
                        const safeProducts = Array.isArray(products) ? products.filter(p => p && p.id && p.name && p.sku) : [];
                        const selectedProduct = safeProducts.find(p => p.id === field.value);
                        const filteredProducts = safeProducts.filter(product => {
                          if (!productSearchValue.trim()) return true;
                          const searchTerm = productSearchValue.toLowerCase().trim();
                          const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm);
                          const skuMatch = product.sku && product.sku.toLowerCase().includes(searchTerm);
                          const barcodeMatch = product.barcode && product.barcode.toLowerCase().includes(searchTerm);
                          const matches = nameMatch || skuMatch || barcodeMatch;
                          
                          // Debug log para o termo de busca específico
                          if (searchTerm.includes('teste')) {
                            console.log(`🔍 Filtro Debug - Produto: ${product.name}, SKU: ${product.sku}, Termo: "${searchTerm}", Nome Match: ${nameMatch}, SKU Match: ${skuMatch}, Barcode Match: ${barcodeMatch}, Final: ${matches}`);
                          }
                          
                          return matches;
                        });

                      return (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium">Produto *</FormLabel>
                          <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={productSearchOpen}
                                  className={cn(
                                    "h-11 justify-between font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  data-testid="select-product"
                                >
                                  {selectedProduct ? (
                                    <div className="flex items-center gap-2">
                                      <Package className="w-4 h-4 text-blue-500" />
                                      <span className="truncate">
                                        {selectedProduct.name}
                                      </span>
                                      <Badge variant="secondary" className="text-xs">
                                        {selectedProduct.sku}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      <Search className="w-4 h-4" />
                                      Pesquisar produto...
                                    </span>
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder="Pesquisar por nome, código ou código de barras..."
                                  value={productSearchValue}
                                  onValueChange={setProductSearchValue}
                                  className="h-9"
                                />
                                <CommandEmpty>
                                  <div className="flex flex-col items-center gap-2 py-6">
                                    <Package className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      Nenhum produto encontrado
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Tente pesquisar por nome, código ou código de barras
                                    </p>
                                  </div>
                                </CommandEmpty>
                                <CommandGroup className="max-h-[300px] overflow-y-auto">
                                  {productsLoading ? (
                                    <div className="flex items-center justify-center py-6">
                                      <p className="text-sm text-muted-foreground">Carregando produtos...</p>
                                    </div>
                                  ) : productsError ? (
                                    <div className="flex items-center justify-center py-6">
                                      <p className="text-sm text-destructive">Erro ao carregar produtos</p>
                                    </div>
                                  ) : filteredProducts.length === 0 && safeProducts.length === 0 ? (
                                    <div className="flex items-center justify-center py-6">
                                      <p className="text-sm text-muted-foreground">Nenhum produto disponível</p>
                                    </div>
                                  ) : filteredProducts.length === 0 ? (
                                    <div className="flex items-center justify-center py-6">
                                      <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
                                    </div>
                                  ) : (
                                    filteredProducts.map((product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={`${product.name} ${product.sku} ${product.barcode || ''}`}
                                      onSelect={() => {
                                        field.onChange(product.id);
                                        setProductSearchOpen(false);
                                        setProductSearchValue("");
                                      }}
                                      className="flex items-center gap-3 p-3"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Package className="w-4 h-4 text-blue-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">
                                            {product.name}
                                          </div>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                              {product.sku}
                                            </Badge>
                                            {product.barcode && (
                                              <Badge variant="secondary" className="text-xs">
                                                {product.barcode}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4 shrink-0",
                                          product.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                        ))
                                     )}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                {/* Seção: Localização no Armazém */}
                 <div className="space-y-4">
                   <div className="border-b pb-3 mb-4">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                         <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
                       </div>
                       <h3 className="text-lg font-semibold text-foreground">Localização no Armazém</h3>
                     </div>
                     <p className="text-sm text-muted-foreground ml-11">Defina onde o produto será armazenado</p>
                   </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="warehouseId"
                      render={({ field }) => {
                        const selectedWarehouse = safeWarehouses.find(w => w.id === field.value);
                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Armazém *</FormLabel>
                            <Popover open={warehouseSearchOpen} onOpenChange={setWarehouseSearchOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={warehouseSearchOpen}
                                    className="h-11 justify-between font-normal w-full"
                                    data-testid="select-warehouse"
                                  >
                                    {selectedWarehouse ? (
                                      <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-green-500" />
                                        <span className="truncate">{selectedWarehouse.name}</span>
                                        {selectedWarehouse.address && (
                                          <Badge variant="outline" className="text-xs ml-2">
                                            {selectedWarehouse.address}
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">Seleccione o armazém</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[400px] p-0" align="start">
                                <Command>
                                  <CommandInput
                                    placeholder="Pesquisar armazém..."
                                    value={warehouseSearchValue}
                                    onValueChange={setWarehouseSearchValue}
                                    className="h-9"
                                  />
                                  <CommandEmpty>
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                      <Building className="w-8 h-8 text-muted-foreground mb-2" />
                                      <p className="text-sm font-medium text-muted-foreground">
                                        Nenhum armazém encontrado
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Tente pesquisar por nome ou endereço
                                      </p>
                                    </div>
                                  </CommandEmpty>
                                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                                    {warehousesLoading ? (
                                      <div className="flex items-center justify-center py-6">
                                        <p className="text-sm text-muted-foreground">Carregando armazéns...</p>
                                      </div>
                                    ) : warehousesError ? (
                                      <div className="flex items-center justify-center py-6">
                                        <p className="text-sm text-destructive">Erro ao carregar armazéns</p>
                                      </div>
                                    ) : filteredWarehouses.length === 0 ? (
                                      <div className="flex items-center justify-center py-6">
                                        <p className="text-sm text-muted-foreground">Nenhum armazém disponível</p>
                                      </div>
                                    ) : (
                                      filteredWarehouses.map((warehouse) => (
                                        <CommandItem
                                          key={warehouse.id}
                                          value={`${warehouse.name} ${warehouse.address || ''}`}
                                          onSelect={() => {
                                            field.onChange(warehouse.id);
                                            setWarehouseSearchOpen(false);
                                            setWarehouseSearchValue("");
                                          }}
                                          className="flex items-center gap-3 p-3"
                                        >
                                           <div className="flex items-center gap-2 flex-1 min-w-0">
                                             <Building className="w-4 h-4 text-green-500 shrink-0" />
                                             <div className="flex-1 min-w-0">
                                               <div className="font-medium truncate">
                                                 {warehouse.name}
                                               </div>
                                               {warehouse.address && (
                                                 <div className="flex items-center gap-2 mt-1">
                                                   <Badge variant="outline" className="text-xs">
                                                     {warehouse.address}
                                                   </Badge>
                                                 </div>
                                               )}
                                             </div>
                                           </div>
                                           <Check
                                             className={cn(
                                               "ml-auto h-4 w-4 shrink-0",
                                               warehouse.id === field.value
                                                 ? "opacity-100"
                                                 : "opacity-0"
                                             )}
                                           />
                                         </CommandItem>
                                       ))
                                    )}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>

                {/* Seção: Detalhes da Localização */}
                 <div className="space-y-4">
                   <div className="border-b pb-3 mb-4">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                         <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                       </div>
                       <h3 className="text-lg font-semibold text-foreground">Detalhes da Localização</h3>
                     </div>
                     <p className="text-sm text-muted-foreground ml-11">Especifique a localização exata do produto</p>
                   </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Zona *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: A, B, C" 
                              {...field} 
                              className="h-11"
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
                          <FormLabel className="text-sm font-medium">Prateleira *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: A1, B2" 
                              {...field} 
                              className="h-11"
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
                          <FormLabel className="text-sm font-medium">Bin *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: A1-01" 
                              {...field} 
                              className="h-11"
                              data-testid="input-bin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seção: Quantidade e Observações */}
                 <div className="space-y-4">
                   <div className="border-b pb-3 mb-4">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                         <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                       </div>
                       <h3 className="text-lg font-semibold text-foreground">Quantidade e Observações</h3>
                     </div>
                     <p className="text-sm text-muted-foreground ml-11">Defina a quantidade e adicione observações relevantes</p>
                   </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Quantidade *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Ex: 100" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="h-11"
                              data-testid="input-quantity"
                              min="1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                       control={form.control}
                       name="observations"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel className="text-sm font-medium">Observações</FormLabel>
                           <FormControl>
                             <textarea
                               placeholder="Observações adicionais (opcional)" 
                               {...field} 
                               className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                               data-testid="input-observations"
                               maxLength={500}
                               rows={3}
                             />
                           </FormControl>
                           <div className="flex justify-between items-center">
                             <FormMessage />
                             <span className="text-xs text-muted-foreground">
                               {field.value?.length || 0}/500
                             </span>
                           </div>
                         </FormItem>
                       )}
                     />
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    data-testid="button-cancel"
                    className="h-11 px-6"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createLocationMutation.isPending || updateLocationMutation.isPending}
                    data-testid="button-submit"
                    className="h-11 px-6"
                  >
                    {(createLocationMutation.isPending || updateLocationMutation.isPending) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {editingLocation ? "Atualizando..." : "Criando..."}
                      </>
                    ) : (
                      <>{editingLocation ? "Atualizar" : "Criar"} Localização</>
                    )}
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
                              {location.product?.name || 'Produto não encontrado'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {location.product?.sku || 'N/A'}
                              {location.product?.barcode && (
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
                            {location.warehouse?.name || 'Armazém não encontrado'}
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

        {/* Paginação */}
        {filteredLocations.length > 0 && (
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
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} localizações)
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