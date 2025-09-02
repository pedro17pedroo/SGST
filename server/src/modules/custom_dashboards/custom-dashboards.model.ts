export interface CustomDashboard {
  id: string;
  name: string;
  description?: string;
  layout: {
    columns: number;
    rows: number;
    gap: number;
  };
  widgets: DashboardWidget[];
  filters?: DashboardFilter[];
  permissions: {
    public: boolean;
    users?: string[];
    roles?: string[];
    departments?: string[];
  };
  settings: {
    autoRefresh: boolean;
    refreshInterval: number;
    showFilters: boolean;
    showExportOptions: boolean;
    allowFullscreen: boolean;
  };
  thumbnail?: string;
  owner: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric_card' | 'chart_line' | 'chart_bar' | 'chart_pie' | 'chart_area' | 
        'table' | 'list' | 'gauge' | 'progress' | 'heatmap' | 'map' | 'text' |
        'image' | 'video' | 'iframe' | 'calendar' | 'timeline' | 'kanban';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: {
    title?: string;
    dataSource?: string;
    query?: string;
    refreshInterval: number;
    style?: {
      backgroundColor?: string;
      borderColor?: string;
      textColor?: string;
      fontSize?: number;
    };
    displayOptions?: Record<string, any>;
  };
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date_range' | 'select' | 'multiselect' | 'text' | 'number';
  options?: { label: string; value: string; }[];
  defaultValue?: any;
  required: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  type: 'database' | 'api' | 'file' | 'realtime';
  schema: Record<string, any>;
  sampleQueries: string[];
  availableFields: string[];
  supportedChartTypes: string[];
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  widgets: DashboardWidget[];
  complexity: 'simple' | 'intermediate' | 'advanced';
  tags: string[];
}

export class CustomDashboardsModel {
  static async getDashboards(filters: { userId?: string; includePublic?: boolean; category?: string }) {
    const mockDashboards = [
      {
        id: '1',
        name: 'Executive Overview',
        description: 'High-level KPIs and metrics',
        thumbnail: '/thumbnails/executive.png',
        permissions: { public: true },
        owner: 'Sistema',
        updatedAt: new Date(),
        widgets: [
          { id: '1', type: 'metric_card' as const, position: { x: 0, y: 0, width: 3, height: 2 }, config: { title: 'Total Revenue', refreshInterval: 30000 } },
          { id: '2', type: 'chart_line' as const, position: { x: 3, y: 0, width: 6, height: 4 }, config: { title: 'Sales Trend', refreshInterval: 30000 } }
        ],
        category: 'Executive'
      },
      {
        id: '2', 
        name: 'Inventory Dashboard',
        description: 'Stock levels and movements',
        thumbnail: '/thumbnails/inventory.png',
        permissions: { public: false },
        owner: 'Admin',
        updatedAt: new Date(),
        widgets: [
          { id: '3', type: 'gauge' as const, position: { x: 0, y: 0, width: 4, height: 3 }, config: { title: 'Stock Level', refreshInterval: 60000 } }
        ],
        category: 'Operations'
      }
    ];

    return mockDashboards.filter(dashboard => {
      if (!filters.includePublic && !dashboard.permissions.public) return false;
      if (filters.category && dashboard.category !== filters.category) return false;
      return true;
    });
  }

  static async getDashboard(dashboardId: string, userId?: string) {
    const mockDashboard = {
      id: dashboardId,
      name: 'Sample Dashboard',
      description: 'A sample dashboard',
      layout: { columns: 12, rows: 8, gap: 16 },
      widgets: [
        {
          id: '1',
          type: 'metric_card' as const,
          position: { x: 0, y: 0, width: 3, height: 2 },
          config: {
            title: 'Total Products',
            dataSource: 'products',
            query: 'SELECT COUNT(*) FROM products',
            refreshInterval: 30000
          }
        }
      ],
      filters: [],
      permissions: { public: true },
      settings: {
        autoRefresh: true,
        refreshInterval: 60000,
        showFilters: true,
        showExportOptions: true,
        allowFullscreen: true
      },
      owner: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return mockDashboard;
  }

  static async createDashboard(data: any) {
    return {
      id: `dash_${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static async updateDashboard(dashboardId: string, updates: any) {
    return {
      id: dashboardId,
      ...updates,
      updatedAt: new Date()
    };
  }

  static async deleteDashboard(dashboardId: string) {
    return true;
  }

  static async duplicateDashboard(dashboardId: string, options: any) {
    return {
      id: `dash_${Date.now()}`,
      name: options.name,
      ...options,
      createdAt: new Date()
    };
  }

  static async getWidgetData(params: any) {
    const mockData = {
      result: [
        { date: '2024-01', value: 1250, label: 'Janeiro' },
        { date: '2024-02', value: 1380, label: 'Fevereiro' },
        { date: '2024-03', value: 1450, label: 'Março' }
      ],
      recordCount: 3,
      executionTime: 45,
      cached: false,
      cacheExpiry: null
    };

    return mockData;
  }

  static async getAvailableDataSources() {
    return [
      {
        id: 'products',
        name: 'Products',
        description: 'Product catalog data',
        type: 'database',
        schema: { id: 'string', name: 'string', price: 'number', category: 'string' },
        sampleQueries: ['SELECT COUNT(*) FROM products', 'SELECT category, COUNT(*) FROM products GROUP BY category'],
        availableFields: ['id', 'name', 'price', 'category', 'stock', 'created_at'],
        supportedChartTypes: ['bar', 'line', 'pie', 'table']
      },
      {
        id: 'orders',
        name: 'Orders',
        description: 'Order transaction data',
        type: 'database',
        schema: { id: 'string', total: 'number', status: 'string', created_at: 'datetime' },
        sampleQueries: ['SELECT DATE(created_at), SUM(total) FROM orders GROUP BY DATE(created_at)'],
        availableFields: ['id', 'total', 'status', 'customer_id', 'created_at'],
        supportedChartTypes: ['line', 'bar', 'area', 'table']
      }
    ];
  }

  static async getDashboardTemplates(filters: { category?: string }) {
    const templates = [
      {
        id: 'template_executive',
        name: 'Executive Dashboard',
        description: 'High-level business metrics and KPIs',
        category: 'Executive',
        preview: '/templates/executive.png',
        widgets: 6,
        complexity: 'simple' as const,
        tags: ['KPI', 'Executive', 'Overview']
      },
      {
        id: 'template_operations',
        name: 'Operations Dashboard',
        description: 'Operational metrics and monitoring',
        category: 'Operations',
        preview: '/templates/operations.png',
        widgets: 8,
        complexity: 'intermediate' as const,
        tags: ['Operations', 'Monitoring', 'Performance']
      }
    ];

    return templates.filter(template => {
      if (filters.category && template.category !== filters.category) return false;
      return true;
    });
  }

  static async createFromTemplate(templateId: string, options: any) {
    return {
      id: `dash_${Date.now()}`,
      name: options.name,
      ...options,
      createdAt: new Date()
    };
  }

  static async exportDashboard(dashboardId: string, options: any) {
    const jobId = `export_${Date.now()}`;
    return {
      jobId,
      format: options.format,
      estimatedTime: '2-5 minutes',
      downloadUrl: `/api/dashboards/${dashboardId}/export/${jobId}/download`
    };
  }

  static async shareDashboard(dashboardId: string, options: any) {
    const shareId = `share_${Date.now()}`;
    return {
      shareId,
      shareUrl: `/shared/dashboards/${shareId}`,
      recipients: options.recipients,
      expiryDate: options.expiryDate
    };
  }
}