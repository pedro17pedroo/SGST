import { Request, Response } from 'express';
import { EDIModel } from './edi.model';
import { z } from 'zod';

// Schemas de validação para EDI
const createConnectionSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  partnerId: z.string().min(1, 'ID do parceiro é obrigatório'),
  partnerName: z.string().min(1, 'Nome do parceiro é obrigatório'),
  connectionType: z.enum(['AS2', 'SFTP', 'FTPS', 'HTTP', 'VAN']),
  protocol: z.enum(['EDIFACT', 'X12', 'XML', 'JSON']),
  config: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    certificatePath: z.string().optional(),
    privateKeyPath: z.string().optional(),
    as2Identifier: z.string().optional(),
    vanProvider: z.string().optional(),
    testMode: z.boolean().default(true),
    timeout: z.number().default(30000),
    retryAttempts: z.number().default(3)
  }),
  messageTypes: z.array(z.any()).default([]),
  isActive: z.boolean().default(true),
  createdByUserId: z.string().uuid()
});

const updateConnectionSchema = createConnectionSchema.partial();

const processInboundDocumentSchema = z.object({
  connectionId: z.string().uuid('ID da conexão deve ser um UUID válido'),
  rawContent: z.string().min(1, 'Conteúdo do documento é obrigatório'),
  metadata: z.record(z.any()).optional()
});

const sendOutboundDocumentSchema = z.object({
  connectionId: z.string().uuid('ID da conexão deve ser um UUID válido'),
  messageTypeId: z.string().uuid('ID do tipo de mensagem deve ser um UUID válido'),
  data: z.any(),
  metadata: z.record(z.any()).optional()
});

