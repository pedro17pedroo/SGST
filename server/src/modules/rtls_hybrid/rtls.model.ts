import { 
  RTLSDevice, 
  RTLSLocation, 
  GeofenceArea, 
  RTLSEvent, 
  MovementHeatmap, 
  AssetTracking, 
  RTLSConfiguration 
} from '@shared/rtls-types';
import { nanoid } from 'nanoid';

export class RTLSModel {
  private static devices: Map<string, RTLSDevice> = new Map();
  private static locations: Map<string, RTLSLocation[]> = new Map();
  private static geofences: Map<string, GeofenceArea> = new Map();
  private static events: RTLSEvent[] = [];
  private static assets: Map<string, AssetTracking> = new Map();
  private static configuration: RTLSConfiguration = {
    technologies: {
      rfid: { enabled: true, readRange: 10, frequency: '860-960 MHz' },
      uwb: { enabled: true, accuracy: 10, updateRate: 10 },
      ble: { enabled: true, scanInterval: 1000, rssiThreshold: -70 }
    },
    alerting: {
      geofenceAlerts: true,
      batteryAlerts: true,
      deviceLostTimeout: 300,
      realTimeTracking: true
    },
    dataRetention: {
      locationHistory: 30,
      events: 90,
      heatmaps: 7
    }
  };

  // Gestão de dispositivos
  static async registerDevice(deviceData: Partial<RTLSDevice>): Promise<RTLSDevice> {
    const device: RTLSDevice = {
      id: deviceData.id || nanoid(),
      type: deviceData.type || 'asset_tag',
      macAddress: deviceData.macAddress,
      batteryLevel: deviceData.batteryLevel || 100,
      lastSeen: Date.now(),
      isActive: true,
      metadata: deviceData.metadata || {}
    };

    this.devices.set(device.id, device);
    
    // Criar evento de registro
    this.createEvent({
      type: 'location_update',
      deviceId: device.id,
      severity: 'info',
      message: `Dispositivo ${device.type} registrado`
    });

    return device;
  }

  static async getDevices(filters: {
    type?: string;
    isActive?: boolean;
    warehouseId?: string;
  }): Promise<RTLSDevice[]> {
    let devices = Array.from(this.devices.values());

    if (filters.type) {
      devices = devices.filter(d => d.type === filters.type);
    }
    if (filters.isActive !== undefined) {
      devices = devices.filter(d => d.isActive === filters.isActive);
    }
    if (filters.warehouseId) {
      devices = devices.filter(d => d.metadata.warehouseId === filters.warehouseId);
    }

    return devices;
  }

  static async getDevice(deviceId: string): Promise<RTLSDevice | null> {
    return this.devices.get(deviceId) || null;
  }

  static async updateDevice(deviceId: string, updates: Partial<RTLSDevice>): Promise<RTLSDevice | null> {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updatedDevice = { ...device, ...updates, lastSeen: Date.now() };
    this.devices.set(deviceId, updatedDevice);

    return updatedDevice;
  }

  static async removeDevice(deviceId: string): Promise<boolean> {
    const success = this.devices.delete(deviceId);
    if (success) {
      this.locations.delete(deviceId);
      
      this.createEvent({
        type: 'device_lost',
        deviceId,
        severity: 'warning',
        message: 'Dispositivo removido do sistema'
      });
    }
    return success;
  }

  // Rastreamento de localização
  static async updateLocation(location: RTLSLocation): Promise<void> {
    const deviceLocations = this.locations.get(location.deviceId) || [];
    
    // Adicionar nova localização
    deviceLocations.push(location);
    
    // Manter apenas últimas localizações (otimização)
    if (deviceLocations.length > 1000) {
      deviceLocations.splice(0, deviceLocations.length - 1000);
    }
    
    this.locations.set(location.deviceId, deviceLocations);

    // Atualizar device lastSeen
    const device = this.devices.get(location.deviceId);
    if (device) {
      device.lastSeen = location.timestamp;
    }

    // Verificar geofences
    this.checkGeofenceViolations(location);

    // Atualizar asset se associado
    this.updateAssetLocation(location);
  }

  static async getCurrentLocation(deviceId: string): Promise<RTLSLocation | null> {
    const locations = this.locations.get(deviceId);
    if (!locations || locations.length === 0) return null;

    return locations[locations.length - 1];
  }

