import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import putawayRoutes from './putaway.routes';

export class PutawayManagementModule extends BaseModule {
  config = MODULE_CONFIG.putaway_management;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/putaway', putawayRoutes);
    app.use('/api/pallets', putawayRoutes);
    
    // Módulo registrado
  }

  async unregister(app: Express): Promise<void> {
    // Módulo desregistrado
  }
}

export default new PutawayManagementModule();