import { Router } from 'express';
import { PublicTrackingController } from './public-tracking.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('public_tracking'));

// Rotas públicas de rastreamento (sem autenticação)
router.get('/track/:trackingNumber', PublicTrackingController.trackShipment);
router.get('/history/:trackingNumber', PublicTrackingController.getShipmentHistory);

export default router;