import { Request, Response } from 'express';
import { RTLSModel } from './rtls.model';
import { RTLSDevice, RTLSLocation, GeofenceArea, AssetTracking } from '@shared/rtls-types';

export class RTLSController {
  
  // Gestão de dispositivos
  static async registerDevice(req: Request, res: Response) {
    try {
      const deviceData = req.body;
      const device = await RTLSModel.registerDevice(deviceData);

      console.log(`📡 Dispositivo RTLS registrado: ${device.id} (${device.type})`);

      res.status(201).json({
        message: 'Device registered successfully',
        device
      });

    } catch (error) {
      console.error('Erro ao registrar dispositivo RTLS:', error);
      res.status(500).json({ 
        message: 'Failed to register device', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getDevices(req: Request, res: Response) {
    try {
      const { type, isActive, warehouseId } = req.query;
      const devices = await RTLSModel.getDevices({
        type: type as string,
        isActive: isActive === 'true',
        warehouseId: warehouseId as string
      });

      res.json({
        devices,
        total: devices.length,
        activeDevices: devices.filter(d => d.isActive).length
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get devices', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const device = await RTLSModel.getDevice(deviceId);

      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      res.json(device);

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get device', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async updateDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const updates = req.body;
      
      const device = await RTLSModel.updateDevice(deviceId, updates);
      
      if (!device) {
        return res.status(404).json({ message: 'Device not found' });
      }

      res.json({
        message: 'Device updated successfully',
        device
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to update device', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async removeDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const success = await RTLSModel.removeDevice(deviceId);

      if (!success) {
        return res.status(404).json({ message: 'Device not found' });
      }

      console.log(`🗑️ Dispositivo RTLS removido: ${deviceId}`);

      res.json({ message: 'Device removed successfully' });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to remove device', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Rastreamento de localização
  static async updateLocation(req: Request, res: Response) {
    try {
      const locationData: RTLSLocation = req.body;
      await RTLSModel.updateLocation(locationData);

      console.log(`📍 Localização atualizada para dispositivo ${locationData.deviceId}: (${locationData.x}, ${locationData.y}) ±${locationData.accuracy}cm`);

      res.json({
        message: 'Location updated successfully',
        location: locationData
      });

    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
      res.status(500).json({ 
        message: 'Failed to update location', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getDeviceLocation(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const location = await RTLSModel.getCurrentLocation(deviceId);

      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }

      res.json(location);

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get location', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getLocationHistory(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const { startTime, endTime, limit = 100 } = req.query;

      const history = await RTLSModel.getLocationHistory(deviceId, {
        startTime: startTime ? parseInt(startTime as string) : undefined,
        endTime: endTime ? parseInt(endTime as string) : undefined,
        limit: parseInt(limit as string)
      });

      res.json({
        deviceId,
        history,
        totalPoints: history.length
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get location history', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Geofencing
  static async createGeofence(req: Request, res: Response) {
    try {
      const geofenceData = req.body;
      const geofence = await RTLSModel.createGeofence(geofenceData);

      console.log(`🎯 Geofence criada: ${geofence.name} (${geofence.type})`);

      res.status(201).json({
        message: 'Geofence created successfully',
        geofence
      });

    } catch (error) {
      console.error('Erro ao criar geofence:', error);
      res.status(500).json({ 
        message: 'Failed to create geofence', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getGeofences(req: Request, res: Response) {
    try {
      const { warehouseId, isIndoor } = req.query;
      const geofences = await RTLSModel.getGeofences({
        warehouseId: warehouseId as string,
        isIndoor: isIndoor === 'true'
      });

      res.json({
        geofences,
        total: geofences.length
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get geofences', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async updateGeofence(req: Request, res: Response) {
    try {
      const { geofenceId } = req.params;
      const updates = req.body;
      
      const geofence = await RTLSModel.updateGeofence(geofenceId, updates);
      
      if (!geofence) {
        return res.status(404).json({ message: 'Geofence not found' });
      }

      res.json({
        message: 'Geofence updated successfully',
        geofence
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to update geofence', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async deleteGeofence(req: Request, res: Response) {
    try {
      const { geofenceId } = req.params;
      const success = await RTLSModel.deleteGeofence(geofenceId);

      if (!success) {
        return res.status(404).json({ message: 'Geofence not found' });
      }

      console.log(`🗑️ Geofence removida: ${geofenceId}`);

      res.json({ message: 'Geofence deleted successfully' });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to delete geofence', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Rastreamento em tempo real
  static async getRealTimeTracking(req: Request, res: Response) {
    try {
      const { warehouseId, deviceTypes } = req.query;
      
      const tracking = await RTLSModel.getRealTimeTracking({
        warehouseId: warehouseId as string,
        deviceTypes: deviceTypes ? (deviceTypes as string).split(',') : undefined
      });

      res.json({
        message: 'Real-time tracking data',
        tracking,
        lastUpdate: Date.now()
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get real-time tracking', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getMovementHeatmap(req: Request, res: Response) {
    try {
      const { zoneId, startTime, endTime, resolution = 'hour' } = req.query;

      if (!zoneId) {
        return res.status(400).json({ message: 'Zone ID is required' });
      }

      const heatmap = await RTLSModel.generateMovementHeatmap({
        zoneId: zoneId as string,
        startTime: startTime ? parseInt(startTime as string) : Date.now() - 24 * 60 * 60 * 1000,
        endTime: endTime ? parseInt(endTime as string) : Date.now(),
        resolution: resolution as string
      });

      res.json({
        message: 'Movement heatmap generated',
        heatmap
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to generate heatmap', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Asset tracking
  static async createAsset(req: Request, res: Response) {
    try {
      const assetData = req.body;
      const asset = await RTLSModel.createAsset(assetData);

      console.log(`📦 Asset criado: ${asset.assetId} (${asset.assetType})`);

      res.status(201).json({
        message: 'Asset created successfully',
        asset
      });

    } catch (error) {
      console.error('Erro ao criar asset:', error);
      res.status(500).json({ 
        message: 'Failed to create asset', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getAssets(req: Request, res: Response) {
    try {
      const { assetType, status, warehouseId } = req.query;
      
      const assets = await RTLSModel.getAssets({
        assetType: assetType as string,
        status: status as string,
        warehouseId: warehouseId as string
      });

      res.json({
        assets,
        total: assets.length,
        byStatus: RTLSModel.getAssetsByStatus(assets)
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get assets', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getAsset(req: Request, res: Response) {
    try {
      const { assetId } = req.params;
      const asset = await RTLSModel.getAsset(assetId);

      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      res.json(asset);

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get asset', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async updateAsset(req: Request, res: Response) {
    try {
      const { assetId } = req.params;
      const updates = req.body;
      
      const asset = await RTLSModel.updateAsset(assetId, updates);
      
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }

      res.json({
        message: 'Asset updated successfully',
        asset
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to update asset', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Eventos e alertas
  static async getEvents(req: Request, res: Response) {
    try {
      const { type, severity, deviceId, acknowledged, limit = 50 } = req.query;
      
      const events = await RTLSModel.getEvents({
        type: type as string,
        severity: severity as string,
        deviceId: deviceId as string,
        acknowledged: acknowledged === 'true',
        limit: parseInt(limit as string)
      });

      res.json({
        events,
        total: events.length,
        unacknowledged: events.filter(e => !e.acknowledged).length
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get events', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async acknowledgeEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const success = await RTLSModel.acknowledgeEvent(eventId);

      if (!success) {
        return res.status(404).json({ message: 'Event not found' });
      }

      console.log(`✅ Evento RTLS confirmado: ${eventId}`);

      res.json({ message: 'Event acknowledged successfully' });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to acknowledge event', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Configuração
  static async getConfiguration(req: Request, res: Response) {
    try {
      const config = await RTLSModel.getConfiguration();
      res.json(config);

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get configuration', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async updateConfiguration(req: Request, res: Response) {
    try {
      const config = req.body;
      await RTLSModel.updateConfiguration(config);

      console.log('🔧 Configuração RTLS atualizada');

      res.json({
        message: 'Configuration updated successfully',
        config
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to update configuration', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Analytics
  static async getAnalyticsSummary(req: Request, res: Response) {
    try {
      const { warehouseId, timeRange = '24h' } = req.query;
      
      const summary = await RTLSModel.getAnalyticsSummary({
        warehouseId: warehouseId as string,
        timeRange: timeRange as string
      });

      res.json(summary);

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get analytics summary', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getZoneUsage(req: Request, res: Response) {
    try {
      const { warehouseId, startTime, endTime } = req.query;
      
      const usage = await RTLSModel.getZoneUsage({
        warehouseId: warehouseId as string,
        startTime: startTime ? parseInt(startTime as string) : undefined,
        endTime: endTime ? parseInt(endTime as string) : undefined
      });

      res.json({
        message: 'Zone usage analytics',
        usage
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get zone usage', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}