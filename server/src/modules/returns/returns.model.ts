import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../users/user.model';

// Interface para item de devolução
export interface ReturnItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  condition: 'new' | 'used' | 'damaged' | 'defective';
}

// Interface para devolução
export interface Return {
  id: string;
  returnNumber: string;
  orderNumber: string;
  type?: 'customer' | 'supplier' | 'internal';
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  supplierId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  condition?: 'new' | 'damaged' | 'used' | 'defective';
  refundMethod?: 'cash' | 'credit' | 'store_credit' | 'exchange';
  items: ReturnItem[];
  totalAmount: number;
  refundAmount?: number;
  notes?: string;
  inspectionNotes?: string;
  userId?: string;
  user?: {
    id: string;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
}

// Interface para filtros de busca
export interface ReturnFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
}

// Interface para dados de criação de devolução
export interface CreateReturnData {
  orderNumber: string;
  type?: 'customer' | 'supplier' | 'internal';
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  supplierId?: string;
  reason: string;
  condition?: 'new' | 'damaged' | 'used' | 'defective';
  refundMethod?: 'cash' | 'credit' | 'store_credit' | 'exchange';
  items: Omit<ReturnItem, 'id'>[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  inspectionNotes?: string;
  userId?: string;
}

// Interface para dados de atualização de devolução
export interface UpdateReturnData {
  status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  inspectionNotes?: string;
  refundAmount?: number;
}

// Interface para estatísticas de devoluções
export interface ReturnStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processing: number;
  completed: number;
  cancelled: number;
  totalRefundAmount: number;
  averageProcessingTime: number;
}

// Simulação de banco de dados em memória
let returns: Return[] = [
  {
    id: '1',
    returnNumber: 'RET-2024-001',
    orderNumber: 'ORD-2024-001',
    customerId: 'cust-001',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '+244 923 456 789',
    status: 'pending',
    priority: 'medium',
    reason: 'Produto defeituoso',
    items: [
      {
        id: 'item-1',
        productId: 'prod-001',
        productName: 'Smartphone Samsung A54',
        quantity: 1,
        unitPrice: 180000,
        condition: 'defective'
      }
    ],
    totalAmount: 180000,
    notes: 'Cliente relatou que o produto não liga',
    userId: 'admin',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: '2',
    returnNumber: 'RET-2024-002',
    orderNumber: 'ORD-2024-002',
    customerId: 'cust-002',
    customerName: 'Maria Santos',
    customerEmail: 'maria@email.com',
    customerPhone: '+244 924 567 890',
    status: 'approved',
    priority: 'high',
    reason: 'Produto errado enviado',
    items: [
      {
        id: 'item-2',
        productId: 'prod-002',
        productName: 'Monitor LG 24"',
        quantity: 1,
        unitPrice: 95000,
        condition: 'new'
      }
    ],
    totalAmount: 95000,
    refundAmount: 95000,
    notes: 'Cliente pediu monitor de 27" mas recebeu de 24"',
    inspectionNotes: 'Produto em perfeitas condições',
    userId: 'carlos.silva',
    createdAt: new Date('2024-01-14T14:30:00Z'),
    updatedAt: new Date('2024-01-15T09:15:00Z'),
    approvedAt: new Date('2024-01-15T09:15:00Z')
  },
  {
    id: '3',
    returnNumber: 'RET-2024-003',
    orderNumber: 'ORD-2024-003',
    customerId: 'cust-003',
    customerName: 'Pedro Costa',
    customerEmail: 'pedro@email.com',
    status: 'processing',
    priority: 'urgent',
    reason: 'Produto danificado durante transporte',
    items: [
      {
        id: 'item-3',
        productId: 'prod-003',
        productName: 'Laptop Dell Inspiron',
        quantity: 1,
        unitPrice: 450000,
        condition: 'damaged'
      }
    ],
    totalAmount: 450000,
    refundAmount: 400000,
    notes: 'Embalagem chegou danificada',
    inspectionNotes: 'Tela com rachaduras, mas funcional',
    userId: 'maria.santos',
    createdAt: new Date('2024-01-13T16:45:00Z'),
    updatedAt: new Date('2024-01-15T11:30:00Z'),
    approvedAt: new Date('2024-01-14T10:00:00Z'),
    processedAt: new Date('2024-01-15T11:30:00Z')
  },
  {
    id: '4',
    returnNumber: 'RET-2025-006',
    orderNumber: 'ORD-2025-006',
    customerId: 'cust-004',
    customerName: 'Ana Ferreira',
    customerEmail: 'ana@email.com',
    customerPhone: '+244 925 678 901',
    status: 'completed',
    priority: 'medium',
    reason: 'quality_issue',
    items: [
      {
        id: 'item-4',
        productId: 'prod-004',
        productName: 'Tablet Samsung Galaxy',
        quantity: 1,
        unitPrice: 250000,
        condition: 'defective'
      }
    ],
    totalAmount: 250000,
    refundAmount: 250000,
    notes: 'Produto com defeito de fábrica',
    inspectionNotes: 'Defeito confirmado, reembolso total aprovado',
    userId: 'admin',
    createdAt: new Date('2024-01-12T08:00:00Z'),
    updatedAt: new Date('2024-01-16T14:00:00Z'),
    approvedAt: new Date('2024-01-13T09:00:00Z'),
    processedAt: new Date('2024-01-15T16:00:00Z'),
    completedAt: new Date('2024-01-16T14:00:00Z')
  }
];

