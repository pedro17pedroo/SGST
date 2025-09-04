const { db } = require('./server/database/db');
const { sql } = require('drizzle-orm');
const { randomUUID } = require('crypto');
require('dotenv').config();

async function testCreatePickingListItems() {
  try {
    console.log('🔍 Testando criação direta de itens de picking list...');
    
    // Primeiro, vamos criar uma picking list simples
    const pickingListId = randomUUID();
    const pickNumber = `PICK-${Date.now()}`;
    
    const createListQuery = `
      INSERT INTO picking_lists (
        id, pick_number, warehouse_id, status, priority, type, notes, user_id, created_at
      ) VALUES (
        '${pickingListId}', '${pickNumber}', '922aff7e-88e0-11f0-aefa-34b4ed86d8a9', 
        'pending', 'normal', 'individual', 'Teste direto de itens', 
        '36728c0d-88df-11f0-aefa-34b4ed86d8a9', NOW()
      )
    `;
    
    console.log('1. Criando picking list...');
    console.log('Query:', createListQuery);
    await db.execute(sql.raw(createListQuery));
    console.log('✅ Picking list criada com ID:', pickingListId);
    
    // Agora vamos tentar criar os itens
    console.log('\n2. Criando itens...');
    const items = [
      {
        productId: 'abcd2019-88e0-11f0-aefa-34b4ed86d8a9',
        quantityToPick: 5,
        locationId: 'no-location'
      },
      {
        productId: 'abcd2019-88e0-11f0-aefa-34b4ed86d8a9',
        quantityToPick: 3,
        locationId: 'no-location'
      }
    ];
    
    console.log('Itens a inserir:', JSON.stringify(items, null, 2));
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = randomUUID();
      
      const insertQuery = `
        INSERT INTO picking_list_items (
          id, picking_list_id, product_id, location_id, quantity_to_pick, 
          quantity_picked, status
        ) VALUES (
          '${itemId}', '${pickingListId}', '${item.productId}', 
          ${item.locationId && item.locationId !== 'no-location' ? `'${item.locationId}'` : 'NULL'}, 
          ${item.quantityToPick}, 0, 'pending'
        )
      `;
      
      console.log(`\n--- Item ${i + 1} ---`);
      console.log('ID gerado:', itemId);
      console.log('Query:', insertQuery.trim());
      
      try {
        const result = await db.execute(sql.raw(insertQuery));
        console.log(`✅ Item ${i + 1} inserido com sucesso:`, result);
      } catch (error) {
        console.error(`❌ Erro ao inserir item ${i + 1}:`, error);
        throw error;
      }
    }
    
    // Verificar se os itens foram inseridos
    console.log('\n3. Verificando itens inseridos...');
    const checkQuery = `SELECT * FROM picking_list_items WHERE picking_list_id = '${pickingListId}'`;
    const checkResult = await db.execute(sql.raw(checkQuery));
    
    console.log('Itens encontrados:', checkResult[0]);
    console.log('Número de itens:', checkResult[0].length);
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Executar o teste
testCreatePickingListItems();