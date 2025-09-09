import { Request, Response } from 'express';
import { ProductModel } from './product.model';
import { insertProductSchema } from '@shared/schema';
import { z } from 'zod';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      // Extrair parâmetros de query
      const {
        page = 1,
        limit = 5,
        search = '',
        category = '',
        status = '',
        minPrice = '',
        maxPrice = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Converter para números
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const minPriceNum = minPrice ? parseFloat(minPrice as string) : undefined;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;

      // Validar parâmetros
      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({ 
          message: "Parâmetros de paginação inválidos",
          error: "Page deve ser >= 1 e limit deve estar entre 1 e 100"
        });
      }

      // Buscar produtos com filtros e paginação
      const result = await ProductModel.getAllWithFilters({
        page: pageNum,
        limit: limitNum,
        search: search as string,
        category: category as string,
        status: status as string,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json({
        data: result.products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          totalPages: Math.ceil(result.total / limitNum)
        },
        success: true,
        message: 'Produtos carregados com sucesso'
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        message: "Erro ao buscar produtos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.getById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ 
        message: "Erro ao buscar produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async searchProducts(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: "Parâmetro de pesquisa 'q' é obrigatório" });
      }
      
      const products = await ProductModel.search(q as string);
      res.json(products);
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ 
        message: "Erro ao pesquisar produtos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      // Validar dados usando o schema compartilhado
      const validatedData = insertProductSchema.parse(req.body);
      
      const product = await ProductModel.create(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de produto inválidos", 
          errors: error.issues 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Converter campos numéricos de string para número
      const updateData = {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        weight: req.body.weight ? parseFloat(req.body.weight) : undefined,
        minStockLevel: req.body.minStockLevel ? parseInt(req.body.minStockLevel, 10) : undefined,
      };
      
      const product = await ProductModel.update(id, updateData);
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de produto inválidos", 
          errors: error.issues 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deactivateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.update(id, { isActive: false });
      res.json({ success: true, message: "Produto desativado com sucesso", product });
    } catch (error) {
      console.error('Error deactivating product:', error);
      res.status(500).json({ 
        message: "Erro ao desativar produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async activateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.update(id, { isActive: true });
      res.json({ success: true, message: "Produto ativado com sucesso", product });
    } catch (error) {
      console.error('Error activating product:', error);
      res.status(500).json({ 
        message: "Erro ao ativar produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ProductModel.delete(id);
      res.json({ success: true, message: "Produto eliminado com sucesso" });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// CategoryController removido temporariamente devido a conflitos de tipagem do Drizzle ORM
// Será reimplementado numa versão futura com compatibilidade adequada