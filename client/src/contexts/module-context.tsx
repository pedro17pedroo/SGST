import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FrontendModuleManager, FrontendModuleConfig } from '../config/modules';

interface ModuleContextValue {
  enabledModules: FrontendModuleConfig[];
  isModuleEnabled: (moduleId: string) => boolean;
  enabledRoutes: string[];
  enabledMenuItems: Array<{ label: string; icon: string; path: string; order: number; }>;
  isLoading: boolean;
  reloadConfiguration: () => Promise<void>;
}

const ModuleContext = createContext<ModuleContextValue | undefined>(undefined);

interface ModuleProviderProps {
  children: ReactNode;
}

export function ModuleProvider({ children }: ModuleProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [enabledModules, setEnabledModules] = useState<FrontendModuleConfig[]>([]);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      await FrontendModuleManager.loadModuleConfiguration();
      setEnabledModules(FrontendModuleManager.getEnabledModules());
    } catch (error) {
      console.error('Erro ao carregar configuração de módulos:', error);
      FrontendModuleManager.loadLocalConfiguration();
      setEnabledModules(FrontendModuleManager.getEnabledModules());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const contextValue: ModuleContextValue = {
    enabledModules,
    isModuleEnabled: FrontendModuleManager.isModuleEnabled.bind(FrontendModuleManager),
    enabledRoutes: FrontendModuleManager.getEnabledRoutes(),
    enabledMenuItems: FrontendModuleManager.getEnabledMenuItems(),
    isLoading,
    reloadConfiguration: loadConfiguration
  };

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules(): ModuleContextValue {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModules deve ser usado dentro de um ModuleProvider');
  }
  return context;
}