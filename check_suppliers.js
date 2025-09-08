const mysql = require('mysql2/promise');

async function checkSuppliers() {
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
    
    console.log('Conectado à base de dados...');
    
    // Verificar se a tabela existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'suppliers'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Tabela suppliers não existe!');
      await connection.end();
      return;
    }
    
    console.log('✅ Tabela suppliers existe');
    
    // Contar fornecedores
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM suppliers'
    );
    
    console.log(`📊 Total de fornecedores: ${countResult[0].count}`);
    
    // Se houver fornecedores, mostrar alguns
    if (countResult[0].count > 0) {
      const [suppliers] = await connection.execute(
        'SELECT id, name, email, phone FROM suppliers LIMIT 5'
      );
      
      console.log('\n📋 Primeiros 5 fornecedores:');
      suppliers.forEach((supplier, index) => {
        console.log(`${index + 1}. ${supplier.name} (${supplier.email || 'sem email'})`);
      });
    } else {
      console.log('\n⚠️  Não há fornecedores na base de dados!');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro ao verificar fornecedores:', error.message);
  }
}

checkSuppliers();