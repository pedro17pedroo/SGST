import { Request, Response } from 'express';
import { PutawayManagementModel } from './putaway.model';
import { z } from 'zod';

export class PutawayManagementController {
  // Putaway Rules
  static async createPutawayRule(req: Request, res: Response) {
    try {
      const schema = z.object({
        name: z.string().min(1),
        priority: z.number().int().min(1).default(1),
        warehouseId: z.string().uuid(),
        productCriteria: z.any().optional(),
        locationCriteria: z.any().optional(),
        strategy: z.enum(['fixed', 'random', 'closest_empty', 'abc_velocity', 'fifo', 'lifo']),
        crossDockEligible: z.boolean().default(false),
        crossDockCriteria: z.any().optional(),
        maxCapacityUtilization: z.string().optional(),
        isActive: z.boolean().default(true),
        effectiveFrom: z.string().datetime().optional(),
        effectiveTo: z.string().datetime().optional(),
        userId: z.string().uuid().optional()
      });

      const parsed = schema.parse(req.body);
      const data = {
        ...parsed,
        effectiveFrom: parsed.effectiveFrom ? new Date(parsed.effectiveFrom) : undefined,
        effectiveTo: parsed.effectiveTo ? new Date(parsed.effectiveTo) : undefined
      };
      
      const rule = await PutawayManagementModel.createPutawayRule(data);
      
      res.status(201).json({
        message: "Regra de putaway criada com sucesso",
        rule
      });
    } catch (error) {
      console.error('Error creating putaway rule:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar regra de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPutawayRules(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const rules = await PutawayManagementModel.getAllPutawayRules(warehouseId as string);
      res.json(rules);
    } catch (error) {
      console.error('Error fetching putaway rules:', error);
      res.status(500).json({ 
        message: "Erro ao buscar regras de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPutawayRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await PutawayManagementModel.getPutawayRuleById(id);
      
      if (!rule) {
        return res.status(404).json({ message: "Regra de putaway não encontrada" });
      }
      
      res.json(rule);
    } catch (error) {
      console.error('Error fetching putaway rule:', error);
      res.status(500).json({ 
        message: "Erro ao buscar regra de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updatePutawayRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await PutawayManagementModel.updatePutawayRule(id, req.body);
      
      res.json({
        message: "Regra de putaway atualizada com sucesso",
        rule
      });
    } catch (error) {
      console.error('Error updating putaway rule:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar regra de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deletePutawayRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PutawayManagementModel.deletePutawayRule(id);
      
      res.json({
        message: "Regra de putaway eliminada com sucesso"
      });
    } catch (error) {
      console.error('Error deleting putaway rule:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar regra de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Putaway Tasks
  static async createPutawayTask(req: Request, res: Response) {
    try {
      const schema = z.object({
        receiptItemId: z.string().uuid(),
        productId: z.string().uuid(),
        warehouseId: z.string().uuid(),
        quantity: z.number().int().min(1),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        assignedTo: z.string().uuid().optional(),
        notes: z.string().optional(),
        userId: z.string().uuid().optional()
      });

      const data = schema.parse(req.body);
      
      // Get optimal location suggestion
      const suggestion = await PutawayManagementModel.suggestOptimalLocation(
        data.productId, 
        data.warehouseId, 
        data.quantity
      );

      const taskData = {
        ...data,
        taskNumber: `PUT-${Date.now()}`,
        suggestedLocationId: suggestion.locationId,
        ruleApplied: suggestion.ruleApplied,
        estimatedTime: suggestion.estimatedTime,
        travelDistance: suggestion.travelDistance?.toString()
      };
      
      const task = await PutawayManagementModel.createPutawayTask(taskData);
      
      res.status(201).json({
        message: "Tarefa de putaway criada com sucesso",
        task,
        suggestion
      });
    } catch (error) {
      console.error('Error creating putaway task:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar tarefa de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPutawayTasks(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const tasks = await PutawayManagementModel.getAllPutawayTasks(warehouseId as string);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching putaway tasks:', error);
      res.status(500).json({ 
        message: "Erro ao buscar tarefas de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPutawayTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await PutawayManagementModel.getPutawayTaskById(id);
      
      if (!task) {
        return res.status(404).json({ message: "Tarefa de putaway não encontrada" });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Error fetching putaway task:', error);
      res.status(500).json({ 
        message: "Erro ao buscar tarefa de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async assignPutawayTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        assignedTo: z.string().uuid()
      });

      const { assignedTo } = schema.parse(req.body);
      const task = await PutawayManagementModel.assignPutawayTask(id, assignedTo);
      
      res.json({
        message: "Tarefa de putaway atribuída com sucesso",
        task
      });
    } catch (error) {
      console.error('Error assigning putaway task:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atribuir tarefa de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updatePutawayTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
        actualLocationId: z.string().uuid().optional()
      });

      const { status, actualLocationId } = schema.parse(req.body);
      const task = await PutawayManagementModel.updatePutawayTaskStatus(id, status, actualLocationId);
      
      res.json({
        message: "Status da tarefa de putaway atualizado com sucesso",
        task
      });
    } catch (error) {
      console.error('Error updating putaway task status:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar status da tarefa de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // SSCC Pallets
  static async createSsccPallet(req: Request, res: Response) {
    try {
      const schema = z.object({
        palletType: z.enum(['euro', 'standard', 'custom']),
        warehouseId: z.string().uuid(),
        locationId: z.string().uuid().optional(),
        maxWeight: z.string().default('1000.000'),
        maxHeight: z.string().default('200.00'),
        shipmentId: z.string().uuid().optional(),
        userId: z.string().uuid().optional()
      });

      const data = schema.parse(req.body);
      const ssccCode = await PutawayManagementModel.generateSsccCode();
      
      const pallet = await PutawayManagementModel.createSsccPallet({
        ...data,
        ssccCode
      });
      
      res.status(201).json({
        message: "Palete SSCC criado com sucesso",
        pallet
      });
    } catch (error) {
      console.error('Error creating SSCC pallet:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar palete SSCC", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSsccPallets(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const pallets = await PutawayManagementModel.getAllSsccPallets(warehouseId as string);
      res.json(pallets);
    } catch (error) {
      console.error('Error fetching SSCC pallets:', error);
      res.status(500).json({ 
        message: "Erro ao buscar paletes SSCC", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSsccPallet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pallet = await PutawayManagementModel.getSsccPalletById(id);
      
      if (!pallet) {
        return res.status(404).json({ message: "Palete SSCC não encontrado" });
      }
      
      res.json(pallet);
    } catch (error) {
      console.error('Error fetching SSCC pallet:', error);
      res.status(500).json({ 
        message: "Erro ao buscar palete SSCC", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async addItemToPallet(req: Request, res: Response) {
    try {
      const { palletId } = req.params;
      const schema = z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
        lotNumber: z.string().optional(),
        expiryDate: z.string().datetime().optional(),
        serialNumbers: z.array(z.string()).optional(),
        weight: z.string().optional(),
        dimensions: z.any().optional(),
        position: z.any().optional(),
        addedBy: z.string().uuid()
      });

      const parsed = schema.parse(req.body);
      const data = {
        ...parsed,
        palletId,
        expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined
      };
      
      const item = await PutawayManagementModel.addItemToPallet(palletId, data);
      
      res.status(201).json({
        message: "Item adicionado ao palete com sucesso",
        item
      });
    } catch (error) {
      console.error('Error adding item to pallet:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao adicionar item ao palete", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPalletItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const items = await PutawayManagementModel.getPalletItems(id);
      res.json(items);
    } catch (error) {
      console.error('Error fetching pallet items:', error);
      res.status(500).json({ 
        message: "Erro ao buscar itens do palete", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updatePalletStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        status: z.enum(['building', 'completed', 'shipped', 'received'])
      });

      const { status } = schema.parse(req.body);
      const pallet = await PutawayManagementModel.updatePalletStatus(id, status);
      
      res.json({
        message: "Status do palete atualizado com sucesso",
        pallet
      });
    } catch (error) {
      console.error('Error updating pallet status:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar status do palete", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async suggestOptimalLocation(req: Request, res: Response) {
    try {
      const schema = z.object({
        productId: z.string().uuid(),
        warehouseId: z.string().uuid(),
        quantity: z.number().int().min(1)
      });

      const { productId, warehouseId, quantity } = schema.parse(req.body);
      const suggestion = await PutawayManagementModel.suggestOptimalLocation(productId, warehouseId, quantity);
      
      res.json({
        message: "Localização sugerida com sucesso",
        suggestion
      });
    } catch (error) {
      console.error('Error suggesting optimal location:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao sugerir localização", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async evaluateCrossDock(req: Request, res: Response) {
    try {
      const schema = z.object({
        orderId: z.string().uuid(),
        warehouseId: z.string().uuid()
      });

      const { orderId, warehouseId } = schema.parse(req.body);
      const evaluation = await PutawayManagementModel.processCrossDockOrder(orderId, warehouseId);
      
      res.json({
        message: "Avaliação de cross-dock concluída",
        evaluation
      });
    } catch (error) {
      console.error('Error evaluating cross-dock:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao avaliar cross-dock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPutawayStats(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const stats = await PutawayManagementModel.getPutawayStats(warehouseId as string);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching putaway stats:', error);
      res.status(500).json({ 
        message: "Erro ao buscar estatísticas de putaway", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}