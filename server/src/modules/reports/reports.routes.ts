import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('reports'));

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Basic Reports endpoints
router.get('/sales', requireRole(['admin', 'manager']), ReportsController.getSalesReport);
router.get('/inventory', requireRole(['admin', 'manager']), ReportsController.getInventoryReport);
router.get('/performance', requireRole(['admin', 'manager']), ReportsController.getPerformanceReport);

// Advanced Reports endpoints - requerem permissões de gestão
router.get('/inventory-turnover', requireRole(['admin', 'manager']), ReportsController.getInventoryTurnoverReport);
router.get('/obsolete-inventory', requireRole(['admin', 'manager']), ReportsController.getObsoleteInventoryReport);
router.get('/product-performance', requireRole(['admin', 'manager']), ReportsController.getProductPerformanceReport);
router.get('/warehouse-efficiency', requireRole(['admin', 'manager']), ReportsController.getWarehouseEfficiencyReport);
router.get('/stock-valuation', requireRole(['admin', 'manager']), ReportsController.getStockValuationReport);
router.get('/supplier-performance', requireRole(['admin', 'manager']), ReportsController.getSupplierPerformanceReport);

export default router;