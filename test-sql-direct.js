const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function testDirectSQL() {
  let connection;
  
  try {
    console.log('🔍 Testando inserção direta via SQL...');
    
    // Criar conexão direta com MySQL usando DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não encontrada no .env');
    }
    
    console.log('Usando DATABASE_URL:', databaseUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
    connection = await mysql.createConnection(databaseUrl);
    
    console.log('✅ Conexão com banco estabelecida');
    
    // Primeiro, vamos criar uma picking list simples
    const pickingListId = 'test-' + Date.now();
    const pickNumber = `PICK-${Date.now()}`;
    
    const createListQuery = `
      INSERT INTO picking_lists (
        id, pick_number, warehouse_id, status, priority, type, notes, user_id, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, NOW()
      )
    `;
    
    console.log('\n1. Criando picking list...');
    await connection.execute(createListQuery, [
      pickingListId,
      pickNumber,
      '922aff7e-88e0-11f0-aefa-34b4ed86d8a9',
      'pending',
      'normal',
      'individual',
      'Teste SQL direto',
      '36728c0d-88df-11f0-aefa-34b4ed86d8a9'
    ]);
    console.log('✅ Picking list criada com ID:', pickingListId);
    
    // Agora vamos tentar criar os itens
    console.log('\n2. Criando itens...');
    const items = [
      {
        id: 'item-1-' + Date.now(),
        productId: 'abcd2019-88e0-11f0-aefa-34b4ed86d8a9',
        quantityToPick: 5
      },
      {
        id: 'item-2-' + Date.now(),
        productId: 'abcd2019-88e0-11f0-aefa-34b4ed86d8a9',
        quantityToPick: 3
      }
    ];
    
    console.log('Itens a inserir:', JSON.stringify(items, null, 2));
    
    const insertItemQuery = `
      INSERT INTO picking_list_items (
        id, picking_list_id, product_id, location_id, quantity_to_pick, 
        quantity_picked, status
      ) VALUES (
        ?, ?, ?, NULL, ?, 0, 'pending'
      )
    `;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      console.log(`\n--- Item ${i + 1} ---`);
      console.log('ID:', item.id);
      console.log('Product ID:', item.productId);
      console.log('Quantity:', item.quantityToPick);
      
      try {
        const result = await connection.execute(insertItemQuery, [
          item.id,
          pickingListId,
          item.productId,
          item.quantityToPick
        ]);
        console.log(`✅ Item ${i + 1} inserido com sucesso:`, result[0]);
      } catch (error) {
        console.error(`❌ Erro ao inserir item ${i + 1}:`, error);
        throw error;
      }
    }
    
    // Verificar se os itens foram inseridos
    console.log('\n3. Verificando itens inseridos...');
    const [rows] = await connection.execute(
      'SELECT * FROM picking_list_items WHERE picking_list_id = ?',
      [pickingListId]
    );
    
    console.log('Itens encontrados:', rows);
    console.log('Número de itens:', rows.length);
    
    // Verificar também na tabela geral
    console.log('\n4. Verificando total de itens na tabela...');
    const [totalRows] = await connection.execute(
      'SELECT COUNT(*) as total FROM picking_list_items'
    );
    console.log('Total de itens na tabela:', totalRows[0].total);
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

// Executar o teste
testDirectSQL();