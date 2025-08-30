import { Router } from 'express';
import { TripleLedgerController } from './triple-ledger.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('triple_ledger'));

// Audit Trail routes
router.get('/audit-trail', TripleLedgerController.getAuditTrail);
router.get('/audit-trail/:id', TripleLedgerController.getAuditRecord);
router.post('/audit-trail', TripleLedgerController.createAuditRecord);
router.get('/audit-trail/entity/:entityType/:entityId', TripleLedgerController.getEntityAuditTrail);

// WORM Storage routes
router.get('/worm-storage', TripleLedgerController.getWormStorage);
router.get('/worm-storage/:id', TripleLedgerController.getWormRecord);
router.post('/worm-storage', TripleLedgerController.storeInWorm);

// Fraud Detection routes
router.get('/fraud-detection', TripleLedgerController.getFraudAlerts);
router.get('/fraud-detection/:id', TripleLedgerController.getFraudAlert);
router.post('/fraud-detection', TripleLedgerController.createFraudAlert);
router.put('/fraud-detection/:id', TripleLedgerController.updateFraudAlert);

// Verification and integrity routes
router.post('/verify-integrity', TripleLedgerController.verifyIntegrity);
router.post('/verify-chain', TripleLedgerController.verifyChain);
router.get('/compliance-report', TripleLedgerController.getComplianceReport);

export default router;