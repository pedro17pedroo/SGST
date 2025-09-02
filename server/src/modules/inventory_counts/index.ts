import type { Express } from 'express';
import { inventoryCountsRoutes } from './inventory-counts.routes';

export function initializeInventoryCountsModule(app: Express) {
  app.use('/api', inventoryCountsRoutes);
}