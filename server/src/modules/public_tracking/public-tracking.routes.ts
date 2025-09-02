import { Router } from 'express';
import { PublicTrackingController } from './public-tracking.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('public_tracking'));

// Rotas públicas de rastreamento (sem autenticação)
router.get('/track/:trackingNumber', PublicTrackingController.trackShipment);
router.get('/track/:trackingNumber/history', PublicTrackingController.getShipmentHistory);
router.get('/track/:trackingNumber/status', PublicTrackingController.getShipmentStatus);
router.post('/track/notifications', PublicTrackingController.subscribeToNotifications);
router.get('/track/:trackingNumber/estimated-delivery', PublicTrackingController.getEstimatedDelivery);

// Product tracking by barcode
router.get('/product/:barcode/location', PublicTrackingController.getProductLocation);
router.get('/product/:barcode/journey', PublicTrackingController.getProductJourney);

// Batch tracking
router.get('/batch/:batchNumber/products', PublicTrackingController.getBatchProducts);
router.get('/batch/:batchNumber/status', PublicTrackingController.getBatchStatus);

export default router;