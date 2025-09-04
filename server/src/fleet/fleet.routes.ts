import { Router } from 'express';
import { FleetController } from './fleet.controller';

const router = Router();

// Vehicle routes
router.get('/vehicles', FleetController.getVehicles);
router.post('/vehicles', FleetController.createVehicle);
router.get('/vehicles/:id', FleetController.getVehicleById);
router.put('/vehicles/:id', FleetController.updateVehicle);
router.delete('/vehicles/:id', FleetController.deleteVehicle);

// Vehicle maintenance routes
router.get('/vehicles/:vehicleId/maintenance', FleetController.getVehicleMaintenance);
router.post('/maintenance', FleetController.createVehicleMaintenance);

// GPS tracking routes
router.get('/vehicles/:vehicleId/gps', FleetController.getGpsTracking);
router.post('/gps', FleetController.createGpsTracking);

// Vehicle assignment routes
router.get('/assignments', FleetController.getVehicleAssignments);
router.post('/assignments', FleetController.createVehicleAssignment);

// Geofence routes
router.get('/geofences', FleetController.getGeofences);
router.post('/geofences', FleetController.createGeofence);

// Fleet statistics
router.get('/statistics', FleetController.getFleetStatistics);

export default router;