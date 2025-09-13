import { Request, Response } from 'express';
import { FuelTypesModel } from './fuel-types.model';
import { z } from 'zod';

// Schema de validação para filtros
const filtersSchema = z.object({
  search: z.string().optional(),
  unit: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'unit', 'created_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Schema de validação para criação de tipo de combustível
const createFuelTypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional(),
  unit: z.string().min(1, 'Unidade é obrigatória').max(20, 'Unidade deve ter no máximo 20 caracteres'),
  isActive: z.boolean().default(true)
});

// Schema de validação para atualização de tipo de combustível
const updateFuelTypeSchema = createFuelTypeSchema.partial();

const fuelTypesModel = new FuelTypesModel();

export class FuelTypesController {
  /**
   * Listar tipos de combustível com filtros e paginação
   */
  static async getFuelTypes(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Validar filtros
      const rawFilters = filtersSchema.parse({
        search: req.query.search,
        unit: req.query.unit,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'asc'
      });

      const result = await fuelTypesModel.getFuelTypes(page, limit, rawFilters);
      
      res.json({
        success: true,
        data: result,
        message: 'Tipos de combustível listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar tipos de combustível:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar tipo de combustível por ID
   */
  static async getFuelTypeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fuelType = await fuelTypesModel.getFuelTypeById(id);
      
      if (!fuelType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de combustível não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: fuelType,
        message: 'Tipo de combustível encontrado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar tipo de combustível:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Criar novo tipo de combustível
   */
  static async createFuelType(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const validatedData = createFuelTypeSchema.parse(req.body);
      
      // Verificar se o nome já existe
      const isUnique = await fuelTypesModel.isNameUnique(validatedData.name);
      if (!isUnique) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um tipo de combustível com este nome'
        });
      }
      
      const fuelType = await fuelTypesModel.createFuelType(validatedData);
      
      res.status(201).json({
        success: true,
        data: fuelType,
        message: 'Tipo de combustível criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar tipo de combustível:', error);
      
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
   * Atualizar tipo de combustível
   */
  static async updateFuelType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se o tipo de combustível existe
      const existingFuelType = await fuelTypesModel.getFuelTypeById(id);
      if (!existingFuelType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de combustível não encontrado'
        });
      }
      
      // Validar dados de entrada
      const validatedData = updateFuelTypeSchema.parse(req.body);
      
      // Verificar se o nome já existe (excluindo o atual)
      if (validatedData.name) {
        const isUnique = await fuelTypesModel.isNameUnique(validatedData.name, id);
        if (!isUnique) {
          return res.status(400).json({
            success: false,
            message: 'Já existe um tipo de combustível com este nome'
          });
        }
      }
      
      const fuelType = await fuelTypesModel.updateFuelType(id, validatedData);
      
      res.json({
        success: true,
        data: fuelType,
        message: 'Tipo de combustível atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar tipo de combustível:', error);
      
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
   * Excluir tipo de combustível
   */
  static async deleteFuelType(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se o tipo de combustível existe
      const existingFuelType = await fuelTypesModel.getFuelTypeById(id);
      if (!existingFuelType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de combustível não encontrado'
        });
      }
      
      const success = await fuelTypesModel.deleteFuelType(id);
      
      if (success) {
        res.json({
          success: true,
          message: 'Tipo de combustível excluído com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao excluir tipo de combustível'
        });
      }
    } catch (error) {
      console.error('Erro ao excluir tipo de combustível:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Buscar tipos de combustível ativos
   */
  static async getActiveFuelTypes(req: Request, res: Response) {
    try {
      const fuelTypes = await fuelTypesModel.getActiveFuelTypes();
      
      res.json({
        success: true,
        data: fuelTypes,
        message: 'Tipos de combustível ativos listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar tipos de combustível ativos:', error);
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
      
      const isUnique = await fuelTypesModel.isNameUnique(name, excludeId as string);
      
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
   * Buscar unidades únicas
   */
  static async getUnits(req: Request, res: Response) {
    try {
      const units = await fuelTypesModel.getUnits();
      
      res.json({
        success: true,
        data: units,
        message: 'Unidades listadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}