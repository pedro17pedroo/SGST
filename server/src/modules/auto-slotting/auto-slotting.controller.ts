import { Request, Response } from 'express';
import { AutoSlottingModel } from './auto-slotting.model';

export class AutoSlottingController {
  // Slotting Analytics
  static async getSlottingAnalytics(req: Request, res: Response) {
    try {
      const { warehouseId, productId, status, limit = 50, offset = 0 } = req.query;
      const analytics = await AutoSlottingModel.getSlottingAnalytics({
        warehouseId: warehouseId as string,
        productId: productId as string,
        status: status as string,
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching slotting analytics:', error);
      res.status(500).json({ 
        message: "Erro ao buscar análises de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSlottingAnalytic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analytic = await AutoSlottingModel.getSlottingAnalytic(id);
      
      if (!analytic) {
        return res.status(404).json({ message: "Análise de slotting não encontrada" });
      }
      
      res.json(analytic);
    } catch (error) {
      console.error('Error fetching slotting analytic:', error);
      res.status(500).json({ 
        message: "Erro ao buscar análise de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async calculateSlottingAnalytics(req: Request, res: Response) {
    try {
      const { warehouseId, productIds } = req.body;
      const analytics = await AutoSlottingModel.calculateSlottingAnalytics(warehouseId, productIds);
      res.json(analytics);
    } catch (error) {
      console.error('Error calculating slotting analytics:', error);
      res.status(500).json({ 
        message: "Erro ao calcular análises de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async approveSlottingRecommendation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await AutoSlottingModel.approveSlottingRecommendation(id);
      res.json(result);
    } catch (error) {
      console.error('Error approving slotting recommendation:', error);
      res.status(500).json({ 
        message: "Erro ao aprovar recomendação de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Product Affinity
  static async getProductAffinity(req: Request, res: Response) {
    try {
      const { limit = 50, offset = 0, minScore } = req.query;
      const affinity = await AutoSlottingModel.getProductAffinity({
        limit: Number(limit),
        offset: Number(offset),
        minScore: minScore ? Number(minScore) : undefined
      });
      res.json(affinity);
    } catch (error) {
      console.error('Error fetching product affinity:', error);
      res.status(500).json({ 
        message: "Erro ao buscar afinidade de produtos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProductAffinityByProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { limit = 20 } = req.query;
      const affinity = await AutoSlottingModel.getProductAffinityByProduct(productId, Number(limit));
      res.json(affinity);
    } catch (error) {
      console.error('Error fetching product affinity by product:', error);
      res.status(500).json({ 
        message: "Erro ao buscar afinidade do produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async calculateProductAffinity(req: Request, res: Response) {
    try {
      const { startDate, endDate, warehouseId } = req.body;
      const affinityResults = await AutoSlottingModel.calculateProductAffinity(startDate, endDate, warehouseId);
      res.json(affinityResults);
    } catch (error) {
      console.error('Error calculating product affinity:', error);
      res.status(500).json({ 
        message: "Erro ao calcular afinidade de produtos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Slotting Rules
  static async getSlottingRules(req: Request, res: Response) {
    try {
      const { warehouseId, isActive, limit = 50, offset = 0 } = req.query;
      const rules = await AutoSlottingModel.getSlottingRules({
        warehouseId: warehouseId as string,
        isActive: isActive === 'true',
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(rules);
    } catch (error) {
      console.error('Error fetching slotting rules:', error);
      res.status(500).json({ 
        message: "Erro ao buscar regras de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSlottingRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await AutoSlottingModel.getSlottingRule(id);
      
      if (!rule) {
        return res.status(404).json({ message: "Regra de slotting não encontrada" });
      }
      
      res.json(rule);
    } catch (error) {
      console.error('Error fetching slotting rule:', error);
      res.status(500).json({ 
        message: "Erro ao buscar regra de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createSlottingRule(req: Request, res: Response) {
    try {
      const rule = await AutoSlottingModel.createSlottingRule(req.body);
      res.status(201).json(rule);
    } catch (error) {
      console.error('Error creating slotting rule:', error);
      res.status(500).json({ 
        message: "Erro ao criar regra de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateSlottingRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await AutoSlottingModel.updateSlottingRule(id, req.body);
      res.json(rule);
    } catch (error) {
      console.error('Error updating slotting rule:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar regra de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteSlottingRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AutoSlottingModel.deleteSlottingRule(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting slotting rule:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar regra de slotting", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // ML Models
  static async getMlModels(req: Request, res: Response) {
    try {
      const { modelType, status, limit = 50, offset = 0 } = req.query;
      const models = await AutoSlottingModel.getMlModels({
        modelType: modelType as string,
        status: status as string,
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(models);
    } catch (error) {
      console.error('Error fetching ML models:', error);
      res.status(500).json({ 
        message: "Erro ao buscar modelos ML", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getMlModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const model = await AutoSlottingModel.getMlModel(id);
      
      if (!model) {
        return res.status(404).json({ message: "Modelo ML não encontrado" });
      }
      
      res.json(model);
    } catch (error) {
      console.error('Error fetching ML model:', error);
      res.status(500).json({ 
        message: "Erro ao buscar modelo ML", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createMlModel(req: Request, res: Response) {
    try {
      const model = await AutoSlottingModel.createMlModel(req.body);
      res.status(201).json(model);
    } catch (error) {
      console.error('Error creating ML model:', error);
      res.status(500).json({ 
        message: "Erro ao criar modelo ML", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async trainMlModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { trainingData } = req.body;
      const result = await AutoSlottingModel.trainMlModel(id, trainingData);
      res.json(result);
    } catch (error) {
      console.error('Error training ML model:', error);
      res.status(500).json({ 
        message: "Erro ao treinar modelo ML", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deployMlModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await AutoSlottingModel.deployMlModel(id);
      res.json(result);
    } catch (error) {
      console.error('Error deploying ML model:', error);
      res.status(500).json({ 
        message: "Erro ao implementar modelo ML", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Optimization Jobs
  static async getOptimizationJobs(req: Request, res: Response) {
    try {
      const { warehouseId, status, jobType, limit = 50, offset = 0 } = req.query;
      const jobs = await AutoSlottingModel.getOptimizationJobs({
        warehouseId: warehouseId as string,
        status: status as string,
        jobType: jobType as string,
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching optimization jobs:', error);
      res.status(500).json({ 
        message: "Erro ao buscar trabalhos de otimização", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOptimizationJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const job = await AutoSlottingModel.getOptimizationJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Trabalho de otimização não encontrado" });
      }
      
      res.json(job);
    } catch (error) {
      console.error('Error fetching optimization job:', error);
      res.status(500).json({ 
        message: "Erro ao buscar trabalho de otimização", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createOptimizationJob(req: Request, res: Response) {
    try {
      const job = await AutoSlottingModel.createOptimizationJob(req.body);
      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating optimization job:', error);
      res.status(500).json({ 
        message: "Erro ao criar trabalho de otimização", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async executeOptimizationJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await AutoSlottingModel.executeOptimizationJob(id);
      res.json(result);
    } catch (error) {
      console.error('Error executing optimization job:', error);
      res.status(500).json({ 
        message: "Erro ao executar trabalho de otimização", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Optimization algorithms
  static async optimizeLayout(req: Request, res: Response) {
    try {
      const { warehouseId, optimizationType } = req.body;
      const optimization = await AutoSlottingModel.optimizeLayout(warehouseId, optimizationType);
      res.json(optimization);
    } catch (error) {
      console.error('Error optimizing layout:', error);
      res.status(500).json({ 
        message: "Erro ao otimizar layout", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async optimizePickingRoutes(req: Request, res: Response) {
    try {
      const { warehouseId, pickingListIds } = req.body;
      const optimization = await AutoSlottingModel.optimizePickingRoutes(warehouseId, pickingListIds);
      res.json(optimization);
    } catch (error) {
      console.error('Error optimizing picking routes:', error);
      res.status(500).json({ 
        message: "Erro ao otimizar rotas de picking", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getLayoutRecommendations(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const { priority } = req.query;
      const recommendations = await AutoSlottingModel.getLayoutRecommendations(warehouseId, priority as string);
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching layout recommendations:', error);
      res.status(500).json({ 
        message: "Erro ao buscar recomendações de layout", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}