import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../types/auth';
import { UserModel } from '../users/user.model';
import { verifyToken, extractTokenFromHeader, isAccessToken } from '../../config/jwt';
import type { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Interface para o payload do JWT
interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  iat?: number;
  exp?: number;
}

// Interface para dados do usuário no token
interface TokenUserData {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

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
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
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
export function generateJWTToken(user: TokenUserData): string {
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
  const sessionUser = (req as any).session?.user as User | undefined;
  
  if (sessionUser) {
    (req as AuthenticatedRequest).user = sessionUser;
    return next();
  }
  
  // Se não há sessão, tenta JWT usando o mesmo sistema do requireAuth
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({
      message: 'Acesso negado. Faça login para continuar.',
      error: 'NOT_AUTHENTICATED'
    });
  }
  
  // Verificar e decodificar token usando o sistema unificado
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({
      message: 'Token inválido ou expirado. Faça login novamente.',
      error: 'INVALID_TOKEN'
    });
  }
  
  // Verificar se é um access token
  if (!isAccessToken(payload)) {
    return res.status(401).json({
      message: 'Tipo de token inválido.',
      error: 'INVALID_TOKEN_TYPE'
    });
  }
  
  // Adicionar dados do usuário ao request usando a estrutura correta
  (req as AuthenticatedRequest).user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    username: payload.email, // Fallback para compatibilidade
    password: '', // Não incluir password no token
    isActive: true, // Assumir ativo se o token é válido
    createdAt: null
  };
  
  next();
}