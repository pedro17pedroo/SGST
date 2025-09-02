import { Request, Response, NextFunction } from 'express';

// Middleware para verificar autenticação
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionUser = (req.session as any)?.user;
  
  if (!sessionUser) {
    return res.status(401).json({
      message: 'Acesso negado. Faça login para continuar.',
      error: 'NOT_AUTHENTICATED'
    });
  }
  
  // Adicionar utilizador ao request para usar noutros middlewares
  (req as any).user = sessionUser;
  next();
}

// Middleware para verificar roles específicos
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const sessionUser = (req.session as any)?.user;
    
    if (!sessionUser) {
      return res.status(401).json({
        message: 'Acesso negado. Faça login para continuar.',
        error: 'NOT_AUTHENTICATED'
      });
    }
    
    if (!allowedRoles.includes(sessionUser.role)) {
      return res.status(403).json({
        message: 'Acesso negado. Permissões insuficientes.',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: sessionUser.role
      });
    }
    
    (req as any).user = sessionUser;
    next();
  };
}

// Middleware para verificar se é admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin'])(req, res, next);
}

// Middleware para verificar se é manager ou admin
export function requireManager(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'manager'])(req, res, next);
}