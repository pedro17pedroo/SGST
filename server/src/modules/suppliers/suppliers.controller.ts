import { Request, Response } from 'express';
import { SuppliersModel } from './suppliers.model';

const suppliersModel = new SuppliersModel();

export class SuppliersController {
  static async getSuppliers(req: Request, res: Response) {
    try {
      // Extrair parâmetros de query
      const {
        page = 1,
        limit = 5,
        search = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Converter para números
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      // Validar parâmetros
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ 
          message: "Parâmetros de paginação inválidos",
          error: "Page deve ser >= 1 e limit deve estar entre 1 e 100"
        });
      }

      // Buscar fornecedores com filtros e paginação
      const result = await suppliersModel.getSuppliersWithFilters(
        pageNum,
        limitNum,
        {
          search: search as string,
          sortBy: sortBy as 'name' | 'email' | 'phone' | 'createdAt',
          sortOrder: sortOrder as 'asc' | 'desc'
        }
      );

      res.json({
        data: result.suppliers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.totalCount,
          totalPages: result.totalPages
        },
        success: true,
        message: 'Fornecedores carregados com sucesso'
      });
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
      const supplier = await suppliersModel.getSupplierById(id);
      
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
      const supplier = await suppliersModel.createSupplier(req.body);
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
      const supplier = await suppliersModel.updateSupplier(id, req.body);
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
      await suppliersModel.deleteSupplier(id);
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