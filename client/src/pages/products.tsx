import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Power, PowerOff } from "lucide-react";
import { ProductForm } from "@/components/products/product-form";

import { deactivateProduct, activateProduct } from "@/lib/api";
import Swal from "sweetalert2";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      // Demo data for now - replace with actual API call
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/top-products"] });
      Swal.fire({
        title: 'Sucesso!',
        text: 'O produto foi desativado com sucesso.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: 'Erro!',
        text: error.message || 'Erro ao desativar produto.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/top-products"] });
      Swal.fire({
        title: 'Sucesso!',
        text: 'O produto foi ativado com sucesso.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        title: 'Erro!',
        text: error.message || 'Erro ao ativar produto.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    },
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
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
      deactivateMutation.mutate(productId);
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
      activateMutation.mutate(productId);
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="products-page">
      <Header title="Produtos" breadcrumbs={["Produtos"]} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Pesquisar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
                data-testid="product-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <Button onClick={handleAddNew} data-testid="add-product-button">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        <Card className="p-6">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 py-4 animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/6"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
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
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product: any) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground" data-testid="no-products">
                        {searchQuery ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
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
