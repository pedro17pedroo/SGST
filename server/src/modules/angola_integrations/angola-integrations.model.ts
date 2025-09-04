import { nanoid } from 'nanoid';

// Tipos para integrações específicas de Angola
export interface EMISIntegration {
  id: string;
  companyTaxId: string; // NIF da empresa
  apiKey: string;
  environment: 'production' | 'sandbox';
  isActive: boolean;
  lastSync: number;
  syncSettings: {
    autoSyncInvoices: boolean;
    autoSyncPayments: boolean;
    syncInterval: number; // em minutos
  };
}

export interface MulticaixaIntegration {
  id: string;
  merchantId: string;
  apiKey: string;
  secretKey: string;
  environment: 'production' | 'sandbox';
  isActive: boolean;
  supportedMethods: ('express' | 'reference' | 'atm')[];
  webhookUrl?: string;
  lastTransaction: number;
}

export interface MobilePaymentProvider {
  id: string;
  name: string;
  provider: 'unitel_money' | 'movicel_money' | 'africell_money';
  apiEndpoint: string;
  merchantCode: string;
  apiKey: string;
  isActive: boolean;
  supportedOperations: ('payment' | 'refund' | 'status_check')[];
  transactionLimits: {
    min: number;
    max: number;
    daily: number;
  };
}

export interface AngolaPaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency: 'AOA' | 'USD';
  provider: string;
  method: 'multicaixa' | 'unitel_money' | 'movicel_money' | 'africell_money' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference?: string;
  phoneNumber?: string;
  timestamp: number;
  completedAt?: number;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface EMISInvoice {
  id: string;
  invoiceNumber: string;
  series: string;
  customerId: string;
  customerName: string;
  customerTaxId: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: 'AOA' | 'USD';
  issueDate: number;
  dueDate: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  emisStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  emisReference?: string;
  qrCode?: string;
}

export class AngolaIntegrationsModel {
  // Storage simulado para integrações de Angola
  private static emisIntegrations: Map<string, EMISIntegration> = new Map();
  private static multicaixaIntegrations: Map<string, MulticaixaIntegration> = new Map();
  private static mobilePaymentProviders: Map<string, MobilePaymentProvider> = new Map();
  private static paymentTransactions: Map<string, AngolaPaymentTransaction> = new Map();
  private static emisInvoices: Map<string, EMISInvoice> = new Map();

  static {
    this.initializeDefaultProviders();
  }

  private static initializeDefaultProviders() {
    // Configurar provedores de pagamento móvel padrão para Angola
    const providers: Omit<MobilePaymentProvider, 'id'>[] = [
      {
        name: 'Unitel Money',
        provider: 'unitel_money',
        apiEndpoint: 'https://api.unitel.ao/money/v1',
        merchantCode: 'SGST_MERCHANT',
        apiKey: 'demo_key_unitel',
        isActive: true,
        supportedOperations: ['payment', 'refund', 'status_check'],
        transactionLimits: {
          min: 1000, // 1.000 AOA
          max: 2000000, // 2.000.000 AOA
          daily: 5000000 // 5.000.000 AOA
        }
      },
      {
        name: 'Movicel Money',
        provider: 'movicel_money',
        apiEndpoint: 'https://api.movicel.ao/money/v1',
        merchantCode: 'SGST_MERCHANT',
        apiKey: 'demo_key_movicel',
        isActive: true,
        supportedOperations: ['payment', 'refund', 'status_check'],
        transactionLimits: {
          min: 1000,
          max: 1500000,
          daily: 4000000
        }
      },
      {
        name: 'Africell Money',
        provider: 'africell_money',
        apiEndpoint: 'https://api.africell.ao/money/v1',
        merchantCode: 'SGST_MERCHANT',
        apiKey: 'demo_key_africell',
        isActive: true,
        supportedOperations: ['payment', 'status_check'],
        transactionLimits: {
          min: 500,
          max: 1000000,
          daily: 3000000
        }
      }
    ];

    providers.forEach(provider => {
      const id = nanoid();
      this.mobilePaymentProviders.set(id, { ...provider, id });
    });

    console.log(`💳 ${providers.length} provedores de pagamento móvel inicializados para Angola`);
  }

