import { Request, Response } from 'express';
import { z } from 'zod';
import { ExternalIntegrationsModel } from './external-integrations.model';

// Validation schemas
const erpIntegrationSchema = z.object({
  name: z.string().min(1, "Nome da integração é obrigatório"),
  type: z.enum(["SAP", "Oracle", "Microsoft_Dynamics", "NetSuite", "Sage", "Custom_ERP"]),
  config: z.object({
    baseUrl: z.string().url("URL base inválida"),
    apiKey: z.string().min(1, "Chave API é obrigatória"),
    username: z.string().optional(),
    password: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    tenantId: z.string().optional(),
    version: z.string().optional(),
    timeout: z.number().min(1000).default(30000)
  }),
  syncSettings: z.object({
    syncProducts: z.boolean().default(true),
    syncCustomers: z.boolean().default(true),
    syncOrders: z.boolean().default(true),
    syncInventory: z.boolean().default(true),
    syncSuppliers: z.boolean().default(true),
    syncFinancialData: z.boolean().default(false),
    syncInterval: z.enum(["realtime", "5min", "15min", "hourly", "daily"]).default("hourly"),
    batchSize: z.number().min(1).max(1000).default(100)
  }),
  isActive: z.boolean().default(true)
});

const crmIntegrationSchema = z.object({
  name: z.string().min(1, "Nome da integração é obrigatório"),
  type: z.enum(["Salesforce", "HubSpot", "Microsoft_CRM", "Pipedrive", "Zoho_CRM", "Custom_CRM"]),
  config: z.object({
    baseUrl: z.string().url("URL base inválida"),
    apiKey: z.string().min(1, "Chave API é obrigatória"),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    version: z.string().optional(),
    sandbox: z.boolean().default(false)
  }),
  syncSettings: z.object({
    syncLeads: z.boolean().default(true),
    syncAccounts: z.boolean().default(true),
    syncContacts: z.boolean().default(true),
    syncOpportunities: z.boolean().default(true),
    syncActivities: z.boolean().default(false),
    syncInterval: z.enum(["realtime", "5min", "15min", "hourly", "daily"]).default("hourly"),
    bidirectionalSync: z.boolean().default(false)
  }),
  isActive: z.boolean().default(true)
});

const ecommerceIntegrationSchema = z.object({
  name: z.string().min(1, "Nome da integração é obrigatório"),
  type: z.enum(["Shopify", "WooCommerce", "Magento", "PrestaShop", "BigCommerce", "Custom_Ecommerce"]),
  config: z.object({
    storeUrl: z.string().url("URL da loja inválida"),
    apiKey: z.string().min(1, "Chave API é obrigatória"),
    apiSecret: z.string().optional(),
    accessToken: z.string().optional(),
    webhookSecret: z.string().optional(),
    version: z.string().optional()
  }),
  syncSettings: z.object({
    syncProducts: z.boolean().default(true),
    syncOrders: z.boolean().default(true),
    syncCustomers: z.boolean().default(true),
    syncInventory: z.boolean().default(true),
    autoFulfillOrders: z.boolean().default(false),
    syncPricing: z.boolean().default(true),
    syncImages: z.boolean().default(false),
    syncInterval: z.enum(["realtime", "5min", "15min", "hourly"]).default("15min")
  }),
  isActive: z.boolean().default(true)
});

const syncRequestSchema = z.object({
  integrationId: z.string().uuid(),
  entityType: z.enum(["products", "customers", "orders", "inventory", "suppliers", "leads", "accounts"]),
  direction: z.enum(["import", "export", "bidirectional"]).default("import"),
  filters: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    entityIds: z.array(z.string()).optional(),
    modifiedSince: z.string().datetime().optional()
  }).optional(),
  options: z.object({
    forceFullSync: z.boolean().default(false),
    batchSize: z.number().min(1).max(1000).default(100),
    skipValidation: z.boolean().default(false)
  }).optional()
});

