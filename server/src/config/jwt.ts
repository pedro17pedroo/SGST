import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Gera um token JWT de acesso
 * @param user - Dados do usuário
 * @returns Token JWT
 */
export function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'access'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sgst-api',
    audience: 'sgst-client'
  } as any) as string;
}

/**
 * Gera um token JWT de refresh
 * @param user - Dados do usuário
 * @returns Refresh token JWT
 */
export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'sgst-api',
    audience: 'sgst-client'
  } as any) as string;
}

/**
 * Verifica e decodifica um token JWT
 * @param token - Token JWT
 * @returns Payload decodificado ou null se inválido
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'sgst-api',
      audience: 'sgst-client'
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token JWT:', error);
    return null;
  }
}

/**
 * Extrai o token do header Authorization
 * @param authHeader - Header Authorization
 * @returns Token ou null
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Gera um par de tokens (access + refresh)
 * @param user - Dados do usuário
 * @returns Objeto com access token e refresh token
 */
export function generateTokenPair(user: User) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: JWT_EXPIRES_IN
  };
}

/**
 * Verifica se um token é do tipo refresh
 * @param payload - Payload do token
 * @returns true se for refresh token
 */
export function isRefreshToken(payload: JWTPayload): boolean {
  return payload.type === 'refresh';
}

/**
 * Verifica se um token é do tipo access
 * @param payload - Payload do token
 * @returns true se for access token
 */
export function isAccessToken(payload: JWTPayload): boolean {
  return payload.type === 'access';
}