import { Request, Response } from 'express';
import { WarehousesModel } from './warehouses.model';

export class WarehousesController {
  static async getWarehouses(req: Request, res: Response) {
    try {
      const warehouses = await WarehousesModel.getWarehouses();
      res.json(warehouses);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      res.status(500).json({ 
        message: "Erro ao buscar armazéns", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const warehouse = await WarehousesModel.getWarehouse(id);
      
      if (!warehouse) {
        return res.status(404).json({ message: "Armazém não encontrado" });
      }
      
      res.json(warehouse);
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      res.status(500).json({ 
        message: "Erro ao buscar armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createWarehouse(req: Request, res: Response) {
    try {
      const warehouse = await WarehousesModel.createWarehouse(req.body);
      res.status(201).json(warehouse);
    } catch (error) {
      console.error('Error creating warehouse:', error);
      res.status(500).json({ 
        message: "Erro ao criar armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const warehouse = await WarehousesModel.updateWarehouse(id, req.body);
      res.json(warehouse);
    } catch (error) {
      console.error('Error updating warehouse:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteWarehouse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await WarehousesModel.deleteWarehouse(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}