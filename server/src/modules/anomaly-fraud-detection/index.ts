import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { AnomalyFraudModel } from './anomaly-fraud.model';
import anomalyFraudRoutes from './anomaly-fraud.routes';

/**
 * Módulo de Detecção de Anomalias e Fraudes
 * 
 * Este módulo fornece funcionalidades avançadas para:
 * - Detecção automática de anomalias em tempo real
 * - Identificação de padrões de fraude
 * - Gestão de alertas de segurança
 * - Análise de comportamento de utilizadores e dispositivos
 * - Cálculo de pontuações de risco
 * - Monitorização e relatórios de segurança
 */
export class AnomalyFraudModule extends BaseModule {
  public config = {
    id: 'anomaly-fraud-detection',
    name: 'Detecção de Anomalias e Fraudes',
    description: 'Sistema avançado de detecção de anomalias e prevenção de fraudes com análise comportamental e alertas em tempo real',
    version: '1.0.0',
    enabled: true,
    dependencies: ['auth', 'users'],
    routes: ['/api/anomaly-fraud'],
    tables: [
      'anomaly_rules',
      'anomaly_detections', 
      'fraud_patterns',
      'security_alerts',
      'behavior_profiles',
      'risk_scores'
    ],
    permissions: [
      'anomaly-fraud.read',
      'anomaly-fraud.create',
      'anomaly-fraud.update',
      'anomaly-fraud.delete',
      'anomaly-fraud.investigate',
      'anomaly-fraud.manage-rules',
      'anomaly-fraud.manage-patterns',
      'anomaly-fraud.view-alerts',
      'anomaly-fraud.manage-alerts',
      'anomaly-fraud.view-risk-scores',
      'anomaly-fraud.calculate-risk',
      'anomaly-fraud.view-statistics'
    ]
  };

  /**
   * Regista o módulo e inicializa as funcionalidades
   */
  public async register(app: Express): Promise<void> {
    try {
      console.log(`[${this.config.name}] A registar módulo...`);
      
      // Registar rotas
      app.use(this.config.routes, anomalyFraudRoutes);
      
      // Inicializar regras e padrões padrão
      await this.initializeDefaultData();
      
      console.log(`[${this.config.name}] Módulo registado com sucesso`);
      
      // Listar rotas disponíveis
      this.listAvailableRoutes();
      
    } catch (error) {
      console.error(`[${this.config.name}] Erro ao registar módulo:`, error);
      throw error;
    }
  }

  /**
   * Inicializa dados padrão (regras e padrões)
   */
  private async initializeDefaultData(): Promise<void> {
    try {
      // Inicializar regras padrão de anomalia
      await AnomalyFraudModel.initializeDefaultRules();
      
      // Inicializar padrões padrão de fraude
      await AnomalyFraudModel.initializeDefaultPatterns();
      
      console.log(`[${this.config.name}] Dados padrão inicializados`);
    } catch (error) {
      console.error(`[${this.config.name}] Erro ao inicializar dados padrão:`, error);
      // Não lançar erro para não impedir o registo do módulo
    }
  }

  /**
   * Lista as rotas disponíveis do módulo
   */
  private listAvailableRoutes(): void {
    const routes = [
      // Gestão de Regras
      'POST   /api/anomaly-fraud/rules                    - Criar regra de anomalia',
      'GET    /api/anomaly-fraud/rules                    - Obter regras de anomalia',
      'GET    /api/anomaly-fraud/rules/:id                - Obter regra específica',
      'PUT    /api/anomaly-fraud/rules/:id                - Atualizar regra',
      'DELETE /api/anomaly-fraud/rules/:id                - Eliminar regra',
      
      // Detecção de Anomalias
      'POST   /api/anomaly-fraud/detect                   - Executar detecção',
      'GET    /api/anomaly-fraud/detections               - Obter detecções',
      'GET    /api/anomaly-fraud/detections/:id           - Obter detecção específica',
      'POST   /api/anomaly-fraud/detections/:id/investigate - Investigar anomalia',
      
      // Padrões de Fraude
      'POST   /api/anomaly-fraud/fraud-patterns           - Criar padrão de fraude',
      'GET    /api/anomaly-fraud/fraud-patterns           - Obter padrões',
      'GET    /api/anomaly-fraud/fraud-patterns/:id       - Obter padrão específico',
      'PUT    /api/anomaly-fraud/fraud-patterns/:id       - Atualizar padrão',
      'DELETE /api/anomaly-fraud/fraud-patterns/:id       - Eliminar padrão',
      
      // Alertas de Segurança
      'GET    /api/anomaly-fraud/security-alerts          - Obter alertas',
      'GET    /api/anomaly-fraud/security-alerts/:id      - Obter alerta específico',
      'PUT    /api/anomaly-fraud/security-alerts/:id      - Atualizar alerta',
      
      // Perfis de Comportamento
      'POST   /api/anomaly-fraud/behavior-profiles        - Atualizar perfil',
      'GET    /api/anomaly-fraud/behavior-profiles/:entityId - Obter perfil',
      
      // Pontuação de Risco
      'POST   /api/anomaly-fraud/risk-score               - Calcular pontuação',
      'GET    /api/anomaly-fraud/risk-score/:entityId     - Obter pontuação',
      'GET    /api/anomaly-fraud/high-risk-entities       - Entidades alto risco',
      
      // Estatísticas e Monitorização
      'GET    /api/anomaly-fraud/statistics               - Obter estatísticas',
      'GET    /api/anomaly-fraud/health                   - Health check'
    ];

    console.log(`[${this.config.name}] Rotas disponíveis:`);
    routes.forEach(route => console.log(`  ${route}`));
  }
}

// Exportar instância do módulo
export const anomalyFraudModule = new AnomalyFraudModule();