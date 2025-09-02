import { Request, Response } from 'express';
import { ComputerVisionModel } from './cv.model';
import { z } from 'zod';

export class ComputerVisionController {
  static async processImage(req: Request, res: Response) {
    try {
      const schema = z.object({
        sessionId: z.string().min(1),
        imageUrl: z.string().url(),
        productId: z.string().uuid().optional(),
        algorithm: z.string().default('yolo_v8')
      });

      const data = schema.parse(req.body);
      const result = await ComputerVisionModel.processAutomatedCounting(data);
      
      res.status(201).json({
        message: "Imagem processada com sucesso",
        result
      });
    } catch (error) {
      console.error('Error processing image:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao processar imagem", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCountingResults(req: Request, res: Response) {
    try {
      const { sessionId } = req.query;
      
      let results;
      if (sessionId) {
        results = await ComputerVisionModel.getCountingResultsBySession(sessionId as string);
      } else {
        results = await ComputerVisionModel.getAllCountingResults();
      }
      
      res.json(results);
    } catch (error) {
      console.error('Error fetching counting results:', error);
      res.status(500).json({ 
        message: "Erro ao buscar resultados de contagem", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCountingResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ComputerVisionModel.getCountingResult(id);
      
      if (!result || result.length === 0) {
        return res.status(404).json({ message: "Resultado de contagem não encontrado" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error fetching counting result:', error);
      res.status(500).json({ 
        message: "Erro ao buscar resultado de contagem", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async verifyCountingResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const schema = z.object({
        manualCount: z.number().int().min(0),
        verifiedBy: z.string().uuid()
      });

      const { manualCount, verifiedBy } = schema.parse(req.body);
      const result = await ComputerVisionModel.verifyCountingResult(id, manualCount, verifiedBy);
      
      res.json({
        message: "Contagem verificada com sucesso",
        result
      });
    } catch (error) {
      console.error('Error verifying counting result:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao verificar contagem", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateCountingResult(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ComputerVisionModel.updateCountingResult(id, req.body);
      
      res.json({
        message: "Resultado de contagem atualizado com sucesso",
        result
      });
    } catch (error) {
      console.error('Error updating counting result:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar resultado de contagem", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCountingStats(req: Request, res: Response) {
    try {
      const stats = await ComputerVisionModel.getCountingStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching counting stats:', error);
      res.status(500).json({ 
        message: "Erro ao buscar estatísticas de contagem", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDamageDetection(req: Request, res: Response) {
    try {
      const results = await ComputerVisionModel.getDamageDetectionResults();
      res.json(results);
    } catch (error) {
      console.error('Error fetching damage detection results:', error);
      res.status(500).json({ 
        message: "Erro ao buscar resultados de detecção de danos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async simulateCountingSession(req: Request, res: Response) {
    try {
      const schema = z.object({
        sessionId: z.string().min(1),
        productId: z.string().uuid().optional(),
        imageCount: z.number().int().min(1).max(10).default(3),
        algorithm: z.string().default('yolo_v8')
      });

      const { sessionId, productId, imageCount, algorithm } = schema.parse(req.body);
      
      const results = [];
      for (let i = 0; i < imageCount; i++) {
        const mockImageUrl = `https://storage.example.com/cv-sessions/${sessionId}/image_${i + 1}.jpg`;
        const result = await ComputerVisionModel.processAutomatedCounting({
          sessionId,
          imageUrl: mockImageUrl,
          productId,
          algorithm
        });
        results.push(result);
      }
      
      res.status(201).json({
        message: `Sessão de contagem simulada com ${imageCount} imagens`,
        sessionId,
        results
      });
    } catch (error) {
      console.error('Error simulating counting session:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao simular sessão de contagem", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}