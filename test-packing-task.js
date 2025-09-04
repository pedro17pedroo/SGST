/**
 * Script de teste para funcionalidade de criação de tarefa de embalagem
 * Testa a API e valida os dados retornados
 */

const API_BASE_URL = 'http://localhost:4001';

// Dados de teste válidos para criação de tarefa de embalagem
const validPackingTaskData = {
  pickingListId: 'pl-001', // ID de uma lista de picking existente
  packageType: 'caixa-media',
  targetWeight: 5.0,
  specialInstructions: 'Produtos eletrônicos - usar material antiestático'
};

// Variável global para armazenar cookies de sessão
let sessionCookies = '';

// Função para fazer requisições HTTP com suporte a cookies
async function makeRequest(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  // Adicionar cookies de sessão se disponíveis
  if (sessionCookies) {
    options.headers['Cookie'] = sessionCookies;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Capturar cookies de sessão da resposta
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      sessionCookies = setCookieHeader;
    }
    
    const responseData = await response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = responseData;
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data: parsedData
    };
  } catch (error) {
    console.error(`Erro na requisição ${method} ${endpoint}:`, error);
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Teste 1: Fazer login com usuário admin
async function testLogin() {
  console.log('\n🔍 Teste 1: Fazendo login...');
  
  const loginData = {
    username: 'admin',
    password: 'admin123'
  };
  
  const result = await makeRequest('POST', '/api/auth/login', loginData);
  
  if (result.ok) {
    console.log('✅ Login realizado com sucesso');
    console.log('👤 Usuário:', result.data.user.username);
    console.log('🎭 Perfil:', result.data.user.role);
    return true;
  } else {
    console.log('❌ Erro no login');
    console.log('📊 Status:', result.status);
    console.log('📊 Erro:', result.error || result.data);
    return false;
  }
}

// Teste 2: Buscar listas de picking existentes
async function testGetPickingLists() {
  console.log('\n🔍 Teste 2: Buscando listas de picking...');
  
  const result = await makeRequest('GET', '/api/picking-lists');
  
  if (result.ok) {
    console.log('✅ Listas de picking obtidas com sucesso');
    console.log('📊 Quantidade de listas:', Array.isArray(result.data) ? result.data.length : 'N/A');
    
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log('📋 Listas disponíveis:', JSON.stringify(result.data, null, 2));
      console.log('📋 Primeira lista:', {
        id: result.data[0].id,
        orderNumber: result.data[0].orderNumber,
        status: result.data[0].status
      });
      console.log('📋 ID da primeira lista:', result.data[0].id, 'Tipo:', typeof result.data[0].id);
      return result.data[0].id; // Retorna o ID da primeira lista para usar nos testes
    }
    return null;
  } else {
    console.log('❌ Erro ao buscar listas de picking');
    console.log('📊 Status:', result.status);
    console.log('📊 Erro:', result.error || result.data);
    return null;
  }
}

// Teste 3: Criar tarefa de embalagem com dados válidos
async function testCreatePackingTask(pickingListId = null) {
  console.log('\n🔍 Teste 3: Criando tarefa de embalagem...');
  
  // Verificar o formato real dos IDs das listas de picking
  if (pickingListId) {
    console.log('ID da lista de picking disponível:', pickingListId, 'Tipo:', typeof pickingListId);
  }
  
  // Usar o ID da lista de picking obtida ou o padrão
  const testData = {
    ...validPackingTaskData,
    pickingListId: pickingListId || validPackingTaskData.pickingListId
  };
  
  console.log('📝 Dados de teste:', testData);
  
  const result = await makeRequest('POST', '/api/packing-tasks', testData);
  
  if (result.ok) {
    console.log('✅ Tarefa de embalagem criada com sucesso!');
    console.log('📦 Tarefa criada:', {
      id: result.data.id,
      pickingListId: result.data.pickingListId,
      packageType: result.data.packageType,
      status: result.data.status,
      createdAt: result.data.createdAt
    });
    return result.data.id;
  } else {
    console.log('❌ Erro ao criar tarefa de embalagem');
    console.log('📊 Status:', result.status);
    console.log('📊 Erro:', result.error || result.data);
    return null;
  }
}

