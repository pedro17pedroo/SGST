import { Request, Response } from 'express';
import { z } from 'zod';
import { AngolaIntegrationsModel } from './angola-integrations.model';

// Schemas de validação
const emisIntegrationSchema = z.object({
  companyTaxId: z.string().min(9, 'NIF deve ter pelo menos 9 dígitos'),
  apiKey: z.string().min(1, 'Chave API é obrigatória'),
  environment: z.enum(['production', 'sandbox']),
  syncSettings: z.object({
    autoSyncInvoices: z.boolean().default(true),
    autoSyncPayments: z.boolean().default(true),
    syncInterval: z.number().min(5).max(1440).default(60) // 5 min a 24h
  })
});

const multicaixaIntegrationSchema = z.object({
  merchantId: z.string().min(1, 'ID do comerciante é obrigatório'),
  apiKey: z.string().min(1, 'Chave API é obrigatória'),
  secretKey: z.string().min(1, 'Chave secreta é obrigatória'),
  environment: z.enum(['production', 'sandbox']),
  supportedMethods: z.array(z.enum(['express', 'reference', 'atm'])).min(1),
  webhookUrl: z.string().url().optional()
});

const mobilePaymentSchema = z.object({
  providerId: z.string().uuid('ID do provedor inválido'),
  amount: z.number().positive('Valor deve ser positivo'),
  currency: z.enum(['AOA', 'USD']),
  orderId: z.string().min(1, 'ID da encomenda é obrigatório'),
  customerPhone: z.string().regex(/^\+244[0-9]{9}$/, 'Número de telefone angolano inválido')
});

const multicaixaPaymentSchema = z.object({
  integrationId: z.string().uuid('ID da integração inválido'),
  amount: z.number().positive('Valor deve ser positivo'),
  currency: z.enum(['AOA', 'USD']),
  orderId: z.string().min(1, 'ID da encomenda é obrigatório'),
  method: z.enum(['express', 'reference', 'atm']),
  customerPhone: z.string().regex(/^\+244[0-9]{9}$/, 'Número de telefone angolano inválido').optional()
});

const emisInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Número da fatura é obrigatório'),
  series: z.string().min(1, 'Série da fatura é obrigatória'),
  customerId: z.string().min(1, 'ID do cliente é obrigatório'),
  customerName: z.string().min(1, 'Nome do cliente é obrigatório'),
  customerTaxId: z.string().min(9, 'NIF do cliente deve ter pelo menos 9 dígitos'),
  items: z.array(z.object({
    description: z.string().min(1, 'Descrição do item é obrigatória'),
    quantity: z.number().positive('Quantidade deve ser positiva'),
    unitPrice: z.number().positive('Preço unitário deve ser positivo'),
    taxRate: z.number().min(0).max(100, 'Taxa de imposto deve estar entre 0 e 100%'),
    total: z.number().positive('Total do item deve ser positivo')
  })).min(1, 'Pelo menos um item é obrigatório'),
  subtotal: z.number().positive('Subtotal deve ser positivo'),
  taxAmount: z.number().min(0, 'Valor do imposto não pode ser negativo'),
  total: z.number().positive('Total deve ser positivo'),
  currency: z.enum(['AOA', 'USD']),
  issueDate: z.number().positive('Data de emissão é obrigatória'),
  dueDate: z.number().positive('Data de vencimento é obrigatória'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft')
});

export class AngolaIntegrationsController {
  
