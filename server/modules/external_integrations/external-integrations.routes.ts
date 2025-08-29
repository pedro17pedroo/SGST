import { Router } from 'express';
import { ExternalIntegrationsController } from './external-integrations.controller';

const router = Router();

// Get all integrations
router.get('/', ExternalIntegrationsController.getIntegrations);

// Create integrations
router.post('/erp', ExternalIntegrationsController.createERPIntegration);
router.post('/crm', ExternalIntegrationsController.createCRMIntegration);
router.post('/ecommerce', ExternalIntegrationsController.createEcommerceIntegration);

// Test integration
router.post('/:integrationId/test', ExternalIntegrationsController.testIntegration);

// Data synchronization
router.post('/sync', ExternalIntegrationsController.syncData);
router.get('/sync/history', ExternalIntegrationsController.getSyncHistory);

// Health and monitoring
router.get('/health', ExternalIntegrationsController.getIntegrationHealth);

// Management
router.put('/:integrationId', ExternalIntegrationsController.updateIntegration);
router.delete('/:integrationId', ExternalIntegrationsController.deleteIntegration);

// Available connectors
router.get('/connectors', ExternalIntegrationsController.getAvailableConnectors);

export default router;