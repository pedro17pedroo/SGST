import { Router } from 'express';
import { SmartReceivingController } from './receiving.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('smart_receiving'));

// ASN Routes
router.post('/asn', SmartReceivingController.createAsn);
router.get('/asn', SmartReceivingController.getAsns);
router.get('/asn/:id', SmartReceivingController.getAsn);
router.put('/asn/:id/status', SmartReceivingController.updateAsnStatus);
router.get('/asn/:id/items', SmartReceivingController.getAsnLineItems);

// Receiving Routes
router.post('/receiving/receipts', SmartReceivingController.createReceivingReceipt);
router.get('/receiving/receipts', SmartReceivingController.getReceivingReceipts);
router.get('/receiving/receipts/:id', SmartReceivingController.getReceivingReceipt);
router.post('/receiving/receipts/:receiptId/items', SmartReceivingController.addReceivingReceiptItem);
router.get('/receiving/receipts/:id/items', SmartReceivingController.getReceivingReceiptItems);
router.get('/receiving/receipts/:id/labels', SmartReceivingController.generateLabels);
router.get('/receiving/stats', SmartReceivingController.getReceivingStats);

// EDI Integration
router.post('/receiving/edi', SmartReceivingController.processEdiData);

export default router;