import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import authRoutes from './auth.routes';

export const authModule: BaseModule = {
  id: 'auth',
  name: 'Autenticação',
  description: 'Sistema de autenticação e gestão de sessões',
  version: '1.0.0',
  enabled: true,
  dependencies: [],

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo de autenticação
    app.use('/api/auth', authRoutes);
    
    console.log('✓ Módulo de Autenticação registrado');
  }
};