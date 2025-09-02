import { storage } from '../../storage';

export class DashboardModel {
  static async getStats() {
    return await storage.getDashboardStats();
  }

  static async getTopProducts() {
    return await storage.getTopProducts();
  }

  static async getRecentActivities() {
    return await storage.getRecentActivities();
  }

  static async getOverview() {
    try {
      const [stats, topProducts, recentActivities] = await Promise.all([
        this.getStats(),
        this.getTopProducts(),
        this.getRecentActivities()
      ]);

      return {
        stats,
        topProducts,
        recentActivities
      };
    } catch (error) {
      throw new Error('Erro ao carregar dados do dashboard');
    }
  }
}