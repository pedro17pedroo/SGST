import { Express } from 'express';
import { erpIntegrationsRoutes } from './erp-integrations.routes.js';

export class ERPIntegrationsModule {
  static id = 'erp_integrations';
  static moduleName = 'Integrações ERP/CRM';

  async register(app: Express): Promise<void> {
    app.use('/api', erpIntegrationsRoutes);
  }
}

export async function initializeERPIntegrationsModule(app: Express): Promise<void> {
  const module = new ERPIntegrationsModule();
  await module.register(app);
}