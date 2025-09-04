import { nanoid } from 'nanoid';

// Tipos para EDI (Electronic Data Interchange)
export interface EDIConnection {
  id: string;
  name: string;
  partnerId: string; // Trading Partner ID
  partnerName: string;
  connectionType: 'AS2' | 'SFTP' | 'FTPS' | 'HTTP' | 'VAN'; // Value Added Network
  protocol: 'EDIFACT' | 'X12' | 'XML' | 'JSON';
  config: {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    certificatePath?: string;
    privateKeyPath?: string;
    as2Identifier?: string;
    vanProvider?: string;
    testMode: boolean;
    timeout: number;
    retryAttempts: number;
  };
  messageTypes: EDIMessageType[];
  isActive: boolean;
  lastConnection?: Date;
  createdAt: Date;
  createdByUserId: string;
}

export interface EDIMessageType {
  id: string;
  code: string; // Ex: 850 (Purchase Order), 856 (ASN), 810 (Invoice)
  name: string;
  description: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  version: string;
  mappingRules: EDIMappingRule[];
  validationRules: EDIValidationRule[];
  isActive: boolean;
}

export interface EDIMappingRule {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string; // JavaScript code for transformation
  defaultValue?: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'boolean';
}

export interface EDIValidationRule {
  id: string;
  field: string;
  rule: 'required' | 'format' | 'range' | 'custom';
  value?: string;
  errorMessage: string;
}

export interface EDIDocument {
  id: string;
  connectionId: string;
  messageTypeId: string;
  direction: 'inbound' | 'outbound';
  documentNumber: string;
  tradingPartnerId: string;
  status: 'pending' | 'processing' | 'processed' | 'failed' | 'acknowledged';
  rawContent: string;
  parsedContent?: any;
  errorMessages?: string[];
  acknowledgmentStatus?: 'pending' | 'sent' | 'received' | 'failed';
  processedAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface EDITransaction {
  id: string;
  documentId: string;
  transactionType: 'purchase_order' | 'asn' | 'invoice' | 'payment' | 'inventory_update';
  entityId: string; // ID do pedido, ASN, fatura, etc.
  entityType: 'order' | 'shipment' | 'invoice' | 'payment';
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  processedAt?: Date;
  createdAt: Date;
}

export interface EDIAuditLog {
  id: string;
  connectionId: string;
  documentId?: string;
  action: 'send' | 'receive' | 'process' | 'acknowledge' | 'error';
  details: string;
  userId?: string;
  timestamp: Date;
  ipAddress?: string;
}

export class EDIModel {
  // Storage simulado para EDI
  private static connections: Map<string, EDIConnection> = new Map();
  private static messageTypes: Map<string, EDIMessageType> = new Map();
  private static documents: Map<string, EDIDocument> = new Map();
  private static transactions: Map<string, EDITransaction> = new Map();
  private static auditLogs: Map<string, EDIAuditLog> = new Map();

  static {
    this.initializeDefaultMessageTypes();
  }

