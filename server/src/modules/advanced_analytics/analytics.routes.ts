import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(requireAuth);

// Rotas de analytics avançadas
router.get('/demand-forecast', requireRole(['admin', 'manager']), AnalyticsController.getDemandForecast);
router.get('/turnover-analysis', requireRole(['admin', 'manager']), AnalyticsController.getTurnoverAnalysis);
router.get('/inventory-optimization', requireRole(['admin', 'manager']), AnalyticsController.getInventoryOptimization);
router.get('/performance-metrics', requireRole(['admin', 'manager']), AnalyticsController.getPerformanceMetrics);

export default router;
