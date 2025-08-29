import { Router } from 'express';
import { ERPIntegrationsController } from './erp-integrations.controller.js';

const router = Router();

// SAP Integration
router.post('/integrations/sap/connect', ERPIntegrationsController.connectSAP);
router.get('/integrations/sap/status', ERPIntegrationsController.getSAPStatus);
router.post('/integrations/sap/sync', ERPIntegrationsController.syncWithSAP);

// Salesforce Integration  
router.post('/integrations/salesforce/connect', ERPIntegrationsController.connectSalesforce);
router.get('/integrations/salesforce/status', ERPIntegrationsController.getSalesforceStatus);
router.post('/integrations/salesforce/sync', ERPIntegrationsController.syncWithSalesforce);

// E-commerce Integrations
router.post('/integrations/shopify/connect', ERPIntegrationsController.connectShopify);
router.post('/integrations/woocommerce/connect', ERPIntegrationsController.connectWooCommerce);
router.get('/integrations/ecommerce/orders', ERPIntegrationsController.getEcommerceOrders);
router.post('/integrations/ecommerce/sync-inventory', ERPIntegrationsController.syncInventoryToEcommerce);

// General integration management
router.get('/integrations', ERPIntegrationsController.listIntegrations);
router.post('/integrations/:integrationId/test', ERPIntegrationsController.testIntegration);
router.post('/integrations/:integrationId/enable', ERPIntegrationsController.enableIntegration);
router.post('/integrations/:integrationId/disable', ERPIntegrationsController.disableIntegration);

export { router as erpIntegrationsRoutes };