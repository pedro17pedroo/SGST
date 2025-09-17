import { Request, Response } from 'express';

export class AnalyticsController {
  static async getDemandForecast(req: Request, res: Response) {
    try {
      // Dados de exemplo para previsão de demanda
      const demandForecast = [
        {
          id: '1',
          productName: 'Smartphone Samsung Galaxy',
          sku: 'SGS001',
          currentStock: 45,
          predictedDemand: 78,
          forecastPeriod: '30 dias',
          confidence: 85,
          recommendedAction: 'Reabastecer',
          trend: 'crescente'
        },
        {
          id: '2',
          productName: 'Laptop Dell Inspiron',
          sku: 'DLL002',
          currentStock: 23,
          predictedDemand: 156,
          forecastPeriod: '30 dias',
          confidence: 92,
          recommendedAction: 'Reabastecer Urgente',
          trend: 'crescente'
        },
        {
          id: '3',
          productName: 'Headphones Sony',
          sku: 'SNY003',
          currentStock: 67,
          predictedDemand: 34,
          forecastPeriod: '30 dias',
          confidence: 78,
          recommendedAction: 'Manter',
          trend: 'estável'
        },
        {
          id: '4',
          productName: 'Tablet iPad Air',
          sku: 'APL004',
          currentStock: 89,
          predictedDemand: 45,
          forecastPeriod: '30 dias',
          confidence: 81,
          recommendedAction: 'Reduzir',
          trend: 'decrescente'
        },
        {
          id: '5',
          productName: 'Smartwatch Apple',
          sku: 'APL005',
          currentStock: 12,
          predictedDemand: 67,
          forecastPeriod: '30 dias',
          confidence: 88,
          recommendedAction: 'Reabastecer',
          trend: 'crescente'
        }
      ];

      res.json(demandForecast);
    } catch (error) {
      console.error('Erro ao obter previsão de demanda:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getTurnoverAnalysis(req: Request, res: Response) {
    try {
      // Dados de exemplo para análise de rotatividade
      const turnoverAnalysis = [
        {
          id: '1',
          category: 'Electrónicos',
          turnoverRate: 4.2,
          averageDaysInStock: 87,
          fastMovingItems: 23,
          slowMovingItems: 8,
          deadStock: 2,
          recommendation: 'Otimizar mix de produtos'
        },
        {
          id: '2',
          category: 'Computadores',
          turnoverRate: 6.8,
          averageDaysInStock: 54,
          fastMovingItems: 45,
          slowMovingItems: 12,
          deadStock: 1,
          recommendation: 'Aumentar stock de itens populares'
        },
        {
          id: '3',
          category: 'Áudio',
          turnoverRate: 3.1,
          averageDaysInStock: 118,
          fastMovingItems: 15,
          slowMovingItems: 18,
          deadStock: 5,
          recommendation: 'Revisar estratégia de pricing'
        },
        {
          id: '4',
          category: 'Tablets',
          turnoverRate: 2.9,
          averageDaysInStock: 126,
          fastMovingItems: 12,
          slowMovingItems: 22,
          deadStock: 7,
          recommendation: 'Considerar promoções'
        },
        {
          id: '5',
          category: 'Wearables',
          turnoverRate: 5.4,
          averageDaysInStock: 68,
          fastMovingItems: 34,
          slowMovingItems: 9,
          deadStock: 3,
          recommendation: 'Expandir variedade'
        }
      ];

      res.json(turnoverAnalysis);
    } catch (error) {
      console.error('Erro ao obter análise de rotatividade:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getInventoryOptimization(req: Request, res: Response) {
    try {
      const optimization = {
        totalValue: 2450000,
        optimizationPotential: 18.5,
        recommendations: [
          {
            type: 'Reduzir Stock Excessivo',
            impact: 'Libertar 450.000 AOA',
            items: 23
          },
          {
            type: 'Aumentar Stock Crítico',
            impact: 'Evitar 12 rupturas',
            items: 8
          },
          {
            type: 'Eliminar Stock Morto',
            impact: 'Recuperar 125.000 AOA',
            items: 15
          }
        ]
      };

      res.json(optimization);
    } catch (error) {
      console.error('Erro ao obter otimização de inventário:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const metrics = {
        inventoryAccuracy: 94.2,
        fillRate: 87.8,
        stockoutFrequency: 2.1,
        averageLeadTime: 12.5,
        inventoryTurnover: 4.8,
        carryingCost: 15.2,
        trends: {
          accuracy: 'melhorando',
          fillRate: 'estável',
          stockouts: 'melhorando'
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error('Erro ao obter métricas de performance:', error);
      res.status(500).json({ 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
