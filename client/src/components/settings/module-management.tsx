import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useModules } from '@/contexts/module-context';
import { apiRequest } from '@/lib/queryClient';

interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  canDisable: boolean;
}

export function ModuleManagement() {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { reloadConfiguration } = useModules();

  const fetchModules = async () => {
    try {
      const response = await apiRequest('GET', '/modules');
      const data = await response.json();
      setModules(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de módulos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleId: string, enable: boolean) => {
    try {
      const action = enable ? 'enable' : 'disable';
      const response = await apiRequest('POST', `/modules/${moduleId}/${action}`);
      const result = await response.json();
      toast({
        title: "Sucesso",
        description: result.message
      });
      
      // Atualizar lista de módulos
      await fetchModules();
      
      // Recarregar configuração do frontend
      await reloadConfiguration();
      
      if (result.note) {
        toast({
          title: "Nota",
          description: result.note,
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

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

  const enabledModules = modules.filter(m => m.enabled);
  const disabledModules = modules.filter(m => !m.enabled);

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
                {enabledModules.map((module) => (
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
                {disabledModules.map((module) => (
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
            {modules.map((module) => (
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
}