import { Router } from 'express';
import { AlertsController } from './alerts.controller';
import { requireHybridAuth, requireJWTRole } from '../auth/jwt.middleware';

const router = Router();

// Todas as rotas requerem autenticação híbrida
router.use(requireHybridAuth);

// Rotas de alertas
router.get('/', AlertsController.getAllAlerts);
router.get('/:id', AlertsController.getAlert);
router.post('/', requireJWTRole(['admin', 'manager']), AlertsController.createAlert);
router.put('/:id', requireJWTRole(['admin', 'manager']), AlertsController.updateAlert);
router.post('/:id/acknowledge', AlertsController.acknowledgeAlert);
router.delete('/:id', requireJWTRole(['admin', 'manager']), AlertsController.deleteAlert);

export default router;