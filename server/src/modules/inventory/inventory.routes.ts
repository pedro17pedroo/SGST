import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { requireHybridAuth, requireJWTRole } from '../auth/jwt.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('inventory'));

// Todas as rotas requerem autenticação híbrida
router.use(requireHybridAuth);

// Rotas do inventário
router.get('/', InventoryController.getAllInventory);
router.get('/summary', InventoryController.getInventorySummary);
router.get('/low-stock', InventoryController.getLowStockProducts);
router.get('/warehouse/:warehouseId', InventoryController.getInventoryByWarehouse);
router.get('/product/:productId', InventoryController.getProductInventory);
router.put('/product/:productId/warehouse/:warehouseId', requireJWTRole(['admin', 'manager', 'operator']), InventoryController.updateInventory);

// Rotas para stock movements
router.get('/stock-movements', InventoryController.getStockMovements);
router.post('/stock-movements', requireJWTRole(['admin', 'manager', 'operator']), InventoryController.createStockMovement);

// Rotas para warehouse zones
router.get('/warehouse-zones', InventoryController.getWarehouseZones);

// Rotas para alertas de stock
router.get('/stock-alerts', InventoryController.getStockAlerts);

export default router;