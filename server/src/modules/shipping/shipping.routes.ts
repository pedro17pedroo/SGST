import { Router } from 'express';
import { ShippingController } from './shipping.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('shipping'));

// Rotas dos envios
router.get('/', ShippingController.getShipments);
router.get('/:id', ShippingController.getShipment);
router.get('/track/:trackingNumber', ShippingController.trackShipment);
router.post('/', ShippingController.createShipment);
router.put('/:id', ShippingController.updateShipment);
router.delete('/:id', ShippingController.deleteShipment);

export default router;