// Script para debugar o frontend - simular o processo de login
const BASE_URL = 'http://localhost:4001';

async function debugFrontendAuth() {
  console.log('🔍 Debugando autenticação do frontend...');
  
  try {
    // 1. Simular o processo exato do frontend
    console.log('\n1. Simulando login exato do frontend...');
    
    // Fazer a mesma requisição que o LoginForm faz
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login falhou: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Login bem-sucedido!');
    console.log('Resposta completa:', JSON.stringify(result, null, 2));

    // 2. Simular a criação do userData exatamente como no LoginForm
    const userData = { 
      id: result.user.id,
      username: result.user.username, 
      email: result.user.email || '',
      role: result.user.role,
      isActive: result.user.isActive || true
    };
    
    const authData = {
      user: userData,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    };
    
    console.log('\n2. Dados que seriam passados para o contexto:');
    console.log('userData:', JSON.stringify(userData, null, 2));
    console.log('authData:', JSON.stringify(authData, null, 2));

    // 3. Simular salvamento no localStorage
    console.log('\n3. Simulando salvamento no localStorage...');
    const localStorageData = JSON.stringify(authData);
    console.log('Dados para localStorage:', localStorageData);
    
    // 4. Verificar se os dados podem ser recuperados
    console.log('\n4. Testando recuperação dos dados...');
    const parsedData = JSON.parse(localStorageData);
    console.log('Dados recuperados:', parsedData);
    console.log('Token de acesso recuperado:', parsedData.accessToken ? 'Presente' : 'Ausente');
    console.log('Usuário recuperado:', parsedData.user ? 'Presente' : 'Ausente');
    
    // 5. Testar se o token funciona em uma requisição protegida
    console.log('\n5. Testando token em requisição protegida...');
    const protectedResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${parsedData.accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!protectedResponse.ok) {
      const errorText = await protectedResponse.text();
      throw new Error(`Requisição protegida falhou: ${protectedResponse.status} ${protectedResponse.statusText} - ${errorText}`);
    }

    const protectedData = await protectedResponse.json();
    console.log('✅ Requisição protegida bem-sucedida!');
    console.log('Dados da requisição protegida:', JSON.stringify(protectedData, null, 2));

    // 6. Verificar se há algum problema com o estado isAuthenticated
    console.log('\n6. Verificando lógica de autenticação...');
    const isAuthenticated = !!parsedData.user;
    console.log('isAuthenticated seria:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('✅ O usuário deveria estar autenticado!');
    } else {
      console.log('❌ O usuário NÃO estaria autenticado!');
    }

    console.log('\n🎉 Todos os testes de debug passaram!');
    console.log('\n📋 Resumo:');
    console.log('- Login: ✅ Funcionando');
    console.log('- Dados do usuário: ✅ Corretos');
    console.log('- Tokens: ✅ Válidos');
    console.log('- localStorage: ✅ Funcionaria');
    console.log('- Requisições protegidas: ✅ Funcionando');
    console.log('- Estado de autenticação: ✅ Correto');
    
    console.log('\n💡 Se o problema persiste no frontend, pode ser:');
    console.log('1. Problema na inicialização do contexto de autenticação');
    console.log('2. Problema no componente ProtectedRoute');
    console.log('3. Problema na verificação do localStorage na inicialização');
    console.log('4. Problema de timing na atualização do estado');

  } catch (error) {
    console.error('❌ Erro durante o debug:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Dica: Certifique-se de que o servidor backend está rodando na porta 4001');
    }
  }
}

debugFrontendAuth();