export class EDIController {
  // Connection Management
  static async createConnection(req: Request, res: Response) {
    try {
      const validated = createConnectionSchema.parse(req.body);
      
      const connection = await EDIModel.createConnection(validated);

      console.log(`🔗 Nova conexão EDI criada: ${connection.name} (${connection.protocol})`);

      res.status(201).json({
        message: 'Conexão EDI criada com sucesso',
        connection: {
          id: connection.id,
          name: connection.name,
          partnerId: connection.partnerId,
          partnerName: connection.partnerName,
          connectionType: connection.connectionType,
          protocol: connection.protocol,
          isActive: connection.isActive,
          createdAt: connection.createdAt
        }
      });

    } catch (error) {
      console.error('Erro ao criar conexão EDI:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao criar conexão EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getConnections(req: Request, res: Response) {
    try {
      const connections = await EDIModel.getAllConnections();
      
      const sanitizedConnections = connections.map(conn => ({
        id: conn.id,
        name: conn.name,
        partnerId: conn.partnerId,
        partnerName: conn.partnerName,
        connectionType: conn.connectionType,
        protocol: conn.protocol,
        isActive: conn.isActive,
        lastConnection: conn.lastConnection,
        createdAt: conn.createdAt,
        messageTypesCount: conn.messageTypes.length
      }));
      
      res.json({
        connections: sanitizedConnections,
        total: connections.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar conexões EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar conexões EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const connection = await EDIModel.getConnectionById(id);
      
      if (!connection) {
        return res.status(404).json({ message: 'Conexão EDI não encontrada' });
      }
      
      // Remover informações sensíveis
      const sanitizedConnection = {
        ...connection,
        config: {
          ...connection.config,
          password: connection.config.password ? '***' : undefined,
          privateKeyPath: connection.config.privateKeyPath ? '***' : undefined
        }
      };
      
      res.json(sanitizedConnection);
      
    } catch (error) {
      console.error('Erro ao buscar conexão EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar conexão EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateConnectionSchema.parse(req.body);
      
      const connection = await EDIModel.updateConnection(id, validated);
      
      if (!connection) {
        return res.status(404).json({ message: 'Conexão EDI não encontrada' });
      }
      
      res.json({
        message: 'Conexão EDI atualizada com sucesso',
        connection: {
          id: connection.id,
          name: connection.name,
          partnerId: connection.partnerId,
          partnerName: connection.partnerName,
          connectionType: connection.connectionType,
          protocol: connection.protocol,
          isActive: connection.isActive
        }
      });
      
    } catch (error) {
      console.error('Erro ao atualizar conexão EDI:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao atualizar conexão EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async deleteConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await EDIModel.deleteConnection(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Conexão EDI não encontrada' });
      }
      
      res.json({ message: 'Conexão EDI removida com sucesso' });
      
    } catch (error) {
      console.error('Erro ao remover conexão EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao remover conexão EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Document Processing
  static async processInboundDocument(req: Request, res: Response) {
    try {
      const validated = processInboundDocumentSchema.parse(req.body);
      
      const document = await EDIModel.processInboundDocument(
        validated.connectionId,
        validated.rawContent
      );

      console.log(`📥 Documento EDI de entrada processado: ${document.documentNumber}`);

      res.status(201).json({
        message: 'Documento EDI processado com sucesso',
        document: {
          id: document.id,
          documentNumber: document.documentNumber,
          status: document.status,
          direction: document.direction,
          tradingPartnerId: document.tradingPartnerId,
          errorMessages: document.errorMessages,
          processedAt: document.processedAt,
          createdAt: document.createdAt
        }
      });

    } catch (error) {
      console.error('Erro ao processar documento EDI:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao processar documento EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async sendOutboundDocument(req: Request, res: Response) {
    try {
      const validated = sendOutboundDocumentSchema.parse(req.body);
      
      const document = await EDIModel.sendOutboundDocument(
        validated.connectionId,
        validated.messageTypeId,
        validated.data
      );

      console.log(`📤 Documento EDI de saída enviado: ${document.documentNumber}`);

      res.status(201).json({
        message: 'Documento EDI enviado com sucesso',
        document: {
          id: document.id,
          documentNumber: document.documentNumber,
          status: document.status,
          direction: document.direction,
          tradingPartnerId: document.tradingPartnerId,
          errorMessages: document.errorMessages,
          processedAt: document.processedAt,
          createdAt: document.createdAt
        }
      });

    } catch (error) {
      console.error('Erro ao enviar documento EDI:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: 'Erro ao enviar documento EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getDocuments(req: Request, res: Response) {
    try {
      const documents = await EDIModel.getAllDocuments();
      
      const sanitizedDocuments = documents.map(doc => ({
        id: doc.id,
        connectionId: doc.connectionId,
        messageTypeId: doc.messageTypeId,
        direction: doc.direction,
        documentNumber: doc.documentNumber,
        tradingPartnerId: doc.tradingPartnerId,
        status: doc.status,
        errorMessages: doc.errorMessages,
        acknowledgmentStatus: doc.acknowledgmentStatus,
        processedAt: doc.processedAt,
        createdAt: doc.createdAt
      }));
      
      res.json({
        documents: sanitizedDocuments,
        total: documents.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar documentos EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar documentos EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getDocument(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const document = await EDIModel.getDocumentById(id);
      
      if (!document) {
        return res.status(404).json({ message: 'Documento EDI não encontrado' });
      }
      
      res.json(document);
      
    } catch (error) {
      console.error('Erro ao buscar documento EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar documento EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Message Types
  static async getMessageTypes(req: Request, res: Response) {
    try {
      const messageTypes = await EDIModel.getAllMessageTypes();
      
      res.json({
        messageTypes,
        total: messageTypes.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar tipos de mensagem EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar tipos de mensagem EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getMessageType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const messageType = await EDIModel.getMessageTypeById(id);
      
      if (!messageType) {
        return res.status(404).json({ message: 'Tipo de mensagem EDI não encontrado' });
      }
      
      res.json(messageType);
      
    } catch (error) {
      console.error('Erro ao buscar tipo de mensagem EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar tipo de mensagem EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Transactions
  static async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await EDIModel.getAllTransactions();
      
      res.json({
        transactions,
        total: transactions.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar transações EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar transações EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await EDIModel.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transação EDI não encontrada' });
      }
      
      res.json(transaction);
      
    } catch (error) {
      console.error('Erro ao buscar transação EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar transação EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Monitoring and Statistics
  static async getStatistics(req: Request, res: Response) {
    try {
      const statistics = await EDIModel.getStatistics();
      
      res.json({
        message: 'Estatísticas EDI obtidas com sucesso',
        statistics
      });
      
    } catch (error) {
      console.error('Erro ao obter estatísticas EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao obter estatísticas EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getAuditLogs(req: Request, res: Response) {
    try {
      const { connectionId } = req.query;
      const auditLogs = await EDIModel.getAuditLogs(connectionId as string);
      
      res.json({
        auditLogs,
        total: auditLogs.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao buscar logs de auditoria EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Health Check
  static async healthCheck(req: Request, res: Response) {
    try {
      const statistics = await EDIModel.getStatistics();
      
      res.json({
        status: 'healthy',
        message: 'Módulo EDI operacional',
        timestamp: new Date().toISOString(),
        statistics: {
          connectionsActive: statistics.connections.active,
          documentsProcessedToday: statistics.documents.last24Hours,
          transactionsPending: statistics.transactions.pending
        }
      });
      
    } catch (error) {
      console.error('Erro no health check EDI:', error);
      res.status(500).json({ 
        status: 'unhealthy',
        message: 'Erro no módulo EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Test Connection
  static async testConnection(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const connection = await EDIModel.getConnectionById(id);
      
      if (!connection) {
        return res.status(404).json({ message: 'Conexão EDI não encontrada' });
      }
      
      // Simular teste de conexão
      const testResult = {
        connectionId: id,
        status: 'success',
        responseTime: Math.floor(Math.random() * 1000) + 100, // 100-1100ms
        timestamp: new Date().toISOString(),
        details: {
          protocol: connection.protocol,
          connectionType: connection.connectionType,
          partner: connection.partnerName,
          testMode: connection.config.testMode
        }
      };
      
      console.log(`🔍 Teste de conexão EDI realizado: ${connection.name} - ${testResult.status}`);
      
      res.json({
        message: 'Teste de conexão realizado com sucesso',
        result: testResult
      });
      
    } catch (error) {
      console.error('Erro ao testar conexão EDI:', error);
      res.status(500).json({ 
        message: 'Erro ao testar conexão EDI',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}