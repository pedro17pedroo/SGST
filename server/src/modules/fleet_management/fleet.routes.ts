import { Router } from 'express';
import { FleetController } from './fleet.controller';

const router = Router();

// TODO: Reativar rotas quando FleetController for restaurado
// ===== VEHICLE MANAGEMENT =====
// Vehicles CRUD
router.get('/vehicles', FleetController.placeholder);
router.get('/vehicles/:id', FleetController.placeholder);
router.post('/vehicles', FleetController.placeholder);
router.put('/vehicles/:id', FleetController.placeholder);
router.delete('/vehicles/:id', FleetController.placeholder);

// Vehicle status and filtering
router.get('/vehicles/status/:status', FleetController.placeholder);
router.get('/vehicles/available', FleetController.placeholder);

// ===== VEHICLE MAINTENANCE =====
router.get('/vehicles/:id/maintenance', FleetController.placeholder);
router.post('/vehicles/:id/maintenance', FleetController.placeholder);
router.put('/maintenance/:id', FleetController.placeholder);
router.get('/maintenance/upcoming', FleetController.placeholder);

// ===== GPS TRACKING =====
router.post('/gps/track', FleetController.placeholder);
router.get('/vehicles/:id/location', FleetController.placeholder);
router.get('/vehicles/:id/location/history', FleetController.placeholder);
router.get('/vehicles/locations/all', FleetController.placeholder);
router.put('/vehicles/:id/gps/status', FleetController.placeholder);

// ===== VEHICLE ASSIGNMENTS =====
router.get('/assignments', FleetController.placeholder);
router.get('/assignments/:id', FleetController.placeholder);
router.post('/assignments', FleetController.placeholder);
router.put('/assignments/:id', FleetController.placeholder);

// Assignment queries
router.get('/vehicles/:id/assignments/active', FleetController.placeholder);
router.get('/drivers/:id/assignments/active', FleetController.placeholder);

// ===== GEOFENCING =====
// Geofences CRUD
router.get('/geofences', FleetController.placeholder);
router.get('/geofences/:id', FleetController.placeholder);
router.post('/geofences', FleetController.placeholder);
router.put('/geofences/:id', FleetController.placeholder);
router.delete('/geofences/:id', FleetController.placeholder);
router.get('/geofences/active', FleetController.placeholder);

// Geofence alerts
router.get('/geofences/alerts', FleetController.placeholder);
router.post('/geofences/alerts', FleetController.placeholder);
router.put('/geofences/alerts/:id/acknowledge', FleetController.placeholder);
router.get('/geofences/alerts/active', FleetController.placeholder);

// ===== GPS SESSIONS =====
router.post('/gps/sessions', FleetController.placeholder);
router.put('/gps/sessions/:id', FleetController.placeholder);
router.get('/gps/sessions/active', FleetController.placeholder);
router.put('/gps/sessions/:id/end', FleetController.placeholder);

export { router as fleetRoutes };