import { Router } from 'express';
import { BatchManagementController } from './batch-management.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('batch_management'));

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Batch management endpoints
router.get('/batches', BatchManagementController.getBatches);
router.get('/batches/:id', BatchManagementController.getBatch);
router.post('/batches', requireRole(['admin', 'manager', 'operator']), BatchManagementController.createBatch);
router.patch('/batches/:id', requireRole(['admin', 'manager']), BatchManagementController.updateBatch);
router.delete('/batches/:id', requireRole(['admin']), BatchManagementController.deleteBatch);

// Batch operations
router.post('/batches/:id/products', requireRole(['admin', 'manager', 'operator']), BatchManagementController.addProductsToBatch);
router.delete('/batches/:id/products/:productId', requireRole(['admin', 'manager']), BatchManagementController.removeProductFromBatch);
router.get('/batches/:id/expiry-alerts', BatchManagementController.getExpiryAlerts);

// Expiry management
router.get('/products/expiring', BatchManagementController.getExpiringProducts);
router.get('/products/expired', BatchManagementController.getExpiredProducts);
router.post('/batches/extend-expiry', requireRole(['admin', 'manager']), BatchManagementController.extendBatchExpiry);

// Batch tracking
router.get('/batches/:batchNumber/history', BatchManagementController.getBatchHistory);
router.get('/batches/:batchNumber/location', BatchManagementController.getBatchLocation);

export { router as batchManagementRoutes };