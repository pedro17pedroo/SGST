import { storage } from '../../storage/index';
import { insertProductSchema, updateProductSchema } from '@shared/schema';
import { z } from 'zod';

export type ProductCreateData = z.infer<typeof insertProductSchema>;
export type ProductUpdateData = Partial<ProductCreateData>;

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
    const validatedData = insertProductSchema.parse(productData);
    return await storage.createProduct(validatedData);
  }

  static async update(id: string, updateData: ProductUpdateData) {
    const validatedData = updateProductSchema.parse(updateData);
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
}

// CategoryModel removido temporariamente devido a conflitos de tipagem do Drizzle ORM
// Será reimplementado numa versão futura com compatibilidade adequada