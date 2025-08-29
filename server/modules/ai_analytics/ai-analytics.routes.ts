import { Router } from 'express';
import { AIAnalyticsController } from './ai-analytics.controller.js';

const router = Router();

// Demand forecasting
router.post('/ai/forecast/demand', AIAnalyticsController.forecastDemand);
router.get('/ai/forecast/demand/:productId', AIAnalyticsController.getProductDemandForecast);
router.post('/ai/forecast/seasonal-analysis', AIAnalyticsController.analyzeSeasonalTrends);

// Inventory optimization
router.post('/ai/optimize/inventory', AIAnalyticsController.optimizeInventory);
router.get('/ai/optimize/reorder-points', AIAnalyticsController.calculateOptimalReorderPoints);
router.post('/ai/optimize/safety-stock', AIAnalyticsController.calculateSafetyStock);

// Price optimization
router.post('/ai/optimize/pricing', AIAnalyticsController.optimizePricing);
router.get('/ai/analyze/price-elasticity', AIAnalyticsController.analyzePriceElasticity);
router.post('/ai/recommend/promotions', AIAnalyticsController.recommendPromotions);

// Anomaly detection
router.get('/ai/anomalies/inventory', AIAnalyticsController.detectInventoryAnomalies);
router.get('/ai/anomalies/sales', AIAnalyticsController.detectSalesAnomalies);
router.post('/ai/anomalies/investigate', AIAnalyticsController.investigateAnomaly);

// Predictive maintenance
router.get('/ai/maintenance/predictions', AIAnalyticsController.predictMaintenanceNeeds);
router.post('/ai/maintenance/schedule', AIAnalyticsController.scheduleMaintenanceOptimally);

// Customer analytics
router.post('/ai/analyze/customer-segments', AIAnalyticsController.analyzeCustomerSegments);
router.post('/ai/predict/customer-churn', AIAnalyticsController.predictCustomerChurn);
router.post('/ai/recommend/products', AIAnalyticsController.recommendProducts);

// AI model management
router.get('/ai/models', AIAnalyticsController.listAIModels);
router.post('/ai/models/train', AIAnalyticsController.trainModel);
router.get('/ai/models/:modelId/performance', AIAnalyticsController.getModelPerformance);

export { router as aiAnalyticsRoutes };