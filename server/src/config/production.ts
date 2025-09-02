import cors from 'cors';
import { Express } from 'express';

// Configuração de CORS para produção
function getAllowedOrigins(): string[] {
  const origins = [];
  
  // Adicionar URL do frontend
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }
  
  // Adicionar origem CORS adicional
  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== process.env.FRONTEND_URL) {
    origins.push(process.env.CORS_ORIGIN);
  }
  
  // Adicionar localhost para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000', 'http://localhost:5173');
  }
  
  // Fallback para produção
  if (origins.length === 0) {
    origins.push('https://seu-dominio-frontend.com');
  }
  
  return origins;
}

export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log da tentativa de acesso não autorizada
    console.warn(`🚫 CORS: Origem não permitida: ${origin}`);
    return callback(new Error('Não permitido pelo CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Rate-Limit-Remaining'],
  maxAge: 86400, // 24 horas
  optionsSuccessStatus: 200 // Para suporte a browsers antigos
};

// Configuração de segurança para produção
export function configureProductionSecurity(app: Express) {
  // CORS
  app.use(cors(corsConfig));
  
  // Security headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict Transport Security (HTTPS only)
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';"
    );
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
  });
  
  // Rate limiting avançado
  const requestCounts = new Map();
  const suspiciousIPs = new Set();
  const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '900000'); // 15 minutos
  const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100');
  const RATE_LIMIT_STRICT = parseInt(process.env.RATE_LIMIT_STRICT || '20'); // Para IPs suspeitos
  
  app.use((req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const userAgent = req.get('User-Agent') || '';
    
    // Detectar comportamento suspeito
    const isSuspicious = (
      !userAgent || 
      userAgent.includes('bot') || 
      userAgent.includes('crawler') ||
      req.path.includes('..') ||
      req.path.includes('<script>')
    );
    
    if (isSuspicious) {
      suspiciousIPs.add(clientIP);
    }
    
    const maxRequests = suspiciousIPs.has(clientIP) ? RATE_LIMIT_STRICT : RATE_LIMIT_MAX;
    
    if (!requestCounts.has(clientIP)) {
      requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      res.setHeader('X-Rate-Limit-Remaining', maxRequests - 1);
      return next();
    }
    
    const clientData = requestCounts.get(clientIP);
    
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + RATE_LIMIT_WINDOW;
      res.setHeader('X-Rate-Limit-Remaining', maxRequests - 1);
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      console.warn(`🚫 Rate limit excedido para IP: ${clientIP} (${clientData.count}/${maxRequests})`);
      return res.status(429).json({
        error: 'Muitas solicitações',
        message: 'Limite de taxa excedido. Tente novamente mais tarde.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    res.setHeader('X-Rate-Limit-Remaining', maxRequests - clientData.count);
    next();
  });
  
  // Limpeza periódica de dados antigos
  setInterval(() => {
    const now = Date.now();
    Array.from(requestCounts.entries()).forEach(([ip, data]) => {
      if (now > data.resetTime) {
        requestCounts.delete(ip);
      }
    });
    // Limpar IPs suspeitos após 1 hora
    if (Math.random() < 0.1) { // 10% de chance a cada limpeza
      suspiciousIPs.clear();
    }
  }, 300000); // A cada 5 minutos
}

// Configuração de logging para produção
export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  file: process.env.LOG_FILE || '/var/log/sgst/app.log',
  maxSize: '10m',
  maxFiles: 5,
  format: 'combined'
};

// Configuração de performance
export const performanceConfig = {
  maxConnections: parseInt(process.env.MAX_CONNECTIONS || '100'),
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  keepAliveTimeout: 65000,
  headersTimeout: 66000
};