import { Router } from 'express';
import { InventoryCountsController } from './inventory-counts.controller';

const router = Router();

// Inventory counts endpoints
router.get('/inventory-counts', InventoryCountsController.getInventoryCounts);
router.get('/inventory-counts/:id', InventoryCountsController.getInventoryCount);
router.post('/inventory-counts', InventoryCountsController.createInventoryCount);
router.patch('/inventory-counts/:id', InventoryCountsController.updateInventoryCount);
router.delete('/inventory-counts/:id', InventoryCountsController.deleteInventoryCount);

// Inventory count items
router.get('/inventory-counts/:countId/items', InventoryCountsController.getInventoryCountItems);
router.post('/inventory-counts/:countId/items', InventoryCountsController.createInventoryCountItem);
router.patch('/inventory-count-items/:id', InventoryCountsController.updateInventoryCountItem);

// Reconciliation
router.post('/inventory-counts/:id/reconcile', InventoryCountsController.reconcileInventoryCount);
router.post('/inventory-counts/:id/complete', InventoryCountsController.completeInventoryCount);

// Generate count lists
router.post('/inventory-counts/:id/generate-list', InventoryCountsController.generateCountList);

export { router as inventoryCountsRoutes };