import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import putawayRoutes from './putaway.routes';

export class PutawayManagementModule extends BaseModule {
  config = MODULE_CONFIG.putaway_management;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api', putawayRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new PutawayManagementModule();