// Sistema de configuração de módulos
export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  dependencies?: string[];
  routes?: string[];
  tables?: string[];
  permissions?: string[];
}

// Configuração dos módulos do sistema
export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  // Módulos Core (sempre ativos)
  users: {
    id: 'users',
    name: 'Gestão de Utilizadores',
    description: 'Gestão de utilizadores, autenticação e permissões',
    enabled: true,
    routes: ['/api/users'],
    tables: ['users', 'notification_preferences'],
    permissions: ['users.read', 'users.write', 'users.delete']
  },
  
  settings: {
    id: 'settings',
    name: 'Configurações',
    description: 'Configurações do sistema e módulos',
    enabled: true,
    routes: ['/api/settings', '/api/modules'],
    tables: [],
    permissions: ['settings.read', 'settings.write']
  },

  // Módulos de negócio
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Painel principal com estatísticas e resumos',
    enabled: true,
    dependencies: ['users'],
    routes: ['/api/dashboard'],
    tables: [],
    permissions: ['dashboard.read']
  },

  products: {
    id: 'products',
    name: 'Gestão de Produtos',
    description: 'Catálogo de produtos e categorias',
    enabled: true,
    dependencies: ['users'],
    routes: ['/api/products', '/api/categories'],
    tables: ['products', 'categories'],
    permissions: ['products.read', 'products.write', 'products.delete', 'categories.read', 'categories.write']
  },

  suppliers: {
    id: 'suppliers',
    name: 'Gestão de Fornecedores',
    description: 'Gestão de fornecedores e contactos',
    enabled: true,
    dependencies: ['users'],
    routes: ['/api/suppliers'],
    tables: ['suppliers'],
    permissions: ['suppliers.read', 'suppliers.write', 'suppliers.delete']
  },

  warehouses: {
    id: 'warehouses',
    name: 'Gestão de Armazéns',
    description: 'Gestão de armazéns e localizações',
    enabled: true,
    dependencies: ['users'],
    routes: ['/api/warehouses'],
    tables: ['warehouses'],
    permissions: ['warehouses.read', 'warehouses.write', 'warehouses.delete']
  },

  inventory: {
    id: 'inventory',
    name: 'Gestão de Inventário',
    description: 'Controlo de stock e movimentos',
    enabled: true,
    dependencies: ['products', 'warehouses'],
    routes: ['/api/inventory', '/api/stock-movements'],
    tables: ['inventory', 'stock_movements'],
    permissions: ['inventory.read', 'inventory.write', 'stock_movements.read', 'stock_movements.write']
  },

  orders: {
    id: 'orders',
    name: 'Gestão de Encomendas',
    description: 'Processamento de encomendas e itens',
    enabled: true,
    dependencies: ['products', 'suppliers'],
    routes: ['/api/orders'],
    tables: ['orders', 'order_items'],
    permissions: ['orders.read', 'orders.write', 'orders.delete']
  },

  shipping: {
    id: 'shipping',
    name: 'Gestão de Envios',
    description: 'Envios e rastreamento de entregas',
    enabled: true,
    dependencies: ['orders'],
    routes: ['/api/shipments'],
    tables: ['shipments'],
    permissions: ['shipments.read', 'shipments.write', 'shipments.delete']
  },

  returns: {
    id: 'returns',
    name: 'Gestão de Devoluções',
    description: 'Processamento de devoluções e reembolsos',
    enabled: false,
    dependencies: ['orders', 'inventory'],
    routes: ['/api/returns'],
    tables: ['returns', 'return_items'],
    permissions: ['returns.read', 'returns.write', 'returns.delete']
  },

  product_locations: {
    id: 'product_locations',
    name: 'Localizações de Produtos',
    description: 'Organização e localização de produtos nos armazéns',
    enabled: true,
    dependencies: ['products', 'warehouses'],
    routes: ['/api/product-locations'],
    tables: ['product_locations'],
    permissions: ['product_locations.read', 'product_locations.write']
  },

  inventory_counts: {
    id: 'inventory_counts',
    name: 'Contagens de Inventário',
    description: 'Contagens cíclicas e reconciliação de stock',
    enabled: true,
    dependencies: ['inventory'],
    routes: ['/api/inventory-counts'],
    tables: ['inventory_counts', 'inventory_count_items'],
    permissions: ['inventory_counts.read', 'inventory_counts.write']
  },

  barcode_scanning: {
    id: 'barcode_scanning',
    name: 'Leitura de Códigos',
    description: 'Leitura de códigos de barras e QR',
    enabled: true,
    dependencies: ['products'],
    routes: ['/api/barcode-scans'],
    tables: ['barcode_scans'],
    permissions: ['barcode_scans.read', 'barcode_scans.write']
  },

  picking_packing: {
    id: 'picking_packing',
    name: 'Picking & Packing',
    description: 'Listas de picking e preparação de encomendas',
    enabled: true,
    dependencies: ['orders', 'product_locations'],
    routes: ['/api/picking-lists'],
    tables: ['picking_lists', 'picking_list_items'],
    permissions: ['picking_lists.read', 'picking_lists.write']
  },

  alerts: {
    id: 'alerts',
    name: 'Alertas e Notificações',
    description: 'Sistema de alertas e notificações',
    enabled: false,
    dependencies: ['users'],
    routes: ['/api/alerts'],
    tables: ['alerts'],
    permissions: ['alerts.read', 'alerts.write', 'alerts.acknowledge']
  },

  public_tracking: {
    id: 'public_tracking',
    name: 'Rastreamento Público',
    description: 'Interface pública para rastreamento de encomendas',
    enabled: true,
    dependencies: ['shipping'],
    routes: ['/api/public/track'],
    tables: [],
    permissions: []
  },

  quality_control: {
    id: 'quality_control',
    name: 'Controlo de Qualidade',
    description: 'Gestão de qualidade e inspeções',
    enabled: true,
    dependencies: ['products', 'inventory'],
    routes: ['/api/quality-control'],
    tables: [],
    permissions: ['quality_control.read', 'quality_control.write']
  },

  reports: {
    id: 'reports',
    name: 'Relatórios',
    description: 'Geração de relatórios do sistema',
    enabled: true,
    dependencies: ['inventory', 'orders'],
    routes: ['/api/reports'],
    tables: [],
    permissions: ['reports.read', 'reports.generate']
  },

  advanced_analytics: {
    id: 'advanced_analytics',
    name: 'Análises Avançadas',
    description: 'Análises avançadas e métricas de performance',
    enabled: false,
    dependencies: ['reports'],
    routes: ['/api/analytics'],
    tables: [],
    permissions: ['analytics.read', 'analytics.advanced']
  }
};

