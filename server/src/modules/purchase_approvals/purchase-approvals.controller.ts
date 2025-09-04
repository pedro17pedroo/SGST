import { Request, Response } from 'express';
import { PurchaseApprovalsModel } from './purchase-approvals.model.js';
import { z } from 'zod';

const approvalActionSchema = z.object({
  comments: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional()
});

const approvalChainSchema = z.object({
  name: z.string().min(1, "Nome da cadeia de aprovação é obrigatório"),
  description: z.string().optional(),
  active: z.boolean().default(true),
  approvers: z.array(z.object({
    userId: z.string(),
    level: z.number().int().min(1),
    required: z.boolean().default(true),
    canDelegate: z.boolean().default(false)
  })),
  conditions: z.object({
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
    categories: z.array(z.string()).optional(),
    suppliers: z.array(z.string()).optional(),
    warehouses: z.array(z.string()).optional()
  }).optional()
});

const approvalLimitSchema = z.object({
  userId: z.string().min(1, "ID do utilizador é obrigatório"),
  role: z.string().optional(),
  maxAmount: z.number().min(0),
  currency: z.string().default("AOA"),
  category: z.string().optional(),
  active: z.boolean().default(true)
});

export class PurchaseApprovalsController {
  static async submitForApproval(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const validated = approvalActionSchema.parse(req.body);
      
      const approval = await PurchaseApprovalsModel.submitForApproval(orderId, {
        ...validated,
        submittedByUserId: (req as any).user?.id || 'anonymous-user',
        submittedAt: new Date()
      });
      
      res.status(201).json({
        message: "Ordem de compra submetida para aprovação",
        approval
      });
    } catch (error) {
      console.error('Error submitting for approval:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao submeter para aprovação",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async approvePurchaseOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const validated = approvalActionSchema.parse(req.body);
      
      const approval = await PurchaseApprovalsModel.approvePurchaseOrder(orderId, {
        ...validated,
        approvedByUserId: (req as any).user?.id || 'anonymous-user',
        approvedAt: new Date()
      });
      
      if (!approval) {
        return res.status(404).json({ message: "Ordem de compra não encontrada" });
      }
      
      res.json({
        message: "Ordem de compra aprovada com sucesso",
        approval
      });
    } catch (error) {
      console.error('Error approving purchase order:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao aprovar ordem de compra",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async rejectPurchaseOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const validated = approvalActionSchema.parse(req.body);
      
      if (!validated.comments) {
        return res.status(400).json({
          message: "Comentários são obrigatórios para rejeição"
        });
      }
      
      const approval = await PurchaseApprovalsModel.rejectPurchaseOrder(orderId, {
        comments: validated.comments || '',
        rejectedByUserId: (req as any).user?.id || 'anonymous-user',
        rejectedAt: new Date()
      });
      
      if (!approval) {
        return res.status(404).json({ message: "Ordem de compra não encontrada" });
      }
      
      res.json({
        message: "Ordem de compra rejeitada",
        approval
      });
    } catch (error) {
      console.error('Error rejecting purchase order:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao rejeitar ordem de compra",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async requestRevision(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const validated = approvalActionSchema.parse(req.body);
      
      if (!validated.comments) {
        return res.status(400).json({
          message: "Comentários são obrigatórios para solicitar revisão"
        });
      }
      
      const approval = await PurchaseApprovalsModel.requestRevision(orderId, {
        comments: validated.comments || '',
        requestedByUserId: 'current-user-id', // TODO: Get from auth context
        requestedAt: new Date()
      });
      
      if (!approval) {
        return res.status(404).json({ message: "Ordem de compra não encontrada" });
      }
      
      res.json({
        message: "Revisão solicitada com sucesso",
        approval
      });
    } catch (error) {
      console.error('Error requesting revision:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao solicitar revisão",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getApprovalChains(req: Request, res: Response) {
    try {
      const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      
      const chains = await PurchaseApprovalsModel.getApprovalChains({ active });
      
      res.json(chains);
    } catch (error) {
      console.error('Error getting approval chains:', error);
      res.status(500).json({
        message: "Erro ao buscar cadeias de aprovação",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createApprovalChain(req: Request, res: Response) {
    try {
      const validated = approvalChainSchema.parse(req.body);
      
      const chain = await PurchaseApprovalsModel.createApprovalChain({
        name: validated.name || '',
        description: validated.description,
        active: validated.active ?? true,
        approvers: validated.approvers?.map(approver => ({
          userId: approver.userId || '',
          level: approver.level || 1,
          required: approver.required ?? true,
          canDelegate: approver.canDelegate ?? false
        })) || [],
        conditions: validated.conditions,
        createdAt: new Date(),
        createdByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      res.status(201).json({
        message: "Cadeia de aprovação criada com sucesso",
        chain
      });
    } catch (error) {
      console.error('Error creating approval chain:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar cadeia de aprovação",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateApprovalChain(req: Request, res: Response) {
    try {
      const { chainId } = req.params;
      const validated = approvalChainSchema.partial().parse(req.body);
      
      // Garantir que os campos obrigatórios estejam presentes
      const updateData = {
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: 'current-user-id', // TODO: Get from auth context
        // Garantir que approvers tenha os campos obrigatórios
        approvers: validated.approvers?.map(approver => ({
          userId: approver.userId || '',
          level: approver.level || 1,
          required: approver.required ?? true,
          canDelegate: approver.canDelegate ?? false
        }))
      };
      
      const chain = await PurchaseApprovalsModel.updateApprovalChain(chainId, updateData);
      
      if (!chain) {
        return res.status(404).json({ message: "Cadeia de aprovação não encontrada" });
      }
      
      res.json({
        message: "Cadeia de aprovação atualizada com sucesso",
        chain
      });
    } catch (error) {
      console.error('Error updating approval chain:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar cadeia de aprovação",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteApprovalChain(req: Request, res: Response) {
    try {
      const { chainId } = req.params;
      
      const result = await PurchaseApprovalsModel.deleteApprovalChain(chainId);
      
      if (!result.success) {
        return res.status(404).json({ message: "Cadeia de aprovação não encontrada" });
      }
      
      res.json({ message: "Cadeia de aprovação eliminada com sucesso" });
    } catch (error) {
      console.error('Error deleting approval chain:', error);
      res.status(500).json({
        message: "Erro ao eliminar cadeia de aprovação",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPendingApprovals(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const priority = req.query.priority as string;
      const department = req.query.department as string;
      
      const approvals = await PurchaseApprovalsModel.getPendingApprovals({
        userId,
        priority,
        department
      });
      
      res.json(approvals);
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      res.status(500).json({
        message: "Erro ao buscar aprovações pendentes",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getUserPendingApprovals(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      const approvals = await PurchaseApprovalsModel.getUserPendingApprovals(userId);
      
      res.json(approvals);
    } catch (error) {
      console.error('Error getting user pending approvals:', error);
      res.status(500).json({
        message: "Erro ao buscar aprovações pendentes do utilizador",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getApprovalHistory(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      
      const history = await PurchaseApprovalsModel.getApprovalHistory(orderId);
      
      res.json(history);
    } catch (error) {
      console.error('Error getting approval history:', error);
      res.status(500).json({
        message: "Erro ao buscar histórico de aprovações",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAllApprovalHistory(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const history = await PurchaseApprovalsModel.getAllApprovalHistory({
        page,
        limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      });
      
      res.json(history);
    } catch (error) {
      console.error('Error getting all approval history:', error);
      res.status(500).json({
        message: "Erro ao buscar histórico de aprovações",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getApprovalLimits(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const role = req.query.role as string;
      const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      
      const limits = await PurchaseApprovalsModel.getApprovalLimits({
        userId,
        role,
        active
      });
      
      res.json(limits);
    } catch (error) {
      console.error('Error getting approval limits:', error);
      res.status(500).json({
        message: "Erro ao buscar limites de aprovação",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createApprovalLimit(req: Request, res: Response) {
    try {
      const validated = approvalLimitSchema.parse(req.body);
      
      const limit = await PurchaseApprovalsModel.createApprovalLimit({
        userId: validated.userId || '',
        role: validated.role,
        maxAmount: validated.maxAmount || 0,
        currency: validated.currency || 'AOA',
        category: validated.category,
        active: validated.active ?? true,
        createdAt: new Date(),
        createdByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      res.status(201).json({
        message: "Limite de aprovação criado com sucesso",
        limit
      });
    } catch (error) {
      console.error('Error creating approval limit:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar limite de aprovação",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateApprovalLimit(req: Request, res: Response) {
    try {
      const { limitId } = req.params;
      const validated = approvalLimitSchema.partial().parse(req.body);
      
      const limit = await PurchaseApprovalsModel.updateApprovalLimit(limitId, {
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      if (!limit) {
        return res.status(404).json({ message: "Limite de aprovação não encontrado" });
      }
      
      res.json({
        message: "Limite de aprovação atualizado com sucesso",
        limit
      });
    } catch (error) {
      console.error('Error updating approval limit:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar limite de aprovação",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteApprovalLimit(req: Request, res: Response) {
    try {
      const { limitId } = req.params;
      
      const result = await PurchaseApprovalsModel.deleteApprovalLimit(limitId);
      
      if (!result.success) {
        return res.status(404).json({ message: "Limite de aprovação não encontrado" });
      }
      
      res.json({ message: "Limite de aprovação eliminado com sucesso" });
    } catch (error) {
      console.error('Error deleting approval limit:', error);
      res.status(500).json({
        message: "Erro ao eliminar limite de aprovação",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getApprovalNotifications(req: Request, res: Response) {
    try {
      const userId = 'current-user-id'; // TODO: Get from auth context
      const unreadOnly = req.query.unreadOnly === 'true';
      
      const notifications = await PurchaseApprovalsModel.getApprovalNotifications(userId, { unreadOnly });
      
      res.json(notifications);
    } catch (error) {
      console.error('Error getting approval notifications:', error);
      res.status(500).json({
        message: "Erro ao buscar notificações de aprovação",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async markNotificationRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = 'current-user-id'; // TODO: Get from auth context
      
      const notification = await PurchaseApprovalsModel.markNotificationRead(notificationId, userId);
      
      if (!notification) {
        return res.status(404).json({ message: "Notificação não encontrada" });
      }
      
      res.json({
        message: "Notificação marcada como lida",
        notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        message: "Erro ao marcar notificação como lida",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}