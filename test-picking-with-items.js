// Usando fetch nativo do Node.js (disponível a partir da versão 18)

async function testPickingWithItems() {
  try {
    console.log('🔍 Testando criação de lista de picking com itens...');
    
    // 1. Fazer login
    console.log('\n1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@sgst.ao',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido:', loginData.user.email);
    
    // Extrair cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies recebidos:', cookies ? 'Sim' : 'Não');
    
    // 2. Buscar produtos disponíveis
    console.log('\n2. Buscando produtos...');
    const productsResponse = await fetch('http://localhost:4001/api/products', {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    if (!productsResponse.ok) {
      throw new Error(`Erro ao buscar produtos: ${productsResponse.status}`);
    }
    
    const products = await productsResponse.json();
    console.log(`✅ Produtos encontrados: ${products.length}`);
    
    if (products.length === 0) {
      console.log('⚠️  Nenhum produto encontrado. Criando produto de teste...');
      // Aqui você poderia criar um produto de teste se necessário
      return;
    }
    
    const firstProduct = products[0];
    console.log(`📦 Primeiro produto: ${firstProduct.name} (ID: ${firstProduct.id})`);
    
    // 3. Buscar armazéns
    console.log('\n3. Buscando armazéns...');
    const warehousesResponse = await fetch('http://localhost:4001/api/warehouses', {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    if (!warehousesResponse.ok) {
      throw new Error(`Erro ao buscar armazéns: ${warehousesResponse.status}`);
    }
    
    const warehouses = await warehousesResponse.json();
    console.log(`✅ Armazéns encontrados: ${warehouses.length}`);
    
    if (warehouses.length === 0) {
      console.log('⚠️  Nenhum armazém encontrado.');
      return;
    }
    
    const firstWarehouse = warehouses[0];
    console.log(`🏢 Primeiro armazém: ${firstWarehouse.name} (ID: ${firstWarehouse.id})`);
    
    // 4. Criar lista de picking com itens
    console.log('\n4. Criando lista de picking com itens...');
    const newPickingList = {
      orderNumbers: ['ORD-TEST-001'],
      warehouseId: firstWarehouse.id,
      priority: 'high',
      pickingType: 'individual',
      notes: 'Lista criada pelo teste automatizado com itens',
      items: [
        {
          productId: firstProduct.id,
          quantityToPick: 5,
          locationId: 'no-location'
        },
        {
          productId: firstProduct.id,
          quantityToPick: 3,
          locationId: 'no-location'
        }
      ]
    };
    
    console.log('📋 Dados da lista:', JSON.stringify(newPickingList, null, 2));
    
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
      return;
    }
    
    const createdList = await createResponse.json();
    console.log('✅ Nova lista criada com sucesso!');
    console.log(`  - ID: ${createdList.id}`);
    console.log(`  - Número: ${createdList.pickNumber}`);
    
    // 5. Verificar se os itens foram criados
    console.log('\n5. Verificando itens criados...');
    const listResponse = await fetch(`http://localhost:4001/api/picking-lists/${createdList.id}`, {
      headers: {
        'Cookie': cookies || ''
      }
    });
    
    if (listResponse.ok) {
      const listWithItems = await listResponse.json();
      console.log(`📦 Itens na lista: ${listWithItems.items ? listWithItems.items.length : 0}`);
      
      if (listWithItems.items && listWithItems.items.length > 0) {
        console.log('✅ Itens encontrados:');
        listWithItems.items.forEach((item, index) => {
          console.log(`  ${index + 1}. Produto: ${item.productId}, Quantidade: ${item.quantityToPick}`);
        });
      } else {
        console.log('❌ Nenhum item encontrado na lista!');
      }
    } else {
      console.log('⚠️  Erro ao buscar detalhes da lista criada');
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
  }
}

// Executar o teste
testPickingWithItems();