export class ExternalIntegrationsController {
  static async getIntegrations(req: Request, res: Response) {
    try {
      const type = req.query.type as string;
      const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      
      const integrations = await ExternalIntegrationsModel.getIntegrations({ type, active });
      
      res.json({
        integrations: integrations.map(integration => ({
          id: integration.id,
          name: integration.name,
          type: integration.type,
          status: integration.status,
          lastSync: integration.lastSync,
          syncSettings: integration.syncSettings,
          isActive: integration.isActive,
          createdAt: integration.createdAt
        }))
      });
    } catch (error) {
      console.error('Error fetching integrations:', error);
      res.status(500).json({
        message: "Erro ao buscar integrações",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createERPIntegration(req: Request, res: Response) {
    try {
      const validated = erpIntegrationSchema.parse(req.body);
      
      const integration = await ExternalIntegrationsModel.createERPIntegration({
        ...validated,
        createdAt: new Date(),
        createdByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Integração ERP criada com sucesso",
        integration: {
          id: integration.id,
          name: integration.name,
          type: integration.type,
          status: integration.status
        }
      });
    } catch (error) {
      console.error('Error creating ERP integration:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar integração ERP",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async createCRMIntegration(req: Request, res: Response) {
    try {
      const validated = crmIntegrationSchema.parse(req.body);
      
      const integration = await ExternalIntegrationsModel.createCRMIntegration({
        ...validated,
        createdAt: new Date(),
        createdByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Integração CRM criada com sucesso",
        integration: {
          id: integration.id,
          name: integration.name,
          type: integration.type,
          status: integration.status
        }
      });
    } catch (error) {
      console.error('Error creating CRM integration:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar integração CRM",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async createEcommerceIntegration(req: Request, res: Response) {
    try {
      const validated = ecommerceIntegrationSchema.parse(req.body);
      
      const integration = await ExternalIntegrationsModel.createEcommerceIntegration({
        ...validated,
        createdAt: new Date(),
        createdByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Integração E-commerce criada com sucesso",
        integration: {
          id: integration.id,
          name: integration.name,
          type: integration.type,
          status: integration.status
        }
      });
    } catch (error) {
      console.error('Error creating E-commerce integration:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar integração E-commerce",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async testIntegration(req: Request, res: Response) {
    try {
      const { integrationId } = req.params;
      
      const result = await ExternalIntegrationsModel.testIntegration(integrationId);
      
      res.json({
        message: "Teste de integração concluído",
        result: {
          success: result.success,
          responseTime: result.responseTime,
          status: result.status,
          details: result.details,
          availableEndpoints: result.availableEndpoints
        }
      });
    } catch (error) {
      console.error('Error testing integration:', error);
      res.status(500).json({
        message: "Erro ao testar integração",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async syncData(req: Request, res: Response) {
    try {
      const validated = syncRequestSchema.parse(req.body);
      
      const result = await ExternalIntegrationsModel.syncData({
        ...validated,
        requestedAt: new Date(),
        requestedByUserId: req.user?.id || 'system'
      });
      
      res.json({
        message: "Sincronização iniciada com sucesso",
        syncJob: {
          id: result.jobId,
          status: result.status,
          estimatedDuration: result.estimatedDuration,
          recordsToProcess: result.recordsToProcess
        }
      });
    } catch (error) {
      console.error('Error starting data sync:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao iniciar sincronização",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getSyncHistory(req: Request, res: Response) {
    try {
      const integrationId = req.query.integrationId as string;
      const entityType = req.query.entityType as string;
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const history = await ExternalIntegrationsModel.getSyncHistory({
        integrationId,
        entityType,
        status,
        limit
      });
      
      res.json({
        history: history.map(sync => ({
          id: sync.id,
          integrationName: sync.integrationName,
          entityType: sync.entityType,
          direction: sync.direction,
          status: sync.status,
          recordsProcessed: sync.recordsProcessed,
          recordsSucceeded: sync.recordsSucceeded,
          recordsFailed: sync.recordsFailed,
          startedAt: sync.startedAt,
          completedAt: sync.completedAt,
          duration: sync.duration,
          errors: sync.errors
        }))
      });
    } catch (error) {
      console.error('Error fetching sync history:', error);
      res.status(500).json({
        message: "Erro ao buscar histórico de sincronizações",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getIntegrationHealth(req: Request, res: Response) {
    try {
      const health = await ExternalIntegrationsModel.getIntegrationHealth();
      
      res.json({
        health: {
          totalIntegrations: health.totalIntegrations,
          activeIntegrations: health.activeIntegrations,
          healthyIntegrations: health.healthyIntegrations,
          failingIntegrations: health.failingIntegrations,
          lastSyncSummary: health.lastSyncSummary,
          uptime: health.uptime,
          averageResponseTime: health.averageResponseTime
        }
      });
    } catch (error) {
      console.error('Error fetching integration health:', error);
      res.status(500).json({
        message: "Erro ao buscar saúde das integrações",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateIntegration(req: Request, res: Response) {
    try {
      const { integrationId } = req.params;
      const updates = req.body;
      
      const integration = await ExternalIntegrationsModel.updateIntegration(integrationId, {
        ...updates,
        updatedAt: new Date(),
        updatedByUserId: req.user?.id || 'system'
      });
      
      res.json({
        message: "Integração atualizada com sucesso",
        integration: {
          id: integration.id,
          name: integration.name,
          status: integration.status,
          isActive: integration.isActive
        }
      });
    } catch (error) {
      console.error('Error updating integration:', error);
      res.status(500).json({
        message: "Erro ao atualizar integração",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteIntegration(req: Request, res: Response) {
    try {
      const { integrationId } = req.params;
      
      await ExternalIntegrationsModel.deleteIntegration(integrationId);
      
      res.json({
        message: "Integração eliminada com sucesso"
      });
    } catch (error) {
      console.error('Error deleting integration:', error);
      res.status(500).json({
        message: "Erro ao eliminar integração",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAvailableConnectors(req: Request, res: Response) {
    try {
      const connectors = await ExternalIntegrationsModel.getAvailableConnectors();
      
      res.json({
        connectors: connectors.map(connector => ({
          type: connector.type,
          name: connector.name,
          description: connector.description,
          logo: connector.logo,
          category: connector.category,
          supportedFeatures: connector.supportedFeatures,
          requiredCredentials: connector.requiredCredentials,
          documentation: connector.documentation
        }))
      });
    } catch (error) {
      console.error('Error fetching available connectors:', error);
      res.status(500).json({
        message: "Erro ao buscar conectores disponíveis",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}