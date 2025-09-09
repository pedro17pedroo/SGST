import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { ProductStorage } from '../../src/storage/modules/products';
import { ValidationError, DuplicateError } from '../../src/storage/base/StorageError';
import type { InsertProduct } from '../../../shared/schema';
import { db } from '../../database/db';
import { products } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

describe('ProductStorage', () => {
  let productStorage: ProductStorage;
  const testProductIds: string[] = [];

  beforeAll(async () => {
    productStorage = new ProductStorage();
  });

  afterAll(async () => {
    // Limpar produtos de teste criados
    for (const id of testProductIds) {
      try {
        await db.delete(products).where(eq(products.id, id));
      } catch (error) {
        console.warn(`Erro ao limpar produto ${id}:`, error);
      }
    }
    
    // Fechar conexão da base de dados
    try {
      await db.$client.end();
    } catch (error) {
      console.warn('Erro ao fechar conexão:', error);
    }
  });

  beforeEach(() => {
    // Limpar array de IDs antes de cada teste
    testProductIds.length = 0;
  });

  describe('createProduct', () => {
    it('deve criar um produto válido com sucesso', async () => {
      const uniqueSku = `TEST-001-${Date.now()}`;
      const productData: InsertProduct = {
        name: 'Produto Teste',
        sku: uniqueSku,
        price: '99.99',
        costPrice: '50.00',
        description: 'Produto para teste automatizado',
        barcode: `123456789012${Date.now()}`,
        minStockLevel: '10',
        isActive: true
      };

      const result = await productStorage.createProduct(productData);
      testProductIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.sku).toBe(productData.sku);
      expect(result.price).toBe(productData.price);
      expect(result.costPrice).toBe(productData.costPrice);
      expect(result.isActive).toBe(true);
    });

    it('deve falhar ao criar produto sem nome', async () => {
      const productData = {
        sku: 'TEST-002',
        price: '99.99',
        costPrice: '50.00'
      } as InsertProduct;

      await expect(productStorage.createProduct(productData))
        .rejects
        .toThrow(ValidationError);
    });

    it('deve falhar ao criar produto sem SKU', async () => {
      const productData = {
        name: 'Produto Teste',
        price: '99.99',
        costPrice: '50.00'
      } as InsertProduct;

      await expect(productStorage.createProduct(productData))
        .rejects
        .toThrow(ValidationError);
    });

    it('deve falhar ao criar produto sem preço', async () => {
      const productData = {
        name: 'Produto Teste',
        sku: 'TEST-003',
        costPrice: '50.00'
      } as InsertProduct;

      await expect(productStorage.createProduct(productData))
        .rejects
        .toThrow(ValidationError);
    });

    it('deve falhar ao criar produto com preço inválido', async () => {
      const uniqueSku = `TEST-004-${Date.now()}`;
      const productData: InsertProduct = {
        name: 'Produto Teste',
        sku: uniqueSku,
        price: '-10.00',
        costPrice: '50.00'
      };

      await expect(productStorage.createProduct(productData))
        .rejects
        .toThrow(ValidationError);
    });

    it('deve falhar ao criar produto com preço de custo negativo', async () => {
      const productData: InsertProduct = {
        name: 'Produto Teste',
        sku: 'TEST-005',
        price: '99.99',
        costPrice: '-10.00'
      };

      await expect(productStorage.createProduct(productData))
        .rejects
        .toThrow(ValidationError);
    });

    it('deve falhar ao criar produto com SKU duplicado', async () => {
      const duplicateSku = `TEST-DUPLICATE-${Date.now()}`;
      const productData1: InsertProduct = {
        name: 'Produto Original',
        sku: duplicateSku,
        price: '99.99',
        costPrice: '50.00'
      };

      const productData2: InsertProduct = {
        name: 'Produto Duplicado',
        sku: duplicateSku,
        price: '149.99',
        costPrice: '75.00'
      };

      const result1 = await productStorage.createProduct(productData1);
      testProductIds.push(result1.id);

      await expect(productStorage.createProduct(productData2))
        .rejects
        .toThrow(DuplicateError);
    });

    it('deve falhar ao criar produto com código de barras duplicado', async () => {
      const uniqueSku1 = `TEST-BARCODE-1-${Date.now()}`;
      const uniqueSku2 = `TEST-BARCODE-2-${Date.now()}`;
      const duplicateBarcode = `DUPLICATE-BARCODE-${Date.now()}`;
      const productData1: InsertProduct = {
        name: 'Produto 1',
        sku: uniqueSku1,
        price: '99.99',
        costPrice: '50.00',
        barcode: duplicateBarcode
      };

      const productData2: InsertProduct = {
        name: 'Produto 2',
        sku: uniqueSku2,
        price: '149.99',
        costPrice: '75.00',
        barcode: duplicateBarcode
      };

      const result1 = await productStorage.createProduct(productData1);
      testProductIds.push(result1.id);

      await expect(productStorage.createProduct(productData2))
        .rejects
        .toThrow(DuplicateError);
    });

    it('deve falhar ao criar produto com nível de estoque mínimo negativo', async () => {
      const productData: InsertProduct = {
        name: 'Produto Teste',
        sku: 'TEST-006',
        price: '99.99',
        costPrice: '50.00',
        minStockLevel: '-5'
      };

      await expect(productStorage.createProduct(productData))
        .rejects
        .toThrow(ValidationError);
    });

    it('deve aceitar produto com preço de custo zero', async () => {
      const uniqueSku = `TEST-FREE-${Date.now()}`;
      const productData: InsertProduct = {
        name: 'Produto Gratuito',
        sku: uniqueSku,
        price: '99.99',
        costPrice: '0.00'
      };

      const result = await productStorage.createProduct(productData);
      testProductIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.costPrice).toBe('0.00');
    });

    it('deve aceitar produto sem código de barras', async () => {
      const uniqueSku = `TEST-NO-BARCODE-${Date.now()}`;
      const productData: InsertProduct = {
        name: 'Produto Sem Código',
        sku: uniqueSku,
        price: '99.99',
        costPrice: '50.00'
      };

      const result = await productStorage.createProduct(productData);
      testProductIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.barcode).toBeNull();
    });
  });

  describe('updateProduct', () => {
    let testProduct: any;

    beforeEach(async () => {
      const uniqueSku = `TEST-UPDATE-${Date.now()}`;
      const productData: InsertProduct = {
        name: 'Produto Para Atualizar',
        sku: uniqueSku,
        price: '99.99',
        costPrice: '50.00'
      };

      testProduct = await productStorage.createProduct(productData);
      testProductIds.push(testProduct.id);
    });

    it('deve atualizar produto com dados válidos', async () => {
      const updateData = {
        name: 'Produto Atualizado',
        price: '149.99',
        costPrice: '75.00'
      };

      const result = await productStorage.updateProduct(testProduct.id, updateData);

      expect(result.name).toBe(updateData.name);
      expect(result.price).toBe('149.99');
      expect(result.costPrice).toBe('75.00');
    });

    it('deve falhar ao atualizar com preço inválido', async () => {
      const updateData = {
        price: '-10.00'
      };

      await expect(productStorage.updateProduct(testProduct.id, updateData))
        .rejects
        .toThrow(ValidationError);
    });

    it('deve falhar ao atualizar com código de barras duplicado', async () => {
      // Criar outro produto com código de barras
      const otherProduct = await productStorage.createProduct({
        name: 'Outro Produto',
        sku: 'TEST-OTHER',
        price: '99.99',
        costPrice: '50.00',
        barcode: '1111111111111'
      });
      testProductIds.push(otherProduct.id);

      // Tentar atualizar o produto de teste com o mesmo código de barras
      const updateData = {
        barcode: '1111111111111'
      };

      await expect(productStorage.updateProduct(testProduct.id, updateData))
        .rejects
        .toThrow(DuplicateError);
    });
  });
});