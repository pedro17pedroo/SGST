import { db } from '../../db';
import { 
  replenishmentRules, 
  demandForecasts,
  products,
  inventory,
  suppliers,
  warehouses
} from '../../../shared/schema';
import { eq, and, desc, sql, lt, lte, gte } from 'drizzle-orm';
import type { 
  InsertReplenishmentRule,
  InsertDemandForecast
} from '../../../shared/schema';

export class IntelligentReplenishmentModel {
  // Replenishment Rules Management
  static async createReplenishmentRule(data: InsertReplenishmentRule) {
    const [result] = await db.insert(replenishmentRules).values(data).returning();
    return result;
  }

  static async getAllReplenishmentRules(warehouseId?: string) {
    if (warehouseId) {
      return await db
        .select({
          rule: replenishmentRules,
          product: products,
          warehouse: warehouses,
          supplier: suppliers
        })
        .from(replenishmentRules)
        .leftJoin(products, eq(replenishmentRules.productId, products.id))
        .leftJoin(warehouses, eq(replenishmentRules.warehouseId, warehouses.id))
        .leftJoin(suppliers, eq(replenishmentRules.preferredSupplierId, suppliers.id))
        .where(eq(replenishmentRules.warehouseId, warehouseId))
        .orderBy(desc(replenishmentRules.createdAt));
    }

    return await db
      .select({
        rule: replenishmentRules,
        product: products,
        warehouse: warehouses,
        supplier: suppliers
      })
      .from(replenishmentRules)
      .leftJoin(products, eq(replenishmentRules.productId, products.id))
      .leftJoin(warehouses, eq(replenishmentRules.warehouseId, warehouses.id))
      .leftJoin(suppliers, eq(replenishmentRules.preferredSupplierId, suppliers.id))
      .orderBy(desc(replenishmentRules.createdAt));
  }

  static async getReplenishmentRuleById(id: string) {
    return await db
      .select({
        rule: replenishmentRules,
        product: products,
        warehouse: warehouses,
        supplier: suppliers
      })
      .from(replenishmentRules)
      .leftJoin(products, eq(replenishmentRules.productId, products.id))
      .leftJoin(warehouses, eq(replenishmentRules.warehouseId, warehouses.id))
      .leftJoin(suppliers, eq(replenishmentRules.preferredSupplierId, suppliers.id))
      .where(eq(replenishmentRules.id, id));
  }

  static async updateReplenishmentRule(id: string, data: Partial<InsertReplenishmentRule>) {
    const [result] = await db
      .update(replenishmentRules)
      .set(data)
      .where(eq(replenishmentRules.id, id))
      .returning();
    return result;
  }

  static async deleteReplenishmentRule(id: string) {
    const [result] = await db
      .delete(replenishmentRules)
      .where(eq(replenishmentRules.id, id))
      .returning();
    return result;
  }

  // Demand Forecasting
  static async createDemandForecast(data: InsertDemandForecast) {
    const [result] = await db.insert(demandForecasts).values(data).returning();
    return result;
  }

  static async getAllDemandForecasts(productId?: string, warehouseId?: string) {
    if (productId && warehouseId) {
      return await db
        .select({
          forecast: demandForecasts,
          product: products,
          warehouse: warehouses
        })
        .from(demandForecasts)
        .leftJoin(products, eq(demandForecasts.productId, products.id))
        .leftJoin(warehouses, eq(demandForecasts.warehouseId, warehouses.id))
        .where(and(
          eq(demandForecasts.productId, productId),
          eq(demandForecasts.warehouseId, warehouseId)
        ))
        .orderBy(desc(demandForecasts.forecastDate));
    }

    if (productId) {
      return await db
        .select({
          forecast: demandForecasts,
          product: products,
          warehouse: warehouses
        })
        .from(demandForecasts)
        .leftJoin(products, eq(demandForecasts.productId, products.id))
        .leftJoin(warehouses, eq(demandForecasts.warehouseId, warehouses.id))
        .where(eq(demandForecasts.productId, productId))
        .orderBy(desc(demandForecasts.forecastDate));
    }

    if (warehouseId) {
      return await db
        .select({
          forecast: demandForecasts,
          product: products,
          warehouse: warehouses
        })
        .from(demandForecasts)
        .leftJoin(products, eq(demandForecasts.productId, products.id))
        .leftJoin(warehouses, eq(demandForecasts.warehouseId, warehouses.id))
        .where(eq(demandForecasts.warehouseId, warehouseId))
        .orderBy(desc(demandForecasts.forecastDate));
    }

    return await db
      .select({
        forecast: demandForecasts,
        product: products,
        warehouse: warehouses
      })
      .from(demandForecasts)
      .leftJoin(products, eq(demandForecasts.productId, products.id))
      .leftJoin(warehouses, eq(demandForecasts.warehouseId, warehouses.id))
      .orderBy(desc(demandForecasts.forecastDate));
  }

