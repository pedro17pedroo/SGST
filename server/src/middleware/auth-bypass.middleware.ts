import { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../modules/auth/auth.middleware';

/**
 * Lista de rotas que não precisam de autenticação
 */
const PUBLIC_ROUTES = [
  '/api/pre-middleware-test',
  '/api/test-direct',
  '/api/debug-test',
  '/api/simple-test',
  '/api/post-modules-test',
  '/api/before-modules-test',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/public-tracking',
  '/api/health',
  '/api/status',
  '/api/inventory-counts*',
  '/api/barcode-scanning*',
  '/api/picking-lists*',
  '/api/packing-tasks*',
  '/api/reports*',
  '/api/roles*',
  '/api/permissions*',
  '/api/modules*'
];

/**
 * Middleware que permite certas rotas passarem sem autenticação
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
export function authBypassMiddleware(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  const fullUrl = req.originalUrl;
  
  // PRIMEIRA PRIORIDADE: Interceptar rotas de teste IMEDIATAMENTE
  if (path.includes('test') || path.includes('debug') || fullUrl.includes('test') || fullUrl.includes('debug')) {
    return res.status(200).json({
      success: true,
      message: 'Test route accessed successfully via bypass!',
      timestamp: new Date().toISOString(),
      path: path,
      originalUrl: fullUrl,
      method: req.method,
      note: 'Esta resposta vem DIRETAMENTE do middleware de bypass - SEM AUTENTICAÇÃO'
    });
  }
  
  // Verificar se a rota está na lista de rotas públicas
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    // Verificação exata para rotas específicas
    if (path === route) {
      return true;
    }
    
    // Verificação para rotas que começam com determinado padrão
    if (route.endsWith('*') && path.startsWith(route.slice(0, -1))) {
      return true;
    }
    
    return false;
  });
  
  if (isPublicRoute) {
    return next();
  }
  
  // Para rotas que precisam de autenticação, aplicar o middleware de auth
  return requireAuth(req, res, next);
}

/**
 * Adicionar uma nova rota pública dinamicamente
 * @param route - Rota a ser adicionada
 */
export function addPublicRoute(route: string) {
  if (!PUBLIC_ROUTES.includes(route)) {
    PUBLIC_ROUTES.push(route);
    console.log('➕ Rota pública adicionada:', route);
  }
}

/**
 * Remover uma rota pública
 * @param route - Rota a ser removida
 */
export function removePublicRoute(route: string) {
  const index = PUBLIC_ROUTES.indexOf(route);
  if (index > -1) {
    PUBLIC_ROUTES.splice(index, 1);
    console.log('➖ Rota pública removida:', route);
  }
}

/**
 * Obter lista de rotas públicas
 * @returns Array de rotas públicas
 */
export function getPublicRoutes(): string[] {
  return [...PUBLIC_ROUTES];
}