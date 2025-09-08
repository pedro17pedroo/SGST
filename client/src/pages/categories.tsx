import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Package, ChevronLeft, ChevronRight, Power } from "lucide-react";
import { CategoryForm } from "@/components/categories/category-form";
import { useCategories, useToggleCategoryStatus, type Category } from "@/hooks/api/use-categories";
import Swal from "sweetalert2";

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
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
  const { data: categoriesResponse, isLoading, error } = useCategories(queryParams);
  const categories = categoriesResponse?.data || [];
  const pagination = categoriesResponse?.pagination || {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  };

  // Debug logs
  console.log('Categories Debug:', {
    queryParams,
    categoriesResponse,
    categories,
    pagination,
    isLoading,
    error
  });
  const toggleStatusMutation = useToggleCategoryStatus();

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleToggleStatus = async (category: Category) => {
    const action = category.isActive ? 'desativar' : 'ativar';
    const actionPast = category.isActive ? 'desativada' : 'ativada';
    
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} categoria?`,
      text: `Tem certeza que deseja ${action} a categoria "${category.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: category.isActive ? '#d33' : '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sim, ${action}!`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await toggleStatusMutation.mutateAsync(category.id);
        Swal.fire({
          title: 'Sucesso!',
          text: `Categoria foi ${actionPast} com sucesso.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Erro!',
          text: `Ocorreu um erro ao ${action} a categoria.`,
          icon: 'error'
        });
      }
    }
  };

  const handleAddNew = () => {
    setSelectedCategory(undefined);
    setShowForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="categories-page">
      <Header title="Categorias" breadcrumbs={["Categorias"]} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Pesquisar categorias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
                data-testid="category-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <Button onClick={handleAddNew} data-testid="add-category-button">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Categoria
          </Button>
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
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-24"></div>
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
                      Categoria
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Descrição
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Data de Criação
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category: Category) => (
                      <tr 
                        key={category.id} 
                        className="table-hover border-b border-border last:border-0"
                        data-testid={`category-row-${category.id}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground" data-testid={`category-name-${category.id}`}>
                                {category.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`category-description-${category.id}`}>
                          {category.description || "Sem descrição"}
                        </td>
                        <td className="py-3 px-4" data-testid={`category-status-${category.id}`}>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {category.isActive ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`category-date-${category.id}`}>
                          {formatDate(category.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(category)}
                              data-testid={`edit-category-${category.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleToggleStatus(category)}
                              data-testid={`toggle-category-${category.id}`}
                              title={category.isActive ? 'Desativar categoria' : 'Ativar categoria'}
                            >
                              <Power className={`w-4 h-4 ${category.isActive ? 'text-red-500' : 'text-green-500'}`} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        {searchQuery ? "Nenhuma categoria encontrada." : "Nenhuma categoria cadastrada."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Paginação */}
          {categories.length > 0 && (
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
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} categorias)
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
      </div>

      <CategoryForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setSelectedCategory(undefined);
          }
        }}
        category={selectedCategory}
      />
    </div>
  );
}