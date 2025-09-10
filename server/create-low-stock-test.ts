import { db } from './database/db';
import { products, inventory } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function createLowStockTest() {
  try {
    console.log('🔧 Criando produto de teste com baixo stock...');
    
    // Vamos atualizar um produto existente para ter baixo stock
    const pepsiProduct = await db.select()
      .from(products)
      .where(eq(products.name, 'Pepsi 350ml'))
      .limit(1);
    
    if (pepsiProduct.length > 0) {
      const productId = pepsiProduct[0].id;
      
      // Atualizar o nível mínimo de stock para 600 (maior que o stock atual)
      await db.update(products)
        .set({ minStockLevel: 600 })
        .where(eq(products.id, productId));
      
      console.log('✅ Produto Pepsi 350ml atualizado para ter minStockLevel = 600');
      console.log('📊 Stock atual: ~499, Mínimo: 600 - Agora deve aparecer como baixo stock');
    }
    
    // Vamos também criar um produto completamente novo com baixo stock
    const newProductId = 'test-low-stock-' + Date.now();
    
    await db.insert(products).values({
      id: newProductId,
      name: 'Produto Teste Baixo Stock',
      description: 'Produto para testar alertas de baixo stock',
      sku: 'TEST-LOW',
      barcode: '1234567890123',
      price: '100.00',
      costPrice: '50.00',
      weight: '0.500',
      dimensions: '10x10x10',
      categoryId: null,
      supplierId: null,
      minStockLevel: 100, // Nível mínimo alto
      isActive: true
    });
    
    // Criar inventário com stock baixo
    const warehouseResults = await db.select().from(inventory).limit(1);
    if (warehouseResults.length > 0) {
      const warehouseId = warehouseResults[0].warehouseId;
      
      await db.insert(inventory).values({
        productId: newProductId,
        warehouseId: warehouseId,
        quantity: 10, // Stock muito baixo
        reservedQuantity: 0
      });
      
      console.log('✅ Produto teste criado com stock = 10, minStockLevel = 100');
    }
    
    console.log('🎉 Teste de baixo stock configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar teste:', error);
  }
  
  process.exit(0);
}

createLowStockTest();