// Funções auxiliares para gestão de módulos
export class ModuleManager {
  static getEnabledModules(): ModuleConfig[] {
    return Object.values(MODULE_CONFIG).filter(module => module.enabled);
  }

  static getModuleById(id: string): ModuleConfig | undefined {
    return MODULE_CONFIG[id];
  }

  static isModuleEnabled(id: string): boolean {
    const module = this.getModuleById(id);
    return module ? module.enabled : false;
  }

  static getDependencies(moduleId: string): string[] {
    const module = this.getModuleById(moduleId);
    return module?.dependencies || [];
  }

  static validateDependencies(moduleId: string): boolean {
    const dependencies = this.getDependencies(moduleId);
    return dependencies.every(dep => this.isModuleEnabled(dep));
  }

  static getModulesWithDependency(moduleId: string): string[] {
    return Object.values(MODULE_CONFIG)
      .filter(module => module.dependencies?.includes(moduleId))
      .map(module => module.id);
  }

  static getEnabledRoutes(): string[] {
    return this.getEnabledModules()
      .flatMap(module => module.routes || []);
  }

  static canDisableModule(moduleId: string): boolean {
    const dependentModules = this.getModulesWithDependency(moduleId);
    const enabledDependents = dependentModules.filter(id => this.isModuleEnabled(id));
    return enabledDependents.length === 0;
  }

  static enableModule(moduleId: string): { success: boolean; message: string } {
    const module = this.getModuleById(moduleId);
    if (!module) {
      return { success: false, message: `Módulo '${moduleId}' não encontrado` };
    }

    if (module.enabled) {
      return { success: false, message: `Módulo '${module.name}' já está ativo` };
    }

    // Verificar dependências
    if (!this.validateDependencies(moduleId)) {
      const missingDeps = this.getDependencies(moduleId).filter(dep => !this.isModuleEnabled(dep));
      return { 
        success: false, 
        message: `Dependências não atendidas: ${missingDeps.join(', ')}` 
      };
    }

    MODULE_CONFIG[moduleId].enabled = true;
    return { success: true, message: `Módulo '${module.name}' ativado com sucesso` };
  }

  static disableModule(moduleId: string): { success: boolean; message: string } {
    const module = this.getModuleById(moduleId);
    if (!module) {
      return { success: false, message: `Módulo '${moduleId}' não encontrado` };
    }

    if (!module.enabled) {
      return { success: false, message: `Módulo '${module.name}' já está inativo` };
    }

    // Verificar se pode ser desativado
    if (!this.canDisableModule(moduleId)) {
      const dependents = this.getModulesWithDependency(moduleId)
        .filter(id => this.isModuleEnabled(id))
        .map(id => this.getModuleById(id)?.name)
        .join(', ');
      
      return { 
        success: false, 
        message: `Não é possível desativar. Módulos dependentes ativos: ${dependents}` 
      };
    }

    MODULE_CONFIG[moduleId].enabled = false;
    return { success: true, message: `Módulo '${module.name}' desativado com sucesso` };
  }
}