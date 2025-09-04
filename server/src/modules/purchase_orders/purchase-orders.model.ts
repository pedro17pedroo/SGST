import { db } from '../../../database/db';
import { products, suppliers } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    expectedDeliveryDate?: Date;
  }>;
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'changes_requested' | 'ordered' | 'partially_received' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requestedByUserId: string;
  departmentId?: string;
  budgetCode?: string;
  notes?: string;
  requiresApproval: boolean;
  currentApprovalLevel: number;
  autoApprovalRules?: {
    enableAutoApproval: boolean;
    maxAmount?: number;
    requiresMultipleApprovals: boolean;
    approvalWorkflowId?: string;
  };
  approvals: Array<{
    level: number;
    approverUserId: string;
    status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
    comments?: string;
    approvedAt?: Date;
  }>;
  createdAt: Date;
  createdByUserId: string;
  updatedAt?: Date;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  rules: Array<{
    level: number;
    condition: {
      field: string;
      operator: string;
      value: string | number | string[];
    };
    approvers: Array<{
      userId: string;
      role: string;
      isRequired: boolean;
    }>;
    autoApproveAfterHours?: number;
    escalationRules?: Array<{
      afterHours: number;
      escalateToUserId: string;
      notificationMessage?: string;
    }>;
  }>;
  isActive: boolean;
  createdAt: Date;
  createdByUserId: string;
}

export interface AutomaticReplenishmentRule {
  id: string;
  productId: string;
  warehouseId: string;
  settings: {
    minStockLevel: number;
    maxStockLevel: number;
    reorderPoint: number;
    economicOrderQuantity: number;
    leadTimeDays: number;
    safetyStock: number;
    forecastMethod: string;
    forecastPeriodDays: number;
  };
  automationRules: {
    enabled: boolean;
    autoCreatePO: boolean;
    autoApprovalEnabled: boolean;
    maxAutoOrderValue?: number;
    preferredSupplierId?: string;
    restrictToBusinessDays: boolean;
    notifyOnOrderCreation: boolean;
  };
  lastTriggered?: Date;
  createdAt: Date;
  createdByUserId: string;
}

export class PurchaseOrdersModel {
  // Simulação de dados para ordens de compra
  private static purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private static approvalWorkflows: Map<string, ApprovalWorkflow> = new Map();
  private static replenishmentRules: Map<string, AutomaticReplenishmentRule> = new Map();