// Teste 4: Buscar tarefas de embalagem
async function testGetPackingTasks() {
  console.log('\n🔍 Teste 4: Buscando tarefas de embalagem...');
  
  const result = await makeRequest('GET', '/api/packing-tasks');
  
  if (result.ok) {
    console.log('✅ Tarefas de embalagem obtidas com sucesso');
    console.log('📊 Quantidade de tarefas:', Array.isArray(result.data) ? result.data.length : 'N/A');
    
    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log('📦 Tarefas encontradas:');
      result.data.forEach((task, index) => {
        console.log(`  ${index + 1}. ID: ${task.id}, Tipo: ${task.packageType}, Status: ${task.status}`);
      });
    }
    return true;
  } else {
    console.log('❌ Erro ao buscar tarefas de embalagem');
    console.log('📊 Status:', result.status);
    console.log('📊 Erro:', result.error || result.data);
    return false;
  }
}

// Teste 5: Validar dados inválidos
async function testInvalidData() {
  console.log('\n🔍 Teste 5: Testando validação com dados inválidos...');
  
  const invalidData = {
    pickingListId: '', // ID vazio (inválido)
    packageType: '', // Tipo vazio (inválido)
    targetWeight: -1 // Peso negativo (inválido)
  };
  
  console.log('📝 Dados inválidos:', invalidData);
  
  const result = await makeRequest('POST', '/api/packing-tasks', invalidData);
  
  if (!result.ok && result.status === 400) {
    console.log('✅ Validação funcionando corretamente - dados inválidos rejeitados');
    console.log('📊 Erros de validação:', result.data.errors || result.data.message);
    return true;
  } else {
    console.log('❌ Validação não está funcionando - dados inválidos foram aceitos');
    console.log('📊 Status:', result.status);
    console.log('📊 Resposta:', result.data);
    return false;
  }
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes da funcionalidade de criação de tarefa de embalagem...');
  console.log('=' .repeat(70));
  
  let testResults = {
    login: false,
    getPickingLists: false,
    createPackingTask: false,
    getPackingTasks: false,
    invalidDataValidation: false
  };
  
  // Teste 1: Login
  testResults.login = await testLogin();
  
  if (!testResults.login) {
    console.log('\n❌ Não foi possível fazer login. Interrompendo testes.');
    return testResults;
  }
  
  // Teste 2: Buscar listas de picking
  const pickingListId = await testGetPickingLists();
  testResults.getPickingLists = pickingListId !== null;
  
  // Teste 3: Criar tarefa de embalagem
  const packingTaskId = await testCreatePackingTask(pickingListId);
  testResults.createPackingTask = packingTaskId !== null;
  
  // Teste 4: Buscar tarefas de embalagem
  testResults.getPackingTasks = await testGetPackingTasks();
  
  // Teste 5: Validação de dados inválidos
  testResults.invalidDataValidation = await testInvalidData();
  
  // Resumo dos resultados
  console.log('\n' + '=' .repeat(70));
  console.log('📊 RESUMO DOS TESTES:');
  console.log('=' .repeat(70));
  
  Object.entries(testResults).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSOU' : '❌ FALHOU';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase().replace('get', 'buscar').replace('create', 'criar').replace('invalid', 'validação de dados inválidos');
    console.log(`${status} - ${testName}`);
  });
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log('\n📈 RESULTADO FINAL:');
  console.log(`${passedTests}/${totalTests} testes passaram (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os testes passaram! A funcionalidade está funcionando corretamente.');
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os logs acima para mais detalhes.');
  }
  
  return testResults;
}

// Executar os testes se o script for chamado diretamente
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

// Exportar para uso em outros contextos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testCreatePackingTask,
    testGetPackingTasks,
    validPackingTaskData
  };
}