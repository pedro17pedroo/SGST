import { Request, Response } from 'express';
import { WarehousesModel } from './warehouses.model';
import { BaseController } from '../base/base.controller';
import { storage } from '../../storage/index';
import { z } from 'zod';

// Schema de validação para criação de armazém
const createWarehouseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

// Schema de validação para atualização de armazém
const updateWarehouseSchema = createWarehouseSchema.partial();

export class WarehousesController extends BaseController {
  static async getWarehouses(req: Request, res: Response) {
    const controller = new WarehousesController();
    try {
      const { page, limit } = controller.validatePagination(req);
      const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      // Para manter compatibilidade, vamos buscar todos e implementar paginação simples
      const allWarehouses = await WarehousesModel.getWarehouses();
      
      // Filtrar por busca se fornecida
      let filteredWarehouses = allWarehouses;
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        filteredWarehouses = allWarehouses.filter(warehouse => 
          warehouse.name.toLowerCase().includes(searchLower) ||
          (warehouse.address && warehouse.address.toLowerCase().includes(searchLower))
        );
      }
      
      // Ordenar
      filteredWarehouses.sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a] || '';
        const bValue = b[sortBy as keyof typeof b] || '';
        const comparison = aValue.toString().localeCompare(bValue.toString());
        return sortOrder === 'desc' ? -comparison : comparison;
      });
      
      // Paginação
      const total = filteredWarehouses.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedWarehouses = filteredWarehouses.slice(startIndex, startIndex + limit);
      
      return controller.sendSuccessWithPagination(
        res,
        paginatedWarehouses,
        { page, limit, total, totalPages },
        'Armazéns carregados com sucesso'
      );
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar armazéns');
    }
  }

  static async getWarehouseStock(req: Request, res: Response) {
    const controller = new WarehousesController();
    try {
      const { id } = req.params;
      
      if (!id) {
        return controller.sendError(res, 'ID do armazém é obrigatório', 'ID não fornecido');
      }

      // Verificar se o armazém existe
      const warehouse = await WarehousesModel.getWarehouse(id);
      if (!warehouse) {
        return controller.sendError(res, 'Armazém não encontrado', 'Armazém não existe');
      }

      // Obter contagem de produtos no armazém
      const stockCount = await storage.inventory.getWarehouseStock(id);
      
      return controller.sendSuccess(
        res,
        { warehouseId: id, productCount: stockCount },
        'Contagem de produtos obtida com sucesso'
      );
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao obter contagem de produtos do armazém');
    }
  }

  static async getWarehouse(req: Request, res: Response) {
    const controller = new WarehousesController();
    try {
      const id = controller.validateId(req);
      const warehouse = await WarehousesModel.getWarehouse(id);
      
      controller.ensureResourceExists(warehouse, 'Armazém');
      
      return controller.sendSuccess(res, warehouse, 'Armazém encontrado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar armazém');
    }
  }

  static async createWarehouse(req: Request, res: Response) {
    const controller = new WarehousesController();
    try {
      const validatedData = controller.validateBody(req, createWarehouseSchema);
      const warehouse = await WarehousesModel.createWarehouse(validatedData);
      
      return controller.sendSuccess(res, warehouse, 'Armazém criado com sucesso', 201);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao criar armazém');
    }
  }

  static async updateWarehouse(req: Request, res: Response) {
    const controller = new WarehousesController();
    try {
      const id = controller.validateId(req);
      const validatedData = controller.validateBody(req, updateWarehouseSchema);
      
      // Verificar se o armazém existe antes de atualizar
      const existingWarehouse = await WarehousesModel.getWarehouse(id);
      controller.ensureResourceExists(existingWarehouse, 'Armazém');
      
      const warehouse = await WarehousesModel.updateWarehouse(id, validatedData);
      
      return controller.sendSuccess(res, warehouse, 'Armazém atualizado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao atualizar armazém');
    }
  }

  static async toggleWarehouseStatus(req: Request, res: Response) {
    const controller = new WarehousesController();
    try {
      const id = controller.validateId(req);
      
      // Verificar se o armazém existe
      const existingWarehouse = await WarehousesModel.getWarehouse(id);
      controller.ensureResourceExists(existingWarehouse, 'Armazém');
      
      // Alternar o status isActive
      const newStatus = !existingWarehouse!.isActive;
      const updatedWarehouse = await WarehousesModel.updateWarehouse(id, { isActive: newStatus });
      
      const statusMessage = newStatus ? 'ativado' : 'desativado';
      return controller.sendSuccess(
        res, 
        updatedWarehouse, 
        `Armazém ${statusMessage} com sucesso`
      );
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao alterar status do armazém');
    }
  }
}