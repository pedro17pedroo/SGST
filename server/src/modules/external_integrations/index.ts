import { BaseModule } from '../base/module.interface';
import { ModuleConfig } from '../../config/modules';
import { Express } from 'express';
import routes from './external-integrations.routes';

export class ExternalIntegrationsModule extends BaseModule {
  config: ModuleConfig = {
    id: 'external_integrations',
    name: 'Integrações Externas',
    description: 'Gestão de integrações ERP/CRM/E-commerce',
    enabled: true,
    routes: ['/api/integrations']
  };

  async register(app: Express): Promise<void> {
    app.use('/api/integrations', routes);
    console.log(`Módulo ${this.config.name} registrado`);
  }
}

export const externalIntegrationsModule = new ExternalIntegrationsModule();