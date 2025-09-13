import { Request, Response } from 'express';
import { CarriersModel } from './carriers.model';
import { BaseController } from '../base/base.controller';
import { z } from 'zod';

// Schema de validação para filtros
const filtersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['internal', 'external', 'all']).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'type', 'created_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Schema de validação para criação de transportadora
const createCarrierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório').max(50, 'Código deve ter no máximo 50 caracteres'),
  type: z.enum(['internal', 'external']).default('external'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  taxId: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional()
});

// Schema de validação para atualização de transportadora
const updateCarrierSchema = createCarrierSchema.partial().omit({ code: true });

const carriersModel = new CarriersModel();

export class CarriersController {
  /**
   * Listar transportadoras com filtros e paginação
   */
  static async getCarriers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Validar filtros
      const rawFilters = filtersSchema.parse({
        search: req.query.search,
        type: req.query.type,
        status: req.query.status,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'asc'
      });

      // Processar filtros para remover valores 'all'
      const filters = {
        ...rawFilters,
        type: rawFilters.type === 'all' ? undefined : rawFilters.type,
        // Converter status para isActive se necessário
        isActive: rawFilters.status === 'all' ? rawFilters.isActive : 
                 rawFilters.status === 'active' ? true :
                 rawFilters.status === 'inactive' ? false : rawFilters.isActive
      };
      
      // Remover o campo status do objeto final
      delete (filters as any).status;

      const result = await carriersModel.getCarriers(page, limit, filters);
      res.json(result);
    } catch (error) {
      console.error('Error fetching carriers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar transportadoras", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Buscar transportadora por ID
   */
  static async getCarrierById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const carrier = await carriersModel.getCarrierById(id);
      
      if (!carrier) {
        return res.status(404).json({ message: 'Transportadora não encontrada' });
      }
      
      res.json(carrier);
    } catch (error) {
      console.error('Error fetching carrier:', error);
      res.status(500).json({ 
        message: "Erro ao buscar transportadora", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Criar nova transportadora
   */
  static async createCarrier(req: Request, res: Response) {
    try {
      // Validar dados de entrada
      const carrierData = createCarrierSchema.parse(req.body);
      
      // Verificar se o código já existe
      const isCodeUnique = await carriersModel.isCodeUnique(carrierData.code);
      if (!isCodeUnique) {
        return res.status(400).json({ 
          message: 'Código da transportadora já existe',
          field: 'code'
        });
      }
      
      const newCarrier = await carriersModel.createCarrier(carrierData);
      res.status(201).json(newCarrier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      console.error('Error creating carrier:', error);
      res.status(500).json({ 
        message: "Erro ao criar transportadora", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Atualizar transportadora
   */
  static async updateCarrier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se a transportadora existe
      const existingCarrier = await carriersModel.getCarrierById(id);
      if (!existingCarrier) {
        return res.status(404).json({ message: 'Transportadora não encontrada' });
      }
      
      // Validar dados de entrada
      const carrierData = updateCarrierSchema.parse(req.body);
      
      const updatedCarrier = await carriersModel.updateCarrier(id, carrierData);
      res.json(updatedCarrier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Dados inválidos', 
          errors: error.errors 
        });
      }
      
      console.error('Error updating carrier:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar transportadora", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Deletar transportadora
   */
  static async deleteCarrier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se a transportadora existe
      const existingCarrier = await carriersModel.getCarrierById(id);
      if (!existingCarrier) {
        return res.status(404).json({ message: 'Transportadora não encontrada' });
      }
      
      const deleted = await carriersModel.deleteCarrier(id);
      
      if (deleted) {
        res.json({ message: 'Transportadora deletada com sucesso' });
      } else {
        res.status(500).json({ message: 'Erro ao deletar transportadora' });
      }
    } catch (error) {
      console.error('Error deleting carrier:', error);
      res.status(500).json({ 
        message: "Erro ao deletar transportadora", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Buscar transportadoras ativas para seleção
   */
  static async getActiveCarriers(req: Request, res: Response) {
    try {
      const carriers = await carriersModel.getActiveCarriers();
      res.json(carriers);
    } catch (error) {
      console.error('Error fetching active carriers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar transportadoras ativas", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Buscar apenas transportadoras internas ativas
   */
  static async getInternalCarriers(req: Request, res: Response) {
    try {
      const result = await carriersModel.getCarriers(1, 100, {
        type: 'internal',
        isActive: true,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      res.json(result.carriers);
    } catch (error) {
      console.error('Error fetching internal carriers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar transportadoras internas", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verificar se código é único
   */
  static async checkCodeUniqueness(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { excludeId } = req.query;
      
      const isUnique = await carriersModel.isCodeUnique(code, excludeId as string);
      res.json({ isUnique });
    } catch (error) {
      console.error('Error checking code uniqueness:', error);
      res.status(500).json({ 
        message: "Erro ao verificar unicidade do código", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Garantir que existe transportadora interna
   */
  static async ensureInternalCarrier(req: Request, res: Response) {
    try {
      const internalCarrier = await carriersModel.ensureInternalCarrier();
      res.json(internalCarrier);
    } catch (error) {
      console.error('Error ensuring internal carrier:', error);
      res.status(500).json({ 
        message: "Erro ao garantir transportadora interna", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}