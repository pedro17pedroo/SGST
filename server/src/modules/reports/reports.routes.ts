import { Router } from 'express';
import { ReportsController } from './reports.controller';

const router = Router();

// Advanced Reports endpoints
router.get('/inventory-turnover', ReportsController.getInventoryTurnoverReport);
router.get('/obsolete-inventory', ReportsController.getObsoleteInventoryReport);
router.get('/product-performance', ReportsController.getProductPerformanceReport);
router.get('/warehouse-efficiency', ReportsController.getWarehouseEfficiencyReport);
router.get('/stock-valuation', ReportsController.getStockValuationReport);
router.get('/supplier-performance', ReportsController.getSupplierPerformanceReport);

export default router;