import { BaseModule } from '../base/module.interface';
import { ModuleConfig } from '../../config/modules';
import { Express } from 'express';
import routes from './angola-integrations.routes';

export class AngolaIntegrationsModule extends BaseModule {
  config: ModuleConfig = {
    id: 'angola_integrations',
    name: 'Integrações Angola',
    description: 'Integrações específicas para Angola: EMIS, Multicaixa, Pagamentos Móveis',
    enabled: true,
    routes: ['/api/angola']
  };

  async register(app: Express): Promise<void> {
    app.use('/api/angola', routes);
    console.log(`✅ Módulo ${this.config.name} registrado`);
  }
}

export const angolaIntegrationsModule = new AngolaIntegrationsModule();

// Função para inicialização direta
export async function initializeAngolaIntegrationsModule(app: Express): Promise<void> {
  const module = new AngolaIntegrationsModule();
  await module.register(app);
}