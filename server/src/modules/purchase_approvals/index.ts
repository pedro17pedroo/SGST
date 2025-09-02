import { Express } from 'express';
import { purchaseApprovalsRoutes } from './purchase-approvals.routes.js';

export class PurchaseApprovalsModule {
  static id = 'purchase_approvals';
  static moduleName = 'Sistema de Aprovações de Compras';

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api', purchaseApprovalsRoutes);
  }
}

export async function initializePurchaseApprovalsModule(app: Express): Promise<void> {
  const module = new PurchaseApprovalsModule();
  await module.register(app);
}