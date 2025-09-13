import { db } from './database/db';
import { fuelTypes } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Dados iniciais para tipos de combustíveis comuns em Angola
const fuelTypesData = [
  {
    name: 'Gasóleo',
    description: 'Combustível diesel para veículos pesados e comerciais',
    category: 'liquid',
    unit: 'litros'
  },
  {
    name: 'Gasolina',
    description: 'Combustível para veículos ligeiros',
    category: 'liquid',
    unit: 'litros'
  },
  {
    name: 'GPL',
    description: 'Gás de Petróleo Liquefeito para veículos adaptados',
    category: 'gas',
    unit: 'litros'
  },
  {
    name: 'GNC',
    description: 'Gás Natural Comprimido para veículos comerciais',
    category: 'gas',
    unit: 'm³'
  },
  {
    name: 'Eléctrico',
    description: 'Energia eléctrica para veículos eléctricos',
    category: 'electric',
    unit: 'kWh'
  },
  {
    name: 'Híbrido Gasolina',
    description: 'Sistema híbrido com motor a gasolina e eléctrico',
    category: 'hybrid',
    unit: 'litros'
  },
  {
    name: 'Híbrido Diesel',
    description: 'Sistema híbrido com motor diesel e eléctrico',
    category: 'hybrid',
    unit: 'litros'
  },
  {
    name: 'Biodiesel',
    description: 'Combustível renovável derivado de óleos vegetais',
    category: 'liquid',
    unit: 'litros'
  },
  {
    name: 'Etanol',
    description: 'Combustível renovável derivado de biomassa',
    category: 'liquid',
    unit: 'litros'
  },
  {
    name: 'Hidrogénio',
    description: 'Combustível para células de combustível',
    category: 'gas',
    unit: 'kg'
  }
];

async function seedFuelTypes() {
  try {
    console.log('⛽ Iniciando seed de tipos de combustíveis...');
    
    // Verificar se já existem dados
    const existingTypes = await db.select().from(fuelTypes).limit(1);
    
    if (existingTypes.length > 0) {
      console.log('⚠️  Tipos de combustíveis já existem na base de dados. A saltar seed...');
      return;
    }
    
    // Inserir dados
    for (const typeData of fuelTypesData) {
      await db.insert(fuelTypes).values({
        name: typeData.name,
        description: typeData.description,
        category: typeData.category,
        unit: typeData.unit,
        isActive: true
      });
      console.log(`✅ Tipo de combustível criado: ${typeData.name}`);
    }
    
    console.log(`🎉 Seed concluído! ${fuelTypesData.length} tipos de combustíveis criados.`);
    
  } catch (error) {
    console.error('❌ Erro ao fazer seed de tipos de combustíveis:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedFuelTypes()
    .then(() => {
      console.log('✅ Seed de tipos de combustíveis concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

export { seedFuelTypes };