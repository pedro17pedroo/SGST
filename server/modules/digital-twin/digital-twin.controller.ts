import { Request, Response } from "express";
import { DigitalTwinModel } from "./digital-twin.model";
import { insertWarehouseZoneSchema, insertWarehouseLayoutSchema, insertDigitalTwinSimulationSchema } from "@shared/schema";

export class DigitalTwinController {
  // Warehouse Zones
  static async getWarehouseZones(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const zones = await DigitalTwinModel.getWarehouseZones(warehouseId);
      res.json(zones);
    } catch (error) {
      console.error('Erro ao buscar zonas do armazém:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async createWarehouseZone(req: Request, res: Response) {
    try {
      const validatedData = insertWarehouseZoneSchema.parse(req.body);
      const zone = await DigitalTwinModel.createWarehouseZone(validatedData);
      res.status(201).json(zone);
    } catch (error: any) {
      console.error('Erro ao criar zona:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async updateWarehouseZone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const zone = await DigitalTwinModel.updateWarehouseZone(id, req.body);
      if (!zone) {
        return res.status(404).json({ message: 'Zona não encontrada' });
      }
      res.json(zone);
    } catch (error) {
      console.error('Erro ao atualizar zona:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async deleteWarehouseZone(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DigitalTwinModel.deleteWarehouseZone(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover zona:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Warehouse Layouts
  static async getWarehouseLayouts(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const layouts = await DigitalTwinModel.getWarehouseLayouts(warehouseId);
      res.json(layouts);
    } catch (error) {
      console.error('Erro ao buscar layouts:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async createWarehouseLayout(req: Request, res: Response) {
    try {
      const validatedData = insertWarehouseLayoutSchema.parse(req.body);
      const layout = await DigitalTwinModel.createWarehouseLayout(validatedData);
      res.status(201).json(layout);
    } catch (error: any) {
      console.error('Erro ao criar layout:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async updateWarehouseLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const layout = await DigitalTwinModel.updateWarehouseLayout(id, req.body);
      if (!layout) {
        return res.status(404).json({ message: 'Layout não encontrado' });
      }
      res.json(layout);
    } catch (error) {
      console.error('Erro ao atualizar layout:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async deleteWarehouseLayout(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DigitalTwinModel.deleteWarehouseLayout(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover layout:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Digital Twin Simulations
  static async getSimulations(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const simulations = await DigitalTwinModel.getSimulations(warehouseId);
      res.json(simulations);
    } catch (error) {
      console.error('Erro ao buscar simulações:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async createSimulation(req: Request, res: Response) {
    try {
      const validatedData = insertDigitalTwinSimulationSchema.parse(req.body);
      const simulation = await DigitalTwinModel.createSimulation(validatedData);
      res.status(201).json(simulation);
    } catch (error: any) {
      console.error('Erro ao criar simulação:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async getSimulationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const simulations = await DigitalTwinModel.getSimulations(''); // We'll get by ID if needed
      const simulation = simulations.find(s => s.id === id);
      
      if (!simulation) {
        return res.status(404).json({ message: 'Simulação não encontrada' });
      }
      
      res.json({ 
        id: simulation.id, 
        status: simulation.status, 
        results: simulation.results 
      });
    } catch (error) {
      console.error('Erro ao buscar status da simulação:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async runSimulation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Update status to running
      await DigitalTwinModel.updateSimulationStatus(id, 'running');
      
      // Get simulation data to determine type
      const simulations = await DigitalTwinModel.getSimulations('');
      const simulation = simulations.find(s => s.id === id);
      
      if (!simulation) {
        return res.status(404).json({ message: 'Simulação não encontrada' });
      }

      // Run simulation based on type
      let results;
      switch (simulation.type) {
        case 'picking_optimization':
          results = await DigitalTwinModel.runPickingOptimization(simulation.warehouseId, simulation.parameters);
          break;
        case 'capacity_planning':
          results = await DigitalTwinModel.runCapacityPlanning(simulation.warehouseId, simulation.parameters);
          break;
        default:
          results = { message: 'Tipo de simulação não suportado' };
      }

      // Update status to completed with results
      const updatedSimulation = await DigitalTwinModel.updateSimulationStatus(id, 'completed', results);
      
      res.json(updatedSimulation);
    } catch (error) {
      console.error('Erro ao executar simulação:', error);
      await DigitalTwinModel.updateSimulationStatus(req.params.id, 'failed');
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Real-time Visualization
  static async getRealTimeVisualization(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const visualization = await DigitalTwinModel.getRealTimeVisualization(warehouseId);
      res.json(visualization);
    } catch (error) {
      console.error('Erro ao buscar visualização:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async updateVisualization(req: Request, res: Response) {
    try {
      const visualization = await DigitalTwinModel.updateVisualization(req.body);
      res.status(201).json(visualization);
    } catch (error) {
      console.error('Erro ao atualizar visualização:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // 3D/2D Warehouse Viewer
  static async getWarehouseViewer(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      
      // Get comprehensive warehouse data for visualization
      const [zones, layouts, visualization] = await Promise.all([
        DigitalTwinModel.getWarehouseZones(warehouseId),
        DigitalTwinModel.getWarehouseLayouts(warehouseId),
        DigitalTwinModel.getRealTimeVisualization(warehouseId)
      ]);

      const viewerData = {
        zones,
        layouts: layouts[0] || null, // Get most recent layout
        realTimeData: visualization,
        metadata: {
          totalZones: zones.length,
          activeEntities: visualization.length,
          lastUpdate: new Date().toISOString()
        }
      };

      res.json(viewerData);
    } catch (error) {
      console.error('Erro ao buscar dados do visualizador:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async getHeatmapData(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const { start, end } = req.query;
      
      const timeRange = {
        start: start ? new Date(start as string) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: end ? new Date(end as string) : new Date()
      };

      const heatmapData = await DigitalTwinModel.generateHeatmapData(warehouseId, timeRange);
      res.json({
        timeRange,
        points: heatmapData,
        metadata: {
          totalPoints: heatmapData.length,
          maxIntensity: Math.max(...heatmapData.map(p => p.intensity), 0)
        }
      });
    } catch (error) {
      console.error('Erro ao gerar heatmap:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}