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

// Hooks removidos temporariamente para evitar problemas no Fast Refresh