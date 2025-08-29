import { Request, Response } from 'express';
import { SuppliersModel } from './suppliers.model';

export class SuppliersController {
  static async getSuppliers(req: Request, res: Response) {
    try {
      const suppliers = await SuppliersModel.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar fornecedores", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await SuppliersModel.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Fornecedor não encontrado" });
      }
      
      res.json(supplier);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      res.status(500).json({ 
        message: "Erro ao buscar fornecedor", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createSupplier(req: Request, res: Response) {
    try {
      const supplier = await SuppliersModel.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
      res.status(500).json({ 
        message: "Erro ao criar fornecedor", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await SuppliersModel.updateSupplier(id, req.body);
      res.json(supplier);
    } catch (error) {
      console.error('Error updating supplier:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar fornecedor", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await SuppliersModel.deleteSupplier(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar fornecedor", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}