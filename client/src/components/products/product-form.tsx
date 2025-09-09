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

import { CategoryCombobox } from "@/components/ui/category-combobox";
import { SupplierCombobox } from "@/components/ui/supplier-combobox";
import { MultiBarcodeReader } from "@/components/ui/multi-barcode-scanner";
import { CategoryForm } from "../categories/category-form";
import { SupplierForm } from "../suppliers/supplier-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { useCreateProduct } from "@/hooks/api/use-products";
import { Scan } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU é obrigatório"),
  barcode: z.string().optional(),
  price: z.string().min(1, "Preço é obrigatório"),
  weight: z.string().optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  minStockLevel: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

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
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
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
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      sku: product?.sku || "",
      barcode: product?.barcode || "",
      price: product?.price || "",
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
        weight: "",
        categoryId: "",
        supplierId: "",
        minStockLevel: "",
      });
    }
  }, [product, form]);



  const createProductMutation = useCreateProduct();
  
  const handleCreateProduct = async (data: ProductFormData) => {
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
      price: data.price,
      weight: data.weight || undefined,
      categoryId: data.categoryId === "none" ? undefined : data.categoryId || undefined,
      supplierId: data.supplierId === "none" ? undefined : data.supplierId || undefined,
      minStockLevel: data.minStockLevel ? data.minStockLevel.toString() : "0",
    };

    handleCreateProduct(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="product-form">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold" data-testid="product-form-title">
              {product ? "Editar Produto" : "Adicionar Produto"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {product ? "Altere as informações do produto." : "Preencha os dados do novo produto."}
            </DialogDescription>
          </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Laptop Dell Inspiron" 
                          className="h-10"
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
                      <FormLabel>SKU *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: DELL-INSP-15" 
                          className="h-10"
                          {...field} 
                          data-testid="input-sku" 
                        />
                      </FormControl>
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição detalhada do produto..." 
                        className="min-h-[80px] resize-none"
                        {...field} 
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Preço e Código */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Preço e Identificação
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (AOA) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                            AOA
                          </span>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00" 
                            className="pl-12 h-10"
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
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Barras</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Ex: 1234567890123" 
                            className="h-10 pr-12"
                            {...field} 
                            data-testid="input-barcode" 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
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
            </div>

            {/* Categoria e Fornecedor */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Classificação
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
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
                      <FormLabel>Fornecedor</FormLabel>
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
            </div>

            {/* Peso e Stock */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                Inventário
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.001"
                            placeholder="0.000" 
                            className="pr-8 h-10"
                            {...field} 
                            data-testid="input-weight"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
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
                      <FormLabel>Nível Mínimo de Stock</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          className="h-10"
                          {...field} 
                          data-testid="input-min-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto order-2 sm:order-1 min-w-[100px]"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto order-1 sm:order-2 min-w-[100px]"
                disabled={createProductMutation.isPending}
                data-testid="button-submit"
              >
                {createProductMutation.isPending ? "Guardando..." : "Criar Produto"}
              </Button>
            </div>
          </form>
        </Form>
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