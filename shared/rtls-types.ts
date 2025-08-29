// Tipos para sistema RTLS Híbrido (RFID + UWB + BLE)
export interface RTLSDevice {
  id: string;
  type: 'rfid_tag' | 'uwb_anchor' | 'ble_beacon' | 'mobile_device' | 'asset_tag';
  macAddress?: string;
  batteryLevel?: number;
  lastSeen: number;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface RTLSLocation {
  deviceId: string;
  x: number; // coordenada X em metros
  y: number; // coordenada Y em metros
  z?: number; // coordenada Z em metros (altura)
  accuracy: number; // precisão em centímetros
  timestamp: number;
  technology: 'rfid' | 'uwb' | 'ble' | 'hybrid';
  zone?: string;
  building?: string;
  floor?: number;
}

export interface GeofenceArea {
  id: string;
  name: string;
  type: 'circle' | 'rectangle' | 'polygon';
  coordinates: Array<{ x: number; y: number }>;
  radius?: number; // para círculos
  isIndoor: boolean;
  warehouseId?: string;
  alertOnEntry: boolean;
  alertOnExit: boolean;
  allowedDeviceTypes: RTLSDevice['type'][];
  metadata: Record<string, any>;
}

export interface RTLSEvent {
  id: string;
  type: 'location_update' | 'geofence_entry' | 'geofence_exit' | 'device_lost' | 'battery_low';
  deviceId: string;
  location?: RTLSLocation;
  geofenceId?: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  acknowledged: boolean;
}

export interface MovementHeatmap {
  zoneId: string;
  timeRange: {
    startTime: number;
    endTime: number;
  };
  heatmapData: Array<{
    x: number;
    y: number;
    intensity: number; // 0-1
    deviceCount: number;
    dwellTime: number; // tempo médio em segundos
  }>;
  totalDevices: number;
  averageSpeed: number; // m/s
  busyPeriods: Array<{
    startHour: number;
    endHour: number;
    intensity: number;
  }>;
}

export interface AssetTracking {
  assetId: string;
  assetType: 'person' | 'equipment' | 'vehicle' | 'product' | 'pallet';
  currentLocation?: RTLSLocation;
  locationHistory: RTLSLocation[];
  associatedDevices: string[]; // device IDs
  status: 'active' | 'idle' | 'missing' | 'maintenance';
  lastMovement: number;
  totalDistance: number; // em metros
  averageSpeed: number;
  geofenceViolations: number;
}

export interface RTLSConfiguration {
  technologies: {
    rfid: {
      enabled: boolean;
      readRange: number; // metros
      frequency: string; // '860-960 MHz'
    };
    uwb: {
      enabled: boolean;
      accuracy: number; // centímetros
      updateRate: number; // Hz
    };
    ble: {
      enabled: boolean;
      scanInterval: number; // milissegundos
      rssiThreshold: number; // dBm
    };
  };
  alerting: {
    geofenceAlerts: boolean;
    batteryAlerts: boolean;
    deviceLostTimeout: number; // segundos
    realTimeTracking: boolean;
  };
  dataRetention: {
    locationHistory: number; // dias
    events: number; // dias
    heatmaps: number; // dias
  };
}