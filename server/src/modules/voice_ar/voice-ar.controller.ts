import { Request, Response } from 'express';
import { z } from 'zod';
import { VoiceARModel } from './voice-ar.model';

// Schemas de validação para Voice Picking
const createVoicePickingSessionSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  warehouseId: z.string().min(1, 'ID do armazém é obrigatório'),
  pickingListId: z.string().min(1, 'ID da lista de picking é obrigatório'),
  language: z.enum(['pt', 'en', 'es']).optional().default('pt')
});

const processVoiceCommandSchema = z.object({
  recognizedText: z.string().min(1, 'Texto reconhecido é obrigatório'),
  confidence: z.number().min(0).max(1, 'Confiança deve estar entre 0 e 1'),
  audioData: z.string().optional()
});

const voicePickingConfigSchema = z.object({
  language: z.enum(['pt', 'en', 'es']).optional(),
  speechRate: z.number().min(0.1).max(3.0).optional(),
  volume: z.number().min(0).max(1).optional(),
  confirmationRequired: z.boolean().optional(),
  enableNoiseCancellation: z.boolean().optional(),
  customCommands: z.array(z.object({
    trigger: z.string(),
    action: z.string(),
    response: z.string(),
    enabled: z.boolean()
  })).optional()
});

// Schemas de validação para AR
const createARSessionSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  warehouseId: z.string().min(1, 'ID do armazém é obrigatório'),
  deviceId: z.string().min(1, 'ID do dispositivo é obrigatório'),
  sessionType: z.enum(['picking', 'putaway', 'inventory', 'training'])
});

const addARMarkerSchema = z.object({
  type: z.enum(['qr_code', 'barcode', 'image_target', 'location_marker']),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  data: z.any().optional()
});

const addAROverlaySchema = z.object({
  type: z.enum(['text', 'arrow', '3d_model', 'highlight', 'instruction']),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }),
  color: z.string().optional(),
  size: z.number().positive().optional(),
  duration: z.number().positive().optional()
});

const arConfigSchema = z.object({
  trackingMode: z.enum(['marker_based', 'markerless', 'hybrid']).optional(),
  renderQuality: z.enum(['low', 'medium', 'high']).optional(),
  enableOcclusion: z.boolean().optional(),
  enableLighting: z.boolean().optional(),
  maxMarkers: z.number().positive().optional(),
  calibrationData: z.any().optional()
});

const analyticsTimeRangeSchema = z.object({
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str))
});

export class VoiceARController {
  // === VOICE PICKING ENDPOINTS ===

