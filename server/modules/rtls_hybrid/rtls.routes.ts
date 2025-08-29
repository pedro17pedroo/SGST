import { Router } from 'express';
import { RTLSController } from './rtls.controller';

export const rtlsRoutes = Router();

// Device management
rtlsRoutes.post('/rtls/devices', RTLSController.registerDevice);
rtlsRoutes.get('/rtls/devices', RTLSController.getDevices);
rtlsRoutes.get('/rtls/devices/:deviceId', RTLSController.getDevice);
rtlsRoutes.put('/rtls/devices/:deviceId', RTLSController.updateDevice);
rtlsRoutes.delete('/rtls/devices/:deviceId', RTLSController.removeDevice);

// Location tracking
rtlsRoutes.post('/rtls/locations', RTLSController.updateLocation);
rtlsRoutes.get('/rtls/locations/:deviceId', RTLSController.getDeviceLocation);
rtlsRoutes.get('/rtls/locations/:deviceId/history', RTLSController.getLocationHistory);

// Geofencing
rtlsRoutes.post('/rtls/geofences', RTLSController.createGeofence);
rtlsRoutes.get('/rtls/geofences', RTLSController.getGeofences);
rtlsRoutes.put('/rtls/geofences/:geofenceId', RTLSController.updateGeofence);
rtlsRoutes.delete('/rtls/geofences/:geofenceId', RTLSController.deleteGeofence);

// Real-time tracking
rtlsRoutes.get('/rtls/tracking/real-time', RTLSController.getRealTimeTracking);
rtlsRoutes.get('/rtls/tracking/heatmap', RTLSController.getMovementHeatmap);

// Asset tracking
rtlsRoutes.post('/rtls/assets', RTLSController.createAsset);
rtlsRoutes.get('/rtls/assets', RTLSController.getAssets);
rtlsRoutes.get('/rtls/assets/:assetId', RTLSController.getAsset);
rtlsRoutes.put('/rtls/assets/:assetId', RTLSController.updateAsset);

// Events and alerts
rtlsRoutes.get('/rtls/events', RTLSController.getEvents);
rtlsRoutes.post('/rtls/events/:eventId/acknowledge', RTLSController.acknowledgeEvent);

// Configuration
rtlsRoutes.get('/rtls/configuration', RTLSController.getConfiguration);
rtlsRoutes.put('/rtls/configuration', RTLSController.updateConfiguration);

// Analytics and statistics
rtlsRoutes.get('/rtls/analytics/summary', RTLSController.getAnalyticsSummary);
rtlsRoutes.get('/rtls/analytics/zone-usage', RTLSController.getZoneUsage);