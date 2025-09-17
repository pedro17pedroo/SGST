import type { Express } from 'express';
import { inventoryCountsRoutes } from './inventory-counts.routes';

export function initializeInventoryCountsModule(app: Express) {
  console.log('🔍 Registrando rotas de inventory counts em /api/inventory-counts');
  console.log('🔍 Tipo do app:', typeof app);
  console.log('🔍 Tipo das rotas:', typeof inventoryCountsRoutes);
  
  app.use('/api/inventory-counts', inventoryCountsRoutes);
  
  console.log('✅ Rotas de inventory counts registradas com sucesso');
  console.log('✅ Rotas registradas no caminho: /api/inventory-counts');
}