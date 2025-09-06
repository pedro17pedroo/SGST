import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Power, PowerOff, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductForm } from "@/components/products/product-form";
import { useProducts, useDeactivateProduct, useActivateProduct } from "@/hooks/api/use-products";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import Swal from "sweetalert2";
import { ErrorBoundary } from "@/components/error-boundary";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  price: string;
  weight: string | null;
  categoryId: string | null;
  supplierId: string | null;
  minStockLevel: number | null;
  isActive: boolean;
  category?: {
    name: string;
  } | null;
  supplier?: {
    name: string;
  } | null;
}

export default function Products() {
  return (
    <ErrorBoundary>
      <ProductsContent />
    </ErrorBoundary>
  );
}

function ProductsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const isMobile = useIsMobile();

  // Construir parâmetros de consulta
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
    };
    
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;
    if (priceMin) params.minPrice = parseFloat(priceMin);
    if (priceMax) params.maxPrice = parseFloat(priceMax);
    
    return params;
  }, [currentPage, itemsPerPage, searchQuery, categoryFilter, statusFilter, priceMin, priceMax, sortBy, sortOrder]);

  // Usar hooks centralizados
  const { data: productsResponse, isLoading } = useProducts(queryParams);
  const deactivateMutation = useDeactivateProduct();
  const activateMutation = useActivateProduct();

  // Extrair dados da resposta
  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  };



  // Função para formatar preço
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `${numPrice.toLocaleString('pt-AO')} Kz`;
  };

  // Resetar página quando filtros mudarem
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Função para adicionar novo produto
  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product: Product) => {
    handleDeactivate(product.id);
  };

  const handleToggleStatus = async (product: Product) => {
    if (product.isActive) {
      await handleDeactivate(product.id);
    } else {
      await handleActivate(product.id);
    }
  };

  const handleActivate = async (productId: string) => {
    const result = await Swal.fire({
      title: 'Ativar Produto',
      text: 'Tem certeza que deseja ativar este produto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await activateMutation.mutateAsync(productId);
        Swal.fire({
          title: 'Sucesso!',
          text: 'O produto foi ativado com sucesso.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Erro!',
          text: 'Erro ao ativar produto.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleDeactivate = async (productId: string) => {
    const result = await Swal.fire({
      title: 'Desativar Produto',
      text: 'Tem certeza que deseja desativar este produto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, desativar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deactivateMutation.mutateAsync(productId);
        Swal.fire({
          title: 'Sucesso!',
          text: 'O produto foi desativado com sucesso.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Erro!',
          text: 'Erro ao desativar produto.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };



  return (
    <div className="min-h-screen bg-background" data-testid="products-page">
      <Header title="Produtos" breadcrumbs={["Produtos"]} />
      
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 sm:flex-none">
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10 w-full sm:w-80"
                  data-testid="product-search"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                size={isMobile ? "sm" : "default"}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
            <Button onClick={handleAddNew} data-testid="add-product-button" size={isMobile ? "sm" : "default"}>
              <Plus className="w-4 h-4 mr-2" />
              {isMobile ? "Adicionar" : "Adicionar Produto"}
            </Button>
          </div>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Produtos</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerir produtos do sistema ({pagination.total} produtos)
              </p>
            </div>
          </div>

          {/* Filtros avançados */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter || "all"} onValueChange={(value) => {
                   setStatusFilter(value === "all" ? "" : value);
                   handleFilterChange();
                 }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">Todos</SelectItem>
                     <SelectItem value="ativo">Ativo</SelectItem>
                     <SelectItem value="inativo">Inativo</SelectItem>
                   </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Preço Mínimo</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => {
                    setPriceMin(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Preço Máximo</label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(e.target.value);
                    handleFilterChange();
                  }}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                  handleFilterChange();
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Preço (Menor)</SelectItem>
                    <SelectItem value="price-desc">Preço (Maior)</SelectItem>
                    <SelectItem value="sku-asc">SKU (A-Z)</SelectItem>
                    <SelectItem value="sku-desc">SKU (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {products.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground" data-testid="no-products">
                  {searchQuery ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-0">
                  {/* Versão Mobile */}
                  {isMobile ? (
                    <div className="space-y-3">
                      {products.map((product: any) => (
                        <div 
                          key={product.id} 
                          className="border border-border rounded-lg p-4 space-y-3"
                          data-testid={`product-card-${product.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {product.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate" data-testid={`product-name-${product.id}`}>
                                  {product.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                            <Badge variant={product.isActive ? "secondary" : "destructive"} className="ml-2">
                              {product.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">SKU:</span>
                              <p className="font-medium" data-testid={`product-sku-${product.id}`}>{product.sku}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Categoria:</span>
                              <p className="font-medium" data-testid={`product-category-${product.id}`}>
                                {product.category?.name || "Sem categoria"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Preço:</span>
                              <p className="font-medium text-lg" data-testid={`product-price-${product.id}`}>
                                AOA {Number(product.price).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 pt-2 border-t border-border">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(product)}
                              data-testid={`edit-product-${product.id}`}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            {product.isActive ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDeactivate(product.id)}
                                disabled={deactivateMutation.isPending}
                                data-testid={`deactivate-product-${product.id}`}
                                title="Desativar produto"
                              >
                                <PowerOff className="w-4 h-4 text-destructive" />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleActivate(product.id)}
                                disabled={activateMutation.isPending}
                                data-testid={`activate-product-${product.id}`}
                                title="Ativar produto"
                              >
                                <Power className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Versão Desktop */
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Produto
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            SKU
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Categoria
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Preço
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr 
                            key={product.id} 
                            className="table-hover border-b border-border last:border-0"
                            data-testid={`product-row-${product.id}`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {product.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground" data-testid={`product-name-${product.id}`}>
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {product.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`product-sku-${product.id}`}>
                              {product.sku}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground" data-testid={`product-category-${product.id}`}>
                              {product.category?.name || "Sem categoria"}
                            </td>
                            <td className="py-3 px-4 text-sm text-foreground" data-testid={`product-price-${product.id}`}>
                              AOA {Number(product.price).toLocaleString()}
                            </td>
                            <td className="py-3 px-4" data-testid={`product-status-${product.id}`}>
                              <Badge variant={product.isActive ? "secondary" : "destructive"}>
                                {product.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEdit(product)}
                                  data-testid={`edit-product-${product.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {product.isActive ? (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeactivate(product.id)}
                                    disabled={deactivateMutation.isPending}
                                    data-testid={`deactivate-product-${product.id}`}
                                    title="Desativar produto"
                                  >
                                    <PowerOff className="w-4 h-4 text-destructive" />
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleActivate(product.id)}
                                    disabled={activateMutation.isPending}
                                    data-testid={`activate-product-${product.id}`}
                                    title="Ativar produto"
                                  >
                                    <Power className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Paginação */}
          {products.length > 0 && (
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
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} produtos)
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
        </Card>

        <ProductForm 
          open={showForm} 
          onOpenChange={setShowForm} 
          product={selectedProduct}
        />
      </div>
    </div>
  );
}
