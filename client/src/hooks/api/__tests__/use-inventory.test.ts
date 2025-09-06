/**
 * Testes para hooks de inventário
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mocks
jest.mock('../../../lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  }
}));

jest.mock('../../../services/api.service', () => ({
  inventoryService: {
    getInventory: jest.fn(),
    getInventorySummary: jest.fn(),
    getInventoryMovements: jest.fn(),
    updateInventory: jest.fn(),
    createInventoryMovement: jest.fn(),
  }
}));

jest.mock('../../../config/api', () => ({
  CACHE_CONFIG: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  },
  RETRY_CONFIG: {
    retries: 3,
    retryDelay: 1000,
  }
}));

jest.mock('../../use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
  })
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  }))
}));

// Importações dos hooks e tipos
import {
  useInventory,
  useInventorySummary,
  useInventoryMovements,
  useUpdateInventory,
  useCreateInventoryMovement,
  INVENTORY_QUERY_KEYS
} from '../use-inventory';

describe('Hooks de Inventário', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve importar os hooks sem erros', () => {
    expect(useInventory).toBeDefined();
    expect(useInventorySummary).toBeDefined();
    expect(useInventoryMovements).toBeDefined();
    expect(useUpdateInventory).toBeDefined();
    expect(useCreateInventoryMovement).toBeDefined();
  });

  it('deve ter as chaves de query definidas corretamente', () => {
    expect(INVENTORY_QUERY_KEYS.all).toEqual(['inventory']);
    expect(INVENTORY_QUERY_KEYS.lists()).toEqual(['inventory', 'list']);
    expect(INVENTORY_QUERY_KEYS.list({ page: 1 })).toEqual(['inventory', 'list', { page: 1 }]);
    expect(INVENTORY_QUERY_KEYS.summary()).toEqual(['inventory', 'summary']);
    expect(INVENTORY_QUERY_KEYS.movements({ type: 'IN' })).toEqual(['inventory', 'movements', { type: 'IN' }]);
    expect(INVENTORY_QUERY_KEYS.detail('prod-1', 'warehouse-1')).toEqual(['inventory', 'detail', 'prod-1', 'warehouse-1']);
  });

  it('deve exportar as interfaces de tipos através dos hooks', () => {
    // Verificar se os hooks estão disponíveis (TypeScript compilation check)
    // Os tipos são internos ao módulo, então verificamos através dos hooks
    expect(typeof useInventory).toBe('function');
    expect(typeof useInventorySummary).toBe('function');
    expect(typeof useInventoryMovements).toBe('function');
    expect(typeof useUpdateInventory).toBe('function');
    expect(typeof useCreateInventoryMovement).toBe('function');
  });
});