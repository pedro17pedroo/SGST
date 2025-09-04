import { Router } from 'express';
import { FleetController } from './fleet.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Middleware de autenticação para todas as rotas de fleet
router.use(requireAuth);

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

// ===== VEHICLE MAINTENANCE =====
router.get('/vehicles/:id/maintenance', FleetController.getVehicleMaintenance);
router.post('/vehicles/:id/maintenance', FleetController.createVehicleMaintenance);
router.put('/maintenance/:id', FleetController.updateMaintenance);
router.get('/maintenance/upcoming', FleetController.getUpcomingMaintenance);

// ===== GPS TRACKING =====
router.post('/gps/track', FleetController.trackGPS);
router.get('/vehicles/:id/location', FleetController.getVehicleLocation);
router.get('/vehicles/:id/location/history', FleetController.getVehicleLocationHistory);
router.get('/vehicles/locations/all', FleetController.getAllVehicleLocations);
router.put('/vehicles/:id/gps/status', FleetController.updateGPSStatus);

// ===== VEHICLE ASSIGNMENTS =====
router.get('/assignments', FleetController.getAssignments);
router.get('/assignments/:id', FleetController.getAssignment);
router.post('/assignments', FleetController.createAssignment);
router.put('/assignments/:id', FleetController.updateAssignment);

// Assignment queries
router.get('/vehicles/:id/assignments/active', FleetController.getVehicleActiveAssignments);
router.get('/drivers/:id/assignments/active', FleetController.getDriverActiveAssignments);

// ===== GEOFENCING =====
// Geofences CRUD
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
router.post('/gps/sessions', FleetController.createGPSSession);
router.put('/gps/sessions/:id', FleetController.updateGPSSession);
router.get('/gps/sessions/active', FleetController.getActiveGPSSessions);
router.put('/gps/sessions/:id/end', FleetController.endGPSSession);

// ===== FLEET STATISTICS =====
router.get('/stats', FleetController.getFleetStats);

export { router as fleetRoutes };