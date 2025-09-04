require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function checkTable() {
  let connection;
  
  try {
    // Parse DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL não encontrada no .env');
    }
    
    console.log('🔗 Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbUrl);
    console.log('✅ Conectado ao banco de dados');
    
    // Verificar estrutura da tabela
    console.log('\n📋 Estrutura da tabela picking_list_items:');
    const [structure] = await connection.execute('DESCRIBE picking_list_items');
    console.table(structure);
    
    // Contar registros
    console.log('\n📊 Contando registros na tabela...');
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM picking_list_items');
    console.log(`Total de registros: ${countResult[0].count}`);
    
    // Se houver registros, mostrar os últimos 5
    if (countResult[0].count > 0) {
      console.log('\n📝 Últimos 5 registros:');
      const [records] = await connection.execute(
        'SELECT * FROM picking_list_items ORDER BY id DESC LIMIT 5'
      );
      console.table(records);
    }
    
    // Verificar estrutura da tabela picking_lists
    console.log('\n📋 Estrutura da tabela picking_lists:');
    const [pickingListsStructure] = await connection.execute('DESCRIBE picking_lists');
    console.table(pickingListsStructure);
    
    // Verificar picking_lists também
    console.log('\n📋 Últimas 3 picking_lists:');
    const [pickingLists] = await connection.execute(
      'SELECT * FROM picking_lists ORDER BY id DESC LIMIT 3'
    );
    console.table(pickingLists);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

checkTable();