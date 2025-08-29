import { Request, Response } from 'express';
import { CRDTOperation } from '@shared/offline-types';
import { OfflineSyncModel } from './offline-sync.model';

export class OfflineSyncController {
  static async syncOperations(req: Request, res: Response) {
    try {
      const { operations, deviceId } = req.body;

      if (!operations || !Array.isArray(operations)) {
        return res.status(400).json({ message: 'Operations array is required' });
      }

      if (!deviceId) {
        return res.status(400).json({ message: 'Device ID is required' });
      }

      console.log(`📱 Sincronizando ${operations.length} operações do dispositivo ${deviceId}`);

      const results = await OfflineSyncModel.processOperations(operations, deviceId);

      // Contar sucessos e falhas
      const successful = results.filter((r: any) => r.success).length;
      const conflicts = results.filter((r: any) => r.conflict).length;
      const failures = results.filter((r: any) => !r.success && !r.conflict).length;

      console.log(`✅ Sincronização concluída: ${successful} sucessos, ${conflicts} conflitos, ${failures} falhas`);

      res.json({
        message: 'Sync completed',
        results,
        summary: {
          total: operations.length,
          successful,
          conflicts,
          failures
        }
      });

    } catch (error) {
      console.error('Erro na sincronização:', error);
      res.status(500).json({ 
        message: 'Sync failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getSyncStatus(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const status = await OfflineSyncModel.getDeviceStatus(deviceId);
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get sync status', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async resolveConflict(req: Request, res: Response) {
    try {
      const { operationId, resolution, deviceId } = req.body;
      
      if (!operationId || !resolution || !deviceId) {
        return res.status(400).json({ message: 'Operation ID, resolution, and device ID are required' });
      }

      const result = await OfflineSyncModel.resolveConflict(operationId, resolution, deviceId);
      
      res.json({
        message: 'Conflict resolved',
        result
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to resolve conflict', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}