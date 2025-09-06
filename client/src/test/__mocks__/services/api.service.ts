/**
 * Mock para api.service
 */

export const apiServices = {
  qualityControl: {
    getInspections: jest.fn(),
    getInspection: jest.fn(),
    getTests: jest.fn(),
    createInspection: jest.fn(),
    startInspection: jest.fn(),
    recordTestResult: jest.fn(),
    recordDefect: jest.fn(),
    completeInspection: jest.fn(),
    getStatistics: jest.fn(),
  },
  inventory: {
    getItems: jest.fn(),
    getItem: jest.fn(),
    updateItem: jest.fn(),
    createItem: jest.fn(),
    deleteItem: jest.fn(),
  },
  roles: {
    getRoles: jest.fn(),
    getRole: jest.fn(),
    createRole: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
    getPermissions: jest.fn(),
    assignRole: jest.fn(),
    removeRole: jest.fn(),
  },
  tracking: {
    getPublicTracking: jest.fn(),
    getCustomerPortalData: jest.fn(),
  },
  warehouseTwin: {
    getSimulations: jest.fn(),
    createSimulation: jest.fn(),
    runSimulation: jest.fn(),
  },
};

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}