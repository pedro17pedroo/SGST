import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useModules } from '@/contexts/module-context';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  canDisable: boolean;
}

export const ModuleManagement = React.memo(function ModuleManagement() {
  const { toast } = useToast();
  const { reloadConfiguration } = useModules();
  const queryClient = useQueryClient();

  // Buscar módulos com useQuery
  const fetchModulesQuery = useCallback(async () => {
    const response = await apiRequest('GET', '/api/modules');
    if (!response.ok) throw new Error('Não foi possível carregar a lista de módulos');
    return response.json();
  }, []);

  const { data: modules = [], isLoading: loading, error } = useQuery({
    queryKey: ['/api/modules'],
    queryFn: fetchModulesQuery,
    staleTime: 60000, // Cache por 1 minuto
  });

  // Mutation para toggle de módulos
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ moduleId, enable }: { moduleId: string; enable: boolean }) => {
      const action = enable ? 'enable' : 'disable';
      const response = await apiRequest('POST', `/api/modules/${moduleId}/${action}`);
      if (!response.ok) throw new Error('Erro ao alterar módulo');
      return response.json();
    },
    onSuccess: async (result) => {
      toast({
        title: "Sucesso",
        description: result.message
      });
      
      // Invalidar cache e recarregar dados
      await queryClient.invalidateQueries({ queryKey: ['/api/modules'] });
      
      // Recarregar configuração do frontend
      await reloadConfiguration();
      
      if (result.note) {
        toast({
          title: "Nota",
          description: result.note,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  const toggleModule = useCallback((moduleId: string, enable: boolean) => {
    toggleModuleMutation.mutate({ moduleId, enable });
  }, [toggleModuleMutation]);

  // Mostrar erro se houver
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de módulos",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Módulos</CardTitle>
          <CardDescription>Ative ou desative módulos do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Carregando módulos...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoizar filtros para evitar recálculos
  const { enabledModules, disabledModules } = useMemo(() => ({
    enabledModules: modules.filter((m: ModuleInfo) => m.enabled),
    disabledModules: modules.filter((m: ModuleInfo) => !m.enabled)
  }), [modules]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Módulos</CardTitle>
          <CardDescription>
            Ative ou desative módulos para personalizar as funcionalidades disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Módulos Ativos ({enabledModules.length})
              </h3>
              <div className="space-y-2">
                {enabledModules.map((module: ModuleInfo) => (
                  <div key={module.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        {module.name}
                      </span>
                      {!module.canDisable && (
                        <Badge variant="outline" className="ml-2 text-xs">Core</Badge>
                      )}
                    </div>
                    <Switch
                      checked={true}
                      onCheckedChange={(checked) => !checked && module.canDisable && toggleModule(module.id, false)}
                      disabled={!module.canDisable}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Módulos Inativos ({disabledModules.length})
              </h3>
              <div className="space-y-2">
                {disabledModules.map((module: ModuleInfo) => (
                  <div key={module.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {module.name}
                      </span>
                      {module.dependencies.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Depende de: {module.dependencies.join(', ')}
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={false}
                      onCheckedChange={(checked) => checked && toggleModule(module.id, true)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes dos Módulos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {modules.map((module: ModuleInfo) => (
              <div key={module.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{module.name}</h4>
                  <div className="flex items-center gap-2">
                    {module.enabled ? (
                      <Badge variant="default">Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                    {!module.canDisable && <Badge variant="outline">Core</Badge>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                {module.dependencies.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <strong>Dependências:</strong> {module.dependencies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
})