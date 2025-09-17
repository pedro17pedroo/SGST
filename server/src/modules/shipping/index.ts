import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import shippingRoutes from './shipping.routes';

export class ShippingModule extends BaseModule {
  config = MODULE_CONFIG.shipping;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/shipping', shippingRoutes);
    
    // Módulo registrado
  }

  async unregister(app: Express): Promise<void> {
    // Módulo desregistrado
  }
}

export default new ShippingModule();