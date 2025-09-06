const fetch = require('node-fetch');

// Script para testar autenticação e endpoints de produtos
async function testAuth() {
  try {
    console.log('🔍 Testando autenticação e endpoints de produtos...');
    
    // 1. Fazer login para obter token
    console.log('\n1. Fazendo login...');
    const loginResponse = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin', // Assumindo que existe um usuário admin
        password: 'admin123' // Assumindo uma senha padrão
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Erro no login:', loginResponse.status, await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido!');
    console.log('👤 Usuário:', loginData.user.username, '- Role:', loginData.user.role);
    
    const token = loginData.accessToken;
    console.log('🔑 Token obtido:', token.substring(0, 50) + '...');
    
    // 2. Testar listagem de produtos
    console.log('\n2. Testando listagem de produtos...');
    const productsResponse = await fetch('http://localhost:4001/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!productsResponse.ok) {
      console.log('❌ Erro ao listar produtos:', productsResponse.status, await productsResponse.text());
      return;
    }
    
    const productsData = await productsResponse.json();
    console.log('✅ Produtos listados com sucesso!');
    console.log('📦 Total de produtos:', productsData.data?.length || 0);
    
    if (productsData.data && productsData.data.length > 0) {
      const firstProduct = productsData.data[0];
      console.log('🔍 Primeiro produto:', firstProduct.name, '- ID:', firstProduct.id, '- Ativo:', firstProduct.isActive);
      
      // 3. Testar ativação/desativação
      const productId = firstProduct.id;
      const currentStatus = firstProduct.isActive;
      const action = currentStatus ? 'deactivate' : 'activate';
      
      console.log(`\n3. Testando ${action} do produto ${firstProduct.name}...`);
      const toggleResponse = await fetch(`http://localhost:4001/api/products/${productId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!toggleResponse.ok) {
        console.log(`❌ Erro ao ${action} produto:`, toggleResponse.status);
        const errorText = await toggleResponse.text();
        console.log('📄 Resposta do erro:', errorText);
      } else {
        const toggleData = await toggleResponse.json();
        console.log(`✅ Produto ${action}d com sucesso!`);
        console.log('📄 Resposta:', toggleData.message);
      }
    } else {
      console.log('⚠️ Nenhum produto encontrado para testar');
    }
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error.message);
  }
}

// Executar teste
testAuth();