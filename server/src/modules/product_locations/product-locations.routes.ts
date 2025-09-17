import { Router } from 'express';
import { ProductLocationsController } from './product-locations.controller';

const router = Router();

// Product locations endpoints
router.get('/paginated', ProductLocationsController.getProductLocationsWithPagination);
router.get('/', ProductLocationsController.getProductLocations);
router.get('/:id', ProductLocationsController.getProductLocation);
router.post('/', ProductLocationsController.createProductLocation);
router.patch('/:id', ProductLocationsController.updateProductLocation);
router.delete('/:id', ProductLocationsController.deleteProductLocation);

// Location management
router.get('/warehouses/:warehouseId/locations', ProductLocationsController.getWarehouseLocations);
router.post('/bulk-assign', ProductLocationsController.bulkAssignLocations);
router.get('/search/:productId', ProductLocationsController.findProductLocation);

// Zone and bin management
router.get('/warehouses/:warehouseId/zones', ProductLocationsController.getWarehouseZones);
router.post('/warehouses/:warehouseId/zones', ProductLocationsController.createZone);

export { router as productLocationsRoutes };