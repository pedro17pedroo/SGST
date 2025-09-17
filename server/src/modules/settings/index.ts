import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import settingsRoutes from './settings.routes';

export class SettingsModule extends BaseModule {
  config = MODULE_CONFIG.settings;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api', settingsRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new SettingsModule();