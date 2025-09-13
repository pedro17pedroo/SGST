import { Request, Response } from 'express';
import { VehicleTypesModel } from './vehicle-types.model';
import { z } from 'zod';

// Schema de validação para filtros
const filtersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'category', 'created_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Schema de validação para criação de tipo de veículo
const createVehicleTypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória').max(50, 'Categoria deve ter no máximo 50 caracteres'),
  isActive: z.boolean().default(true)
});

// Schema de validação para atualização de tipo de veículo
const updateVehicleTypeSchema = createVehicleTypeSchema.partial();

const vehicleTypesModel = new VehicleTypesModel();

export class VehicleTypesController {
  /**
   * Listar tipos de veículo com filtros e paginação
   */
  static async getVehicleTypes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Validar filtros
      const rawFilters = filtersSchema.parse({
        search: req.query.search,
        category: req.query.category,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'asc'
      });

      const result = await vehicleTypesModel.getVehicleTypes(page, limit, rawFilters);
      
      res.json({
        success: true,
        data: result,
        message: 'Tipos de veículo listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar tipos de veículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar tipo de veículo por ID
   */
  static async getVehicleTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vehicleType = await vehicleTypesModel.getVehicleTypeById(id);
      
      if (!vehicleType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de veículo não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: vehicleType,
        message: 'Tipo de veículo encontrado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar tipo de veículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Criar novo tipo de veículo
   */
  static async createVehicleType(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validatedData = createVehicleTypeSchema.parse(req.body);
      
      // Verificar se o nome já existe
      const isUnique = await vehicleTypesModel.isNameUnique(validatedData.name);
      if (!isUnique) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um tipo de veículo com este nome'
        });
      }
      
      const vehicleType = await vehicleTypesModel.createVehicleType(validatedData);
      
      res.status(201).json({
        success: true,
        data: vehicleType,
        message: 'Tipo de veículo criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar tipo de veículo:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Atualizar tipo de veículo
   */
  static async updateVehicleType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se o tipo de veículo existe
      const existingVehicleType = await vehicleTypesModel.getVehicleTypeById(id);
      if (!existingVehicleType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de veículo não encontrado'
        });
      }
      
      // Validar dados de entrada
      const validatedData = updateVehicleTypeSchema.parse(req.body);
      
      // Verificar se o nome já existe (excluindo o atual)
      if (validatedData.name) {
        const isUnique = await vehicleTypesModel.isNameUnique(validatedData.name, id);
        if (!isUnique) {
          return res.status(400).json({
            success: false,
            message: 'Já existe um tipo de veículo com este nome'
          });
        }
      }
      
      const vehicleType = await vehicleTypesModel.updateVehicleType(id, validatedData);
      
      res.json({
        success: true,
        data: vehicleType,
        message: 'Tipo de veículo atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar tipo de veículo:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Excluir tipo de veículo
   */
  static async deleteVehicleType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se o tipo de veículo existe
      const existingVehicleType = await vehicleTypesModel.getVehicleTypeById(id);
      if (!existingVehicleType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de veículo não encontrado'
        });
      }
      
      const success = await vehicleTypesModel.deleteVehicleType(id);
      
      if (success) {
        res.json({
          success: true,
          message: 'Tipo de veículo excluído com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir tipo de veículo'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir tipo de veículo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar tipos de veículo ativos
   */
  static async getActiveVehicleTypes(req: Request, res: Response) {
    try {
      const vehicleTypes = await vehicleTypesModel.getActiveVehicleTypes();
      
      res.json({
        success: true,
        data: vehicleTypes,
        message: 'Tipos de veículo ativos listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de veículo ativos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Verificar se nome é único
   */
  static async checkNameUniqueness(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const { excludeId } = req.query;
      
      const isUnique = await vehicleTypesModel.isNameUnique(name, excludeId as string);
      
      res.json({
        success: true,
        data: { isUnique },
        message: isUnique ? 'Nome disponível' : 'Nome já está em uso'
      });
    } catch (error) {
      console.error('Erro ao verificar unicidade do nome:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar categorias únicas
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await vehicleTypesModel.getCategories();
      
      res.json({
        success: true,
        data: categories,
        message: 'Categorias listadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}