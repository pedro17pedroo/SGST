import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('dashboard'));

// Aplicar autenticação a todas as rotas
router.use(requireAuth);

// Rotas do dashboard
router.get('/stats', requireRole(['admin', 'manager', 'user']), DashboardController.getStats);
router.get('/top-products', requireRole(['admin', 'manager', 'user']), DashboardController.getTopProducts);
router.get('/recent-activities', requireRole(['admin', 'manager', 'user']), DashboardController.getRecentActivities);
router.get('/overview', requireRole(['admin', 'manager', 'user']), DashboardController.getOverview);

export default router;