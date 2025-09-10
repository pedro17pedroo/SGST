import { useState, useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Package, Scan, AlertCircle, DollarSign, Tag } from "lucide-react";
import { MultiBarcodeReader } from "@/components/ui/multi-barcode-scanner";
import { CategoryCombobox } from "@/components/ui/category-combobox";
import { SupplierCombobox } from "@/components/ui/supplier-combobox";
import { useToast } from "@/hooks/use-toast";
import { useCreateProduct, useUpdateProduct, useProduct } from "@/hooks/api/use-products";

// Schema para validação do formulário
const productFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  price: z.string().min(1, "Preço é obrigatório").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Preço deve ser um número positivo"),
  costPrice: z.string().min(1, "Preço de custo é obrigatório").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Preço de custo deve ser um número positivo"),
  weight: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Peso deve ser um número positivo"),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  minStockLevel: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), "Nível mínimo deve ser um número positivo"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

/**
 * Página dedicada para adicionar produtos
 * Formulário integrado diretamente na página com campo de código de barras como primeiro campo
 * Inclui opções de scanner laser, câmera e inserção manual
 */
export default function AddProduct() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verificar se estamos editando um produto
  const searchParams = new URLSearchParams(searchString);
  const editProductId = searchParams.get('edit');
  const { data: editProduct } = useProduct(editProductId || '');
  const isEditing = !!editProductId;
  
  // Configurar o formulário
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
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
    },
  });
  
  // Preencher formulário quando editando
  useEffect(() => {
    if (isEditing && editProduct?.data) {
      const product = editProduct.data;
      form.reset({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        price: product.price ? (typeof product.price === 'string' ? product.price : String(product.price)) : "",
        costPrice: product.costPrice ? (typeof product.costPrice === 'string' ? product.costPrice : String(product.costPrice)) : "",
        weight: product.weight ? String(product.weight) : "",
        categoryId: product.categoryId || "",
        supplierId: product.supplierId || "",
        minStockLevel: product.minStockLevel ? String(product.minStockLevel) : "",
      });
    }
  }, [isEditing, editProduct, form]);

  // Callback para quando um código de barras é escaneado
  const handleBarcodeScanned = useCallback((barcode: string, method: 'laser' | 'camera' | 'manual') => {
    form.setValue('barcode', barcode);
    toast({
      title: "Código escaneado com sucesso",
      description: `Código: ${barcode} (${method})`,
      variant: "default",
    });
  }, [form, toast]);

  // Callback para quando a câmera for iniciada
  const handleCameraStart = useCallback(() => {
    // Focar no campo de código de barras quando a câmera for iniciada
    const barcodeField = document.querySelector('input[name="barcode"]') as HTMLInputElement;
    if (barcodeField) {
      barcodeField.focus();
      barcodeField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Callback para quando o escaneamento for concluído
  const handleScanComplete = useCallback(() => {
    // Aguardar um pouco para garantir que o código foi processado
    setTimeout(() => {
      // Focar no campo nome do produto
      const nameField = document.querySelector('input[name="name"]') as HTMLInputElement;
      if (nameField) {
        nameField.focus();
        nameField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }, []);

  // Callback para voltar à página de produtos
  const handleGoBack = useCallback(() => {
    setLocation("/products");
  }, [setLocation]);

  // Callback para submeter o formulário
  const onSubmit = useCallback(async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const productData = {
        name: data.name,
        description: data.description || '',
        sku: data.sku || '',
        barcode: data.barcode || '',
        price: data.price,
        costPrice: data.costPrice,
        weight: data.weight || '',
        categoryId: data.categoryId || '',
        supplierId: data.supplierId || '',
        minStockLevel: data.minStockLevel || '',
      };

      if (isEditing && editProductId) {
        await updateProduct.mutateAsync({ id: editProductId, data: productData });
        toast({
          title: "Produto atualizado",
          description: "O produto foi atualizado com sucesso.",
          variant: "default",
        });
      } else {
        await createProduct.mutateAsync(productData);
        toast({
          title: "Produto criado",
          description: "O produto foi criado com sucesso.",
          variant: "default",
        });
      }
      
      setLocation("/products");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditing, editProductId, updateProduct, createProduct, toast, setLocation]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header da página */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
              <Package className="w-6 h-6" />
              <span>{isEditing ? 'Editar Produto' : 'Adicionar Produto'}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing 
                 ? `Edite as informações do produto ${editProduct?.data?.name || ''}` 
                 : 'Preencha os dados do novo produto com todas as informações necessárias.'
               }
            </p>
          </div>
        </div>

      </div>

      <Separator className="mb-6" />

      {/* Formulário principal */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Código de Barras */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Scan className="w-5 h-5" />
                 Código de Barras
               </CardTitle>
               <CardDescription>
                 Escaneie um código de barras ou digite manualmente
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
              <MultiBarcodeReader
                onScanResult={handleBarcodeScanned}
                onCameraStart={handleCameraStart}
                onScanComplete={handleScanComplete}
                hideMethodSelection={false}
                className="w-full"
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Barras</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite ou escaneie o código de barras"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Seção de Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Informações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Laptop Dell Inspiron" {...field} />
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
                      <FormLabel>SKU (Gerado Automaticamente)</FormLabel>
                      <FormControl>
                        <Input placeholder="Será gerado automaticamente" disabled {...field} />
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
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Seção de Preço e Identificação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Preço e Identificação</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (AOA) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
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
                      <FormLabel>Preço de Custo (AOA) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
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
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Seção de Categoria e Fornecedor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Categoria e Fornecedor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoBack}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createProduct.isPending || updateProduct.isPending}
            >
              {isSubmitting || createProduct.isPending || updateProduct.isPending
                ? "Salvando..."
                : isEditing
                ? "Atualizar Produto"
                : "Criar Produto"}
            </Button>
          </div>
        </form>
      </Form>



      {/* Dicas */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground mb-1">Dicas para Melhor Experiência</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use boa iluminação ao escanear códigos de barras</li>
                <li>• Mantenha o código de barras limpo e sem dobras</li>
                <li>• Preencha todos os campos obrigatórios no formulário</li>
                <li>• Verifique se a categoria e fornecedor estão corretos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}