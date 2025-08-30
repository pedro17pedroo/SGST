import { Router } from 'express';
import { AutoSlottingController } from './auto-slotting.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('auto_slotting'));

// Slotting Analytics routes
router.get('/analytics', AutoSlottingController.getSlottingAnalytics);
router.get('/analytics/:id', AutoSlottingController.getSlottingAnalytic);
router.post('/analytics/calculate', AutoSlottingController.calculateSlottingAnalytics);
router.put('/analytics/:id/approve', AutoSlottingController.approveSlottingRecommendation);

// Product Affinity routes
router.get('/affinity', AutoSlottingController.getProductAffinity);
router.get('/affinity/:productId', AutoSlottingController.getProductAffinityByProduct);
router.post('/affinity/calculate', AutoSlottingController.calculateProductAffinity);

// Slotting Rules routes
router.get('/rules', AutoSlottingController.getSlottingRules);
router.get('/rules/:id', AutoSlottingController.getSlottingRule);
router.post('/rules', AutoSlottingController.createSlottingRule);
router.put('/rules/:id', AutoSlottingController.updateSlottingRule);
router.delete('/rules/:id', AutoSlottingController.deleteSlottingRule);

// ML Models routes
router.get('/models', AutoSlottingController.getMlModels);
router.get('/models/:id', AutoSlottingController.getMlModel);
router.post('/models', AutoSlottingController.createMlModel);
router.post('/models/:id/train', AutoSlottingController.trainMlModel);
router.post('/models/:id/deploy', AutoSlottingController.deployMlModel);

// Optimization Jobs routes
router.get('/optimization-jobs', AutoSlottingController.getOptimizationJobs);
router.get('/optimization-jobs/:id', AutoSlottingController.getOptimizationJob);
router.post('/optimization-jobs', AutoSlottingController.createOptimizationJob);
router.post('/optimization-jobs/:id/execute', AutoSlottingController.executeOptimizationJob);

// Optimization endpoints
router.post('/optimize-layout', AutoSlottingController.optimizeLayout);
router.post('/optimize-picking-routes', AutoSlottingController.optimizePickingRoutes);
router.get('/recommendations/:warehouseId', AutoSlottingController.getLayoutRecommendations);

export default router;