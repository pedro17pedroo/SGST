import { Router } from 'express';
import { InventoryAlertsController } from './inventory-alerts.controller';

const router = Router();

// Alert management
router.get('/alerts', InventoryAlertsController.getAlerts);
router.get('/alerts/:id', InventoryAlertsController.getAlert);
router.post('/alerts', InventoryAlertsController.createAlert);
router.patch('/alerts/:id', InventoryAlertsController.updateAlert);
router.delete('/alerts/:id', InventoryAlertsController.deleteAlert);

// Alert triggers
router.get('/alerts/low-stock', InventoryAlertsController.getLowStockAlerts);
router.get('/alerts/overstock', InventoryAlertsController.getOverstockAlerts);
router.get('/alerts/expiry', InventoryAlertsController.getExpiryAlerts);
router.get('/alerts/dead-stock', InventoryAlertsController.getDeadStockAlerts);

// Alert configurations
router.get('/alert-settings', InventoryAlertsController.getAlertSettings);
router.post('/alert-settings', InventoryAlertsController.updateAlertSettings);

// Alert actions
router.post('/alerts/:id/acknowledge', InventoryAlertsController.acknowledgeAlert);
router.post('/alerts/:id/resolve', InventoryAlertsController.resolveAlert);
router.post('/alerts/bulk-action', InventoryAlertsController.bulkAlertAction);

export { router as inventoryAlertsRoutes };