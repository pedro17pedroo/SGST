import type { Express } from 'express';
import { batchManagementRoutes } from './batch-management.routes';

export function initializeBatchManagementModule(app: Express) {
  app.use('/api', batchManagementRoutes);
}