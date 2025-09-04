import { db } from './database/db.ts';
import { sql } from 'drizzle-orm';

async function checkInventoryTable() {
  try {
    console.log('Verificando se a tabela inventory_counts existe...');
    
    const result = await db.execute(sql`SHOW TABLES LIKE 'inventory_counts'`);
    console.log('Resultado da verificação:', result);
    
    if (result[0] && result[0].length > 0) {
      console.log('✅ Tabela inventory_counts existe');
      
      // Verificar dados na tabela
      const data = await db.execute(sql`SELECT * FROM inventory_counts LIMIT 5`);
      console.log('Dados na tabela:', data[0]);
    } else {
      console.log('❌ Tabela inventory_counts não existe');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar tabela:', error);
    process.exit(1);
  }
}

checkInventoryTable();