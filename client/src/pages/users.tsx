import { useState, useMemo, useEffect } from "react";
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
  
  // Buscar roles disponíveis
  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
    staleTime: 10 * 60 * 1000, // Cache por 10 minutos
  });

  // Buscar roles do usuário se estiver editando
  const { data: userRoles = [] } = useQuery<Role[]>({
    queryKey: ["/api/users", user?.id, "roles"],
    enabled: !!user?.id && open, // Só buscar quando o dialog estiver aberto
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roleIds: [],
      isActive: true,
    },
    mode: "onChange",
  });

  // Memoizar roleIds do utilizador para evitar re-renders desnecessários
  const memoizedUserRoleIds = useMemo(() => {
    return Array.isArray(userRoles) ? userRoles.map((role: Role) => role.id) : [];
  }, [userRoles]);

  // Estado para controlar se já foi inicializado
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset form values when dialog opens or user changes
  useEffect(() => {
    if (open && (!isInitialized || user)) {
      if (user) {
        form.reset({
          username: user.username || "",
          email: user.email || "",
          password: "",
          roleIds: memoizedUserRoleIds,
          isActive: user.isActive ?? true,
        });
      } else {
        form.reset({
          username: "",
          email: "",
          password: "",
          roleIds: [],
          isActive: true,
        });
      }
      setIsInitialized(true);
    }
  }, [user, memoizedUserRoleIds, open, isInitialized]);

  // Reset initialization state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
    }
  }, [open]);

  const createUserMutation = useCreateUser();

  const updateUserMutation = useUpdateUser();

  const handleCreateUser = async (data: UserFormData) => {
    try {
      await createUserMutation.mutateAsync(data);
      setOpen(false);
      form.reset();
      toast({
        title: "Utilizador criado",
        description: "O utilizador foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o utilizador.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!user?.id) return;
    
    try {
      await updateUserMutation.mutateAsync({ id: user.id, data });
      setOpen(false);
      form.reset();
      toast({
        title: "Utilizador atualizado",
        description: "O utilizador foi atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o utilizador.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: UserFormData) => {
    if (user) {
      handleUpdateUser(data);
    } else {
      handleCreateUser(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md" data-testid="dialog-user">
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
                    <Input 
                      placeholder="Ex: joao.silva" 
                      {...field} 
                      data-testid="input-username"
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
                      placeholder="joao.silva@empresa.ao" 
                      {...field} 
                      data-testid="input-email"
                    />
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
                    <Input 
                      type="password"
                      placeholder="••••••••" 
                      value={field.value as string || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      data-testid="input-password"
                    />
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
                  <FormLabel>Perfis de Acesso</FormLabel>
                  <FormControl>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3" data-testid="roles-selector">
                      {(roles as Role[]).map((role: Role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${role.id}`}
                            checked={(field.value as string[]).includes(role.id)}
                            onCheckedChange={(checked) => {
                              const currentRoles = (field.value as string[]) || [];
                              if (checked) {
                                field.onChange([...currentRoles, role.id]);
                              } else {
                                field.onChange(currentRoles.filter((id: string) => id !== role.id));
                              }
                            }}
                            data-testid={`checkbox-role-${role.id}`}
                          />
                          <Label
                            htmlFor={`role-${role.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            data-testid={`label-role-${role.id}`}
                          >
                            {role.name}
                          </Label>
                          {role.description && (
                            <span className="text-xs text-muted-foreground" data-testid={`desc-role-${role.id}`}>
                              - {role.description}
                            </span>
                          )}
                        </div>
                      ))}
                      {roles.length === 0 && (
                        <p className="text-sm text-muted-foreground" data-testid="no-roles-message">
                          Nenhum perfil disponível. Crie perfis na secção de Gestão de Perfis.
                        </p>
                      )}
                    </div>
                  </FormControl>
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
                    <FormLabel className="text-sm">
                      Utilizador Ativo
                    </FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Utilizadores inativos não podem aceder ao sistema
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-user-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createUserMutation.isPending || updateUserMutation.isPending}
                data-testid="button-save-user"
              >
                {createUserMutation.isPending || updateUserMutation.isPending ? "Salvando..." : "Salvar"}
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

  const handleDeleteUser = async () => {
    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast({
        title: "Utilizador removido",
        description: "O utilizador foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o utilizador.",
        variant: "destructive",
      });
    }
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: "Administrador",
      manager: "Gestor",
      operator: "Operador",
      auditor: "Auditor"
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-4 w-4" />;
      case "manager": return <UserCheck className="h-4 w-4" />;
      case "auditor": return <Search className="h-4 w-4" />;
      default: return <UserIcon className="h-4 w-4" />;
    }
  };

  return (
    <Card className="h-full" data-testid={`card-user-${user.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              {getRoleIcon(user.role)}
            </div>
            <div>
              <CardTitle className="text-lg" data-testid={`text-username-${user.id}`}>
                {user.username}
              </CardTitle>
              <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <UserDialog
              user={user}
              trigger={
                <Button variant="ghost" size="sm" data-testid={`button-edit-${user.id}`}>
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
              data-testid={`button-delete-${user.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {user.isActive ? (
              <UserCheck className="h-4 w-4 text-green-600" />
            ) : (
              <UserX className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm ${user.isActive ? "text-green-600" : "text-red-600"}`}>
              {user.isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Users() {
  const [search, setSearch] = useState("");
  
  const { data: usersResponse, isLoading } = useUsers();
  const users = usersResponse?.data || [];

  const filteredUsers = users.filter((user: User) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header title="Gestão de Utilizadores" breadcrumbs={["Gestão de Utilizadores"]} />
      
      <div className="px-6 py-4 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            Gerir utilizadores e permissões do sistema
          </p>
        <UserDialog
          trigger={
            <Button data-testid="button-add-user">
              <Plus className="mr-2 h-4 w-4" />
              Novo Utilizador
            </Button>
          }
        />
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
              <CardContent className="animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user: User) => (
            <UserCard key={user.id} user={user} />
          ))}
          {filteredUsers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum utilizador encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {search ? "Tente ajustar os termos de pesquisa." : "Comece criando o primeiro utilizador."}
              </p>
              {!search && (
                <UserDialog
                  trigger={
                    <Button data-testid="button-add-first-user">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Utilizador
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}