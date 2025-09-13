import { db } from './database/db';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('🔄 Iniciando migração da tabela vehicles...');
    
    // Verificar se há dados na tabela
    const countResult = await db.execute('SELECT COUNT(*) as total FROM vehicles');
    console.log('📊 Total de veículos:', (countResult[0] as any)[0].total);
    
    // Verificar se a coluna vehicle_type_id já existe
    const columnsResult = await db.execute('DESCRIBE vehicles');
    const columns = columnsResult[0] as unknown as any[];
    const hasVehicleTypeId = columns.some(col => col.Field === 'vehicle_type_id');
    
    if (hasVehicleTypeId) {
      console.log('✅ A coluna vehicle_type_id já existe!');
      return;
    }
    
    console.log('🔧 Adicionando coluna vehicle_type_id...');
    await db.execute('ALTER TABLE vehicles ADD COLUMN vehicle_type_id VARCHAR(36) AFTER vin');
    
    console.log('🔧 Criando tipo de veículo padrão...');
    await db.execute(`
      INSERT IGNORE INTO vehicle_types (id, name, description, category, is_active, created_at, updated_at)
      VALUES ('default-vehicle-type-id', 'Veículo Comercial', 'Tipo padrão para veículos comerciais', 'commercial', 1, NOW(), NOW())
    `);
    
    console.log('🔧 Atualizando registros existentes...');
    await db.execute('UPDATE vehicles SET vehicle_type_id = "default-vehicle-type-id" WHERE vehicle_type_id IS NULL');
    
    console.log('🔧 Tornando coluna obrigatória...');
    await db.execute('ALTER TABLE vehicles MODIFY COLUMN vehicle_type_id VARCHAR(36) NOT NULL');
    
    console.log('🔧 Adicionando chave estrangeira...');
    try {
      await db.execute(`
        ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_vehicle_type 
        FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)
      `);
    } catch (e) {
      console.log('⚠️ Chave estrangeira já existe ou erro:', (e as Error).message);
    }
    
    console.log('🔧 Removendo coluna type antiga...');
    try {
      await db.execute('ALTER TABLE vehicles DROP COLUMN type');
    } catch (e) {
      console.log('⚠️ Coluna type já foi removida ou erro:', (e as Error).message);
    }
    
    console.log('✅ Migração concluída com sucesso!');
    
    // Verificar estrutura final
    const [finalStructure] = await db.execute('DESCRIBE vehicles');
    console.log('📋 Estrutura final da tabela vehicles:');
    console.table(finalStructure);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

runMigration();