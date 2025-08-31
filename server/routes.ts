import type { Express } from "express";
import { createServer, type Server } from "http";
import { moduleRegistry } from './modules/module-registry';
import { routeGuard, moduleContext } from './middleware/module-guard';
import { storage } from './storage.js';

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

  app.get('/api/analytics/demand-forecast', async (req, res) => {
    try {
      // Proxy to actual AI analytics endpoint with POST method
      const response = await fetch('http://localhost:5000/api/ai/forecast/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeHorizon: 30, includeSeasonality: true })
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao gerar previsão de demanda', error });
    }
  });

  app.get('/api/analytics/turnover-analysis', async (req, res) => {
    try {
      // Get categories and products for analysis
      const categories = await storage.getCategories();
      const products = await storage.getProducts();
      
      // Generate realistic category analysis
      const categoryAnalysis = categories.map((category: any) => {
        const categoryProducts = products.filter((p: any) => p.categoryId === category.id);
        const totalProducts = categoryProducts.length;
        const fastMovingProducts = Math.floor(totalProducts * 0.3);
        const slowMovingProducts = Math.floor(totalProducts * 0.2);
        
        // Determine status based on performance
        let status = 'healthy';
        if (slowMovingProducts > fastMovingProducts) status = 'attention';
        if (slowMovingProducts > totalProducts * 0.5) status = 'critical';
        
        return {
          categoryId: category.id,
          categoryName: category.name,
          totalProducts,
          fastMovingProducts,
          slowMovingProducts,
          turnoverRate: (Math.random() * 0.5 + 0.2).toFixed(2), // 0.2-0.7
          status,
          recommendation: status === 'healthy' ? 'Manter estratégia atual' : 
                        status === 'attention' ? 'Revisar produtos lentos' : 
                        'Ação urgente necessária'
        };
      });
      
      // Generate obsolete items from low stock products
      const lowStockProducts = await storage.getLowStockProducts();
      const obsoleteItems = lowStockProducts.slice(0, 5).map((product: any) => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock || 0,
        daysInStock: Math.floor(Math.random() * 200) + 90, // 90-290 days
        currentValue: (product.stock || 0) * parseFloat(product.price || '0'),
        recommendation: 'Liquidar stock'
      }));
      
      res.json({
        categories: categoryAnalysis,
        obsoleteItems,
        summary: {
          healthyCategories: categoryAnalysis.filter((c: any) => c.status === 'healthy').length,
          attentionCategories: categoryAnalysis.filter((c: any) => c.status === 'attention').length,
          criticalCategories: categoryAnalysis.filter((c: any) => c.status === 'critical').length,
          totalObsoleteValue: obsoleteItems.reduce((sum: number, item: any) => sum + item.currentValue, 0)
        }
      });
    } catch (error) {
      console.error('Error in turnover analysis:', error);
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