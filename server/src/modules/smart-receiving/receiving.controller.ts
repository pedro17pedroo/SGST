import { Request, Response } from 'express';
import { SmartReceivingModel } from './receiving.model';
import { z } from 'zod';

export class SmartReceivingController {
  // ASN Management
  static async createAsn(req: Request, res: Response) {
    try {
      const schema = z.object({
        asnNumber: z.string().min(1),
        supplierId: z.string().uuid(),
        warehouseId: z.string().uuid(),
        poNumber: z.string().optional(),
        transportMode: z.string().optional(),
        carrier: z.string().optional(),
        trackingNumber: z.string().optional(),
        estimatedArrival: z.string().datetime().optional(),
        ediData: z.any().optional(),
        containerNumbers: z.array(z.string()).optional(),
        sealNumbers: z.array(z.string()).optional(),
        totalWeight: z.string().optional(),
        totalVolume: z.string().optional(),
        notes: z.string().optional(),
        userId: z.string().uuid().optional()
      });

      const parsed = schema.parse(req.body);
      const data = {
        ...parsed,
        estimatedArrival: parsed.estimatedArrival ? new Date(parsed.estimatedArrival) : undefined
      };
      const asn = await SmartReceivingModel.createAsn(data);
      
      res.status(201).json({
        message: "ASN criado com sucesso",
        asn
      });
    } catch (error) {
      console.error('Error creating ASN:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar ASN", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAsns(req: Request, res: Response) {
    try {
      const asns = await SmartReceivingModel.getAllAsns();
      res.json(asns);
    } catch (error) {
      console.error('Error fetching ASNs:', error);
      res.status(500).json({ 
        message: "Erro ao buscar ASNs", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAsn(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const asn = await SmartReceivingModel.getAsnById(id);
      
      if (!asn || asn.length === 0) {
        return res.status(404).json({ message: "ASN não encontrado" });
      }
      
      res.json(asn[0]);
    } catch (error) {
      console.error('Error fetching ASN:', error);
      res.status(500).json({ 
        message: "Erro ao buscar ASN", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateAsnStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        status: z.enum(['pending', 'in_transit', 'arrived', 'receiving', 'completed', 'cancelled'])
      });

      const { status } = schema.parse(req.body);
      const asn = await SmartReceivingModel.updateAsnStatus(id, status);
      
      res.json({
        message: "Status do ASN atualizado com sucesso",
        asn
      });
    } catch (error) {
      console.error('Error updating ASN status:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar status do ASN", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAsnLineItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const lineItems = await SmartReceivingModel.getAsnLineItems(id);
      res.json(lineItems);
    } catch (error) {
      console.error('Error fetching ASN line items:', error);
      res.status(500).json({ 
        message: "Erro ao buscar itens do ASN", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Receiving Management
  static async createReceivingReceipt(req: Request, res: Response) {
    try {
      const schema = z.object({
        receiptNumber: z.string().min(1),
        asnId: z.string().uuid().optional(),
        orderId: z.string().uuid().optional(),
        warehouseId: z.string().uuid(),
        receivingMethod: z.enum(['manual', 'barcode', 'rfid', 'computer_vision']),
        receivedBy: z.string().uuid(),
        notes: z.string().optional()
      });

      const data = schema.parse(req.body);
      const receipt = await SmartReceivingModel.createReceivingReceipt(data);
      
      res.status(201).json({
        message: "Recibo de recebimento criado com sucesso",
        receipt
      });
    } catch (error) {
      console.error('Error creating receiving receipt:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar recibo de recebimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReceivingReceipts(req: Request, res: Response) {
    try {
      const receipts = await SmartReceivingModel.getAllReceivingReceipts();
      res.json(receipts);
    } catch (error) {
      console.error('Error fetching receiving receipts:', error);
      res.status(500).json({ 
        message: "Erro ao buscar recibos de recebimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReceivingReceipt(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const receipt = await SmartReceivingModel.getReceivingReceiptById(id);
      
      if (!receipt || receipt.length === 0) {
        return res.status(404).json({ message: "Recibo de recebimento não encontrado" });
      }
      
      res.json(receipt[0]);
    } catch (error) {
      console.error('Error fetching receiving receipt:', error);
      res.status(500).json({ 
        message: "Erro ao buscar recibo de recebimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async addReceivingReceiptItem(req: Request, res: Response) {
    try {
      const { receiptId } = req.params;
      const schema = z.object({
        productId: z.string().uuid(),
        expectedQuantity: z.number().int().min(0),
        receivedQuantity: z.number().int().min(0),
        condition: z.enum(['good', 'damaged', 'expired', 'defective']).default('good'),
        lotNumber: z.string().optional(),
        expiryDate: z.string().datetime().optional(),
        actualWeight: z.string().optional(),
        actualDimensions: z.any().optional(),
        qualityNotes: z.string().optional()
      });

      const parsed = schema.parse(req.body);
      const data = {
        ...parsed,
        expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined
      };
      const receiptItem = await SmartReceivingModel.addReceivingReceiptItem({
        receiptId,
        ...data,
        variance: data.receivedQuantity - data.expectedQuantity
      });
      
      res.status(201).json({
        message: "Item adicionado ao recibo com sucesso",
        receiptItem
      });
    } catch (error) {
      console.error('Error adding receipt item:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao adicionar item ao recibo", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReceivingReceiptItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const items = await SmartReceivingModel.getReceivingReceiptItems(id);
      res.json(items);
    } catch (error) {
      console.error('Error fetching receipt items:', error);
      res.status(500).json({ 
        message: "Erro ao buscar itens do recibo", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReceivingStats(req: Request, res: Response) {
    try {
      const stats = await SmartReceivingModel.getReceivingStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching receiving stats:', error);
      res.status(500).json({ 
        message: "Erro ao buscar estatísticas de recebimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async processEdiData(req: Request, res: Response) {
    try {
      const ediData = req.body;
      const asn = await SmartReceivingModel.processAsnData(ediData);
      
      res.status(201).json({
        message: "Dados EDI processados com sucesso",
        asn
      });
    } catch (error) {
      console.error('Error processing EDI data:', error);
      res.status(500).json({ 
        message: "Erro ao processar dados EDI", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async generateLabels(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const labels = await SmartReceivingModel.generateReceivingLabels(id);
      
      res.json({
        message: "Etiquetas geradas com sucesso",
        labels
      });
    } catch (error) {
      console.error('Error generating labels:', error);
      res.status(500).json({ 
        message: "Erro ao gerar etiquetas", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Métodos alias para compatibilidade
  static async getAllAsns(req: Request, res: Response) {
    return SmartReceivingController.getAsns(req, res);
  }

  static async getAsnById(req: Request, res: Response) {
    return SmartReceivingController.getAsn(req, res);
  }
}