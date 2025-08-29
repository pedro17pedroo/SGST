import { Router } from 'express';
import { BatchManagementController } from './batch-management.controller';

const router = Router();

// Batch management endpoints
router.get('/batches', BatchManagementController.getBatches);
router.get('/batches/:id', BatchManagementController.getBatch);
router.post('/batches', BatchManagementController.createBatch);
router.patch('/batches/:id', BatchManagementController.updateBatch);
router.delete('/batches/:id', BatchManagementController.deleteBatch);

// Batch operations
router.post('/batches/:id/products', BatchManagementController.addProductsToBatch);
router.delete('/batches/:id/products/:productId', BatchManagementController.removeProductFromBatch);
router.get('/batches/:id/expiry-alerts', BatchManagementController.getExpiryAlerts);

// Expiry management
router.get('/products/expiring', BatchManagementController.getExpiringProducts);
router.get('/products/expired', BatchManagementController.getExpiredProducts);
router.post('/batches/extend-expiry', BatchManagementController.extendBatchExpiry);

// Batch tracking
router.get('/batches/:batchNumber/history', BatchManagementController.getBatchHistory);
router.get('/batches/:batchNumber/location', BatchManagementController.getBatchLocation);

export { router as batchManagementRoutes };