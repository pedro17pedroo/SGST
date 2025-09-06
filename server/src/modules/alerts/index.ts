import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import alertsRoutes from './alerts.routes';

export class AlertsModule extends BaseModule {
  config = {
    id: 'alerts',
    name: 'Alertas',
    description: 'Sistema de alertas e notificações',
    enabled: true
  };

  async register(app: Express): Promise<void> {
    // Registar rotas do módulo
    app.use('/api/alerts', alertsRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new AlertsModule();

// Função de inicialização para compatibilidade
export function initializeAlertsModule(app: Express) {
  app.use('/api/alerts', alertsRoutes);
}