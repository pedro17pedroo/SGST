import { Request, Response } from 'express';
import { z } from 'zod';
import { InventoryCountsModel } from './inventory-counts.model';

// Validation schemas
const createInventoryCountSchema = z.object({
  countNumber: z.string().min(1, "Número da contagem é obrigatório"),
  type: z.enum(['cycle', 'full', 'spot']),
  warehouseId: z.string().uuid("ID do armazém inválido"),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  userId: z.string().uuid("ID do utilizador inválido")
});

const updateInventoryCountSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduledDate: z.string().datetime().optional(),
  completedDate: z.string().datetime().optional(),
  notes: z.string().optional()
});

const createInventoryCountItemSchema = z.object({
  productId: z.string().uuid("ID do produto inválido"),
  expectedQuantity: z.number().int().min(0, "Quantidade esperada deve ser positiva"),
  countedQuantity: z.number().int().min(0, "Quantidade contada deve ser positiva").optional()
});

const updateInventoryCountItemSchema = z.object({
  countedQuantity: z.number().int().min(0, "Quantidade contada deve ser positiva"),
  countedByUserId: z.string().uuid("ID do utilizador inválido").optional()
});

export class InventoryCountsController {
  static async getInventoryCounts(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const counts = await InventoryCountsModel.getInventoryCounts(warehouseId);
      res.json(counts);
    } catch (error) {
      console.error('Error fetching inventory counts:', error);
      res.status(500).json({
        message: "Erro ao buscar contagens de inventário",
        error: error instanceof Error ? error.message : 'Unknown error'
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
      const validated = createInventoryCountSchema.parse(req.body);
      const countData = {
        ...validated,
        scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : null
      };
      const count = await InventoryCountsModel.createInventoryCount(countData);
      res.status(201).json(count);
    } catch (error) {
      console.error('Error creating inventory count:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar contagem de inventário",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateInventoryCountSchema.parse(req.body);
      const updateData = {
        ...validated,
        scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : undefined,
        completedDate: validated.completedDate ? new Date(validated.completedDate) : undefined
      };
      const count = await InventoryCountsModel.updateInventoryCount(id, updateData);
      res.json(count);
    } catch (error) {
      console.error('Error updating inventory count:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar contagem de inventário",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await InventoryCountsModel.deleteInventoryCount(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting inventory count:', error);
      res.status(500).json({
        message: "Erro ao eliminar contagem de inventário",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getInventoryCountItems(req: Request, res: Response) {
    try {
      const { countId } = req.params;
      const items = await InventoryCountsModel.getInventoryCountItems(countId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching inventory count items:', error);
      res.status(500).json({
        message: "Erro ao buscar itens da contagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createInventoryCountItem(req: Request, res: Response) {
    try {
      const { countId } = req.params;
      const validated = createInventoryCountItemSchema.parse(req.body);
      
      const itemData = {
        ...validated,
        countId
      };

      const item = await InventoryCountsModel.createInventoryCountItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating inventory count item:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar item da contagem",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateInventoryCountItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateInventoryCountItemSchema.parse(req.body);
      
      // Calculate variance
      const item = await InventoryCountsModel.getInventoryCountItem(id);
      if (!item) {
        return res.status(404).json({
          message: "Item da contagem não encontrado"
        });
      }

      const variance = validated.countedQuantity - item.expectedQuantity;
      const updateData = {
        ...validated,
        variance,
        countedAt: new Date()
      };

      const updatedItem = await InventoryCountsModel.updateInventoryCountItem(id, updateData);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating inventory count item:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar item da contagem",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async generateCountList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { warehouseId, categoryId, supplierIds } = req.body;
      
      const items = await InventoryCountsModel.generateCountList(id, {
        warehouseId,
        categoryId,
        supplierIds
      });

      res.json({
        message: `${items.length} itens adicionados à contagem`,
        items
      });
    } catch (error) {
      console.error('Error generating count list:', error);
      res.status(500).json({
        message: "Erro ao gerar lista de contagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async reconcileInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await InventoryCountsModel.reconcileInventoryCount(id);
      
      res.json({
        message: "Reconciliação concluída",
        reconciled: result.reconciled,
        adjustments: result.adjustments
      });
    } catch (error) {
      console.error('Error reconciling inventory count:', error);
      res.status(500).json({
        message: "Erro ao reconciliar contagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async completeInventoryCount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const count = await InventoryCountsModel.completeInventoryCount(id);
      
      res.json({
        message: "Contagem concluída com sucesso",
        count
      });
    } catch (error) {
      console.error('Error completing inventory count:', error);
      res.status(500).json({
        message: "Erro ao concluir contagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}