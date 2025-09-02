import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('dashboard'));

// Rotas do dashboard
router.get('/stats', DashboardController.getStats);
router.get('/top-products', DashboardController.getTopProducts);
router.get('/recent-activities', DashboardController.getRecentActivities);
router.get('/overview', DashboardController.getOverview);

export default router;