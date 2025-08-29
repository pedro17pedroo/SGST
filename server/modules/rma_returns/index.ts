import { Express } from 'express';
import { rmaReturnsRoutes } from './rma-returns.routes.js';

export class RMAReturnsModule {
  static id = 'rma_returns';
  static moduleName = 'Sistema de Gestão de Devoluções (RMA)';

  async register(app: Express): Promise<void> {
    app.use('/api', rmaReturnsRoutes);
  }
}

export async function initializeRMAReturnsModule(app: Express): Promise<void> {
  const module = new RMAReturnsModule();
  await module.register(app);
}