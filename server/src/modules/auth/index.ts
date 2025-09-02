import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import authRoutes from './auth.routes';

export class AuthModule extends BaseModule {
  config = MODULE_CONFIG.auth;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo de autenticação
    app.use('/api/auth', authRoutes);
    
    console.log('✓ Módulo de Autenticação registrado');
  }
}

// Exportar instância do módulo
export const authModule = new AuthModule();