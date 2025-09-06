import { Router } from 'express';
import { PutawayManagementController } from './putaway.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('putaway_management'));

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Putaway Rules
router.post('/putaway/rules', requireRole(['admin', 'manager']), PutawayManagementController.createPutawayRule);
router.get('/putaway/rules', PutawayManagementController.getPutawayRules);
router.get('/putaway/rules/:id', PutawayManagementController.getPutawayRule);
router.put('/putaway/rules/:id', requireRole(['admin', 'manager']), PutawayManagementController.updatePutawayRule);
router.delete('/putaway/rules/:id', requireRole(['admin']), PutawayManagementController.deletePutawayRule);

// Putaway Tasks
router.post('/putaway/tasks', requireRole(['admin', 'manager', 'operator']), PutawayManagementController.createPutawayTask);
router.get('/putaway/tasks', PutawayManagementController.getPutawayTasks);
router.get('/putaway/tasks/:id', PutawayManagementController.getPutawayTask);
router.post('/putaway/tasks/:id/assign', requireRole(['admin', 'manager', 'operator']), PutawayManagementController.assignPutawayTask);
router.put('/putaway/tasks/:id/status', requireRole(['admin', 'manager', 'operator']), PutawayManagementController.updatePutawayTaskStatus);

// SSCC Pallets
router.post('/pallets', requireRole(['admin', 'manager', 'operator']), PutawayManagementController.createSsccPallet);
router.get('/pallets', PutawayManagementController.getSsccPallets);
router.get('/pallets/:id', PutawayManagementController.getSsccPallet);
router.post('/pallets/:palletId/items', requireRole(['admin', 'manager', 'operator']), PutawayManagementController.addItemToPallet);
router.get('/pallets/:id/items', PutawayManagementController.getPalletItems);
router.put('/pallets/:id/status', requireRole(['admin', 'manager', 'operator']), PutawayManagementController.updatePalletStatus);

// Smart Algorithms
router.post('/putaway/suggest-location', PutawayManagementController.suggestOptimalLocation);
router.post('/putaway/evaluate-crossdock', PutawayManagementController.evaluateCrossDock);
router.get('/putaway/stats', PutawayManagementController.getPutawayStats);

export default router;