/**
 * Testes para hooks de Warehouse Twin
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mocks
jest.mock('../../../lib/queryClient');
jest.mock('../../../services/api.service');
jest.mock('../../../config/api');
jest.mock('../../use-toast');

// Importações dos hooks e tipos
import {
  useWarehouseViewer,
  useSimulations,
  useRunSimulation,
  useWarehousesForTwin,
  useRefreshWarehouseViewer,
  WAREHOUSE_TWIN_QUERY_KEYS,
  type WarehouseViewer,
  type Simulation,
  type SimulationRequest,
  type SimulationResults,
  type Zone3D,
  type Equipment3D,
  type Product3D
} from '../use-warehouse-twin';

describe('Hooks de Warehouse Twin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve importar os hooks sem erros', () => {
    expect(useWarehouseViewer).toBeDefined();
    expect(useSimulations).toBeDefined();
    expect(useRunSimulation).toBeDefined();
    expect(useWarehousesForTwin).toBeDefined();
    expect(useRefreshWarehouseViewer).toBeDefined();
  });

  it('deve ter as chaves de query definidas corretamente', () => {
    expect(WAREHOUSE_TWIN_QUERY_KEYS.all).toEqual(['warehouse-twin']);
    expect(WAREHOUSE_TWIN_QUERY_KEYS.viewer('warehouse-1')).toEqual(['warehouse-twin', 'viewer', 'warehouse-1']);
    expect(WAREHOUSE_TWIN_QUERY_KEYS.simulations()).toEqual(['warehouse-twin', 'simulations']);
    expect(WAREHOUSE_TWIN_QUERY_KEYS.simulation('sim-1')).toEqual(['warehouse-twin', 'simulations', 'sim-1']);
    expect(WAREHOUSE_TWIN_QUERY_KEYS.warehouses()).toEqual(['warehouse-twin', 'warehouses']);
  });

  it('deve exportar as interfaces de tipos', () => {
    // Verificar se os tipos estão disponíveis (TypeScript compilation check)
    const warehouseViewer: WarehouseViewer = {
      id: 'test',
      warehouseId: 'warehouse-1',
      layout3D: {
        zones: [],
        equipment: [],
        products: []
      },
      realTimeData: {
        temperature: 25,
        humidity: 60,
        occupancy: 80,
        activeWorkers: 5
      },
      lastUpdated: '2024-01-01T00:00:00Z'
    };

    const simulation: Simulation = {
      id: 'sim-1',
      name: 'Test Simulation',
      type: 'layout_optimization',
      status: 'pending',
      parameters: {},
      createdAt: '2024-01-01T00:00:00Z'
    };

    const simulationRequest: SimulationRequest = {
      name: 'Test Request',
      type: 'workflow_analysis',
      warehouseId: 'warehouse-1',
      parameters: {}
    };

    const simulationResults: SimulationResults = {
      efficiency: 85,
      throughput: 100,
      bottlenecks: [],
      recommendations: [],
      metrics: {}
    };

    const zone3D: Zone3D = {
      id: 'zone-1',
      name: 'Storage Zone A',
      type: 'storage',
      position: { x: 0, y: 0, z: 0 },
      dimensions: { width: 10, height: 5, depth: 10 },
      occupancy: 75,
      capacity: 100
    };

    const equipment3D: Equipment3D = {
      id: 'eq-1',
      type: 'forklift',
      position: { x: 5, y: 0, z: 5 },
      status: 'active',
      batteryLevel: 85
    };

    const product3D: Product3D = {
      id: 'prod-1',
      productId: 'product-123',
      position: { x: 2, y: 1, z: 3 },
      quantity: 50,
      lastMoved: '2024-01-01T00:00:00Z'
    };

    expect(warehouseViewer).toBeDefined();
    expect(simulation).toBeDefined();
    expect(simulationRequest).toBeDefined();
    expect(simulationResults).toBeDefined();
    expect(zone3D).toBeDefined();
    expect(equipment3D).toBeDefined();
    expect(product3D).toBeDefined();
  });
});