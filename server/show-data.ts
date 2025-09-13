import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function showData() {
  let connection: mysql.Connection | null = null;
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não encontrada nas variáveis de ambiente');
    }
    
    const url = new URL(process.env.DATABASE_URL);
    
    connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: parseInt(url.port || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('🚛 TIPOS DE VEÍCULOS:');
    const [vehicleTypes] = await connection.execute('SELECT name, category FROM vehicle_types ORDER BY name');
    (vehicleTypes as any[]).forEach(row => {
      console.log(`  - ${row.name} (${row.category})`);
    });
    
    console.log('\n⛽ TIPOS DE COMBUSTÍVEIS:');
    const [fuelTypes] = await connection.execute('SELECT name, unit FROM fuel_types ORDER BY name');
    (fuelTypes as any[]).forEach(row => {
      console.log(`  - ${row.name} (${row.unit})`);
    });
    
    console.log('\n📊 RESUMO:');
    const [vtCount] = await connection.execute('SELECT COUNT(*) as total FROM vehicle_types');
    const [ftCount] = await connection.execute('SELECT COUNT(*) as total FROM fuel_types');
    
    console.log(`🚛 Total de tipos de veículos: ${(vtCount as any[])[0].total}`);
    console.log(`⛽ Total de tipos de combustíveis: ${(ftCount as any[])[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar
showData();