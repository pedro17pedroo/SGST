import { seedVehicleTypes } from './seed-vehicle-types';
import { seedFuelTypes } from './seed-fuel-types';

/**
 * Script principal para popular as tabelas de tipos de veículos e combustíveis
 * com dados iniciais apropriados para o contexto angolano
 */
async function seedAll() {
  try {
    console.log('🌱 Iniciando seed completo das tabelas de tipos...');
    console.log('=' .repeat(50));
    
    // Executar seed de tipos de veículos
    await seedVehicleTypes();
    console.log('');
    
    // Executar seed de tipos de combustíveis
    await seedFuelTypes();
    console.log('');
    
    console.log('=' .repeat(50));
    console.log('🎉 Seed completo concluído com sucesso!');
    console.log('✅ Todas as tabelas foram populadas com dados iniciais.');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('✅ Processo de seed concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha no processo de seed:', error);
      process.exit(1);
    });
}

export { seedAll };