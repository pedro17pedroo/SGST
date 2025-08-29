import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('inventory'));

// Rotas do inventário
router.get('/', InventoryController.getAllInventory);
router.get('/low-stock', InventoryController.getLowStockProducts);
router.get('/warehouse/:warehouseId', InventoryController.getInventoryByWarehouse);
router.get('/product/:productId', InventoryController.getProductInventory);
router.put('/product/:productId/warehouse/:warehouseId', InventoryController.updateInventory);

export default router;