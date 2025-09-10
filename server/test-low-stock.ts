import { db } from './database/db';
import { products, inventory } from '@shared/schema';
import { sql, eq } from 'drizzle-orm';

interface ProductStock {
  id: string;
  name: string;
  minStockLevel: number | null;
  currentStock: number;
}

async function testLowStock() {
  try {
    console.log('🔍 Testando query de produtos com baixo stock...');
    
    // Primeiro, vamos ver todos os produtos e seus stocks
    const allProducts: ProductStock[] = await db.select({
      id: products.id,
      name: products.name,
      minStockLevel: products.minStockLevel,
      currentStock: sql<number>`COALESCE(sum(${inventory.quantity}), 0)`
    })
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .groupBy(products.id)
    .orderBy(products.name);
    
    console.log('📊 Todos os produtos e seus stocks:');
    allProducts.forEach((p: ProductStock) => {
      const minStock = p.minStockLevel || 0;
      console.log(`- ${p.name}: ${p.currentStock}/${minStock} (${p.currentStock < minStock ? 'BAIXO' : 'OK'})`);
    });
    
    // Agora vamos testar a query de baixo stock
    const lowStockProducts: ProductStock[] = await db.select({
      id: products.id,
      name: products.name,
      minStockLevel: products.minStockLevel,
      currentStock: sql<number>`COALESCE(sum(${inventory.quantity}), 0)`
    })
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .groupBy(products.id)
    .having(sql`COALESCE(sum(${inventory.quantity}), 0) < ${products.minStockLevel}`);
    
    console.log('\n🚨 Produtos com baixo stock:');
    if (lowStockProducts.length === 0) {
      console.log('Nenhum produto com baixo stock encontrado.');
    } else {
      lowStockProducts.forEach((p: ProductStock) => {
        console.log(`- ${p.name}: ${p.currentStock}/${p.minStockLevel}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error);
  }
  
  process.exit(0);
}

testLowStock();