import { Router } from 'express';
import { FleetController } from './fleet.controller';

const router = Router();

// ===== VEHICLE MANAGEMENT =====
// Vehicles CRUD
router.get('/vehicles', FleetController.getVehicles);
router.get('/vehicles/:id', FleetController.getVehicle);
router.post('/vehicles', FleetController.createVehicle);
router.put('/vehicles/:id', FleetController.updateVehicle);
router.delete('/vehicles/:id', FleetController.deleteVehicle);

// Vehicle status and filtering
router.get('/vehicles/status/:status', FleetController.getVehiclesByStatus);
router.get('/vehicles/available', FleetController.getAvailableVehicles);

// Vehicle maintenance
router.get('/vehicles/:id/maintenance', FleetController.getVehicleMaintenance);
router.post('/vehicles/:id/maintenance', FleetController.createVehicleMaintenance);
router.put('/maintenance/:id', FleetController.updateVehicleMaintenance);
router.get('/maintenance/upcoming', FleetController.getUpcomingMaintenance);

// ===== GPS TRACKING =====
// Real-time GPS tracking
router.post('/gps/track', FleetController.createGpsTracking);
router.get('/vehicles/:id/location', FleetController.getVehicleCurrentLocation);
router.get('/vehicles/:id/location/history', FleetController.getVehicleGpsHistory);
router.get('/vehicles/locations/all', FleetController.getAllVehicleLocations);
router.put('/vehicles/:id/gps/status', FleetController.updateVehicleGpsStatus);

// ===== VEHICLE ASSIGNMENTS =====
// Vehicle-Order/Shipment assignments
router.get('/assignments', FleetController.getVehicleAssignments);
router.get('/assignments/:id', FleetController.getVehicleAssignment);
router.post('/assignments', FleetController.createVehicleAssignment);
router.put('/assignments/:id', FleetController.updateVehicleAssignment);

// Assignment filtering
router.get('/vehicles/:id/assignments/active', FleetController.getActiveAssignmentsByVehicle);
router.get('/drivers/:id/assignments/active', FleetController.getActiveAssignmentsByDriver);

// ===== GEOFENCING =====
// Geofence management
router.get('/geofences', FleetController.getGeofences);
router.get('/geofences/:id', FleetController.getGeofence);
router.post('/geofences', FleetController.createGeofence);
router.put('/geofences/:id', FleetController.updateGeofence);
router.delete('/geofences/:id', FleetController.deleteGeofence);
router.get('/geofences/active', FleetController.getActiveGeofences);

// Geofence alerts
router.get('/geofences/alerts', FleetController.getGeofenceAlerts);
router.post('/geofences/alerts', FleetController.createGeofenceAlert);
router.put('/geofences/alerts/:id/acknowledge', FleetController.acknowledgeGeofenceAlert);
router.get('/geofences/alerts/active', FleetController.getActiveGeofenceAlerts);

// ===== GPS SESSIONS =====
// GPS session management for mandatory GPS
router.post('/gps/sessions', FleetController.createGpsSession);
router.put('/gps/sessions/:id', FleetController.updateGpsSession);
router.get('/gps/sessions/active', FleetController.getActiveGpsSessions);
router.put('/gps/sessions/:id/end', FleetController.endGpsSession);

export { router as fleetRoutes };