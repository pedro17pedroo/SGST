import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/auth';
import { z } from 'zod';
import { PurchaseOrdersModel } from './purchase-orders.model';

// Validation schemas
const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid("ID do fornecedor inválido"),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    expectedDeliveryDate: z.string().datetime().optional()
  })).min(1, "Pelo menos um item é obrigatório"),
  notes: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  requestedByUserId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  budgetCode: z.string().optional(),
  autoApprovalRules: z.object({
    enableAutoApproval: z.boolean().default(false),
    maxAmount: z.number().min(0).optional(),
    requiresMultipleApprovals: z.boolean().default(false),
    approvalWorkflowId: z.string().optional()
  }).optional()
});

const approvalWorkflowSchema = z.object({
  name: z.string().min(1, "Nome do workflow é obrigatório"),
  description: z.string().optional(),
  rules: z.array(z.object({
    level: z.number().min(1),
    condition: z.object({
      field: z.enum(["totalAmount", "supplierId", "departmentId", "priority"]),
      operator: z.enum(["equals", "greater_than", "less_than", "in", "not_in"]),
      value: z.union([z.string(), z.number(), z.array(z.string())])
    }),
    approvers: z.array(z.object({
      userId: z.string().uuid(),
      role: z.string(),
      isRequired: z.boolean().default(true)
    })).min(1),
    autoApproveAfterHours: z.number().min(0).optional(),
    escalationRules: z.array(z.object({
      afterHours: z.number().min(1),
      escalateToUserId: z.string().uuid(),
      notificationMessage: z.string().optional()
    })).optional()
  })).min(1),
  isActive: z.boolean().default(true)
});

const approvalActionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes"]),
  comments: z.string().optional(),
  conditions: z.array(z.object({
    field: z.string(),
    value: z.string(),
    required: z.boolean().default(false)
  })).optional()
});

const automaticReplenishmentSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  settings: z.object({
    minStockLevel: z.number().min(0),
    maxStockLevel: z.number().min(0),
    reorderPoint: z.number().min(0),
    economicOrderQuantity: z.number().min(1),
    leadTimeDays: z.number().min(1),
    safetyStock: z.number().min(0),
    forecastMethod: z.enum(["moving_average", "exponential_smoothing", "linear_regression", "ai_forecast"]).default("moving_average"),
    forecastPeriodDays: z.number().min(1).default(30)
  }),
  automationRules: z.object({
    enabled: z.boolean().default(true),
    autoCreatePO: z.boolean().default(false),
    autoApprovalEnabled: z.boolean().default(false),
    maxAutoOrderValue: z.number().min(0).optional(),
    preferredSupplierId: z.string().uuid().optional(),
    restrictToBusinessDays: z.boolean().default(true),
    notifyOnOrderCreation: z.boolean().default(true)
  })
});

export class PurchaseOrdersController {
  static async getPurchaseOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        status: req.query.status as string,
        supplierId: req.query.supplierId as string,
        requestedByUserId: req.query.requestedByUserId as string,
        departmentId: req.query.departmentId as string,
        priority: req.query.priority as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      const purchaseOrders = await PurchaseOrdersModel.getPurchaseOrders(filters);
      
