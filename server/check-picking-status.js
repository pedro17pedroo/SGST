import { db } from './database/db.ts';
import { pickingLists } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function checkPickingLists() {
  try {
    console.log('🔍 Verificando listas de picking na base de dados...');
    
    // Buscar todas as listas de picking
    const allLists = await db.select().from(pickingLists);
    console.log(`📋 Total de listas encontradas: ${allLists.length}`);
    
    // Filtrar listas com status 'completed'
    const completedLists = allLists.filter(list => list.status === 'completed');
    console.log(`✅ Listas com status 'completed': ${completedLists.length}`);
    
    if (completedLists.length > 0) {
      console.log('\n📝 Detalhes das listas completed:');
      completedLists.forEach((list, index) => {
        console.log(`${index + 1}. ID: ${list.id}`);
        console.log(`   Pick Number: ${list.pickNumber || 'N/A'}`);
        console.log(`   Order ID: ${list.orderId || 'N/A'}`);
        console.log(`   Status: ${list.status}`);
        console.log(`   Created At: ${list.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('❌ Nenhuma lista de picking com status "completed" foi encontrada.');
      console.log('\n💡 Sugestões:');
      console.log('1. Verificar se existem listas criadas');
      console.log('2. Verificar se alguma lista foi marcada como "completed"');
      console.log('3. Criar uma lista de teste e marcar como "completed"');
      
      // Mostrar todas as listas existentes para debug
      if (allLists.length > 0) {
        console.log('\n📋 Todas as listas existentes:');
        allLists.forEach((list, index) => {
          console.log(`${index + 1}. ID: ${list.id}`);
          console.log(`   Pick Number: ${list.pickNumber || 'N/A'}`);
          console.log(`   Status: ${list.status}`);
          console.log(`   Created At: ${list.createdAt}`);
          console.log('---');
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar listas de picking:', error);
  }
}

checkPickingLists();