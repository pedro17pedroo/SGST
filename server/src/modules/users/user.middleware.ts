import { Request, Response, NextFunction } from 'express';

// Middleware específico do módulo de utilizadores
export function validateUserRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Esta implementação seria expandida com autenticação real
    const userRole = (req as any).user?.role || 'operator';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Acesso negado. Permissões insuficientes.',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  };
}

export function validateUserData(req: Request, res: Response, next: NextFunction) {
  const { username, email, password } = req.body;
  
  // Validações básicas (complementares ao Zod)
  if (req.method === 'POST') {
    if (!username || username.length < 3) {
      return res.status(400).json({
        message: 'Nome de utilizador deve ter pelo menos 3 caracteres'
      });
    }
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        message: 'Email inválido'
      });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: 'Password deve ter pelo menos 6 caracteres'
      });
    }
  }
  
  next();
}

export function logUserActions(req: Request, res: Response, next: NextFunction) {
  const { method, path, body } = req;
  const timestamp = new Date().toISOString();
  
  // Log das ações do utilizador (em produção, usar um sistema de logging apropriado)
  console.log(`[${timestamp}] User action: ${method} ${path}`, {
    userId: (req as any).user?.id,
    action: method,
    resource: 'users',
    data: method !== 'GET' ? body : undefined
  });
  
  next();
}