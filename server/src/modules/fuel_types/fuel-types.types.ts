/**
 * Tipos e interfaces para o módulo de Tipos de Combustível
 */

// Interface para filtros de busca
export interface FuelTypeFilters {
  name?: string;
  unit?: string;
  active?: boolean;
  search?: string;
}

// Interface para resposta com paginação
export interface FuelTypesWithPagination {
  fuelTypes: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface para criação de tipo de combustível
export interface CreateFuelTypeData {
  name: string;
  unit: string;
  description?: string;
  active?: boolean;
}

// Interface para atualização de tipo de combustível
export interface UpdateFuelTypeData {
  name?: string;
  unit?: string;
  description?: string;
  active?: boolean;
}