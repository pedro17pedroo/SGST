import { Router } from 'express';
import { PickingPackingController } from './picking-packing.controller';

const router = Router();

// Picking Lists Management
router.get('/picking-lists', PickingPackingController.getPickingLists);
router.get('/picking-lists/:id', PickingPackingController.getPickingList);
router.post('/picking-lists', PickingPackingController.createPickingList);
router.patch('/picking-lists/:id', PickingPackingController.updatePickingList);
router.delete('/picking-lists/:id', PickingPackingController.deletePickingList);

// Picking Operations
router.post('/picking-lists/:id/start', PickingPackingController.startPicking);
router.post('/picking-lists/:id/complete', PickingPackingController.completePicking);
router.post('/picking-lists/items/:itemId/pick', PickingPackingController.pickItem);
router.post('/picking-lists/items/:itemId/verify', PickingPackingController.verifyPickedItem);

// Wave Picking
router.post('/picking-lists/waves', PickingPackingController.createPickingWave);
router.get('/picking-lists/waves/:waveId', PickingPackingController.getPickingWave);
router.post('/picking-lists/waves/:waveId/assign', PickingPackingController.assignWaveToUser);

// Packing Operations
router.get('/packing-tasks', PickingPackingController.getPackingTasks);
router.post('/packing-tasks', PickingPackingController.createPackingTask);
router.post('/packing-tasks/:id/pack', PickingPackingController.packItems);
router.post('/packing-tasks/:id/complete', PickingPackingController.completePackaging);

// Shipping Integration
router.post('/shipping-labels', PickingPackingController.generateShippingLabel);
router.get('/picking-lists/:id/shipping-info', PickingPackingController.getShippingInfo);

export { router as pickingPackingRoutes };