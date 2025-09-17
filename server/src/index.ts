import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";

import { registerRoutes } from "./routes";
import { authBypassMiddleware } from "./middleware/auth-bypass.middleware";
// Função simples de log
const log = (message: string) => console.log(message);

console.log('🚀 === SERVIDOR INICIANDO - TESTE DE CONSOLE.LOG ===');
console.log('🚀 Timestamp:', new Date().toISOString());
import { corsConfig, configureProductionSecurity } from "./config/production";

const app = express();

// Configurar segurança para produção
if (process.env.NODE_ENV === 'production') {
  log("🔒 Configurando segurança de produção...");
  configureProductionSecurity(app);
  app.use(cors(corsConfig));
} else {
  // CORS configuration for development
  const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
  app.use(cors(corsOptions));
}
// MIDDLEWARE GLOBAL DE LOG (SEM INTERCEPTAÇÃO DE ROTAS DE TESTE)
// Este middleware apenas registra as requisições sem interceptar
app.use((req, res, next) => {
  console.log('🔍 === MIDDLEWARE GLOBAL EXECUTADO ===');
  console.log('🔍 URL:', req.url);
  console.log('🔍 Method:', req.method);
  console.log('🔍 Path:', req.path);
  
  // Continuar normalmente para todas as rotas (sem interceptação)
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Aplicar middleware de autenticação ANTES de todas as rotas
app.use(authBypassMiddleware);

// ROTA DE TESTE DIRETA PARA VERIFICAR MIDDLEWARE
app.get('/api/middleware-test', (req, res) => {
  console.log('🧪 Rota de teste direta acessada - ANTES do registro de módulos');
  res.json({ 
    message: 'Middleware test route working!', 
    timestamp: new Date().toISOString(),
    note: 'Esta rota foi registrada ANTES dos módulos'
  });
});

// JWT não requer configuração de sessões - autenticação via Authorization header

app.use((req, res, next) => {
  console.log('HTTP_REQUEST_LOG:', req.method, req.path);
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Rota de teste DEPOIS do middleware de bypass
app.get('/api/pre-middleware-test', (req, res) => {
  console.log('🧪 Rota de teste com middleware de bypass acessada');
  res.json({ 
    message: 'Pre-middleware test successful!', 
    timestamp: new Date().toISOString(),
    note: 'Esta rota foi registrada depois do middleware de bypass'
  });
});

// Rota de teste direta para debug
app.get('/api/test-direct', (req, res) => {
  res.json({ message: 'Test route working!', timestamp: new Date().toISOString() });
});

// Rota de teste adicional para debug
app.get('/api/debug-test', (req, res) => {
  console.log('🔍 Rota de debug acessada - sem middleware de autenticação');
  res.json({ 
    message: 'Debug route working - no auth required!', 
    timestamp: new Date().toISOString(),
    headers: req.headers,
    url: req.url,
    method: req.method
  });
});

// Rota de teste FORA do prefixo /api para confirmar se o problema está no prefixo
app.get('/test-no-api-prefix', (req, res) => {
  console.log('🧪 Rota de teste FORA do prefixo /api acessada');
  res.json({ 
    message: 'Test route outside /api prefix working!', 
    timestamp: new Date().toISOString(),
    note: 'Esta rota está fora do prefixo /api'
  });
});

// Nova rota de teste simples para verificar o problema
app.get('/api/simple-test', (req, res) => {
  console.log('🧪 Simple test route hit - no middleware');
  res.json({ 
    message: 'Simple test successful', 
    timestamp: new Date().toISOString(),
    headers: req.headers,
    method: req.method,
    url: req.url
  });
});

// Rota de teste para verificar bypass de autenticação
app.get('/api/before-modules-test', (req, res) => {
  console.log('🧪 === ROTA DE TESTE BEFORE-MODULES ACESSADA ===');
  console.log('🧪 Path:', req.path);
  console.log('🧪 Method:', req.method);
  console.log('🧪 Headers:', req.headers);
  
  res.status(200).json({
    success: true,
    message: 'Test route /api/before-modules-test accessed successfully!',
    timestamp: new Date().toISOString(),
    path: req.path,
    url: req.url,
    method: req.method,
    note: 'Esta rota foi registrada ANTES dos módulos e funciona sem autenticação'
  });
});

(async () => {
  const server = await registerRoutes(app);

  // Rotas de teste DEPOIS do registro dos módulos
  app.get('/api/post-modules-test', (req, res) => {
    console.log('🧪 Rota de teste DEPOIS dos módulos acessada');
    res.json({ 
      message: 'Post-modules test successful!', 
      timestamp: new Date().toISOString(),
      note: 'Esta rota foi registrada DEPOIS dos módulos'
    });
  });

  app.get('/test-post-modules-no-api', (req, res) => {
    console.log('🧪 Rota de teste DEPOIS dos módulos (sem /api) acessada');
    res.json({ 
      message: 'Post-modules test (no /api) successful!', 
      timestamp: new Date().toISOString(),
      note: 'Esta rota foi registrada DEPOIS dos módulos e não usa /api'
    });
  });

  // Middleware para rotas não encontradas (apenas para APIs)
  app.use((req: Request, res: Response) => {
    res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
  });

  app.use((err: Error & { status?: number; statusCode?: number }, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('=== ERRO CAPTURADO NO MIDDLEWARE ===');
    console.error('URL:', req.method, req.originalUrl);
    console.error('Status:', status);
    console.error('Message:', message);
    console.error('Stack:', err.stack);
    console.error('Error completo:', err);
    console.error('=== FIM DO ERRO ===');
    
    res.status(status).json({ error: "Erro interno do servidor" });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // This serves only the API backend.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '4001', 10);
  server.listen(port, '127.0.0.1', () => {
    log(`serving on port ${port}`);
  });
})();
