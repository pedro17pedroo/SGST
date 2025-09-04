const mysql = require('mysql2/promise');

async function checkPickingTables() {
  const connection = await mysql.createConnection({
    host: '193.203.166.230',
    port: 3306,
    user: 'u824538998_gstock',
    password: 'Gstock.2025',
    database: 'u824538998_gstock_db'
  });

  try {
    console.log('🔍 Verificando tabelas de picking...');
    
    // Verificar se as tabelas existem
    const [tables] = await connection.execute("SHOW TABLES LIKE 'picking%'");
    console.log('📋 Tabelas de picking encontradas:', tables);
    
    if (tables.length > 0) {
      // Verificar estrutura da tabela picking_lists
      console.log('\n🏗️ Estrutura da tabela picking_lists:');
      const [pickingListsStructure] = await connection.execute('DESCRIBE picking_lists');
      console.table(pickingListsStructure);
      
      // Verificar estrutura da tabela picking_list_items
      console.log('\n🏗️ Estrutura da tabela picking_list_items:');
      const [pickingListItemsStructure] = await connection.execute('DESCRIBE picking_list_items');
      console.table(pickingListItemsStructure);
      
      // Verificar se há dados nas tabelas
      const [pickingListsCount] = await connection.execute('SELECT COUNT(*) as count FROM picking_lists');
      const [pickingListItemsCount] = await connection.execute('SELECT COUNT(*) as count FROM picking_list_items');
      
      console.log('\n📊 Contagem de registros:');
      console.log('- picking_lists:', pickingListsCount[0].count);
      console.log('- picking_list_items:', pickingListItemsCount[0].count);
      
      // Verificar últimas picking lists criadas
      console.log('\n📝 Últimas 5 picking lists:');
      const [recentLists] = await connection.execute(
        'SELECT id, pick_number, status, created_at FROM picking_lists ORDER BY created_at DESC LIMIT 5'
      );
      console.table(recentLists);
      
      // Verificar itens das últimas picking lists
      if (recentLists.length > 0) {
        console.log('\n📦 Itens das últimas picking lists:');
        const [recentItems] = await connection.execute(
          'SELECT picking_list_id, product_id, quantity_to_pick, status FROM picking_list_items ORDER BY picking_list_id DESC LIMIT 10'
        );
        console.table(recentItems);
      }
    } else {
      console.log('❌ Nenhuma tabela de picking encontrada!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  } finally {
    await connection.end();
  }
}

checkPickingTables().catch(console.error);