import { Request, Response } from 'express';
import { SuppliersModel } from './suppliers.model';
import { BaseController } from '../base/base.controller';
import { z } from 'zod';

// Schema de validação para filtros
const filtersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  category: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'phone', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Schema de validação para criação de fornecedor
const createSupplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  category: z.string().optional(),
  contactPerson: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional()
});

// Schema de validação para atualização de fornecedor
const updateSupplierSchema = createSupplierSchema.partial();

const suppliersModel = new SuppliersModel();

export class SuppliersController extends BaseController {
  static async getSuppliers(req: Request, res: Response) {
    const controller = new SuppliersController();
    try {
      // Validar parâmetros de paginação usando método da classe base
      const { page, limit } = controller.validatePagination(req);
      
      // Validar filtros
        const filtersResult = filtersSchema.safeParse(req.query);
        if (!filtersResult.success) {
          return controller.handleValidationError(res, filtersResult.error);
        }

      const filters = filtersResult.data;
      const result = await suppliersModel.getSuppliersWithFilters(
        page,
        limit,
        {
          search: filters.search || '',
          sortBy: filters.sortBy === 'createdAt' ? 'created_at' : filters.sortBy,
          sortOrder: filters.sortOrder
        }
      );
      
      return controller.sendSuccessWithPagination(
        res,
        result.suppliers,
        {
          page,
          limit,
          total: result.totalCount,
          totalPages: result.totalPages
        },
        'Fornecedores carregados com sucesso'
      );
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar fornecedores');
    }
  }

  static async getSupplier(req: Request, res: Response) {
    const controller = new SuppliersController();
    try {
      const id = controller.validateId(req);
      const supplier = await suppliersModel.getSupplierById(id);
      
      controller.ensureResourceExists(supplier, 'Fornecedor');
      
      return controller.sendSuccess(res, supplier, 'Fornecedor encontrado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar fornecedor');
    }
  }

  static async createSupplier(req: Request, res: Response) {
    const controller = new SuppliersController();
    try {
      const validatedData = controller.validateBody(req, createSupplierSchema);
      const supplier = await suppliersModel.createSupplier(validatedData);
      
      return controller.sendSuccess(res, supplier, 'Fornecedor criado com sucesso', 201);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao criar fornecedor');
    }
  }

  static async updateSupplier(req: Request, res: Response) {
    const controller = new SuppliersController();
    try {
      const id = controller.validateId(req);
      const validatedData = controller.validateBody(req, updateSupplierSchema);
      
      // Verificar se o fornecedor existe antes de atualizar
      const existingSupplier = await suppliersModel.getSupplierById(id);
      controller.ensureResourceExists(existingSupplier, 'Fornecedor');
      
      const supplier = await suppliersModel.updateSupplier(id, validatedData);
      
      return controller.sendSuccess(res, supplier, 'Fornecedor atualizado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao atualizar fornecedor');
    }
  }

  static async deleteSupplier(req: Request, res: Response) {
    const controller = new SuppliersController();
    try {
      const id = controller.validateId(req);
      
      // Verificar se o fornecedor existe antes de deletar
      const existingSupplier = await suppliersModel.getSupplierById(id);
      controller.ensureResourceExists(existingSupplier, 'Fornecedor');
      
      await suppliersModel.deleteSupplier(id);
      
      return controller.sendSuccess(res, null, 'Fornecedor removido com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao eliminar fornecedor');
    }
  }
}