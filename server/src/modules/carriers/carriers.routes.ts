import { Router } from 'express';
import { CarriersController } from './carriers.controller';

const router = Router();

// Rotas para gestão de transportadoras
router.get('/', CarriersController.getCarriers);
router.get('/active', CarriersController.getActiveCarriers);
router.get('/internal', CarriersController.getInternalCarriers);
router.get('/check-code/:code', CarriersController.checkCodeUniqueness);
router.post('/ensure-internal', CarriersController.ensureInternalCarrier);
router.get('/:id', CarriersController.getCarrierById);
router.post('/', CarriersController.createCarrier);
router.put('/:id', CarriersController.updateCarrier);
router.delete('/:id', CarriersController.deleteCarrier);

export default router;