import type { Express } from 'express';
import { pickingPackingRoutes } from './picking-packing.routes';

export function initializePickingPackingModule(app: Express) {
  app.use('/api', pickingPackingRoutes);
}