import { Router } from 'express';
import { AngolaIntegrationsController } from './angola-integrations.controller';

const router = Router();

// EMIS Integration Routes
router.post('/emis/integrations', AngolaIntegrationsController.createEMISIntegration);
router.get('/emis/integrations', AngolaIntegrationsController.getEMISIntegrations);
router.post('/emis/integrations/:integrationId/test', AngolaIntegrationsController.testEMISConnection);

// EMIS Invoice Routes
router.post('/emis/invoices', AngolaIntegrationsController.submitInvoiceToEMIS);
router.get('/emis/invoices', AngolaIntegrationsController.getEMISInvoices);
router.get('/emis/invoices/:invoiceId', AngolaIntegrationsController.getEMISInvoice);

// Multicaixa Integration Routes
router.post('/multicaixa/integrations', AngolaIntegrationsController.createMulticaixaIntegration);
router.get('/multicaixa/integrations', AngolaIntegrationsController.getMulticaixaIntegrations);
router.post('/multicaixa/payments', AngolaIntegrationsController.processMulticaixaPayment);

// Mobile Payment Routes
router.get('/mobile-payments/providers', AngolaIntegrationsController.getMobilePaymentProviders);
router.post('/mobile-payments/process', AngolaIntegrationsController.processMobilePayment);

// Transaction Management Routes
router.get('/transactions/:transactionId', AngolaIntegrationsController.getPaymentTransaction);
router.get('/orders/:orderId/payments', AngolaIntegrationsController.getOrderPayments);

// Statistics and Health Routes
router.get('/stats', AngolaIntegrationsController.getIntegrationsStats);

export default router;