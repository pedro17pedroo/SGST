import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/auth';
import { verifyToken, extractTokenFromHeader, isAccessToken } from '../../config/jwt';
import { UserModel } from '../users/user.model';

// Middleware para verificar autenticação JWT
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log('🔐 === MIDDLEWARE requireAuth JWT INICIADO ===');
  console.log('🔐 URL:', req.method, req.url);
  console.log('🔐 Authorization Header:', req.headers.authorization);
  
  // Extrair token do header Authorization
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    console.log('❌ Token JWT não fornecido - retornando 401');
    return res.status(401).json({
      message: 'Acesso negado. Token de autenticação necessário.',
      error: 'NO_TOKEN_PROVIDED'
    });
  }
  
  // Verificar e decodificar token
  const payload = verifyToken(token);
  
  if (!payload) {
    console.log('❌ Token JWT inválido ou expirado - retornando 401');
    return res.status(401).json({
      message: 'Token inválido ou expirado. Faça login novamente.',
      error: 'INVALID_TOKEN'
    });
  }
  
  // Verificar se é um access token
  if (!isAccessToken(payload)) {
    console.log('❌ Token não é do tipo access - retornando 401');
    return res.status(401).json({
      message: 'Tipo de token inválido.',
      error: 'INVALID_TOKEN_TYPE'
    });
  }
  
  console.log('✅ Token JWT válido para usuário:', payload.email);
  
  // Adicionar dados do usuário ao request
  (req as AuthenticatedRequest).user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    username: payload.email, // Fallback para compatibilidade
    password: '', // Não incluir senha por segurança
    isActive: true, // Assumir ativo se token é válido
    createdAt: null // Não necessário para autenticação
  };
  
  console.log('🔐 === MIDDLEWARE requireAuth JWT CONCLUÍDO - PASSANDO PARA PRÓXIMO ===');
  next();
}

// Middleware para verificar roles específicos
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Primeiro verificar autenticação JWT
    requireAuth(req, res, () => {
      const user = (req as AuthenticatedRequest).user;
      
      if (!user) {
        return res.status(401).json({
          message: 'Acesso negado. Faça login para continuar.',
          error: 'NOT_AUTHENTICATED'
        });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: 'Acesso negado. Permissões insuficientes.',
          error: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole: user.role
        });
      }
      
      next();
    });
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