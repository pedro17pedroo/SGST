// Script para testar o login no frontend
const BASE_URL = 'http://localhost:4001';

async function testFrontendLogin() {
  console.log('🧪 Testando login no frontend...');
  
  try {
    // 1. Testar login
    console.log('\n1. Fazendo login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: '123456'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido!');
    console.log('Dados do usuário:', loginData.user);
    console.log('Access Token:', loginData.accessToken ? 'Presente' : 'Ausente');
    console.log('Refresh Token:', loginData.refreshToken ? 'Presente' : 'Ausente');

    // 2. Simular salvamento no localStorage
    const authData = {
      user: loginData.user,
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken
    };
    
    console.log('\n2. Simulando salvamento no localStorage...');
    console.log('Dados que seriam salvos:', JSON.stringify(authData, null, 2));

    // 3. Testar acesso a rota protegida com token
    console.log('\n3. Testando acesso a rota protegida...');
    const protectedResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!protectedResponse.ok) {
      throw new Error(`Acesso a rota protegida falhou: ${protectedResponse.status} ${protectedResponse.statusText}`);
    }

    const userData = await protectedResponse.json();
    console.log('✅ Acesso a rota protegida bem-sucedido!');
    console.log('Dados do usuário da rota protegida:', userData);

    // 4. Verificar se o token está sendo aceito corretamente
    console.log('\n4. Verificando estrutura do token...');
    const tokenParts = loginData.accessToken.split('.');
    if (tokenParts.length === 3) {
      console.log('✅ Token JWT tem estrutura válida (3 partes)');
      
      // Decodificar payload (sem verificar assinatura)
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Payload do token:', payload);
        console.log('Token expira em:', new Date(payload.exp * 1000));
      } catch (e) {
        console.log('❌ Erro ao decodificar payload do token:', e.message);
      }
    } else {
      console.log('❌ Token JWT tem estrutura inválida');
    }

    console.log('\n🎉 Todos os testes passaram! O backend está funcionando corretamente.');
    console.log('\n📝 Próximos passos para debug:');
    console.log('1. Verificar se o frontend está enviando as credenciais corretas');
    console.log('2. Verificar se o localStorage está sendo atualizado após o login');
    console.log('3. Verificar se o contexto de autenticação está sendo atualizado');
    console.log('4. Verificar se as rotas protegidas estão verificando o token corretamente');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Dica: Certifique-se de que o servidor backend está rodando na porta 3001');
    }
  }
}

// Função para decodificar base64 no Node.js
function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

testFrontendLogin();