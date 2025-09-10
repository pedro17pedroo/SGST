import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Power, PowerOff, Package } from "lucide-react";
import { ProductForm } from "@/components/products/product-form";
import { useProducts, useDeactivateProduct, useActivateProduct, type Product } from "@/hooks/api/use-products";
import { PermissionGuard } from "@/components/auth/permission-guard";
import Swal from "sweetalert2";



export default function ProductsProtected() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  // Usar hooks centralizados
  const { data: productsResponse, isLoading } = useProducts();
  const deactivateMutation = useDeactivateProduct();
  const activateMutation = useActivateProduct();

  // Extrair dados da resposta
  const products = productsResponse?.data || [];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedProduct(undefined);
    setShowForm(true);
  };

  const handleDeactivate = async (product: Product) => {
    const result = await Swal.fire({
      title: 'Desativar Produto',
      text: `Tem certeza que deseja desativar o produto "${product.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, desativar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deactivateMutation.mutateAsync(product.id);
        Swal.fire('Desativado!', 'O produto foi desativado com sucesso.', 'success');
      } catch (error) {
        Swal.fire('Erro!', 'Ocorreu um erro ao desativar o produto.', 'error');
      }
    }
  };

  const handleActivate = async (product: Product) => {
    const result = await Swal.fire({
      title: 'Ativar Produto',
      text: `Tem certeza que deseja ativar o produto "${product.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await activateMutation.mutateAsync(product.id);
        Swal.fire('Ativado!', 'O produto foi ativado com sucesso.', 'success');
      } catch (error) {
        Swal.fire('Erro!', 'Ocorreu um erro ao ativar o produto.', 'error');
      }
    }
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  if (showForm) {
    return (
      <ProductForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setSelectedProduct(undefined);
          }
        }}
        product={selectedProduct}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Produtos (Protegida)" breadcrumbs={["Gestão de Produtos"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir produtos do sistema com proteção de permissões
          </p>
          
          {/* Botão de Criar protegido por permissão */}
          <PermissionGuard module="products" action="create">
            <Button onClick={handleCreate} data-testid="button-add-product">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </PermissionGuard>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar produtos por nome ou SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-products"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-6 h-64">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Preço:</span>
                      <span className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    
                    {product.category && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Categoria:</span>
                        <span className="text-sm">{product.category.name}</span>
                      </div>
                    )}
                    
                    {product.supplier && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Fornecedor:</span>
                        <span className="text-sm">{product.supplier.name}</span>
                      </div>
                    )}
                    
                    {product.minStockLevel && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Stock Mín:</span>
                        <span className="text-sm">{product.minStockLevel}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    {/* Botão de Editar protegido por permissão */}
                    <PermissionGuard module="products" action="update">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </PermissionGuard>

                    {/* Botões de Ativar/Desativar protegidos por permissão */}
                    <PermissionGuard module="products" action="update">
                      {product.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(product)}
                          className="text-destructive hover:text-destructive"
                        >
                          <PowerOff className="h-4 w-4 mr-1" />
                          Desativar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(product)}
                          className="text-green-600 hover:text-green-600"
                        >
                          <Power className="h-4 w-4 mr-1" />
                          Ativar
                        </Button>
                      )}
                    </PermissionGuard>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
              Nenhum produto encontrado
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery ? "Tente ajustar os filtros de pesquisa." : "Comece criando um novo produto."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}