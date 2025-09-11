import { Router } from 'express';
import { ReturnsController } from './returns.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(requireAuth);

// Rotas para devoluções
router.get('/', ReturnsController.getReturns);
router.get('/stats', requireRole(['admin', 'manager']), ReturnsController.getReturnsStats);
router.post('/generate-number', requireRole(['admin', 'manager', 'operator']), ReturnsController.generateReturnNumber);
router.get('/validate-number/:returnNumber', requireRole(['admin', 'manager', 'operator']), ReturnsController.validateReturnNumber);
router.get('/:id', ReturnsController.getReturn);
router.post('/', requireRole(['admin', 'manager', 'operator']), ReturnsController.createReturn);
router.put('/:id', requireRole(['admin', 'manager']), ReturnsController.updateReturn);
router.post('/:id/approve', requireRole(['admin', 'manager']), ReturnsController.approveReturn);
router.post('/:id/process', requireRole(['admin', 'manager']), ReturnsController.processReturn);
router.delete('/:id', requireRole(['admin']), ReturnsController.deleteReturn);

export default router;