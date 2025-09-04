import { BaseModule } from '../base/module.interface';
import { voiceARRoutes } from './voice-ar.routes';
import { Express } from 'express';
import { ModuleConfig } from '../../config/modules';

/**
 * Módulo Voice Picking e Realidade Aumentada (AR)
 * 
 * Este módulo fornece funcionalidades avançadas para:
 * - Voice Picking: Comandos de voz para operações de picking
 * - Realidade Aumentada: Overlays e marcadores AR para navegação e instruções
 * - Configurações personalizáveis para diferentes armazéns
 * - Analytics e relatórios de performance
 */
export class VoiceARModule extends BaseModule {
  config: ModuleConfig = {
    id: 'voice_ar',
    name: 'Módulo Voice Picking e Realidade Aumentada',
    description: 'Funcionalidades de Voice Picking e AR para operações de armazém',
    enabled: true,
    dependencies: ['auth', 'users'],
    routes: ['/api/voice-ar'],
    tables: [],
    permissions: [
      'voice_ar.sessions.read',
      'voice_ar.sessions.create',
      'voice_ar.sessions.update',
      'voice_ar.config.read',
      'voice_ar.config.update',
      'voice_ar.analytics.read'
    ]
  };

  async register(app: Express): Promise<void> {
    console.log('🎤🥽 Registrando módulo Voice Picking e AR...');
    
    // Registrar rotas
    app.use('/api/voice-ar', voiceARRoutes);
    
    // Aqui poderia haver inicializações específicas como:
    // - Configuração de engines de reconhecimento de voz
    // - Inicialização de bibliotecas AR
    // - Carregamento de modelos de machine learning
    // - Configuração de dispositivos de hardware
    
    console.log('✅ Módulo Voice Picking e AR registrado com sucesso');
    console.log(`📍 Rotas registradas em: /api/voice-ar`);
  }

  async unregister(app: Express): Promise<void> {
    console.log('🧹 Desregistrando módulo Voice Picking e AR...');
    
    // Aqui poderia haver limpezas específicas como:
    // - Finalização de sessões ativas
    // - Liberação de recursos de hardware
    // - Salvamento de dados de sessão
    
    await super.unregister(app);
    console.log('✅ Módulo Voice Picking e AR desregistrado');
  }

  getStatus() {
    return {
      config: this.config,
      features: {
        voicePicking: {
          status: 'active',
          supportedLanguages: ['pt', 'en', 'es'],
          features: ['voice_commands', 'noise_cancellation', 'custom_commands']
        },
        augmentedReality: {
          status: 'active',
          trackingModes: ['marker_based', 'markerless', 'hybrid'],
          features: ['3d_overlays', 'marker_tracking', 'occlusion', 'lighting']
        }
      },
      endpoints: {
        voicePicking: [
          'POST /api/voice-ar/voice-picking/sessions',
          'GET /api/voice-ar/voice-picking/sessions',
          'POST /api/voice-ar/voice-picking/sessions/:sessionId/commands',
          'GET /api/voice-ar/voice-picking/config/:warehouseId',
          'GET /api/voice-ar/voice-picking/analytics/:warehouseId'
        ],
        ar: [
          'POST /api/voice-ar/ar/sessions',
          'GET /api/voice-ar/ar/sessions',
          'POST /api/voice-ar/ar/sessions/:sessionId/markers',
          'POST /api/voice-ar/ar/sessions/:sessionId/overlays',
          'GET /api/voice-ar/ar/config/:warehouseId',
          'GET /api/voice-ar/ar/analytics/:warehouseId'
        ]
      }
    };
  }
}

export const voiceARModule = new VoiceARModule();