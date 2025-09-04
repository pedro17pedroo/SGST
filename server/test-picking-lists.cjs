const fs = require('fs');
// Usar fetch nativo do Node.js (disponível a partir da versão 18)

// Configuração
const BASE_URL = 'http://localhost:4001';
const COOKIES_FILE = 'cookies.txt';

// Função para fazer login e obter cookies
async function login() {
  console.log('🔐 Fazendo login...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Login bem-sucedido:', data.message);
    
    // Extrair cookies do cabeçalho Set-Cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // setCookieHeader pode ser uma string ou array
      const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      const sessionCookie = cookies.find(cookie => cookie.includes('sgst-session'));
      if (sessionCookie) {
        const cookieValue = sessionCookie.split(';')[0];
        console.log('🍪 Cookie de sessão obtido:', cookieValue);
        return cookieValue;
      }
    }
    
    console.log('⚠️ Nenhum cookie de sessão encontrado');
    return null;
  } else {
    console.error('❌ Erro no login:', data);
    return null;
  }
}

// Função para testar o endpoint de picking lists
async function testPickingLists(sessionCookie) {
  console.log('\n📋 Testando endpoint de picking lists...');
  
  const response = await fetch(`${BASE_URL}/api/picking-lists`, {
    headers: {
      'Cookie': sessionCookie
    }
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Endpoint de picking lists funcionando!');
    console.log('📊 Dados recebidos:', JSON.stringify(data, null, 2));
    return data;
  } else {
    console.error('❌ Erro no endpoint de picking lists:', data);
    return null;
  }
}

// Função para criar uma lista de picking de teste
async function createTestPickingList(sessionCookie) {
  console.log('\n➕ Criando lista de picking de teste...');
  
  const testData = {
    name: 'Lista de Teste - ' + new Date().toISOString(),
    description: 'Lista criada automaticamente para teste',
    priority: 'normal',
    warehouseId: '922aff7e-88e0-11f0-aefa-34b4ed86d8a9', // Usar ID real do armazém
    assignedUserId: null,
    orderNumbers: ['ORDER-001', 'ORDER-002'],
    pickingType: 'individual'
  };
  
  const response = await fetch(`${BASE_URL}/api/picking-lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    },
    body: JSON.stringify(testData)
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Lista de picking criada com sucesso!');
    console.log('📋 Nova lista:', JSON.stringify(data, null, 2));
    return data;
  } else {
    console.error('❌ Erro ao criar lista de picking:', data);
    return null;
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando testes de picking lists...');
    
    // 1. Fazer login
    const sessionCookie = await login();
    if (!sessionCookie) {
      console.error('❌ Não foi possível obter cookie de sessão. Abortando testes.');
      return;
    }
    
    // 2. Testar listagem de picking lists
    const pickingLists = await testPickingLists(sessionCookie);
    
    // 3. Criar uma lista de teste
    const newList = await createTestPickingList(sessionCookie);
    
    // 4. Testar novamente a listagem para ver se a nova lista aparece
    if (newList) {
      console.log('\n🔄 Testando listagem novamente após criação...');
      await testPickingLists(sessionCookie);
    }
    
    console.log('\n✅ Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes
main();