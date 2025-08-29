import React from 'react';
import { FrontendModuleManager } from '../../config/modules';

interface ModuleGuardProps {
  moduleId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Componente para proteger conteúdo baseado em módulos ativos
export function ModuleGuard({ moduleId, children, fallback = null }: ModuleGuardProps) {
  const isEnabled = FrontendModuleManager.isModuleEnabled(moduleId);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Hook para verificar se um módulo está ativo
export function useModuleEnabled(moduleId: string): boolean {
  return FrontendModuleManager.isModuleEnabled(moduleId);
}

// Hook para obter informações de um módulo
export function useModule(moduleId: string) {
  const module = FrontendModuleManager.getModuleById(moduleId);
  const isEnabled = FrontendModuleManager.isModuleEnabled(moduleId);
  
  return {
    module,
    isEnabled,
    hasPermissions: true // Implementar verificação de permissões se necessário
  };
}