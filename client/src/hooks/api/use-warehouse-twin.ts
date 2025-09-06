/**
 * Hook para gestão do Warehouse Twin e simulações
 * Centraliza operações de visualização 3D e simulações de armazém
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiServices } from '../../services/api.service'; // Removido - não utilizado
// import type { QueryParams, ApiResponse } from '../../services/api.service';
import { CACHE_CONFIG } from '../../config/api';
import { useToast } from '../use-toast';

// Tipos para Warehouse Twin
export interface WarehouseViewer {
  id: string;
  warehouseId: string;
  layout3D: {
    zones: Zone3D[];
    equipment: Equipment3D[];
    products: Product3D[];
  };
  realTimeData: {
    temperature: number;
    humidity: number;
    occupancy: number;
    activeWorkers: number;
  };
  lastUpdated: string;
}

export interface Zone3D {
  id: string;
  name: string;
  type: 'storage' | 'picking' | 'packing' | 'shipping';
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  occupancy: number;
  capacity: number;
}

export interface Equipment3D {
  id: string;
  type: 'forklift' | 'conveyor' | 'robot' | 'scanner';
  position: { x: number; y: number; z: number };
  status: 'active' | 'idle' | 'maintenance';
  batteryLevel?: number;
}

export interface Product3D {
  id: string;
  productId: string;
  position: { x: number; y: number; z: number };
  quantity: number;
  lastMoved: string;
}

export interface Simulation {
  id: string;
  name: string;
  type: 'layout_optimization' | 'workflow_analysis' | 'capacity_planning';
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters: Record<string, any>;
  results?: SimulationResults;
  createdAt: string;
  completedAt?: string;
}

export interface SimulationResults {
  efficiency: number;
  throughput: number;
  bottlenecks: string[];
  recommendations: string[];
  metrics: Record<string, number>;
}

export interface SimulationRequest {
  name: string;
  type: 'layout_optimization' | 'workflow_analysis' | 'capacity_planning';
  warehouseId: string;
  parameters: Record<string, any>;
}

// Chaves de query para cache
export const WAREHOUSE_TWIN_QUERY_KEYS = {
  all: ['warehouse-twin'] as const,
  viewer: (warehouseId: string) => [...WAREHOUSE_TWIN_QUERY_KEYS.all, 'viewer', warehouseId] as const,
  simulations: () => [...WAREHOUSE_TWIN_QUERY_KEYS.all, 'simulations'] as const,
  simulation: (id: string) => [...WAREHOUSE_TWIN_QUERY_KEYS.simulations(), id] as const,
  warehouses: () => [...WAREHOUSE_TWIN_QUERY_KEYS.all, 'warehouses'] as const,
};

/**
 * Hook para obter dados do visualizador 3D do armazém
 */
