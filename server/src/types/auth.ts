import { Request, Response, NextFunction } from 'express';
import { User } from '../storage/types';

/**
 * Interface que estende Request do Express para incluir informações do utilizador autenticado
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Tipo para middleware de autenticação
 */
export type AuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;