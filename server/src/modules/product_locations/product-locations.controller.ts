import { Request, Response } from 'express';
import { z } from 'zod';
import { ProductLocationsModel } from './product-locations.model';

// Validation schemas
const createProductLocationSchema = z.object({
  productId: z.string().uuid("ID do produto inválido"),
  warehouseId: z.string().uuid("ID do armazém inválido"),
  zone: z.string().min(1, "Zona é obrigatória"),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  position: z.string().optional(),
  maxQuantity: z.number().int().positive().optional(),
  pickingPriority: z.number().int().min(1).max(10).default(5)
});

const updateProductLocationSchema = z.object({
  zone: z.string().min(1).optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  position: z.string().optional(),
  maxQuantity: z.number().int().positive().optional(),
  pickingPriority: z.number().int().min(1).max(10).optional()
});

const bulkAssignSchema = z.object({
  productIds: z.array(z.string().uuid()),
  warehouseId: z.string().uuid(),
  zone: z.string().min(1),
  autoAssignBins: z.boolean().default(false)
});

export class ProductLocationsController {
  static async getProductLocations(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string | undefined;
      const locations = await ProductLocationsModel.getProductLocations(warehouseId);
      res.json(locations);
    } catch (error) {
      console.error('Error fetching product locations:', error);
      res.status(500).json({
        message: "Erro ao buscar localizações de produtos",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProductLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const location = await ProductLocationsModel.getProductLocationById(id);
      
      if (!location) {
        return res.status(404).json({
          message: "Localização não encontrada"
        });
      }

      res.json(location);
    } catch (error) {
      console.error('Error fetching product location:', error);
      res.status(500).json({
        message: "Erro ao buscar localização",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createProductLocation(req: Request, res: Response) {
    try {
      const validated = createProductLocationSchema.parse(req.body);
      
      // Check if location already exists for this product-warehouse combination
      const existingLocation = await ProductLocationsModel.findProductLocation(
        validated.productId, 
        validated.warehouseId
      );
      
      if (existingLocation) {
        return res.status(409).json({
          message: "Já existe uma localização para este produto neste armazém"
        });
      }

      const location = await ProductLocationsModel.createProductLocation(validated);
      res.status(201).json(location);
    } catch (error) {
      console.error('Error creating product location:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar localização",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async updateProductLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateProductLocationSchema.parse(req.body);
      const location = await ProductLocationsModel.updateProductLocation(id, validated);
      res.json(location);
    } catch (error) {
      console.error('Error updating product location:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar localização",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteProductLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ProductLocationsModel.deleteProductLocation(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product location:', error);
      res.status(500).json({
        message: "Erro ao eliminar localização",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWarehouseLocations(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const locations = await ProductLocationsModel.getProductLocations(warehouseId);
      res.json(locations);
    } catch (error) {
      console.error('Error fetching warehouse locations:', error);
      res.status(500).json({
        message: "Erro ao buscar localizações do armazém",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async findProductLocation(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const warehouseId = req.query.warehouseId as string;
      
      if (!warehouseId) {
        return res.status(400).json({
          message: "ID do armazém é obrigatório"
        });
      }

      const location = await ProductLocationsModel.findProductLocation(productId, warehouseId);
      
      if (!location) {
        return res.status(404).json({
          message: "Localização não encontrada para este produto"
        });
      }

      res.json(location);
    } catch (error) {
      console.error('Error finding product location:', error);
      res.status(500).json({
        message: "Erro ao buscar localização do produto",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async bulkAssignLocations(req: Request, res: Response) {
    try {
      const validated = bulkAssignSchema.parse(req.body);
      const result = await ProductLocationsModel.bulkAssignLocations(validated);
      
      res.json({
        message: `${result.assigned} produtos atribuídos com sucesso`,
        assigned: result.assigned,
        failed: result.failed
      });
    } catch (error) {
      console.error('Error bulk assigning locations:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atribuir localizações em lote",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getWarehouseZones(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const zones = await ProductLocationsModel.getWarehouseZones(warehouseId);
      res.json(zones);
    } catch (error) {
      console.error('Error fetching warehouse zones:', error);
      res.status(500).json({
        message: "Erro ao buscar zonas do armazém",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createZone(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const { zoneName, description, maxCapacity } = req.body;
      
      const zone = await ProductLocationsModel.createWarehouseZone({
        warehouseId,
        zoneName,
        description,
        maxCapacity
      });
      
      res.status(201).json(zone);
    } catch (error) {
      console.error('Error creating warehouse zone:', error);
      res.status(500).json({
        message: "Erro ao criar zona",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}