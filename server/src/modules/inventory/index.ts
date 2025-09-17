import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import inventoryRoutes from './inventory.routes';

export class InventoryModule extends BaseModule {
  config = MODULE_CONFIG.inventory;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/inventory', inventoryRoutes);
    
    // Módulo registrado
  }

  async unregister(app: Express): Promise<void> {
    // Módulo desregistrado
  }
}

export default new InventoryModule();