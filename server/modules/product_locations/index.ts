import type { Express } from 'express';
import { productLocationsRoutes } from './product-locations.routes';

export function initializeProductLocationsModule(app: Express) {
  app.use('/api', productLocationsRoutes);
}