import { NetworkFailureEvent, PowerFailureEvent, OfflineMapPackage, SMSFallbackConfig, USSDFallbackConfig, LocalBuffer, SyncQueueStats, AngolaNetworkStatus, ResilenceConfig, PODBasicData } from '@shared/angola-types';
import { nanoid } from 'nanoid';

export class AngolaOperationsModel {
  // Storage simulado para Angola operations
  private static networkFailures: Map<string, NetworkFailureEvent> = new Map();
  private static powerFailures: Map<string, PowerFailureEvent> = new Map();
  private static offlineMaps: Map<string, OfflineMapPackage> = new Map();
  private static smsConfigs: Map<string, SMSFallbackConfig> = new Map();
  private static ussdConfigs: Map<string, USSDFallbackConfig> = new Map();
  private static localBuffers: Map<string, LocalBuffer[]> = new Map();
  private static networkStatus: Map<string, AngolaNetworkStatus> = new Map();
  private static resilienceConfigs: Map<string, ResilenceConfig> = new Map();

  // Initialize with Angola's provinces and offline maps
  static {
    this.initializeOfflineMaps();
    this.initializeDefaultConfigs();
  }

  private static initializeOfflineMaps() {
    const angolaProvinces = [
      'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
      'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Lunda Norte',
      'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
    ];

    angolaProvinces.forEach(province => {
      const mapId = nanoid();
      const map: OfflineMapPackage = {
        id: mapId,
        region: 'Angola',
        province,
        packageSize: Math.floor(Math.random() * 500) + 100, // 100-600 MB
        lastUpdated: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000, // Últimos 30 dias
        downloadUrl: `https://maps.sgst.ao/offline/${province.toLowerCase().replace(/\s+/g, '-')}.zip`,
        version: '2025.1.0',
        checksum: `sha256:${nanoid(64)}`
      };
      this.offlineMaps.set(mapId, map);
    });

    console.log(`🗺️ ${angolaProvinces.length} pacotes de mapas offline inicializados para Angola`);
  }

  private static initializeDefaultConfigs() {
    // Configuração padrão para resistência em Angola
    const defaultConfig: ResilenceConfig = {
      networkFailureMaxDuration: 30000, // 30 segundos
      powerFailureAutoSave: true,
      criticalBatteryLevel: 15, // 15%
      autoRetryMaxAttempts: 5,
      retryBackoffMultiplier: 2,
      mapsCacheSize: 2048, // 2GB
      smsCredits: 1000,
      ussdCredits: 500
    };

    this.resilienceConfigs.set('default', defaultConfig);
  }

  // Network & Power Failure Management
  static async recordNetworkFailure(params: {
    duration: number;
    affectedOperations: string[];
    deviceId: string;
  }): Promise<NetworkFailureEvent & { fallbackUsed: boolean }> {
    const event: NetworkFailureEvent = {
      id: nanoid(),
      timestamp: Date.now(),
      duration: params.duration,
      affectedOperations: params.affectedOperations,
      fallbackUsed: params.duration > 30000, // Fallback após 30s
      recoveryTime: params.duration > 30000 ? Date.now() + 15000 : undefined
    };

    this.networkFailures.set(event.id, event);

    console.log(`📡 Falha de rede registrada: ${event.duration}ms, fallback: ${event.fallbackUsed}`);

    return { ...event, fallbackUsed: event.fallbackUsed };
  }

  static async recordPowerFailure(params: {
    batteryLevel: number;
    deviceId: string;
    criticalOperations: string[];
  }): Promise<PowerFailureEvent & { autoShutdownTriggered: boolean }> {
    const autoShutdownTriggered = params.batteryLevel < 15;

    const event: PowerFailureEvent = {
      id: nanoid(),
      timestamp: Date.now(),
      duration: 0, // Será atualizado quando a energia for restaurada
      batteryLevel: params.batteryLevel,
      criticalOperationsProtected: params.criticalOperations,
      autoShutdownTriggered
    };

    this.powerFailures.set(event.id, event);

    console.log(`🔋 Falha de energia registrada: bateria ${params.batteryLevel}%, shutdown: ${autoShutdownTriggered}`);

    return { ...event, autoShutdownTriggered };
  }

