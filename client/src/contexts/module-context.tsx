import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback, useRef } from 'react';
import { FrontendModuleManager, FrontendModuleConfig } from '../config/modules';
import { useAuth } from './auth-context';

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

// Variável global para evitar múltiplas execuções simultâneas
let isLoadingModules = false;

export function ModuleProvider({ children }: ModuleProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [enabledModules, setEnabledModules] = useState<FrontendModuleConfig[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const { permissions, permissionsLoading, isAuthenticated, isReady: authReady } = useAuth();
  
  // Debug removido para melhor performance
  
  // Memoizar as permissões para evitar re-execuções desnecessárias
  const memoizedPermissions = useMemo(() => {
    if (!isAuthenticated) {
  
      return [];
    }
    
    const permissionNames = permissions?.map(p => p.name) || [];

    return permissionNames;
  }, [permissions, isAuthenticated]);

  const debounceRef = useRef<number | null>(null);

  const loadConfiguration = useCallback(async () => {
    // Evitar múltiplas execuções simultâneas
    if (isLoadingModules) {
  
      return;
    }

    // Aguardar que as permissões sejam carregadas (apenas se autenticado)
    if (isAuthenticated && permissionsLoading) {
  
      return;
    }
    
    // Se não estiver autenticado, carregar configuração local
    if (!isAuthenticated) {
      FrontendModuleManager.setUserPermissions([]);
      FrontendModuleManager.loadLocalConfiguration();
      const enabledMods = FrontendModuleManager.getEnabledModules();
      setEnabledModules(enabledMods);
      setIsLoading(false);
      isLoadingModules = false;
      return;
    }

    // Clear any existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the function call
    debounceRef.current = setTimeout(async () => {
      // Verificação final antes de executar
      if (isLoadingModules) {
        return;
      }

      isLoadingModules = true;
      setIsLoading(true);
      
      try {
        // Definir permissões no FrontendModuleManager
        FrontendModuleManager.setUserPermissions(memoizedPermissions);
        
        // Carregar configuração da API
        await FrontendModuleManager.loadConfiguration();
        const enabledMods = FrontendModuleManager.getEnabledModules();
        setEnabledModules(enabledMods);
      } catch (error) {
        console.error('Erro ao carregar configuração de módulos:', error);
        FrontendModuleManager.loadLocalConfiguration();
        const enabledMods = FrontendModuleManager.getEnabledModules();
        setEnabledModules(enabledMods);
      } finally {
        setIsLoading(false);
        isLoadingModules = false;
      }
    }, 300); // 300ms debounce
  }, [memoizedPermissions, permissionsLoading]);

  // Registar listeners para mudanças de permissões
  useEffect(() => {
    // Listener para mudanças de módulos
    const removeModuleListener = FrontendModuleManager.addModuleChangeListener(() => {
      const updatedModules = FrontendModuleManager.getEnabledModules();
      setEnabledModules(updatedModules);
      setForceUpdate(prev => prev + 1); // Força re-render dos componentes dependentes
    });
    
    // Listener para mudanças de permissões
    const removePermissionListener = FrontendModuleManager.addPermissionChangeListener(() => {
      const updatedModules = FrontendModuleManager.getEnabledModules();
      setEnabledModules(updatedModules);
      setForceUpdate(prev => prev + 1); // Força re-render dos componentes dependentes
    });
    
    // Cleanup dos listeners
    return () => {
      removeModuleListener();
      removePermissionListener();
    };
  }, []); // Executar apenas uma vez

  useEffect(() => {
    // Carregar sempre que o estado de autenticação estiver pronto e as permissões não estiverem carregando
    if (authReady && !permissionsLoading) {
      loadConfiguration();
    } else if (!authReady || (!isAuthenticated && authReady)) {
      // Reset loading state quando auth não está pronto ou quando não autenticado
      setIsLoading(false);
    }
  }, [authReady, memoizedPermissions, permissionsLoading, isAuthenticated, loadConfiguration]);

  // Estado de loading mais preciso: carregando quando auth não está pronto OU quando módulos estão carregando
  const effectiveIsLoading = !authReady || isLoading;

  // Memoizar valores que dependem do estado dos módulos para garantir reatividade
  const contextValue: ModuleContextValue = useMemo(() => ({
    enabledModules,
    isModuleEnabled: FrontendModuleManager.isModuleEnabled.bind(FrontendModuleManager),
    enabledRoutes: FrontendModuleManager.getEnabledRoutes(),
    enabledMenuItems: FrontendModuleManager.getEnabledMenuItems(),
    isLoading: effectiveIsLoading,
    reloadConfiguration: loadConfiguration
  }), [enabledModules, effectiveIsLoading, loadConfiguration, forceUpdate]); // forceUpdate garante re-render

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