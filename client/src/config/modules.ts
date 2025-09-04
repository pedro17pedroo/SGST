// Sistema de configuração de módulos do frontend
export interface FrontendModuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  dependencies?: string[];
  routes?: string[];
  menuItems?: {
    label: string;
    icon: string;
    path: string;
    order: number;
  }[];
  permissions?: string[];
}

// Configuração dos módulos do frontend (deve sincronizar com o backend)
export const FRONTEND_MODULE_CONFIG: Record<string, FrontendModuleConfig> = {
  // Módulos Core (sempre ativos)
  users: {
    id: 'users',
    name: 'Gestão de Utilizadores',
    description: 'Gestão de utilizadores, autenticação e permissões',
    enabled: true,
    routes: ['/users'],
    menuItems: [{
      label: 'Utilizadores',
      icon: 'Users',
      path: '/users',
      order: 90
    }],
    permissions: ['users.read']
  },

  roles: {
    id: 'roles',
    name: 'Gestão de Perfis',
    description: 'Gestão de perfis de acesso e permissões do sistema',
    enabled: true,
    dependencies: ['users'],
    routes: ['/roles'],
    menuItems: [{
      label: 'Perfis',
      icon: 'Shield',
      path: '/roles',
      order: 91
    }],
    permissions: ['roles.read']
  },
  
  settings: {
    id: 'settings',
    name: 'Configurações',
    description: 'Configurações do sistema e módulos',
    enabled: true,
    routes: ['/settings'],
    menuItems: [{
      label: 'Configurações',
      icon: 'Settings',
      path: '/settings',
      order: 100
    }],
    permissions: ['settings.read']
  },

  // Módulos de negócio
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Painel principal com estatísticas e resumos',
    enabled: true,
    dependencies: ['users'],
    routes: ['/dashboard', '/'],
    menuItems: [{
      label: 'Dashboard',
      icon: 'BarChart3',
      path: '/dashboard',
      order: 1
    }],
    permissions: ['dashboard.read']
  },

  products: {
    id: 'products',
    name: 'Gestão de Produtos',
    description: 'Catálogo de produtos e categorias',
    enabled: true,
    dependencies: ['users'],
    routes: ['/products', '/categories'],
    menuItems: [{
      label: 'Produtos',
      icon: 'Package',
      path: '/products',
      order: 10
    }, {
      label: 'Categorias',
      icon: 'Package2',
      path: '/categories',
      order: 11
    }],
    permissions: ['products.read']
  },

  customers: {
    id: 'customers',
    name: 'Gestão de Clientes',
    description: 'Gestão de clientes e contactos',
    enabled: true,
    dependencies: ['users'],
    routes: ['/customers'],
    menuItems: [{
      label: 'Clientes',
      icon: 'Users',
      path: '/customers',
      order: 12
    }],
    permissions: ['customers.read']
  },

  suppliers: {
    id: 'suppliers',
    name: 'Gestão de Fornecedores',
    description: 'Gestão de fornecedores e contactos',
    enabled: true,
    dependencies: ['users'],
    routes: ['/suppliers'],
    menuItems: [{
      label: 'Fornecedores',
      icon: 'Truck',
      path: '/suppliers',
      order: 15
    }],
    permissions: ['suppliers.read']
  },

  warehouses: {
    id: 'warehouses',
    name: 'Gestão de Armazéns',
    description: 'Gestão de armazéns e localizações',
    enabled: true,
    dependencies: ['users'],
    routes: ['/warehouses'],
    menuItems: [{
      label: 'Armazéns',
      icon: 'Building',
      path: '/warehouses',
      order: 20
    }],
    permissions: ['warehouses.read']
  },

  inventory: {
    id: 'inventory',
    name: 'Gestão de Inventário',
    description: 'Controlo de stock e movimentos',
    enabled: true,
    dependencies: ['products', 'warehouses'],
    routes: ['/inventory'],
    menuItems: [{
      label: 'Inventário',
      icon: 'Package2',
      path: '/inventory',
      order: 25
    }],
    permissions: ['inventory.read']
  },

  orders: {
    id: 'orders',
    name: 'Gestão de Encomendas',
    description: 'Processamento de encomendas e itens',
    enabled: true,
    dependencies: ['products', 'suppliers'],
    routes: ['/orders'],
    menuItems: [{
      label: 'Encomendas',
      icon: 'ShoppingCart',
      path: '/orders',
      order: 30
    }],
    permissions: ['orders.read']
  },

  shipping: {
    id: 'shipping',
    name: 'Gestão de Envios',
    description: 'Envios e rastreamento de entregas',
    enabled: true,
    dependencies: ['orders'],
    routes: ['/shipping'],
    menuItems: [{
      label: 'Envios',
      icon: 'Send',
      path: '/shipping',
      order: 35
    }],
    permissions: ['shipments.read']
  },

  returns: {
    id: 'returns',
    name: 'Gestão de Devoluções',
    description: 'Processamento de devoluções e reembolsos',
    enabled: false,
    dependencies: ['orders', 'inventory'],
    routes: ['/returns'],
    menuItems: [{
      label: 'Devoluções',
      icon: 'RotateCcw',
      path: '/returns',
      order: 40
    }],
    permissions: ['returns.read']
  },

  product_locations: {
    id: 'product_locations',
    name: 'Localizações de Produtos',
    description: 'Organização e localização de produtos nos armazéns',
    enabled: false,
    dependencies: ['products', 'warehouses'],
    routes: ['/product-locations'],
    menuItems: [{
      label: 'Localizações',
      icon: 'MapPin',
      path: '/product-locations',
      order: 45
    }],
    permissions: ['product_locations.read']
  },

  inventory_counts: {
    id: 'inventory_counts',
    name: 'Contagens de Inventário',
    description: 'Contagens cíclicas e reconciliação de stock',
    enabled: false,
    dependencies: ['inventory'],
    routes: ['/inventory-counts'],
    menuItems: [{
      label: 'Contagens',
      icon: 'Calculator',
      path: '/inventory-counts',
      order: 50
    }],
    permissions: ['inventory_counts.read']
  },

  barcode_scanning: {
    id: 'barcode_scanning',
    name: 'Leitura de Códigos',
    description: 'Leitura de códigos de barras e QR',
    enabled: false,
    dependencies: ['products'],
    routes: ['/scanner'],
    menuItems: [{
      label: 'Scanner',
      icon: 'Scan',
      path: '/scanner',
      order: 55
    }],
    permissions: ['barcode_scans.read']
  },

  picking_packing: {
    id: 'picking_packing',
    name: 'Picking & Packing',
    description: 'Listas de picking e preparação de encomendas',
    enabled: false,
    dependencies: ['orders', 'product_locations'],
    routes: ['/picking-packing'],
    menuItems: [{
      label: 'Picking & Packing',
      icon: 'CheckSquare',
      path: '/picking-packing',
      order: 60
    }],
    permissions: ['picking_lists.read']
  },

  alerts: {
    id: 'alerts',
    name: 'Alertas e Notificações',
    description: 'Sistema de alertas e notificações',
    enabled: false,
    dependencies: ['users'],
    routes: ['/alerts'],
    menuItems: [{
      label: 'Alertas',
      icon: 'Bell',
      path: '/alerts',
      order: 65
    }],
    permissions: ['alerts.read']
  },

  public_tracking: {
    id: 'public_tracking',
    name: 'Rastreamento Público',
    description: 'Interface pública para rastreamento de encomendas',
    enabled: true,
    dependencies: ['shipping'],
    routes: ['/public-tracking'],
    menuItems: [{
      label: 'Rastreamento Público',
      icon: 'Eye',
      path: '/public-tracking',
      order: 70
    }],
    permissions: []
  },

  quality_control: {
    id: 'quality_control',
    name: 'Controlo de Qualidade',
    description: 'Gestão de qualidade e inspeções',
    enabled: false,
    dependencies: ['products', 'inventory'],
    routes: ['/quality-control'],
    menuItems: [{
      label: 'Qualidade',
      icon: 'Shield',
      path: '/quality-control',
      order: 75
    }],
    permissions: ['quality_control.read']
  },

  reports: {
    id: 'reports',
    name: 'Relatórios',
    description: 'Geração de relatórios do sistema',
    enabled: false,
    dependencies: ['inventory', 'orders'],
    routes: ['/reports'],
    menuItems: [{
      label: 'Relatórios',
      icon: 'FileText',
      path: '/reports',
      order: 80
    }],
    permissions: ['reports.read']
  },

  advanced_analytics: {
    id: 'advanced_analytics',
    name: 'Análises Avançadas',
    description: 'Análises avançadas e métricas de performance',
    enabled: false,
    dependencies: ['reports'],
    routes: ['/advanced-analytics'],
    menuItems: [{
      label: 'Análises Avançadas',
      icon: 'TrendingUp',
      path: '/advanced-analytics',
      order: 85
    }],
    permissions: ['analytics.read']
  },

  // Demonstração de Automação Avançada
  warehouse_automation: {
    id: 'warehouse_automation',
    name: 'Automação de Armazéns',
    description: 'Demonstração das capacidades avançadas de automação IA',
    enabled: true,
    routes: ['/warehouse-automation'],
    menuItems: [{
      label: 'Automação IA',
      icon: 'Brain',
      path: '/warehouse-automation',
      order: 5
    }],
    permissions: []
  },

  ai_analytics: {
    id: 'ai_analytics',
    name: 'IA Analytics',
    description: 'Previsão demanda, otimização preços, detecção anomalias e segmentação clientes',
    enabled: true,
    routes: ['/ai-analytics', '/advanced-analytics'],
    menuItems: [{
      label: 'IA Analytics',
      icon: 'Brain',
      path: '/ai-analytics',
      order: 6
    }],
    permissions: ['ai_analytics.read']
  },

  angola_operations: {
    id: 'angola_operations',
    name: 'Operação em Angola',
    description: 'Tolerância a falhas, mapas offline, SMS/USSD fallback e buffer local',
    enabled: true,
    routes: ['/angola-operations'],
    menuItems: [{
      label: 'Operações Angola',
      icon: 'MapPin',
      path: '/angola-operations',
      order: 85
    }],
    permissions: ['angola_operations.read']
  },

  fleet_management: {
    id: 'fleet_management',
    name: 'Gestão de Frota',
    description: 'Gestão completa de frota, GPS tracking e associação veículo-envio',
    enabled: true,
    dependencies: ['users', 'shipping'],
    routes: ['/fleet', '/fleet/vehicles', '/fleet/tracking', '/fleet/assignments'],
    menuItems: [{
      label: 'Gestão de Frota',
      icon: 'Truck',
      path: '/fleet',
      order: 37
    }],
    permissions: ['fleet.read']
  }
};

