import { db } from "../../../database/db";
import { products, categories, suppliers, inventory, type Product, type InsertProduct, type Category, type Supplier } from "../../../../shared/schema";
import { eq, ilike, desc, lt, sum } from "drizzle-orm";
import { insertAndReturn, updateAndReturn, safeDelete, getSingleRecord } from "../utils";
import { ErrorHandler } from "../base/StorageError";

export class ProductStorage {
  async getProducts(): Promise<Array<Product & { category?: Category | null; supplier?: Supplier | null }>> {
    const results = await db
      .select({
        product: products,
        category: categories,
        supplier: suppliers
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
      .orderBy(desc(products.createdAt));
    
    return results.map(result => ({
      ...result.product,
      category: result.category,
      supplier: result.supplier
    }));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    ErrorHandler.validateId(id);
    
    const result = await getSingleRecord<Product>(products, eq(products.id, id));
    return result || undefined;
  }

  async searchProducts(query: string): Promise<Product[]> {
    ErrorHandler.validateRequired(query, 'query');
    
    return await db.select().from(products)
      .where(
        ilike(products.name, `%${query}%`)
      );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    ErrorHandler.validateRequired(product.name, 'name');
    ErrorHandler.validateRequired(product.sku, 'sku');
    ErrorHandler.validateRequired(product.price, 'price');
    
    const id = crypto.randomUUID();
    const result = await insertAndReturn<Product>(products, product, products.id, id);
    
    if (!result) {
      throw new Error('Falha ao criar produto');
    }
    
    return result;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    ErrorHandler.validateId(id);
    
    const result = await updateAndReturn<Product>(products, id, product, products.id);
    
    if (!result) {
      throw new Error('Produto não encontrado');
    }
    
    return result;
  }

  async deleteProduct(id: string): Promise<void> {
    ErrorHandler.validateId(id);
    
    await safeDelete(products, id, products.id);
  }

  async getLowStockProducts(): Promise<Array<Product & { stock: number; category?: Category | null }>> {
    const results = await db
      .select({
        product: products,
        category: categories,
        stock: sum(inventory.quantity)
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .groupBy(products.id, categories.id)
      .having(lt(sum(inventory.quantity), 10)); // Default low stock threshold
    
    return results.map(result => ({
      ...result.product,
      category: result.category,
      stock: Number(result.stock) || 0
    }));
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    const result = await getSingleRecord<Product>(products, eq(products.barcode, barcode));
    return result || undefined;
  }

  async getProductsBySku(sku: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.sku, sku));
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.categoryId, categoryId));
  }

  async getProductsBySupplier(supplierId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.supplierId, supplierId));
  }
}