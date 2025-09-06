import { useState } from "react";
// import { useMemo } from "react"; // Removido - não utilizado
// import { useEffect } from "react"; // Removido - não utilizado
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Shield, User as UserIcon, UserCheck, UserX } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Removido - não utilizado
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser
  // useUsersByRole // Removido - não utilizado
} from "@/hooks/api/use-users";
import { PermissionGuard } from "@/components/auth/permission-guard";
// import { ProtectedAction } from "@/components/auth/protected-action"; // Removido - não utilizado

const userFormSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password deve ter pelo menos 6 caracteres"),
  roleIds: z.array(z.string()).min(1, "Deve selecionar pelo menos um perfil"),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

function UserDialog({ user, trigger }: { user?: User; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      password: "",
      roleIds: user?.role ? [user.role] : [],
      isActive: user?.isActive ?? true,
    },
  });

  const { data: rolesResponse } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetch("/api/roles", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch roles");
      return response.json();
    },
  });

  const roles: Role[] = rolesResponse?.data || [];

  const onSubmit = async (data: UserFormData) => {
    try {
      if (user) {
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: data
        });
        toast({
          title: "Sucesso",
          description: "Utilizador atualizado com sucesso",
        });
      } else {
        await createUserMutation.mutateAsync(data);
        toast({
          title: "Sucesso",
          description: "Utilizador criado com sucesso",
        });
      }
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Erro",
        description: user ? "Erro ao atualizar utilizador" : "Erro ao criar utilizador",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Utilizador" : "Novo Utilizador"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Utilizador</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {user ? "Nova Password (deixar vazio para manter)" : "Password"}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfis</FormLabel>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.id}
                          checked={field.value.includes(role.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, role.id]);
                            } else {
                              field.onChange(field.value.filter(id => id !== role.id));
                            }
                          }}
                        />
                        <Label htmlFor={role.id}>{role.name}</Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Utilizador pode fazer login no sistema
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                {user ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function UserCard({ user }: { user: User }) {
  const { toast } = useToast();
  const deleteUserMutation = useDeleteUser();

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja eliminar este utilizador?")) {
      try {
        await deleteUserMutation.mutateAsync(user.id);
        toast({
          title: "Sucesso",
          description: "Utilizador eliminado com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao eliminar utilizador",
          variant: "destructive",
        });
      }
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "operator":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.username}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {/* Botão de Editar protegido por permissão */}
            <PermissionGuard module="users" action="update">
              <UserDialog
                user={user}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
            </PermissionGuard>
            
            {/* Botão de Eliminar protegido por permissão */}
            <PermissionGuard module="users" action="delete">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={user.isActive ? "default" : "secondary"} className="flex items-center space-x-1">
              {user.isActive ? (
                <>
                  <UserCheck className="h-3 w-3" />
                  <span>Ativo</span>
                </>
              ) : (
                <>
                  <UserX className="h-3 w-3" />
                  <span>Inativo</span>
                </>
              )}
            </Badge>
          </div>
          
          <div>
            <span className="text-sm font-medium">Perfis:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {user.role ? (
                <Badge variant="outline" className={getRoleColor(user.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Sem perfil
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Criado em: {new Date(user.createdAt || '').toLocaleDateString('pt-PT')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UsersProtected() {
  const [search, setSearch] = useState("");
  
  const { data: usersResponse, isLoading } = useUsers();
  const users = usersResponse?.data || [];

  const filteredUsers = users.filter((user: User) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Utilizadores (Protegida)" breadcrumbs={["Gestão de Utilizadores"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir utilizadores e permissões do sistema com proteção de permissões
          </p>
          
          {/* Botão de Criar protegido por permissão */}
          <PermissionGuard module="users" action="create">
            <UserDialog
              trigger={
                <Button data-testid="button-add-user">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Utilizador
                </Button>
              }
            />
          </PermissionGuard>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar utilizadores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-users"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-40">
                <CardHeader className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user: User) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {!isLoading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
              Nenhum utilizador encontrado
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Tente ajustar os filtros de pesquisa." : "Comece criando um novo utilizador."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}