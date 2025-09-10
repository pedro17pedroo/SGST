import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryCombobox } from "@/components/ui/category-combobox";
import { SupplierCombobox } from "@/components/ui/supplier-combobox";
import { MultiBarcodeReader } from "@/components/ui/multi-barcode-scanner";
import { CategoryForm } from "../categories/category-form";
import { SupplierForm } from "../suppliers/supplier-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { useCreateProduct, useUpdateProduct, type Product as ApiProduct } from "@/hooks/api/use-products";
import { 
  Scan, 
  Package, 
  DollarSign, 
  Tag, 
  Users, 
  Scale, 
  BarChart3,
  Info
} from "lucide-react";

// Schema para os dados de entrada do formulário (strings)
const productFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sku: z.string().optional(), // SKU é opcional - será gerado automaticamente se não fornecido
  barcode: z.string().optional(),
  price: z.string().min(1, "Preço é obrigatório").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Preço deve ser um número positivo"),
  costPrice: z.string().min(1, "Preço de custo é obrigatório").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Preço de custo deve ser um número positivo"),
  weight: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Peso deve ser um número positivo"),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  minStockLevel: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nível mínimo deve ser um número positivo"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ApiProduct;
}

export function ProductForm({ open, onOpenChange, product }: ProductFormProps) {
  const { toast } = useToast();
  
  // Estados para controlar os modais
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  // Estados para itens recém-criados
  const [newlyCreatedCategory, setNewlyCreatedCategory] = useState<{ id: string; name: string; description: string | null; createdAt: string } | null>(null);
  const [newlyCreatedSupplier, setNewlyCreatedSupplier] = useState<{ id: string; name: string; email?: string; phone?: string; address?: string } | null>(null);
  
  // Limpar itens recém-criados após seleção automática
  useEffect(() => {
    if (newlyCreatedCategory) {
      const timer = setTimeout(() => setNewlyCreatedCategory(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedCategory]);
  
  useEffect(() => {
    if (newlyCreatedSupplier) {
      const timer = setTimeout(() => setNewlyCreatedSupplier(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [newlyCreatedSupplier]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      sku: product?.sku || "",
      barcode: product?.barcode || "",
      price: product?.price || "",
      costPrice: "", // Campo não existe no produto da API, usar valor padrão
      weight: product?.weight || "",
      categoryId: product?.categoryId || "",
      supplierId: product?.supplierId || "",
      minStockLevel: product?.minStockLevel?.toString() || "",
    },
  });

  // Reset form values when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        price: product.price || "",
        costPrice: "", // Campo não existe no produto da API, usar valor padrão
        weight: product.weight || "",
        categoryId: product.categoryId || "",
        supplierId: product.supplierId || "",
        minStockLevel: product.minStockLevel?.toString() || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        sku: "",
        barcode: "",
        price: "",
        costPrice: "",
        weight: "",
        categoryId: "",
        supplierId: "",
        minStockLevel: "",
      });
    }
  }, [product, form]);



  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  
  const handleCreateProduct = async (data: any) => {
    try {
      await createProductMutation.mutateAsync(data);
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar produto.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!product?.id) {
      toast({
        title: "Erro",
        description: "ID do produto não encontrado.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProductMutation.mutateAsync({ id: product.id, data });
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar produto.",
        variant: "destructive",
      });
    }
   };

  // Função para lidar com código de barras escaneado
  const handleBarcodeScanned = (barcode: string, method: 'laser' | 'camera' | 'manual') => {
    form.setValue('barcode', barcode);
    setShowBarcodeScanner(false);
    
    toast({
      title: "Código de barras detectado!",
      description: `Método: ${method === 'laser' ? 'Laser' : method === 'camera' ? 'Câmera' : 'Manual'} - Código: ${barcode}`,
    });
  };

  const onSubmit = (data: ProductFormData) => {
    const formattedData = {
      ...data,
      sku: product ? data.sku : undefined, // Manter SKU se editando, gerar automaticamente se criando
      price: String(data.price), // Converte para string
      costPrice: String(data.costPrice), // Converte para string
      weight: data.weight ? String(data.weight) : undefined, // Converte para string se existir
      categoryId: data.categoryId === "none" ? undefined : data.categoryId || undefined,
      supplierId: data.supplierId === "none" ? undefined : data.supplierId || undefined,
      minStockLevel: data.minStockLevel ? String(data.minStockLevel) : undefined, // Converte para string se existir
    };

    // Detectar se é criação ou atualização baseado na presença do produto
    if (product) {
      handleUpdateProduct(formattedData);
    } else {
      handleCreateProduct(formattedData);
    }
   };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0" data-testid="product-form">
        <div className="flex flex-col h-full max-h-[95vh]">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3" data-testid="product-form-title">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              {product ? "Editar Produto" : "Adicionar Produto"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base mt-2">
              {product ? "Altere as informações do produto selecionado." : "Preencha os dados do novo produto com todas as informações necessárias."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">

        <Form {...form}>
          <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Informações Básicas */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Nome do Produto *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Laptop Dell Inspiron" 
                            className="h-11"
                            {...field} 
                            data-testid="input-name" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          SKU (Gerado Automaticamente)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Será gerado automaticamente" 
                            className="h-11 bg-muted"
                            {...field} 
                            data-testid="input-sku"
                            disabled
                            readOnly
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          O SKU será gerado automaticamente com base no nome do produto
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição detalhada do produto..." 
                          className="min-h-[100px] resize-none"
                          {...field} 
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Preço e Código */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Preço e Identificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Preço (AOA) *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
                              AOA
                            </span>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              className="pl-14 h-11"
                              {...field} 
                              data-testid="input-price"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Preço de Custo (AOA) *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
                              AOA
                            </span>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              className="pl-14 h-11"
                              {...field} 
                              data-testid="input-cost-price"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Código de Barras */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Scan className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Código de Barras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Scan className="h-4 w-4" />
                          Código de Barras
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Ex: 1234567890123" 
                              className="h-11 pr-12"
                              {...field} 
                              data-testid="input-barcode" 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted"
                              onClick={() => setShowBarcodeScanner(true)}
                              title="Escanear código de barras"
                            >
                              <Scan className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categoria e Fornecedor */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Categoria
                        </FormLabel>
                        <FormControl>
                          <CategoryCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            onAddNewCategory={() => setShowCategoryModal(true)}
                            placeholder="Selecionar categoria..."
                            newlyCreatedCategory={newlyCreatedCategory}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Fornecedor
                        </FormLabel>
                        <FormControl>
                          <SupplierCombobox
                            value={field.value}
                            onValueChange={field.onChange}
                            onAddNewSupplier={() => setShowSupplierModal(true)}
                            placeholder="Selecionar fornecedor..."
                            newlyCreatedSupplier={newlyCreatedSupplier}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Peso e Stock */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Inventário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          Peso (kg)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              step="0.001"
                              placeholder="0.000" 
                              className="pr-10 h-11"
                              {...field} 
                              data-testid="input-weight"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
                              kg
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Nível Mínimo de Stock
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            className="h-11"
                            {...field} 
                            data-testid="input-min-stock"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

           </form>
         </Form>
          </div>
          
          {/* Área de botões fixa na parte inferior */}
          <div className="flex-shrink-0 border-t bg-white dark:bg-gray-950 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto min-w-[120px] h-11"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                form="product-form"
                className="w-full sm:w-auto min-w-[120px] h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={createProductMutation.isPending}
                data-testid="button-submit"
              >
                {(createProductMutation.isPending || updateProductMutation.isPending) ? 
                  (product ? "Atualizando..." : "Criando...") : 
                  (product ? "Atualizar Produto" : "Criar Produto")
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Modal do Scanner de Código de Barras */}
      {showBarcodeScanner && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBarcodeScanner(false);
            }
          }}
        >
          <div 
            className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Scanner de Código de Barras</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBarcodeScanner(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <MultiBarcodeReader
                onScanResult={handleBarcodeScanned}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Adicionar Categoria */}
       <CategoryForm
          open={showCategoryModal}
          onOpenChange={setShowCategoryModal}
          onCategoryCreated={(newCategory: { id: string; name: string; description: string | null; createdAt: string }) => {
            // Definir categoria recém-criada para seleção automática
            setNewlyCreatedCategory(newCategory);
            setShowCategoryModal(false);
          }}
        />
      
      {/* Modal de Adicionar Fornecedor */}
       <SupplierForm
          open={showSupplierModal}
          onOpenChange={setShowSupplierModal}
          onSupplierCreated={(newSupplier: { id: string; name: string; email?: string; phone?: string; address?: string }) => {
            // Definir fornecedor recém-criado para seleção automática
            setNewlyCreatedSupplier(newSupplier);
            setShowSupplierModal(false);
          }}
        />
    </Dialog>
  );
}