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
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/api/use-suppliers";

// Schema de validação para fornecedores
const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome deve ter no máximo 255 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier;
  onSupplierCreated?: (supplier: Supplier) => void;
}

export function SupplierForm({ open, onOpenChange, supplier, onSupplierCreated }: SupplierFormProps) {
  const { toast } = useToast();
  const isEditing = !!supplier;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();

  const isLoading = createSupplierMutation.isPending || updateSupplierMutation.isPending;

  // Preencher formulário quando supplier muda
  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [supplier, form]);

  const handleCreateSupplier = async (data: SupplierFormData) => {
    try {
      const cleanData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      };
      
      const response = await createSupplierMutation.mutateAsync(cleanData);
      
      toast({
        title: "Fornecedor criado",
        description: "O fornecedor foi criado com sucesso.",
      });
      
      onOpenChange(false);
      form.reset();
      
      // Notificar o componente pai sobre o novo fornecedor
      if (onSupplierCreated && response?.data) {
        onSupplierCreated(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar fornecedor.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSupplier = async (data: SupplierFormData) => {
    if (!supplier) return;
    
    try {
      const cleanData = {
        ...data,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      };
      
      await updateSupplierMutation.mutateAsync({ id: supplier.id, data: cleanData });
      
      toast({
        title: "Fornecedor atualizado",
        description: "O fornecedor foi atualizado com sucesso.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar fornecedor.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: SupplierFormData) => {
    if (isEditing) {
      handleUpdateSupplier(data);
    } else {
      handleCreateSupplier(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Fornecedor" : "Criar Novo Fornecedor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do fornecedor."
              : "Preencha as informações para criar um novo fornecedor."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Fornecedor *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Fornecedor ABC Lda"
                        {...field}
                        data-testid="supplier-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contato@fornecedor.com"
                          {...field}
                          data-testid="supplier-email-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+244 900 000 000"
                          {...field}
                          data-testid="supplier-phone-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Endereço completo do fornecedor (opcional)"
                        rows={3}
                        {...field}
                        data-testid="supplier-address-input"
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
                data-testid="cancel-supplier-button"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                data-testid="save-supplier-button"
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