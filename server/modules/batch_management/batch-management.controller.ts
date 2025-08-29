import { Request, Response } from 'express';
import { z } from 'zod';
import { BatchManagementModel } from './batch-management.model';

// Validation schemas
const createBatchSchema = z.object({
  batchNumber: z.string().min(1, "Número do lote é obrigatório"),
  productId: z.string().uuid("ID do produto inválido"),
  warehouseId: z.string().uuid("ID do armazém inválido"),
  manufacturingDate: z.string().transform(str => new Date(str)),
  expiryDate: z.string().transform(str => new Date(str)),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  supplierBatchRef: z.string().optional(),
  qualityStatus: z.enum(["pending", "approved", "rejected", "quarantine"]).default("pending"),
  notes: z.string().optional()
});

const updateBatchSchema = z.object({
  manufacturingDate: z.string().transform(str => new Date(str)).optional(),
  expiryDate: z.string().transform(str => new Date(str)).optional(),
  quantity: z.number().int().positive().optional(),
  qualityStatus: z.enum(["pending", "approved", "rejected", "quarantine"]).optional(),
  notes: z.string().optional()
});

const addProductsToBatchSchema = z.object({
  productIds: z.array(z.string().uuid()),
  quantity: z.number().int().positive()
});

export class BatchManagementController {
  static async getBatches(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const productId = req.query.productId as string | undefined;
      const status = req.query.status as string | undefined;
      const expiryAlert = req.query.expiryAlert === 'true';
      
      const batches = await BatchManagementModel.getBatches({
        warehouseId,
        productId,
        status,
        expiryAlert
      });
      
      res.json(batches);
    } catch (error) {
      console.error('Error fetching batches:', error);
      res.status(500).json({
        message: "Erro ao buscar lotes",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getBatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const batch = await BatchManagementModel.getBatchById(id);
      
      if (!batch) {
        return res.status(404).json({
          message: "Lote não encontrado"
        });
      }

      res.json(batch);
    } catch (error) {
      console.error('Error fetching batch:', error);
      res.status(500).json({
        message: "Erro ao buscar lote",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createBatch(req: Request, res: Response) {
    try {
      const validated = createBatchSchema.parse(req.body);
      
      // Check if batch number already exists
      const existingBatch = await BatchManagementModel.getBatchByNumber(validated.batchNumber);
      if (existingBatch) {
        return res.status(409).json({
          message: "Número de lote já existe"
        });
      }

      // Validate expiry date is after manufacturing date
      if (validated.expiryDate <= validated.manufacturingDate) {
        return res.status(400).json({
          message: "Data de validade deve ser posterior à data de fabrico"
        });
      }

      const batch = await BatchManagementModel.createBatch(validated);
      res.status(201).json(batch);
    } catch (error) {
      console.error('Error creating batch:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar lote",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateBatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateBatchSchema.parse(req.body);
      
      // Validate expiry date if both dates are provided
      if (validated.expiryDate && validated.manufacturingDate && 
          validated.expiryDate <= validated.manufacturingDate) {
        return res.status(400).json({
          message: "Data de validade deve ser posterior à data de fabrico"
        });
      }

      const batch = await BatchManagementModel.updateBatch(id, validated);
      res.json(batch);
    } catch (error) {
      console.error('Error updating batch:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar lote",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteBatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await BatchManagementModel.deleteBatch(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting batch:', error);
      res.status(500).json({
        message: "Erro ao eliminar lote",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async addProductsToBatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = addProductsToBatchSchema.parse(req.body);
      
      const result = await BatchManagementModel.addProductsToBatch(id, validated);
      res.json(result);
    } catch (error) {
      console.error('Error adding products to batch:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao adicionar produtos ao lote",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async removeProductFromBatch(req: Request, res: Response) {
    try {
      const { id, productId } = req.params;
      await BatchManagementModel.removeProductFromBatch(id, productId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing product from batch:', error);
      res.status(500).json({
        message: "Erro ao remover produto do lote",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getExpiryAlerts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alerts = await BatchManagementModel.getExpiryAlerts(id);
      res.json(alerts);
    } catch (error) {
      console.error('Error getting expiry alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas de validade",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getExpiringProducts(req: Request, res: Response) {
    try {
      const daysAhead = parseInt(req.query.days as string) || 30;
      const warehouseId = req.query.warehouseId as string | undefined;
      
      const products = await BatchManagementModel.getExpiringProducts(daysAhead, warehouseId);
      res.json(products);
    } catch (error) {
      console.error('Error getting expiring products:', error);
      res.status(500).json({
        message: "Erro ao buscar produtos a expirar",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getExpiredProducts(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const products = await BatchManagementModel.getExpiredProducts(warehouseId);
      res.json(products);
    } catch (error) {
      console.error('Error getting expired products:', error);
      res.status(500).json({
        message: "Erro ao buscar produtos expirados",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async extendBatchExpiry(req: Request, res: Response) {
    try {
      const { batchIds, newExpiryDate, reason } = req.body;
      
      if (!Array.isArray(batchIds) || batchIds.length === 0) {
        return res.status(400).json({
          message: "Lista de IDs de lotes é obrigatória"
        });
      }

      const result = await BatchManagementModel.extendBatchExpiry(batchIds, {
        newExpiryDate: new Date(newExpiryDate),
        reason,
        extendedAt: new Date(),
        extendedByUserId: req.user?.id
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error extending batch expiry:', error);
      res.status(500).json({
        message: "Erro ao estender validade do lote",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getBatchHistory(req: Request, res: Response) {
    try {
      const { batchNumber } = req.params;
      const history = await BatchManagementModel.getBatchHistory(batchNumber);
      res.json(history);
    } catch (error) {
      console.error('Error getting batch history:', error);
      res.status(500).json({
        message: "Erro ao buscar histórico do lote",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getBatchLocation(req: Request, res: Response) {
    try {
      const { batchNumber } = req.params;
      const location = await BatchManagementModel.getBatchLocation(batchNumber);
      
      if (!location) {
        return res.status(404).json({
          message: "Localização do lote não encontrada"
        });
      }

      res.json(location);
    } catch (error) {
      console.error('Error getting batch location:', error);
      res.status(500).json({
        message: "Erro ao buscar localização do lote",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}