import { Request, Response } from 'express';
import { CategoryModel } from './category.model';
import { z } from 'zod';

// Schema de validação para categoria
const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string().optional().nullable()
});

const categoryUpdateSchema = categorySchema.partial();

export class CategoryController {
  /**
   * Obter todas as categorias
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryModel.getAll();
      res.json(categories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ 
        message: "Erro ao buscar categorias", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obter categoria por ID
   */
  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.getById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ 
        message: "Erro ao buscar categoria", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Criar nova categoria
   */
  static async createCategory(req: Request, res: Response) {
    try {
      const validation = categorySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const category = await CategoryModel.create(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      
      // Verificar se é erro de duplicação (nome já existe)
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          message: 'Já existe uma categoria com este nome' 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar categoria", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Atualizar categoria
   */
  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validation = categoryUpdateSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const category = await CategoryModel.update(id, validation.data);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      
      // Verificar se é erro de duplicação (nome já existe)
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ 
          message: 'Já existe uma categoria com este nome' 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar categoria", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Eliminar categoria
   */
  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se a categoria tem produtos associados
      const hasProducts = await CategoryModel.hasProducts(id);
      if (hasProducts) {
        return res.status(400).json({ 
          message: 'Não é possível eliminar categoria com produtos associados' 
        });
      }
      
      const deleted = await CategoryModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao eliminar categoria:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar categoria", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Obter produtos de uma categoria
   */
  static async getCategoryProducts(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const products = await CategoryModel.getProducts(id);
      res.json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos da categoria:', error);
      res.status(500).json({ 
        message: "Erro ao buscar produtos da categoria", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}