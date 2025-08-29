import type { Express } from "express";
import { createServer, type Server } from "http";
import { moduleRegistry } from './modules/module-registry';
import { routeGuard, moduleContext } from './middleware/module-guard';

export async function registerRoutes(app: Express): Promise<Server> {
  // Aplicar middlewares globais para gestão de módulos
  app.use(moduleContext);
  app.use(routeGuard);

  // Rota de health check (sempre ativa)
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      modules: moduleRegistry.getRegisteredModules()
    });
  });

  // Registrar todos os módulos ativos
  await moduleRegistry.registerEnabledModules(app);

  // Middleware para rotas não encontradas
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      message: 'Endpoint não encontrado ou módulo desativado',
      error: 'NOT_FOUND'
    });
  });

  const server = createServer(app);
  return server;
}