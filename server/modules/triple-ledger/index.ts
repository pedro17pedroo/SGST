import { Express } from 'express';
import tripleLedgerRoutes from './triple-ledger.routes';

export const tripleLedgerModule = {
  config: {
    id: 'triple_ledger',
    name: 'Triple-Ledger Traceability',
    description: 'Sistema anti-fraude com WORM storage e rastreabilidade completa',
    enabled: true
  },
  async register(app: Express) {
    app.use('/api/triple-ledger', tripleLedgerRoutes);
    console.log('✓ Módulo Triple-Ledger Traceability registrado');
  }
};

export default tripleLedgerModule;