/**
 * Testes básicos para hooks de tracking
 */

// import { QueryClient } from '@tanstack/react-query'; // Removed unused import

// Mock simples dos módulos necessários
jest.mock('../../../lib/queryClient', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('../../../services/api.service', () => ({
  apiServices: {
    tracking: {
      getPublicTracking: jest.fn(),
      getCustomerOrders: jest.fn(),
      getCustomerTracking: jest.fn(),
    },
  },
}));

jest.mock('../../../config/api', () => ({
  CACHE_CONFIG: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
}));

jest.mock('../use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
    toasts: [],
  }),
}));

describe('Hooks de Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve importar os hooks sem erros', async () => {
    // Teste simples de importação
    const trackingModule = await import('../use-tracking');
    
    expect(trackingModule.usePublicTracking).toBeDefined();
    expect(trackingModule.useCustomerOrders).toBeDefined();
    expect(trackingModule.useCustomerTracking).toBeDefined();
    expect(trackingModule.TRACKING_QUERY_KEYS).toBeDefined();
  });

  it('deve ter as chaves de query definidas corretamente', async () => {
    const { TRACKING_QUERY_KEYS } = await import('../use-tracking');
    
    expect(TRACKING_QUERY_KEYS.all).toEqual(['tracking']);
    expect(TRACKING_QUERY_KEYS.public()).toEqual(['tracking', 'public']);
    expect(TRACKING_QUERY_KEYS.publicTracking('TRK123')).toEqual(['tracking', 'public', 'TRK123']);
    expect(TRACKING_QUERY_KEYS.customer()).toEqual(['tracking', 'customer']);
    expect(TRACKING_QUERY_KEYS.customerOrders('customer123')).toEqual(['tracking', 'customer', 'orders', 'customer123']);
  });

  it('deve exportar as interfaces de tipos', async () => {
    // Verificar se os tipos estão disponíveis (teste de compilação)
    const trackingModule = await import('../use-tracking');
    
    // Se chegou até aqui, os tipos foram compilados corretamente
    expect(typeof trackingModule).toBe('object');
  });
});