// Classe para gestão de módulos no frontend
export class FrontendModuleManager {
  private static enabledModules: Set<string> = new Set();

  static async loadModuleConfiguration(): Promise<void> {
    try {
      const response = await fetch('/api/modules');
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar módulos: ${response.status}`);
      }
      
      const modules = await response.json();
      this.syncWithBackend(modules);
    } catch (error) {
      console.error('Erro ao carregar configuração de módulos:', error);
      this.loadLocalConfiguration();
    }
  }

  static syncWithBackend(modules: any[]): void {
    this.enabledModules.clear();
    modules.forEach((module: any) => {
      if (module.enabled) {
        this.enabledModules.add(module.id);
        // Atualizar configuração local se necessário
        if (FRONTEND_MODULE_CONFIG[module.id]) {
          FRONTEND_MODULE_CONFIG[module.id].enabled = true;
        }
      } else {
        if (FRONTEND_MODULE_CONFIG[module.id]) {
          FRONTEND_MODULE_CONFIG[module.id].enabled = false;
        }
      }
    });
  }

  static loadLocalConfiguration(): void {
    this.enabledModules.clear();
    Object.values(FRONTEND_MODULE_CONFIG).forEach(module => {
      if (module.enabled) {
        this.enabledModules.add(module.id);
      }
    });
  }

  static isModuleEnabled(moduleId: string): boolean {
    return this.enabledModules.has(moduleId);
  }

  static getEnabledModules(): FrontendModuleConfig[] {
    return Object.values(FRONTEND_MODULE_CONFIG).filter(module => 
      this.isModuleEnabled(module.id)
    );
  }

  static getEnabledRoutes(): string[] {
    return this.getEnabledModules()
      .flatMap(module => module.routes || []);
  }

  static getEnabledMenuItems(): Array<{ label: string; icon: string; path: string; order: number; }> {
    return this.getEnabledModules()
      .flatMap(module => module.menuItems || [])
      .sort((a, b) => a.order - b.order);
  }

  static validateDependencies(moduleId: string): boolean {
    const module = FRONTEND_MODULE_CONFIG[moduleId];
    if (!module?.dependencies) return true;
    
    return module.dependencies.every(dep => this.isModuleEnabled(dep));
  }

  static getModuleById(moduleId: string): FrontendModuleConfig | undefined {
    return FRONTEND_MODULE_CONFIG[moduleId];
  }
}