import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../types/auth';
import {
  AnomalyFraudModel,
  createAnomalyRuleSchema,
  updateAnomalyRuleSchema,
  investigateAnomalySchema,
  createFraudPatternSchema,
  updateFraudPatternSchema
} from './anomaly-fraud.model';

// Esquemas de validação para endpoints
const detectAnomaliesSchema = z.object({
  entityType: z.string().min(1, 'Tipo de entidade é obrigatório'),
  entityId: z.string().min(1, 'ID da entidade é obrigatório'),
  metrics: z.record(z.any()),
  context: z.record(z.any()).optional()
});

const updateSecurityAlertSchema = z.object({
  status: z.enum(['active', 'investigating', 'resolved', 'dismissed']).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional()
});

const calculateRiskScoreSchema = z.object({
  entityId: z.string().min(1, 'ID da entidade é obrigatório'),
  entityType: z.string().min(1, 'Tipo de entidade é obrigatório'),
  factors: z.record(z.number())
});

const updateBehaviorProfileSchema = z.object({
  entityId: z.string().min(1, 'ID da entidade é obrigatório'),
  entityType: z.enum(['user', 'device', 'location']),
  activity: z.record(z.any())
});

export class AnomalyFraudController {
  // === GESTÃO DE REGRAS DE ANOMALIA ===
  static async createAnomalyRule(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = createAnomalyRuleSchema.parse(req.body);
      const rule = await AnomalyFraudModel.createAnomalyRule(validated);
      
      res.status(201).json({
        message: 'Regra de anomalia criada com sucesso',
        rule
      });
    } catch (error) {
      console.error('Erro ao criar regra de anomalia:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao criar regra de anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAnomalyRules(req: AuthenticatedRequest, res: Response) {
    try {
      const { type, category, enabled } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type as string;
      if (category) filters.category = category as string;
      if (enabled !== undefined) filters.enabled = enabled === 'true';
      
      const rules = await AnomalyFraudModel.getAnomalyRules(filters);
      
      res.json({
        message: 'Regras de anomalia obtidas com sucesso',
        rules,
        total: rules.length,
        filters
      });
    } catch (error) {
      console.error('Erro ao obter regras de anomalia:', error);
      res.status(500).json({
        message: 'Erro ao obter regras de anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAnomalyRule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const rule = await AnomalyFraudModel.getAnomalyRule(id);
      
      if (!rule) {
        return res.status(404).json({
          message: 'Regra de anomalia não encontrada'
        });
      }
      
      res.json({
        message: 'Regra de anomalia obtida com sucesso',
        rule
      });
    } catch (error) {
      console.error('Erro ao obter regra de anomalia:', error);
      res.status(500).json({
        message: 'Erro ao obter regra de anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateAnomalyRule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateAnomalyRuleSchema.parse(req.body);
      
      const rule = await AnomalyFraudModel.updateAnomalyRule(id, validated);
      
      if (!rule) {
        return res.status(404).json({
          message: 'Regra de anomalia não encontrada'
        });
      }
      
      res.json({
        message: 'Regra de anomalia atualizada com sucesso',
        rule
      });
    } catch (error) {
      console.error('Erro ao atualizar regra de anomalia:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao atualizar regra de anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async deleteAnomalyRule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await AnomalyFraudModel.deleteAnomalyRule(id);
      
      if (!deleted) {
        return res.status(404).json({
          message: 'Regra de anomalia não encontrada'
        });
      }
      
      res.json({
        message: 'Regra de anomalia eliminada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar regra de anomalia:', error);
      res.status(500).json({
        message: 'Erro ao eliminar regra de anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // === DETECÇÃO DE ANOMALIAS ===
  static async detectAnomalies(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = detectAnomaliesSchema.parse(req.body);
      const detections = await AnomalyFraudModel.detectAnomalies(validated);
      
      res.json({
        message: 'Detecção de anomalias executada com sucesso',
        detections,
        total: detections.length,
        criticalCount: detections.filter(d => d.severity === 'critical').length,
        highCount: detections.filter(d => d.severity === 'high').length
      });
    } catch (error) {
      console.error('Erro na detecção de anomalias:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro na detecção de anomalias',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAnomalyDetections(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, severity, category, limit } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (severity) filters.severity = severity as string;
      if (category) filters.category = category as string;
      if (limit) filters.limit = parseInt(limit as string);
      
      const detections = await AnomalyFraudModel.getAnomalyDetections(filters);
      
      res.json({
        message: 'Detecções de anomalia obtidas com sucesso',
        detections,
        total: detections.length,
        filters
      });
    } catch (error) {
      console.error('Erro ao obter detecções de anomalia:', error);
      res.status(500).json({
        message: 'Erro ao obter detecções de anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAnomalyDetection(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const detection = await AnomalyFraudModel.getAnomalyDetection(id);
      
      if (!detection) {
        return res.status(404).json({
          message: 'Detecção de anomalia não encontrada'
        });
      }
      
      res.json({
        message: 'Detecção de anomalia obtida com sucesso',
        detection
      });
    } catch (error) {
      console.error('Erro ao obter detecção de anomalia:', error);
      res.status(500).json({
        message: 'Erro ao obter detecção de anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async investigateAnomaly(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = investigateAnomalySchema.parse(req.body);
      
      const detection = await AnomalyFraudModel.investigateAnomaly(id, validated);
      
      if (!detection) {
        return res.status(404).json({
          message: 'Detecção de anomalia não encontrada'
        });
      }
      
      res.json({
        message: 'Investigação de anomalia atualizada com sucesso',
        detection
      });
    } catch (error) {
      console.error('Erro ao investigar anomalia:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao investigar anomalia',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // === PADRÕES DE FRAUDE ===
  static async createFraudPattern(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = createFraudPatternSchema.parse(req.body);
      const pattern = await AnomalyFraudModel.createFraudPattern(validated);
      
      res.status(201).json({
        message: 'Padrão de fraude criado com sucesso',
        pattern
      });
    } catch (error) {
      console.error('Erro ao criar padrão de fraude:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao criar padrão de fraude',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getFraudPatterns(req: AuthenticatedRequest, res: Response) {
    try {
      const { riskLevel, enabled } = req.query;
      
      const filters: any = {};
      if (riskLevel) filters.riskLevel = riskLevel as string;
      if (enabled !== undefined) filters.enabled = enabled === 'true';
      
      const patterns = await AnomalyFraudModel.getFraudPatterns(filters);
      
      res.json({
        message: 'Padrões de fraude obtidos com sucesso',
        patterns,
        total: patterns.length,
        filters
      });
    } catch (error) {
      console.error('Erro ao obter padrões de fraude:', error);
      res.status(500).json({
        message: 'Erro ao obter padrões de fraude',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getFraudPattern(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const pattern = await AnomalyFraudModel.getFraudPattern(id);
      
      if (!pattern) {
        return res.status(404).json({
          message: 'Padrão de fraude não encontrado'
        });
      }
      
      res.json({
        message: 'Padrão de fraude obtido com sucesso',
        pattern
      });
    } catch (error) {
      console.error('Erro ao obter padrão de fraude:', error);
      res.status(500).json({
        message: 'Erro ao obter padrão de fraude',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateFraudPattern(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateFraudPatternSchema.parse(req.body);
      
      const pattern = await AnomalyFraudModel.updateFraudPattern(id, validated);
      
      if (!pattern) {
        return res.status(404).json({
          message: 'Padrão de fraude não encontrado'
        });
      }
      
      res.json({
        message: 'Padrão de fraude atualizado com sucesso',
        pattern
      });
    } catch (error) {
      console.error('Erro ao atualizar padrão de fraude:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao atualizar padrão de fraude',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async deleteFraudPattern(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await AnomalyFraudModel.deleteFraudPattern(id);
      
      if (!deleted) {
        return res.status(404).json({
          message: 'Padrão de fraude não encontrado'
        });
      }
      
      res.json({
        message: 'Padrão de fraude eliminado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao eliminar padrão de fraude:', error);
      res.status(500).json({
        message: 'Erro ao eliminar padrão de fraude',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // === ALERTAS DE SEGURANÇA ===
  static async getSecurityAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const { type, severity, status, limit } = req.query;
      
      const filters: any = {};
      if (type) filters.type = type as string;
      if (severity) filters.severity = severity as string;
      if (status) filters.status = status as string;
      if (limit) filters.limit = parseInt(limit as string);
      
      const alerts = await AnomalyFraudModel.getSecurityAlerts(filters);
      
      res.json({
        message: 'Alertas de segurança obtidos com sucesso',
        alerts,
        total: alerts.length,
        activeCount: alerts.filter(a => a.status === 'active').length,
        criticalCount: alerts.filter(a => a.severity === 'critical').length
      });
    } catch (error) {
      console.error('Erro ao obter alertas de segurança:', error);
      res.status(500).json({
        message: 'Erro ao obter alertas de segurança',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getSecurityAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const alert = await AnomalyFraudModel.getSecurityAlert(id);
      
      if (!alert) {
        return res.status(404).json({
          message: 'Alerta de segurança não encontrado'
        });
      }
      
      res.json({
        message: 'Alerta de segurança obtido com sucesso',
        alert
      });
    } catch (error) {
      console.error('Erro ao obter alerta de segurança:', error);
      res.status(500).json({
        message: 'Erro ao obter alerta de segurança',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateSecurityAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateSecurityAlertSchema.parse(req.body);
      
      const alert = await AnomalyFraudModel.updateSecurityAlert(id, validated);
      
      if (!alert) {
        return res.status(404).json({
          message: 'Alerta de segurança não encontrado'
        });
      }
      
      res.json({
        message: 'Alerta de segurança atualizado com sucesso',
        alert
      });
    } catch (error) {
      console.error('Erro ao atualizar alerta de segurança:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao atualizar alerta de segurança',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // === PERFIS DE COMPORTAMENTO ===
  static async updateBehaviorProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = updateBehaviorProfileSchema.parse(req.body);
      const profile = await AnomalyFraudModel.updateBehaviorProfile(
        validated.entityId,
        validated.entityType,
        validated.activity
      );
      
      res.json({
        message: 'Perfil de comportamento atualizado com sucesso',
        profile
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil de comportamento:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao atualizar perfil de comportamento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getBehaviorProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const { entityId } = req.params;
      const profile = await AnomalyFraudModel.getBehaviorProfile(entityId);
      
      if (!profile) {
        return res.status(404).json({
          message: 'Perfil de comportamento não encontrado'
        });
      }
      
      res.json({
        message: 'Perfil de comportamento obtido com sucesso',
        profile
      });
    } catch (error) {
      console.error('Erro ao obter perfil de comportamento:', error);
      res.status(500).json({
        message: 'Erro ao obter perfil de comportamento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // === PONTUAÇÃO DE RISCO ===
  static async calculateRiskScore(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = calculateRiskScoreSchema.parse(req.body);
      const riskScore = await AnomalyFraudModel.calculateRiskScore(
        validated.entityId,
        validated.entityType,
        validated.factors
      );
      
      res.json({
        message: 'Pontuação de risco calculada com sucesso',
        riskScore
      });
    } catch (error) {
      console.error('Erro ao calcular pontuação de risco:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        message: 'Erro ao calcular pontuação de risco',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getRiskScore(req: AuthenticatedRequest, res: Response) {
    try {
      const { entityId } = req.params;
      const riskScore = await AnomalyFraudModel.getRiskScore(entityId);
      
      if (!riskScore) {
        return res.status(404).json({
          message: 'Pontuação de risco não encontrada'
        });
      }
      
      res.json({
        message: 'Pontuação de risco obtida com sucesso',
        riskScore
      });
    } catch (error) {
      console.error('Erro ao obter pontuação de risco:', error);
      res.status(500).json({
        message: 'Erro ao obter pontuação de risco',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getHighRiskEntities(req: AuthenticatedRequest, res: Response) {
    try {
      const { threshold } = req.query;
      const thresholdValue = threshold ? parseInt(threshold as string) : 70;
      
      const highRiskEntities = await AnomalyFraudModel.getHighRiskEntities(thresholdValue);
      
      res.json({
        message: 'Entidades de alto risco obtidas com sucesso',
        entities: highRiskEntities,
        total: highRiskEntities.length,
        threshold: thresholdValue
      });
    } catch (error) {
      console.error('Erro ao obter entidades de alto risco:', error);
      res.status(500).json({
        message: 'Erro ao obter entidades de alto risco',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // === ESTATÍSTICAS E RELATÓRIOS ===
  static async getStatistics(req: AuthenticatedRequest, res: Response) {
    try {
      const statistics = await AnomalyFraudModel.getStatistics();
      
      res.json({
        message: 'Estatísticas obtidas com sucesso',
        statistics,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        message: 'Erro ao obter estatísticas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // === HEALTH CHECK ===
  static async healthCheck(req: AuthenticatedRequest, res: Response) {
    try {
      const statistics = await AnomalyFraudModel.getStatistics();
      
      res.json({
        status: 'healthy',
        message: 'Módulo de Detecção de Anomalias e Fraudes operacional',
        timestamp: new Date().toISOString(),
        summary: {
          totalAnomalies: statistics.anomalies.total,
          activeAlerts: statistics.securityAlerts.active,
          enabledRules: Object.values(statistics.anomalies.byStatus).reduce((sum, count) => sum + count, 0),
          highRiskEntities: statistics.riskScores.highRiskEntities
        }
      });
    } catch (error) {
      console.error('Erro no health check:', error);
      res.status(500).json({
        status: 'unhealthy',
        message: 'Erro no módulo de Detecção de Anomalias e Fraudes',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    }
  }
}