import { storage } from '../../storage/index';
import type { Category, InsertCategory } from '../../storage/types';

export interface CreateCategoryData {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export class CategoryModel {
  /**
   * Obter todas as categorias
   */
  static async getAll(): Promise<Category[]> {
    try {
      const result = await storage.categories.getCategories();
      return result || [];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }
  }

  /**
   * Obter categoria por ID
   */
  static async getById(id: string): Promise<Category | null> {
    try {
      return await storage.categories.getCategory(id);
    } catch (error) {
      console.error('Erro ao buscar categoria por ID:', error);
      return null;
    }
  }

  /**
   * Criar nova categoria
   */
  static async create(data: CreateCategoryData): Promise<Category> {
    try {
      return await storage.categories.createCategory(data as InsertCategory);
    } catch (error: unknown) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  /**
   * Atualizar categoria
   */
  static async update(id: string, data: UpdateCategoryData): Promise<Category | null> {
    try {
      return await storage.categories.updateCategory(id, data as Partial<InsertCategory>);
    } catch (error: unknown) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  /**
   * Eliminar categoria
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await storage.categories.deleteCategory(id);
      return true;
    } catch (error: unknown) {
      console.error('Erro ao deletar categoria:', error);
      return false;
    }
  }

  /**
   * Verificar se a categoria tem produtos associados
   */
  static async hasProducts(categoryId: string): Promise<boolean> {
    try {
      const products = await storage.getProducts();
      return products.some((product: any) => product.categoryId === categoryId);
    } catch (error: unknown) {
      console.error('Erro ao verificar produtos da categoria:', error);
      throw new Error('Falha ao verificar produtos da categoria');
    }
  }

  /**
   * Obter produtos de uma categoria
   */
  static async getProducts(categoryId: string) {
    try {
      const products = await storage.getProducts();
      return products.filter((product: any) => product.categoryId === categoryId);
    } catch (error: unknown) {
      console.error('Erro ao buscar produtos da categoria:', error);
      throw new Error('Falha ao buscar produtos da categoria');
    }
  }
}