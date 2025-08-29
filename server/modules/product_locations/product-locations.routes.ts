import { Router } from 'express';
import { ProductLocationsController } from './product-locations.controller';

const router = Router();

// Product locations endpoints
router.get('/product-locations', ProductLocationsController.getProductLocations);
router.get('/product-locations/:id', ProductLocationsController.getProductLocation);
router.post('/product-locations', ProductLocationsController.createProductLocation);
router.patch('/product-locations/:id', ProductLocationsController.updateProductLocation);
router.delete('/product-locations/:id', ProductLocationsController.deleteProductLocation);

// Location management
router.get('/warehouses/:warehouseId/locations', ProductLocationsController.getWarehouseLocations);
router.post('/product-locations/bulk-assign', ProductLocationsController.bulkAssignLocations);
router.get('/product-locations/search/:productId', ProductLocationsController.findProductLocation);

// Zone and bin management
router.get('/warehouses/:warehouseId/zones', ProductLocationsController.getWarehouseZones);
router.post('/warehouses/:warehouseId/zones', ProductLocationsController.createZone);

export { router as productLocationsRoutes };