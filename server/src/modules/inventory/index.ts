import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import inventoryRoutes from './inventory.routes';

export class InventoryModule extends BaseModule {
  config = MODULE_CONFIG.inventory;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/inventory', inventoryRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new InventoryModule();