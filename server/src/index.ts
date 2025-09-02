import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import { registerRoutes } from "./routes";
// Função simples de log
const log = (message: string) => console.log(message);
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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
  app.use(cors(corsOptions));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração de sessões
const sessionSecret = process.env.SESSION_SECRET || 'sgst-development-secret-key';
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'sgst-session',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: 'lax'
  },
  rolling: true // Reset expiry on each request
}));

app.use((req, res, next) => {
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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Servir ficheiros estáticos em produção
  if (process.env.NODE_ENV === "production") {
    app.use(express.static('public'));
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, '127.0.0.1', () => {
    log(`serving on port ${port}`);
  });
})();