export function useWarehouseViewer(warehouseId: string) {
  const { toast } = useToast();

  return useQuery<WarehouseViewer, Error>({
    queryKey: WAREHOUSE_TWIN_QUERY_KEYS.viewer(warehouseId),
    queryFn: async () => {
      // Simular dados do visualizador 3D
      return {
        id: `viewer-${warehouseId}`,
        warehouseId,
        layout3D: {
          zones: [
            {
              id: 'zone-1',
              name: 'Zona de Armazenamento A',
              type: 'storage',
              position: { x: 0, y: 0, z: 0 },
              dimensions: { width: 20, height: 8, depth: 15 },
              occupancy: 75,
              capacity: 100,
            },
            {
              id: 'zone-2',
              name: 'Zona de Picking',
              type: 'picking',
              position: { x: 25, y: 0, z: 0 },
              dimensions: { width: 15, height: 6, depth: 10 },
              occupancy: 60,
              capacity: 80,
            },
          ],
          equipment: [
            {
              id: 'forklift-1',
              type: 'forklift',
              position: { x: 10, y: 0, z: 5 },
              status: 'active',
              batteryLevel: 85,
            },
          ],
          products: [
            {
              id: 'product-loc-1',
              productId: 'prod-123',
              position: { x: 5, y: 2, z: 3 },
              quantity: 50,
              lastMoved: new Date().toISOString(),
            },
          ],
        },
        realTimeData: {
          temperature: 22.5,
          humidity: 45,
          occupancy: 68,
          activeWorkers: 12,
        },
        lastUpdated: new Date().toISOString(),
      };
    },
    enabled: !!warehouseId,
    staleTime: 30000, // 30 segundos para dados em tempo real
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: (_error: Error) => {
        toast({
          title: 'Erro no Warehouse Twin',
          description: 'Não foi possível carregar o visualizador 3D.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para listar simulações
 */
export function useSimulations() {
  const { toast } = useToast();

  return useQuery<Simulation[], Error>({
    queryKey: WAREHOUSE_TWIN_QUERY_KEYS.simulations(),
    queryFn: async () => {
      // Simular dados de simulações
      return [
        {
          id: 'sim-1',
          name: 'Otimização de Layout - Armazém Principal',
          type: 'layout_optimization',
          status: 'completed',
          parameters: {
            warehouseId: 'warehouse-1',
            optimizationGoal: 'efficiency',
          },
          results: {
            efficiency: 85,
            throughput: 120,
            bottlenecks: ['Zona de Picking'],
            recommendations: ['Aumentar zona de picking em 20%'],
            metrics: {
              timeReduction: 15,
              costSavings: 8500,
            },
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 82800000).toISOString(),
        },
        {
          id: 'sim-2',
          name: 'Análise de Fluxo de Trabalho',
          type: 'workflow_analysis',
          status: 'running',
          parameters: {
            warehouseId: 'warehouse-1',
            timeframe: '30days',
          },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    },
    staleTime: CACHE_CONFIG.dynamic.staleTime,
    gcTime: CACHE_CONFIG.dynamic.gcTime,
    retry: 2,
    meta: {
      onError: (_error: Error) => {
        toast({
          title: 'Erro ao carregar simulações',
          description: 'Não foi possível carregar a lista de simulações.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para executar simulação
 */
export function useRunSimulation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Simulation, Error, SimulationRequest>({
    mutationFn: async (simulationData) => {
      // Simular execução de simulação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSimulation: Simulation = {
        id: `sim-${Date.now()}`,
        name: simulationData.name,
        type: simulationData.type,
        status: 'running',
        parameters: simulationData.parameters,
        createdAt: new Date().toISOString(),
      };
      
      return newSimulation;
    },
    onSuccess: (newSimulation) => {
      // Atualizar cache de simulações
      queryClient.setQueryData<Simulation[]>(
        WAREHOUSE_TWIN_QUERY_KEYS.simulations(),
        (oldData) => oldData ? [newSimulation, ...oldData] : [newSimulation]
      );
      
      toast({
        title: 'Simulação iniciada',
        description: `${newSimulation.name} foi iniciada com sucesso.`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao executar simulação',
        description: error.message || 'Não foi possível iniciar a simulação.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para obter lista de armazéns disponíveis
 */
export function useWarehousesForTwin() {
  const { toast } = useToast();

  return useQuery<any[], Error>({
    queryKey: WAREHOUSE_TWIN_QUERY_KEYS.warehouses(),
    queryFn: async () => {
      // Simular dados de armazéns
      return [
        {
          id: 'warehouse-1',
          name: 'Armazém Principal - Luanda',
          location: 'Luanda, Angola',
          size: 'large',
          has3DModel: true,
        },
        {
          id: 'warehouse-2',
          name: 'Centro de Distribuição - Benguela',
          location: 'Benguela, Angola',
          size: 'medium',
          has3DModel: false,
        },
      ];
    },
    staleTime: CACHE_CONFIG.static.staleTime,
    gcTime: CACHE_CONFIG.static.gcTime,
    retry: 2,
    meta: {
      onError: (_error: Error) => {
        toast({
          title: 'Erro ao carregar armazéns',
          description: 'Não foi possível carregar a lista de armazéns.',
          variant: 'destructive',
        });
      },
    },
  });
}

/**
 * Hook para atualizar dados em tempo real do visualizador
 */
export function useRefreshWarehouseViewer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return {
    refreshViewer: (warehouseId: string) => {
      queryClient.invalidateQueries({ 
        queryKey: WAREHOUSE_TWIN_QUERY_KEYS.viewer(warehouseId) 
      });
      
      toast({
        title: 'Atualizando visualizador',
        description: 'Carregando dados mais recentes...',
      });
    },
    
    refreshSimulations: () => {
      queryClient.invalidateQueries({ 
        queryKey: WAREHOUSE_TWIN_QUERY_KEYS.simulations() 
      });
    },
  };
}