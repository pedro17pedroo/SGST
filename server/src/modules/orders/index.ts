import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import ordersRoutes from './orders.routes';

export class OrdersModule extends BaseModule {
  config = MODULE_CONFIG.orders;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/orders', ordersRoutes);
    
    // Módulo registrado
  }

  async unregister(app: Express): Promise<void> {
    // Módulo desregistrado
  }
}

export default new OrdersModule();