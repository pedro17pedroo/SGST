import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import dashboardRoutes from './dashboard.routes';

export class DashboardModule extends BaseModule {
  config = MODULE_CONFIG.dashboard;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/dashboard', dashboardRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new DashboardModule();