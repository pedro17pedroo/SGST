import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('inventory'));

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Rotas do inventário
router.get('/', InventoryController.getAllInventory);
router.get('/summary', InventoryController.getInventorySummary);
router.get('/low-stock', InventoryController.getLowStockProducts);
router.get('/warehouse/:warehouseId', InventoryController.getInventoryByWarehouse);
router.get('/product/:productId', InventoryController.getProductInventory);
router.put('/product/:productId/warehouse/:warehouseId', requireRole(['admin', 'manager', 'operator']), InventoryController.updateInventory);

// Rotas para stock movements
router.get('/stock-movements', InventoryController.getStockMovements);
router.post('/stock-movements', requireRole(['admin', 'manager', 'operator']), InventoryController.createStockMovement);

// Rotas para warehouse zones
router.get('/warehouse-zones', InventoryController.getWarehouseZones);

export default router;