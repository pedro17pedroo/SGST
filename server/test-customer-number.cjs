const mysql = require('mysql2/promise');

async function testCustomerNumberGeneration() {
  const connection = await mysql.createConnection({
    host: '193.203.166.230',
    user: 'u824538998_gstock',
    password: 'Gstock.2025',
    database: 'u824538998_gstock_db'
  });

  try {
    console.log('Testando geração de números de cliente...');
    
    // Buscar todos os clientes
    const [customers] = await connection.execute(
      'SELECT customer_number FROM customers'
    );
    
    console.log('\nTodos os números de cliente:');
    customers.forEach(customer => {
      console.log(customer.customer_number);
    });
    
    // Simular a lógica corrigida
    let maxNumber = 0;
    for (const customer of customers) {
      const match = customer.customer_number.match(/^CL(\d+)$/);
      if (match) {
        const number = parseInt(match[1], 10);
        console.log(`Número encontrado: ${number}`);
        if (number > maxNumber) {
          maxNumber = number;
        }
      }
    }
    
    const nextNumber = (maxNumber + 1).toString().padStart(6, '0');
    const nextCustomerNumber = `CL${nextNumber}`;
    
    console.log(`\nMaior número encontrado: ${maxNumber}`);
    console.log(`Próximo número de cliente: ${nextCustomerNumber}`);
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await connection.end();
  }
}

testCustomerNumberGeneration();