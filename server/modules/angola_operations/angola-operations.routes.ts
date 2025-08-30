import { Router } from 'express';
import { AngolaOperationsController } from './angola-operations.controller';

export const angolaOperationsRoutes = Router();

// Network & Power Failure Management
angolaOperationsRoutes.post('/network-failure', AngolaOperationsController.reportNetworkFailure);
angolaOperationsRoutes.post('/power-failure', AngolaOperationsController.reportPowerFailure);

// Offline Maps Management
angolaOperationsRoutes.get('/offline-maps', AngolaOperationsController.getOfflineMaps);
angolaOperationsRoutes.post('/offline-maps/download', AngolaOperationsController.downloadOfflineMap);

// SMS/USSD Fallback for POD
angolaOperationsRoutes.post('/sms/configure', AngolaOperationsController.configureSMSFallback);
angolaOperationsRoutes.post('/sms/pod', AngolaOperationsController.sendSMSPOD);
angolaOperationsRoutes.post('/ussd/pod', AngolaOperationsController.processUSSDPOD);

// Local Buffer & Delayed Sync
angolaOperationsRoutes.post('/buffer/add', AngolaOperationsController.addToLocalBuffer);
angolaOperationsRoutes.get('/sync/status/:deviceId', AngolaOperationsController.getSyncQueueStatus);
angolaOperationsRoutes.post('/sync/process', AngolaOperationsController.processDelayedSync);

// Network Status & Monitoring
angolaOperationsRoutes.post('/network/status', AngolaOperationsController.updateNetworkStatus);

// System Resilience Configuration
angolaOperationsRoutes.get('/config/resilience/:deviceId', AngolaOperationsController.getResilienceConfig);
angolaOperationsRoutes.post('/config/resilience', AngolaOperationsController.updateResilienceConfig);