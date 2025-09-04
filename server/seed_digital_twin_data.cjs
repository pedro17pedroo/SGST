const mysql = require('mysql2/promise');

async function seedDigitalTwinData() {
  const connection = await mysql.createConnection({
    host: '193.203.166.230',
    user: 'u824538998_gstock',
    password: 'Gstock.2025',
    database: 'u824538998_gstock_db'
  });

  try {
    console.log('Conectado ao banco de dados MySQL');
    
    // Verificar se existe warehouse
    const [warehouses] = await connection.execute('SELECT id, name FROM warehouses LIMIT 1');
    
    let warehouseId;
    if (warehouses.length === 0) {
      // Criar um warehouse de exemplo
      const warehouseInsertSQL = `
        INSERT INTO warehouses (id, name, address, city, country) 
        VALUES (UUID(), 'Armazém Principal', 'Rua Principal, 123', 'Luanda', 'Angola')
      `;
      await connection.execute(warehouseInsertSQL);
      
      // Buscar o warehouse criado
      const [newWarehouses] = await connection.execute('SELECT id, name FROM warehouses ORDER BY created_at DESC LIMIT 1');
      warehouseId = newWarehouses[0].id;
      console.log('✓ Warehouse criado:', newWarehouses[0].name, '- ID:', warehouseId);
    } else {
      warehouseId = warehouses[0].id;
      console.log('✓ Usando warehouse existente:', warehouses[0].name, '- ID:', warehouseId);
    }
    
    // Inserir dados de exemplo para warehouse_zones
    const zonesData = [
      {
        zone_name: 'Zona de Recebimento',
        zone_type: 'receiving',
        coordinates: JSON.stringify({x: 10, y: 10, width: 50, height: 30}),
        capacity_limit: 100,
        current_utilization: 75.5
      },
      {
        zone_name: 'Zona de Armazenamento A',
        zone_type: 'storage',
        coordinates: JSON.stringify({x: 70, y: 10, width: 80, height: 60}),
        capacity_limit: 500,
        current_utilization: 45.2
      },
      {
        zone_name: 'Zona de Expedição',
        zone_type: 'shipping',
        coordinates: JSON.stringify({x: 10, y: 80, width: 50, height: 30}),
        capacity_limit: 80,
        current_utilization: 30.8
      }
    ];
    
    for (const zone of zonesData) {
      const zoneSQL = `
        INSERT INTO warehouse_zones (id, warehouse_id, zone_name, zone_type, coordinates, capacity_limit, current_utilization, status, metadata)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, 'active', JSON_OBJECT('temperature', 22, 'humidity', 45))
      `;
      await connection.execute(zoneSQL, [
        warehouseId,
        zone.zone_name,
        zone.zone_type,
        zone.coordinates,
        zone.capacity_limit,
        zone.current_utilization
      ]);
    }
    console.log('✓ Zonas do warehouse criadas');
    
    // Inserir layout do warehouse
    const layoutData = {
      version: '1.0',
      dimensions: {width: 200, height: 150},
      zones: zonesData.map((zone, index) => ({
        id: `zone_${index + 1}`,
        name: zone.zone_name,
        type: zone.zone_type,
        coordinates: JSON.parse(zone.coordinates)
      })),
      paths: [
        {from: 'zone_1', to: 'zone_2', type: 'conveyor'},
        {from: 'zone_2', to: 'zone_3', type: 'forklift_path'}
      ]
    };
    
    const layoutSQL = `
      INSERT INTO warehouse_layout (id, warehouse_id, layout_name, layout_data, version, is_active, dimensions, metadata)
      VALUES (UUID(), ?, 'Layout Principal', ?, '1.0', true, ?, JSON_OBJECT('created_by', 'system', 'last_updated', NOW()))
    `;
    await connection.execute(layoutSQL, [
      warehouseId,
      JSON.stringify(layoutData),
      JSON.stringify(layoutData.dimensions)
    ]);
    console.log('✓ Layout do warehouse criado');
    
    // Inserir dados de visualização em tempo real
    const realTimeData = [
      {
        entity_type: 'forklift',
        entity_id: 'forklift_001',
        position: JSON.stringify({x: 45, y: 25, z: 0}),
        status: 'moving'
      },
      {
        entity_type: 'worker',
        entity_id: 'worker_001',
        position: JSON.stringify({x: 85, y: 40, z: 0}),
        status: 'picking'
      },
      {
        entity_type: 'pallet',
        entity_id: 'pallet_001',
        position: JSON.stringify({x: 120, y: 35, z: 0}),
        status: 'stored'
      },
      {
        entity_type: 'robot',
        entity_id: 'robot_001',
        position: JSON.stringify({x: 30, y: 95, z: 0}),
        status: 'loading'
      }
    ];
    
    for (const item of realTimeData) {
      const realTimeSQL = `
        INSERT INTO real_time_visualization (id, warehouse_id, entity_type, entity_id, position, status, metadata, timestamp)
        VALUES (UUID(), ?, ?, ?, ?, ?, JSON_OBJECT('battery_level', 85, 'last_activity', NOW()), NOW())
      `;
      await connection.execute(realTimeSQL, [
        warehouseId,
        item.entity_type,
        item.entity_id,
        item.position,
        item.status
      ]);
    }
    console.log('✓ Dados de visualização em tempo real criados');
    
    // Inserir simulação de exemplo
    const simulationSQL = `
      INSERT INTO digital_twin_simulations (id, warehouse_id, simulation_name, simulation_type, parameters, results, status, start_time, created_by)
      VALUES (UUID(), ?, 'Otimização de Layout', 'layout_optimization', ?, ?, 'completed', NOW(), 'system')
    `;
    
    const simulationParams = {
      optimization_target: 'minimize_travel_time',
      constraints: ['max_capacity', 'safety_zones'],
      duration_hours: 24
    };
    
    const simulationResults = {
      efficiency_improvement: 15.3,
      travel_time_reduction: 22.7,
      recommendations: [
        'Mover zona de expedição para mais próximo do armazenamento',
        'Adicionar corredor adicional entre zonas A e B'
      ]
    };
    
    await connection.execute(simulationSQL, [
      warehouseId,
      JSON.stringify(simulationParams),
      JSON.stringify(simulationResults)
    ]);
    console.log('✓ Simulação de exemplo criada');
    
    console.log('\n✅ Dados de exemplo do Digital Twin inseridos com sucesso!');
    console.log(`🏭 Warehouse ID para testes: ${warehouseId}`);
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados:', error.message);
  } finally {
    await connection.end();
  }
}

seedDigitalTwinData();