import { db } from './database/db.ts';
import { sql } from 'drizzle-orm';

async function testInventoryQuery() {
  try {
    console.log('Testando a consulta de inventory counts...');
    
    const query = `
      SELECT id, count_number, type, status, warehouse_id, scheduled_date, 
             completed_date, user_id, notes, created_at
      FROM inventory_counts
      ORDER BY created_at DESC
    `;
    
    console.log('Executando query:', query);
    
    const result = await db.execute(sql.raw(query));
    console.log('Resultado bruto:', result);
    
    const mapped = result[0].map((row) => ({
      id: row.id,
      countNumber: row.count_number,
      type: row.type,
      status: row.status,
      warehouseId: row.warehouse_id,
      scheduledDate: row.scheduled_date,
      completedDate: row.completed_date,
      userId: row.user_id,
      notes: row.notes,
      createdAt: row.created_at
    }));
    
    console.log('Resultado mapeado:', mapped);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao testar consulta:', error);
    process.exit(1);
  }
}

testInventoryQuery();