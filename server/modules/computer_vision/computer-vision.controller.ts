import { Request, Response } from 'express';
import { ComputerVisionModel } from './computer-vision.model';
import { CVProcessingSession } from '@shared/computer-vision-types';

export class ComputerVisionController {
  
  // Contagem automática de itens
  static async countItems(req: Request, res: Response) {
    try {
      const { imageUrl, productId, warehouseId, expectedCount, algorithm = 'yolo' } = req.body;

      if (!imageUrl || !warehouseId) {
        return res.status(400).json({ message: 'Image URL and warehouse ID are required' });
      }

      console.log(`🔍 Iniciando contagem automática de itens com ${algorithm}`);

      const result = await ComputerVisionModel.processItemCounting({
        imageUrl,
        productId,
        warehouseId,
        expectedCount,
        algorithm,
        userId: 'system' // Viria do token de auth
      });

      console.log(`✅ Contagem concluída: ${result.totalCount} itens detectados (confiança: ${result.confidence}%)`);

      res.json({
        message: 'Item counting completed',
        sessionId: result.sessionId,
        results: result,
        processing: {
          algorithm: result.algorithm,
          processingTime: `${result.processingTimeMs}ms`,
          confidence: `${result.confidence}%`
        }
      });

    } catch (error) {
      console.error('Erro na contagem de itens:', error);
      res.status(500).json({ 
        message: 'Item counting failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Detecção de danos
  static async detectDamage(req: Request, res: Response) {
    try {
      const { imageUrl, productId, orderId, warehouseId, sensitivity = 'medium' } = req.body;

      if (!imageUrl || !warehouseId) {
        return res.status(400).json({ message: 'Image URL and warehouse ID are required' });
      }

      console.log(`🔍 Iniciando detecção de danos com sensibilidade ${sensitivity}`);

      const result = await ComputerVisionModel.processDamageDetection({
        imageUrl,
        productId,
        orderId,
        warehouseId,
        sensitivity,
        userId: 'system'
      });

      const damageCount = result.damageAreas.length;
      console.log(`✅ Detecção concluída: ${damageCount} áreas de dano encontradas (condição: ${result.overallCondition})`);

      res.json({
        message: 'Damage detection completed',
        sessionId: result.sessionId,
        results: result,
        summary: {
          damageCount,
          overallCondition: result.overallCondition,
          criticalDamages: result.damageAreas.filter(d => d.severity === 'critical').length,
          processingTime: `${result.processingTimeMs}ms`
        }
      });

    } catch (error) {
      console.error('Erro na detecção de danos:', error);
      res.status(500).json({ 
        message: 'Damage detection failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Leitura automática de etiquetas e códigos
  static async readLabels(req: Request, res: Response) {
    try {
      const { imageUrl, expectedFormats, language = 'pt', warehouseId } = req.body;

      if (!imageUrl || !warehouseId) {
        return res.status(400).json({ message: 'Image URL and warehouse ID are required' });
      }

      console.log(`🔍 Iniciando leitura de etiquetas em ${language}`);

      const result = await ComputerVisionModel.processLabelReading({
        imageUrl,
        expectedFormats,
        language,
        warehouseId,
        userId: 'system'
      });

      const barcodeCount = result.detectedBarcodes.length;
      console.log(`✅ Leitura concluída: ${barcodeCount} códigos detectados (confiança: ${result.confidence}%)`);

      res.json({
        message: 'Label reading completed',
        sessionId: result.sessionId,
        results: result,
        summary: {
          textLength: result.extractedText.length,
          barcodeCount,
          dataFields: Object.keys(result.extractedData).length,
          confidence: `${result.confidence}%`,
          processingTime: `${result.processingTimeMs}ms`
        }
      });

    } catch (error) {
      console.error('Erro na leitura de etiquetas:', error);
      res.status(500).json({ 
        message: 'Label reading failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Verificação de qualidade combinada
  static async qualityCheck(req: Request, res: Response) {
    try {
      const { 
        imageUrl, 
        productId, 
        orderId, 
        warehouseId, 
        checkDamage = true, 
        countItems = true, 
        readLabels = true 
      } = req.body;

      if (!imageUrl || !warehouseId) {
        return res.status(400).json({ message: 'Image URL and warehouse ID are required' });
      }

      console.log(`🔍 Iniciando verificação completa de qualidade`);

      const results = await ComputerVisionModel.processQualityCheck({
        imageUrl,
        productId,
        orderId,
        warehouseId,
        checks: { checkDamage, countItems, readLabels },
        userId: 'system'
      });

      console.log(`✅ Verificação de qualidade concluída`);

      res.json({
        message: 'Quality check completed',
        sessionIds: results.sessionIds,
        results,
        summary: {
          overallQuality: results.overallQuality,
          issuesFound: results.issuesFound,
          totalProcessingTime: `${results.totalProcessingTimeMs}ms`
        }
      });

    } catch (error) {
      console.error('Erro na verificação de qualidade:', error);
      res.status(500).json({ 
        message: 'Quality check failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Obter sessão específica
  static async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await ComputerVisionModel.getSession(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      res.json(session);

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get session', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Listar sessões
  static async getSessions(req: Request, res: Response) {
    try {
      const { type, status, warehouseId, limit = 50, offset = 0 } = req.query;

      const sessions = await ComputerVisionModel.getSessions({
        type: type as string,
        status: status as string,
        warehouseId: warehouseId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      res.json({
        sessions,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: sessions.length
        }
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get sessions', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Configuração do sistema CV
  static async updateConfiguration(req: Request, res: Response) {
    try {
      const config = req.body;
      await ComputerVisionModel.updateConfiguration(config);

      console.log('🔧 Configuração de Computer Vision atualizada');

      res.json({
        message: 'Configuration updated successfully',
        config
      });

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to update configuration', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  static async getConfiguration(req: Request, res: Response) {
    try {
      const config = await ComputerVisionModel.getConfiguration();
      res.json(config);

    } catch (error) {
      res.status(500).json({ 
        message: 'Failed to get configuration', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}