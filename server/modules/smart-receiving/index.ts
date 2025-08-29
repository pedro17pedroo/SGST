import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import receivingRoutes from './receiving.routes';

export class SmartReceivingModule extends BaseModule {
  config = MODULE_CONFIG.smart_receiving;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api', receivingRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new SmartReceivingModule();