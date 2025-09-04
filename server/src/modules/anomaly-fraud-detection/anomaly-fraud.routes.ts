import { Router } from 'express';
import { AnomalyFraudController } from './anomaly-fraud.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// === GESTÃO DE REGRAS DE ANOMALIA ===
// Criar nova regra de anomalia
router.post('/rules', 
  requireAuth, 
  requireRole(['admin', 'manager']), 
  AnomalyFraudController.createAnomalyRule
);

// Obter todas as regras de anomalia
router.get('/rules', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getAnomalyRules
);

// Obter regra específica
router.get('/rules/:id', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getAnomalyRule
);

// Atualizar regra de anomalia
router.put('/rules/:id', 
  requireAuth, 
  requireRole(['admin', 'manager']), 
  AnomalyFraudController.updateAnomalyRule
);

// Eliminar regra de anomalia
router.delete('/rules/:id', 
  requireAuth, 
  requireRole(['admin']), 
  AnomalyFraudController.deleteAnomalyRule
);

// === DETECÇÃO DE ANOMALIAS ===
// Executar detecção de anomalias
router.post('/detect', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.detectAnomalies
);

// Obter todas as detecções
router.get('/detections', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getAnomalyDetections
);

// Obter detecção específica
router.get('/detections/:id', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getAnomalyDetection
);

// Investigar anomalia
router.post('/detections/:id/investigate', 
  requireAuth, 
  requireRole(['admin', 'manager']), 
  AnomalyFraudController.investigateAnomaly
);

// === PADRÕES DE FRAUDE ===
// Criar novo padrão de fraude
router.post('/fraud-patterns', 
  requireAuth, 
  requireRole(['admin', 'manager']), 
  AnomalyFraudController.createFraudPattern
);

// Obter todos os padrões de fraude
router.get('/fraud-patterns', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getFraudPatterns
);

// Obter padrão específico
router.get('/fraud-patterns/:id', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getFraudPattern
);

// Atualizar padrão de fraude
router.put('/fraud-patterns/:id', 
  requireAuth, 
  requireRole(['admin', 'manager']), 
  AnomalyFraudController.updateFraudPattern
);

// Eliminar padrão de fraude
router.delete('/fraud-patterns/:id', 
  requireAuth, 
  requireRole(['admin']), 
  AnomalyFraudController.deleteFraudPattern
);

// === ALERTAS DE SEGURANÇA ===
// Obter todos os alertas de segurança
router.get('/security-alerts', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getSecurityAlerts
);

// Obter alerta específico
router.get('/security-alerts/:id', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getSecurityAlert
);

// Atualizar alerta de segurança
router.put('/security-alerts/:id', 
  requireAuth, 
  requireRole(['admin', 'manager']), 
  AnomalyFraudController.updateSecurityAlert
);

// === PERFIS DE COMPORTAMENTO ===
// Atualizar perfil de comportamento
router.post('/behavior-profiles', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.updateBehaviorProfile
);

// Obter perfil de comportamento
router.get('/behavior-profiles/:entityId', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getBehaviorProfile
);

// === PONTUAÇÃO DE RISCO ===
// Calcular pontuação de risco
router.post('/risk-score', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.calculateRiskScore
);

// Obter pontuação de risco
router.get('/risk-score/:entityId', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getRiskScore
);

// Obter entidades de alto risco
router.get('/high-risk-entities', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getHighRiskEntities
);

// === ESTATÍSTICAS E RELATÓRIOS ===
// Obter estatísticas
router.get('/statistics', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.getStatistics
);

// === HEALTH CHECK ===
// Health check do módulo
router.get('/health', 
  requireAuth, 
  requireRole(['admin', 'manager', 'operator']), 
  AnomalyFraudController.healthCheck
);

export default router;