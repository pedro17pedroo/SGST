import type { Express } from 'express';
import { barcodeScanningRoutes } from './barcode-scanning.routes';

export function initializeBarcodeScanningModule(app: Express) {
  console.log('🔍 Registrando rotas de barcode scanning em /api/barcode-scanning');
  console.log('🔍 Tipo do app:', typeof app);
  console.log('🔍 Tipo das rotas:', typeof barcodeScanningRoutes);
  app.use('/api/barcode-scanning', barcodeScanningRoutes);
  console.log('✅ Rotas de barcode scanning registradas com sucesso');
  console.log('✅ Rotas registradas no caminho: /api/barcode-scanning');
}