import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import shippingRoutes from './shipping.routes';

export class ShippingModule extends BaseModule {
  config = MODULE_CONFIG.shipping;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/shipping', shippingRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new ShippingModule();