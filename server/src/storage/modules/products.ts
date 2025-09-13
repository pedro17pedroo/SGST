import { db } from "../../../database/db";
import { products, categories, suppliers, inventory, type Product, type InsertProduct, type Category, type Supplier } from "../../../../shared/schema";
import { eq, like, desc, lt, sum } from "drizzle-orm";
import { insertAndReturn, updateAndReturn, safeDelete, getSingleRecord } from "../utils";
import { ErrorHandler, ValidationError, DuplicateError } from "../base/StorageError";
import { Logger } from "../../utils/logger";
import crypto from "crypto";

export class ProductStorage {
  async getProducts(): Promise<Array<Product & { category?: Category | null; supplier?: Supplier | null }>> {
    const startTime = Date.now();
    Logger.storage.operation('getProducts', 'products');
    
    try {
      const results = await db
        .select({
          // Campos do produto
          id: products.id,
          name: products.name,
          description: products.description,
          sku: products.sku,
          barcode: products.barcode,
          price: products.price,
          costPrice: products.costPrice,
          weight: products.weight,
          dimensions: products.dimensions,
          categoryId: products.categoryId,
          supplierId: products.supplierId,
          minStockLevel: products.minStockLevel,
          isActive: products.isActive,
          createdAt: products.createdAt,
          // Campos da categoria
          categoryId_cat: categories.id,
          categoryName: categories.name,
          categoryDescription: categories.description,
          categoryIsActive: categories.isActive,
          categoryCreatedAt: categories.createdAt,
          // Campos do fornecedor
          supplierId_sup: suppliers.id,
          supplierName: suppliers.name,
          supplierEmail: suppliers.email,
          supplierPhone: suppliers.phone,
          supplierAddress: suppliers.address,
          supplierCreatedAt: suppliers.createdAt
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
        .orderBy(desc(products.createdAt));
      
      const duration = Date.now() - startTime;
      Logger.storage.success('getProducts', 'products', undefined, duration);
      
      return results.map(result => ({
        id: result.id,
        name: result.name,
        description: result.description,
        sku: result.sku,
        barcode: result.barcode,
        price: result.price,
        costPrice: result.costPrice,
        weight: result.weight,
        dimensions: result.dimensions,
        categoryId: result.categoryId,
        supplierId: result.supplierId,
        minStockLevel: result.minStockLevel,
        isActive: result.isActive,
        createdAt: result.createdAt,
        category: result.categoryName ? {
          id: result.categoryId_cat!,
          name: result.categoryName,
          description: result.categoryDescription,
          isActive: result.categoryIsActive!,
          createdAt: result.categoryCreatedAt!
        } : null,
        supplier: result.supplierName ? {
          id: result.supplierId_sup!,
          name: result.supplierName,
          email: result.supplierEmail,
          phone: result.supplierPhone,
          address: result.supplierAddress,
          createdAt: result.supplierCreatedAt!
        } : null
      }));
    } catch (error) {
      Logger.storage.error('getProducts', 'products', error as Error);
      throw error;
    }
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
        like(products.name, `%${query}%`)
      );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const startTime = Date.now();
    const productId = crypto.randomUUID();
    
    Logger.storage.operation('createProduct', 'products', productId, { 
      name: product.name, 
      sku: product.sku,
      price: product.price 
    });
    
    try {
      // Validações obrigatórias
      ErrorHandler.validateRequired(product.name, 'name');
      ErrorHandler.validateRequired(product.price, 'price');
      
      // Gerar SKU automaticamente se não fornecido
      if (!product.sku) {
        product.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      }
      
      Logger.validation.success('products', ['name', 'price']);
      
      // Validações de formato e valores
      const priceNum = Number(product.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        Logger.validation.failed('price', product.price, 'must be positive number', 'products');
        throw new ValidationError('Preço deve ser um número positivo', 'price', { value: product.price });
      }
      
      if (product.costPrice !== undefined && product.costPrice !== null) {
        const costPriceNum = Number(product.costPrice);
        if (isNaN(costPriceNum) || costPriceNum < 0) {
          Logger.validation.failed('costPrice', product.costPrice, 'must be non-negative number', 'products');
          throw new ValidationError('Preço de custo deve ser um número não negativo', 'costPrice', { value: product.costPrice });
        }
      }
      
      if (product.minStockLevel !== undefined && product.minStockLevel !== null) {
        const minStockNum = Number(product.minStockLevel);
        if (isNaN(minStockNum) || minStockNum < 0) {
          Logger.validation.failed('minStockLevel', product.minStockLevel, 'must be non-negative number', 'products');
          throw new ValidationError('Nível de estoque mínimo deve ser um número não negativo', 'minStockLevel', { value: product.minStockLevel });
        }
      }
      
      // Validação de SKU único (se fornecido)
      if (product.sku) {
        const existingProduct = await this.getProductsBySku(product.sku);
        if (existingProduct.length > 0) {
          Logger.validation.failed('sku', product.sku, 'must be unique', 'products');
          throw new DuplicateError('Produto', 'SKU', product.sku);
        }
      }
      
      // Validação de código de barras único (se fornecido)
      if (product.barcode) {
        const existingByBarcode = await this.getProductByBarcode(product.barcode);
        if (existingByBarcode) {
          Logger.validation.failed('barcode', product.barcode, 'must be unique', 'products');
          throw new DuplicateError('Produto', 'código de barras', product.barcode);
        }
      }
      
      const productWithId = { ...product, id: productId };
      const result = await ErrorHandler.executeWithErrorHandling(
        () => insertAndReturn<Product>(products, productWithId, products.id, productId),
        'ProductStorage.createProduct'
      );
      
      if (!result) {
        throw new Error('Falha ao criar produto');
      }
      
      const duration = Date.now() - startTime;
      Logger.storage.success('createProduct', 'products', productId, duration);
      
      return result;
    } catch (error) {
      Logger.storage.error('createProduct', 'products', error as Error, productId);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    ErrorHandler.validateId(id);
    
    // Validações de formato e valores para campos fornecidos
    if (product.price !== undefined && product.price !== null) {
      const priceNum = Number(product.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new ValidationError('Preço deve ser um número positivo', 'price', { value: product.price });
      }
    }
    
    if (product.costPrice !== undefined && product.costPrice !== null) {
      const costPriceNum = Number(product.costPrice);
      if (isNaN(costPriceNum) || costPriceNum < 0) {
        throw new ValidationError('Preço de custo deve ser um número não negativo', 'costPrice', { value: product.costPrice });
      }
    }
    
    if (product.minStockLevel !== undefined && product.minStockLevel !== null) {
      const minStockNum = Number(product.minStockLevel);
      if (isNaN(minStockNum) || minStockNum < 0) {
        throw new ValidationError('Nível de estoque mínimo deve ser um número não negativo', 'minStockLevel', { value: product.minStockLevel });
      }
    }
    
    // Validação de código de barras único (se fornecido)
    if (product.barcode) {
      const existingByBarcode = await this.getProductByBarcode(product.barcode);
      if (existingByBarcode && existingByBarcode.id !== id) {
        throw new DuplicateError('Produto', 'código de barras', product.barcode);
      }
    }
    
    const result = await ErrorHandler.executeWithErrorHandling(
      () => updateAndReturn<Product>(products, id, product, products.id),
      'ProductStorage.updateProduct'
    );
    
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
        // Campos do produto
        id: products.id,
        name: products.name,
        description: products.description,
        sku: products.sku,
        barcode: products.barcode,
        price: products.price,
        costPrice: products.costPrice,
        weight: products.weight,
        dimensions: products.dimensions,
        categoryId: products.categoryId,
        supplierId: products.supplierId,
        minStockLevel: products.minStockLevel,
        isActive: products.isActive,
        createdAt: products.createdAt,
        // Campos da categoria
        categoryId_cat: categories.id,
        categoryName: categories.name,
        categoryDescription: categories.description,
        categoryIsActive: categories.isActive,
        categoryCreatedAt: categories.createdAt,
        // Stock
        stock: sum(inventory.quantity)
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .groupBy(products.id, categories.id)
      .having(lt(sum(inventory.quantity), 10)); // Default low stock threshold
    
    return results.map(result => ({
      id: result.id,
      name: result.name,
      description: result.description,
      sku: result.sku,
      barcode: result.barcode,
      price: result.price,
      costPrice: result.costPrice,
      weight: result.weight,
      dimensions: result.dimensions,
      categoryId: result.categoryId,
      supplierId: result.supplierId,
      minStockLevel: result.minStockLevel,
      isActive: result.isActive,
      createdAt: result.createdAt,
      category: result.categoryName ? {
        id: result.categoryId_cat!,
        name: result.categoryName,
        description: result.categoryDescription,
        isActive: result.categoryIsActive!,
        createdAt: result.categoryCreatedAt!
      } : null,
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