  static async getDemandForecastById(id: string) {
    return await db
      .select({
        forecast: demandForecasts,
        product: products,
        warehouse: warehouses
      })
      .from(demandForecasts)
      .leftJoin(products, eq(demandForecasts.productId, products.id))
      .leftJoin(warehouses, eq(demandForecasts.warehouseId, warehouses.id))
      .where(eq(demandForecasts.id, id));
  }

  // ML Demand Forecasting Algorithm
  static async generateDemandForecast(productId: string, warehouseId: string, forecastDays: number = 30) {
    // Mock ML algorithm - in real implementation, this would use actual ML models
    // like ARIMA, Prophet, or neural networks trained on historical data
    
    // Simulate historical analysis
    const historicalData = await this.getHistoricalDemand(productId, warehouseId, 90);
    const seasonalityFactors = this.analyzeSeasonal(historicalData);
    const trendFactor = this.calculateTrend(historicalData);
    
    // Generate forecasts for the specified period
    const forecasts = [];
    const baseDate = new Date();
    
    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(baseDate);
      forecastDate.setDate(baseDate.getDate() + i);
      
      // Mock ML prediction algorithm
      const baseDemand = this.calculateBaseDemand(historicalData);
      const seasonalAdjustment = seasonalityFactors[forecastDate.getDay()];
      const trendAdjustment = trendFactor * i;
      const randomVariance = (Math.random() - 0.5) * 0.2; // ±10% variance
      
      const forecastedDemand = Math.max(0, Math.round(
        baseDemand * (1 + seasonalAdjustment) * (1 + trendAdjustment) * (1 + randomVariance)
      ));
      
      const confidence = this.calculateConfidence(i, historicalData.length);
      
      forecasts.push({
        productId,
        warehouseId,
        forecastDate,
        demandQuantity: forecastedDemand,
        confidenceLevel: confidence,
        modelUsed: 'SGST_ML_v1.0',
        parameters: {
          baselineDemand: baseDemand,
          seasonalityFactor: seasonalAdjustment,
          trendFactor: trendAdjustment,
          variance: randomVariance
        }
      });
    }
    
    // Save forecasts to database
    for (const forecast of forecasts) {
      await this.createDemandForecast(forecast);
    }
    
