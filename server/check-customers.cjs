const mysql = require('mysql2/promise');

async function checkCustomers() {
  const connection = await mysql.createConnection({
    host: '193.203.166.230',
    user: 'u824538998_gstock',
    password: 'Gstock.2025',
    database: 'u824538998_gstock_db'
  });

  try {
    console.log('Conectado ao banco de dados de produção');
    
    // Verificar clientes existentes
    const [customers] = await connection.execute(
      'SELECT id, customer_number, name, email, created_at FROM customers ORDER BY created_at DESC LIMIT 10'
    );
    
    console.log('\nClientes existentes:');
    console.table(customers);
    
    // Verificar se existe CL000001
    const [cl001] = await connection.execute(
      'SELECT * FROM customers WHERE customer_number = ?',
      ['CL000001']
    );
    
    console.log('\nCliente CL000001:');
    console.table(cl001);
    
    // Verificar o último número de cliente
    const [lastNumber] = await connection.execute(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(customer_number FROM '^CL([0-9]+)$') AS UNSIGNED)), 0) as last_number FROM customers`
    );
    
    console.log('\nÚltimo número de cliente:', lastNumber[0].last_number);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await connection.end();
  }
}

checkCustomers();