import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/auth';

// Middleware para verificar autenticação
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log('🔐 === MIDDLEWARE requireAuth INICIADO ===');
  console.log('🔐 URL:', req.method, req.url);
  console.log('🔐 Session ID:', req.sessionID);
  console.log('🔐 Session Store:', req.session);
  console.log('🔐 Session Cookie:', req.headers.cookie);
  console.log('🔐 User-Agent:', req.headers['user-agent']);
  console.log('🔐 Origin:', req.headers.origin);
  console.log('🔐 Referer:', req.headers.referer);
  
  const sessionUser = (req.session as any)?.user;
  console.log('🔐 Session User:', sessionUser);
  console.log('🔐 Session exists:', !!req.session);
  console.log('🔐 Session.user exists:', !!(req.session as any)?.user);
  
  if (!sessionUser) {
    console.log('❌ Usuário não autenticado - retornando 401');
    return res.status(401).json({
      message: 'Acesso negado. Faça login para continuar.',
      error: 'NOT_AUTHENTICATED'
    });
  }
  
  console.log('✅ Usuário autenticado:', sessionUser.email || sessionUser.username);
  // Adicionar utilizador ao request para usar noutros middlewares
  (req as AuthenticatedRequest).user = sessionUser;
  console.log('🔐 === MIDDLEWARE requireAuth CONCLUÍDO - PASSANDO PARA PRÓXIMO ===');
  next();
}

// Middleware para verificar roles específicos
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
    
    (req as AuthenticatedRequest).user = sessionUser;
    next();
  };
}

// Middleware para verificar se é admin
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['admin'])(req, res, next);
}

// Middleware para verificar se é manager ou admin
export function requireManager(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return requireRole(['admin', 'manager'])(req, res, next);
}