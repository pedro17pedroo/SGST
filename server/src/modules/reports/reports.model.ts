/**
 * Interface para dados de relatório de vendas
 */
export interface SalesReportData {
  id: string;
  productName: string;
  sku: string;
  category: string;
  totalSales: number;
  revenue: number;
  period: string;
}

/**
 * Interface para dados de relatório de inventário
 */
export interface InventoryReportData {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  warehouseId: string;
  lastUpdated: Date;
  stockStatus: 'low' | 'normal' | 'high';
}

/**
 * Interface para dados de relatório de performance
 */
export interface PerformanceReportData {
  id: string;
  productName: string;
  sku: string;
  category: string;
  totalSales: number;
  revenue: number;
  profitMargin: number;
  turnoverRate: number;
  stockLevel: number;
}

/**
 * Parâmetros para filtros de relatórios
 */
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  warehouseId?: string;
  limit?: number;
}

/**
 * Interface para dados de rotatividade de inventário
 */
export interface InventoryTurnoverData {
  productId: string;
  productName: string;
  sku: string;
  categoryId: string;
  currentStock: number;
  avgMonthlySales: number;
  turnoverRatio: number;
  stockValue: number;
  status: 'high' | 'medium' | 'low';
  warehouseId: string;
}

/**
 * Interface para dados de inventário obsoleto
 */
export interface ObsoleteInventoryData {
  productId: string;
  productName: string;
  sku: string;
  categoryId: string;
  currentStock: number;
  lastMovementDate: Date;
  daysWithoutMovement: number;
  stockValue: number;
  warehouseId: string;
}

/**
 * Interface para dados de performance de produto
 */
export interface ProductPerformanceData {
  productId: string;
  productName: string;
  sku: string;
  categoryId: string;
  totalSales: number;
  totalRevenue: number;
  profitMargin: number;
  avgOrderValue: number;
  conversionRate: number;
  returnRate: number;
  warehouseId: string;
}

/**
 * Interface para dados de eficiência de armazém
 */
export interface WarehouseEfficiencyData {
  warehouseId: string;
  warehouseName: string;
  totalProducts: number;
  totalStock: number;
  stockValue: number;
  utilizationRate: number;
  turnoverRate: number;
  efficiency: number;
}

/**
 * Interface para dados de avaliação de stock
 */
export interface StockValuationData {
  productId: string;
  productName: string;
  sku: string;
  categoryId: string;
  currentStock: number;
  unitCost: number;
  totalValue: number;
  warehouseId: string;
}

/**
 * Interface para dados de performance de fornecedor
 */
export interface SupplierPerformanceData {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  avgDeliveryTime: number;
  qualityScore: number;
  totalValue: number;
}

/**
 * Modelo para geração de relatórios com dados simulados
 */
export class ReportsModel {
  /**
   * Gera dados simulados de produtos para relatórios
   */
  private static generateMockProducts() {
    return [
      { id: '1', name: 'Smartphone Samsung Galaxy', sku: 'SGS001', category: 'Electrónicos', price: 85000 },
      { id: '2', name: 'Laptop Dell Inspiron', sku: 'DLL002', category: 'Computadores', price: 120000 },
      { id: '3', name: 'Headphones Sony', sku: 'SNY003', category: 'Áudio', price: 15000 },
      { id: '4', name: 'Tablet iPad Air', sku: 'APL004', category: 'Tablets', price: 95000 },
      { id: '5', name: 'Smartwatch Apple', sku: 'APL005', category: 'Wearables', price: 45000 },
      { id: '6', name: 'Camera Canon EOS', sku: 'CAN006', category: 'Fotografia', price: 75000 },
      { id: '7', name: 'Monitor LG UltraWide', sku: 'LGM007', category: 'Monitores', price: 55000 },
      { id: '8', name: 'Teclado Mecânico', sku: 'KEY008', category: 'Periféricos', price: 12000 },
      { id: '9', name: 'Mouse Gaming', sku: 'MSE009', category: 'Periféricos', price: 8000 },
      { id: '10', name: 'Impressora HP LaserJet', sku: 'HPP010', category: 'Impressoras', price: 35000 }
    ];
  }

