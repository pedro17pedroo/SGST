/**
 * Mock da configuração da API para testes
 */

export const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 10 * 60 * 1000, // 10 minutos
};

export const RETRY_CONFIG = {
  attempts: 3,
  delay: 1000,
};

export const API_ENDPOINTS = {
  public: {
    track: '/api/public/track',
  },
  customers: {
    list: '/api/customers',
    orders: '/api/customers/:id/orders',
    tracking: '/api/customers/:id/tracking',
  },
};

export const getApiConfig = () => ({
  name: 'test',
  baseUrl: 'http://localhost:4001',
  timeout: 10000,
  retryAttempts: 3,
  enableLogging: false,
});

export const getApiBaseUrl = () => 'http://localhost:4001';

export const getCurrentEnvironment = () => 'test';

export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `http://localhost:4001${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};