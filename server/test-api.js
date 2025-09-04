async function testPickingListsAPI() {
  try {
    console.log('🔍 Testando API /api/picking-lists...');
    
    const response = await fetch('http://127.0.0.1:4001/api/picking-lists', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers da resposta:', Object.fromEntries(response.headers));
    
    const data = await response.text();
    console.log('📋 Dados recebidos (raw):', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('📋 Dados JSON:', JSON.stringify(jsonData, null, 2));
      
      if (Array.isArray(jsonData)) {
        console.log(`✅ API retornou ${jsonData.length} listas de picking`);
        
        const completedLists = jsonData.filter(list => list.status === 'completed');
        console.log(`✅ Listas com status 'completed': ${completedLists.length}`);
        
        if (completedLists.length > 0) {
          console.log('📝 Listas completed encontradas:');
          completedLists.forEach((list, index) => {
            console.log(`${index + 1}. ID: ${list.id}`);
            console.log(`   Pick Number: ${list.pickNumber || 'N/A'}`);
            console.log(`   Order Number: ${list.orderNumber || 'N/A'}`);
            console.log(`   Status: ${list.status}`);
            console.log('---');
          });
        }
      }
    } catch (parseError) {
      console.log('❌ Erro ao fazer parse do JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testPickingListsAPI();