  /**
   * Gera relatório de vendas
   * @param filters - Filtros para o relatório
   * @returns Promise com dados de vendas
   */
  static async getSalesReport(filters: ReportFilters = {}): Promise<SalesReportData[]> {
    try {
      const products = this.generateMockProducts();
      const limit = filters.limit || 50;
      const period = `${filters.startDate || '2024-01-01'} - ${filters.endDate || new Date().toISOString().split('T')[0]}`;

      let filteredProducts = products;
      
      // Aplicar filtro de categoria se fornecido
      if (filters.category) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes(filters.category!.toLowerCase()));
      }

      // Limitar resultados
      filteredProducts = filteredProducts.slice(0, limit);

      // Gerar dados de vendas simulados
      return filteredProducts.map(product => {
        const totalSales = Math.floor(Math.random() * 200) + 10; // 10-210 vendas
        const revenue = product.price * totalSales;

        return {
          id: product.id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          totalSales,
          revenue,
          period
        };
      });

    } catch (error) {
      console.error('Erro ao gerar relatório de vendas:', error);
      
      // Retornar dados simulados básicos em caso de erro
      return [
        {
          id: '1',
          productName: 'Produto A',
          sku: 'SKU001',
          category: 'Categoria 1',
          totalSales: 150,
          revenue: 15000,
          period: `${filters.startDate || '2024-01-01'} - ${filters.endDate || new Date().toISOString().split('T')[0]}`
        },
        {
          id: '2',
          productName: 'Produto B',
          sku: 'SKU002',
          category: 'Categoria 2',
          totalSales: 89,
          revenue: 8900,
          period: `${filters.startDate || '2024-01-01'} - ${filters.endDate || new Date().toISOString().split('T')[0]}`
        }
      ];
    }
  }

  /**
   * Gera relatório de inventário
   * @param filters - Filtros para o relatório
   * @returns Promise com dados de inventário
   */
  static async getInventoryReport(filters: ReportFilters = {}): Promise<InventoryReportData[]> {
    try {
      const products = this.generateMockProducts();
      const limit = filters.limit || 50;
      const warehouses = ['WH001', 'WH002', 'WH003'];

      let filteredProducts = products;
      
      // Aplicar filtros
      if (filters.category) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes(filters.category!.toLowerCase()));
      }

      // Limitar resultados
      filteredProducts = filteredProducts.slice(0, limit);

      // Gerar dados de inventário simulados
      return filteredProducts.map(product => {
        const currentStock = Math.floor(Math.random() * 150) + 5; // 5-155 unidades
        const warehouseId = filters.warehouseId || warehouses[Math.floor(Math.random() * warehouses.length)];
        
        let stockStatus: 'low' | 'normal' | 'high' = 'normal';
        if (currentStock < 20) stockStatus = 'low';
        else if (currentStock > 100) stockStatus = 'high';

        return {
          id: product.id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          currentStock,
          warehouseId,
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
          stockStatus
        };
      });

    } catch (error) {
      console.error('Erro ao gerar relatório de inventário:', error);
      
      // Retornar dados simulados básicos em caso de erro
      return [
        {
          id: '1',
          productName: 'Produto A',
          sku: 'SKU001',
          category: 'Categoria 1',
          currentStock: 45,
          warehouseId: filters.warehouseId || 'WH001',
          lastUpdated: new Date(),
          stockStatus: 'normal'
        },
        {
          id: '2',
          productName: 'Produto B',
          sku: 'SKU002',
          category: 'Categoria 2',
          currentStock: 8,
          warehouseId: filters.warehouseId || 'WH001',
          lastUpdated: new Date(),
          stockStatus: 'low'
        }
      ];
    }
  }

  /**
   * Gera relatório de performance
   * @param filters - Filtros para o relatório
   * @returns Promise com dados de performance
   */
  static async getPerformanceReport(filters: ReportFilters = {}): Promise<PerformanceReportData[]> {
    try {
      const products = this.generateMockProducts();
      const limit = filters.limit || 50;

      let filteredProducts = products;
      
      // Aplicar filtro de categoria se fornecido
      if (filters.category) {
        filteredProducts = products.filter(p => p.category.toLowerCase().includes(filters.category!.toLowerCase()));
      }

      // Limitar resultados
      filteredProducts = filteredProducts.slice(0, limit);

      // Gerar dados de performance simulados
      return filteredProducts.map(product => {
        const totalSales = Math.floor(Math.random() * 200) + 10; // 10-210 vendas
        const revenue = product.price * totalSales;
        const profitMargin = Math.random() * 0.4 + 0.1; // 10-50%
        const turnoverRate = Math.random() * 6 + 1; // 1-7x por ano
        const stockLevel = Math.floor(Math.random() * 150) + 5; // 5-155 unidades

        return {
          id: product.id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          totalSales,
          revenue,
          profitMargin: Math.round(profitMargin * 100) / 100,
          turnoverRate: Math.round(turnoverRate * 100) / 100,
          stockLevel
        };
      });

    } catch (error) {
      console.error('Erro ao gerar relatório de performance:', error);
      
      // Retornar dados simulados básicos em caso de erro
      return [
        {
          id: '1',
          productName: 'Produto A',
          sku: 'SKU001',
          category: 'Categoria 1',
          totalSales: 150,
          revenue: 15000,
          profitMargin: 0.25,
          turnoverRate: 3.2,
          stockLevel: 45
        },
        {
          id: '2',
          productName: 'Produto B',
          sku: 'SKU002',
          category: 'Categoria 2',
          totalSales: 89,
          revenue: 8900,
          profitMargin: 0.18,
          turnoverRate: 2.8,
          stockLevel: 23
        }
      ];
    }
  }

  /**
   * Obtém resumo geral dos relatórios
   * @param filters - Filtros para o resumo
   * @returns Promise com dados de resumo
   */
  static async getSummary(filters: ReportFilters = {}) {
    try {
      const [salesData, inventoryData, performanceData] = await Promise.all([
        this.getSalesReport({ ...filters, limit: 10 }),
        this.getInventoryReport({ ...filters, limit: 10 }),
        this.getPerformanceReport({ ...filters, limit: 10 })
      ]);

      const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
      const totalSales = salesData.reduce((sum, item) => sum + item.totalSales, 0);

      return {
        sales: {
          totalRevenue,
          totalSales,
          averageOrderValue: totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0
        },
        inventory: {
          totalProducts: inventoryData.length,
          lowStockItems: inventoryData.filter(item => item.stockStatus === 'low').length,
          totalStockValue: inventoryData.reduce((sum, item) => sum + item.currentStock, 0)
        },
        performance: {
          averageProfitMargin: performanceData.length > 0
            ? Math.round((performanceData.reduce((sum, item) => sum + item.profitMargin, 0) / performanceData.length) * 100) / 100
            : 0,
          averageTurnoverRate: performanceData.length > 0
            ? Math.round((performanceData.reduce((sum, item) => sum + item.turnoverRate, 0) / performanceData.length) * 100) / 100
            : 0
        }
      };
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      
      return {
        sales: {
          totalRevenue: 5000000, // 5M Kz
          totalSales: 500,
          averageOrderValue: 10000 // 10K Kz
        },
        inventory: {
          totalProducts: 150,
          lowStockItems: 12,
          totalStockValue: 75000
        },
        performance: {
          averageProfitMargin: 0.22,
          averageTurnoverRate: 3.1
        }
      };
    }
  }

  /**
   * Gera relatório de rotatividade de inventário
   */
  static async getInventoryTurnoverReport(filters: {
    startDate: Date;
    endDate: Date;
    warehouseId?: string;
    categoryId?: string;
  }): Promise<InventoryTurnoverData[]> {
    try {
      const products = this.generateMockProducts();
      const warehouses = ['WH001', 'WH002', 'WH003'];

      return products.map(product => {
        const currentStock = Math.floor(Math.random() * 150) + 10;
        const avgMonthlySales = Math.max(1, Math.floor(currentStock * 0.3 + Math.random() * 20));
        const turnoverRatio = currentStock > 0 ? avgMonthlySales / currentStock : 0;
        const stockValue = currentStock * product.price;
        const warehouseId = filters.warehouseId || warehouses[Math.floor(Math.random() * warehouses.length)];

        const status: 'high' | 'medium' | 'low' = turnoverRatio > 2 ? 'high' : turnoverRatio >= 1 ? 'medium' : 'low';
         
         return {
           productId: product.id,
           productName: product.name,
           sku: product.sku,
           categoryId: product.category,
           currentStock,
           avgMonthlySales,
           turnoverRatio: Number(turnoverRatio.toFixed(2)),
           stockValue: Number(stockValue.toFixed(2)),
           status,
           warehouseId
         };
      }).filter(item => item.currentStock > 0);
    } catch (error) {
      console.error('Erro ao gerar relatório de rotatividade:', error);
      return [];
    }
  }

  /**
   * Gera relatório de inventário obsoleto
   */
  static async getObsoleteInventoryReport(filters: {
    daysWithoutMovement: number;
    warehouseId?: string;
    minValue: number;
  }): Promise<ObsoleteInventoryData[]> {
    try {
      const products = this.generateMockProducts();
      const warehouses = ['WH001', 'WH002', 'WH003'];

      return products.map(product => {
        const currentStock = Math.floor(Math.random() * 100) + 5;
        const daysWithoutMovement = Math.floor(Math.random() * 200) + filters.daysWithoutMovement;
        const stockValue = currentStock * product.price;
        const warehouseId = filters.warehouseId || warehouses[Math.floor(Math.random() * warehouses.length)];
        const lastMovementDate = new Date(Date.now() - daysWithoutMovement * 24 * 60 * 60 * 1000);

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          categoryId: product.category,
          currentStock,
          lastMovementDate,
          daysWithoutMovement,
          stockValue,
          warehouseId
        };
      }).filter(item => item.stockValue >= filters.minValue && item.daysWithoutMovement >= filters.daysWithoutMovement);
    } catch (error) {
      console.error('Erro ao gerar relatório de inventário obsoleto:', error);
      return [];
    }
  }

  /**
   * Gera relatório de performance de produto
   */
  static async getProductPerformanceReport(filters: {
    startDate: Date;
    endDate: Date;
    warehouseId?: string;
    categoryId?: string;
    limit?: number;
  }): Promise<ProductPerformanceData[]> {
    try {
      const products = this.generateMockProducts();
      const limit = filters.limit || 50;
      const warehouses = ['WH001', 'WH002', 'WH003'];

      return products.slice(0, limit).map(product => {
        const totalSales = Math.floor(Math.random() * 300) + 20;
        const totalRevenue = product.price * totalSales;
        const profitMargin = Math.random() * 0.4 + 0.1;
        const avgOrderValue = totalRevenue / totalSales;
        const conversionRate = Math.random() * 0.15 + 0.05;
        const returnRate = Math.random() * 0.1;
        const warehouseId = filters.warehouseId || warehouses[Math.floor(Math.random() * warehouses.length)];

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          categoryId: product.category,
          totalSales,
          totalRevenue,
          profitMargin: Number(profitMargin.toFixed(2)),
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(3)),
          returnRate: Number(returnRate.toFixed(3)),
          warehouseId
        };
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de performance de produto:', error);
      return [];
    }
  }

  /**
   * Gera relatório de eficiência de armazém
   */
  static async getWarehouseEfficiencyReport(warehouseId?: string): Promise<WarehouseEfficiencyData[]> {
    try {
      const warehouses = [
        { id: 'WH001', name: 'Armazém Central' },
        { id: 'WH002', name: 'Armazém Norte' },
        { id: 'WH003', name: 'Armazém Sul' }
      ];

      const targetWarehouses = warehouseId ? warehouses.filter(w => w.id === warehouseId) : warehouses;

      return targetWarehouses.map(warehouse => {
        const totalProducts = Math.floor(Math.random() * 500) + 100;
        const totalStock = Math.floor(Math.random() * 10000) + 1000;
        const stockValue = totalStock * (Math.random() * 100 + 50);
        const utilizationRate = Math.random() * 0.4 + 0.6;
        const turnoverRate = Math.random() * 4 + 2;
        const efficiency = (utilizationRate + turnoverRate / 6) / 2;

        return {
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          totalProducts,
          totalStock,
          stockValue: Number(stockValue.toFixed(2)),
          utilizationRate: Number(utilizationRate.toFixed(2)),
          turnoverRate: Number(turnoverRate.toFixed(2)),
          efficiency: Number(efficiency.toFixed(2))
        };
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de eficiência de armazém:', error);
      return [];
    }
  }

  /**
   * Gera relatório de avaliação de stock
   */
  static async getStockValuationReport(warehouseId?: string): Promise<StockValuationData[]> {
    try {
      const products = this.generateMockProducts();
      const warehouses = ['WH001', 'WH002', 'WH003'];

      return products.map(product => {
        const currentStock = Math.floor(Math.random() * 200) + 10;
        const unitCost = product.price * (0.7 + Math.random() * 0.2); // 70-90% do preço
        const totalValue = currentStock * unitCost;
        const selectedWarehouse = warehouseId || warehouses[Math.floor(Math.random() * warehouses.length)];

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          categoryId: product.category,
          currentStock,
          unitCost: Number(unitCost.toFixed(2)),
          totalValue: Number(totalValue.toFixed(2)),
          warehouseId: selectedWarehouse
        };
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de avaliação de stock:', error);
      return [];
    }
  }

  /**
   * Gera relatório de performance de fornecedor
   */
  static async getSupplierPerformanceReport(filters: {
    startDate: Date;
    endDate: Date;
    supplierId?: string;
  }): Promise<SupplierPerformanceData[]> {
    try {
      const suppliers = [
        { id: 'SUP001', name: 'Fornecedor Tech Solutions' },
        { id: 'SUP002', name: 'Fornecedor Global Electronics' },
        { id: 'SUP003', name: 'Fornecedor Premium Devices' },
        { id: 'SUP004', name: 'Fornecedor Smart Components' }
      ];

      const targetSuppliers = filters.supplierId ? suppliers.filter(s => s.id === filters.supplierId) : suppliers;

      return targetSuppliers.map(supplier => {
        const totalOrders = Math.floor(Math.random() * 100) + 20;
        const onTimeDeliveries = Math.floor(totalOrders * (0.7 + Math.random() * 0.3));
        const onTimeRate = onTimeDeliveries / totalOrders;
        const avgDeliveryTime = Math.floor(Math.random() * 10) + 3; // 3-13 dias
        const qualityScore = Math.random() * 2 + 8; // 8-10
        const totalValue = (Math.random() * 500000 + 100000); // 100K-600K

        return {
          supplierId: supplier.id,
          supplierName: supplier.name,
          totalOrders,
          onTimeDeliveries,
          onTimeRate: Number(onTimeRate.toFixed(2)),
          avgDeliveryTime,
          qualityScore: Number(qualityScore.toFixed(1)),
          totalValue: Number(totalValue.toFixed(2))
        };
      });
    } catch (error) {
      console.error('Erro ao gerar relatório de performance de fornecedor:', error);
      return [];
    }
  }
}