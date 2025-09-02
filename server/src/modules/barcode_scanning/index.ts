import type { Express } from 'express';
import { barcodeScanningRoutes } from './barcode-scanning.routes.js';

export function initializeBarcodeScanningModule(app: Express) {
  app.use('/api', barcodeScanningRoutes);
}