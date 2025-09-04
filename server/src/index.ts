import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import { getSessionConfig } from './config/session';

import { registerRoutes } from "./routes";
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração de sessões
const isProduction = process.env.NODE_ENV === 'production';

app.use(session(getSessionConfig(isProduction)));

// Log da configuração de sessão para debug
if (isProduction) {
  log('🍪 Configuração de cookies para produção: secure=true, sameSite=none, store=Sequelize');
} else {
  log('🍪 Configuração de cookies para desenvolvimento: secure=false, sameSite=lax, store=Sequelize');
}

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

(async () => {
  const server = await registerRoutes(app);

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

  // Middleware para rotas não encontradas (apenas para APIs)
  app.use((req: Request, res: Response) => {
    res.status(404).json({ 
      message: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method
    });
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
