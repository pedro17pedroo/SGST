/**
 * Tipos e interfaces para o módulo de Tipos de Veículo
 */

// Interface para filtros de busca
export interface VehicleTypeFilters {
  name?: string;
  category?: string;
  active?: boolean;
  search?: string;
}

// Interface para resposta com paginação
export interface VehicleTypesWithPagination {
  vehicleTypes: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface para criação de tipo de veículo
export interface CreateVehicleTypeData {
  name: string;
  category: string;
  description?: string;
  active?: boolean;
}

// Interface para atualização de tipo de veículo
export interface UpdateVehicleTypeData {
  name?: string;
  category?: string;
  description?: string;
  active?: boolean;
}