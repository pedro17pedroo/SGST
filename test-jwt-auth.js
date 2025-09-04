// Teste da autenticação JWT
// Usando fetch nativo do Node.js (v18+)

const API_BASE = 'http://localhost:4001';

// Função para fazer requisições
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { error: error.message };
  }
}

// Teste principal
async function testJWTAuth() {
  console.log('🧪 Testando autenticação JWT...');
  
  // 1. Teste de login
  console.log('\n1. Testando login...');
  const loginResult = await makeRequest(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: '123456'
    })
  });
  
  if (!loginResult.ok) {
    console.error('❌ Falha no login:', loginResult.data);
    return;
  }
  
  console.log('✅ Login bem-sucedido');
  const { accessToken, refreshToken, user } = loginResult.data;
  console.log('📝 Access Token:', accessToken ? 'Presente' : 'Ausente');
  console.log('🔄 Refresh Token:', refreshToken ? 'Presente' : 'Ausente');
  console.log('👤 Usuário:', user.username);
  
  // 2. Teste de acesso a rota protegida
  console.log('\n2. Testando acesso a rota protegida...');
  const profileResult = await makeRequest(`${API_BASE}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  if (profileResult.ok) {
    console.log('✅ Acesso a rota protegida bem-sucedido');
    console.log('👤 Perfil:', profileResult.data.username);
  } else {
    console.error('❌ Falha no acesso a rota protegida:', profileResult.data);
  }
  
  // 3. Teste de refresh token
  console.log('\n3. Testando refresh token...');
  const refreshResult = await makeRequest(`${API_BASE}/api/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  });
  
  if (refreshResult.ok) {
    console.log('✅ Refresh token bem-sucedido');
    console.log('🆕 Novo Access Token:', refreshResult.data.accessToken ? 'Gerado' : 'Falha');
    console.log('🆕 Novo Refresh Token:', refreshResult.data.refreshToken ? 'Gerado' : 'Falha');
    
    // 4. Teste com novo token
    console.log('\n4. Testando com novo access token...');
    const newTokenResult = await makeRequest(`${API_BASE}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshResult.data.accessToken}`
      }
    });
    
    if (newTokenResult.ok) {
      console.log('✅ Novo token funcionando corretamente');
    } else {
      console.error('❌ Novo token não está funcionando:', newTokenResult.data);
    }
  } else {
    console.error('❌ Falha no refresh token:', refreshResult.data);
  }
  
  // 5. Teste de token inválido
  console.log('\n5. Testando token inválido...');
  const invalidTokenResult = await makeRequest(`${API_BASE}/api/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer token_invalido'
    }
  });
  
  if (invalidTokenResult.status === 401) {
    console.log('✅ Token inválido rejeitado corretamente (401)');
  } else {
    console.error('❌ Token inválido não foi rejeitado:', invalidTokenResult);
  }
  
  console.log('\n🎉 Teste de autenticação JWT concluído!');
}

// Executar teste
testJWTAuth().catch(console.error);