import { Router } from 'express';
import { OfflineSyncController } from './offline-sync.controller';

export const offlineSyncRoutes = Router();

offlineSyncRoutes.post('/offline-sync', OfflineSyncController.syncOperations);
offlineSyncRoutes.get('/offline-sync/status/:deviceId', OfflineSyncController.getSyncStatus);
offlineSyncRoutes.post('/offline-sync/resolve-conflict', OfflineSyncController.resolveConflict);