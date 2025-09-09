/**
 * Configuração centralizada da API
 * Este arquivo centraliza todas as configurações relacionadas com a API,
 * incluindo endpoints, timeouts, e configurações de ambiente.
 */

// Configurações de ambiente
interface ApiEnvironment {
  name: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  enableLogging: boolean;
}

// Configurações por ambiente
const environments: Record<string, ApiEnvironment> = {
  development: {
    name: 'Desenvolvimento',
    baseUrl: 'http://localhost:4001',
    timeout: 10000,
    retryAttempts: 3,
    enableLogging: true,
  },
  production: {
    name: 'Produção',
    baseUrl: import.meta.env.VITE_API_URL || 'https://api.sgst.ao',
    timeout: 15000,
    retryAttempts: 2,
    enableLogging: false,
  },
  staging: {
    name: 'Teste',
    baseUrl: import.meta.env.VITE_API_URL || 'https://staging-api.sgst.ao',
    timeout: 12000,
    retryAttempts: 3,
    enableLogging: true,
  },
};

// Obter ambiente atual
function getCurrentEnvironment(): string {
  return import.meta.env.MODE || 'development';
}

// Obter configuração do ambiente atual
export function getApiConfig(): ApiEnvironment {
  const currentEnv = getCurrentEnvironment();
  return environments[currentEnv] || environments.development;
}

// Obter URL base da API
export function getApiBaseUrl(): string {
  return getApiConfig().baseUrl;
}

// Endpoints da API organizados por módulo
export const API_ENDPOINTS = {
  // Autenticação
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refreshToken: '/api/auth/refresh-token',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
  },

  // Utilizadores
  users: {
    list: '/api/users',
    create: '/api/users',
    get: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
    permissions: (id: string) => `/api/users/${id}/permissions`,
  },

  // Perfis
  roles: {
    list: '/api/roles',
    create: '/api/roles',
    get: (id: string) => `/api/roles/${id}`,
    update: (id: string) => `/api/roles/${id}`,
    delete: (id: string) => `/api/roles/${id}`,
  },

  // Dashboard
  dashboard: {
    stats: '/api/dashboard/stats',
    topProducts: '/api/dashboard/top-products',
    recentActivities: '/api/dashboard/recent-activities',
  },

  // Produtos
  products: {
    list: '/api/products',
    create: '/api/products',
    get: (id: string) => `/api/products/${id}`,
    update: (id: string) => `/api/products/${id}`,
    delete: (id: string) => `/api/products/${id}`,
    activate: (id: string) => `/api/products/${id}/activate`,
    deactivate: (id: string) => `/api/products/${id}/deactivate`,
  },

  // Categorias
  categories: {
    list: '/api/categories',
    create: '/api/categories',
    get: (id: string) => `/api/categories/${id}`,
    update: (id: string) => `/api/categories/${id}`,
    delete: (id: string) => `/api/categories/${id}`,
    toggleStatus: (id: string) => `/api/categories/${id}/toggle-status`,
  },

  // Clientes
  customers: {
    list: '/api/customers',
    create: '/api/customers',
    get: (id: string) => `/api/customers/${id}`,
    update: (id: string) => `/api/customers/${id}`,
    delete: (id: string) => `/api/customers/${id}`,
    activate: (id: string) => `/api/customers/${id}/activate`,
    deactivate: (id: string) => `/api/customers/${id}/deactivate`,
  },

  // Fornecedores
  suppliers: {
    list: '/api/suppliers',
    create: '/api/suppliers',
    get: (id: string) => `/api/suppliers/${id}`,
    update: (id: string) => `/api/suppliers/${id}`,
    delete: (id: string) => `/api/suppliers/${id}`,
  },

  // Armazéns
  warehouses: {
    list: '/api/warehouses',
    create: '/api/warehouses',
    get: (id: string) => `/api/warehouses/${id}`,
    update: (id: string) => `/api/warehouses/${id}`,
    delete: (id: string) => `/api/warehouses/${id}`,
  },

  // Inventário
  inventory: {
    list: '/api/inventory',
    summary: '/api/inventory/summary',
    update: '/api/inventory/update',
    movements: '/api/inventory/stock-movements',
    createMovement: '/api/inventory/stock-movements',
  },

  // Encomendas
  orders: {
    list: '/api/orders',
    create: '/api/orders',
    get: (id: string) => `/api/orders/${id}`,
    update: (id: string) => `/api/orders/${id}`,
    delete: (id: string) => `/api/orders/${id}`,
    recent: '/api/orders/recent',
  },

  // Envios
  shipping: {
    list: '/api/shipping',
    create: '/api/shipping',
    get: (id: string) => `/api/shipping/${id}`,
    update: (id: string) => `/api/shipping/${id}`,
    delete: (id: string) => `/api/shipping/${id}`,
    track: (trackingNumber: string) => `/api/shipping/track/${trackingNumber}`,
    vehicles: {
      available: '/api/shipping/vehicles/available',
    },
  },

  // Frota
  fleet: {
    vehicles: {
      list: '/api/fleet/vehicles',
      create: '/api/fleet/vehicles',
      get: (id: string) => `/api/fleet/vehicles/${id}`,
      update: (id: string) => `/api/fleet/vehicles/${id}`,
      delete: (id: string) => `/api/fleet/vehicles/${id}`,
    },
    tracking: {
      list: '/api/fleet/tracking',
      get: (vehicleId: string) => `/api/fleet/tracking/${vehicleId}`,
      update: (vehicleId: string) => `/api/fleet/tracking/${vehicleId}`,
    },
  },

  // Picking & Packing
  picking: {
    lists: '/api/picking/lists',
    create: '/api/picking/lists',
    get: (id: string) => `/api/picking/lists/${id}`,
    start: (id: string) => `/api/picking/lists/${id}/start`,
    complete: (id: string) => `/api/picking/lists/${id}/complete`,
  },

  packing: {
    tasks: '/api/packing/tasks',
    create: '/api/packing/tasks',
    get: (id: string) => `/api/packing/tasks/${id}`,
    complete: (id: string) => `/api/packing/tasks/${id}/complete`,
  },

  // Rastreamento público
  publicTracking: {
    track: (trackingNumber: string) => `/api/public/track/${trackingNumber}`,
  },

  // Relatórios
  reports: {
    inventory: '/api/reports/inventory',
    sales: '/api/reports/sales',
    performance: '/api/reports/performance',
  },

  // Configurações
  settings: {
    modules: '/api/settings/modules',
    system: '/api/settings/system',
  },
} as const;

// Tipos para endpoints dinâmicos
export type ApiEndpoint = typeof API_ENDPOINTS;

// Configurações de cache para diferentes tipos de dados
export const CACHE_CONFIG = {
  // Dados que mudam raramente - cache longo
  static: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  },
  // Dados que mudam frequentemente - cache curto
  dynamic: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
  },
  // Dados em tempo real - sem cache
  realtime: {
    staleTime: 0,
    gcTime: 0,
  },
};

// Configurações de retry para diferentes tipos de operações
export const RETRY_CONFIG = {
  // Operações de leitura - retry mais agressivo
  read: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  // Operações de escrita - retry mais conservador
  write: {
    retry: 1,
    retryDelay: 1000,
  },
  // Operações críticas - sem retry automático
  critical: {
    retry: false,
  },
};

// Utilitários para construção de URLs
export function buildApiUrl(endpoint: string, params?: Record<string, string | number>): string {
  let url = `${getApiBaseUrl()}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      // Filtrar valores undefined, null ou vazios
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
}