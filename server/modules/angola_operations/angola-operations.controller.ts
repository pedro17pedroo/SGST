import { Request, Response } from 'express';
import { AngolaOperationsModel } from './angola-operations.model';
import { NetworkFailureEvent, PowerFailureEvent, LocalBuffer, AngolaNetworkStatus } from '@shared/angola-types';

export class AngolaOperationsController {

  // Network & Power Failure Management
  static async reportNetworkFailure(req: Request, res: Response) {
    try {
      const { duration, affectedOperations, deviceId } = req.body;
      
      const event = await AngolaOperationsModel.recordNetworkFailure({
        duration,
        affectedOperations,
        deviceId
      });

      console.log(`📡 Falha de rede registrada: ${duration}ms, dispositivo ${deviceId}`);

      res.json({
        message: 'Network failure recorded',
        event,
        fallbackActivated: event.fallbackUsed
      });

    } catch (error) {
      console.error('Erro ao registrar falha de rede:', error);
      res.status(500).json({ 
        message: 'Failed to record network failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async reportPowerFailure(req: Request, res: Response) {
    try {
      const { batteryLevel, deviceId, criticalOperations } = req.body;
      
      const event = await AngolaOperationsModel.recordPowerFailure({
        batteryLevel,
        deviceId,
        criticalOperations
      });

      console.log(`🔋 Falha de energia registrada: bateria ${batteryLevel}%, dispositivo ${deviceId}`);

      res.json({
        message: 'Power failure recorded',
        event,
        autoShutdownTriggered: event.autoShutdownTriggered
      });

    } catch (error) {
      console.error('Erro ao registrar falha de energia:', error);
      res.status(500).json({ 
        message: 'Failed to record power failure',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Offline Maps Management
  static async getOfflineMaps(req: Request, res: Response) {
    try {
      const { region, province } = req.query;
      
      const maps = await AngolaOperationsModel.getAvailableOfflineMaps({
        region: region as string,
        province: province as string
      });

      res.json({
        message: 'Offline maps retrieved',
        maps,
        totalPackages: maps.length,
        totalSize: maps.reduce((sum: number, map: any) => sum + map.packageSize, 0)
      });

    } catch (error) {
      console.error('Erro ao obter mapas offline:', error);
      res.status(500).json({ 
        message: 'Failed to get offline maps',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async downloadOfflineMap(req: Request, res: Response) {
    try {
      const { mapId, deviceId } = req.body;
      
      const downloadInfo = await AngolaOperationsModel.initiateMapDownload(mapId, deviceId);

      console.log(`🗺️ Download de mapa iniciado: ${mapId} para dispositivo ${deviceId}`);

      res.json({
        message: 'Map download initiated',
        downloadInfo,
        estimatedTime: downloadInfo.estimatedDownloadTime
      });

    } catch (error) {
      console.error('Erro ao iniciar download de mapa:', error);
      res.status(500).json({ 
        message: 'Failed to initiate map download',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // SMS/USSD Fallback for POD
  static async configureSMSFallback(req: Request, res: Response) {
    try {
      const { phoneNumber, provider, deviceId } = req.body;
      
      const config = await AngolaOperationsModel.configureSMSFallback({
        phoneNumber,
        provider,
        deviceId
      });

      console.log(`📱 SMS fallback configurado: ${phoneNumber} via ${provider}`);

      res.json({
        message: 'SMS fallback configured',
        config,
        availableCommands: config.commands
      });

    } catch (error) {
      console.error('Erro ao configurar SMS fallback:', error);
      res.status(500).json({ 
        message: 'Failed to configure SMS fallback',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async sendSMSPOD(req: Request, res: Response) {
    try {
      const { trackingNumber, deliveryStatus, deviceId, recipientPhone } = req.body;
      
      const result = await AngolaOperationsModel.sendSMSPOD({
        trackingNumber,
        deliveryStatus,
        deviceId,
        recipientPhone
      });

      console.log(`📲 SMS POD enviado: ${trackingNumber} status ${deliveryStatus}`);

      res.json({
        message: 'SMS POD sent',
        result,
        creditsUsed: result.creditsUsed,
        remainingCredits: result.remainingCredits
      });

    } catch (error) {
      console.error('Erro ao enviar SMS POD:', error);
      res.status(500).json({ 
        message: 'Failed to send SMS POD',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async processUSSDPOD(req: Request, res: Response) {
    try {
      const { sessionId, command, trackingNumber, deviceId } = req.body;
      
      const response = await AngolaOperationsModel.processUSSDPOD({
        sessionId,
        command,
        trackingNumber,
        deviceId
      });

      console.log(`☎️ USSD POD processado: sessão ${sessionId}, comando ${command}`);

      res.json({
        message: 'USSD POD processed',
        response,
        nextMenu: response.nextMenu
      });

    } catch (error) {
      console.error('Erro ao processar USSD POD:', error);
      res.status(500).json({ 
        message: 'Failed to process USSD POD',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Local Buffer & Delayed Sync
  static async addToLocalBuffer(req: Request, res: Response) {
    try {
      const { type, data, deviceId, priority } = req.body;
      
      const bufferedItem = await AngolaOperationsModel.addToLocalBuffer({
        type,
        data,
        deviceId,
        priority
      });

      console.log(`💾 Item adicionado ao buffer local: tipo ${type}, prioridade ${priority}`);

      res.json({
        message: 'Item added to local buffer',
        bufferedItem,
        queuePosition: bufferedItem.queuePosition
      });

    } catch (error) {
      console.error('Erro ao adicionar ao buffer local:', error);
      res.status(500).json({ 
        message: 'Failed to add to local buffer',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSyncQueueStatus(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const status = await AngolaOperationsModel.getSyncQueueStatus(deviceId);

      res.json({
        message: 'Sync queue status retrieved',
        status,
        networkStatus: status.networkStatus
      });

    } catch (error) {
      console.error('Erro ao obter status da fila de sincronização:', error);
      res.status(500).json({ 
        message: 'Failed to get sync queue status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async processDelayedSync(req: Request, res: Response) {
    try {
      const { deviceId, force } = req.body;
      
      const result = await AngolaOperationsModel.processDelayedSync(deviceId, force);

      console.log(`🔄 Sincronização diferida processada: ${result.itemsProcessed} itens, dispositivo ${deviceId}`);

      res.json({
        message: 'Delayed sync processed',
        result,
        syncStats: result.syncStats
      });

    } catch (error) {
      console.error('Erro ao processar sincronização diferida:', error);
      res.status(500).json({ 
        message: 'Failed to process delayed sync',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Network Status & Monitoring
  static async getNetworkStatus(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const networkStatus = await AngolaOperationsModel.getNetworkStatus(deviceId);

      res.json({
        message: 'Network status retrieved',
        networkStatus
      });

    } catch (error) {
      console.error('Erro ao obter status da rede:', error);
      res.status(500).json({ 
        message: 'Failed to get network status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateNetworkStatus(req: Request, res: Response) {
    try {
      const { deviceId, networkStatus } = req.body;
      
      const status = await AngolaOperationsModel.updateNetworkStatus(deviceId, networkStatus);

      res.json({
        message: 'Network status updated',
        status,
        recommendations: status.recommendations
      });

    } catch (error) {
      console.error('Erro ao atualizar status da rede:', error);
      res.status(500).json({ 
        message: 'Failed to update network status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // System Resilience Configuration
  static async getResilienceConfig(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const config = await AngolaOperationsModel.getResilienceConfig(deviceId);

      res.json({
        message: 'Resilience config retrieved',
        config
      });

    } catch (error) {
      console.error('Erro ao obter configuração de resistência:', error);
      res.status(500).json({ 
        message: 'Failed to get resilience config',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateResilienceConfig(req: Request, res: Response) {
    try {
      const { deviceId, config } = req.body;
      
      const updatedConfig = await AngolaOperationsModel.updateResilienceConfig(deviceId, config);

      console.log(`⚙️ Configuração de resistência atualizada para dispositivo ${deviceId}`);

      res.json({
        message: 'Resilience config updated',
        config: updatedConfig
      });

    } catch (error) {
      console.error('Erro ao atualizar configuração de resistência:', error);
      res.status(500).json({ 
        message: 'Failed to update resilience config',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}