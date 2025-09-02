export interface ERPIntegration {
  id: string;
  name: string;
  type: 'SAP' | 'Oracle' | 'Microsoft_Dynamics' | 'NetSuite' | 'Sage' | 'Custom_ERP';
  config: {
    baseUrl: string;
    apiKey: string;
    username?: string;
    password?: string;
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
    version?: string;
    timeout: number;
  };
  syncSettings: {
    syncProducts: boolean;
    syncCustomers: boolean;
    syncOrders: boolean;
    syncInventory: boolean;
    syncSuppliers: boolean;
    syncFinancialData: boolean;
    syncInterval: 'realtime' | '5min' | '15min' | 'hourly' | 'daily';
    batchSize: number;
  };
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastSync?: Date;
  isActive: boolean;
  createdAt: Date;
  createdByUserId: string;
}

export interface CRMIntegration {
  id: string;
  name: string;
  type: 'Salesforce' | 'HubSpot' | 'Microsoft_CRM' | 'Pipedrive' | 'Zoho_CRM' | 'Custom_CRM';
  config: {
    baseUrl: string;
    apiKey: string;
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    version?: string;
    sandbox: boolean;
  };
  syncSettings: {
    syncLeads: boolean;
    syncAccounts: boolean;
    syncContacts: boolean;
    syncOpportunities: boolean;
    syncActivities: boolean;
    syncInterval: 'realtime' | '5min' | '15min' | 'hourly' | 'daily';
    bidirectionalSync: boolean;
  };
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastSync?: Date;
  isActive: boolean;
  createdAt: Date;
  createdByUserId: string;
}

export interface EcommerceIntegration {
  id: string;
  name: string;
  type: 'Shopify' | 'WooCommerce' | 'Magento' | 'PrestaShop' | 'BigCommerce' | 'Custom_Ecommerce';
  config: {
    storeUrl: string;
    apiKey: string;
    apiSecret?: string;
    accessToken?: string;
    webhookSecret?: string;
    version?: string;
  };
  syncSettings: {
    syncProducts: boolean;
    syncOrders: boolean;
    syncCustomers: boolean;
    syncInventory: boolean;
    autoFulfillOrders: boolean;
    syncPricing: boolean;
    syncImages: boolean;
    syncInterval: 'realtime' | '5min' | '15min' | 'hourly';
  };
  status: 'active' | 'inactive' | 'error' | 'testing';
  lastSync?: Date;
  isActive: boolean;
  createdAt: Date;
  createdByUserId: string;
}

export interface SyncJob {
  id: string;
  integrationId: string;
  integrationName: string;
  entityType: 'products' | 'customers' | 'orders' | 'inventory' | 'suppliers' | 'leads' | 'accounts';
  direction: 'import' | 'export' | 'bidirectional';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  recordsToProcess?: number;
  recordsProcessed?: number;
  recordsSucceeded?: number;
  recordsFailed?: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  errors?: string[];
  requestedByUserId: string;
}

export interface AvailableConnector {
  type: string;
  name: string;
  description: string;
  logo: string;
  category: 'ERP' | 'CRM' | 'Ecommerce' | 'Logistics' | 'Payment' | 'Other';
  supportedFeatures: string[];
  requiredCredentials: string[];
  documentation: string;
}

export class ExternalIntegrationsModel {
  static async getIntegrations(filters: { type?: string; active?: boolean }) {
    // Mock implementation - would connect to database
    const mockIntegrations = [
      {
        id: '1',
        name: 'SAP ECC Integration',
        type: 'SAP' as const,
        status: 'active' as const,
        lastSync: new Date(Date.now() - 3600000),
        syncSettings: {
          syncProducts: true,
          syncCustomers: true,
          syncOrders: true,
          syncInventory: true,
          syncInterval: 'hourly' as const
        },
        isActive: true,
        createdAt: new Date()
      }
    ];
    
    return mockIntegrations.filter(integration => {
      if (filters.type && !integration.type.toLowerCase().includes(filters.type.toLowerCase())) return false;
      if (filters.active !== undefined && integration.isActive !== filters.active) return false;
      return true;
    });
  }