    return forecasts;
  }

  static async getHistoricalDemand(productId: string, warehouseId: string, days: number) {
    // Mock historical data - in real implementation, this would query actual sales/movement data
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);
    
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
      demand: Math.floor(Math.random() * 50) + 10 // Mock demand 10-59 units
    }));
  }

  static analyzeSeasonal(historicalData: any[]) {
    // Mock seasonal analysis - returns adjustment factors for each day of week
    return {
      0: 0.8,  // Sunday - 20% less
      1: 1.2,  // Monday - 20% more
      2: 1.1,  // Tuesday - 10% more
      3: 1.0,  // Wednesday - baseline
      4: 1.1,  // Thursday - 10% more
      5: 1.3,  // Friday - 30% more
      6: 0.9   // Saturday - 10% less
    };
  }

  static calculateTrend(historicalData: any[]) {
    // Mock trend calculation - returns daily growth rate
    if (historicalData.length < 2) return 0;
    
    const recent = historicalData.slice(-7);
    const older = historicalData.slice(0, 7);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.demand, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.demand, 0) / older.length;
    
    return (recentAvg - olderAvg) / olderAvg / historicalData.length;
  }

  static calculateBaseDemand(historicalData: any[]) {
    if (historicalData.length === 0) return 20; // Default
    return historicalData.reduce((sum, d) => sum + d.demand, 0) / historicalData.length;
  }

  static calculateConfidence(daysAhead: number, dataPoints: number) {
    // Confidence decreases with forecast horizon and increases with more data
    const horizonFactor = Math.max(0.3, 1 - (daysAhead / 100));
    const dataFactor = Math.min(1, dataPoints / 90);
    return Math.round((horizonFactor * dataFactor) * 100);
  }

  // Stock-out Alert System
  static async checkStockoutRisks(warehouseId?: string) {
    const alerts = [];
    
    // Get active replenishment rules
    const rules = await this.getAllReplenishmentRules(warehouseId);
    
    for (const ruleData of rules) {
      const rule = ruleData.rule;
      const product = ruleData.product;
      
      if (!rule || !product) continue;
      
      // Get current inventory level
      const currentStock = await this.getCurrentStock(rule.productId, rule.warehouseId);
      
      // Get latest demand forecast
      const forecasts = await this.getLatestForecasts(rule.productId, rule.warehouseId, 7);
      const predictedDemand = forecasts.reduce((sum, f) => sum + f.forecast.demandQuantity, 0);
      
      // Calculate days of stock remaining
      const dailyDemand = predictedDemand / 7;
      const daysRemaining = dailyDemand > 0 ? currentStock / dailyDemand : 999;
      
      // Check against thresholds
      let riskLevel = 'low';
      let message = '';
      
      if (currentStock <= rule.minimumStock) {
        riskLevel = 'critical';
        message = `Stock abaixo do mínimo (${currentStock} ≤ ${rule.minimumStock})`;
      } else if (daysRemaining <= rule.leadTimeDays) {
        riskLevel = 'high';
        message = `Stock insuficiente para lead time (${Math.round(daysRemaining)} dias restantes)`;
      } else if (daysRemaining <= rule.leadTimeDays * 1.5) {
        riskLevel = 'medium';
        message = `Stock baixo - reabastecer em breve (${Math.round(daysRemaining)} dias restantes)`;
      }
      
      if (riskLevel !== 'low') {
        alerts.push({
          productId: rule.productId,
          productName: product?.name,
          warehouseId: rule.warehouseId,
          currentStock,
          minimumStock: rule.minimumStock,
          maximumStock: rule.maximumStock,
          predictedDemand: Math.round(predictedDemand),
          daysRemaining: Math.round(daysRemaining),
          riskLevel,
          message,
          suggestedAction: this.getSuggestedAction(rule, currentStock, predictedDemand)
        });
      }
    }
    
    return alerts;
  }

  static async getCurrentStock(productId: string, warehouseId: string) {
    // Mock current stock - in real implementation, this would query inventory table
    return Math.floor(Math.random() * 200) + 10; // Mock 10-209 units
  }

  static async getLatestForecasts(productId: string, warehouseId: string, days: number) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return await db
      .select()
      .from(demandForecasts)
      .where(and(
        eq(demandForecasts.productId, productId),
        eq(demandForecasts.warehouseId, warehouseId),
        lte(demandForecasts.forecastDate, endDate)
      ))
      .orderBy(demandForecasts.forecastDate)
      .limit(days);
  }

  static getSuggestedAction(rule: any, currentStock: number, predictedDemand: number) {
    const reorderQuantity = Math.max(
      rule.maximumStock - currentStock,
      rule.economicOrderQuantity || predictedDemand
    );
    
    return {
      action: 'create_purchase_order',
      quantity: reorderQuantity,
      urgency: currentStock <= rule.minimumStock ? 'immediate' : 'normal',
      estimatedCost: reorderQuantity * (rule.lastCost || 10) // Mock cost
    };
  }

  // Automatic Replenishment
  static async generateReplenishmentOrders(warehouseId?: string) {
    const alerts = await this.checkStockoutRisks(warehouseId);
    const orders = [];
    
    for (const alert of alerts) {
      if (alert.riskLevel === 'critical' || alert.riskLevel === 'high') {
        // Get replenishment rule
        const rules = await db
          .select()
          .from(replenishmentRules)
          .where(and(
            eq(replenishmentRules.productId, alert.productId),
            eq(replenishmentRules.warehouseId, alert.warehouseId),
            eq(replenishmentRules.isActive, true)
          ));
        
        if (rules.length > 0) {
          const rule = rules[0];
          
          const order = {
            orderNumber: `REP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            productId: alert.productId,
            warehouseId: alert.warehouseId,
            supplierId: rule.preferredSupplierId,
            quantity: alert.suggestedAction.quantity,
            urgency: alert.suggestedAction.urgency,
            estimatedCost: alert.suggestedAction.estimatedCost,
            reason: alert.message,
            riskLevel: alert.riskLevel,
            autoGenerated: true,
            leadTimeDays: rule.leadTimeDays,
            expectedDelivery: new Date(Date.now() + rule.leadTimeDays * 24 * 60 * 60 * 1000)
          };
          
          orders.push(order);
        }
      }
    }
    
    return orders;
  }

  static async getReplenishmentStats(warehouseId?: string) {
    const [stats] = await db
      .select({
        totalRules: sql<number>`count(*)`,
        activeRules: sql<number>`count(*) filter (where is_active = true)`,
        averageLeadTime: sql<number>`avg(lead_time_days)`,
        averageEOQ: sql<number>`avg(economic_order_quantity)`
      })
      .from(replenishmentRules)
      .where(warehouseId ? eq(replenishmentRules.warehouseId, warehouseId) : undefined);

    return stats;
  }

  static async getAdvancedAnalytics(warehouseId?: string) {
    // Mock advanced analytics - in real implementation, this would use complex algorithms
    return {
      inventoryTurnover: 4.2,
      stockoutFrequency: 0.03, // 3% of items
      carryingCostOptimization: 0.15, // 15% potential savings
      demandVariability: 0.22, // 22% coefficient of variation
      forecastAccuracy: 0.87, // 87% accuracy
      automationRate: 0.65, // 65% of replenishments automated
      recommendations: [
        {
          type: 'reduce_safety_stock',
          products: ['high-velocity items'],
          impact: 'Reduce carrying costs by 8%'
        },
        {
          type: 'increase_frequency',
          products: ['seasonal items'],
          impact: 'Improve service level by 12%'
        },
        {
          type: 'optimize_eoq',
          products: ['bulk items'],
          impact: 'Reduce ordering costs by 15%'
        }
      ]
    };
  }
}