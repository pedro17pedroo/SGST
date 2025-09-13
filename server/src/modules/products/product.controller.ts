import { Request, Response } from 'express';
import { ProductModel } from './product.model';
import { insertProductSchema } from '@shared/schema';
import { z } from 'zod';
import { BaseController } from '../base/base.controller';

// Schema de validação para atualização de produto
const updateProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().nullable().optional(),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Preço deve ser um número positivo').optional(),
  costPrice: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Preço de custo deve ser um número não negativo').optional(),
  sku: z.string().optional(),
  barcode: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  weight: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Peso deve ser um número positivo').optional(),
  dimensions: z.any().optional(),
  minStockLevel: z.string().refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, 'Nível mínimo de estoque deve ser um número não negativo').optional(),
  isActive: z.boolean().optional()
});

export class ProductController extends BaseController {
  static async getProducts(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      // Validar parâmetros de paginação usando método da classe base
      const { page, limit } = controller.validatePagination(req);
      
      // Extrair outros parâmetros de query
      const {
        search = '',
        category = '',
        status = '',
        minPrice = '',
        maxPrice = '',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Converter preços para números se fornecidos
      const minPriceNum = minPrice ? parseFloat(minPrice as string) : undefined;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;

      // Validar preços se fornecidos
      if (minPrice && (isNaN(minPriceNum!) || minPriceNum! < 0)) {
        return controller.sendError(res, 'Preço mínimo deve ser um número não negativo', undefined, 400);
      }
      if (maxPrice && (isNaN(maxPriceNum!) || maxPriceNum! < 0)) {
        return controller.sendError(res, 'Preço máximo deve ser um número não negativo', undefined, 400);
      }
      if (minPriceNum && maxPriceNum && minPriceNum > maxPriceNum) {
        return controller.sendError(res, 'Preço mínimo não pode ser maior que o preço máximo', undefined, 400);
      }

      // Buscar produtos com filtros e paginação
      const result = await ProductModel.getAllWithFilters({
        page,
        limit,
        search: search as string,
        category: category as string,
        status: status as string,
        minPrice: minPriceNum,
        maxPrice: maxPriceNum,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      return controller.sendSuccessWithPagination(
        res,
        result.products,
        {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        'Produtos carregados com sucesso'
      );
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar produtos');
    }
  }

  static async getProductById(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      const id = controller.validateId(req);
      const product = await ProductModel.getById(id);
      
      controller.ensureResourceExists(product, 'Produto');
      
      return controller.sendSuccess(res, product, 'Produto encontrado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar produto');
    }
  }

  static async searchProducts(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim() === '') {
        return controller.sendError(res, "Parâmetro de pesquisa 'q' é obrigatório e deve ser uma string válida", undefined, 400);
      }
      
      const products = await ProductModel.search(q.trim());
      return controller.sendSuccess(res, products, `${products.length} produtos encontrados`);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao pesquisar produtos');
    }
  }

  static async createProduct(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      // Validar dados usando o schema compartilhado
      const result = insertProductSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessages = result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return controller.sendError(res, 'Dados de produto inválidos', errorMessages, 400);
      }
      
      const product = await ProductModel.create(result.data);
      return controller.sendSuccess(res, product, 'Produto criado com sucesso', 201);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao criar produto');
    }
  }

  static async updateProduct(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      const id = controller.validateId(req);
      
      // Validar dados usando o schema de atualização
      const result = updateProductSchema.safeParse(req.body);
      if (!result.success) {
        const errorMessages = result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return controller.sendError(res, 'Dados de produto inválidos', errorMessages, 400);
      }
      
      // Verificar se o produto existe antes de atualizar
      const existingProduct = await ProductModel.getById(id);
      controller.ensureResourceExists(existingProduct, 'Produto');
      
      const product = await ProductModel.update(id, result.data);
      return controller.sendSuccess(res, product, 'Produto atualizado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao atualizar produto');
    }
  }

  static async deactivateProduct(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      const id = controller.validateId(req);
      
      // Verificar se o produto existe antes de desativar
      const existingProduct = await ProductModel.getById(id);
      controller.ensureResourceExists(existingProduct, 'Produto');
      
      const product = await ProductModel.update(id, { isActive: false });
      return controller.sendSuccess(res, product, 'Produto desativado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao desativar produto');
    }
  }

  static async activateProduct(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      const id = controller.validateId(req);
      
      // Verificar se o produto existe antes de ativar
      const existingProduct = await ProductModel.getById(id);
      controller.ensureResourceExists(existingProduct, 'Produto');
      
      const product = await ProductModel.update(id, { isActive: true });
      return controller.sendSuccess(res, product, 'Produto ativado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao ativar produto');
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    const controller = new ProductController();
    try {
      const id = controller.validateId(req);
      
      // Verificar se o produto existe antes de eliminar
      const existingProduct = await ProductModel.getById(id);
      controller.ensureResourceExists(existingProduct, 'Produto');
      
      await ProductModel.delete(id);
      return controller.sendSuccess(res, { id }, 'Produto eliminado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao eliminar produto');
    }
  }
}

// CategoryController removido temporariamente devido a conflitos de tipagem do Drizzle ORM
// Será reimplementado numa versão futura com compatibilidade adequada