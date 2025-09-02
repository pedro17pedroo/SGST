import { Request, Response } from "express";
import { GreenETAModel } from "./green-eta.model";

export class GreenETAController {
  
  // Carbon Footprint Methods
  static async getCarbonMetrics(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      
      // Simulate getting shipment data and calculating metrics
      const shipmentData = {
        shipmentId,
        distance: Math.floor(Math.random() * 1000) + 100,
        weight: Math.floor(Math.random() * 50) + 5,
        warehouseDays: Math.floor(Math.random() * 5) + 1,
        transportType: ['road', 'rail', 'air'][Math.floor(Math.random() * 3)]
      };

      const metrics = await GreenETAModel.calculateCarbonFootprint(shipmentData);
      res.json(metrics);
    } catch (error) {
      console.error('Erro ao buscar métricas de carbono:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async calculateCarbonFootprint(req: Request, res: Response) {
    try {
      const shipmentData = req.body;
      const metrics = await GreenETAModel.calculateCarbonFootprint(shipmentData);
      res.json(metrics);
    } catch (error) {
      console.error('Erro ao calcular pegada de carbono:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Eco Route Optimization Methods
  static async optimizeEcoRoute(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const ecoRoute = await GreenETAModel.optimizeEcoRoute(orderId);
      res.json(ecoRoute);
    } catch (error) {
      console.error('Erro ao otimizar rota ecológica:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async consolidateShipments(req: Request, res: Response) {
    try {
      const { shipmentIds } = req.body;
      
      if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
        return res.status(400).json({ message: 'IDs de envios inválidos' });
      }

      const consolidation = await GreenETAModel.consolidateShipments(shipmentIds);
      res.json(consolidation);
    } catch (error) {
      console.error('Erro ao consolidar envios:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Sustainability Reporting Methods
  static async getSustainabilityReport(req: Request, res: Response) {
    try {
      const { start, end } = req.query;
      
      const startDate = start ? new Date(start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = end ? new Date(end as string) : new Date();

      const report = await GreenETAModel.getSustainabilityReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error('Erro ao gerar relatório de sustentabilidade:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async getCarbonSavingsReport(req: Request, res: Response) {
    try {
      const { period } = req.query;
      const months = parseInt(period as string) || 12;
      
      // Simulate carbon savings over time
      const monthlySavings = Array.from({ length: months }, (_, i) => ({
        month: new Date(Date.now() - (months - i - 1) * 30 * 24 * 60 * 60 * 1000).toISOString().substr(0, 7),
        carbonSaved: Math.floor(Math.random() * 500) + 200, // kg CO2
        costSaved: Math.floor(Math.random() * 10000) + 5000, // AOA
        optimizedShipments: Math.floor(Math.random() * 50) + 20
      }));

      const totalSavings = {
        carbonSaved: monthlySavings.reduce((sum, month) => sum + month.carbonSaved, 0),
        costSaved: monthlySavings.reduce((sum, month) => sum + month.costSaved, 0),
        optimizedShipments: monthlySavings.reduce((sum, month) => sum + month.optimizedShipments, 0),
        trend: 'crescente'
      };

      res.json({
        period: `${months} meses`,
        totalSavings,
        monthlySavings,
        projectedSavings: {
          nextMonth: {
            carbon: totalSavings.carbonSaved / months * 1.1,
            cost: totalSavings.costSaved / months * 1.1
          },
          nextYear: {
            carbon: totalSavings.carbonSaved * 1.2,
            cost: totalSavings.costSaved * 1.2
          }
        }
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de poupanças de carbono:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Green Recommendations Methods
  static async getGreenRecommendations(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const recommendations = await GreenETAModel.getGreenRecommendations(warehouseId);
      res.json(recommendations);
    } catch (error) {
      console.error('Erro ao buscar recomendações verdes:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async optimizeWarehouseSustainability(req: Request, res: Response) {
    try {
      const { warehouseId, targetReduction } = req.body;
      
      if (!warehouseId) {
        return res.status(400).json({ message: 'ID do armazém é obrigatório' });
      }

      const optimization = await GreenETAModel.optimizeWarehouseSustainability(warehouseId, targetReduction);
      res.json(optimization);
    } catch (error) {
      console.error('Erro ao otimizar sustentabilidade do armazém:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Green ETA Methods
  static async getGreenETA(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      const greenETA = await GreenETAModel.getGreenETA(shipmentId);
      res.json(greenETA);
    } catch (error) {
      console.error('Erro ao calcular Green ETA:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async optimizeGreenDelivery(req: Request, res: Response) {
    try {
      const { shipments, preferences } = req.body;
      
      if (!Array.isArray(shipments)) {
        return res.status(400).json({ message: 'Lista de envios inválida' });
      }

      // Simulate green delivery optimization
      const optimized = shipments.map(shipment => ({
        ...shipment,
        originalETA: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        greenETA: new Date(Date.now() + Math.random() * 10 * 24 * 60 * 60 * 1000),
        carbonSavings: Math.floor(Math.random() * 10) + 2,
        costImpact: Math.floor(Math.random() * 200) - 100, // Can be positive or negative
        sustainabilityScore: Math.floor(Math.random() * 40) + 60
      }));

      const summary = {
        totalShipments: optimized.length,
        totalCarbonSavings: optimized.reduce((sum, s) => sum + s.carbonSavings, 0),
        averageDelayHours: optimized.reduce((sum, s) => {
          return sum + (s.greenETA.getTime() - s.originalETA.getTime()) / (1000 * 60 * 60);
        }, 0) / optimized.length,
        recommendedOptimizations: optimized.filter(s => s.sustainabilityScore > 75).length
      };

      res.json({
        optimizedShipments: optimized,
        summary,
        recommendations: [
          'Consolidar 3 envios para Benguela numa única rota',
          'Usar transporte ferroviário para cargas pesadas',
          'Agendar entregas para horários de menor tráfego'
        ]
      });
    } catch (error) {
      console.error('Erro ao otimizar entregas verdes:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}