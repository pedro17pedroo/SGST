import { db } from './database/db';
import { stockMovements } from '../shared/schema';

async function checkStockMovements() {
  try {
    console.log('Verificando movimentos de estoque...');
    const movements = await db.select().from(stockMovements).limit(5);
    console.log('Movimentos encontrados:', movements.length);
    console.log('Dados:', JSON.stringify(movements, null, 2));
  } catch (error) {
    console.error('Erro ao verificar movimentos:', error);
  } finally {
    process.exit();
  }
}

checkStockMovements();