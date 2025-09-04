import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { ModuleConfig } from '../../config/modules';
import routes from './custom-dashboards.routes';

// Módulo de Dashboards Personalizáveis
export class CustomDashboardsModule extends BaseModule {
  config: ModuleConfig = {
    id: 'custom_dashboards',
    name: 'Dashboards Personalizáveis',
    description: 'Criação e gestão de dashboards personalizados com widgets customizáveis',
    enabled: true,
    dependencies: ['auth', 'users'],
    routes: ['/api/dashboards'],
    tables: ['dashboards', 'dashboard_widgets', 'widget_configs'],
    permissions: [
      'dashboards.read',
      'dashboards.create', 
      'dashboards.update',
      'dashboards.delete',
      'dashboards.share',
      'dashboards.export'
    ]
  };

  async register(app: Express): Promise<void> {
    try {
      // Registrar rotas do módulo
      app.use('/api/dashboards', routes);
      
      console.log(`✅ Módulo ${this.config.name} registrado com sucesso`);
      console.log(`   - Rotas: ${this.config.routes?.join(', ')}`);
      console.log(`   - Dependências: ${this.config.dependencies?.join(', ')}`);
    } catch (error) {
      console.error(`❌ Erro ao registrar módulo ${this.config.name}:`, error);
      throw error;
    }
  }

  async unregister(app: Express): Promise<void> {
    console.log(`🔄 Desregistrando módulo ${this.config.name}`);
    // Implementação específica de limpeza se necessário
    await super.unregister(app);
  }
}

// Exportar instância do módulo
export default new CustomDashboardsModule();