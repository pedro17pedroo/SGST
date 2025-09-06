import { Router } from 'express';
import { ShippingController } from './shipping.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('shipping'));

// Rota pública de rastreamento (sem autenticação)
router.get('/track/:trackingNumber', ShippingController.trackShipment);

// Aplicar autenticação para todas as outras rotas
router.use(requireAuth);

// Rotas para carriers (devem vir antes das rotas com parâmetros)
router.get('/carriers', ShippingController.getCarriers);
router.post('/carriers', ShippingController.createCarrier);

// Rota para buscar veículos disponíveis
router.get('/vehicles/available', ShippingController.getAvailableVehicles);

// Rotas dos envios
router.get('/', ShippingController.getShipments);
router.get('/active', ShippingController.getActiveShipments);
router.get('/:id', ShippingController.getShipment);
router.post('/', ShippingController.createShipment);
router.put('/:id', ShippingController.updateShipment);
router.delete('/:id', ShippingController.deleteShipment);

export default router;