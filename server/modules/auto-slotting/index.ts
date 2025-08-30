import { Express } from 'express';
import autoSlottingRoutes from './auto-slotting.routes';

export const autoSlottingModule = {
  config: {
    id: 'auto_slotting',
    name: 'Auto-Slotting Inteligente',
    description: 'Otimização automática de layout com machine learning',
    enabled: true
  },
  async register(app: Express) {
    app.use('/api/auto-slotting', autoSlottingRoutes);
    console.log('✓ Módulo Auto-Slotting Inteligente registrado');
  }
};

export default autoSlottingModule;