  // Offline Maps Management
  static async getAvailableOfflineMaps(filters: {
    region?: string;
    province?: string;
  }): Promise<OfflineMapPackage[]> {
    let maps = Array.from(this.offlineMaps.values());

    if (filters.region) {
      maps = maps.filter(map => map.region.toLowerCase().includes(filters.region!.toLowerCase()));
    }

    if (filters.province) {
      maps = maps.filter(map => map.province.toLowerCase().includes(filters.province!.toLowerCase()));
    }

    return maps.sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  static async initiateMapDownload(mapId: string, deviceId: string): Promise<{
    downloadUrl: string;
    estimatedDownloadTime: number;
    packageSize: number;
  }> {
    const map = this.offlineMaps.get(mapId);
    if (!map) {
      throw new Error('Map package not found');
    }

    // Simular estimativa baseada no tamanho e velocidade da rede
    const networkStatus = this.networkStatus.get(deviceId);
    const bandwidth = networkStatus?.bandwidth || 1; // 1 Mbps default
    const estimatedDownloadTime = (map.packageSize / bandwidth) * 1000; // em ms

    console.log(`🗺️ Iniciando download: ${map.province} (${map.packageSize}MB), tempo estimado: ${Math.round(estimatedDownloadTime / 1000)}s`);

    return {
      downloadUrl: map.downloadUrl,
      estimatedDownloadTime,
      packageSize: map.packageSize
    };
  }

  // SMS/USSD Fallback
  static async configureSMSFallback(params: {
    phoneNumber: string;
    provider: 'unitel' | 'movicel' | 'africell';
    deviceId: string;
  }): Promise<SMSFallbackConfig> {
    const config: SMSFallbackConfig = {
      enabled: true,
      provider: params.provider,
      phoneNumber: params.phoneNumber,
      commands: {
        POD_CONFIRM: `*POD*${nanoid(4)}#`,
        DELIVERY_STATUS: `*STATUS*${nanoid(4)}#`,
        LOCATION_UPDATE: `*LOC*${nanoid(4)}#`,
        EMERGENCY: `*EMERG*${nanoid(4)}#`
      }
    };

    this.smsConfigs.set(params.deviceId, config);

    console.log(`📱 SMS fallback configurado: ${params.phoneNumber} via ${params.provider}`);

    return config;
  }

  static async sendSMSPOD(params: {
    trackingNumber: string;
    deliveryStatus: string;
    deviceId: string;
    recipientPhone: string;
  }): Promise<{
    success: boolean;
    messageId: string;
    creditsUsed: number;
    remainingCredits: number;
  }> {
    const config = this.smsConfigs.get(params.deviceId);
    if (!config) {
      throw new Error('SMS not configured for this device');
    }

    // Simular envio de SMS
    const messageId = nanoid();
    const creditsUsed = 1;
    const resilenceConfig = this.resilienceConfigs.get(params.deviceId) || this.resilienceConfigs.get('default')!;

    const remainingCredits = resilenceConfig.smsCredits - creditsUsed;

    console.log(`📲 SMS POD enviado: ${params.trackingNumber} para ${params.recipientPhone}`);

    return {
      success: true,
      messageId,
      creditsUsed,
      remainingCredits
    };
  }

  static async processUSSDPOD(params: {
    sessionId: string;
    command: string;
    trackingNumber: string;
    deviceId: string;
  }): Promise<{
    success: boolean;
    response: string;
    nextMenu?: string;
  }> {
    // Simular processamento USSD para POD básico
    let response = '';
    let nextMenu = '';

    switch (params.command) {
      case '1':
        response = `Confirmar entrega de ${params.trackingNumber}?\n1-Sim 2-Não 0-Voltar`;
        nextMenu = 'confirm_delivery';
        break;
      case '11':
        response = `Entrega confirmada para ${params.trackingNumber}. Obrigado!`;
        nextMenu = '';
        break;
      case '2':
        response = `Reportar problema com ${params.trackingNumber}?\n1-Não encontrado 2-Recusado 0-Voltar`;
        nextMenu = 'report_issue';
        break;
      default:
        response = `SGST - POD Básico\n1-Confirmar Entrega\n2-Reportar Problema\n0-Sair`;
        nextMenu = 'main_menu';
    }

    console.log(`☎️ USSD processado: sessão ${params.sessionId}, comando ${params.command}`);

    return {
      success: true,
      response,
      nextMenu
    };
  }

  // Local Buffer & Delayed Sync
  static async addToLocalBuffer(params: {
    type: 'critical' | 'normal' | 'low_priority';
    data: any;
    deviceId: string;
    priority: number;
  }): Promise<LocalBuffer & { queuePosition: number }> {
    const buffer: LocalBuffer = {
      id: nanoid(),
      type: params.type,
      data: params.data,
      size: JSON.stringify(params.data).length,
      timestamp: Date.now(),
      deviceId: params.deviceId,
      syncPriority: params.priority,
      retryCount: 0,
      maxRetries: 5
    };

    const deviceBuffers = this.localBuffers.get(params.deviceId) || [];
    deviceBuffers.push(buffer);
    deviceBuffers.sort((a, b) => b.syncPriority - a.syncPriority); // Ordenar por prioridade
    
    this.localBuffers.set(params.deviceId, deviceBuffers);

    const queuePosition = deviceBuffers.findIndex(b => b.id === buffer.id) + 1;

    console.log(`💾 Item adicionado ao buffer: tipo ${params.type}, posição ${queuePosition}`);

    return { ...buffer, queuePosition };
  }

  static async getSyncQueueStatus(deviceId: string): Promise<{
    stats: SyncQueueStats;
    networkStatus: AngolaNetworkStatus;
  }> {
    const buffers = this.localBuffers.get(deviceId) || [];
    const networkStatus = this.networkStatus.get(deviceId) || {
      isOnline: false,
      connectionType: 'none',
      signalStrength: 0,
      latency: 0,
      bandwidth: 0,
      provider: 'other',
      lastCheck: Date.now()
    };

    const stats: SyncQueueStats = {
      totalPending: buffers.length,
      criticalPending: buffers.filter(b => b.type === 'critical').length,
      normalPending: buffers.filter(b => b.type === 'normal').length,
      lowPriorityPending: buffers.filter(b => b.type === 'low_priority').length,
      averageWaitTime: buffers.length > 0 ? 
        buffers.reduce((sum, b) => sum + (Date.now() - b.timestamp), 0) / buffers.length : 0,
      successRate: 95, // Simulado
      lastSuccessfulSync: Date.now() - Math.floor(Math.random() * 300000) // Últimos 5 min
    };

    return { stats, networkStatus };
  }

  static async processDelayedSync(deviceId: string, force: boolean = false): Promise<{
    itemsProcessed: number;
    successful: number;
    failed: number;
    syncStats: SyncQueueStats;
  }> {
    const buffers = this.localBuffers.get(deviceId) || [];
    const networkStatus = this.networkStatus.get(deviceId);

    if (!force && (!networkStatus || !networkStatus.isOnline)) {
      throw new Error('Network not available for sync');
    }

    let successful = 0;
    let failed = 0;
    const processedBuffers = [];

    for (const buffer of buffers) {
      try {
        // Simular processamento baseado na prioridade e tipo
        const success = Math.random() > (buffer.retryCount * 0.1); // Diminui chance com mais tentativas
        
        if (success) {
          successful++;
          console.log(`✅ Buffer ${buffer.id} sincronizado com sucesso`);
        } else {
          failed++;
          buffer.retryCount++;
          if (buffer.retryCount < buffer.maxRetries) {
            processedBuffers.push(buffer); // Manter para retry
          }
          console.log(`❌ Falha ao sincronizar buffer ${buffer.id}, tentativa ${buffer.retryCount}`);
        }
      } catch (error) {
        failed++;
        buffer.retryCount++;
        if (buffer.retryCount < buffer.maxRetries) {
          processedBuffers.push(buffer);
        }
      }
    }

    // Atualizar buffers pendentes
    this.localBuffers.set(deviceId, processedBuffers);

    const syncStats: SyncQueueStats = {
      totalPending: processedBuffers.length,
      criticalPending: processedBuffers.filter(b => b.type === 'critical').length,
      normalPending: processedBuffers.filter(b => b.type === 'normal').length,
      lowPriorityPending: processedBuffers.filter(b => b.type === 'low_priority').length,
      averageWaitTime: processedBuffers.length > 0 ? 
        processedBuffers.reduce((sum, b) => sum + (Date.now() - b.timestamp), 0) / processedBuffers.length : 0,
      successRate: successful / (successful + failed) * 100,
      lastSuccessfulSync: Date.now()
    };

    return {
      itemsProcessed: buffers.length,
      successful,
      failed,
      syncStats
    };
  }

  // Network Status & Monitoring
  static async getNetworkStatus(deviceId: string): Promise<AngolaNetworkStatus> {
    const status = this.networkStatus.get(deviceId);
    
    if (!status) {
      // Retornar status padrão se dispositivo não existe
      const defaultStatus: AngolaNetworkStatus = {
        isOnline: false,
        connectionType: 'none',
        signalStrength: 0,
        latency: 0,
        bandwidth: 0,
        provider: 'other',
        lastCheck: Date.now()
      };
      
      this.networkStatus.set(deviceId, defaultStatus);
      return defaultStatus;
    }
    
    return status;
  }

  static async updateNetworkStatus(deviceId: string, status: Partial<AngolaNetworkStatus>): Promise<AngolaNetworkStatus & { recommendations: string[] }> {
    const currentStatus = this.networkStatus.get(deviceId) || {
      isOnline: false,
      connectionType: 'none',
      signalStrength: 0,
      latency: 0,
      bandwidth: 0,
      provider: 'other',
      lastCheck: Date.now()
    };

    const updatedStatus: AngolaNetworkStatus = {
      ...currentStatus,
      ...status,
      lastCheck: Date.now()
    };

    this.networkStatus.set(deviceId, updatedStatus);

    // Gerar recomendações baseadas no status
    const recommendations = [];

    if (updatedStatus.signalStrength < 30) {
      recommendations.push('Sinal fraco - considere mudar de localização');
    }

    if (updatedStatus.latency > 2000) {
      recommendations.push('Latência alta - sincronização pode ser lenta');
    }

    if (updatedStatus.bandwidth < 1) {
      recommendations.push('Largura de banda baixa - usar modo offline');
    }

    if (updatedStatus.connectionType === '2g') {
      recommendations.push('Conexão 2G - funcionalidades limitadas disponíveis');
    }

    return { ...updatedStatus, recommendations };
  }

  // Resilience Configuration
  static async getResilienceConfig(deviceId: string): Promise<ResilenceConfig> {
    return this.resilienceConfigs.get(deviceId) || this.resilienceConfigs.get('default')!;
  }

  static async updateResilienceConfig(deviceId: string, config: Partial<ResilenceConfig>): Promise<ResilenceConfig> {
    const currentConfig = await this.getResilienceConfig(deviceId);
    const updatedConfig = { ...currentConfig, ...config };
    
    this.resilienceConfigs.set(deviceId, updatedConfig);
    
    console.log(`⚙️ Configuração de resistência atualizada para ${deviceId}`);
    
    return updatedConfig;
  }

  // Utility methods
  static getStats(): {
    totalDevices: number;
    totalNetworkFailures: number;
    totalPowerFailures: number;
    offlineMapDownloads: number;
    pendingBufferItems: number;
  } {
    const totalPendingBuffers = Array.from(this.localBuffers.values())
      .reduce((total, buffers) => total + buffers.length, 0);

    return {
      totalDevices: this.networkStatus.size,
      totalNetworkFailures: this.networkFailures.size,
      totalPowerFailures: this.powerFailures.size,
      offlineMapDownloads: this.offlineMaps.size,
      pendingBufferItems: totalPendingBuffers
    };
  }
}