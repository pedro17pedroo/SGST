import { Request, Response } from 'express';
import { z } from 'zod';
import { InventoryCountsModel } from './inventory-counts.model';

// Schemas de validação específicos para o controller
const createInventoryCountSchema = z.object({
  countNumber: z.string().min(1, "Número da contagem é obrigatório").max(50, "Número da contagem não pode exceder 50 caracteres"),
  type: z.enum(['cycle', 'full', 'spot'], {
    errorMap: () => ({ message: 'Tipo deve ser: cycle, full ou spot' })
  }),
  warehouseId: z.string().uuid('ID do armazém deve ser um UUID válido'),
  scheduledDate: z.string().datetime('Data agendada deve estar no formato ISO').optional(),
  notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional(),
  userId: z.string().uuid('ID do utilizador deve ser um UUID válido')
});

const updateInventoryCountSchema = z.object({
  countNumber: z.string().min(1, "Número da contagem é obrigatório").max(50, "Número da contagem não pode exceder 50 caracteres").optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Status deve ser: pending, in_progress, completed ou cancelled' })
  }).optional(),
  scheduledDate: z.string().datetime('Data agendada deve estar no formato ISO').optional(),
  completedDate: z.string().datetime('Data de conclusão deve estar no formato ISO').optional(),
  notes: z.string().max(1000, 'Notas não podem exceder 1000 caracteres').optional()
});

const createInventoryCountItemSchema = z.object({
  productId: z.string().uuid('ID do produto deve ser um UUID válido'),
  expectedQuantity: z.number().int().min(0, 'Quantidade esperada deve ser um número inteiro não negativo'),
  countedQuantity: z.number().int().min(0, 'Quantidade contada deve ser um número inteiro não negativo').optional(),
  notes: z.string().max(500, 'Notas do item não podem exceder 500 caracteres').optional()
});

const updateInventoryCountItemSchema = z.object({
  countedQuantity: z.number().int().min(0, 'Quantidade contada deve ser um número inteiro não negativo'),
  countedByUserId: z.string().uuid('ID do utilizador deve ser um UUID válido').optional(),
  notes: z.string().max(500, 'Notas do item não podem exceder 500 caracteres').optional(),
  reconciled: z.boolean().optional()
});

const generateCountListSchema = z.object({
  warehouseId: z.string().uuid('ID do armazém deve ser um UUID válido'),
  categoryId: z.string().uuid('ID da categoria deve ser um UUID válido').optional(),
  supplierIds: z.array(z.string().uuid('ID do fornecedor deve ser um UUID válido')).optional()
});

