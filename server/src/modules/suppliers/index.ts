import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import suppliersRoutes from './suppliers.routes';

export class SuppliersModule extends BaseModule {
  config = MODULE_CONFIG.suppliers;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/suppliers', suppliersRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new SuppliersModule();