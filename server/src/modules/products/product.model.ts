import { storage } from '../../storage';
import { insertProductSchema, insertCategorySchema } from '@shared/schema';
import { z } from 'zod';

export type ProductCreateData = z.infer<typeof insertProductSchema>;
export type ProductUpdateData = Partial<ProductCreateData>;
export type CategoryCreateData = z.infer<typeof insertCategorySchema>;
export type CategoryUpdateData = Partial<CategoryCreateData>;

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
}

export class CategoryModel {
  static async getAll() {
    return await storage.getCategories();
  }

  static async getById(id: string) {
    const categories = await storage.getCategories();
    return categories.find(category => category.id === id);
  }

  static async create(categoryData: CategoryCreateData) {
    const validatedData = insertCategorySchema.parse(categoryData);
    return await storage.createCategory(validatedData);
  }

  static async update(id: string, updateData: CategoryUpdateData) {
    const validatedData = insertCategorySchema.partial().parse(updateData);
    return await storage.updateCategory(id, validatedData);
  }

  static async delete(id: string) {
    return await storage.deleteCategory(id);
  }
}