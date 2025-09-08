import { Request, Response } from 'express';
import { CategoryModel } from './category.model';
import { insertCategorySchema, updateCategorySchema } from '../../../../shared/schema';

// Interface para formatação de erros de validação
interface ValidationError {
  field: string;
  message: string;
}



export class CategoryController {
  /**
   * Obter todas as categorias com paginação
   */
  static async getCategories(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || 'name';
      const sortOrder = req.query.sortOrder as string || 'asc';

      const offset = (page - 1) * limit;
      
      // Buscar todas as categorias
      let categories = await CategoryModel.getAll();
      
      // Verificar se categories é válido
      if (!categories || !Array.isArray(categories)) {
        categories = [];
      }
      
      // Aplicar filtro de pesquisa se fornecido
      if (search) {
        const searchLower = search.toLowerCase();
        categories = categories.filter(category => 
          category.name.toLowerCase().includes(searchLower) ||
          (category.description && category.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Aplicar ordenação
      categories.sort((a, b) => {
        let aValue = a[sortBy as keyof typeof a] || '';
        let bValue = b[sortBy as keyof typeof b] || '';
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      });
      
      const total = categories.length;
      const totalPages = Math.ceil(total / limit);
      
      // Aplicar paginação
      const paginatedCategories = categories.slice(offset, offset + limit);
      
      res.json({
        data: paginatedCategories,
        success: true,
        message: 'Categorias carregadas com sucesso',
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error: unknown) {
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
      
      res.json({ data: category, success: true });
    } catch (error: unknown) {
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
      const validation = insertCategorySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: validation.error.issues.map((issue): ValidationError => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const category = await CategoryModel.create(validation.data);
      res.status(201).json({ data: category, success: true, message: 'Categoria criada com sucesso' });
    } catch (error: unknown) {
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
      const validation = updateCategorySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: validation.error.issues.map((issue): ValidationError => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      const category = await CategoryModel.update(id, validation.data);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      res.json({ data: category, success: true, message: 'Categoria atualizada com sucesso' });
    } catch (error: unknown) {
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
   * Alternar status da categoria (ativar/desativar)
   */
  static async toggleCategoryStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Buscar categoria atual
      const currentCategory = await CategoryModel.getById(id);
      if (!currentCategory) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      
      // Alternar o status
      const newStatus = !currentCategory.isActive;
      const updatedCategory = await CategoryModel.update(id, { isActive: newStatus });
      
      const action = newStatus ? 'ativada' : 'desativada';
      res.json({ 
        data: updatedCategory, 
        success: true, 
        message: `Categoria ${action} com sucesso` 
      });
    } catch (error: unknown) {
      console.error('Erro ao alterar status da categoria:', error);
      res.status(500).json({ 
        message: "Erro ao alterar status da categoria", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Eliminar categoria (mantido para compatibilidade)
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Erro ao buscar produtos da categoria:', error);
      res.status(500).json({ 
        message: "Erro ao buscar produtos da categoria", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Pesquisar categorias
   */
  static async searchCategories(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.json({
          data: [],
          success: true,
          message: 'Parâmetro de pesquisa é obrigatório'
        });
      }
      
      // Buscar todas as categorias
      let categories = await CategoryModel.getAll();
      
      // Verificar se categories é válido
      if (!categories || !Array.isArray(categories)) {
        categories = [];
      }
      
      // Aplicar filtro de pesquisa
      const searchLower = q.toLowerCase();
      const filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        (category.description && category.description.toLowerCase().includes(searchLower))
      );
      
      // Ordenar por nome
      filteredCategories.sort((a, b) => a.name.localeCompare(b.name));
      
      // Limitar a 50 resultados
      const limitedCategories = filteredCategories.slice(0, 50);
      
      res.json({
        data: limitedCategories,
        success: true,
        message: 'Categorias encontradas com sucesso'
      });
    } catch (error: unknown) {
      console.error('Erro ao pesquisar categorias:', error);
      res.status(500).json({ 
        message: "Erro ao pesquisar categorias", 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}