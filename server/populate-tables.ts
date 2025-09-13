import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function populateTables() {
  let connection: mysql.Connection | null = null;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    
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
    
    console.log('✅ Conectado ao banco de dados!');
    
    // Popular tabela vehicle_types
    console.log('🚛 Populando tabela vehicle_types...');
    const vehicleTypes = [
      ['Camião', 'Veículo pesado para transporte de carga', 'heavy_duty'],
      ['Carrinha', 'Veículo comercial ligeiro para transporte de carga e passageiros', 'commercial'],
      ['Autocarro', 'Veículo para transporte público de passageiros', 'passenger'],
      ['Táxi', 'Veículo para transporte individual de passageiros', 'passenger'],
      ['Motocicleta', 'Veículo de duas rodas para transporte rápido', 'light'],
      ['Tractor', 'Veículo agrícola para trabalhos no campo', 'agricultural'],
      ['Empilhadora', 'Veículo industrial para movimentação de cargas', 'industrial'],
      ['Ambulância', 'Veículo de emergência médica', 'emergency'],
      ['Viatura Policial', 'Veículo de segurança pública', 'emergency'],
      ['Camião Cisterna', 'Veículo especializado para transporte de líquidos', 'specialized']
    ];
    
    for (const [name, description, category] of vehicleTypes) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO vehicle_types (name, description, category) VALUES (?, ?, ?)',
          [name, description, category]
        );
        console.log(`✅ Inserido: ${name}`);
      } catch (error) {
        console.log(`⚠️  Já existe: ${name}`);
      }
    }
    
    // Popular tabela fuel_types
    console.log('⛽ Populando tabela fuel_types...');
    const fuelTypes = [
      ['Gasóleo', 'Combustível diesel comum em Angola', 'liquid', 'litros'],
      ['Gasolina', 'Combustível gasolina para veículos ligeiros', 'liquid', 'litros'],
      ['Gás Natural', 'Combustível gasoso comprimido', 'gas', 'm³'],
      ['GPL', 'Gás de Petróleo Liquefeito', 'gas', 'kg'],
      ['Biodiesel', 'Combustível renovável derivado de óleos vegetais', 'liquid', 'litros'],
      ['Etanol', 'Combustível álcool etílico', 'liquid', 'litros'],
      ['Querosene', 'Combustível para aviação e aquecimento', 'liquid', 'litros'],
      ['Fuel Oil', 'Combustível pesado para navios e indústria', 'liquid', 'litros'],
      ['Electricidade', 'Energia eléctrica para veículos eléctricos', 'electric', 'kWh'],
      ['Hidrogénio', 'Combustível de célula de combustível', 'gas', 'kg']
    ];
    
    for (const [name, description, category, unit] of fuelTypes) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO fuel_types (name, description, category, unit) VALUES (?, ?, ?, ?)',
          [name, description, category, unit]
        );
        console.log(`✅ Inserido: ${name}`);
      } catch (error) {
        console.log(`⚠️  Já existe: ${name}`);
      }
    }
    
    // Verificar contagens finais
    console.log('📊 Verificando dados inseridos...');
    const [vtCount] = await connection.execute('SELECT COUNT(*) as total FROM vehicle_types');
    const [ftCount] = await connection.execute('SELECT COUNT(*) as total FROM fuel_types');
    
    console.log(`🚛 Total de tipos de veículos: ${(vtCount as any[])[0].total}`);
    console.log(`⛽ Total de tipos de combustíveis: ${(ftCount as any[])[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada.');
    }
  }
}

// Executar a população
populateTables().then(() => {
  console.log('🎉 População das tabelas concluída!');
}).catch((error) => {
  console.error('❌ Erro na população:', error instanceof Error ? error.message : String(error));
});