  static async getLocationHistory(deviceId: string, options: {
    startTime?: number;
    endTime?: number;
    limit: number;
  }): Promise<RTLSLocation[]> {
    let locations = this.locations.get(deviceId) || [];

    // Filtrar por tempo
    if (options.startTime) {
      locations = locations.filter(l => l.timestamp >= options.startTime!);
    }
    if (options.endTime) {
      locations = locations.filter(l => l.timestamp <= options.endTime!);
    }

    // Aplicar limite
    return locations.slice(-options.limit);
  }

  // Geofencing
  static async createGeofence(geofenceData: Partial<GeofenceArea>): Promise<GeofenceArea> {
    const geofence: GeofenceArea = {
      id: geofenceData.id || nanoid(),
      name: geofenceData.name || 'Nova Geofence',
      type: geofenceData.type || 'rectangle',
      coordinates: geofenceData.coordinates || [],
      radius: geofenceData.radius,
      isIndoor: geofenceData.isIndoor || true,
      warehouseId: geofenceData.warehouseId,
      alertOnEntry: geofenceData.alertOnEntry !== false,
      alertOnExit: geofenceData.alertOnExit !== false,
      allowedDeviceTypes: geofenceData.allowedDeviceTypes || ['asset_tag'],
      metadata: geofenceData.metadata || {}
    };

    this.geofences.set(geofence.id, geofence);
    return geofence;
  }

  static async getGeofences(filters: {
    warehouseId?: string;
    isIndoor?: boolean;
  }): Promise<GeofenceArea[]> {
    let geofences = Array.from(this.geofences.values());

    if (filters.warehouseId) {
      geofences = geofences.filter(g => g.warehouseId === filters.warehouseId);
    }
    if (filters.isIndoor !== undefined) {
      geofences = geofences.filter(g => g.isIndoor === filters.isIndoor);
    }

    return geofences;
  }

  static async updateGeofence(geofenceId: string, updates: Partial<GeofenceArea>): Promise<GeofenceArea | null> {
    const geofence = this.geofences.get(geofenceId);
    if (!geofence) return null;

    const updatedGeofence = { ...geofence, ...updates };
    this.geofences.set(geofenceId, updatedGeofence);

    return updatedGeofence;
  }

  static async deleteGeofence(geofenceId: string): Promise<boolean> {
    return this.geofences.delete(geofenceId);
  }

  private static checkGeofenceViolations(location: RTLSLocation): void {
    for (const geofence of this.geofences.values()) {
      const isInside = this.isLocationInGeofence(location, geofence);
      const device = this.devices.get(location.deviceId);
      
      if (!device || !geofence.allowedDeviceTypes.includes(device.type)) {
        continue;
      }

      // Verificar entrada/saída
      const previousLocations = this.locations.get(location.deviceId) || [];
      const previousLocation = previousLocations[previousLocations.length - 2];
      
      if (previousLocation) {
        const wasInside = this.isLocationInGeofence(previousLocation, geofence);
        
        if (!wasInside && isInside && geofence.alertOnEntry) {
          this.createEvent({
            type: 'geofence_entry',
            deviceId: location.deviceId,
            location,
            geofenceId: geofence.id,
            severity: 'info',
            message: `Dispositivo entrou na zona ${geofence.name}`
          });
        } else if (wasInside && !isInside && geofence.alertOnExit) {
          this.createEvent({
            type: 'geofence_exit',
            deviceId: location.deviceId,
            location,
            geofenceId: geofence.id,
            severity: 'warning',
            message: `Dispositivo saiu da zona ${geofence.name}`
          });
        }
      }
    }
  }

  private static isLocationInGeofence(location: RTLSLocation, geofence: GeofenceArea): boolean {
    switch (geofence.type) {
      case 'circle':
        if (!geofence.radius || geofence.coordinates.length === 0) return false;
        const center = geofence.coordinates[0];
        const distance = Math.sqrt(
          Math.pow(location.x - center.x, 2) + Math.pow(location.y - center.y, 2)
        );
        return distance <= geofence.radius;

      case 'rectangle':
        if (geofence.coordinates.length < 2) return false;
        const [topLeft, bottomRight] = geofence.coordinates;
        return location.x >= topLeft.x && location.x <= bottomRight.x &&
               location.y >= topLeft.y && location.y <= bottomRight.y;

      case 'polygon':
        return this.pointInPolygon(location, geofence.coordinates);

      default:
        return false;
    }
  }