  // EMIS Integration Endpoints
  static async createEMISIntegration(req: Request, res: Response) {
    try {
      const validated = emisIntegrationSchema.parse(req.body);
      
      const integration = await AngolaIntegrationsModel.createEMISIntegration({
        ...validated,
        isActive: true
      });

      // Nova integração EMIS criada

      res.status(201).json({
        message: 'Integração EMIS criada com sucesso',
        integration: {
          id: integration.id,
          companyTaxId: integration.companyTaxId,
          environment: integration.environment,
          isActive: integration.isActive,
          syncSettings: integration.syncSettings
        }
      });

    } catch (error) {
      // Erro ao criar integração EMIS
      res.status(400).json({ 
        message: 'Erro ao criar integração EMIS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async testEMISConnection(req: Request, res: Response) {
    try {
      const { integrationId } = req.params;
      
      const result = await AngolaIntegrationsModel.testEMISConnection(integrationId);

      res.json({
        message: 'Teste de conexão EMIS concluído',
        result
      });

    } catch (error) {
      // Erro ao testar conexão EMIS
      res.status(500).json({ 
        message: 'Erro ao testar conexão EMIS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async submitInvoiceToEMIS(req: Request, res: Response) {
    try {
      const validated = emisInvoiceSchema.parse(req.body);
      
      const invoice = await AngolaIntegrationsModel.submitInvoiceToEMIS(validated);

      // Fatura submetida ao EMIS

      res.status(201).json({
        message: 'Fatura submetida ao EMIS com sucesso',
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          emisReference: invoice.emisReference,
          emisStatus: invoice.emisStatus,
          total: invoice.total,
          currency: invoice.currency
        }
      });

    } catch (error) {
      // Erro ao submeter fatura ao EMIS
      res.status(400).json({ 
        message: 'Erro ao submeter fatura ao EMIS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getEMISInvoices(req: Request, res: Response) {
    try {
      const { status, emisStatus, customerId, dateFrom, dateTo } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status;
      if (emisStatus) filters.emisStatus = emisStatus;
      if (customerId) filters.customerId = customerId as string;
      if (dateFrom) filters.dateFrom = parseInt(dateFrom as string);
      if (dateTo) filters.dateTo = parseInt(dateTo as string);

      const invoices = await AngolaIntegrationsModel.getEMISInvoices(filters);

      res.json({
        message: 'Faturas EMIS obtidas com sucesso',
        invoices: invoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          customerName: inv.customerName,
          total: inv.total,
          currency: inv.currency,
          status: inv.status,
          emisStatus: inv.emisStatus,
          emisReference: inv.emisReference,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate
        })),
        total: invoices.length
      });

    } catch (error) {
      // Erro ao obter faturas EMIS
      res.status(500).json({ 
        message: 'Erro ao obter faturas EMIS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getEMISInvoice(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      
      const invoice = await AngolaIntegrationsModel.getEMISInvoice(invoiceId);
      
      if (!invoice) {
        return res.status(404).json({ message: 'Fatura não encontrada' });
      }

      res.json({
        message: 'Fatura EMIS obtida com sucesso',
        invoice
      });

    } catch (error) {
      // Erro ao obter fatura EMIS
      res.status(500).json({ 
        message: 'Erro ao obter fatura EMIS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Multicaixa Integration Endpoints
  static async createMulticaixaIntegration(req: Request, res: Response) {
    try {
      const validated = multicaixaIntegrationSchema.parse(req.body);
      
      const integration = await AngolaIntegrationsModel.createMulticaixaIntegration({
        ...validated,
        isActive: true
      });

      // Nova integração Multicaixa criada

      res.status(201).json({
        message: 'Integração Multicaixa criada com sucesso',
        integration: {
          id: integration.id,
          merchantId: integration.merchantId,
          environment: integration.environment,
          isActive: integration.isActive,
          supportedMethods: integration.supportedMethods
        }
      });

    } catch (error) {
      // Erro ao criar integração Multicaixa
      res.status(400).json({ 
        message: 'Erro ao criar integração Multicaixa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async processMulticaixaPayment(req: Request, res: Response) {
    try {
      const validated = multicaixaPaymentSchema.parse(req.body);
      
      const transaction = await AngolaIntegrationsModel.processMulticaixaPayment(validated);

      // Pagamento Multicaixa iniciado

      res.status(201).json({
        message: 'Pagamento Multicaixa iniciado com sucesso',
        transaction: {
          id: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
          timestamp: transaction.timestamp
        }
      });

    } catch (error) {
      // Erro ao processar pagamento Multicaixa
      res.status(400).json({ 
        message: 'Erro ao processar pagamento Multicaixa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Mobile Payment Endpoints
  static async getMobilePaymentProviders(req: Request, res: Response) {
    try {
      const providers = await AngolaIntegrationsModel.getMobilePaymentProviders();

      res.json({
        message: 'Provedores de pagamento móvel obtidos com sucesso',
        providers: providers.map(p => ({
          id: p.id,
          name: p.name,
          provider: p.provider,
          isActive: p.isActive,
          supportedOperations: p.supportedOperations,
          transactionLimits: p.transactionLimits
        })),
        total: providers.length
      });

    } catch (error) {
      // Erro ao obter provedores de pagamento móvel
      res.status(500).json({ 
        message: 'Erro ao obter provedores de pagamento móvel',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async processMobilePayment(req: Request, res: Response) {
    try {
      const validated = mobilePaymentSchema.parse(req.body);
      
      const transaction = await AngolaIntegrationsModel.processMobilePayment(validated);

      // Pagamento móvel iniciado

      res.status(201).json({
        message: 'Pagamento móvel iniciado com sucesso',
        transaction: {
          id: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount,
          currency: transaction.currency,
          provider: transaction.provider,
          method: transaction.method,
          status: transaction.status,
          timestamp: transaction.timestamp
        }
      });

    } catch (error) {
      // Erro ao processar pagamento móvel
      res.status(400).json({ 
        message: 'Erro ao processar pagamento móvel',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Transaction Management
  static async getPaymentTransaction(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      
      const transaction = await AngolaIntegrationsModel.getPaymentTransaction(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transação não encontrada' });
      }

      res.json({
        message: 'Transação obtida com sucesso',
        transaction
      });

    } catch (error) {
      // Erro ao obter transação
      res.status(500).json({ 
        message: 'Erro ao obter transação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getOrderPayments(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      
      const transactions = await AngolaIntegrationsModel.getPaymentTransactionsByOrder(orderId);

      res.json({
        message: 'Pagamentos da encomenda obtidos com sucesso',
        transactions: transactions.map(t => ({
          id: t.id,
          reference: t.reference,
          amount: t.amount,
          currency: t.currency,
          provider: t.provider,
          method: t.method,
          status: t.status,
          timestamp: t.timestamp,
          completedAt: t.completedAt,
          failureReason: t.failureReason
        })),
        total: transactions.length
      });

    } catch (error) {
      // Erro ao obter pagamentos da encomenda
      res.status(500).json({ 
        message: 'Erro ao obter pagamentos da encomenda',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Integration Management
  static async getEMISIntegrations(req: Request, res: Response) {
    try {
      const integrations = await AngolaIntegrationsModel.getEMISIntegrations();

      res.json({
        message: 'Integrações EMIS obtidas com sucesso',
        integrations: integrations.map(i => ({
          id: i.id,
          companyTaxId: i.companyTaxId,
          environment: i.environment,
          isActive: i.isActive,
          lastSync: i.lastSync,
          syncSettings: i.syncSettings
        })),
        total: integrations.length
      });

    } catch (error) {
      // Erro ao obter integrações EMIS
      res.status(500).json({ 
        message: 'Erro ao obter integrações EMIS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getMulticaixaIntegrations(req: Request, res: Response) {
    try {
      const integrations = await AngolaIntegrationsModel.getMulticaixaIntegrations();

      res.json({
        message: 'Integrações Multicaixa obtidas com sucesso',
        integrations: integrations.map(i => ({
          id: i.id,
          merchantId: i.merchantId,
          environment: i.environment,
          isActive: i.isActive,
          supportedMethods: i.supportedMethods,
          lastTransaction: i.lastTransaction
        })),
        total: integrations.length
      });

    } catch (error) {
      // Erro ao obter integrações Multicaixa
      res.status(500).json({ 
        message: 'Erro ao obter integrações Multicaixa',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Statistics and Health
  static async getIntegrationsStats(req: Request, res: Response) {
    try {
      const stats = AngolaIntegrationsModel.getStats();

      res.json({
        message: 'Estatísticas das integrações obtidas com sucesso',
        stats: {
          integrations: {
            emis: stats.emisIntegrations,
            multicaixa: stats.multicaixaIntegrations,
            mobileProviders: stats.mobileProviders
          },
          transactions: {
            total: stats.totalTransactions,
            pending: stats.pendingTransactions,
            completed: stats.completedTransactions
          },
          invoices: {
            total: stats.totalInvoices,
            pending: stats.pendingInvoices
          }
        }
      });

    } catch (error) {
      // Erro ao obter estatísticas das integrações
      res.status(500).json({ 
        message: 'Erro ao obter estatísticas das integrações',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}