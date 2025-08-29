import { Express } from 'express';
import { offlineSyncRoutes } from './offline-sync.routes';

export function initializeOfflineSyncModule(app: Express) {
  app.use('/api', offlineSyncRoutes);
}