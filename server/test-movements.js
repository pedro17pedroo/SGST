import { db } from './src/database/db';
import { stockMovements, products, warehouses, users } from '../shared/schema';
import { eq, desc } from 'drizzle-orm';

async function testStockMovements() {
  try {
    console.log('Testando movimentos de stock com relações...');
    
    const results = await db
      .select({
        stockMovement: stockMovements,
        product: products,
        warehouse: warehouses,
        user: users
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .innerJoin(warehouses, eq(stockMovements.warehouseId, warehouses.id))
      .leftJoin(users, eq(stockMovements.userId, users.id))
      .orderBy(desc(stockMovements.createdAt))
      .limit(1);
    
    const formatted = results.map(result => ({
      ...result.stockMovement,
      product: result.product,
      warehouse: result.warehouse,
      user: result.user
    }));
    
    console.log('Resultado:', JSON.stringify(formatted, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    process.exit();
  }
}

testStockMovements();