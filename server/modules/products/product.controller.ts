import { Request, Response } from 'express';
import { ProductModel, CategoryModel } from './product.model';
import { z } from 'zod';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const products = await ProductModel.getAll();
      res.json(products);
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
      const product = await ProductModel.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de produto inválidos", 
          errors: error.errors 
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
      const product = await ProductModel.update(id, req.body);
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de produto inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar produto", 
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

export class CategoryController {
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryModel.getAll();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ 
        message: "Erro ao buscar categorias", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const category = await CategoryModel.create(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de categoria inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar categoria", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.update(id, req.body);
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de categoria inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar categoria", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CategoryModel.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar categoria", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}