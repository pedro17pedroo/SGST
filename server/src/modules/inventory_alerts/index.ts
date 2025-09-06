import type { Express } from 'express';
import { inventoryAlertsRoutes } from './inventory-alerts.routes';

export function initializeInventoryAlertsModule(app: Express) {
  app.use('/api/inventory-alerts', inventoryAlertsRoutes);
}