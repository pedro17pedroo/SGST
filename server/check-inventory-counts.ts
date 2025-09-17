import { db } from './database/db';
import { sql } from 'drizzle-orm';

async function checkInventoryCounts() {
  try {
    console.log('🔍 Verificando dados na tabela inventory_counts...');
    
    // Verificar se a tabela existe (MySQL)
    const tableExists = await db.execute(sql`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory_counts';
    `);
    
    const tableExistsData = tableExists as any;
    console.log('📋 Tabela inventory_counts existe:', tableExistsData.length > 0);
    
    if (tableExistsData.length > 0) {
      // Contar registros
      const countResult = await db.execute(sql`SELECT COUNT(*) as count FROM inventory_counts`);
      console.log('📊 Total de registros:', (countResult[0] as any)[0].count);
      
      // Buscar alguns registros
      const records = await db.execute(sql`
        SELECT 
          ic.id, 
          ic.count_number, 
          ic.type, 
          ic.status, 
          ic.warehouse_id, 
          ic.scheduled_date, 
          ic.completed_date, 
          ic.user_id, 
          ic.notes, 
          ic.created_at
        FROM inventory_counts ic
        LIMIT 5
      `);
      
      console.log('📝 Primeiros 5 registros:', records[0]);
      
      // Verificar se há warehouses relacionados
      const warehousesResult = await db.execute(sql`SELECT COUNT(*) as count FROM warehouses`);
      console.log('🏢 Total de armazéns:', (warehousesResult[0] as any)[0].count);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    process.exit(0);
  }
}

checkInventoryCounts();