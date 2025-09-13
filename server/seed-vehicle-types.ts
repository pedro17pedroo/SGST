import { db } from './database/db';
import { vehicleTypes } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Dados iniciais para tipos de veículos comuns em Angola
const vehicleTypesData = [
  {
    name: 'Camião',
    description: 'Veículo pesado para transporte de carga',
    category: 'heavy_duty'
  },
  {
    name: 'Carrinha',
    description: 'Veículo comercial ligeiro para transporte de carga e passageiros',
    category: 'commercial'
  },
  {
    name: 'Autocarro',
    description: 'Veículo para transporte público de passageiros',
    category: 'passenger'
  },
  {
    name: 'Minibus',
    description: 'Veículo de médio porte para transporte de passageiros',
    category: 'passenger'
  },
  {
    name: 'Pick-up',
    description: 'Veículo utilitário com caixa aberta',
    category: 'commercial'
  },
  {
    name: 'Furgão',
    description: 'Veículo comercial fechado para transporte de carga',
    category: 'commercial'
  },
  {
    name: 'Tractor',
    description: 'Veículo para puxar semi-reboques',
    category: 'heavy_duty'
  },
  {
    name: 'Semi-reboque',
    description: 'Reboque sem eixo dianteiro para transporte de carga pesada',
    category: 'heavy_duty'
  },
  {
    name: 'Reboque',
    description: 'Veículo rebocado para transporte adicional de carga',
    category: 'commercial'
  },
  {
    name: 'Motocicleta',
    description: 'Veículo de duas rodas para transporte rápido',
    category: 'commercial'
  },
  {
    name: 'Automóvel',
    description: 'Veículo ligeiro de passageiros',
    category: 'passenger'
  },
  {
    name: 'Todo-o-terreno',
    description: 'Veículo 4x4 para terrenos difíceis',
    category: 'commercial'
  }
];

async function seedVehicleTypes() {
  try {
    console.log('🚛 Iniciando seed de tipos de veículos...');
    
    // Verificar se já existem dados
    const existingTypes = await db.select().from(vehicleTypes).limit(1);
    
    if (existingTypes.length > 0) {
      console.log('⚠️  Tipos de veículos já existem na base de dados. A saltar seed...');
      return;
    }
    
    // Inserir dados
    for (const typeData of vehicleTypesData) {
      await db.insert(vehicleTypes).values({
        name: typeData.name,
        description: typeData.description,
        category: typeData.category,
        isActive: true
      });
      console.log(`✅ Tipo de veículo criado: ${typeData.name}`);
    }
    
    console.log(`🎉 Seed concluído! ${vehicleTypesData.length} tipos de veículos criados.`);
    
  } catch (error) {
    console.error('❌ Erro ao fazer seed de tipos de veículos:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedVehicleTypes()
    .then(() => {
      console.log('✅ Seed de tipos de veículos concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

export { seedVehicleTypes };