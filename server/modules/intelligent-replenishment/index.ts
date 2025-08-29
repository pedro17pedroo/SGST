import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import replenishmentRoutes from './replenishment.routes';

export class IntelligentReplenishmentModule extends BaseModule {
  config = MODULE_CONFIG.intelligent_replenishment;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api', replenishmentRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new IntelligentReplenishmentModule();