import type { Express } from 'express';
import { pickingPackingRoutes } from './picking-packing.routes';

export function initializePickingPackingModule(app: Express) {
  // Registar rotas diretamente nos endpoints que o frontend espera
  app.use('/api', pickingPackingRoutes);
}