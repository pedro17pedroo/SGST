// Tipos para operações específicas de Angola

export interface NetworkFailureEvent {
  id: string;
  timestamp: number;
  duration: number;
  affectedOperations: string[];
  recoveryTime?: number;
  fallbackUsed: boolean;
}

export interface PowerFailureEvent {
  id: string;
  timestamp: number;
  duration: number;
  batteryLevel: number;
  criticalOperationsProtected: string[];
  autoShutdownTriggered: boolean;
}

export interface OfflineMapPackage {
  id: string;
  region: string;
  province: string;
  city?: string;
  packageSize: number;
  lastUpdated: number;
  downloadUrl: string;
  version: string;
  checksum: string;
}

export interface SMSFallbackConfig {
  enabled: boolean;
  provider: 'unitel' | 'movicel' | 'africell';
  phoneNumber: string;
  commands: {
    POD_CONFIRM: string;
    DELIVERY_STATUS: string;
    LOCATION_UPDATE: string;
    EMERGENCY: string;
  };
}

export interface USSDFallbackConfig {
  enabled: boolean;
  shortCode: string;
  sessionCommands: {
    POD_MENU: string;
    CONFIRM_DELIVERY: string;
    REPORT_ISSUE: string;
  };
}

export interface LocalBuffer {
  id: string;
  type: 'critical' | 'normal' | 'low_priority';
  data: any;
  size: number;
  timestamp: number;
  deviceId: string;
  syncPriority: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncQueueStats {
  totalPending: number;
  criticalPending: number;
  normalPending: number;
  lowPriorityPending: number;
  averageWaitTime: number;
  successRate: number;
  lastSuccessfulSync: number;
}

export interface AngolaNetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'satellite' | 'none';
  signalStrength: number;
  latency: number;
  bandwidth: number;
  provider: 'unitel' | 'movicel' | 'africell' | 'other';
  lastCheck: number;
}

export interface ResilenceConfig {
  networkFailureMaxDuration: number; // ms antes de ativar fallback
  powerFailureAutoSave: boolean;
  criticalBatteryLevel: number; // % para modo economia
  autoRetryMaxAttempts: number;
  retryBackoffMultiplier: number;
  mapsCacheSize: number; // MB para cache de mapas
  smsCredits: number;
  ussdCredits: number;
}

export interface PODBasicData {
  trackingNumber: string;
  deliveryStatus: 'delivered' | 'attempted' | 'failed';
  timestamp: number;
  recipientName: string;
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  driverSignature?: string;
  recipientSignature?: string;
  notes?: string;
  smsConfirmation?: string;
}