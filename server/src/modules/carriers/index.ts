import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import carriersRoutes from './carriers.routes';

export class CarriersModule extends BaseModule {
  config = MODULE_CONFIG.carriers;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/carriers', carriersRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new CarriersModule();
export * from './carriers.controller';
export * from './carriers.model';