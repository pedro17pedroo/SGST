import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../types/auth';
import { UserModel } from '../users/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware para verificar token JWT
export function requireJWTAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token de acesso requerido',
      error: 'NO_TOKEN'
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer '
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Adicionar utilizador ao request
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      password: '', // Não incluir password no token
      role: decoded.role,
      isActive: decoded.isActive,
      createdAt: null
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido',
      error: 'INVALID_TOKEN'
    });
  }
}

// Middleware para verificar roles específicos com JWT
export function requireJWTRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        message: 'Token de acesso requerido',
        error: 'NO_USER'
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
  };
}

// Função para gerar token JWT
export function generateJWTToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Middleware híbrido que aceita tanto sessão quanto JWT
export function requireHybridAuth(req: Request, res: Response, next: NextFunction) {
  // Primeiro tenta autenticação por sessão
  const sessionUser = (req.session as any)?.user;
  
  if (sessionUser) {
    (req as AuthenticatedRequest).user = sessionUser;
    return next();
  }
  
  // Se não há sessão, tenta JWT
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Acesso negado. Faça login para continuar.',
      error: 'NOT_AUTHENTICATED'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    (req as AuthenticatedRequest).user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      password: '', // Não incluir password no token
      role: decoded.role,
      isActive: decoded.isActive,
      createdAt: null
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou sessão expirada',
      error: 'INVALID_AUTH'
    });
  }
}