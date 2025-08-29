import { Request, Response } from 'express';
import { InventoryModel } from './inventory.model';

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
}