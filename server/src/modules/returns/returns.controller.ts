import { Request, Response } from 'express';
import { ReturnsModel } from './returns.model';
import { BaseController } from '../base/base.controller';
import { z } from 'zod';

// Schema de validação para criação de devolução
const createReturnSchema = z.object({
  // Aceita originalOrderId do frontend
  originalOrderId: z.string().optional(),
  // Mantém orderNumber para compatibilidade
  orderNumber: z.string().optional(),
  type: z.enum(["customer", "supplier", "internal"]),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  supplierId: z.string().optional(),
  reason: z.string().min(1, "Motivo da devolução é obrigatório"),
  condition: z.enum(["new", "damaged", "used", "defective"]),
  refundMethod: z.enum(["cash", "credit", "store_credit", "exchange"]),
  items: z.array(z.object({
    productId: z.string().min(1, "ID do produto é obrigatório"),
    productName: z.string().min(1, "Nome do produto é obrigatório"),
    quantity: z.number().int().min(1, "Quantidade deve ser maior que 0"),
    unitPrice: z.number().min(0, "Preço unitário deve ser maior ou igual a 0"),
    condition: z.enum(["new", "used", "damaged", "defective"]).default("used")
  })).optional().default([]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  notes: z.string().max(500).optional(),
  inspectionNotes: z.string().max(500).optional()
}).superRefine((data, ctx) => {
  // Validações condicionais para devolução de cliente
  if (data.type === "customer") {
    if (!data.customerId || data.customerId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ID do cliente é obrigatório para devoluções de cliente",
        path: ["customerId"]
      });
    }
    if (!data.customerName || data.customerName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nome do cliente é obrigatório para devoluções de cliente",
        path: ["customerName"]
      });
    }
  }
  
  // Validações condicionais para devolução a fornecedor
  if (data.type === "supplier") {
    if (!data.supplierId || data.supplierId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fornecedor é obrigatório para devoluções a fornecedor",
        path: ["supplierId"]
      });
    }
  }
});

// Schema de validação para atualização de devolução
const updateReturnSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "processing", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
  inspectionNotes: z.string().optional(),
  refundAmount: z.number().min(0).optional()
});

export class ReturnsController extends BaseController {
  /**
   * Gera um número único de devolução
   */
  static async generateReturnNumber(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const returnNumber = await ReturnsModel.generateReturnNumber();
      
      return controller.sendSuccess(res, { returnNumber }, 'Número de devolução gerado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao gerar número de devolução');
    }
  }
  
  /**
   * Valida se um número de devolução é único
   */
  static async validateReturnNumber(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const { returnNumber } = req.params;
      const isUnique = await ReturnsModel.validateReturnNumberUniqueness(returnNumber);
      
      return controller.sendSuccess(res, { isUnique, returnNumber });
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao validar número de devolução');
    }
  }
  static async getReturns(req: Request, res: Response) {
    console.log('🔍 DEBUG: ReturnsController.getReturns chamado');
    const controller = new ReturnsController();
    try {
      const { page, limit } = controller.validatePagination(req);
      const { search, status, priority } = req.query;
      
      const returns = await ReturnsModel.getReturns({
        page,
        limit,
        search: search as string,
        status: status as string,
        priority: priority as string
      });
      
      const total = await ReturnsModel.getReturnsCount({
        search: search as string,
        status: status as string,
        priority: priority as string
      });
      
      return controller.sendSuccessWithPagination(res, returns, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar devoluções');
    }
  }

  static async getReturn(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const { id } = req.params;
      const returnData = await ReturnsModel.getReturn(id);
      
      controller.ensureResourceExists(returnData, 'Devolução');
      
      return controller.sendSuccess(res, returnData);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar devolução');
    }
  }

  static async createReturn(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const validatedData = controller.validateBody(req, createReturnSchema);
      const userId = (req as any).user?.id;
      
      // Mapeia originalOrderId para orderNumber se necessário
      const orderNumber = validatedData.originalOrderId || validatedData.orderNumber || '';
      
      const newReturn = await ReturnsModel.createReturn({
          ...validatedData,
          orderNumber, // Garante que orderNumber sempre tenha um valor
          items: (validatedData.items || []).map(item => ({
            ...item,
            condition: item.condition || 'new' // Define valor padrão se undefined
          })),
          priority: validatedData.priority || 'medium', // Define valor padrão se undefined
          userId
        });
      
      return controller.sendSuccess(res, newReturn, 'Devolução criada com sucesso', 201);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao criar devolução');
    }
  }

  static async updateReturn(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const { id } = req.params;
      const validatedData = controller.validateBody(req, updateReturnSchema);
      
      const updatedReturn = await ReturnsModel.updateReturn(id, validatedData);
      
      controller.ensureResourceExists(updatedReturn, 'Devolução');
      
      return controller.sendSuccess(res, updatedReturn, 'Devolução atualizada com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao atualizar devolução');
    }
  }

  static async approveReturn(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      const updatedReturn = await ReturnsModel.updateReturn(id, {
        status: 'approved',
        notes
      });
      
      controller.ensureResourceExists(updatedReturn, 'Devolução');
      
      return controller.sendSuccess(res, updatedReturn, 'Devolução aprovada com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao aprovar devolução');
    }
  }

  static async processReturn(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const { id } = req.params;
      const { refundAmount, inspectionNotes } = req.body;
      
      const updatedReturn = await ReturnsModel.updateReturn(id, {
        status: 'processing',
        refundAmount,
        inspectionNotes
      });
      
      controller.ensureResourceExists(updatedReturn, 'Devolução');
      
      return controller.sendSuccess(res, updatedReturn, 'Devolução processada com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao processar devolução');
    }
  }

  static async deleteReturn(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const { id } = req.params;
      
      const deleted = await ReturnsModel.deleteReturn(id);
      
      controller.ensureResourceExists(deleted, 'Devolução');
      
      return controller.sendSuccess(res, null, 'Devolução removida com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao remover devolução');
    }
  }

  // Estatísticas de devoluções
  static async getReturnsStats(req: Request, res: Response) {
    const controller = new ReturnsController();
    try {
      const stats = await ReturnsModel.getReturnsStats();
      
      return controller.sendSuccess(res, stats);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar estatísticas de devoluções');
    }
  }
}