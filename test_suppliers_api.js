const mysql = require('mysql2/promise');

async function testSuppliersAPI() {
  try {
    // Extrair dados da URL da base de dados
    const dbUrl = 'mysql://u824538998_gstock:Gstock.2025@193.203.166.230:3306/u824538998_gstock_db';
    const url = new URL(dbUrl);
    
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1)
    });
    
    console.log('🔍 Testando consulta similar ao método getSuppliersWithFilters...');
    
    // Simular a consulta do método getSuppliersWithFilters
    const page = 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    // Consulta de contagem
    const countQuery = 'SELECT COUNT(*) as count FROM suppliers';
    const [countResult] = await connection.execute(countQuery);
    const totalCount = countResult[0].count;
    
    console.log(`📊 Total count query result: ${totalCount}`);
    
    // Consulta de dados
    const dataQuery = `SELECT * FROM suppliers ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const [suppliersData] = await connection.execute(dataQuery);
    
    console.log(`📋 Data query returned ${suppliersData.length} rows`);
    
    if (suppliersData.length > 0) {
      console.log('\n✅ Dados encontrados:');
      suppliersData.forEach((supplier, index) => {
        console.log(`${index + 1}. ID: ${supplier.id}`);
        console.log(`   Nome: ${supplier.name}`);
        console.log(`   Email: ${supplier.email || 'N/A'}`);
        console.log(`   Telefone: ${supplier.phone || 'N/A'}`);
        console.log(`   Criado em: ${supplier.createdAt || supplier.created_at}`);
        console.log('   ---');
      });
    } else {
      console.log('❌ Nenhum dado retornado pela consulta!');
    }
    
    // Verificar estrutura da tabela
    console.log('\n🔍 Verificando estrutura da tabela suppliers:');
    const [columns] = await connection.execute('DESCRIBE suppliers');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSuppliersAPI();