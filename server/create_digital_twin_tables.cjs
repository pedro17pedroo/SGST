const mysql = require('mysql2/promise');

async function createDigitalTwinTables() {
  const connection = await mysql.createConnection({
    host: '193.203.166.230',
    user: 'u824538998_gstock',
    password: 'Gstock.2025',
    database: 'u824538998_gstock_db'
  });

  try {
    console.log('Conectado ao banco de dados MySQL');
    
    // Criar tabela warehouse_zones
    const warehouseZonesSQL = `
      CREATE TABLE IF NOT EXISTS warehouse_zones (
        id varchar(36) NOT NULL DEFAULT (UUID()),
        warehouse_id varchar(36) NOT NULL,
        zone_name varchar(100) NOT NULL,
        zone_type varchar(50) NOT NULL,
        coordinates json,
        capacity_limit int,
        current_utilization decimal(5,2) DEFAULT 0,
        status varchar(20) DEFAULT 'active',
        metadata json,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT warehouse_zones_id PRIMARY KEY(id)
      )
    `;
    
    await connection.execute(warehouseZonesSQL);
    console.log('✓ Tabela warehouse_zones criada');
    
    // Criar tabela warehouse_layout
    const warehouseLayoutSQL = `
      CREATE TABLE IF NOT EXISTS warehouse_layout (
        id varchar(36) NOT NULL DEFAULT (UUID()),
        warehouse_id varchar(36) NOT NULL,
        layout_name varchar(100) NOT NULL,
        layout_data json NOT NULL,
        version varchar(20) DEFAULT '1.0',
        is_active boolean DEFAULT true,
        dimensions json,
        metadata json,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT warehouse_layout_id PRIMARY KEY(id)
      )
    `;
    
    await connection.execute(warehouseLayoutSQL);
    console.log('✓ Tabela warehouse_layout criada');
    
    // Criar tabela digital_twin_simulations
    const digitalTwinSimulationsSQL = `
      CREATE TABLE IF NOT EXISTS digital_twin_simulations (
        id varchar(36) NOT NULL DEFAULT (UUID()),
        warehouse_id varchar(36) NOT NULL,
        simulation_name varchar(100) NOT NULL,
        simulation_type varchar(50) NOT NULL,
        parameters json,
        results json,
        status varchar(20) DEFAULT 'pending',
        start_time timestamp,
        end_time timestamp,
        created_by varchar(36) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT digital_twin_simulations_id PRIMARY KEY(id)
      )
    `;
    
    await connection.execute(digitalTwinSimulationsSQL);
    console.log('✓ Tabela digital_twin_simulations criada');
    
    // Criar tabela real_time_visualization
    const realTimeVisualizationSQL = `
      CREATE TABLE IF NOT EXISTS real_time_visualization (
        id varchar(36) NOT NULL DEFAULT (UUID()),
        warehouse_id varchar(36) NOT NULL,
        entity_type varchar(50) NOT NULL,
        entity_id varchar(36) NOT NULL,
        position json NOT NULL,
        status varchar(50),
        metadata json,
        timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT real_time_visualization_id PRIMARY KEY(id)
      )
    `;
    
    await connection.execute(realTimeVisualizationSQL);
    console.log('✓ Tabela real_time_visualization criada');
    
    console.log('\n✅ Todas as tabelas do Digital Twin foram criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  } finally {
    await connection.end();
  }
}

createDigitalTwinTables();