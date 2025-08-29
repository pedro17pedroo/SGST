import { Router } from 'express';
import { WarehousesController } from './warehouses.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('warehouses'));

// Rotas dos armazéns
router.get('/', WarehousesController.getWarehouses);
router.get('/:id', WarehousesController.getWarehouse);
router.post('/', WarehousesController.createWarehouse);
router.put('/:id', WarehousesController.updateWarehouse);
router.delete('/:id', WarehousesController.deleteWarehouse);

export default router;