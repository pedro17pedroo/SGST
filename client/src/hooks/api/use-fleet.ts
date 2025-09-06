/**
 * Hook para gestão de frota
 * Centraliza todas as operações relacionadas com veículos e atribuições
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetService } from '../../services/api.service';
import type { QueryParams } from '../../services/api.service';
import { useToast } from '../use-toast';

// Chaves de consulta para cache
export const FLEET_QUERY_KEYS = {
  vehicles: (params?: QueryParams) => ['fleet', 'vehicles', params],
  vehicle: (id: string) => ['fleet', 'vehicle', id],
  assignments: () => ['fleet', 'assignments'],
  vehicleLocations: () => ['fleet', 'vehicle-locations'],
} as const;

/**
 * Hook para obter lista de veículos
 */
export function useVehicles(params?: QueryParams) {
  return useQuery({
    queryKey: FLEET_QUERY_KEYS.vehicles(params),
    queryFn: () => fleetService.getVehicles(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obter veículo específico
 */
export function useVehicle(id: string) {
  return useQuery({
    queryKey: FLEET_QUERY_KEYS.vehicle(id),
    queryFn: () => fleetService.getVehicle(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obter atribuições de veículos
 */
export function useVehicleAssignments() {
  return useQuery({
    queryKey: FLEET_QUERY_KEYS.assignments(),
    queryFn: () => fleetService.getVehicleAssignments(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obter localizações de todos os veículos
 */
export function useVehicleLocations() {
  return useQuery({
    queryKey: FLEET_QUERY_KEYS.vehicleLocations(),
    queryFn: () => fleetService.getAllVehicleLocations(),
    staleTime: 30 * 1000, // 30 segundos (dados GPS são mais dinâmicos)
    refetchInterval: 60 * 1000, // Atualizar a cada minuto
  });
}

/**
 * Hook para criar veículo
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: fleetService.createVehicle,
    onSuccess: () => {
      // Invalidar cache de veículos
      queryClient.invalidateQueries({ queryKey: ['fleet', 'vehicles'] });
      
      toast({
        title: 'Sucesso',
        description: 'Veículo criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar veículo.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar veículo
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      fleetService.updateVehicle(id, data),
    onSuccess: (data, variables) => {
      // Atualizar cache específico do veículo
      queryClient.setQueryData(
        FLEET_QUERY_KEYS.vehicle(variables.id),
        data
      );
      
      // Invalidar lista de veículos
      queryClient.invalidateQueries({ queryKey: ['fleet', 'vehicles'] });
      
      toast({
        title: 'Sucesso',
        description: 'Veículo atualizado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar veículo.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para eliminar veículo
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: fleetService.deleteVehicle,
    onSuccess: (_, vehicleId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: FLEET_QUERY_KEYS.vehicle(vehicleId) });
      
      // Invalidar lista de veículos
      queryClient.invalidateQueries({ queryKey: ['fleet', 'vehicles'] });
      
      toast({
        title: 'Sucesso',
        description: 'Veículo eliminado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao eliminar veículo.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para criar atribuição de veículo
 */
export function useCreateVehicleAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: fleetService.createVehicleAssignment,
    onSuccess: () => {
      // Invalidar cache de atribuições
      queryClient.invalidateQueries({ queryKey: FLEET_QUERY_KEYS.assignments() });
      
      // Invalidar cache de veículos (status pode ter mudado)
      queryClient.invalidateQueries({ queryKey: ['fleet', 'vehicles'] });
      
      toast({
        title: 'Sucesso',
        description: 'Atribuição criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar atribuição.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook para atualizar localização GPS do veículo
 */
export function useUpdateVehicleLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, locationData }: { vehicleId: string; locationData: any }) => 
      fleetService.updateVehicleLocation(vehicleId, locationData),
    onSuccess: (data, variables) => {
      // Atualizar cache do veículo específico
      queryClient.setQueryData(
        FLEET_QUERY_KEYS.vehicle(variables.vehicleId),
        (oldData: any) => {
          if (!oldData) return data;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              currentLocation: variables.locationData,
              lastGpsUpdate: new Date().toISOString(),
            },
          };
        }
      );
      
      // Invalidar lista de veículos para atualizar localizações
      queryClient.invalidateQueries({ queryKey: ['fleet', 'vehicles'] });
    },
    // Não mostrar toast para atualizações de localização (muito frequentes)
  });
}