      res.json(purchaseOrders);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      res.status(500).json({
        message: "Erro ao buscar ordens de compra",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPurchaseOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = createPurchaseOrderSchema.parse(req.body);
      
      const purchaseOrder = await PurchaseOrdersModel.createPurchaseOrder({
        ...validated,
        items: validated.items.map(item => ({
          ...item,
          expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : undefined
        })),
        status: 'draft' as const,
        requiresApproval: false, // Will be determined by the model
        createdAt: new Date(),
        createdByUserId: req.user?.id || validated.requestedByUserId
      });
      
      // Iniciar processo de aprovação se necessário
      if (purchaseOrder.requiresApproval) {
        await PurchaseOrdersModel.initiateApprovalWorkflow(purchaseOrder.id);
      }
      
      res.status(201).json({
        message: "Ordem de compra criada com sucesso",
        purchaseOrder
      });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar ordem de compra",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async approvePurchaseOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { purchaseOrderId } = req.params;
      const validated = approvalActionSchema.parse(req.body);
      
      const result = await PurchaseOrdersModel.processApproval(purchaseOrderId, {
        ...validated,
        approvedByUserId: req.user?.id || 'system',
        approvedAt: new Date()
      });
      
      res.json({
        message: `Ordem de compra ${validated.action === 'approve' ? 'aprovada' : validated.action === 'reject' ? 'rejeitada' : 'marcada para alterações'} com sucesso`,
        approval: result
      });
    } catch (error) {
      console.error('Error processing purchase order approval:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao processar aprovação",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getApprovalWorkflows(req: AuthenticatedRequest, res: Response) {
    try {
      const workflows = await PurchaseOrdersModel.getApprovalWorkflows();
      
      res.json(workflows);
    } catch (error) {
      console.error('Error fetching approval workflows:', error);
      res.status(500).json({
        message: "Erro ao buscar workflows de aprovação",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createApprovalWorkflow(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = approvalWorkflowSchema.parse(req.body);
      
      const workflow = await PurchaseOrdersModel.createApprovalWorkflow({
        ...validated,
        createdAt: new Date(),
        createdByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Workflow de aprovação criado com sucesso",
        workflow
      });
    } catch (error) {
      console.error('Error creating approval workflow:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar workflow de aprovação",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getPendingApprovals(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id || req.query.userId as string;
      
      const pendingApprovals = await PurchaseOrdersModel.getPendingApprovals({
        userId,
        departmentId: req.query.departmentId as string,
        priority: req.query.priority as string
      });
      
      res.json({
        pendingApprovals: pendingApprovals.map(approval => ({
          id: approval.id,
          purchaseOrderId: approval.purchaseOrderId,
          totalAmount: approval.totalAmount,
          supplier: approval.supplier,
          requestedBy: approval.requestedBy,
          priority: approval.priority,
          submitDate: approval.submitDate,
          dueDate: approval.dueDate,
          level: approval.level,
          isRequired: approval.isRequired
        }))
      });
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      res.status(500).json({
        message: "Erro ao buscar aprovações pendentes",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // === FUNCIONALIDADES DE REPOSIÇÃO AUTOMÁTICA ===

  static async getAutomaticReplenishmentRules(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const productId = req.query.productId as string;
      
      const rules = await PurchaseOrdersModel.getAutomaticReplenishmentRules({
        warehouseId,
        productId
      });
      
      res.json(rules);
    } catch (error) {
      console.error('Error fetching replenishment rules:', error);
      res.status(500).json({
        message: "Erro ao buscar regras de reposição",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createAutomaticReplenishmentRule(req: AuthenticatedRequest, res: Response) {
    try {
      const validated = automaticReplenishmentSchema.parse(req.body);
      
      const rule = await PurchaseOrdersModel.createAutomaticReplenishmentRule({
        ...validated,
        createdAt: new Date(),
        createdByUserId: req.user?.id || 'system'
      });
      
      res.status(201).json({
        message: "Regra de reposição automática criada com sucesso",
        rule
      });
    } catch (error) {
      console.error('Error creating replenishment rule:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar regra de reposição",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async triggerAutomaticReplenishment(req: AuthenticatedRequest, res: Response) {
    try {
      const { warehouseId, productId } = req.params;
      const forceReorder = req.query.force === 'true';
      
      const result = await PurchaseOrdersModel.triggerAutomaticReplenishment({
        warehouseId,
        productId,
        forceReorder,
        triggeredAt: new Date(),
        triggeredByUserId: req.user?.id || 'system'
      });
      
      res.json({
        message: "Processo de reposição automática executado",
        result: {
          executed: result.executed,
          reason: result.reason,
          purchaseOrderCreated: result.purchaseOrderCreated,
          recommendedQuantity: result.recommendedQuantity,
          currentStock: result.currentStock,
          forecastDemand: result.forecastDemand
        }
      });
    } catch (error) {
      console.error('Error triggering automatic replenishment:', error);
      res.status(500).json({
        message: "Erro ao executar reposição automática",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReplenishmentRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const category = req.query.category as string;
      const priority = req.query.priority as string;
      
      const recommendations = await PurchaseOrdersModel.getReplenishmentRecommendations({
        warehouseId,
        category,
        priority
      });
      
      res.json({
        recommendations: recommendations.map(rec => ({
          productId: rec.productId,
          productName: rec.productName,
          currentStock: rec.currentStock,
          minStockLevel: rec.minStockLevel,
          recommendedQuantity: rec.recommendedQuantity,
          estimatedCost: rec.estimatedCost,
          priority: rec.priority,
          urgency: rec.urgency,
          forecastedDemand: rec.forecastedDemand,
          leadTime: rec.leadTime,
          preferredSupplier: rec.preferredSupplier
        }))
      });
    } catch (error) {
      console.error('Error fetching replenishment recommendations:', error);
      res.status(500).json({
        message: "Erro ao buscar recomendações de reposição",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async runAutomaticReplenishmentBatch(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string;
      const dryRun = req.query.dryRun === 'true';
      
      const results = await PurchaseOrdersModel.runAutomaticReplenishmentBatch({
        warehouseId,
        dryRun,
        executedAt: new Date(),
        executedByUserId: req.user?.id || 'system'
      });
      
      res.json({
        message: `Lote de reposição automática ${dryRun ? 'simulado' : 'executado'} com sucesso`,
        summary: {
          totalProductsAnalyzed: results.totalProductsAnalyzed,
          reorderRecommendations: results.reorderRecommendations,
          purchaseOrdersCreated: results.purchaseOrdersCreated,
          totalEstimatedCost: results.totalEstimatedCost,
          errors: results.errors
        }
      });
    } catch (error) {
      console.error('Error running automatic replenishment batch:', error);
      res.status(500).json({
        message: "Erro ao executar lote de reposição automática",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}