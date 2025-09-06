import { Router } from 'express';
import { FleetController } from './fleet.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('fleet_management'));

// Middleware de autenticação para todas as rotas de fleet
router.use(requireAuth);

// ===== VEHICLE MANAGEMENT =====
// Vehicles CRUD
router.get('/vehicles', FleetController.getVehicles);
router.get('/vehicles/:id', FleetController.getVehicle);
router.post('/vehicles', requireRole(['admin', 'manager']), FleetController.createVehicle);
router.put('/vehicles/:id', requireRole(['admin', 'manager']), FleetController.updateVehicle);
router.delete('/vehicles/:id', requireRole(['admin']), FleetController.deleteVehicle);

// Vehicle status and filtering
router.get('/vehicles/status/:status', FleetController.getVehiclesByStatus);
router.get('/vehicles/available', FleetController.getAvailableVehicles);

// ===== VEHICLE MAINTENANCE =====
router.get('/vehicles/:id/maintenance', FleetController.getVehicleMaintenance);
router.post('/vehicles/:id/maintenance', requireRole(['admin', 'manager', 'operator']), FleetController.createVehicleMaintenance);
router.put('/maintenance/:id', requireRole(['admin', 'manager']), FleetController.updateMaintenance);
router.get('/maintenance/upcoming', FleetController.getUpcomingMaintenance);

// ===== GPS TRACKING =====
router.post('/gps/track', requireRole(['admin', 'manager', 'operator']), FleetController.trackGPS);
router.get('/vehicles/:id/location', FleetController.getVehicleLocation);
router.get('/vehicles/:id/location/history', FleetController.getVehicleLocationHistory);
router.get('/vehicles/locations/all', FleetController.getAllVehicleLocations);
router.put('/vehicles/:id/gps/status', requireRole(['admin', 'manager']), FleetController.updateGPSStatus);

// ===== VEHICLE ASSIGNMENTS =====
router.get('/assignments', FleetController.getAssignments);
router.get('/assignments/:id', FleetController.getAssignment);
router.post('/assignments', requireRole(['admin', 'manager', 'operator']), FleetController.createAssignment);
router.put('/assignments/:id', requireRole(['admin', 'manager']), FleetController.updateAssignment);

// Assignment queries
router.get('/vehicles/:id/assignments/active', FleetController.getVehicleActiveAssignments);
router.get('/drivers/:id/assignments/active', FleetController.getDriverActiveAssignments);

// ===== GEOFENCING =====
// Geofences CRUD
router.get('/geofences', FleetController.getGeofences);
router.get('/geofences/:id', FleetController.getGeofence);
router.post('/geofences', requireRole(['admin', 'manager']), FleetController.createGeofence);
router.put('/geofences/:id', requireRole(['admin', 'manager']), FleetController.updateGeofence);
router.delete('/geofences/:id', requireRole(['admin']), FleetController.deleteGeofence);
router.get('/geofences/active', FleetController.getActiveGeofences);

// Geofence alerts
router.get('/geofences/alerts', FleetController.getGeofenceAlerts);
router.post('/geofences/alerts', requireRole(['admin', 'manager', 'operator']), FleetController.createGeofenceAlert);
router.put('/geofences/alerts/:id/acknowledge', requireRole(['admin', 'manager', 'operator']), FleetController.acknowledgeGeofenceAlert);
router.get('/geofences/alerts/active', FleetController.getActiveGeofenceAlerts);

// ===== GPS SESSIONS =====
router.post('/gps/sessions', requireRole(['admin', 'manager', 'operator']), FleetController.createGPSSession);
router.put('/gps/sessions/:id', requireRole(['admin', 'manager', 'operator']), FleetController.updateGPSSession);
router.get('/gps/sessions/active', FleetController.getActiveGPSSessions);
router.put('/gps/sessions/:id/end', requireRole(['admin', 'manager', 'operator']), FleetController.endGPSSession);

// ===== FLEET STATISTICS =====
router.get('/stats', FleetController.getFleetStats);

export { router as fleetRoutes };