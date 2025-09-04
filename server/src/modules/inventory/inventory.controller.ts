import { Request, Response } from 'express';
import { InventoryModel } from './inventory.model';
import { storage } from '../../storage/index';

export class InventoryController {
  static async getLowStockProducts(req: Request, res: Response) {
    try {
      const products = await InventoryModel.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({ 
        message: "Erro ao buscar produtos com baixo stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getInventoryByWarehouse(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const inventory = await InventoryModel.getInventoryByWarehouse(warehouseId);
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching warehouse inventory:', error);
      res.status(500).json({ 
        message: "Erro ao buscar inventário do armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProductInventory(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const inventory = await InventoryModel.getProductInventory(productId);
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching product inventory:', error);
      res.status(500).json({ 
        message: "Erro ao buscar inventário do produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateInventory(req: Request, res: Response) {
    try {
      const { productId, warehouseId } = req.params;
      const { quantity } = req.body;
      
      const inventory = await InventoryModel.updateInventory(productId, warehouseId, quantity);
      res.json(inventory);
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar inventário", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAllInventory(req: Request, res: Response) {
    try {
      const inventory = await InventoryModel.getAllInventory();
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching all inventory:', error);
      res.status(500).json({ 
        message: "Erro ao buscar inventário", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getInventorySummary(req: Request, res: Response) {
    try {
      const summary = await InventoryModel.getInventorySummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      res.status(500).json({ 
        message: "Erro ao buscar resumo do inventário", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getStockMovements(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const movements = await storage.getStockMovements(limit ? parseInt(limit as string) : undefined);
      res.json(movements);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      res.status(500).json({ 
        message: "Erro ao buscar movimentações de stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createStockMovement(req: Request, res: Response) {
    try {
      const movement = await storage.createStockMovement(req.body);
      res.status(201).json(movement);
    } catch (error) {
      console.error('Error creating stock movement:', error);
      res.status(500).json({ 
        message: "Erro ao criar movimentação de stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWarehouseZones(req: Request, res: Response) {
    try {
      // TODO: Implementar quando as zonas de armazém forem definidas no schema
      const zones = [
        { id: '1', name: 'Zona A', description: 'Produtos de alta rotatividade', warehouseId: '1' },
        { id: '2', name: 'Zona B', description: 'Produtos de média rotatividade', warehouseId: '1' },
        { id: '3', name: 'Zona C', description: 'Produtos de baixa rotatividade', warehouseId: '1' }
      ];
      res.json(zones);
    } catch (error) {
      console.error('Error fetching warehouse zones:', error);
      res.status(500).json({ 
        message: "Erro ao buscar zonas do armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}