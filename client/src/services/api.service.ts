/**
 * Serviço centralizado para todas as requisições API
 * Este arquivo organiza todas as chamadas da API por módulos,
 * proporcionando uma interface consistente e reutilizável.
 */

import { apiRequest } from '../lib/queryClient';
import { API_ENDPOINTS, buildApiUrl } from '../config/api';

// Tipos base para respostas da API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Tipos para parâmetros de consulta
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

// Utilitário para processar respostas
async function processResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  return data;
}

// === SERVIÇOS DE AUTENTICAÇÃO ===
export const authService = {
  /**
   * Realizar login do utilizador
   */
  async login(credentials: { email: string; password: string }) {
    // O servidor espera 'username' mas o frontend usa 'email'
    const loginData = {
      username: credentials.email,
      password: credentials.password
    };
    const response = await apiRequest('POST', API_ENDPOINTS.auth.login, loginData);
    return processResponse<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>(response);
  },

  /**
   * Realizar logout do utilizador
   */
  async logout() {
    const response = await apiRequest('POST', API_ENDPOINTS.auth.logout);
    return processResponse<ApiResponse>(response);
  },

  /**
   * Renovar token de acesso
   */
  async refreshToken(refreshToken: string) {
    const response = await apiRequest('POST', API_ENDPOINTS.auth.refreshToken, { refreshToken });
    return processResponse<ApiResponse<{ accessToken: string; refreshToken: string }>>(response);
  },

  /**
   * Obter perfil do utilizador
   */
  async getProfile() {
    const response = await apiRequest('GET', API_ENDPOINTS.auth.profile);
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE DASHBOARD ===
export const dashboardService = {
  /**
   * Obter estatísticas do dashboard
   */
  async getStats() {
    const response = await apiRequest('GET', API_ENDPOINTS.dashboard.stats);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Obter produtos mais vendidos
   */
  async getTopProducts() {
    const response = await apiRequest('GET', API_ENDPOINTS.dashboard.topProducts);
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Obter atividades recentes
   */
  async getRecentActivities() {
    const response = await apiRequest('GET', API_ENDPOINTS.dashboard.recentActivities);
    return processResponse<ApiResponse<any[]>>(response);
  },
};

// === SERVIÇOS DE PRODUTOS ===
export const productsService = {
  /**
   * Listar produtos com paginação e filtros
   */
  async getProducts(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.products.list, params);
    const response = await apiRequest('GET', url);
    const data = await response.json();
    
    // A API retorna um array direto, então precisamos envolver em uma estrutura PaginatedResponse
    if (Array.isArray(data)) {
      const page = params?.page || 1;
      const limit = params?.limit || 5;
      const total = data.length;
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: data,
        success: true,
        message: 'Produtos carregados com sucesso',
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      } as PaginatedResponse<any>;
    }
    
    // Se já vier no formato correto, retorna como está
    return data as PaginatedResponse<any>;
  },

  /**
   * Obter produto por ID
   */
  async getProduct(id: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.products.get(id));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo produto
   */
  async createProduct(productData: any) {
    const response = await apiRequest('POST', API_ENDPOINTS.products.create, productData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar produto
   */
  async updateProduct(id: string, productData: any) {
    const response = await apiRequest('PUT', API_ENDPOINTS.products.update(id), productData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar produto
   */
  async deleteProduct(id: string) {
    const response = await apiRequest('DELETE', API_ENDPOINTS.products.delete(id));
    return processResponse<ApiResponse>(response);
  },

  /**
   * Ativar produto
   */
  async activateProduct(id: string) {
    const response = await apiRequest('PATCH', API_ENDPOINTS.products.activate(id));
    return processResponse<{ success: boolean; message: string; product: any }>(response);
  },

  /**
   * Desativar produto
   */
  async deactivateProduct(id: string) {
    const response = await apiRequest('PATCH', API_ENDPOINTS.products.deactivate(id));
    return processResponse<{ success: boolean; message: string; product: any }>(response);
  },
};

// === SERVIÇOS DE CATEGORIAS ===
export const categoriesService = {
  /**
   * Listar categorias
   */
  async getCategories(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.categories.list, params);
    const response = await apiRequest('GET', url);
    return processResponse<PaginatedResponse<any>>(response);
  },

  /**
   * Obter categoria por ID
   */
  async getCategory(id: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.categories.get(id));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar nova categoria
   */
  async createCategory(categoryData: any) {
    const response = await apiRequest('POST', API_ENDPOINTS.categories.create, categoryData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar categoria
   */
  async updateCategory(id: string, categoryData: any) {
    const response = await apiRequest('PUT', API_ENDPOINTS.categories.update(id), categoryData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar categoria
   */
  async deleteCategory(id: string) {
    const response = await apiRequest('DELETE', API_ENDPOINTS.categories.delete(id));
    return processResponse<ApiResponse>(response);
  },

  /**
   * Alternar status da categoria (ativar/desativar)
   */
  async toggleCategoryStatus(id: string) {
    const response = await apiRequest('PATCH', API_ENDPOINTS.categories.toggleStatus(id));
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE CLIENTES ===
export const customersService = {
  /**
   * Listar clientes
   */
  async getCustomers(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.customers.list, params);
    const response = await apiRequest('GET', url);
    const data = await processResponse<any[]>(response);
    
    // A API retorna um array direto, então vamos envolver em uma estrutura compatível
    return {
      success: true,
      data: data,
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        totalPages: 1
      }
    };
  },

  /**
   * Obter cliente por ID
   */
  async getCustomer(id: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.customers.get(id));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo cliente
   */
  async createCustomer(customerData: any) {
    const response = await apiRequest('POST', API_ENDPOINTS.customers.create, customerData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar cliente
   */
  async updateCustomer(id: string, customerData: any) {
    const response = await apiRequest('PUT', API_ENDPOINTS.customers.update(id), customerData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar cliente
   */
  async deleteCustomer(id: string) {
    const response = await apiRequest('DELETE', API_ENDPOINTS.customers.delete(id));
    return processResponse<ApiResponse>(response);
  },

  /**
   * Ativar cliente
   */
  async activateCustomer(id: string) {
    const response = await apiRequest('PUT', API_ENDPOINTS.customers.activate(id));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Desativar cliente
   */
  async deactivateCustomer(id: string) {
    const response = await apiRequest('PUT', API_ENDPOINTS.customers.deactivate(id));
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE FORNECEDORES ===
export const suppliersService = {
  /**
   * Listar fornecedores
   */
  async getSuppliers(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.suppliers.list, params);
    const response = await apiRequest('GET', url);
    return processResponse<PaginatedResponse<any>>(response);
  },

  /**
   * Obter fornecedor por ID
   */
  async getSupplier(id: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.suppliers.get(id));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo fornecedor
   */
  async createSupplier(supplierData: any) {
    console.log('suppliersService.createSupplier - Dados recebidos:', supplierData);
    console.log('suppliersService.createSupplier - Endpoint:', API_ENDPOINTS.suppliers.create);
    
    try {
      const response = await apiRequest('POST', API_ENDPOINTS.suppliers.create, supplierData);
      console.log('suppliersService.createSupplier - Resposta bruta:', response);
      
      const processedResponse = processResponse<ApiResponse<any>>(response);
      console.log('suppliersService.createSupplier - Resposta processada:', processedResponse);
      
      return processedResponse;
    } catch (error) {
      console.error('suppliersService.createSupplier - Erro:', error);
      throw error;
    }
  },

  /**
   * Atualizar fornecedor
   */
  async updateSupplier(id: string, supplierData: any) {
    const response = await apiRequest('PUT', API_ENDPOINTS.suppliers.update(id), supplierData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar fornecedor
   */
  async deleteSupplier(id: string) {
    const response = await apiRequest('DELETE', API_ENDPOINTS.suppliers.delete(id));
    return processResponse<ApiResponse>(response);
  },
};

// === SERVIÇOS DE INVENTÁRIO ===
export const inventoryService = {
  /**
   * Listar inventário
   */
  async getInventory(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.inventory.list, params);
    const response = await apiRequest('GET', url);
    return processResponse<PaginatedResponse<any>>(response);
  },

  /**
   * Obter resumo do inventário
   */
  async getInventorySummary() {
    const response = await apiRequest('GET', API_ENDPOINTS.inventory.summary);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar inventário
   */
  async updateInventory(updateData: any) {
    const response = await apiRequest('POST', API_ENDPOINTS.inventory.update, updateData);
    return processResponse<ApiResponse>(response);
  },

  /**
   * Obter movimentos de inventário
   */
  async getInventoryMovements(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.inventory.movements, params);
    const response = await apiRequest('GET', url);
    return processResponse<PaginatedResponse<any>>(response);
  },

  /**
   * Criar movimento de inventário
   */
  async createInventoryMovement(movementData: any) {
    const response = await apiRequest('POST', API_ENDPOINTS.inventory.createMovement, movementData);
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE ENCOMENDAS ===
export const ordersService = {
  /**
   * Listar encomendas
   */
  async getOrders(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.orders.list, params);
    const response = await apiRequest('GET', url);
    return processResponse<PaginatedResponse<any>>(response);
  },

  /**
   * Obter encomenda por ID
   */
  async getOrder(id: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.orders.get(id));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar nova encomenda
   */
  async createOrder(orderData: any) {
    const response = await apiRequest('POST', API_ENDPOINTS.orders.create, orderData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar encomenda
   */
  async updateOrder(id: string, orderData: any) {
    const response = await apiRequest('PUT', API_ENDPOINTS.orders.update(id), orderData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar encomenda
   */
  async deleteOrder(id: string) {
    const response = await apiRequest('DELETE', API_ENDPOINTS.orders.delete(id));
    return processResponse<ApiResponse>(response);
  },

  /**
   * Obter encomendas recentes
   */
  async getRecentOrders() {
    const response = await apiRequest('GET', API_ENDPOINTS.orders.recent);
    return processResponse<ApiResponse<any[]>>(response);
  },
};

// === SERVIÇOS DE ENVIOS ===
export const shippingService = {
  /**
   * Listar envios
   */
  async getShipments(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.shipping.list, params);
    const response = await apiRequest('GET', url);
    return processResponse<PaginatedResponse<any>>(response);
  },

  /**
   * Obter envio por ID
   */
  async getShipment(id: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.shipping.get(id));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo envio
   */
  async createShipment(shipmentData: any) {
    const response = await apiRequest('POST', API_ENDPOINTS.shipping.create, shipmentData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar envio
   */
  async updateShipment(id: string, shipmentData: any) {
    const response = await apiRequest('PUT', API_ENDPOINTS.shipping.update(id), shipmentData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Rastrear envio
   */
  async trackShipment(trackingNumber: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.shipping.track(trackingNumber));
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Obter veículos disponíveis
   */
  async getAvailableVehicles() {
    const response = await apiRequest('GET', API_ENDPOINTS.shipping.vehicles.available);
    return processResponse<ApiResponse<any[]>>(response);
  },
};

// === SERVIÇOS DE RASTREAMENTO PÚBLICO ===
export const publicTrackingService = {
  /**
   * Rastrear encomenda publicamente
   */
  async trackOrder(trackingNumber: string) {
    const response = await apiRequest('GET', API_ENDPOINTS.publicTracking.track(trackingNumber));
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE RELATÓRIOS ===
export const reportsService = {
  /**
   * Obter relatório de inventário
   */
  async getInventoryReport(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.reports.inventory, params);
    const response = await apiRequest('GET', url);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Obter relatório de vendas
   */
  async getSalesReport(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.reports.sales, params);
    const response = await apiRequest('GET', url);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Obter relatório de performance
   */
  async getPerformanceReport(params?: QueryParams) {
    const url = buildApiUrl(API_ENDPOINTS.reports.performance, params);
    const response = await apiRequest('GET', url);
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE FROTA ===
export const fleetService = {
  /**
   * Obter lista de veículos
   */
  async getVehicles(params?: QueryParams) {
    const response = await apiRequest('GET', buildApiUrl('/api/fleet/vehicles', params));
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Obter veículo específico
   */
  async getVehicle(id: string) {
    const response = await apiRequest('GET', `/api/fleet/vehicles/${id}`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo veículo
   */
  async createVehicle(vehicleData: any) {
    const response = await apiRequest('POST', '/api/fleet/vehicles', vehicleData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar veículo
   */
  async updateVehicle(id: string, vehicleData: any) {
    const response = await apiRequest('PUT', `/api/fleet/vehicles/${id}`, vehicleData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar veículo
   */
  async deleteVehicle(id: string) {
    const response = await apiRequest('DELETE', `/api/fleet/vehicles/${id}`);
    return processResponse<ApiResponse>(response);
  },

  /**
   * Obter atribuições de veículos
   */
  async getVehicleAssignments() {
    const response = await apiRequest('GET', '/api/fleet/assignments');
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Criar atribuição de veículo
   */
  async createVehicleAssignment(assignmentData: any) {
    const response = await apiRequest('POST', '/api/fleet/assignments', assignmentData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar localização GPS do veículo
   */
  async updateVehicleLocation(vehicleId: string, locationData: any) {
    const response = await apiRequest('PUT', `/api/fleet/vehicles/${vehicleId}/location`, locationData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Obter localizações de todos os veículos
   */
  async getAllVehicleLocations() {
    const response = await apiRequest('GET', '/api/fleet/vehicles/locations/all');
    return processResponse<ApiResponse<any[]>>(response);
  },
};

// === SERVIÇOS DE UTILIZADORES ===
export const usersService = {
  /**
   * Obter lista de utilizadores
   */
  async getUsers(params?: QueryParams) {
    const response = await apiRequest('GET', buildApiUrl('/api/users', params));
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Obter utilizador específico
   */
  async getUser(id: string) {
    const response = await apiRequest('GET', `/api/users/${id}`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo utilizador
   */
  async createUser(userData: any) {
    const response = await apiRequest('POST', '/api/users', userData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar utilizador
   */
  async updateUser(id: string, userData: any) {
    const response = await apiRequest('PUT', `/api/users/${id}`, userData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar utilizador
   */
  async deleteUser(id: string) {
    const response = await apiRequest('DELETE', `/api/users/${id}`);
    return processResponse<ApiResponse>(response);
  },

  /**
   * Obter utilizadores por função
   */
  async getUsersByRole(role: string) {
    const response = await apiRequest('GET', `/api/users?role=${role}`);
    return processResponse<ApiResponse<any[]>>(response);
  },
};

// === SERVIÇOS DE ARMAZÉNS ===
export const warehousesService = {
  /**
   * Obter lista de armazéns
   */
  async getWarehouses(params?: QueryParams) {
    const response = await apiRequest('GET', buildApiUrl('/api/warehouses', params));
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Obter armazém específico
   */
  async getWarehouse(id: string) {
    const response = await apiRequest('GET', `/api/warehouses/${id}`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo armazém
   */
  async createWarehouse(warehouseData: any) {
    const response = await apiRequest('POST', '/api/warehouses', warehouseData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar armazém
   */
  async updateWarehouse(id: string, warehouseData: any) {
    const response = await apiRequest('PUT', `/api/warehouses/${id}`, warehouseData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar armazém
   */
  async deleteWarehouse(id: string) {
    const response = await apiRequest('DELETE', `/api/warehouses/${id}`);
    return processResponse<ApiResponse>(response);
  },
};

// === SERVIÇOS DE QUALIDADE ===
export const qualityService = {
  /**
   * Obter controlos de qualidade
   */
  async getQualityControls(params?: QueryParams) {
    const response = await apiRequest('GET', buildApiUrl('/api/quality/controls', params));
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Criar controlo de qualidade
   */
  async createQualityControl(controlData: any) {
    const response = await apiRequest('POST', '/api/quality/controls', controlData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar controlo de qualidade
   */
  async updateQualityControl(id: string, controlData: any) {
    const response = await apiRequest('PUT', `/api/quality/controls/${id}`, controlData);
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE DEVOLUÇÕES ===
export const returnsService = {
  /**
   * Obter devoluções
   */
  async getReturns(params?: QueryParams) {
    const response = await apiRequest('GET', buildApiUrl('/api/returns', params));
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Criar devolução
   */
  async createReturn(returnData: any) {
    const response = await apiRequest('POST', '/api/returns', returnData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar devolução
   */
  async updateReturn(id: string, returnData: any) {
    const response = await apiRequest('PUT', `/api/returns/${id}`, returnData);
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE MÓDULOS ===
export const modulesService = {
  /**
   * Obter módulos disponíveis
   */
  async getModules() {
    const response = await apiRequest('GET', '/api/modules');
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Atualizar configuração de módulo
   */
  async updateModuleConfig(moduleId: string, config: any) {
    const response = await apiRequest('PUT', `/api/modules/${moduleId}/config`, config);
    return processResponse<ApiResponse<any>>(response);
  },
};

// === SERVIÇOS DE FUNÇÕES E PERMISSÕES ===
export const batchesService = {
  /**
   * Obter lista de lotes
   */
  async getBatches(params?: QueryParams) {
    const response = await apiRequest('GET', buildApiUrl('/api/batches', params));
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Obter lote específico
   */
  async getBatch(id: string) {
    const response = await apiRequest('GET', `/api/batches/${id}`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo lote
   */
  async createBatch(batchData: any) {
    const response = await apiRequest('POST', '/api/batches', batchData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar lote
   */
  async updateBatch(id: string, batchData: any) {
    const response = await apiRequest('PUT', `/api/batches/${id}`, batchData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Deletar lote
   */
  async deleteBatch(id: string) {
    const response = await apiRequest('DELETE', `/api/batches/${id}`);
    return processResponse<ApiResponse>(response);
  },

  /**
   * Obter lotes próximos do vencimento
   */
  async getExpiringBatches(days: number = 30) {
    const response = await apiRequest('GET', buildApiUrl('/api/batches/expiring', { days }));
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Obter lotes por produto
   */
  async getBatchesByProduct(productId: string) {
    const response = await apiRequest('GET', `/api/batches/product/${productId}`);
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Obter lotes por armazém
   */
  async getBatchesByWarehouse(warehouseId: string) {
    const response = await apiRequest('GET', `/api/batches/warehouse/${warehouseId}`);
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Atualizar status de qualidade do lote
   */
  async updateBatchQuality(id: string, qualityData: any) {
    const response = await apiRequest('PUT', `/api/batches/${id}/quality`, qualityData);
    return processResponse<ApiResponse<any>>(response);
  },
};

export const rolesService = {
  /**
   * Obter funções
   */
  async getRoles() {
    const response = await apiRequest('GET', '/api/roles');
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Criar função
   */
  async createRole(roleData: any) {
    const response = await apiRequest('POST', '/api/roles', roleData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar função
   */
  async updateRole(id: string, roleData: any) {
    const response = await apiRequest('PUT', `/api/roles/${id}`, roleData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Obter permissões
   */
  async getPermissions() {
    const response = await apiRequest('GET', '/api/permissions');
    return processResponse<ApiResponse<any[]>>(response);
  },
};

// === SERVIÇOS DE ALERTAS ===
export const alertsService = {
  /**
   * Obter todos os alertas
   */
  async getAlerts(params?: QueryParams) {
    const url = buildApiUrl('/api/alerts', params);
    const response = await apiRequest('GET', url);
    return processResponse<PaginatedResponse<any>>(response);
  },

  /**
   * Obter alerta por ID
   */
  async getAlert(id: string) {
    const response = await apiRequest('GET', `/api/alerts/${id}`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Criar novo alerta
   */
  async createAlert(alertData: any) {
    const response = await apiRequest('POST', '/api/alerts', alertData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Atualizar alerta
   */
  async updateAlert(id: string, alertData: any) {
    const response = await apiRequest('PUT', `/api/alerts/${id}`, alertData);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Reconhecer alerta
   */
  async acknowledgeAlert(id: string) {
    const response = await apiRequest('POST', `/api/alerts/${id}/acknowledge`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Resolver alerta
   */
  async resolveAlert(id: string) {
    const response = await apiRequest('POST', `/api/alerts/${id}/resolve`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Descartar alerta
   */
  async dismissAlert(id: string) {
    const response = await apiRequest('POST', `/api/alerts/${id}/dismiss`);
    return processResponse<ApiResponse<any>>(response);
  },

  /**
   * Eliminar alerta
   */
  async deleteAlert(id: string) {
    const response = await apiRequest('DELETE', `/api/alerts/${id}`);
    return processResponse<ApiResponse>(response);
  },

  /**
   * Obter preferências de notificação
   */
  async getNotificationPreferences(userId?: string) {
    const url = userId ? `/api/notification-preferences?userId=${userId}` : '/api/notification-preferences';
    const response = await apiRequest('GET', url);
    return processResponse<ApiResponse<any[]>>(response);
  },

  /**
   * Atualizar preferências de notificação
   */
  async updateNotificationPreferences(userId: string, preferences: any) {
    const response = await apiRequest('PUT', `/api/notification-preferences/${userId}`, preferences);
    return processResponse<ApiResponse<any[]>>(response);
  },
};

// Exportar todos os serviços como um objeto único para facilitar importação
export const apiServices = {
  auth: authService,
  dashboard: dashboardService,
  products: productsService,
  categories: categoriesService,
  customers: customersService,
  suppliers: suppliersService,
  inventory: inventoryService,
  orders: ordersService,
  shipping: shippingService,
  publicTracking: publicTrackingService,
  reports: reportsService,
  fleet: fleetService,
  users: usersService,
  warehouses: warehousesService,
  quality: qualityService,
  returns: returnsService,
  modules: modulesService,
  batches: batchesService,
  roles: rolesService,
  alerts: alertsService,
};

// Exportar como default para facilitar importação
export default apiServices;