import mysql from 'mysql2/promise';

async function checkVehiclesTable() {
  try {
    const connection = await mysql.createConnection({
      host: '193.203.166.230',
      port: 3306,
      user: 'u824538998_gstock',
      password: 'Gstock.2025',
      database: 'u824538998_gstock_db'
    });

    console.log('Conectado ao banco de dados MySQL');

    // Verificar se a tabela vehicles existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'vehicles'");
    console.log('Tabelas encontradas:', tables);

    if (tables.length > 0) {
      console.log('Tabela vehicles existe!');
      
      // Verificar estrutura da tabela
      const [columns] = await connection.execute('DESCRIBE vehicles');
      console.log('Estrutura da tabela vehicles:');
      console.table(columns);
      
      // Verificar se há dados na tabela
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM vehicles');
      console.log('Total de registros na tabela vehicles:', count[0].total);
    } else {
      console.log('Tabela vehicles NÃO existe!');
      
      // Listar todas as tabelas
      const [allTables] = await connection.execute('SHOW TABLES');
      console.log('Todas as tabelas no banco:');
      allTables.forEach(table => {
        console.log('-', Object.values(table)[0]);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
  }
}

checkVehiclesTable();