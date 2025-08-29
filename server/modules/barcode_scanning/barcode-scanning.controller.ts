import { Request, Response } from 'express';
import { z } from 'zod';
import { BarcodeScanningModel } from './barcode-scanning.model.js';

// Validation schemas
const createBarcodeScanSchema = z.object({
  scannedCode: z.string().min(1, "Código escaneado é obrigatório"),
  scanType: z.enum(['barcode', 'qr', 'rfid']),
  scanPurpose: z.enum(['inventory', 'picking', 'receiving', 'shipping', 'counting', 'tracking']),
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  metadata: z.any().optional()
});

const updateLocationSchema = z.object({
  locationId: z.string().uuid(),
  coordinates: z.object({
    latitude: z.number(),
    longitude: z.number()
  }).optional(),
  timestamp: z.string().datetime().optional()
});

export class BarcodeScanningController {
  static async getBarcodeScans(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const scans = await BarcodeScanningModel.getBarcodeScans(limit);
      res.json(scans);
    } catch (error) {
      console.error('Error fetching barcode scans:', error);
      res.status(500).json({ 
        message: "Erro ao buscar escaneamentos",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createBarcodeScan(req: Request, res: Response) {
    try {
      const validated = createBarcodeScanSchema.parse(req.body);
      
      // Check if product exists by barcode
      let productId = validated.productId;
      if (!productId && validated.scannedCode) {
        const product = await BarcodeScanningModel.findProductByBarcode(validated.scannedCode);
        if (product) {
          productId = product.id;
        }
      }

      const scanData = {
        ...validated,
        productId,
        metadata: {
          ...validated.metadata,
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent']
        }
      };

      const scan = await BarcodeScanningModel.createBarcodeScan(scanData);
      
      // If this is a product scan, update last scanned info
      if (productId) {
        await BarcodeScanningModel.updateProductLastScanned(productId, validated.userId);
      }

      res.status(201).json(scan);
    } catch (error) {
      console.error('Error creating barcode scan:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({ 
          message: "Erro ao criar escaneamento",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getBarcodeScansByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const scans = await BarcodeScanningModel.getBarcodeScansByProduct(productId);
      res.json(scans);
    } catch (error) {
      console.error('Error fetching product scans:', error);
      res.status(500).json({ 
        message: "Erro ao buscar escaneamentos do produto",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async findProductByBarcode(req: Request, res: Response) {
    try {
      const { barcode } = req.params;
      const product = await BarcodeScanningModel.findProductByBarcode(barcode);
      
      if (!product) {
        return res.status(404).json({ 
          message: "Produto não encontrado para este código de barras",
          barcode 
        });
      }

      res.json(product);
    } catch (error) {
      console.error('Error finding product by barcode:', error);
      res.status(500).json({ 
        message: "Erro ao buscar produto",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateScanLocation(req: Request, res: Response) {
    try {
      const { scanId } = req.params;
      const validated = updateLocationSchema.parse(req.body);
      
      const updatedScan = await BarcodeScanningModel.updateScanLocation(scanId, validated);
      res.json(updatedScan);
    } catch (error) {
      console.error('Error updating scan location:', error);
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

  static async getLastProductLocation(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const location = await BarcodeScanningModel.getLastProductLocation(productId);
      
      if (!location) {
        return res.status(404).json({ 
          message: "Localização não encontrada para este produto" 
        });
      }

      res.json(location);
    } catch (error) {
      console.error('Error fetching last product location:', error);
      res.status(500).json({ 
        message: "Erro ao buscar última localização",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}