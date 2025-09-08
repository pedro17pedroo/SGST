import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryCombobox } from "@/components/ui/category-combobox";
import { SupplierCombobox } from "@/components/ui/supplier-combobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/api/use-categories";
import { useSuppliers } from "@/hooks/api/use-suppliers";
import { useCreateProduct, useUpdateProduct } from "@/hooks/api/use-products";

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

  const { data: categoriesResponse } = useCategories();
  const categories = categoriesResponse?.data || [];
  
  const { data: suppliersResponse } = useSuppliers();
  const suppliers = suppliersResponse?.data || [];

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

  const updateProductMutation = useUpdateProduct();
  
  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!product?.id) return;
    
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

  const onSubmit = (data: ProductFormData) => {
    const formattedData = {
      ...data,
      price: data.price,
      weight: data.weight || undefined,
      categoryId: data.categoryId === "none" ? undefined : data.categoryId || undefined,
      supplierId: data.supplierId === "none" ? undefined : data.supplierId || undefined,
      minStockLevel: data.minStockLevel ? data.minStockLevel.toString() : "0",
    };

    if (product) {
      handleUpdateProduct(formattedData);
    } else {
      handleCreateProduct(formattedData);
    }
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
                        <Input 
                          placeholder="Ex: 1234567890123" 
                          className="h-10"
                          {...field} 
                          data-testid="input-barcode" 
                        />
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
                          onAddNewCategory={() => {
                            // TODO: Implementar modal de adicionar categoria
                            console.log('Adicionar nova categoria')
                          }}
                          placeholder="Selecionar categoria..."
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
                          onAddNewSupplier={() => {
                            // TODO: Implementar modal de adicionar fornecedor
                            console.log('Adicionar novo fornecedor')
                          }}
                          placeholder="Selecionar fornecedor..."
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
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                data-testid="button-submit"
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? "Guardando..." : 
                 product ? "Actualizar" : "Criar Produto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}