import { z } from 'zod';

// Interfaces para detecção de anomalias e fraudes
export interface AnomalyRule {
  id: string;
  name: string;
  description: string;
  type: 'statistical' | 'pattern' | 'behavioral' | 'threshold';
  category: 'inventory' | 'transaction' | 'user' | 'system' | 'location';
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  parameters: Record<string, any>;
  threshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnomalyDetection {
  id: string;
  ruleId: string;
  ruleName: string;
  type: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  confidence: number; // 0-1
  status: 'detected' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved';
  title: string;
  description: string;
  affectedEntity: {
    type: 'product' | 'user' | 'transaction' | 'location' | 'device';
    id: string;
    name: string;
  };
  evidence: {
    type: string;
    data: any;
    timestamp: Date;
  }[];
  metadata: Record<string, any>;
  detectedAt: Date;
  investigatedAt?: Date;
  resolvedAt?: Date;
  investigatedBy?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface FraudPattern {
  id: string;
  name: string;
  description: string;
  pattern: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityAlert {
  id: string;
  type: 'anomaly' | 'fraud' | 'security_breach' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  affectedSystems: string[];
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface BehaviorProfile {
  entityId: string;
  entityType: 'user' | 'device' | 'location';
  profile: {
    normalPatterns: Record<string, any>;
    averageActivity: Record<string, number>;
    timePatterns: Record<string, any>;
    locationPatterns?: Record<string, any>;
  };
  lastUpdated: Date;
  confidence: number;
}

export interface RiskScore {
  entityId: string;
  entityType: string;
  score: number; // 0-100
  factors: {
    factor: string;
    weight: number;
    value: number;
    contribution: number;
  }[];
  lastCalculated: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Esquemas de validação
export const createAnomalyRuleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  type: z.enum(['statistical', 'pattern', 'behavioral', 'threshold']),
  category: z.enum(['inventory', 'transaction', 'user', 'system', 'location']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  parameters: z.record(z.any()),
  threshold: z.number().min(0).max(100),
  enabled: z.boolean().default(true)
});

export const updateAnomalyRuleSchema = createAnomalyRuleSchema.partial();

export const investigateAnomalySchema = z.object({
  status: z.enum(['investigating', 'confirmed', 'false_positive', 'resolved']),
  notes: z.string().optional(),
  investigatedBy: z.string()
});

export const createFraudPatternSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  pattern: z.string().min(1, 'Padrão é obrigatório'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  indicators: z.array(z.string()),
  enabled: z.boolean().default(true)
});

export const updateFraudPatternSchema = createFraudPatternSchema.partial();

// Classe principal do modelo
export class AnomalyFraudModel {
  // Armazenamento em memória (em produção, usar base de dados)
  private static anomalyRules: Map<string, AnomalyRule> = new Map();
  private static anomalyDetections: Map<string, AnomalyDetection> = new Map();
  private static fraudPatterns: Map<string, FraudPattern> = new Map();
  private static securityAlerts: Map<string, SecurityAlert> = new Map();
  private static behaviorProfiles: Map<string, BehaviorProfile> = new Map();
  private static riskScores: Map<string, RiskScore> = new Map();

  // === GESTÃO DE REGRAS DE ANOMALIA ===
  static async createAnomalyRule(data: z.infer<typeof createAnomalyRuleSchema>): Promise<AnomalyRule> {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const rule: AnomalyRule = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.anomalyRules.set(id, rule);
    return rule;
  }

  static async getAnomalyRules(filters?: {
    type?: string;
    category?: string;
    enabled?: boolean;
  }): Promise<AnomalyRule[]> {
    let rules = Array.from(this.anomalyRules.values());
    
    if (filters) {
      if (filters.type) {
        rules = rules.filter(rule => rule.type === filters.type);
      }
      if (filters.category) {
        rules = rules.filter(rule => rule.category === filters.category);
      }
      if (filters.enabled !== undefined) {
        rules = rules.filter(rule => rule.enabled === filters.enabled);
      }
    }
    
    return rules.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getAnomalyRule(id: string): Promise<AnomalyRule | undefined> {
    return this.anomalyRules.get(id);
  }

  static async updateAnomalyRule(id: string, data: z.infer<typeof updateAnomalyRuleSchema>): Promise<AnomalyRule | undefined> {
    const rule = this.anomalyRules.get(id);
    if (!rule) return undefined;
    
    const updatedRule = {
      ...rule,
      ...data,
      updatedAt: new Date()
    };
    
    this.anomalyRules.set(id, updatedRule);
    return updatedRule;
  }

  static async deleteAnomalyRule(id: string): Promise<boolean> {
    return this.anomalyRules.delete(id);
  }

  // === DETECÇÃO DE ANOMALIAS ===
  static async detectAnomalies(data: {
    entityType: string;
    entityId: string;
    metrics: Record<string, any>;
    context?: Record<string, any>;
  }): Promise<AnomalyDetection[]> {
    const detections: AnomalyDetection[] = [];
    const enabledRules = Array.from(this.anomalyRules.values()).filter(rule => rule.enabled);
    
    for (const rule of enabledRules) {
      const detection = await this.evaluateRule(rule, data);
      if (detection) {
        this.anomalyDetections.set(detection.id, detection);
        detections.push(detection);
        
        // Criar alerta de segurança se for crítico
        if (detection.severity === 'critical' || detection.severity === 'high') {
          await this.createSecurityAlert({
            type: 'anomaly',
            severity: detection.severity,
            title: `Anomalia Detectada: ${detection.title}`,
            description: detection.description,
            source: `Regra: ${rule.name}`,
            affectedSystems: [data.entityType]
          });
        }
      }
    }
    
    return detections;
  }

  private static async evaluateRule(rule: AnomalyRule, data: any): Promise<AnomalyDetection | null> {
    // Simulação de avaliação de regra (em produção, implementar algoritmos ML)
    const score = Math.random() * 100;
    const confidence = Math.random();
    
    if (score > rule.threshold) {
      const id = `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id,
        ruleId: rule.id,
        ruleName: rule.name,
        type: rule.type,
        category: rule.category,
        severity: rule.severity,
        score,
        confidence,
        status: 'detected',
        title: `Anomalia ${rule.type} detectada`,
        description: `${rule.description} - Score: ${score.toFixed(2)}`,
        affectedEntity: {
          type: data.entityType as any,
          id: data.entityId,
          name: data.entityId
        },
        evidence: [{
          type: 'metrics',
          data: data.metrics,
          timestamp: new Date()
        }],
        metadata: {
          rule: rule,
          context: data.context || {}
        },
        detectedAt: new Date()
      };
    }
    
    return null;
  }

  static async getAnomalyDetections(filters?: {
    status?: string;
    severity?: string;
    category?: string;
    limit?: number;
  }): Promise<AnomalyDetection[]> {
    let detections = Array.from(this.anomalyDetections.values());
    
    if (filters) {
      if (filters.status) {
        detections = detections.filter(d => d.status === filters.status);
      }
      if (filters.severity) {
        detections = detections.filter(d => d.severity === filters.severity);
      }
      if (filters.category) {
        detections = detections.filter(d => d.category === filters.category);
      }
    }
    
    detections.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
    
    if (filters?.limit) {
      detections = detections.slice(0, filters.limit);
    }
    
    return detections;
  }

  static async getAnomalyDetection(id: string): Promise<AnomalyDetection | undefined> {
    return this.anomalyDetections.get(id);
  }

  static async investigateAnomaly(id: string, data: z.infer<typeof investigateAnomalySchema>): Promise<AnomalyDetection | undefined> {
    const detection = this.anomalyDetections.get(id);
    if (!detection) return undefined;
    
    const updatedDetection = {
      ...detection,
      status: data.status,
      notes: data.notes,
      investigatedBy: data.investigatedBy,
      investigatedAt: new Date(),
      resolvedAt: data.status === 'resolved' ? new Date() : undefined,
      resolvedBy: data.status === 'resolved' ? data.investigatedBy : undefined
    };
    
    this.anomalyDetections.set(id, updatedDetection);
    return updatedDetection;
  }

  // === PADRÕES DE FRAUDE ===
  static async createFraudPattern(data: z.infer<typeof createFraudPatternSchema>): Promise<FraudPattern> {
    const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pattern: FraudPattern = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.fraudPatterns.set(id, pattern);
    return pattern;
  }

  static async getFraudPatterns(filters?: {
    riskLevel?: string;
    enabled?: boolean;
  }): Promise<FraudPattern[]> {
    let patterns = Array.from(this.fraudPatterns.values());
    
    if (filters) {
      if (filters.riskLevel) {
        patterns = patterns.filter(p => p.riskLevel === filters.riskLevel);
      }
      if (filters.enabled !== undefined) {
        patterns = patterns.filter(p => p.enabled === filters.enabled);
      }
    }
    
    return patterns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getFraudPattern(id: string): Promise<FraudPattern | undefined> {
    return this.fraudPatterns.get(id);
  }

  static async updateFraudPattern(id: string, data: z.infer<typeof updateFraudPatternSchema>): Promise<FraudPattern | undefined> {
    const pattern = this.fraudPatterns.get(id);
    if (!pattern) return undefined;
    
    const updatedPattern = {
      ...pattern,
      ...data,
      updatedAt: new Date()
    };
    
    this.fraudPatterns.set(id, updatedPattern);
    return updatedPattern;
  }

  static async deleteFraudPattern(id: string): Promise<boolean> {
    return this.fraudPatterns.delete(id);
  }

  // === ALERTAS DE SEGURANÇA ===
  static async createSecurityAlert(data: {
    type: 'anomaly' | 'fraud' | 'security_breach' | 'suspicious_activity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    source: string;
    affectedSystems: string[];
  }): Promise<SecurityAlert> {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alert: SecurityAlert = {
      id,
      ...data,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.securityAlerts.set(id, alert);
    return alert;
  }

  static async getSecurityAlerts(filters?: {
    type?: string;
    severity?: string;
    status?: string;
    limit?: number;
  }): Promise<SecurityAlert[]> {
    let alerts = Array.from(this.securityAlerts.values());
    
    if (filters) {
      if (filters.type) {
        alerts = alerts.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.status) {
        alerts = alerts.filter(a => a.status === filters.status);
      }
    }
    
    alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.limit) {
      alerts = alerts.slice(0, filters.limit);
    }
    
    return alerts;
  }

  static async getSecurityAlert(id: string): Promise<SecurityAlert | undefined> {
    return this.securityAlerts.get(id);
  }

  static async updateSecurityAlert(id: string, data: {
    status?: 'active' | 'investigating' | 'resolved' | 'dismissed';
    assignedTo?: string;
    notes?: string;
  }): Promise<SecurityAlert | undefined> {
    const alert = this.securityAlerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = {
      ...alert,
      ...data,
      updatedAt: new Date(),
      resolvedAt: data.status === 'resolved' ? new Date() : alert.resolvedAt
    };
    
    this.securityAlerts.set(id, updatedAlert);
    return updatedAlert;
  }

  // === PERFIS DE COMPORTAMENTO ===
  static async updateBehaviorProfile(entityId: string, entityType: 'user' | 'device' | 'location', activity: Record<string, any>): Promise<BehaviorProfile> {
    const existing = this.behaviorProfiles.get(entityId);
    
    const profile: BehaviorProfile = {
      entityId,
      entityType,
      profile: {
        normalPatterns: existing?.profile.normalPatterns || {},
        averageActivity: this.calculateAverageActivity(existing?.profile.averageActivity || {}, activity),
        timePatterns: this.calculateTimePatterns(existing?.profile.timePatterns || {}, activity),
        locationPatterns: entityType === 'user' ? this.calculateLocationPatterns(existing?.profile.locationPatterns || {}, activity) : undefined
      },
      lastUpdated: new Date(),
      confidence: Math.min(1, (existing?.confidence || 0) + 0.1)
    };
    
    this.behaviorProfiles.set(entityId, profile);
    return profile;
  }

  private static calculateAverageActivity(existing: Record<string, number>, newActivity: Record<string, any>): Record<string, number> {
    const result = { ...existing };
    
    for (const [key, value] of Object.entries(newActivity)) {
      if (typeof value === 'number') {
        result[key] = existing[key] ? (existing[key] + value) / 2 : value;
      }
    }
    
    return result;
  }

  private static calculateTimePatterns(existing: Record<string, any>, newActivity: Record<string, any>): Record<string, any> {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    return {
      ...existing,
      hourlyActivity: {
        ...existing.hourlyActivity,
        [hour]: (existing.hourlyActivity?.[hour] || 0) + 1
      },
      weeklyActivity: {
        ...existing.weeklyActivity,
        [dayOfWeek]: (existing.weeklyActivity?.[dayOfWeek] || 0) + 1
      }
    };
  }

  private static calculateLocationPatterns(existing: Record<string, any>, newActivity: Record<string, any>): Record<string, any> {
    if (!newActivity.location) return existing;
    
    return {
      ...existing,
      frequentLocations: {
        ...existing.frequentLocations,
        [newActivity.location]: (existing.frequentLocations?.[newActivity.location] || 0) + 1
      }
    };
  }

  static async getBehaviorProfile(entityId: string): Promise<BehaviorProfile | undefined> {
    return this.behaviorProfiles.get(entityId);
  }

  // === PONTUAÇÃO DE RISCO ===
  static async calculateRiskScore(entityId: string, entityType: string, factors: Record<string, number>): Promise<RiskScore> {
    const weights = {
      anomalyCount: 0.3,
      behaviorDeviation: 0.25,
      securityViolations: 0.2,
      accessPatterns: 0.15,
      timePatterns: 0.1
    };
    
    let totalScore = 0;
    const scoringFactors = [];
    
    for (const [factor, value] of Object.entries(factors)) {
      const weight = weights[factor as keyof typeof weights] || 0.1;
      const contribution = value * weight;
      totalScore += contribution;
      
      scoringFactors.push({
        factor,
        weight,
        value,
        contribution
      });
    }
    
    const existing = this.riskScores.get(entityId);
    const trend = existing ? 
      (totalScore > existing.score ? 'increasing' : 
       totalScore < existing.score ? 'decreasing' : 'stable') : 'stable';
    
    const riskScore: RiskScore = {
      entityId,
      entityType,
      score: Math.min(100, Math.max(0, totalScore)),
      factors: scoringFactors,
      lastCalculated: new Date(),
      trend
    };
    
    this.riskScores.set(entityId, riskScore);
    return riskScore;
  }

  static async getRiskScore(entityId: string): Promise<RiskScore | undefined> {
    return this.riskScores.get(entityId);
  }

  static async getHighRiskEntities(threshold: number = 70): Promise<RiskScore[]> {
    return Array.from(this.riskScores.values())
      .filter(score => score.score >= threshold)
      .sort((a, b) => b.score - a.score);
  }

  // === ESTATÍSTICAS E RELATÓRIOS ===
  static async getStatistics(): Promise<{
    anomalies: {
      total: number;
      byStatus: Record<string, number>;
      bySeverity: Record<string, number>;
      byCategory: Record<string, number>;
    };
    fraudPatterns: {
      total: number;
      enabled: number;
      byRiskLevel: Record<string, number>;
    };
    securityAlerts: {
      total: number;
      active: number;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
    };
    riskScores: {
      averageScore: number;
      highRiskEntities: number;
      byEntityType: Record<string, number>;
    };
  }> {
    const anomalies = Array.from(this.anomalyDetections.values());
    const patterns = Array.from(this.fraudPatterns.values());
    const alerts = Array.from(this.securityAlerts.values());
    const risks = Array.from(this.riskScores.values());
    
    return {
      anomalies: {
        total: anomalies.length,
        byStatus: this.groupBy(anomalies, 'status'),
        bySeverity: this.groupBy(anomalies, 'severity'),
        byCategory: this.groupBy(anomalies, 'category')
      },
      fraudPatterns: {
        total: patterns.length,
        enabled: patterns.filter(p => p.enabled).length,
        byRiskLevel: this.groupBy(patterns, 'riskLevel')
      },
      securityAlerts: {
        total: alerts.length,
        active: alerts.filter(a => a.status === 'active').length,
        byType: this.groupBy(alerts, 'type'),
        bySeverity: this.groupBy(alerts, 'severity')
      },
      riskScores: {
        averageScore: risks.length > 0 ? risks.reduce((sum, r) => sum + r.score, 0) / risks.length : 0,
        highRiskEntities: risks.filter(r => r.score >= 70).length,
        byEntityType: this.groupBy(risks, 'entityType')
      }
    };
  }

  private static groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // === INICIALIZAÇÃO ===
  static async initializeDefaultRules(): Promise<void> {
    // Regras padrão de detecção de anomalias
    const defaultRules = [
      {
        name: 'Movimentação Suspeita de Stock',
        description: 'Detecta movimentações de stock fora dos padrões normais',
        type: 'statistical' as const,
        category: 'inventory' as const,
        severity: 'medium' as const,
        parameters: { maxDeviation: 3, timeWindow: 24 },
        threshold: 75,
        enabled: true
      },
      {
        name: 'Acesso Fora de Horário',
        description: 'Detecta acessos ao sistema fora do horário normal de trabalho',
        type: 'behavioral' as const,
        category: 'user' as const,
        severity: 'medium' as const,
        parameters: { workingHours: { start: 8, end: 18 } },
        threshold: 60,
        enabled: true
      },
      {
        name: 'Múltiplas Localizações Simultâneas',
        description: 'Detecta quando um utilizador aparece em múltiplas localizações ao mesmo tempo',
        type: 'pattern' as const,
        category: 'location' as const,
        severity: 'high' as const,
        parameters: { maxDistance: 1000, timeWindow: 5 },
        threshold: 90,
        enabled: true
      },
      {
        name: 'Transações de Alto Valor',
        description: 'Detecta transações com valores acima do limite normal',
        type: 'threshold' as const,
        category: 'transaction' as const,
        severity: 'high' as const,
        parameters: { maxValue: 10000 },
        threshold: 85,
        enabled: true
      },
      {
        name: 'Falhas de Sistema Repetidas',
        description: 'Detecta falhas repetidas que podem indicar tentativas de ataque',
        type: 'pattern' as const,
        category: 'system' as const,
        severity: 'critical' as const,
        parameters: { maxFailures: 5, timeWindow: 10 },
        threshold: 95,
        enabled: true
      }
    ];
    
    for (const ruleData of defaultRules) {
      await this.createAnomalyRule(ruleData);
    }
    
    console.log(`🔒 ${defaultRules.length} regras de anomalia inicializadas`);
  }

  static async initializeDefaultPatterns(): Promise<void> {
    // Padrões padrão de fraude
    const defaultPatterns = [
      {
        name: 'Manipulação de Etiquetas',
        description: 'Padrão que indica possível manipulação de etiquetas RFID/códigos de barras',
        pattern: 'tag_manipulation',
        riskLevel: 'high' as const,
        indicators: ['multiple_reads_same_tag', 'tag_location_mismatch', 'invalid_tag_sequence'],
        enabled: true
      },
      {
        name: 'Desvio de Mercadoria',
        description: 'Padrão que indica possível desvio de mercadorias durante o transporte',
        pattern: 'cargo_diversion',
        riskLevel: 'critical' as const,
        indicators: ['route_deviation', 'unexpected_stops', 'seal_tampering'],
        enabled: true
      },
      {
        name: 'Fraude de Inventário',
        description: 'Padrão que indica possível fraude nos registos de inventário',
        pattern: 'inventory_fraud',
        riskLevel: 'high' as const,
        indicators: ['phantom_inventory', 'quantity_discrepancies', 'unauthorized_adjustments'],
        enabled: true
      }
    ];
    
    for (const patternData of defaultPatterns) {
      await this.createFraudPattern(patternData);
    }
    
    console.log(`🔒 ${defaultPatterns.length} padrões de fraude inicializados`);
  }
}