/**
 * Hooks personalizados para integração com React Query
 * Este arquivo centraliza todos os hooks para interação com a API,
 * proporcionando uma interface consistente e otimizada.
 */

// Hooks disponíveis (apenas os que existem)

// Hooks de frota e utilizadores
export * from './use-fleet';
export * from './use-users';
export * from './use-warehouses';

// Re-exportar serviços da API
export { apiServices } from '../../services/api.service';
export type { ApiResponse, PaginatedResponse, QueryParams } from '../../services/api.service';