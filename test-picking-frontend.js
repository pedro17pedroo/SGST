// Teste para verificar se o frontend consegue aceder às listas de picking
// Usando fetch nativo do Node.js (disponível a partir da versão 18)

async function testPickingListsAPI() {
  try {
    console.log('🔍 Testando API de Picking Lists...');
    
    // Primeiro, fazer login para obter cookies de sessão
    console.log('\n1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status} ${loginResponse.statusText}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido:', loginData.user?.email);
    
    // Extrair cookies da resposta
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies recebidos:', cookies ? 'Sim' : 'Não');
    
    // Testar endpoint de picking lists
    console.log('\n2. Buscando listas de picking...');
    const pickingResponse = await fetch('http://localhost:4001/api/picking-lists', {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    if (!pickingResponse.ok) {
      throw new Error(`Erro ao buscar picking lists: ${pickingResponse.status} ${pickingResponse.statusText}`);
    }
    
    const pickingLists = await pickingResponse.json();
    console.log('✅ Picking lists obtidas com sucesso!');
    console.log(`📊 Total de listas: ${pickingLists.length}`);
    
    if (pickingLists.length > 0) {
      console.log('\n📋 Primeira lista de picking:');
      const firstList = pickingLists[0];
      console.log(`  - ID: ${firstList.id}`);
      console.log(`  - Número: ${firstList.pickNumber}`);
      console.log(`  - Status: ${firstList.status}`);
      console.log(`  - Prioridade: ${firstList.priority}`);
      console.log(`  - Armazém: ${firstList.warehouse?.name || 'N/A'}`);
      console.log(`  - Itens: ${firstList.items?.length || 0}`);
      console.log(`  - Criado em: ${firstList.createdAt}`);
    }
    
    // Testar criação de nova lista de picking
    console.log('\n3. Testando criação de nova lista...');
    const newPickingList = {
      warehouseId: '922aff7e-88e0-11f0-aefa-34b4ed86d8a9', // ID do armazém existente
      priority: 'medium',
      type: 'individual',
      notes: 'Lista criada pelo teste automatizado'
    };
    
    const createResponse = await fetch('http://localhost:4001/api/picking-lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(newPickingList)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`⚠️  Erro ao criar lista: ${createResponse.status} - ${errorText}`);
    } else {
      const createdList = await createResponse.json();
      console.log('✅ Nova lista criada com sucesso!');
      console.log(`  - ID: ${createdList.id}`);
      console.log(`  - Número: ${createdList.pickNumber}`);
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
  }
}

// Executar o teste
testPickingListsAPI();