import { Request, Response } from 'express';
import { DashboardModel } from './dashboard.model';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await DashboardModel.getStats();
      res.json(stats);
    } catch (error) {
      // Error fetching dashboard stats
      res.status(500).json({ 
        message: "Erro ao buscar estatísticas", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getTopProducts(req: Request, res: Response) {
    try {
      const products = await DashboardModel.getTopProducts();
      res.json(products);
    } catch (error) {
      // Error fetching top products
      res.status(500).json({ 
        message: "Erro ao buscar produtos principais", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRecentActivities(req: Request, res: Response) {
    try {
      const activities = await DashboardModel.getRecentActivities();
      res.json(activities);
    } catch (error) {
      // Error fetching recent activities
      res.status(500).json({ 
        message: "Erro ao buscar atividades recentes", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOverview(req: Request, res: Response) {
    try {
      const overview = await DashboardModel.getOverview();
      res.json(overview);
    } catch (error) {
      // Error fetching dashboard overview
      res.status(500).json({ 
        message: "Erro ao carregar dashboard", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}