import { Request, Response } from 'express';
import { z } from 'zod';
import { PickingPackingModel } from './picking-packing.model';

// Validation schemas
const createPickingListSchema = z.object({
  orderNumbers: z.array(z.string()).min(1, "Pelo menos uma encomenda é obrigatória"),
  warehouseId: z.string().uuid("ID do armazém inválido"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  assignedToUserId: z.string().uuid().optional(),
  notes: z.string().optional(),
  pickingType: z.enum(["individual", "batch", "wave"]).default("individual")
});

const updatePickingListSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  assignedToUserId: z.string().uuid().optional(),
  notes: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional()
});

const pickItemSchema = z.object({
  quantityPicked: z.number().int().min(0, "Quantidade deve ser positiva"),
  locationVerified: z.boolean().default(false),
  barcodeScanned: z.boolean().default(false),
  notes: z.string().optional()
});

const packingTaskSchema = z.object({
  pickingListId: z.string().uuid("ID da lista de picking inválido"),
  packageType: z.string().min(1, "Tipo de embalagem é obrigatório"),
  targetWeight: z.number().min(0).optional(),
  specialInstructions: z.string().optional()
});

const packItemsSchema = z.object({
  items: z.array(z.object({
    pickingListItemId: z.string().uuid(),
    quantityPacked: z.number().int().min(0),
    packageId: z.string().optional()
  })),
  packageDetails: z.object({
    weight: z.number().min(0),
    dimensions: z.object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0)
    }),
    packageType: z.string(),
    trackingNumber: z.string().optional()
  })
});

export class PickingPackingController {
  static async getPickingLists(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const status = req.query.status as string | undefined;
      const assignedToUserId = req.query.assignedToUserId as string | undefined;
      
      const pickingLists = await PickingPackingModel.getPickingLists({
        warehouseId,
        status,
        assignedToUserId
      });
      
      res.json(pickingLists);
    } catch (error) {
      console.error('Error fetching picking lists:', error);
      res.status(500).json({
        message: "Erro ao buscar listas de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPickingList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pickingList = await PickingPackingModel.getPickingListById(id);
      
      if (!pickingList) {
        return res.status(404).json({
          message: "Lista de picking não encontrada"
        });
      }

      res.json(pickingList);
    } catch (error) {
      console.error('Error fetching picking list:', error);
      res.status(500).json({
        message: "Erro ao buscar lista de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPickingList(req: Request, res: Response) {
    try {
      const validated = createPickingListSchema.parse(req.body);
      const pickingList = await PickingPackingModel.createPickingList(validated);
      
      res.status(201).json(pickingList);
    } catch (error) {
      console.error('Error creating picking list:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar lista de picking",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updatePickingList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = updatePickingListSchema.parse(req.body);
      const pickingList = await PickingPackingModel.updatePickingList(id, validated);
      
      res.json(pickingList);
    } catch (error) {
      console.error('Error updating picking list:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar lista de picking",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deletePickingList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PickingPackingModel.deletePickingList(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting picking list:', error);
      res.status(500).json({
        message: "Erro ao eliminar lista de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async startPicking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.body.userId || req.user?.id;
      
      const result = await PickingPackingModel.startPicking(id, userId);
      res.json(result);
    } catch (error) {
      console.error('Error starting picking:', error);
      res.status(500).json({
        message: "Erro ao iniciar picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async completePicking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PickingPackingModel.completePicking(id);
      res.json(result);
    } catch (error) {
      console.error('Error completing picking:', error);
      res.status(500).json({
        message: "Erro ao completar picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async pickItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const validated = pickItemSchema.parse(req.body);
      const userId = req.body.userId || req.user?.id;
      
      const result = await PickingPackingModel.pickItem(itemId, {
        ...validated,
        pickedByUserId: userId,
        pickedAt: new Date()
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error picking item:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao fazer picking do item",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async verifyPickedItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const { barcode, location } = req.body;
      
      const result = await PickingPackingModel.verifyPickedItem(itemId, {
        barcode,
        location,
        verifiedAt: new Date()
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error verifying picked item:', error);
      res.status(500).json({
        message: "Erro ao verificar item",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPickingWave(req: Request, res: Response) {
    try {
      const { warehouseId, pickingListIds, assignedToUserId } = req.body;
      
      const wave = await PickingPackingModel.createPickingWave({
        warehouseId,
        pickingListIds,
        assignedToUserId,
        createdAt: new Date()
      });
      
      res.status(201).json(wave);
    } catch (error) {
      console.error('Error creating picking wave:', error);
      res.status(500).json({
        message: "Erro ao criar onda de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPickingWave(req: Request, res: Response) {
    try {
      const { waveId } = req.params;
      const wave = await PickingPackingModel.getPickingWave(waveId);
      
      if (!wave) {
        return res.status(404).json({
          message: "Onda de picking não encontrada"
        });
      }

      res.json(wave);
    } catch (error) {
      console.error('Error fetching picking wave:', error);
      res.status(500).json({
        message: "Erro ao buscar onda de picking",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async assignWaveToUser(req: Request, res: Response) {
    try {
      const { waveId } = req.params;
      const { userId } = req.body;
      
      const result = await PickingPackingModel.assignWaveToUser(waveId, userId);
      res.json(result);
    } catch (error) {
      console.error('Error assigning wave to user:', error);
      res.status(500).json({
        message: "Erro ao atribuir onda ao utilizador",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPackingTasks(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const status = req.query.status as string | undefined;
      
      const tasks = await PickingPackingModel.getPackingTasks({
        warehouseId,
        status
      });
      
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching packing tasks:', error);
      res.status(500).json({
        message: "Erro ao buscar tarefas de embalagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPackingTask(req: Request, res: Response) {
    try {
      const validated = packingTaskSchema.parse(req.body);
      const task = await PickingPackingModel.createPackingTask(validated);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating packing task:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar tarefa de embalagem",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async packItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = packItemsSchema.parse(req.body);
      
      const result = await PickingPackingModel.packItems(id, validated);
      res.json(result);
    } catch (error) {
      console.error('Error packing items:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao embalar itens",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async completePackaging(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await PickingPackingModel.completePackaging(id);
      res.json(result);
    } catch (error) {
      console.error('Error completing packaging:', error);
      res.status(500).json({
        message: "Erro ao completar embalagem",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateShippingLabel(req: Request, res: Response) {
    try {
      const { packingTaskId, shippingMethod, recipient } = req.body;
      
      const label = await PickingPackingModel.generateShippingLabel({
        packingTaskId,
        shippingMethod,
        recipient,
        generatedAt: new Date()
      });
      
      res.json(label);
    } catch (error) {
      console.error('Error generating shipping label:', error);
      res.status(500).json({
        message: "Erro ao gerar etiqueta de envio",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getShippingInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shippingInfo = await PickingPackingModel.getShippingInfo(id);
      
      if (!shippingInfo) {
        return res.status(404).json({
          message: "Informações de envio não encontradas"
        });
      }

      res.json(shippingInfo);
    } catch (error) {
      console.error('Error fetching shipping info:', error);
      res.status(500).json({
        message: "Erro ao buscar informações de envio",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}