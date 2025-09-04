import { db } from './database/db.ts';
import { sql } from 'drizzle-orm';

async function checkTable() {
  try {
    console.log('Verificando estrutura da tabela picking_list_items...');
    const result = await db.execute(sql.raw('DESCRIBE picking_list_items'));
    console.log('Estrutura da tabela picking_list_items:');
    console.log(JSON.stringify(result[0], null, 2));
    
    // Verificar se há dados na tabela
    const countResult = await db.execute(sql.raw('SELECT COUNT(*) as count FROM picking_list_items'));
    console.log('\nNúmero de registros na tabela:', countResult[0][0]);
    
    // Verificar últimos registros
    const lastRecords = await db.execute(sql.raw('SELECT * FROM picking_list_items ORDER BY id DESC LIMIT 5'));
    console.log('\nÚltimos 5 registros:');
    console.log(JSON.stringify(lastRecords[0], null, 2));
    
  } catch (err) {
    console.error('Erro ao verificar tabela:', err);
  }
  process.exit(0);
}

checkTable();