export class InventoryCountsController {
  static async getInventoryCounts(req: Request, res: Response) {
    console.log('🔍 === CONTROLLER INVENTORY COUNTS CHAMADO ===');
    console.log('🔍 Method:', req.method);
    console.log('🔍 URL:', req.originalUrl);
    console.log('🔍 Query params:', req.query);
    
    try {
      const { warehouseId } = req.query;
      
      // Validar warehouseId se fornecido
      if (warehouseId && typeof warehouseId === 'string') {
        const warehouseValidation = z.string().uuid('ID do armazém deve ser um UUID válido');
        const validationResult = warehouseValidation.safeParse(warehouseId);
        if (!validationResult.success) {
          return res.status(400).json({ 
            error: 'Parâmetros inválidos', 
            details: validationResult.error.errors 
          });
        }
      }
      
      const counts = await InventoryCountsModel.getInventoryCounts(warehouseId as string);
      res.json({ success: true, data: counts });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const count = await InventoryCountsModel.getInventoryCount(id);
      
      if (!count) {
        return res.status(404).json({
          message: "Contagem de inventário não encontrada"
        });
      }

      res.json(count);
    } catch (error) {
      console.error('Error fetching inventory count:', error);
      res.status(500).json({
        message: "Erro ao buscar contagem de inventário",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createInventoryCount(req: Request, res: Response) {
    try {
      const validation = createInventoryCountSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Dados de entrada inválidos",
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const countData = {
        ...validation.data,
        scheduledDate: validation.data.scheduledDate ? new Date(validation.data.scheduledDate) : null
      };
      const count = await InventoryCountsModel.createInventoryCount(countData);
      res.status(201).json({
        success: true,
        message: 'Contagem de inventário criada com sucesso',
        data: count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao criar contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar ID
      const idValidation = z.string().uuid('ID deve ser um UUID válido').safeParse(id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: idValidation.error.errors
        });
      }
      
      const validation = updateInventoryCountSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Dados de entrada inválidos",
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const updateData = {
        ...validation.data,
        scheduledDate: validation.data.scheduledDate ? new Date(validation.data.scheduledDate) : undefined,
        completedDate: validation.data.completedDate ? new Date(validation.data.completedDate) : undefined
      };
      const count = await InventoryCountsModel.updateInventoryCount(id, updateData);
      if (!count) {
        return res.status(404).json({ 
          success: false,
          error: "Contagem de inventário não encontrada" 
        });
      }

      res.json({
        success: true,
        message: 'Contagem de inventário atualizada com sucesso',
        data: count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao atualizar contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async deleteInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar ID
      const idValidation = z.string().uuid('ID deve ser um UUID válido').safeParse(id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID inválido',
          details: idValidation.error.errors
        });
      }
      
      const deleted = await InventoryCountsModel.deleteInventoryCount(id);
      if (!deleted) {
        return res.status(404).json({ 
          success: false,
          error: "Contagem de inventário não encontrada" 
        });
      }

      res.json({ 
        success: true,
        message: "Contagem de inventário deletada com sucesso" 
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao deletar contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getInventoryCountItems(req: Request, res: Response) {
    try {
      const { countId } = req.params;
      
      // Validar countId
      const idValidation = z.string().uuid('ID da contagem deve ser um UUID válido').safeParse(countId);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID da contagem inválido',
          details: idValidation.error.errors
        });
      }
      
      const items = await InventoryCountsModel.getInventoryCountItems(countId);
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao buscar itens da contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async createInventoryCountItem(req: Request, res: Response) {
    try {
      const { countId } = req.params;
      
      // Validar countId
      const idValidation = z.string().uuid('ID da contagem deve ser um UUID válido').safeParse(countId);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID da contagem inválido',
          details: idValidation.error.errors
        });
      }
      
      const validation = createInventoryCountItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Dados de entrada inválidos",
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const itemData = {
        ...validation.data,
        countId
      };

      const item = await InventoryCountsModel.createInventoryCountItem(itemData);
      res.status(201).json({
        success: true,
        message: 'Item de contagem criado com sucesso',
        data: item
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao criar item da contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateInventoryCountItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar id
      const idValidation = z.string().uuid('ID do item deve ser um UUID válido').safeParse(id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID do item inválido',
          details: idValidation.error.errors
        });
      }
      
      const validation = updateInventoryCountItemSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Dados de entrada inválidos",
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Calculate variance
      const item = await InventoryCountsModel.getInventoryCountItem(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: "Item da contagem não encontrado"
        });
      }

      const variance = validation.data.countedQuantity - item.expectedQuantity;
      const updateData = {
        ...validation.data,
        variance,
        countedAt: new Date()
      };

      const updatedItem = await InventoryCountsModel.updateInventoryCountItem(id, updateData);
      res.json({
        success: true,
        message: 'Item de contagem atualizado com sucesso',
        data: updatedItem
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao atualizar item da contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async generateCountList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar id
      const idValidation = z.string().uuid('ID da contagem deve ser um UUID válido').safeParse(id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID da contagem inválido',
          details: idValidation.error.errors
        });
      }
      
      const validation = generateCountListSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: "Dados de entrada inválidos",
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const items = await InventoryCountsModel.generateCountList(id, validation.data);
      res.json({
        success: true,
        message: 'Lista de contagem gerada com sucesso',
        data: items
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao gerar lista de contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async reconcileInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar id
      const idValidation = z.string().uuid('ID da contagem deve ser um UUID válido').safeParse(id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID da contagem inválido',
          details: idValidation.error.errors
        });
      }
      
      const result = await InventoryCountsModel.reconcileInventoryCount(id);
      res.json({
        success: true,
        message: 'Contagem de inventário reconciliada com sucesso',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao reconciliar contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async completeInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Validar id
      const idValidation = z.string().uuid('ID da contagem deve ser um UUID válido').safeParse(id);
      if (!idValidation.success) {
        return res.status(400).json({
          success: false,
          error: 'ID da contagem inválido',
          details: idValidation.error.errors
        });
      }
      
      const count = await InventoryCountsModel.completeInventoryCount(id);
      res.json({
        success: true,
        message: "Contagem concluída com sucesso",
        data: count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao concluir contagem de inventário",
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}