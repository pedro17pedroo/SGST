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

  // Rotas de compatibilidade/aliases para frontend
  app.get('/api/stock-alerts', async (req, res) => {
    try {
      // Redirecionar para alerts do inventário
      const response = await fetch(`http://localhost:5000/api/inventory-alerts/alerts`, {
        method: 'GET',
        headers: req.headers as any
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar alertas', error });
    }
  });

  app.get('/api/analytics/demand-forecast', (req, res) => {
    // Mock endpoint for demand forecast
    res.json({
      forecast: [
        { product: 'Produto A', demand: 150, period: '2024-02' },
        { product: 'Produto B', demand: 200, period: '2024-02' },
        { product: 'Produto C', demand: 75, period: '2024-02' }
      ],
      accuracy: 85,
      lastUpdated: new Date().toISOString()
    });
  });

  app.get('/api/analytics/turnover-analysis', async (req, res) => {
    try {
      // Redirecionar para relatório de turnover
      const response = await fetch(`http://localhost:5000/api/reports/inventory-turnover`, {
        method: 'GET',
        headers: req.headers as any
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar análise de turnover', error });
    }
  });

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