import { Request, Response } from 'express';
import { IntelligentReplenishmentModel } from './replenishment.model';
import { z } from 'zod';

export class IntelligentReplenishmentController {
  // Replenishment Rules
  static async createReplenishmentRule(req: Request, res: Response) {
    try {
      const schema = z.object({
        productId: z.string().uuid(),
        warehouseId: z.string().uuid(),
        minimumStock: z.number().int().min(0),
        maximumStock: z.number().int().min(1),
        reorderPoint: z.number().int().min(0),
        economicOrderQuantity: z.number().int().min(1).optional(),
        leadTimeDays: z.number().int().min(1).default(7),
        safetyStockDays: z.number().int().min(0).default(3),
        preferredSupplierId: z.string().uuid().optional(),
        lastCost: z.number().min(0).optional(),
        isActive: z.boolean().default(true),
        automatedOrdering: z.boolean().default(false),
        seasonalAdjustment: z.any().optional(),
        notes: z.string().optional(),
        userId: z.string().uuid().optional()
      });

      const data = schema.parse(req.body);
      const rule = await IntelligentReplenishmentModel.createReplenishmentRule(data);
      
      res.status(201).json({
        message: "Regra de reabastecimento criada com sucesso",
        rule
      });
    } catch (error) {
      console.error('Error creating replenishment rule:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar regra de reabastecimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReplenishmentRules(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const rules = await IntelligentReplenishmentModel.getAllReplenishmentRules(warehouseId as string);
      res.json(rules);
    } catch (error) {
      console.error('Error fetching replenishment rules:', error);
      res.status(500).json({ 
        message: "Erro ao buscar regras de reabastecimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReplenishmentRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await IntelligentReplenishmentModel.getReplenishmentRuleById(id);
      
      if (!rule || rule.length === 0) {
        return res.status(404).json({ message: "Regra de reabastecimento não encontrada" });
      }
      
      res.json(rule[0]);
    } catch (error) {
      console.error('Error fetching replenishment rule:', error);
      res.status(500).json({ 
        message: "Erro ao buscar regra de reabastecimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateReplenishmentRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rule = await IntelligentReplenishmentModel.updateReplenishmentRule(id, req.body);
      
      res.json({
        message: "Regra de reabastecimento atualizada com sucesso",
        rule
      });
    } catch (error) {
      console.error('Error updating replenishment rule:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar regra de reabastecimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteReplenishmentRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await IntelligentReplenishmentModel.deleteReplenishmentRule(id);
      
      res.json({
        message: "Regra de reabastecimento eliminada com sucesso"
      });
    } catch (error) {
      console.error('Error deleting replenishment rule:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar regra de reabastecimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Demand Forecasting
  static async generateDemandForecast(req: Request, res: Response) {
    try {
      const schema = z.object({
        productId: z.string().uuid(),
        warehouseId: z.string().uuid(),
        forecastDays: z.number().int().min(1).max(365).default(30)
      });

      const { productId, warehouseId, forecastDays } = schema.parse(req.body);
      const forecasts = await IntelligentReplenishmentModel.generateDemandForecast(
        productId, 
        warehouseId, 
        forecastDays
      );
      
      res.json({
        message: "Previsão de demanda gerada com sucesso",
        forecasts,
        summary: {
          totalPeriods: forecasts.length,
          averageDemand: forecasts.length > 0 ? Math.round(forecasts.reduce((sum: number, f: any) => sum + (f.demandQuantity || 0), 0) / forecasts.length) : 0,
          averageConfidence: forecasts.length > 0 ? Math.round(forecasts.reduce((sum: number, f: any) => sum + (f.confidenceLevel || 0), 0) / forecasts.length) : 0,
          totalDemand: forecasts.reduce((sum: number, f: any) => sum + (f.demandQuantity || 0), 0)
        }
      });
    } catch (error) {
      console.error('Error generating demand forecast:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao gerar previsão de demanda", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDemandForecasts(req: Request, res: Response) {
    try {
      const { productId, warehouseId } = req.query;
      const forecasts = await IntelligentReplenishmentModel.getAllDemandForecasts(
        productId as string, 
        warehouseId as string
      );
      res.json(forecasts);
    } catch (error) {
      console.error('Error fetching demand forecasts:', error);
      res.status(500).json({ 
        message: "Erro ao buscar previsões de demanda", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getDemandForecast(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const forecast = await IntelligentReplenishmentModel.getDemandForecastById(id);
      
      if (!forecast || forecast.length === 0) {
        return res.status(404).json({ message: "Previsão de demanda não encontrada" });
      }
      
      res.json(forecast[0]);
    } catch (error) {
      console.error('Error fetching demand forecast:', error);
      res.status(500).json({ 
        message: "Erro ao buscar previsão de demanda", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Stock-out Alerts
  static async getStockoutAlerts(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const alerts = await IntelligentReplenishmentModel.checkStockoutRisks(warehouseId as string);
      
      res.json({
        alerts,
        summary: {
          totalAlerts: alerts.length,
          criticalAlerts: alerts.filter(a => a.riskLevel === 'critical').length,
          highAlerts: alerts.filter(a => a.riskLevel === 'high').length,
          mediumAlerts: alerts.filter(a => a.riskLevel === 'medium').length,
          totalValue: alerts.reduce((sum, a) => sum + (a.suggestedAction.estimatedCost || 0), 0)
        }
      });
    } catch (error) {
      console.error('Error fetching stockout alerts:', error);
      res.status(500).json({ 
        message: "Erro ao buscar alertas de rutura de stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Automatic Replenishment
  static async generateReplenishmentOrders(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const orders = await IntelligentReplenishmentModel.generateReplenishmentOrders(warehouseId as string);
      
      res.json({
        message: "Ordens de reabastecimento geradas com sucesso",
        orders,
        summary: {
          totalOrders: orders.length,
          urgentOrders: orders.filter(o => o.urgency === 'immediate').length,
          totalValue: orders.reduce((sum, o) => sum + (o.estimatedCost || 0), 0),
          averageLeadTime: orders.length > 0 ? 
            Math.round(orders.reduce((sum, o) => sum + o.leadTimeDays, 0) / orders.length) : 0
        }
      });
    } catch (error) {
      console.error('Error generating replenishment orders:', error);
      res.status(500).json({ 
        message: "Erro ao gerar ordens de reabastecimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getReplenishmentStats(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const stats = await IntelligentReplenishmentModel.getReplenishmentStats(warehouseId as string);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching replenishment stats:', error);
      res.status(500).json({ 
        message: "Erro ao buscar estatísticas de reabastecimento", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAdvancedAnalytics(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      const analytics = await IntelligentReplenishmentModel.getAdvancedAnalytics(warehouseId as string);
      
      res.json({
        message: "Análises avançadas geradas com sucesso",
        analytics
      });
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      res.status(500).json({ 
        message: "Erro ao buscar análises avançadas", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Batch Operations
  static async bulkUpdateRules(req: Request, res: Response) {
    try {
      const schema = z.object({
        warehouseId: z.string().uuid(),
        updates: z.array(z.object({
          productId: z.string().uuid(),
          changes: z.any()
        }))
      });

      const { warehouseId, updates } = schema.parse(req.body);
      const results = [];
      
      for (const update of updates) {
        try {
          // Find existing rule
          const rules = await IntelligentReplenishmentModel.getAllReplenishmentRules(warehouseId);
          const existingRule = rules.find(r => r.rule?.productId === update.productId);
          
          if (existingRule?.rule) {
            const updated = await IntelligentReplenishmentModel.updateReplenishmentRule(
              existingRule.rule.id, 
              update.changes
            );
            results.push({ productId: update.productId, status: 'updated', rule: updated });
          } else {
            // Create new rule
            const newRule = await IntelligentReplenishmentModel.createReplenishmentRule({
              productId: update.productId,
              warehouseId,
              ...update.changes
            });
            results.push({ productId: update.productId, status: 'created', rule: newRule });
          }
        } catch (error) {
          results.push({ 
            productId: update.productId, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      res.json({
        message: "Atualização em lote concluída",
        results,
        summary: {
          total: results.length,
          updated: results.filter(r => r.status === 'updated').length,
          created: results.filter(r => r.status === 'created').length,
          errors: results.filter(r => r.status === 'error').length
        }
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro na atualização em lote", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}