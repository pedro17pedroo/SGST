import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import publicTrackingRoutes from './public-tracking.routes';

export class PublicTrackingModule extends BaseModule {
  config = MODULE_CONFIG.public_tracking;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo (públicas)
    app.use('/api/public', publicTrackingRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new PublicTrackingModule();