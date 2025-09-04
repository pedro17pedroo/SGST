import { db } from './database/db.ts';
import { vehicles } from '../shared/schema.ts';
import { eq, isNull, or } from 'drizzle-orm';

async function debugVehicles() {
  try {
    console.log('=== DEBUG: Verificando todos os veículos na base de dados ===');
    
    // Buscar todos os veículos
    const allVehicles = await db.select().from(vehicles);
    console.log(`Total de veículos na base de dados: ${allVehicles.length}`);
    
    allVehicles.forEach((vehicle, index) => {
      console.log(`Veículo ${index + 1}:`, {
        id: vehicle.id,
        licensePlate: JSON.stringify(vehicle.licensePlate),
        licensePlateType: typeof vehicle.licensePlate,
        licensePlateLength: vehicle.licensePlate?.length,
        isEmpty: vehicle.licensePlate === '',
        isNull: vehicle.licensePlate === null,
        isUndefined: vehicle.licensePlate === undefined,
        make: vehicle.make,
        model: vehicle.model
      });
    });
    
    // Buscar veículos com matrícula vazia ou null
    const emptyOrNullVehicles = await db.select().from(vehicles)
      .where(or(
        eq(vehicles.licensePlate, ''),
        isNull(vehicles.licensePlate)
      ));
    
    console.log(`\nVeículos com matrícula vazia ou null: ${emptyOrNullVehicles.length}`);
    emptyOrNullVehicles.forEach((vehicle, index) => {
      console.log(`Veículo problemático ${index + 1}:`, {
        id: vehicle.id,
        licensePlate: JSON.stringify(vehicle.licensePlate),
        make: vehicle.make,
        model: vehicle.model
      });
    });
    
    // Testar busca por matrícula específica
    console.log('\n=== Testando busca por matrícula específica ===');
    
    // Teste 1: Matrícula que não existe
    const testLicensePlate1 = 'L0-20-10-HI';
    console.log(`Teste 1 - Buscando por: ${JSON.stringify(testLicensePlate1)}`);
    
    const foundVehicle1 = await db.select().from(vehicles)
      .where(eq(vehicles.licensePlate, testLicensePlate1))
      .limit(1);
    
    console.log('Resultado da busca:', foundVehicle1.length > 0 ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    
    // Teste 2: Matrícula que existe
    const testLicensePlate2 = 'LD-123-AO';
    console.log(`\nTeste 2 - Buscando por: ${JSON.stringify(testLicensePlate2)}`);
    
    const foundVehicle2 = await db.select().from(vehicles)
      .where(eq(vehicles.licensePlate, testLicensePlate2))
      .limit(1);
    
    console.log('Resultado da busca:', foundVehicle2.length > 0 ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    if (foundVehicle2.length > 0) {
      console.log('Veículo encontrado:', {
        id: foundVehicle2[0].id,
        licensePlate: JSON.stringify(foundVehicle2[0].licensePlate),
        make: foundVehicle2[0].make,
        model: foundVehicle2[0].model
      });
    }
    
    // Teste 3: Simular o que vem do frontend
    console.log('\n=== Simulando dados do frontend ===');
    const frontendData = {
      licensePlate: 'L0-20-10-HI',
      make: 'Toyota',
      model: 'Hilux',
      year: 2023,
      type: 'Carrinha',
      status: 'Disponível'
    };
    
    console.log('Dados do frontend:', JSON.stringify(frontendData, null, 2));
    console.log('licensePlate do frontend:', JSON.stringify(frontendData.licensePlate));
    
    const frontendSearchResult = await db.select().from(vehicles)
      .where(eq(vehicles.licensePlate, frontendData.licensePlate))
      .limit(1);
    
    console.log('Resultado da busca com dados do frontend:', frontendSearchResult.length > 0 ? 'ENCONTRADO (ERRO!)' : 'NÃO ENCONTRADO (CORRETO)');
    
  } catch (error) {
    console.error('Erro ao debugar veículos:', error);
  } finally {
    process.exit(0);
  }
}

debugVehicles();