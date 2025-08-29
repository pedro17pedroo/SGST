import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import userRoutes from './user.routes';

export class UsersModule extends BaseModule {
  config = MODULE_CONFIG.users;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api/users', userRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    // Em Express, não há uma forma direta de remover rotas
    // Em produção, isso seria implementado com hot-reload ou restart
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new UsersModule();