  // EMIS Integration Methods
  static async createEMISIntegration(data: Omit<EMISIntegration, 'id' | 'lastSync'>): Promise<EMISIntegration> {
    const integration: EMISIntegration = {
      ...data,
      id: nanoid(),
      lastSync: 0
    };

    this.emisIntegrations.set(integration.id, integration);
    
    console.log(`📊 Integração EMIS criada: ${integration.companyTaxId}`);
    
    return integration;
  }

  static async testEMISConnection(integrationId: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    const integration = this.emisIntegrations.get(integrationId);
    if (!integration) {
      throw new Error('EMIS integration not found');
    }

    // Simular teste de conexão com EMIS
    const success = Math.random() > 0.2; // 80% de sucesso
    
    if (success) {
      return {
        success: true,
        message: 'Conexão com EMIS estabelecida com sucesso',
        details: {
          environment: integration.environment,
          companyTaxId: integration.companyTaxId,
          lastSync: integration.lastSync
        }
      };
    } else {
      return {
        success: false,
        message: 'Falha na conexão com EMIS - verificar credenciais',
        details: {
          error: 'INVALID_CREDENTIALS',
          environment: integration.environment
        }
      };
    }
  }

  static async submitInvoiceToEMIS(invoiceData: Omit<EMISInvoice, 'id' | 'emisStatus' | 'emisReference'>): Promise<EMISInvoice> {
    const invoice: EMISInvoice = {
      ...invoiceData,
      id: nanoid(),
      emisStatus: 'pending',
      emisReference: `EMIS-${nanoid(8).toUpperCase()}`
    };

    this.emisInvoices.set(invoice.id, invoice);

    // Simular processamento assíncrono
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% de sucesso
      invoice.emisStatus = success ? 'approved' : 'rejected';
      if (success) {
        invoice.qrCode = `data:image/png;base64,${nanoid(200)}`;
      }
      this.emisInvoices.set(invoice.id, invoice);
      console.log(`📋 Fatura ${invoice.invoiceNumber} ${success ? 'aprovada' : 'rejeitada'} pelo EMIS`);
    }, 2000);

    console.log(`📋 Fatura ${invoice.invoiceNumber} submetida ao EMIS`);
    
    return invoice;
  }

  // Multicaixa Integration Methods
  static async createMulticaixaIntegration(data: Omit<MulticaixaIntegration, 'id' | 'lastTransaction'>): Promise<MulticaixaIntegration> {
    const integration: MulticaixaIntegration = {
      ...data,
      id: nanoid(),
      lastTransaction: 0
    };

    this.multicaixaIntegrations.set(integration.id, integration);
    
    console.log(`🏦 Integração Multicaixa criada: ${integration.merchantId}`);
    
    return integration;
  }

  static async processMulticaixaPayment(params: {
    integrationId: string;
    amount: number;
    currency: 'AOA' | 'USD';
    orderId: string;
    method: 'express' | 'reference' | 'atm';
    customerPhone?: string;
  }): Promise<AngolaPaymentTransaction> {
    const integration = this.multicaixaIntegrations.get(params.integrationId);
    if (!integration) {
      throw new Error('Multicaixa integration not found');
    }

    const transaction: AngolaPaymentTransaction = {
      id: nanoid(),
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      provider: 'Multicaixa',
      method: 'multicaixa',
      status: 'pending',
      reference: `MC${nanoid(8).toUpperCase()}`,
      phoneNumber: params.customerPhone,
      timestamp: Date.now(),
      metadata: {
        method: params.method,
        merchantId: integration.merchantId
      }
    };

    this.paymentTransactions.set(transaction.id, transaction);

    // Simular processamento assíncrono
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% de sucesso
      transaction.status = success ? 'completed' : 'failed';
      transaction.completedAt = Date.now();
      if (!success) {
        transaction.failureReason = 'Insufficient funds';
      }
      this.paymentTransactions.set(transaction.id, transaction);
      console.log(`💳 Pagamento Multicaixa ${transaction.reference} ${success ? 'aprovado' : 'rejeitado'}`);
    }, 3000);

    console.log(`💳 Pagamento Multicaixa iniciado: ${transaction.reference}`);
    
    return transaction;
  }

  // Mobile Payment Methods
  static async processMobilePayment(params: {
    providerId: string;
    amount: number;
    currency: 'AOA' | 'USD';
    orderId: string;
    customerPhone: string;
  }): Promise<AngolaPaymentTransaction> {
    const provider = this.mobilePaymentProviders.get(params.providerId);
    if (!provider) {
      throw new Error('Mobile payment provider not found');
    }

    // Validar limites
    if (params.amount < provider.transactionLimits.min || params.amount > provider.transactionLimits.max) {
      throw new Error(`Valor fora dos limites: ${provider.transactionLimits.min} - ${provider.transactionLimits.max} ${params.currency}`);
    }

    const transaction: AngolaPaymentTransaction = {
      id: nanoid(),
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency,
      provider: provider.name,
      method: provider.provider,
      status: 'pending',
      reference: `${provider.provider.toUpperCase()}-${nanoid(6)}`,
      phoneNumber: params.customerPhone,
      timestamp: Date.now(),
      metadata: {
        providerId: provider.id,
        merchantCode: provider.merchantCode
      }
    };

    this.paymentTransactions.set(transaction.id, transaction);

    // Simular processamento assíncrono
    setTimeout(() => {
      const success = Math.random() > 0.08; // 92% de sucesso
      transaction.status = success ? 'completed' : 'failed';
      transaction.completedAt = Date.now();
      if (!success) {
        transaction.failureReason = 'Payment declined by provider';
      }
      this.paymentTransactions.set(transaction.id, transaction);
      console.log(`📱 Pagamento ${provider.name} ${transaction.reference} ${success ? 'aprovado' : 'rejeitado'}`);
    }, 5000);

    console.log(`📱 Pagamento ${provider.name} iniciado: ${transaction.reference}`);
    
    return transaction;
  }

  // Query Methods
  static async getEMISIntegrations(): Promise<EMISIntegration[]> {
    return Array.from(this.emisIntegrations.values());
  }

  static async getMulticaixaIntegrations(): Promise<MulticaixaIntegration[]> {
    return Array.from(this.multicaixaIntegrations.values());
  }

  static async getMobilePaymentProviders(): Promise<MobilePaymentProvider[]> {
    return Array.from(this.mobilePaymentProviders.values()).filter(p => p.isActive);
  }

  static async getPaymentTransaction(transactionId: string): Promise<AngolaPaymentTransaction | null> {
    return this.paymentTransactions.get(transactionId) || null;
  }

  static async getPaymentTransactionsByOrder(orderId: string): Promise<AngolaPaymentTransaction[]> {
    return Array.from(this.paymentTransactions.values())
      .filter(t => t.orderId === orderId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  static async getEMISInvoice(invoiceId: string): Promise<EMISInvoice | null> {
    return this.emisInvoices.get(invoiceId) || null;
  }

  static async getEMISInvoices(filters: {
    status?: EMISInvoice['status'];
    emisStatus?: EMISInvoice['emisStatus'];
    customerId?: string;
    dateFrom?: number;
    dateTo?: number;
  } = {}): Promise<EMISInvoice[]> {
    let invoices = Array.from(this.emisInvoices.values());

    if (filters.status) {
      invoices = invoices.filter(inv => inv.status === filters.status);
    }

    if (filters.emisStatus) {
      invoices = invoices.filter(inv => inv.emisStatus === filters.emisStatus);
    }

    if (filters.customerId) {
      invoices = invoices.filter(inv => inv.customerId === filters.customerId);
    }

    if (filters.dateFrom) {
      invoices = invoices.filter(inv => inv.issueDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      invoices = invoices.filter(inv => inv.issueDate <= filters.dateTo!);
    }

    return invoices.sort((a, b) => b.issueDate - a.issueDate);
  }

  // Statistics
  static getStats(): {
    emisIntegrations: number;
    multicaixaIntegrations: number;
    mobileProviders: number;
    totalTransactions: number;
    pendingTransactions: number;
    completedTransactions: number;
    totalInvoices: number;
    pendingInvoices: number;
  } {
    const transactions = Array.from(this.paymentTransactions.values());
    const invoices = Array.from(this.emisInvoices.values());

    return {
      emisIntegrations: this.emisIntegrations.size,
      multicaixaIntegrations: this.multicaixaIntegrations.size,
      mobileProviders: Array.from(this.mobilePaymentProviders.values()).filter(p => p.isActive).length,
      totalTransactions: transactions.length,
      pendingTransactions: transactions.filter(t => t.status === 'pending' || t.status === 'processing').length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      totalInvoices: invoices.length,
      pendingInvoices: invoices.filter(i => i.emisStatus === 'pending').length
    };
  }
}