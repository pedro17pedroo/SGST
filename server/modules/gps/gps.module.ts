import type { Express } from 'express';
import { IModule } from '../base/module.interface';
import gpsRoutes from './gps.routes';

export const gpsModule: IModule = {
  config: {
    id: 'gps_tracking',
    name: 'GPS Tracking',
    description: 'Sistema de rastreamento GPS em tempo real para operadores e motoristas',
    version: '1.0.0',
    category: 'tracking',
    isEnabled: true,
    dependencies: ['auth'],
    permissions: ['gps:read', 'gps:write', 'gps:admin']
  },

  async initialize(app: Express) {
    // Registrar rotas GPS
    app.use('/api/gps', gpsRoutes);
    
    console.log('✓ Módulo GPS Tracking registrado');
  },

  async cleanup() {
    // Cleanup se necessário
    console.log('GPS Tracking module cleaned up');
  }
};