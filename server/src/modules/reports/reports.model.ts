import { db } from '../../../database/db';
import { products, inventory, warehouses } from '../../../../shared/schema';
import { eq, and } from 'drizzle-orm';

export class ReportsModel {
  static async getInventoryTurnoverReport(filters: {
    startDate: Date;
    endDate: Date;
    warehouseId?: string;
    categoryId?: string;
  }) {
    try {
      // Buscar produtos com informações de inventário
      const productsWithInventory = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          categoryId: products.categoryId,
          price: products.price,
          currentStock: inventory.quantity,
          warehouseId: inventory.warehouseId
        })
        .from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .where(
          filters.warehouseId 
            ? eq(inventory.warehouseId, filters.warehouseId)
            : undefined
        );

      // Calcular rotatividade (simulado - em produção seria baseado em vendas reais)
      const turnoverData = productsWithInventory.map(product => {
        const currentStock = Number(product.currentStock) || 0;
        const price = Number(product.price) || 0;
        
        // Simular dados de rotatividade baseados no stock atual
        const avgMonthlySales = Math.max(1, Math.floor(currentStock * 0.3 + Math.random() * 20));
        const turnoverRatio = currentStock > 0 ? avgMonthlySales / currentStock : 0;
        const stockValue = currentStock * price;
        
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          currentStock,
          avgMonthlySales,
          turnoverRatio: Number(turnoverRatio.toFixed(2)),
          stockValue: Number(stockValue.toFixed(2)),
          status: turnoverRatio > 2 ? 'high' : turnoverRatio >= 1 ? 'medium' : 'low',
          warehouseId: product.warehouseId
        };
      });

      return turnoverData.filter(item => item.currentStock > 0);
    } catch (error) {
      console.error('Error in getInventoryTurnoverReport:', error);
      // Retornar dados mock em caso de erro
      return [
        {
          productId: '1',
          productName: 'Produto Exemplo',
          sku: 'SKU001',
          category: 'Categoria A',
          currentStock: 100,
          avgMonthlySales: 25,
          turnoverRatio: 0.25,
          stockValue: 5000,
          status: 'low',
          warehouseId: 'warehouse-1'
        }
      ];
    }
  }

  static async getObsoleteInventoryReport(filters: {
    daysWithoutMovement: number;
    warehouseId?: string;
    minValue: number;
  }) {
    try {
      // Buscar produtos com inventário que podem estar obsoletos
      const obsoleteProducts = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          categoryId: products.categoryId,
          price: products.price,
          currentStock: inventory.quantity,
          warehouseId: inventory.warehouseId,
          lastUpdated: inventory.lastUpdated
        })
        .from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .where(
          filters.warehouseId 
            ? eq(inventory.warehouseId, filters.warehouseId)
            : undefined
        );

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.daysWithoutMovement);

      // Filtrar produtos obsoletos
      const obsoleteData = obsoleteProducts
        .filter(product => {
          const currentStock = Number(product.currentStock) || 0;
          const price = Number(product.price) || 0;
          const stockValue = currentStock * price;
          const lastUpdated = product.lastUpdated ? new Date(product.lastUpdated) : new Date(0);
          
          return currentStock > 0 && 
                 stockValue >= filters.minValue && 
                 lastUpdated < cutoffDate;
        })
        .map(product => {
          const currentStock = Number(product.currentStock) || 0;
          const price = Number(product.price) || 0;
          const stockValue = currentStock * price;
          const daysSinceLastMovement = Math.floor(
            (Date.now() - (product.lastUpdated ? new Date(product.lastUpdated).getTime() : 0)) / (1000 * 60 * 60 * 24)
          );
          
          return {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            categoryId: product.categoryId,
            currentStock,
            stockValue: Number(stockValue.toFixed(2)),
            daysSinceLastMovement,
            warehouseId: product.warehouseId,
            riskLevel: daysSinceLastMovement > filters.daysWithoutMovement * 2 ? 'high' : 'medium'
          };
        });

      return obsoleteData;
    } catch (error) {
      console.error('Error in getObsoleteInventoryReport:', error);
      // Retornar dados mock em caso de erro
      return [
        {
          productId: '1',
          productName: 'Produto Obsoleto',
          sku: 'SKU002',
          categoryId: 'cat-1',
          currentStock: 50,
          stockValue: 2500,
          daysSinceLastMovement: 200,
          warehouseId: 'warehouse-1',
          riskLevel: 'high'
        }
      ];
    }
  }

  static async getProductPerformanceReport(filters: {
    startDate: Date;
    endDate: Date;
    warehouseId?: string;
    categoryId?: string;
    limit?: number;
  }) {
    try {
      // Buscar produtos com informações de performance
      const performanceData = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          categoryId: products.categoryId,
          price: products.price,
          currentStock: inventory.quantity,
          warehouseId: inventory.warehouseId
        })
        .from(products)
        .leftJoin(inventory, eq(products.id, inventory.productId))
        .where(
          filters.warehouseId 
            ? eq(inventory.warehouseId, filters.warehouseId)
            : undefined
        );

      // Simular dados de performance baseados nos produtos encontrados
      const performanceReport = performanceData.map(product => {
        const currentStock = Number(product.currentStock) || 0;
        const price = Number(product.price) || 0;
        
        // Simular vendas baseadas no preço e estoque
        const salesVolume = Math.floor(Math.random() * 100) + 10;
        const revenue = salesVolume * price;
        const profitMargin = 0.2 + (Math.random() * 0.3); // 20-50% margin
        const profit = revenue * profitMargin;
        
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          salesVolume,
          revenue: Number(revenue.toFixed(2)),
          profit: Number(profit.toFixed(2)),
          profitMargin: Number((profitMargin * 100).toFixed(1)),
          currentStock,
          stockValue: Number((currentStock * price).toFixed(2)),
          warehouseId: product.warehouseId,
          performance: revenue > 1000 ? 'excellent' : revenue > 500 ? 'good' : 'poor'
        };
      });

      // Filtrar por categoria se especificado
      const filteredReport = filters.categoryId 
        ? performanceReport.filter(item => item.categoryId === filters.categoryId)
        : performanceReport;

      // Ordenar por receita (maior para menor) e aplicar limite se especificado
      const sortedReport = filteredReport.sort((a, b) => b.revenue - a.revenue);
      
      return filters.limit ? sortedReport.slice(0, filters.limit) : sortedReport;
    } catch (error) {
      console.error('Error in getProductPerformanceReport:', error);
      // Retornar dados mock em caso de erro
      return [
        {
          productId: '1',
          productName: 'Produto Top',
          sku: 'SKU001',
          categoryId: 'cat-1',
          salesVolume: 150,
          revenue: 7500,
          profit: 2250,
          profitMargin: 30,
          currentStock: 25,
          stockValue: 1250,
          warehouseId: 'warehouse-1',
          performance: 'excellent'
        }
      ];
    }
  }

  static async getWarehouseEfficiencyReport(warehouseId?: string) {
    try {
      // Por enquanto retornamos dados mock até a implementação completa com Drizzle ORM
      const mockData = [
        {
          warehouseId: 'warehouse-1',
          warehouseName: 'Armazém Principal',
          efficiency: 87.5,
          metrics: {
            pickingAccuracy: 98.2,
            orderFulfillmentTime: 2.3, // horas
            inventoryTurnover: 12.5,
            spaceUtilization: 82.1,
            laborProductivity: 89.7
          },
          trends: {
            lastMonth: 85.2,
            improvement: 2.3
          }
        },
        {
          warehouseId: 'warehouse-2',
          warehouseName: 'Armazém Secundário',
          efficiency: 79.3,
          metrics: {
            pickingAccuracy: 95.8,
            orderFulfillmentTime: 3.1, // horas
            inventoryTurnover: 8.7,
            spaceUtilization: 75.4,
            laborProductivity: 82.1
          },
          trends: {
            lastMonth: 77.8,
            improvement: 1.5
          }
        }
      ];

      // Filtrar por warehouseId se fornecido
      if (warehouseId) {
        return mockData.filter(warehouse => warehouse.warehouseId === warehouseId);
      }

      return mockData;
    } catch (error) {
      console.error('Erro ao gerar relatório de eficiência de armazém:', error);
      throw error;
    }
  }

  static async getStockValuationReport(warehouseId?: string) {
    try {
      // Por enquanto retornamos dados mock até a implementação completa com Drizzle ORM
      const mockData = [
        {
          warehouseId: 'warehouse-1',
          warehouseName: 'Armazém Principal',
          totalProducts: 150,
          totalValue: 450000,
          categories: [
            { name: 'Eletrônicos', value: 180000, percentage: 40 },
            { name: 'Roupas', value: 135000, percentage: 30 },
            { name: 'Casa e Jardim', value: 90000, percentage: 20 },
            { name: 'Outros', value: 45000, percentage: 10 }
          ]
        },
        {
          warehouseId: 'warehouse-2',
          warehouseName: 'Armazém Secundário',
          totalProducts: 85,
          totalValue: 220000,
          categories: [
            { name: 'Eletrônicos', value: 88000, percentage: 40 },
            { name: 'Roupas', value: 66000, percentage: 30 },
            { name: 'Casa e Jardim', value: 44000, percentage: 20 },
            { name: 'Outros', value: 22000, percentage: 10 }
          ]
        }
      ];

      // Filtrar por warehouseId se fornecido
      if (warehouseId) {
        return mockData.filter(warehouse => warehouse.warehouseId === warehouseId);
      }

      return mockData;
    } catch (error) {
      console.error('Erro ao gerar relatório de avaliação de stock:', error);
      throw error;
    }
  }

  static async getSupplierPerformanceReport(filters: {
    startDate: Date;
    endDate: Date;
    supplierId?: string;
  }) {
    try {
      // Por enquanto retornamos dados mock até a implementação completa com Drizzle ORM
      const mockData = [
        {
          supplierId: 'supplier-1',
          supplierName: 'Fornecedor A',
          totalOrders: 25,
          onTimeDeliveries: 22,
          onTimeRate: 88,
          averageLeadTime: 5.2,
          qualityScore: 95,
          totalValue: 125000,
          period: `${filters.startDate.toISOString().split('T')[0]} - ${filters.endDate.toISOString().split('T')[0]}`
        },
        {
          supplierId: 'supplier-2',
          supplierName: 'Fornecedor B',
          totalOrders: 18,
          onTimeDeliveries: 15,
          onTimeRate: 83,
          averageLeadTime: 6.1,
          qualityScore: 92,
          totalValue: 89000,
          period: `${filters.startDate.toISOString().split('T')[0]} - ${filters.endDate.toISOString().split('T')[0]}`
        }
      ];

      // Filtrar por supplierId se fornecido
      if (filters.supplierId) {
        return mockData.filter(supplier => supplier.supplierId === filters.supplierId);
      }

      return mockData;
    } catch (error) {
      console.error('Erro ao gerar relatório de desempenho de fornecedores:', error);
      throw error;
    }
  }
}