  static async initializeDefaultMessageTypes(): Promise<void> {
    const defaultMessageTypes: Omit<EDIMessageType, 'id'>[] = [
      {
        code: '850',
        name: 'Purchase Order',
        description: 'Pedido de Compra - Enviado para fornecedores',
        direction: 'outbound',
        version: '4010',
        mappingRules: [
          {
            id: nanoid(),
            sourceField: 'order.id',
            targetField: 'BEG02',
            required: true,
            dataType: 'string'
          },
          {
            id: nanoid(),
            sourceField: 'order.total',
            targetField: 'AMT02',
            required: true,
            dataType: 'number'
          }
        ],
        validationRules: [
          {
            id: nanoid(),
            field: 'BEG02',
            rule: 'required',
            errorMessage: 'Número do pedido é obrigatório'
          }
        ],
        isActive: true
      },
      {
        code: '856',
        name: 'Ship Notice/Manifest (ASN)',
        description: 'Aviso de Envio - Recebido de fornecedores',
        direction: 'inbound',
        version: '4010',
        mappingRules: [
          {
            id: nanoid(),
            sourceField: 'BSN02',
            targetField: 'shipment.number',
            required: true,
            dataType: 'string'
          },
          {
            id: nanoid(),
            sourceField: 'DTM02',
            targetField: 'shipment.expectedDate',
            required: true,
            dataType: 'date'
          }
        ],
        validationRules: [
          {
            id: nanoid(),
            field: 'BSN02',
            rule: 'required',
            errorMessage: 'Número do envio é obrigatório'
          }
        ],
        isActive: true
      },
      {
        code: '810',
        name: 'Invoice',
        description: 'Fatura - Recebida de fornecedores',
        direction: 'inbound',
        version: '4010',
        mappingRules: [
          {
            id: nanoid(),
            sourceField: 'BIG02',
            targetField: 'invoice.number',
            required: true,
            dataType: 'string'
          },
          {
            id: nanoid(),
            sourceField: 'BIG04',
            targetField: 'invoice.total',
            required: true,
            dataType: 'number'
          }
        ],
        validationRules: [
          {
            id: nanoid(),
            field: 'BIG02',
            rule: 'required',
            errorMessage: 'Número da fatura é obrigatório'
          }
        ],
        isActive: true
      },
      {
        code: '997',
        name: 'Functional Acknowledgment',
        description: 'Confirmação Funcional - Bidirectional',
        direction: 'bidirectional',
        version: '4010',
        mappingRules: [
          {
            id: nanoid(),
            sourceField: 'AK102',
            targetField: 'acknowledgment.controlNumber',
            required: true,
            dataType: 'string'
          }
        ],
        validationRules: [
          {
            id: nanoid(),
            field: 'AK102',
            rule: 'required',
            errorMessage: 'Número de controle é obrigatório'
          }
        ],
        isActive: true
      }
    ];

    defaultMessageTypes.forEach(messageType => {
      const id = nanoid();
      this.messageTypes.set(id, { ...messageType, id });
    });

    console.log(`📄 ${defaultMessageTypes.length} tipos de mensagem EDI inicializados`);
  }

  // EDI Connection Management
  static async createConnection(data: Omit<EDIConnection, 'id' | 'createdAt'>): Promise<EDIConnection> {
    const connection: EDIConnection = {
      ...data,
      id: nanoid(),
      createdAt: new Date()
    };

    this.connections.set(connection.id, connection);
    
    await this.logAudit({
      connectionId: connection.id,
      action: 'send',
      details: `Conexão EDI criada: ${connection.name}`,
      userId: data.createdByUserId
    });
    
    console.log(`🔗 Conexão EDI criada: ${connection.name} (${connection.protocol})`);
    
    return connection;
  }

  static async getAllConnections(): Promise<EDIConnection[]> {
    return Array.from(this.connections.values());
  }

  static async getConnectionById(id: string): Promise<EDIConnection | null> {
    return this.connections.get(id) || null;
  }

  static async updateConnection(id: string, data: Partial<EDIConnection>): Promise<EDIConnection | null> {
    const connection = this.connections.get(id);
    if (!connection) return null;

    const updatedConnection = { ...connection, ...data };
    this.connections.set(id, updatedConnection);
    
    await this.logAudit({
      connectionId: id,
      action: 'send',
      details: `Conexão EDI atualizada: ${connection.name}`,
      userId: data.createdByUserId
    });
    
    return updatedConnection;
  }

  static async deleteConnection(id: string): Promise<boolean> {
    const connection = this.connections.get(id);
    if (!connection) return false;

    this.connections.delete(id);
    
    await this.logAudit({
      connectionId: id,
      action: 'send',
      details: `Conexão EDI removida: ${connection.name}`
    });
    
    return true;
  }

  // EDI Document Processing
  static async processInboundDocument(connectionId: string, rawContent: string): Promise<EDIDocument> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error('Conexão EDI não encontrada');
    }

    const document: EDIDocument = {
      id: nanoid(),
      connectionId,
      messageTypeId: '', // Será determinado pelo parser
      direction: 'inbound',
      documentNumber: `EDI-IN-${Date.now()}`,
      tradingPartnerId: connection.partnerId,
      status: 'pending',
      rawContent,
      createdAt: new Date()
    };

    try {
      // Simular parsing do documento EDI
      const parsedContent = await this.parseEDIDocument(rawContent, connection.protocol);
      document.parsedContent = parsedContent;
      document.messageTypeId = this.detectMessageType(parsedContent);
      document.status = 'processing';
      
      // Processar transação baseada no tipo de mensagem
      await this.processTransaction(document);
      
      document.status = 'processed';
      document.processedAt = new Date();
      
    } catch (error) {
      document.status = 'failed';
      document.errorMessages = [error instanceof Error ? error.message : 'Erro desconhecido'];
    }

