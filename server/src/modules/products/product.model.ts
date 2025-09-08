import { storage } from '../../storage/index';
import { Product } from '@shared/schema';
import { z } from 'zod';

const productCreateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  categoryId: z.string(),
  supplierId: z.string(),
  sku: z.string(),
  barcode: z.string().optional(),
  price: z.string(),
  costPrice: z.string(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  minStockLevel: z.number().optional(),
  maxStockLevel: z.number().optional(),
  reorderPoint: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type ProductCreateData = z.infer<typeof productCreateSchema>;
export type ProductUpdateData = Partial<ProductCreateData>;

export interface ProductFilters {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsWithPagination {
  products: Product[];
  total: number;
}

export class ProductModel {
  static async getAll() {
    return await storage.getProducts();
  }

  static async getById(id: string) {
    return await storage.getProduct(id);
  }

  static async search(query: string) {
    return await storage.searchProducts(query);
  }

  static async create(productData: ProductCreateData) {
    const validatedData = productCreateSchema.parse(productData);
    return await storage.createProduct(validatedData);
  }

  static async update(id: string, updateData: ProductUpdateData) {
    const validatedData = productCreateSchema.partial().parse(updateData);
    return await storage.updateProduct(id, validatedData);
  }

  static async delete(id: string) {
    return await storage.deleteProduct(id);
  }

  static async getBySku(sku: string) {
    const products = await storage.getProducts();
    return products.find(product => product.sku === sku);
  }

  static async getByBarcode(barcode: string) {
    const products = await storage.getProducts();
    return products.find(product => product.barcode === barcode);
  }

  static async getAllWithFilters(filters: ProductFilters): Promise<ProductsWithPagination> {
    // Buscar todos os produtos
    let products = await storage.getProducts();
    
    // Aplicar filtros
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.category) {
      products = products.filter(product => 
        product.categoryId === filters.category
      );
    }
    
    if (filters.status) {
      const isActive = filters.status.toLowerCase() === 'ativo';
      products = products.filter(product => product.isActive === isActive);
    }
    
    if (filters.minPrice !== undefined) {
      products = products.filter(product => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        return price !== undefined && price >= filters.minPrice!;
      });
    }
    
    if (filters.maxPrice !== undefined) {
      products = products.filter(product => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        return price !== undefined && price <= filters.maxPrice!;
      });
    }
    
    // Aplicar ordenação
    products.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = typeof a.price === 'string' ? parseFloat(a.price) : (a.price || 0);
          bValue = typeof b.price === 'string' ? parseFloat(b.price) : (b.price || 0);
          break;
        case 'sku':
          aValue = a.sku || '';
          bValue = b.sku || '';
          break;
        case 'category':
          aValue = a.categoryId || '';
          bValue = b.categoryId || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'desc'
          ? bValue.toLowerCase().localeCompare(aValue.toLowerCase())
          : aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      }
      
      // Para valores numéricos
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      // Para tipos mistos, converter para string
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return filters.sortOrder === 'desc'
        ? bStr.localeCompare(aStr)
        : aStr.localeCompare(bStr);
    });
    
    // Calcular total antes da paginação
    const total = products.length;
    
    // Aplicar paginação
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      total
    };
  }
}

// CategoryModel removido temporariamente devido a conflitos de tipagem do Drizzle ORM
// Será reimplementado numa versão futura com compatibilidade adequada