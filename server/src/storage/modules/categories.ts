// Módulo temporariamente desabilitado devido a incompatibilidades de versão do Drizzle ORM
// Os métodos retornam valores mock para manter a compatibilidade da API

interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface InsertCategory {
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export class CategoryStorage {
  constructor(private db: any) {}

  async getCategories(): Promise<Category[]> {
    // Temporariamente retorna array vazio devido a incompatibilidades do Drizzle ORM
    return [];
  }

  async getCategory(id: string): Promise<Category | null> {
    // Temporariamente retorna null devido a incompatibilidades do Drizzle ORM
    return null;
  }

  async searchCategories(query: string): Promise<Category[]> {
    // Temporariamente retorna array vazio devido a incompatibilidades do Drizzle ORM
    return [];
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    // Temporariamente retorna objeto mock devido a incompatibilidades do Drizzle ORM
    return {
      id: "temp-id",
      name: data.name,
      description: data.description || null,
      isActive: data.isActive ?? true,
      createdAt: new Date()
    };
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | null> {
    // Temporariamente retorna null devido a incompatibilidades do Drizzle ORM
    return null;
  }

  async deleteCategory(id: string): Promise<void> {
    // Temporariamente não faz nada devido a incompatibilidades do Drizzle ORM
    return;
  }

  async getActiveCategories(): Promise<Category[]> {
    // Temporariamente retorna array vazio devido a incompatibilidades do Drizzle ORM
    return [];
  }
}