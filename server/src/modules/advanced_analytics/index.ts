import { Express } from 'express';
import analyticsRoutes from './analytics.routes.js';

export const initializeAdvancedAnalyticsModule = async (app: Express) => {
  app.use('/api/analytics', analyticsRoutes);
  console.log('✅ Módulo Advanced Analytics registrado');
};

export default {
  config: {
    id: 'advanced_analytics',
    name: 'Análises Avançadas',
    description: 'Análises avançadas e métricas de performance',
    enabled: true
  },
  register: initializeAdvancedAnalyticsModule
};
