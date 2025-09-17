import type { Express } from 'express';
import { pickingPackingRoutes } from './picking-packing.routes';

export function initializePickingPackingModule(app: Express) {
  // Registar rotas diretamente no /api para compatibilidade com frontend
  app.use('/api', pickingPackingRoutes);
}