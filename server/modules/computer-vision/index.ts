import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import cvRoutes from './cv.routes';

export class ComputerVisionModule extends BaseModule {
  config = MODULE_CONFIG.computer_vision;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api', cvRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new ComputerVisionModule();