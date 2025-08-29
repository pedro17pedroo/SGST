import { Router } from 'express';
import { PutawayManagementController } from './putaway.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('putaway_management'));

// Putaway Rules
router.post('/putaway/rules', PutawayManagementController.createPutawayRule);
router.get('/putaway/rules', PutawayManagementController.getPutawayRules);
router.get('/putaway/rules/:id', PutawayManagementController.getPutawayRule);
router.put('/putaway/rules/:id', PutawayManagementController.updatePutawayRule);
router.delete('/putaway/rules/:id', PutawayManagementController.deletePutawayRule);

// Putaway Tasks
router.post('/putaway/tasks', PutawayManagementController.createPutawayTask);
router.get('/putaway/tasks', PutawayManagementController.getPutawayTasks);
router.get('/putaway/tasks/:id', PutawayManagementController.getPutawayTask);
router.post('/putaway/tasks/:id/assign', PutawayManagementController.assignPutawayTask);
router.put('/putaway/tasks/:id/status', PutawayManagementController.updatePutawayTaskStatus);

// SSCC Pallets
router.post('/pallets', PutawayManagementController.createSsccPallet);
router.get('/pallets', PutawayManagementController.getSsccPallets);
router.get('/pallets/:id', PutawayManagementController.getSsccPallet);
router.post('/pallets/:palletId/items', PutawayManagementController.addItemToPallet);
router.get('/pallets/:id/items', PutawayManagementController.getPalletItems);
router.put('/pallets/:id/status', PutawayManagementController.updatePalletStatus);

// Smart Algorithms
router.post('/putaway/suggest-location', PutawayManagementController.suggestOptimalLocation);
router.post('/putaway/evaluate-crossdock', PutawayManagementController.evaluateCrossDock);
router.get('/putaway/stats', PutawayManagementController.getPutawayStats);

export default router;