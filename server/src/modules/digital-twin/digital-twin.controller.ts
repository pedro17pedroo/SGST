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
      
      // Dados de exemplo para demonstração
      const mockZones = [
        {
          id: 'zone-1',
          name: 'Zona de Recebimento',
          type: 'receiving',
          coordinates: {
            x: 10,
            y: 10,
            width: 50,
            height: 30,
            z: 0,
            floor: 1
          },
          capacity: {
            maxItems: 1000,
            maxWeight: 5000,
            maxVolume: 2000
          },
          currentUtilization: {
            items: 750,
            weight: 3500,
            volume: 1400,
            percentage: 75
          }
        },
        {
          id: 'zone-2',
          name: 'Zona de Armazenamento A',
          type: 'storage',
          coordinates: {
            x: 70,
            y: 10,
            width: 80,
            height: 60,
            z: 0,
            floor: 1
          },
          capacity: {
            maxItems: 2000,
            maxWeight: 10000,
            maxVolume: 4000
          },
          currentUtilization: {
            items: 1600,
            weight: 8000,
            volume: 3200,
            percentage: 80
          }
        },
        {
          id: 'zone-3',
          name: 'Zona de Picking',
          type: 'picking',
          coordinates: {
            x: 160,
            y: 10,
            width: 60,
            height: 40,
            z: 0,
            floor: 1
          },
          capacity: {
            maxItems: 800,
            maxWeight: 3000,
            maxVolume: 1500
          },
          currentUtilization: {
            items: 480,
            weight: 1800,
            volume: 900,
            percentage: 60
          }
        },
        {
          id: 'zone-4',
          name: 'Zona de Expedição',
          type: 'shipping',
          coordinates: {
            x: 230,
            y: 10,
            width: 50,
            height: 30,
            z: 0,
            floor: 1
          },
          capacity: {
            maxItems: 500,
            maxWeight: 2000,
            maxVolume: 1000
          },
          currentUtilization: {
            items: 200,
            weight: 800,
            volume: 400,
            percentage: 40
          }
        }
      ];

      const mockRealTimeData = [
        {
          id: 'entity-1',
          type: 'forklift',
          position: { x: 45, y: 25 },
          status: 'moving',
          operator: 'João Silva'
        },
        {
          id: 'entity-2',
          type: 'worker',
          position: { x: 180, y: 30 },
          status: 'picking',
          operator: 'Maria Santos'
        },
        {
          id: 'entity-3',
          type: 'agv',
          position: { x: 120, y: 40 },
          status: 'transporting',
          operator: 'AGV-001'
        }
      ];

      const viewerData = {
        zones: mockZones,
        layouts: {
          id: 'layout-1',
          layoutName: 'Layout Principal',
          version: '1.0',
          layoutData: JSON.stringify({
            width: 300,
            height: 80,
            zones: mockZones.length
          }),
          dimensions: JSON.stringify({ width: 300, height: 80, depth: 10 }),
          isActive: true,
          createdAt: new Date().toISOString()
        },
        realTimeData: mockRealTimeData,
        metadata: {
          totalZones: mockZones.length,
          activeEntities: mockRealTimeData.length,
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