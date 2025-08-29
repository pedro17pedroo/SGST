import { Router } from 'express';
import { GPSTrackingController } from './gps-tracking.controller.js';

const router = Router();

// Real-time tracking routes
router.post('/gps/track', GPSTrackingController.updateLocation);
router.get('/gps/track/:trackingId', GPSTrackingController.getLocation);
router.get('/gps/track/:trackingId/history', GPSTrackingController.getLocationHistory);

// Device management
router.post('/gps/devices', GPSTrackingController.registerDevice);
router.get('/gps/devices', GPSTrackingController.listDevices);
router.put('/gps/devices/:deviceId', GPSTrackingController.updateDevice);
router.delete('/gps/devices/:deviceId', GPSTrackingController.deleteDevice);

// Geofencing
router.post('/gps/geofences', GPSTrackingController.createGeofence);
router.get('/gps/geofences', GPSTrackingController.listGeofences);
router.put('/gps/geofences/:geofenceId', GPSTrackingController.updateGeofence);
router.delete('/gps/geofences/:geofenceId', GPSTrackingController.deleteGeofence);

// Alerts and notifications
router.get('/gps/alerts', GPSTrackingController.getGPSAlerts);
router.post('/gps/alerts/:alertId/acknowledge', GPSTrackingController.acknowledgeAlert);

// Route optimization
router.post('/gps/routes/optimize', GPSTrackingController.optimizeRoute);
router.get('/gps/routes/:routeId', GPSTrackingController.getRoute);

export { router as gpsTrackingRoutes };