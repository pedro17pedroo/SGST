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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCreateCategory, useUpdateCategory } from "@/hooks/api/use-categories";

const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onCategoryCreated?: (category: Category) => void;
}

export function CategoryForm({ open, onOpenChange, category, onCategoryCreated }: CategoryFormProps) {
  const { toast } = useToast();
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createCategoryMutation = useCreateCategory();
  
  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const response = await createCategoryMutation.mutateAsync(data);
      toast({
        title: "Categoria criada",
        description: "A categoria foi criada com sucesso.",
      });
      onOpenChange(false);
      form.reset();
      
      // Notificar o componente pai sobre a nova categoria
      if (onCategoryCreated && response?.data) {
        onCategoryCreated(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categoria.",
        variant: "destructive",
      });
    }
  };

  const updateCategoryMutation = useUpdateCategory();
  
  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!category?.id) return;
    
    try {
      await updateCategoryMutation.mutateAsync({ id: category.id, data });
      toast({
        title: "Categoria atualizada",
        description: "A categoria foi atualizada com sucesso.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar categoria.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [category, form]);

  const onSubmit = (data: CategoryFormData) => {
    if (category) {
      handleUpdateCategory(data);
    } else {
      handleCreateCategory(data);
    }
  };

  const isLoading = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoria" : "Adicionar Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da categoria."
              : "Preencha as informações para criar uma nova categoria."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome da categoria"
                        {...field}
                        data-testid="category-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da categoria (opcional)"
                        rows={3}
                        {...field}
                        data-testid="category-description-input"
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
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                data-testid="cancel-category-button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="save-category-button"
              >
                {isLoading
                  ? "Salvando..."
                  : isEditing
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}