  static async getPurchaseOrders(filters: any): Promise<PurchaseOrder[]> {
    const allOrders = Array.from(this.purchaseOrders.values());
    
    // Aplicar filtros
    return allOrders.filter(order => {
      if (filters.status && order.status !== filters.status) return false;
      if (filters.supplierId && order.supplierId !== filters.supplierId) return false;
      if (filters.requestedByUserId && order.requestedByUserId !== filters.requestedByUserId) return false;
      if (filters.departmentId && order.departmentId !== filters.departmentId) return false;
      if (filters.priority && order.priority !== filters.priority) return false;
      if (filters.startDate && order.createdAt < filters.startDate) return false;
      if (filters.endDate && order.createdAt > filters.endDate) return false;
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async createPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'totalAmount' | 'currentApprovalLevel' | 'approvals'>): Promise<PurchaseOrder> {
    const id = `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calcular valor total
    const totalAmount = data.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    
    // Determinar se precisa de aprovação
    const requiresApproval = this.determineIfRequiresApproval(data, totalAmount);
    
    const purchaseOrder: PurchaseOrder = {
      ...data,
      id,
      totalAmount,
      status: requiresApproval ? 'pending_approval' : 'approved',
      requiresApproval,
      currentApprovalLevel: 0,
      approvals: []
    };

    this.purchaseOrders.set(id, purchaseOrder);
    return purchaseOrder;
  }

  private static determineIfRequiresApproval(data: any, totalAmount: number): boolean {
    // Lógica para determinar se precisa aprovação
    if (data.autoApprovalRules?.enableAutoApproval) {
      if (data.autoApprovalRules.maxAmount && totalAmount <= data.autoApprovalRules.maxAmount) {
        return false;
      }
    }
    
    // Por padrão, ordens acima de AOA 500,000 precisam aprovação
    return totalAmount > 500000;
  }

  static async initiateApprovalWorkflow(purchaseOrderId: string): Promise<void> {
    const purchaseOrder = this.purchaseOrders.get(purchaseOrderId);
    if (!purchaseOrder) return;

    // Simular início do workflow de aprovação
    const workflow = await this.getApplicableWorkflow(purchaseOrder);
    if (workflow) {
      // Criar aprovações necessárias baseadas no workflow
      const firstLevel = workflow.rules.find(rule => rule.level === 1);
      if (firstLevel) {
        firstLevel.approvers.forEach(approver => {
          purchaseOrder.approvals.push({
            level: 1,
            approverUserId: approver.userId,
            status: 'pending',
            comments: undefined,
            approvedAt: undefined
          });
        });
      }
    }

    purchaseOrder.currentApprovalLevel = 1;
    this.purchaseOrders.set(purchaseOrderId, purchaseOrder);
  }

  private static async getApplicableWorkflow(purchaseOrder: PurchaseOrder): Promise<ApprovalWorkflow | null> {
    const workflows = Array.from(this.approvalWorkflows.values()).filter(w => w.isActive);
    
    // Encontrar workflow aplicável baseado nas regras
    for (const workflow of workflows) {
      for (const rule of workflow.rules) {
        if (this.evaluateWorkflowCondition(rule.condition, purchaseOrder)) {
          return workflow;
        }
      }
    }
    
    return null;
  }

  private static evaluateWorkflowCondition(condition: any, purchaseOrder: PurchaseOrder): boolean {
    const { field, operator, value } = condition;
    
    let fieldValue: any;
    switch (field) {
      case 'totalAmount':
        fieldValue = purchaseOrder.totalAmount;
        break;
      case 'supplierId':
        fieldValue = purchaseOrder.supplierId;
        break;
      case 'departmentId':
        fieldValue = purchaseOrder.departmentId;
        break;
      case 'priority':
        fieldValue = purchaseOrder.priority;
        break;
      default:
        return false;
    }

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'greater_than':
        return fieldValue > value;
      case 'less_than':
        return fieldValue < value;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      default:
        return false;
    }
  }

  static async processApproval(purchaseOrderId: string, approvalData: any): Promise<any> {
    const purchaseOrder = this.purchaseOrders.get(purchaseOrderId);
    if (!purchaseOrder) throw new Error('Ordem de compra não encontrada');

    // Encontrar aprovação pendente para este usuário
    const approval = purchaseOrder.approvals.find(
      a => a.approverUserId === approvalData.approvedByUserId && a.status === 'pending'
    );

    if (!approval) throw new Error('Aprovação não encontrada ou já processada');

    // Atualizar status da aprovação
    approval.status = approvalData.action;
    approval.comments = approvalData.comments;
    approval.approvedAt = approvalData.approvedAt;

    // Verificar se todas as aprovações do nível atual foram processadas
    const currentLevelApprovals = purchaseOrder.approvals.filter(a => a.level === purchaseOrder.currentApprovalLevel);
    const allCurrentLevelProcessed = currentLevelApprovals.every(a => a.status !== 'pending');

    if (allCurrentLevelProcessed) {
      // Verificar se foi aprovado ou rejeitado
      const hasRejection = currentLevelApprovals.some(a => a.status === 'rejected');
      const hasChangesRequested = currentLevelApprovals.some(a => a.status === 'changes_requested');

      if (hasRejection) {
        purchaseOrder.status = 'rejected';
      } else if (hasChangesRequested) {
        purchaseOrder.status = 'changes_requested';
      } else {
        // Todos aprovaram - verificar se há próximo nível
        const nextLevel = purchaseOrder.currentApprovalLevel + 1;
        const workflow = await this.getApplicableWorkflow(purchaseOrder);
        const nextLevelRule = workflow?.rules.find(rule => rule.level === nextLevel);

        if (nextLevelRule) {
          // Iniciar próximo nível
          nextLevelRule.approvers.forEach(approver => {
            purchaseOrder.approvals.push({
              level: nextLevel,
              approverUserId: approver.userId,
              status: 'pending',
              comments: undefined,
              approvedAt: undefined
            });
          });
          purchaseOrder.currentApprovalLevel = nextLevel;
        } else {
          // Totalmente aprovado
          purchaseOrder.status = 'approved';
        }
      }
    }

    this.purchaseOrders.set(purchaseOrderId, purchaseOrder);
    return approval;
  }

  static async getApprovalWorkflows(): Promise<ApprovalWorkflow[]> {
    return Array.from(this.approvalWorkflows.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async createApprovalWorkflow(data: Omit<ApprovalWorkflow, 'id'>): Promise<ApprovalWorkflow> {
    const id = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow: ApprovalWorkflow = {
      ...data,
      id
    };

    this.approvalWorkflows.set(id, workflow);
    return workflow;
  }

  static async getPendingApprovals(filters: any): Promise<any[]> {
    const allOrders = Array.from(this.purchaseOrders.values());
    const pendingApprovals: any[] = [];

    allOrders.forEach(order => {
      if (order.status === 'pending_approval') {
        const userApprovals = order.approvals.filter(
          a => a.approverUserId === filters.userId && a.status === 'pending'
        );
        
        userApprovals.forEach(approval => {
          pendingApprovals.push({
            id: `approval_${order.id}_${approval.level}`,
            purchaseOrderId: order.id,
            totalAmount: order.totalAmount,
            supplier: { id: order.supplierId, name: 'Fornecedor Simulado' },
            requestedBy: { id: order.requestedByUserId, name: 'Utilizador Simulado' },
            priority: order.priority,
            submitDate: order.createdAt,
            dueDate: new Date(order.createdAt.getTime() + (24 * 60 * 60 * 1000)), // 24h depois
            level: approval.level,
            isRequired: true
          });
        });
      }
    });

    return pendingApprovals.sort((a, b) => b.submitDate.getTime() - a.submitDate.getTime());
  }

  // === FUNCIONALIDADES DE REPOSIÇÃO AUTOMÁTICA ===

  static async getAutomaticReplenishmentRules(filters: any): Promise<AutomaticReplenishmentRule[]> {
    const allRules = Array.from(this.replenishmentRules.values());
    
    return allRules.filter(rule => {
      if (filters.warehouseId && rule.warehouseId !== filters.warehouseId) return false;
      if (filters.productId && rule.productId !== filters.productId) return false;
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async createAutomaticReplenishmentRule(data: Omit<AutomaticReplenishmentRule, 'id'>): Promise<AutomaticReplenishmentRule> {
    const id = `replenishment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const rule: AutomaticReplenishmentRule = {
      ...data,
      id
    };

    this.replenishmentRules.set(id, rule);
    return rule;
  }

  static async triggerAutomaticReplenishment(params: any): Promise<any> {
    const rule = Array.from(this.replenishmentRules.values()).find(
      r => r.productId === params.productId && r.warehouseId === params.warehouseId
    );

    if (!rule) {
      return {
        executed: false,
        reason: 'Regra de reposição não encontrada',
        purchaseOrderCreated: false
      };
    }

    if (!rule.automationRules.enabled) {
      return {
        executed: false,
        reason: 'Reposição automática desabilitada',
        purchaseOrderCreated: false
      };
    }

    // Simular verificação de stock atual
    const currentStock = Math.floor(Math.random() * 100);
    const forecastDemand = Math.floor(Math.random() * 50) + 10;
    
    if (currentStock > rule.settings.reorderPoint && !params.forceReorder) {
      return {
        executed: false,
        reason: 'Stock ainda acima do ponto de reposição',
        purchaseOrderCreated: false,
        currentStock,
        forecastDemand
      };
    }

    // Calcular quantidade recomendada
    const recommendedQuantity = Math.max(
      rule.settings.economicOrderQuantity,
      rule.settings.maxStockLevel - currentStock + forecastDemand
    );

    // Criar ordem de compra automática se habilitado
    let purchaseOrderCreated = false;
    if (rule.automationRules.autoCreatePO) {
      try {
        const autoOrder = await this.createPurchaseOrder({
          supplierId: rule.automationRules.preferredSupplierId || 'default-supplier',
          items: [{
            productId: params.productId,
            quantity: recommendedQuantity,
            unitPrice: 100 // Preço simulado
          }],
          notes: 'Ordem criada automaticamente pelo sistema de reposição',
          priority: 'normal',
          status: 'draft',
          requiresApproval: true,
          requestedByUserId: 'system',
          autoApprovalRules: {
            enableAutoApproval: rule.automationRules.autoApprovalEnabled,
            maxAmount: rule.automationRules.maxAutoOrderValue,
            requiresMultipleApprovals: false
          },
          createdAt: new Date(),
          createdByUserId: 'system'
        });
        
        purchaseOrderCreated = true;
      } catch (error) {
        console.error('Error creating automatic purchase order:', error);
      }
    }

    // Atualizar última execução
    rule.lastTriggered = new Date();
    this.replenishmentRules.set(rule.id, rule);

    return {
      executed: true,
      reason: 'Reposição executada com sucesso',
      purchaseOrderCreated,
      recommendedQuantity,
      currentStock,
      forecastDemand
    };
  }

  static async getReplenishmentRecommendations(filters: any): Promise<any[]> {
    // Simular recomendações de reposição
    const mockRecommendations = [
      {
        productId: 'prod_1',
        productName: 'Produto A',
        currentStock: 15,
        minStockLevel: 20,
        recommendedQuantity: 50,
        estimatedCost: 5000,
        priority: 'high',
        urgency: 'urgent',
        forecastedDemand: 30,
        leadTime: 7,
        preferredSupplier: { id: 'sup_1', name: 'Fornecedor A' }
      },
      {
        productId: 'prod_2',
        productName: 'Produto B',
        currentStock: 5,
        minStockLevel: 10,
        recommendedQuantity: 25,
        estimatedCost: 2500,
        priority: 'medium',
        urgency: 'normal',
        forecastedDemand: 15,
        leadTime: 5,
        preferredSupplier: { id: 'sup_2', name: 'Fornecedor B' }
      }
    ];

    return mockRecommendations.filter(rec => {
      if (filters.warehouseId) return true; // Simular que todas pertencem ao armazém
      if (filters.category) return true; // Simular filtro por categoria
      if (filters.priority && rec.priority !== filters.priority) return false;
      return true;
    });
  }

  static async runAutomaticReplenishmentBatch(params: any): Promise<any> {
    const allRules = Array.from(this.replenishmentRules.values());
    let totalProductsAnalyzed = 0;
    let reorderRecommendations = 0;
    let purchaseOrdersCreated = 0;
    let totalEstimatedCost = 0;
    const errors: string[] = [];

    for (const rule of allRules) {
      if (params.warehouseId && rule.warehouseId !== params.warehouseId) continue;
      
      totalProductsAnalyzed++;
      
      try {
        const result = await this.triggerAutomaticReplenishment({
          warehouseId: rule.warehouseId,
          productId: rule.productId,
          forceReorder: false
        });

        if (result.executed) {
          reorderRecommendations++;
          totalEstimatedCost += result.recommendedQuantity * 100; // Preço simulado
          
          if (result.purchaseOrderCreated && !params.dryRun) {
            purchaseOrdersCreated++;
          }
        }
      } catch (error) {
        errors.push(`Erro no produto ${rule.productId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    return {
      totalProductsAnalyzed,
      reorderRecommendations,
      purchaseOrdersCreated,
      totalEstimatedCost,
      errors
    };
  }
}