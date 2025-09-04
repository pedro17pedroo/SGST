import { db } from './database/db';
import { vehicles } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function testLicensePlateCheck() {
  console.log('🔍 Testando verificação de matrícula duplicada...');
  
  const testLicensePlate = 'TEST-999-NEW';
  
  try {
    // Buscar veículo com a matrícula de teste
    const result = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.licensePlate, testLicensePlate))
      .limit(1);
    
    console.log(`\n📋 Resultado da busca para matrícula "${testLicensePlate}":`);
    console.log('Número de registros encontrados:', result.length);
    
    if (result.length > 0) {
      console.log('❌ Matrícula já existe na base de dados:');
      console.log(JSON.stringify(result[0], null, 2));
    } else {
      console.log('✅ Matrícula não existe na base de dados - pode ser criada');
    }
    
    // Testar com matrícula vazia
    console.log('\n🔍 Testando com matrícula vazia...');
    const emptyResult = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.licensePlate, ''))
      .limit(1);
    
    console.log('Registros com matrícula vazia:', emptyResult.length);
    
    // Testar com matrícula null
    console.log('\n🔍 Testando com matrícula null...');
    const nullResult = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.licensePlate, null as any))
      .limit(1);
    
    console.log('Registros com matrícula null:', nullResult.length);
    
  } catch (error) {
    console.error('❌ Erro ao testar verificação de matrícula:', error);
  }
}

testLicensePlateCheck().then(() => {
  console.log('\n✅ Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