  /**
   * Criar nova sessão de Voice Picking
   * POST /api/voice-ar/voice-picking/sessions
   */
  static async createVoicePickingSession(req: Request, res: Response) {
    try {
      const validatedData = createVoicePickingSessionSchema.parse(req.body);
      
      const session = await VoiceARModel.createVoicePickingSession(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Sessão de Voice Picking criada com sucesso',
        data: session
      });
    } catch (error: any) {
      console.error('Erro ao criar sessão de Voice Picking:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar sessão de Voice Picking',
        errors: error.errors || null
      });
    }
  }

  /**
   * Processar comando de voz
   * POST /api/voice-ar/voice-picking/sessions/:sessionId/commands
   */
  static async processVoiceCommand(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const validatedData = processVoiceCommandSchema.parse(req.body);
      
      const command = await VoiceARModel.processVoiceCommand(sessionId, validatedData);
      
      res.json({
        success: true,
        message: 'Comando de voz processado com sucesso',
        data: command
      });
    } catch (error: any) {
      console.error('Erro ao processar comando de voz:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao processar comando de voz',
        errors: error.errors || null
      });
    }
  }

  /**
   * Obter sessão de Voice Picking
   * GET /api/voice-ar/voice-picking/sessions/:sessionId
   */
  static async getVoicePickingSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      const session = await VoiceARModel.getVoicePickingSession(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão de Voice Picking não encontrada'
        });
      }
      
      res.json({
        success: true,
        data: session
      });
    } catch (error: any) {
      console.error('Erro ao obter sessão de Voice Picking:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar sessões de Voice Picking
   * GET /api/voice-ar/voice-picking/sessions
   */
  static async getVoicePickingSessions(req: Request, res: Response) {
    try {
      const { userId, warehouseId, status } = req.query;
      
      const sessions = await VoiceARModel.getVoicePickingSessions({
        userId: userId as string,
        warehouseId: warehouseId as string,
        status: status as string
      });
      
      res.json({
        success: true,
        data: sessions,
        total: sessions.length
      });
    } catch (error: any) {
      console.error('Erro ao listar sessões de Voice Picking:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Completar sessão de Voice Picking
   * PUT /api/voice-ar/voice-picking/sessions/:sessionId/complete
   */
  static async completeVoicePickingSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      const session = await VoiceARModel.completeVoicePickingSession(sessionId);
      
      res.json({
        success: true,
        message: 'Sessão de Voice Picking completada com sucesso',
        data: session
      });
    } catch (error: any) {
      console.error('Erro ao completar sessão de Voice Picking:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao completar sessão de Voice Picking'
      });
    }
  }

  // === AR (REALIDADE AUMENTADA) ENDPOINTS ===

  /**
   * Criar nova sessão de AR
   * POST /api/voice-ar/ar/sessions
   */
  static async createARSession(req: Request, res: Response) {
    try {
      const validatedData = createARSessionSchema.parse(req.body);
      
      const session = await VoiceARModel.createARSession(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Sessão de AR criada com sucesso',
        data: session
      });
    } catch (error: any) {
      console.error('Erro ao criar sessão de AR:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar sessão de AR',
        errors: error.errors || null
      });
    }
  }

  /**
   * Adicionar marcador AR
   * POST /api/voice-ar/ar/sessions/:sessionId/markers
   */
  static async addARMarker(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const validatedData = addARMarkerSchema.parse(req.body);
      
      const marker = await VoiceARModel.addARMarker(sessionId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Marcador AR adicionado com sucesso',
        data: marker
      });
    } catch (error: any) {
      console.error('Erro ao adicionar marcador AR:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao adicionar marcador AR',
        errors: error.errors || null
      });
    }
  }

  /**
   * Adicionar overlay AR
   * POST /api/voice-ar/ar/sessions/:sessionId/overlays
   */
  static async addAROverlay(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const validatedData = addAROverlaySchema.parse(req.body);
      
      const overlay = await VoiceARModel.addAROverlay(sessionId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Overlay AR adicionado com sucesso',
        data: overlay
      });
    } catch (error: any) {
      console.error('Erro ao adicionar overlay AR:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao adicionar overlay AR',
        errors: error.errors || null
      });
    }
  }

  /**
   * Obter sessão de AR
   * GET /api/voice-ar/ar/sessions/:sessionId
   */
  static async getARSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      const session = await VoiceARModel.getARSession(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sessão de AR não encontrada'
        });
      }
      
      res.json({
        success: true,
        data: session
      });
    } catch (error: any) {
      console.error('Erro ao obter sessão de AR:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar sessões de AR
   * GET /api/voice-ar/ar/sessions
   */
  static async getARSessions(req: Request, res: Response) {
    try {
      const { userId, warehouseId, sessionType, status } = req.query;
      
      const sessions = await VoiceARModel.getARSessions({
        userId: userId as string,
        warehouseId: warehouseId as string,
        sessionType: sessionType as string,
        status: status as string
      });
      
      res.json({
        success: true,
        data: sessions,
        total: sessions.length
      });
    } catch (error: any) {
      console.error('Erro ao listar sessões de AR:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Completar sessão de AR
   * PUT /api/voice-ar/ar/sessions/:sessionId/complete
   */
  static async completeARSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      
      const session = await VoiceARModel.completeARSession(sessionId);
      
      res.json({
        success: true,
        message: 'Sessão de AR completada com sucesso',
        data: session
      });
    } catch (error: any) {
      console.error('Erro ao completar sessão de AR:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao completar sessão de AR'
      });
    }
  }

  // === CONFIGURATION ENDPOINTS ===

  /**
   * Obter configuração de Voice Picking
   * GET /api/voice-ar/voice-picking/config/:warehouseId
   */
  static async getVoicePickingConfig(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      
      const config = await VoiceARModel.getVoicePickingConfig(warehouseId);
      
      res.json({
        success: true,
        data: config
      });
    } catch (error: any) {
      console.error('Erro ao obter configuração de Voice Picking:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar configuração de Voice Picking
   * PUT /api/voice-ar/voice-picking/config/:warehouseId
   */
  static async updateVoicePickingConfig(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const validatedData = voicePickingConfigSchema.parse(req.body);
      
      const config = await VoiceARModel.updateVoicePickingConfig(warehouseId, validatedData);
      
      res.json({
        success: true,
        message: 'Configuração de Voice Picking atualizada com sucesso',
        data: config
      });
    } catch (error: any) {
      console.error('Erro ao atualizar configuração de Voice Picking:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar configuração de Voice Picking',
        errors: error.errors || null
      });
    }
  }

  /**
   * Obter configuração de AR
   * GET /api/voice-ar/ar/config/:warehouseId
   */
  static async getARConfig(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      
      const config = await VoiceARModel.getARConfig(warehouseId);
      
      res.json({
        success: true,
        data: config
      });
    } catch (error: any) {
      console.error('Erro ao obter configuração de AR:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar configuração de AR
   * PUT /api/voice-ar/ar/config/:warehouseId
   */
  static async updateARConfig(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const validatedData = arConfigSchema.parse(req.body);
      
      const config = await VoiceARModel.updateARConfig(warehouseId, validatedData);
      
      res.json({
        success: true,
        message: 'Configuração de AR atualizada com sucesso',
        data: config
      });
    } catch (error: any) {
      console.error('Erro ao atualizar configuração de AR:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar configuração de AR',
        errors: error.errors || null
      });
    }
  }

  // === ANALYTICS ENDPOINTS ===

  /**
   * Obter analytics de Voice Picking
   * GET /api/voice-ar/voice-picking/analytics/:warehouseId
   */
  static async getVoicePickingAnalytics(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const { startDate, endDate } = analyticsTimeRangeSchema.parse(req.query);
      
      const analytics = await VoiceARModel.getVoicePickingAnalytics(warehouseId, {
        startDate,
        endDate
      });
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Erro ao obter analytics de Voice Picking:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao obter analytics de Voice Picking',
        errors: error.errors || null
      });
    }
  }

  /**
   * Obter analytics de AR
   * GET /api/voice-ar/ar/analytics/:warehouseId
   */
  static async getARAnalytics(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const { startDate, endDate } = analyticsTimeRangeSchema.parse(req.query);
      
      const analytics = await VoiceARModel.getARAnalytics(warehouseId, {
        startDate,
        endDate
      });
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Erro ao obter analytics de AR:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao obter analytics de AR',
        errors: error.errors || null
      });
    }
  }

  /**
   * Teste de conectividade do módulo
   * GET /api/voice-ar/health
   */
  static async healthCheck(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Módulo Voice Picking e AR funcionando corretamente',
        timestamp: new Date().toISOString(),
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
        }
      });
    } catch (error: any) {
      console.error('Erro no health check:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}