import { Express } from 'express';
import { gpsTrackingRoutes } from './gps-tracking.routes.js';

export class GPSTrackingModule {
  static id = 'gps_tracking';
  static moduleName = 'Sistema de GPS Tracking';

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/gps-tracking', gpsTrackingRoutes);
  }
}

export async function initializeGPSTrackingModule(app: Express): Promise<void> {
  const module = new GPSTrackingModule();
  await module.register(app);
}