  static async createERPIntegration(data: Partial<ERPIntegration>) {
    return {
      id: `erp_${Date.now()}`,
      ...data,
      status: 'testing' as const,
      createdAt: new Date()
    };
  }

  static async createCRMIntegration(data: Partial<CRMIntegration>) {
    return {
      id: `crm_${Date.now()}`,
      ...data,
      status: 'testing' as const,
      createdAt: new Date()
    };
  }

  static async createEcommerceIntegration(data: Partial<EcommerceIntegration>) {
    return {
      id: `ecom_${Date.now()}`,
      ...data,
      status: 'testing' as const,
      createdAt: new Date()
    };
  }

  static async testIntegration(integrationId: string) {
    return {
      success: true,
      responseTime: Math.floor(Math.random() * 500) + 200,
      status: 'connected',
      details: 'Connection established successfully',
      availableEndpoints: ['/api/products', '/api/customers', '/api/orders']
    };
  }

  static async syncData(params: any) {
    const jobId = `sync_${Date.now()}`;
    return {
      jobId,
      status: 'pending',
      estimatedDuration: '5-10 minutes',
      recordsToProcess: Math.floor(Math.random() * 1000) + 100
    };
  }

  static async getSyncHistory(filters: any) {
    return [
      {
        id: 'sync_001',
        integrationName: 'SAP Integration',
        entityType: 'products',
        direction: 'import',
        status: 'completed',
        recordsProcessed: 150,
        recordsSucceeded: 148,
        recordsFailed: 2,
        startedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 7000000),
        duration: 120,
        errors: ['Product ID 12345 missing required field']
      }
    ];
  }

  static async getIntegrationHealth() {
    return {
      totalIntegrations: 5,
      activeIntegrations: 4,
      healthyIntegrations: 3,
      failingIntegrations: 1,
      lastSyncSummary: {
        successful: 4,
        failed: 1,
        lastRun: new Date(Date.now() - 3600000)
      },
      uptime: '99.2%',
      averageResponseTime: 350
    };
  }

  static async updateIntegration(integrationId: string, updates: any) {
    return {
      id: integrationId,
      ...updates,
      updatedAt: new Date()
    };
  }

  static async deleteIntegration(integrationId: string) {
    // Mock delete operation
    return true;
  }

  static async getAvailableConnectors() {
    return [
      {
        type: 'SAP',
        name: 'SAP ECC/S4HANA',
        description: 'Connect to SAP systems for complete ERP integration',
        logo: '/logos/sap.png',
        category: 'ERP' as const,
        supportedFeatures: ['Products', 'Customers', 'Orders', 'Inventory', 'Financial'],
        requiredCredentials: ['Base URL', 'Username', 'Password', 'Client ID'],
        documentation: 'https://docs.sap.com/api'
      },
      {
        type: 'Salesforce',
        name: 'Salesforce CRM',
        description: 'Sync leads, accounts and opportunities',
        logo: '/logos/salesforce.png',
        category: 'CRM' as const,
        supportedFeatures: ['Leads', 'Accounts', 'Contacts', 'Opportunities'],
        requiredCredentials: ['Instance URL', 'Access Token', 'Client ID', 'Client Secret'],
        documentation: 'https://developer.salesforce.com'
      },
      {
        type: 'Shopify',
        name: 'Shopify Store',
        description: 'Connect to Shopify for e-commerce integration',
        logo: '/logos/shopify.png',
        category: 'Ecommerce' as const,
        supportedFeatures: ['Products', 'Orders', 'Customers', 'Inventory'],
        requiredCredentials: ['Store URL', 'API Key', 'API Secret'],
        documentation: 'https://shopify.dev/api'
      }
    ];
  }
}