    this.documents.set(document.id, document);
    
    await this.logAudit({
      connectionId,
      documentId: document.id,
      action: 'receive',
      details: `Documento EDI processado: ${document.documentNumber} - Status: ${document.status}`
    });
    
    return document;
  }

  static async sendOutboundDocument(connectionId: string, messageTypeId: string, data: any): Promise<EDIDocument> {
    const connection = this.connections.get(connectionId);
    const messageType = this.messageTypes.get(messageTypeId);
    
    if (!connection || !messageType) {
      throw new Error('Conexão ou tipo de mensagem não encontrado');
    }

    const document: EDIDocument = {
      id: nanoid(),
      connectionId,
      messageTypeId,
      direction: 'outbound',
      documentNumber: `EDI-OUT-${Date.now()}`,
      tradingPartnerId: connection.partnerId,
      status: 'pending',
      rawContent: '',
      parsedContent: data,
      createdAt: new Date()
    };

    try {
      // Gerar documento EDI baseado no tipo de mensagem e dados
      document.rawContent = await this.generateEDIDocument(data, messageType, connection.protocol);
      
      // Simular envio
      await this.transmitDocument(document, connection);
      
      document.status = 'processed';
      document.processedAt = new Date();
      
    } catch (error) {
      document.status = 'failed';
      document.errorMessages = [error instanceof Error ? error.message : 'Erro desconhecido'];
    }

    this.documents.set(document.id, document);
    
    await this.logAudit({
      connectionId,
      documentId: document.id,
      action: 'send',
      details: `Documento EDI enviado: ${document.documentNumber} - Status: ${document.status}`
    });
    
    return document;
  }

  // Helper Methods
  private static async parseEDIDocument(rawContent: string, protocol: string): Promise<any> {
    // Simulação de parsing EDI
    // Em implementação real, usaria bibliotecas como node-x12 ou edifact-parser
    
    if (protocol === 'X12') {
      return {
        interchangeControlNumber: 'ICN' + Math.random().toString(36).substr(2, 9),
        functionalGroupControlNumber: 'GCN' + Math.random().toString(36).substr(2, 9),
        transactionSetControlNumber: 'TSN' + Math.random().toString(36).substr(2, 9),
        segments: rawContent.split('~').filter(s => s.trim())
      };
    }
    
    if (protocol === 'EDIFACT') {
      return {
        interchangeReference: 'IR' + Math.random().toString(36).substr(2, 9),
        messageReference: 'MR' + Math.random().toString(36).substr(2, 9),
        segments: rawContent.split("'").filter(s => s.trim())
      };
    }
    
    return { rawContent };
  }

  private static detectMessageType(parsedContent: any): string {
    // Simulação de detecção de tipo de mensagem
    // Em implementação real, analisaria os segmentos para determinar o tipo
    const messageTypes = Array.from(this.messageTypes.values());
    return messageTypes[0]?.id || '';
  }

  private static async generateEDIDocument(data: any, messageType: EDIMessageType, protocol: string): Promise<string> {
    // Simulação de geração de documento EDI
    // Em implementação real, usaria templates e mapeamentos
    
    if (protocol === 'X12') {
      return `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${new Date().toISOString().slice(0, 6)}*${new Date().toTimeString().slice(0, 4)}*U*00401*000000001*0*T*>~
GS*PO*SENDER*RECEIVER*${new Date().toISOString().slice(0, 8)}*${new Date().toTimeString().slice(0, 4)}*1*X*004010~
ST*${messageType.code}*0001~
BEG*00*SA*${data.orderNumber || 'ORDER001'}***${new Date().toISOString().slice(0, 10)}~
SE*4*0001~
GE*1*1~
IEA*1*000000001~`;
    }
    
    if (protocol === 'EDIFACT') {
      return `UNA:+.? 'UNB+UNOC:3+SENDER:ZZZ+RECEIVER:ZZZ+${new Date().toISOString().slice(0, 8)}:${new Date().toTimeString().slice(0, 4)}+1'UNH+1+ORDERS:D:03B:UN:EAN008'BGM+220+${data.orderNumber || 'ORDER001'}+9'DTM+137:${new Date().toISOString().slice(0, 8)}:102'UNT+5+1'UNZ+1+1'`;
    }
    
    return JSON.stringify(data, null, 2);
  }

  private static async transmitDocument(document: EDIDocument, connection: EDIConnection): Promise<void> {
    // Simulação de transmissão
    // Em implementação real, usaria protocolos AS2, SFTP, etc.
    
    console.log(`📤 Transmitindo documento EDI via ${connection.connectionType}:`);
    console.log(`   - Parceiro: ${connection.partnerName}`);
    console.log(`   - Documento: ${document.documentNumber}`);
    console.log(`   - Protocolo: ${connection.protocol}`);
    
    // Simular delay de transmissão
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private static async processTransaction(document: EDIDocument): Promise<void> {
    const messageType = this.messageTypes.get(document.messageTypeId);
    if (!messageType) return;

    let transactionType: EDITransaction['transactionType'];
    let entityType: EDITransaction['entityType'];
    
    switch (messageType.code) {
      case '850':
        transactionType = 'purchase_order';
        entityType = 'order';
        break;
      case '856':
        transactionType = 'asn';
        entityType = 'shipment';
        break;
      case '810':
        transactionType = 'invoice';
        entityType = 'invoice';
        break;
      default:
        return;
    }

    const transaction: EDITransaction = {
      id: nanoid(),
      documentId: document.id,
      transactionType,
      entityId: `${transactionType.toUpperCase()}-${Date.now()}`,
      entityType,
      status: 'pending',
      createdAt: new Date()
    };

    try {
      // Simular processamento da transação
      await this.processBusinessTransaction(transaction, document.parsedContent);
      
      transaction.status = 'completed';
      transaction.processedAt = new Date();
      
    } catch (error) {
      transaction.status = 'failed';
      transaction.errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    }

    this.transactions.set(transaction.id, transaction);
  }

  private static async processBusinessTransaction(transaction: EDITransaction, data: any): Promise<void> {
    // Simulação de processamento de transação de negócio
    // Em implementação real, integraria com outros módulos do sistema
    
    console.log(`💼 Processando transação de negócio:`);
    console.log(`   - Tipo: ${transaction.transactionType}`);
    console.log(`   - ID da Entidade: ${transaction.entityId}`);
    
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Audit and Monitoring
  private static async logAudit(data: Omit<EDIAuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: EDIAuditLog = {
      ...data,
      id: nanoid(),
      timestamp: new Date()
    };

    this.auditLogs.set(auditLog.id, auditLog);
  }

  static async getAuditLogs(connectionId?: string): Promise<EDIAuditLog[]> {
    const logs = Array.from(this.auditLogs.values());
    
    if (connectionId) {
      return logs.filter(log => log.connectionId === connectionId);
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Statistics and Monitoring
  static async getStatistics(): Promise<any> {
    const documents = Array.from(this.documents.values());
    const transactions = Array.from(this.transactions.values());
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      connections: {
        total: this.connections.size,
        active: Array.from(this.connections.values()).filter(c => c.isActive).length
      },
      documents: {
        total: documents.length,
        last24Hours: documents.filter(d => d.createdAt >= last24Hours).length,
        last7Days: documents.filter(d => d.createdAt >= last7Days).length,
        byStatus: {
          processed: documents.filter(d => d.status === 'processed').length,
          failed: documents.filter(d => d.status === 'failed').length,
          pending: documents.filter(d => d.status === 'pending').length
        },
        byDirection: {
          inbound: documents.filter(d => d.direction === 'inbound').length,
          outbound: documents.filter(d => d.direction === 'outbound').length
        }
      },
      transactions: {
        total: transactions.length,
        completed: transactions.filter(t => t.status === 'completed').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        pending: transactions.filter(t => t.status === 'pending').length
      },
      messageTypes: {
        total: this.messageTypes.size,
        active: Array.from(this.messageTypes.values()).filter(mt => mt.isActive).length
      }
    };
  }

  // Message Type Management
  static async getAllMessageTypes(): Promise<EDIMessageType[]> {
    return Array.from(this.messageTypes.values());
  }

  static async getMessageTypeById(id: string): Promise<EDIMessageType | null> {
    return this.messageTypes.get(id) || null;
  }

  // Document Management
  static async getAllDocuments(): Promise<EDIDocument[]> {
    return Array.from(this.documents.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getDocumentById(id: string): Promise<EDIDocument | null> {
    return this.documents.get(id) || null;
  }

  // Transaction Management
  static async getAllTransactions(): Promise<EDITransaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getTransactionById(id: string): Promise<EDITransaction | null> {
    return this.transactions.get(id) || null;
  }
}