import { Request, Response, NextFunction } from 'express';
import { ModuleManager } from '../config/modules';

// Middleware para verificar se um módulo está ativo
export function moduleGuard(moduleId: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!ModuleManager.isModuleEnabled(moduleId)) {
      return res.status(404).json({
        message: `Módulo '${moduleId}' não está ativo`,
        error: 'MODULE_DISABLED'
      });
    }
    next();
  };
}

// Middleware para verificar se uma rota está ativa baseada nos módulos
export function routeGuard(req: Request, res: Response, next: NextFunction) {
  const requestPath = req.path;
  
  // Rotas especiais que sempre devem funcionar (incluindo assets estáticos)
  const alwaysActiveRoutes = [
    '/api/modules',
    '/api/settings',
    '/api/auth',
    '/api/health',
    '/assets/',
    '/favicon.ico',
    '/@vite/',
    '/node_modules/',
    '/__vite_ping'
  ];

  const isAlwaysActive = alwaysActiveRoutes.some(route => 
    requestPath.startsWith(route)
  );

  // Se for uma rota sempre ativa, permitir
  if (isAlwaysActive) {
    return next();
  }

  // Se não for uma rota de API, permitir (rotas do frontend)
  if (!requestPath.startsWith('/api/')) {
    return next();
  }

  // Para rotas de API, verificar se o módulo está ativo
  const enabledRoutes = ModuleManager.getEnabledRoutes();
  const isRouteEnabled = enabledRoutes.some(route => 
    requestPath.startsWith(route) || requestPath === route
  );

  if (!isRouteEnabled) {
    return res.status(404).json({
      message: 'Endpoint não disponível - módulo desativado',
      error: 'ROUTE_DISABLED'
    });
  }

  next();
}

// Middleware para adicionar informações de módulos ao contexto da request
export function moduleContext(req: Request, res: Response, next: NextFunction) {
  // Adicionar lista de módulos ativos ao request para uso posterior
  (req as any).enabledModules = ModuleManager.getEnabledModules();
  (req as any).moduleManager = ModuleManager;
  next();
}