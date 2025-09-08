import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Building, Mail, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/api/use-suppliers";

// Usar o tipo Supplier do hook em vez do schema para compatibilidade
type Supplier = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
// import { PermissionGuard } from "@/components/auth/permission-guard"; // Removido - não utilizado
import { ProtectedAction } from "@/components/auth/protected-action";
import { z } from "zod";

// Schema personalizado para o formulário de fornecedores
const supplierFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierFormSchema>;

function SupplierDialog({ supplier, trigger }: { supplier?: Supplier; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: supplier?.name || "",
      email: supplier?.email || "",
      phone: supplier?.phone || "",
      address: supplier?.address || "",
    },
  });

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (supplier) {
        await updateMutation.mutateAsync({
          id: supplier.id,
          data: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    }
  };

  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    }
  }, [supplier, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-supplier">
            {supplier ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome do fornecedor" 
                      {...field} 
                      data-testid="input-supplier-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@exemplo.com" 
                      {...field} 
                      data-testid="input-supplier-email"
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
                      data-testid="input-supplier-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo" 
                      {...field} 
                      data-testid="textarea-supplier-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel-supplier"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-supplier"
              >
                {supplier ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function SupplierCard({ supplier }: { supplier: Supplier }) {
  const deleteMutation = useDeleteSupplier();

  return (
    <Card className="h-fit" data-testid={`card-supplier-${supplier.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg" data-testid={`text-supplier-name-${supplier.id}`}>
                {supplier.name}
              </CardTitle>
            </div>
          </div>
          <div className="flex gap-1">
            {/* Botão de editar protegido */}
            <ProtectedAction module="suppliers" action="update">
              <SupplierDialog
                supplier={supplier}
                trigger={
                  <Button variant="ghost" size="sm" data-testid={`button-edit-${supplier.id}`}>
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
            </ProtectedAction>
            
            {/* Botão de deletar protegido */}
            <ProtectedAction module="suppliers" action="delete">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate(supplier.id)}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${supplier.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </ProtectedAction>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {supplier.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground" data-testid={`text-supplier-email-${supplier.id}`}>
                {supplier.email}
              </span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground" data-testid={`text-supplier-phone-${supplier.id}`}>
                {supplier.phone}
              </span>
            </div>
          )}
          {supplier.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground" data-testid={`text-supplier-address-${supplier.id}`}>
                {supplier.address}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuppliersProtected() {
  const [search, setSearch] = useState("");
  
  const { data: suppliersResponse, isLoading } = useSuppliers({ limit: 5 });
  const suppliers = suppliersResponse?.data || [];

  const filteredSuppliers = suppliers.filter((supplier: Supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Fornecedores" breadcrumbs={["Gestão de Fornecedores"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir fornecedores e informações de contacto
          </p>
          
          {/* Botão de criar protegido */}
          <ProtectedAction module="suppliers" action="create">
            <SupplierDialog
              trigger={
                <Button data-testid="button-add-supplier">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Fornecedor
                </Button>
              }
            />
          </ProtectedAction>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar fornecedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-suppliers"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-48">
                <CardHeader className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhum fornecedor encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Tente ajustar os termos de pesquisa." : "Comece criando um novo fornecedor."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier: Supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}