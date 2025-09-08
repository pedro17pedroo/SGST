import { db } from '../../../database/db';
import { categories, type Category, type InsertCategory } from '../../../../shared/schema';
import { eq, like, and, desc, asc, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export class CategoryStorage {
  /**
   * Buscar todas as categorias
   */
  async getCategories(): Promise<Category[]> {
    try {
      const results = await db.select().from(categories).orderBy(desc(categories.createdAt));
      return results as Category[];
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error('Falha ao buscar categorias');
    }
  }

  /**
   * Buscar categoria por ID
   */
  async getCategory(id: string): Promise<Category | null> {
    try {
      const result = await db.select().from(categories).where(eq(categories.id, id));
      return (result[0] as Category) || null;
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      throw new Error('Falha ao buscar categoria');
    }
  }

  /**
   * Buscar categoria por nome
   */
  async getCategoryByName(name: string): Promise<Category | null> {
    try {
      const result = await db.select().from(categories).where(eq(categories.name, name));
      return (result[0] as Category) || null;
    } catch (error) {
      console.error('Erro ao buscar categoria por nome:', error);
      throw new Error('Falha ao buscar categoria por nome');
    }
  }

  /**
   * Buscar categorias por termo de pesquisa
   */
  async searchCategories(query: string): Promise<Category[]> {
    try {
      const results = await db.select()
        .from(categories)
        .where(
          or(
            like(categories.name, `%${query}%`),
            like(categories.description, `%${query}%`)
          )
        )
        .orderBy(asc(categories.name));
      return results as Category[];
    } catch (error) {
      console.error('Erro ao pesquisar categorias:', error);
      throw new Error('Falha ao pesquisar categorias');
    }
  }

  /**
   * Criar nova categoria
   */
  async createCategory(data: InsertCategory): Promise<Category> {
    try {
      const id = randomUUID();
      const isActive = data.isActive ?? true;
      const createdAt = new Date();

      await db.insert(categories).values({
        id,
        name: data.name,
        description: data.description || null,
        isActive,
        createdAt
      });

      // Buscar a categoria criada
      const result = await this.getCategory(id);
      if (!result) {
        throw new Error('Falha ao criar categoria');
      }
      return result;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  /**
   * Atualizar categoria
   */
  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | null> {
    try {
      if (Object.keys(data).length === 0) return this.getCategory(id);
      
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      
      if (Object.keys(updateData).length === 0) {
        return this.getCategory(id);
      }
      
      await db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, id));
      
      return this.getCategory(id);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return null;
    }
  }

  /**
   * Deletar categoria
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      await db
        .delete(categories)
        .where(eq(categories.id, id));
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }

  /**
   * Buscar apenas categorias ativas
   */
  async getActiveCategories(): Promise<Category[]> {
    try {
      const results = await db.select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.name));
      return results as Category[];
    } catch (error) {
      console.error('Erro ao buscar categorias ativas:', error);
      throw new Error('Falha ao buscar categorias ativas');
    }
  }
}