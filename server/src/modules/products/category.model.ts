import storageImpl from '../../storage';
import type { Category, InsertCategory } from '../../storage/types';

export interface CreateCategoryData {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
}

export class CategoryModel {
  /**
   * Obter todas as categorias
   */
  static async getAll(): Promise<Category[]> {
    try {
      return await storageImpl.getCategories();
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Falha ao buscar categorias');
    }
  }

  /**
   * Obter categoria por ID
   */
  static async getById(id: string): Promise<Category | null> {
    try {
      const categories = await storageImpl.getCategories();
      return categories.find(cat => cat.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar categoria por ID:', error);
      throw new Error('Falha ao buscar categoria');
    }
  }

  /**
   * Criar nova categoria
   */
  static async create(data: CreateCategoryData): Promise<Category> {
    try {
      return await storageImpl.createCategory(data as InsertCategory);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  /**
   * Atualizar categoria
   */
  static async update(id: string, data: UpdateCategoryData): Promise<Category | null> {
    try {
      return await storageImpl.updateCategory(id, data as Partial<InsertCategory>);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  /**
   * Eliminar categoria
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await storageImpl.deleteCategory(id);
      return true;
    } catch (error) {
      console.error('Erro ao eliminar categoria:', error);
      return false;
    }
  }

  /**
   * Verificar se a categoria tem produtos associados
   */
  static async hasProducts(categoryId: string): Promise<boolean> {
    try {
      const products = await storageImpl.getProducts();
      return products.some(product => product.categoryId === categoryId);
    } catch (error) {
      console.error('Erro ao verificar produtos da categoria:', error);
      throw new Error('Falha ao verificar produtos da categoria');
    }
  }

  /**
   * Obter produtos de uma categoria
   */
  static async getProducts(categoryId: string) {
    try {
      const products = await storageImpl.getProducts();
      return products.filter(product => product.categoryId === categoryId);
    } catch (error) {
      console.error('Erro ao buscar produtos da categoria:', error);
      throw new Error('Falha ao buscar produtos da categoria');
    }
  }
}