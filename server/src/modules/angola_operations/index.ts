import { Express } from 'express';
import { angolaOperationsRoutes } from './angola-operations.routes';

export function initializeAngolaOperationsModule(app: Express) {
  app.use('/api/angola', angolaOperationsRoutes);
  console.log('✓ Módulo Operações Angola registrado');
}