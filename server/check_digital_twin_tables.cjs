const mysql = require('mysql2/promise');

async function checkDigitalTwinTables() {
  const connection = await mysql.createConnection({
    host: '193.203.166.230',
    user: 'u824538998_gstock',
    password: 'Gstock.2025',
    database: 'u824538998_gstock_db'
  });

  try {
    console.log('Conectado ao banco de dados MySQL');
    
    // Verificar tabelas relacionadas ao digital twin
    const [digitalTables] = await connection.execute("SHOW TABLES LIKE '%digital%'");
    console.log('\nTabelas com "digital":', digitalTables);
    
    const [warehouseTables] = await connection.execute("SHOW TABLES LIKE '%warehouse%'");
    console.log('\nTabelas com "warehouse":', warehouseTables);
    
    const [realTimeTables] = await connection.execute("SHOW TABLES LIKE '%real_time%'");
    console.log('\nTabelas com "real_time":', realTimeTables);
    
    // Listar todas as tabelas
    const [allTables] = await connection.execute('SHOW TABLES');
    console.log('\nTodas as tabelas no banco:');
    allTables.forEach(table => {
      console.log('-', Object.values(table)[0]);
    });
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await connection.end();
  }
}

checkDigitalTwinTables();