import { Request, Response } from 'express';
import { ReportsModel } from './reports.model';

export class ReportsController {
  // Relatórios básicos
  static async getSalesReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
        limit: parseInt(limit as string)
      };
      
      const report = await ReportsModel.getSalesReport(filters);
      res.json(report);
    } catch (error) {
      console.error('Error generating sales report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de vendas", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getInventoryReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
        limit: parseInt(limit as string)
      };
      
      const report = await ReportsModel.getInventoryReport(filters);
      res.json(report);
    } catch (error) {
      console.error('Error generating inventory report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de inventário", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPerformanceReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
        limit: parseInt(limit as string)
      };
      
      const report = await ReportsModel.getPerformanceReport(filters);
      res.json(report);
    } catch (error) {
      console.error('Error generating performance report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de performance", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Relatórios avançados
  static async getInventoryTurnoverReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, warehouseId, categoryId } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
        endDate: endDate ? new Date(endDate as string) : new Date(),
        warehouseId: warehouseId as string,
        categoryId: categoryId as string
      };
      
      const report = await ReportsModel.getInventoryTurnoverReport(filters);
      res.json(report);
    } catch (error) {
      console.error('Error generating inventory turnover report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de rotatividade", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getObsoleteInventoryReport(req: Request, res: Response) {
    try {
      const { daysWithoutMovement = 180, warehouseId, minValue } = req.query;
      
      const filters = {
        daysWithoutMovement: parseInt(daysWithoutMovement as string),
        warehouseId: warehouseId as string,
        minValue: minValue ? parseFloat(minValue as string) : 0
      };
      
      const report = await ReportsModel.getObsoleteInventoryReport(filters);
      res.json(report);
    } catch (error) {
      console.error('Error generating obsolete inventory report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de inventário obsoleto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProductPerformanceReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
        limit: limit ? parseInt(limit as string) : 50
      };
      
      const report = await ReportsModel.getProductPerformanceReport(filters);
      res.json(report);
    } catch (error) {
      console.error('Error generating product performance report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de desempenho de produtos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWarehouseEfficiencyReport(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      
      const report = await ReportsModel.getWarehouseEfficiencyReport(warehouseId as string);
      res.json(report);
    } catch (error) {
      console.error('Error generating warehouse efficiency report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de eficiência de armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getStockValuationReport(req: Request, res: Response) {
    try {
      const { warehouseId } = req.query;
      
      const report = await ReportsModel.getStockValuationReport(warehouseId as string);
      res.json(report);
    } catch (error) {
      console.error('Error generating stock valuation report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de avaliação de stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSupplierPerformanceReport(req: Request, res: Response) {
    try {
      const { startDate, endDate, supplierId } = req.query;
      
      const filters = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
        supplierId: supplierId as string
      };
      
      const report = await ReportsModel.getSupplierPerformanceReport(filters);
      res.json(report);
    } catch (error) {
      console.error('Error generating supplier performance report:', error);
      res.status(500).json({ 
        message: "Erro ao gerar relatório de desempenho de fornecedores", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}