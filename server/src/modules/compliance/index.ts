import { Express } from 'express';
import { complianceRoutes } from './compliance.routes.js';

export class ComplianceModule {
  static id = 'compliance';
  static moduleName = 'Conformidade Regulamentar';

  async register(app: Express): Promise<void> {
    app.use('/api', complianceRoutes);
  }
}

export async function initializeComplianceModule(app: Express): Promise<void> {
  const module = new ComplianceModule();
  await module.register(app);
}