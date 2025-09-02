import { Express } from 'express';
import { rtlsRoutes } from './rtls.routes';

export function initializeRTLSModule(app: Express) {
  app.use('/api', rtlsRoutes);
}