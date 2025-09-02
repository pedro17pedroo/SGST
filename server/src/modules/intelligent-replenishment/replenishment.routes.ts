import { Router } from 'express';
import { IntelligentReplenishmentController } from './replenishment.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('intelligent_replenishment'));

// Replenishment Rules
router.post('/replenishment/rules', IntelligentReplenishmentController.createReplenishmentRule);
router.get('/replenishment/rules', IntelligentReplenishmentController.getReplenishmentRules);
router.get('/replenishment/rules/:id', IntelligentReplenishmentController.getReplenishmentRule);
router.put('/replenishment/rules/:id', IntelligentReplenishmentController.updateReplenishmentRule);
router.delete('/replenishment/rules/:id', IntelligentReplenishmentController.deleteReplenishmentRule);
router.post('/replenishment/rules/bulk-update', IntelligentReplenishmentController.bulkUpdateRules);

// Demand Forecasting
router.post('/replenishment/forecast', IntelligentReplenishmentController.generateDemandForecast);
router.get('/replenishment/forecasts', IntelligentReplenishmentController.getDemandForecasts);
router.get('/replenishment/forecasts/:id', IntelligentReplenishmentController.getDemandForecast);

// Stock-out Alerts
router.get('/replenishment/alerts', IntelligentReplenishmentController.getStockoutAlerts);

// Automatic Replenishment
router.post('/replenishment/generate-orders', IntelligentReplenishmentController.generateReplenishmentOrders);

// Analytics & Statistics
router.get('/replenishment/stats', IntelligentReplenishmentController.getReplenishmentStats);
router.get('/replenishment/analytics', IntelligentReplenishmentController.getAdvancedAnalytics);

export default router;