let nextReturnNumber = 5;

export class ReturnsModel {
  /**
   * Gera um número único de devolução
   * Formato: RET-YYYY-XXX (ex: RET-2025-001)
   */
  static async generateReturnNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const returnNumber = `RET-${currentYear}-${String(nextReturnNumber).padStart(3, '0')}`;
      
      // Verifica se o número já existe
      const existingReturn = returns.find(ret => ret.returnNumber === returnNumber);
      
      if (!existingReturn) {
        nextReturnNumber++;
        return returnNumber;
      }
      
      // Se já existe, incrementa e tenta novamente
      nextReturnNumber++;
      attempts++;
    }
    
    // Se não conseguir gerar após muitas tentativas, usa timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `RET-${currentYear}-${timestamp}`;
  }
  
  /**
   * Valida se um número de devolução é único
   */
  static async validateReturnNumberUniqueness(returnNumber: string): Promise<boolean> {
    const existingReturn = returns.find(ret => ret.returnNumber === returnNumber);
    return !existingReturn;
  }
  /**
   * Busca devoluções com filtros e paginação
   */
  static async getReturns(filters: ReturnFilters): Promise<Return[]> {
    let filteredReturns = [...returns];

    // Filtro por busca (nome do cliente, número da ordem, número da devolução)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredReturns = filteredReturns.filter(ret => 
        (ret.customerName?.toLowerCase().includes(searchLower) ?? false) ||
        ret.orderNumber.toLowerCase().includes(searchLower) ||
        ret.returnNumber.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por status
    if (filters.status) {
      filteredReturns = filteredReturns.filter(ret => ret.status === filters.status);
    }

    // Filtro por prioridade
    if (filters.priority) {
      filteredReturns = filteredReturns.filter(ret => ret.priority === filters.priority);
    }

    // Ordenação por data de criação (mais recentes primeiro)
    filteredReturns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Adicionar informações do usuário para cada devolução
    const returnsWithUserInfo = await Promise.all(
      filteredReturns.map(async (returnItem) => {
        if (returnItem.userId) {
          try {
            const user = await UserModel.getById(returnItem.userId);
            return {
              ...returnItem,
              user: user ? {
                id: user.id,
                username: user.username
              } : undefined
            };
          } catch (error) {
            console.error(`Erro ao buscar usuário ${returnItem.userId}:`, error);
            return returnItem;
          }
        }
        return returnItem;
      })
    );

    // Paginação
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    
    return returnsWithUserInfo.slice(startIndex, endIndex);
  }

  /**
   * Conta o total de devoluções com filtros
   */
  static async getReturnsCount(filters: Omit<ReturnFilters, 'page' | 'limit'>): Promise<number> {
    let filteredReturns = [...returns];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredReturns = filteredReturns.filter(ret => 
        (ret.customerName?.toLowerCase().includes(searchLower) ?? false) ||
        ret.orderNumber.toLowerCase().includes(searchLower) ||
        ret.returnNumber.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filteredReturns = filteredReturns.filter(ret => ret.status === filters.status);
    }

    if (filters.priority) {
      filteredReturns = filteredReturns.filter(ret => ret.priority === filters.priority);
    }

    return filteredReturns.length;
  }

  /**
   * Busca uma devolução por ID
   */
  static async getReturn(id: string): Promise<Return | null> {
    const returnData = returns.find(ret => ret.id === id);
    return returnData || null;
  }

  /**
   * Cria uma nova devolução
   */
  static async createReturn(data: CreateReturnData): Promise<Return> {
    const returnNumber = await this.generateReturnNumber();

    // Calcula o valor total dos itens
    const totalAmount = data.items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);

    // Adiciona IDs aos itens
    const itemsWithIds: ReturnItem[] = data.items.map(item => ({
      ...item,
      id: uuidv4()
    }));

    const newReturn: Return = {
      id: uuidv4(),
      returnNumber,
      orderNumber: data.orderNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      status: 'pending',
      priority: data.priority,
      reason: data.reason,
      items: itemsWithIds,
      totalAmount,
      notes: data.notes,
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    returns.push(newReturn);
    return newReturn;
  }

  /**
   * Atualiza uma devolução
   */
  static async updateReturn(id: string, data: UpdateReturnData): Promise<Return | null> {
    const returnIndex = returns.findIndex(ret => ret.id === id);
    
    if (returnIndex === -1) {
      return null;
    }

    const currentReturn = returns[returnIndex];
    const now = new Date();

    // Atualiza campos específicos baseados no status
    const updatedReturn: Return = {
      ...currentReturn,
      ...data,
      updatedAt: now
    };

    // Define timestamps específicos baseados no status
    if (data.status === 'approved' && !currentReturn.approvedAt) {
      updatedReturn.approvedAt = now;
    } else if (data.status === 'processing' && !currentReturn.processedAt) {
      updatedReturn.processedAt = now;
    } else if (data.status === 'completed' && !currentReturn.completedAt) {
      updatedReturn.completedAt = now;
    }

    returns[returnIndex] = updatedReturn;
    return updatedReturn;
  }

  /**
   * Remove uma devolução
   */
  static async deleteReturn(id: string): Promise<boolean> {
    const returnIndex = returns.findIndex(ret => ret.id === id);
    
    if (returnIndex === -1) {
      return false;
    }

    returns.splice(returnIndex, 1);
    return true;
  }

  /**
   * Busca estatísticas de devoluções
   */
  static async getReturnsStats(): Promise<ReturnStats> {
    const total = returns.length;
    const pending = returns.filter(ret => ret.status === 'pending').length;
    const approved = returns.filter(ret => ret.status === 'approved').length;
    const rejected = returns.filter(ret => ret.status === 'rejected').length;
    const processing = returns.filter(ret => ret.status === 'processing').length;
    const completed = returns.filter(ret => ret.status === 'completed').length;
    const cancelled = returns.filter(ret => ret.status === 'cancelled').length;

    const totalRefundAmount = returns
      .filter(ret => ret.refundAmount)
      .reduce((total, ret) => total + (ret.refundAmount || 0), 0);

    // Calcula tempo médio de processamento (em horas)
    const processedReturns = returns.filter(ret => ret.processedAt && ret.createdAt);
    const averageProcessingTime = processedReturns.length > 0 
      ? processedReturns.reduce((total, ret) => {
          const processingTime = ret.processedAt!.getTime() - ret.createdAt.getTime();
          return total + (processingTime / (1000 * 60 * 60)); // Converte para horas
        }, 0) / processedReturns.length
      : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      processing,
      completed,
      cancelled,
      totalRefundAmount,
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100 // Arredonda para 2 casas decimais
    };
  }
}