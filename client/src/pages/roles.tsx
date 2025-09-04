import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Settings, Users, Shield, Trash2, Edit, Save, X } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
  module: string;
  action: string;
}

interface RolePermission {
  roleId: string;
  permissionId: string;
  grantedBy?: string;
  grantedAt: string;
}

export default function RolesPage() {
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);
  const [permissionFilter, setPermissionFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ["/api/permissions"],
  });



  const { data: rolePermissions = [] } = useQuery({
    queryKey: ["/api/roles", selectedRoleForPermissions?.id, "permissions"],
    enabled: !!selectedRoleForPermissions,
  });

  // Mutations
  const createRoleMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await apiRequest("/api/roles", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setNewRoleName("");
      setNewRoleDescription("");
      setIsCreateDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Perfil criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar perfil",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description?: string } }) => {
      return await apiRequest(`/api/roles/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setEditingRole(null);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil",
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/roles/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Sucesso",
        description: "Perfil eliminado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao eliminar perfil",
        variant: "destructive",
      });
    },
  });

  const setRolePermissionsMutation = useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      return await apiRequest(`/api/roles/${roleId}/permissions`, "PUT", { permissionIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles", selectedRoleForPermissions?.id, "permissions"] });
      toast({
        title: "Sucesso",
        description: "Permissões do perfil atualizadas com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar permissões",
        variant: "destructive",
      });
    },
  });

  const seedPermissionsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/permissions/seed", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Sucesso",
        description: "Permissões padrão criadas com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar permissões padrão",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do perfil é obrigatório",
        variant: "destructive",
      });
      return;
    }
    createRoleMutation.mutate({
      name: newRoleName.trim(),
      description: newRoleDescription.trim() || undefined,
    });
  };

  const handleUpdateRole = (role: Role) => {
    updateRoleMutation.mutate({
      id: role.id,
      data: {
        name: role.name,
        description: role.description,
      },
    });
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("Tem certeza que deseja eliminar este perfil?")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (!selectedRoleForPermissions) return;
    
    const currentPermissionIds = (rolePermissions as RolePermission[]).map((rp: RolePermission) => rp.permissionId);
    const newPermissionIds = checked
      ? [...currentPermissionIds, permissionId]
      : currentPermissionIds.filter((id: string) => id !== permissionId);
    
    setRolePermissionsMutation.mutate({
      roleId: selectedRoleForPermissions.id,
      permissionIds: newPermissionIds,
    });
  };

  // Filter permissions
  const filteredPermissions = (permissions as Permission[]).filter((permission: Permission) => {
    const matchesSearch = permission.name.toLowerCase().includes(permissionFilter.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(permissionFilter.toLowerCase()) ||
                         permission.module.toLowerCase().includes(permissionFilter.toLowerCase());
    return matchesSearch;
  });

  // Group permissions by module
  const permissionsByModule = filteredPermissions.reduce((acc: any, permission: Permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  const currentRolePermissionIds = (rolePermissions as RolePermission[]).map((rp: RolePermission) => rp.permissionId);

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="roles-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100" data-testid="page-title">
            Gestão de Perfis e Permissões
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            Gerencie perfis de acesso e permissões do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => seedPermissionsMutation.mutate()}
            disabled={seedPermissionsMutation.isPending}
            variant="outline"
            data-testid="button-seed-permissions"
          >
            <Settings className="h-4 w-4 mr-2" />
            Criar Permissões Padrão
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-role">
                <Plus className="h-4 w-4 mr-2" />
                Novo Perfil
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-role">
              <DialogHeader>
                <DialogTitle>Criar Novo Perfil</DialogTitle>
                <DialogDescription>
                  Crie um novo perfil de acesso para o sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Perfil</Label>
                  <Input
                    id="name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Ex: Gerente, Operador, Administrador"
                    data-testid="input-role-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Descreva as responsabilidades deste perfil"
                    data-testid="textarea-role-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={createRoleMutation.isPending}
                  data-testid="button-confirm-create"
                >
                  {createRoleMutation.isPending ? "Criando..." : "Criar Perfil"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" data-testid="tab-roles">
            <Shield className="h-4 w-4 mr-2" />
            Perfis
          </TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions">
            <Settings className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(roles as Role[]).map((role: Role) => (
              <Card key={role.id} className="relative" data-testid={`card-role-${role.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    {editingRole?.id === role.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                          className="font-semibold"
                          data-testid={`input-edit-role-name-${role.id}`}
                        />
                        <Textarea
                          value={editingRole.description || ""}
                          onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                          placeholder="Descrição do perfil"
                          className="text-sm"
                          data-testid={`textarea-edit-role-description-${role.id}`}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateRole(editingRole)}
                            disabled={updateRoleMutation.isPending}
                            data-testid={`button-save-role-${role.id}`}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingRole(null)}
                            data-testid={`button-cancel-edit-role-${role.id}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <CardTitle className="text-lg" data-testid={`text-role-name-${role.id}`}>
                            {role.name}
                          </CardTitle>
                          <CardDescription data-testid={`text-role-description-${role.id}`}>
                            {role.description || "Sem descrição"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingRole(role)}
                            data-testid={`button-edit-role-${role.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-role-${role.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" data-testid={`badge-role-created-${role.id}`}>
                      Criado: {new Date(role.createdAt).toLocaleDateString('pt-PT')}
                    </Badge>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRoleForPermissions(role)}
                          data-testid={`button-manage-permissions-${role.id}`}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Permissões
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="sm:max-w-md">
                        <SheetHeader>
                          <SheetTitle data-testid={`sheet-title-permissions-${role.id}`}>
                            Permissões - {role.name}
                          </SheetTitle>
                          <SheetDescription>
                            Gerencie as permissões para este perfil
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <Input
                            placeholder="Filtrar permissões..."
                            value={permissionFilter}
                            onChange={(e) => setPermissionFilter(e.target.value)}
                            data-testid={`input-filter-permissions-${role.id}`}
                          />
                          <ScrollArea className="h-[500px] pr-4">
                            {Object.entries(permissionsByModule).map(([module, modulePermissions]: [string, any]) => (
                              <div key={module} className="mb-4">
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2 capitalize" data-testid={`text-module-${module}`}>
                                  {module.replace('_', ' ')}
                                </h4>
                                <div className="space-y-2 ml-2">
                                  {modulePermissions.map((permission: Permission) => (
                                    <div key={permission.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`permission-${permission.id}`}
                                        checked={currentRolePermissionIds.includes(permission.id)}
                                        onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                                        disabled={setRolePermissionsMutation.isPending}
                                        data-testid={`checkbox-permission-${permission.id}`}
                                      />
                                      <div className="flex-1">
                                        <label
                                          htmlFor={`permission-${permission.id}`}
                                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          data-testid={`label-permission-${permission.id}`}
                                        >
                                          {permission.name}
                                        </label>
                                        {permission.description && (
                                          <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`text-permission-description-${permission.id}`}>
                                            {permission.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <Separator className="mt-3" />
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle data-testid="permissions-table-title">Todas as Permissões</CardTitle>
              <CardDescription>
                Lista de todas as permissões disponíveis no sistema, organizadas por módulo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Filtrar permissões por nome, descrição ou módulo..."
                  value={permissionFilter}
                  onChange={(e) => setPermissionFilter(e.target.value)}
                  data-testid="input-filter-all-permissions"
                />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(filteredPermissions as Permission[]).map((permission: Permission) => (
                      <TableRow key={permission.id} data-testid={`row-permission-${permission.id}`}>
                        <TableCell className="font-medium" data-testid={`cell-permission-name-${permission.id}`}>
                          {permission.name}
                        </TableCell>
                        <TableCell data-testid={`cell-permission-description-${permission.id}`}>
                          {permission.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" data-testid={`badge-permission-module-${permission.id}`}>
                            {permission.module}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" data-testid={`badge-permission-action-${permission.id}`}>
                            {permission.action}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}