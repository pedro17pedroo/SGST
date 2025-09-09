import { storage } from '../../storage/index';
import { Product, insertProductSchema, type InsertProduct } from '@shared/schema';
import { z } from 'zod';

export type ProductCreateData = InsertProduct;
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

  /**
   * Gera um SKU único baseado no nome do produto
   * Formato: PRIMEIRAS_LETRAS-TIMESTAMP_CURTO
   * Exemplo: PROD-A1B2C3
   */
  static async generateUniqueSku(productName: string): Promise<string> {
    // Extrair primeiras letras significativas do nome
    const nameWords = productName
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Remove caracteres especiais
      .split(' ')
      .filter(word => word.length > 0);
    
    // Pegar as primeiras 2-3 letras de cada palavra (máximo 8 caracteres)
    let prefix = '';
    for (const word of nameWords) {
      if (prefix.length >= 8) break;
      prefix += word.substring(0, Math.min(3, 8 - prefix.length));
    }
    
    // Se o prefixo for muito curto, usar 'PROD'
    if (prefix.length < 3) {
      prefix = 'PROD';
    }
    
    // Gerar sufixo único baseado em timestamp
    const timestamp = Date.now();
    const suffix = timestamp.toString(36).toUpperCase().slice(-6); // Últimos 6 caracteres em base36
    
    let sku = `${prefix}-${suffix}`;
    
    // Verificar se o SKU já existe e gerar um novo se necessário
    let counter = 1;
    while (await this.getBySku(sku)) {
      sku = `${prefix}-${suffix}${counter.toString(36).toUpperCase()}`;
      counter++;
      
      // Evitar loop infinito
      if (counter > 1000) {
        throw new Error('Não foi possível gerar um SKU único');
      }
    }
    
    return sku;
  }

  static async create(productData: ProductCreateData) {
    // Se não foi fornecido SKU, gerar automaticamente
    if (!productData.sku) {
      productData.sku = await this.generateUniqueSku(productData.name);
    } else {
      // Verificar se o SKU fornecido já existe
      const existingProduct = await this.getBySku(productData.sku);
      if (existingProduct) {
        throw new Error(`Produto com SKU '${productData.sku}' já existe`);
      }
    }
    
    const validatedData = insertProductSchema.parse(productData);
    return await storage.createProduct(validatedData);
  }

  static async update(id: string, updateData: ProductUpdateData) {
    const validatedData = insertProductSchema.partial().parse(updateData);
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