  private static pointInPolygon(point: { x: number; y: number }, polygon: Array<{ x: number; y: number }>): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
          (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside;
      }
    }
    return inside;
  }

  // Rastreamento em tempo real
  static async getRealTimeTracking(options: {
    warehouseId?: string;
    deviceTypes?: string[];
  }): Promise<Array<{
    device: RTLSDevice;
    location: RTLSLocation | null;
    status: 'active' | 'idle' | 'lost';
  }>> {
    const devices = await this.getDevices({
      warehouseId: options.warehouseId,
      isActive: true
    });

    const tracking = [];
    const now = Date.now();

    for (const device of devices) {
      if (options.deviceTypes && !options.deviceTypes.includes(device.type)) {
        continue;
      }

      const location = await this.getCurrentLocation(device.id);
      let status: 'active' | 'idle' | 'lost' = 'lost';

      if (location) {
        const timeSinceUpdate = now - location.timestamp;
        if (timeSinceUpdate < 60000) { // 1 minuto
          status = 'active';
        } else if (timeSinceUpdate < 300000) { // 5 minutos
          status = 'idle';
        }
      }

      tracking.push({ device, location, status });
    }

    return tracking;
  }

  static async generateMovementHeatmap(options: {
    zoneId: string;
    startTime: number;
    endTime: number;
    resolution: string;
  }): Promise<MovementHeatmap> {
    // Simular geração de heatmap
    const gridSize = 20; // 20x20 grid
    const heatmapData = [];

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        heatmapData.push({
          x: x * 5, // 5 metros por célula
          y: y * 5,
          intensity: Math.random(),
          deviceCount: Math.floor(Math.random() * 10),
          dwellTime: Math.random() * 300 // 0-5 minutos
        });
      }
    }

    return {
      zoneId: options.zoneId,
      timeRange: {
        startTime: options.startTime,
        endTime: options.endTime
      },
      heatmapData,
      totalDevices: Math.floor(Math.random() * 50) + 10,
      averageSpeed: Math.random() * 2 + 0.5, // 0.5-2.5 m/s
      busyPeriods: [
        { startHour: 8, endHour: 12, intensity: 0.8 },
        { startHour: 14, endHour: 18, intensity: 0.9 }
      ]
    };
  }

  // Asset tracking
  static async createAsset(assetData: Partial<AssetTracking>): Promise<AssetTracking> {
    const asset: AssetTracking = {
      assetId: assetData.assetId || nanoid(),
      assetType: assetData.assetType || 'product',
      currentLocation: assetData.currentLocation,
      locationHistory: assetData.locationHistory || [],
      associatedDevices: assetData.associatedDevices || [],
      status: assetData.status || 'active',
      lastMovement: Date.now(),
      totalDistance: 0,
      averageSpeed: 0,
      geofenceViolations: 0
    };

    this.assets.set(asset.assetId, asset);
    return asset;
  }

  static async getAssets(filters: {
    assetType?: string;
    status?: string;
    warehouseId?: string;
  }): Promise<AssetTracking[]> {
    let assets = Array.from(this.assets.values());

    if (filters.assetType) {
      assets = assets.filter(a => a.assetType === filters.assetType);
    }
    if (filters.status) {
      assets = assets.filter(a => a.status === filters.status);
    }

    return assets;
  }

  static async getAsset(assetId: string): Promise<AssetTracking | null> {
    return this.assets.get(assetId) || null;
  }

  static async updateAsset(assetId: string, updates: Partial<AssetTracking>): Promise<AssetTracking | null> {
    const asset = this.assets.get(assetId);
    if (!asset) return null;

    const updatedAsset = { ...asset, ...updates };
    this.assets.set(assetId, updatedAsset);

    return updatedAsset;
  }

  private static updateAssetLocation(location: RTLSLocation): void {
    // Encontrar assets associados com este dispositivo
    for (const asset of this.assets.values()) {
      if (asset.associatedDevices.includes(location.deviceId)) {
        asset.currentLocation = location;
        asset.locationHistory.push(location);
        asset.lastMovement = location.timestamp;

        // Calcular distância se houver localização anterior
        if (asset.locationHistory.length > 1) {
          const prev = asset.locationHistory[asset.locationHistory.length - 2];
          const distance = Math.sqrt(
            Math.pow(location.x - prev.x, 2) + Math.pow(location.y - prev.y, 2)
          );
          asset.totalDistance += distance;

          // Calcular velocidade média simples
          const timeDiff = (location.timestamp - prev.timestamp) / 1000; // segundos
          if (timeDiff > 0) {
            asset.averageSpeed = (asset.averageSpeed + (distance / timeDiff)) / 2;
          }
        }

        // Manter histórico limitado
        if (asset.locationHistory.length > 500) {
          asset.locationHistory.splice(0, asset.locationHistory.length - 500);
        }
      }
    }
  }

  static getAssetsByStatus(assets: AssetTracking[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const asset of assets) {
      counts[asset.status] = (counts[asset.status] || 0) + 1;
    }
    return counts;
  }

  // Eventos
  private static createEvent(eventData: Partial<RTLSEvent>): void {
    const event: RTLSEvent = {
      id: nanoid(),
      type: eventData.type || 'location_update',
      deviceId: eventData.deviceId || '',
      location: eventData.location,
      geofenceId: eventData.geofenceId,
      timestamp: Date.now(),
      severity: eventData.severity || 'info',
      message: eventData.message || '',
      acknowledged: false
    };

    this.events.push(event);

    // Manter apenas eventos recentes
    if (this.events.length > 1000) {
      this.events.splice(0, this.events.length - 1000);
    }
  }

  static async getEvents(filters: {
    type?: string;
    severity?: string;
    deviceId?: string;
    acknowledged?: boolean;
    limit: number;
  }): Promise<RTLSEvent[]> {
    let events = [...this.events];

    if (filters.type) {
      events = events.filter(e => e.type === filters.type);
    }
    if (filters.severity) {
      events = events.filter(e => e.severity === filters.severity);
    }
    if (filters.deviceId) {
      events = events.filter(e => e.deviceId === filters.deviceId);
    }
    if (filters.acknowledged !== undefined) {
      events = events.filter(e => e.acknowledged === filters.acknowledged);
    }

    return events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, filters.limit);
  }

  static async acknowledgeEvent(eventId: string): Promise<boolean> {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return false;

    event.acknowledged = true;
    return true;
  }

  // Configuração
  static async getConfiguration(): Promise<RTLSConfiguration> {
    return { ...this.configuration };
  }

  static async updateConfiguration(config: Partial<RTLSConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...config };
  }

  // Analytics
  static async getAnalyticsSummary(options: {
    warehouseId?: string;
    timeRange: string;
  }): Promise<{
    totalDevices: number;
    activeDevices: number;
    totalEvents: number;
    criticalEvents: number;
    averageAccuracy: number;
    topZones: Array<{ zone: string; visits: number }>;
  }> {
    const devices = await this.getDevices({ warehouseId: options.warehouseId });
    const events = await this.getEvents({ limit: 1000 });
    
    return {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.isActive).length,
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      averageAccuracy: 12, // cm
      topZones: [
        { zone: 'Armazém Principal', visits: 145 },
        { zone: 'Área de Expedição', visits: 98 },
        { zone: 'Zona de Picking', visits: 87 }
      ]
    };
  }

  static async getZoneUsage(options: {
    warehouseId?: string;
    startTime?: number;
    endTime?: number;
  }): Promise<Array<{
    zoneId: string;
    zoneName: string;
    visits: number;
    averageDwellTime: number;
    peakHour: number;
    utilizationRate: number;
  }>> {
    // Simular dados de uso de zona
    return [
      {
        zoneId: 'zone-001',
        zoneName: 'Armazém Principal',
        visits: 245,
        averageDwellTime: 180, // segundos
        peakHour: 14, // 14:00
        utilizationRate: 0.75
      },
      {
        zoneId: 'zone-002',
        zoneName: 'Área de Expedição',
        visits: 156,
        averageDwellTime: 90,
        peakHour: 16,
        utilizationRate: 0.65
      },
      {
        zoneId: 'zone-003',
        zoneName: 'Zona de Picking',
        visits: 198,
        averageDwellTime: 240,
        peakHour: 10,
        utilizationRate: 0.85
      }
    ];
  }
}