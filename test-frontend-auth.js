// Script para testar autenticação no frontend
// Usando fetch nativo do Node.js 18+

async function testFrontendAuth() {
  const baseUrl = 'http://localhost:4001';
  
  console.log('🔐 Testando autenticação no frontend...');
  
  try {
    // 1. Testar login
    console.log('\n1. Testando login...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
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
      const errorText = await loginResponse.text();
      console.error('❌ Login falhou:', loginResponse.status, errorText);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido');
    console.log('📋 Dados recebidos:', {
      user: loginData.user?.username,
      hasAccessToken: !!loginData.accessToken,
      hasRefreshToken: !!loginData.refreshToken,
      accessTokenLength: loginData.accessToken?.length || 0,
      refreshTokenLength: loginData.refreshToken?.length || 0
    });
    
    // 2. Testar acesso a rota protegida com token
    console.log('\n2. Testando acesso a rota protegida...');
    const protectedResponse = await fetch(`${baseUrl}/api/users/${loginData.user.id}/permissions`, {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`
      }
    });
    
    if (protectedResponse.ok) {
      console.log('✅ Acesso a rota protegida bem-sucedido');
    } else {
      const errorText = await protectedResponse.text();
      console.error('❌ Acesso a rota protegida falhou:', protectedResponse.status, errorText);
    }
    
    // 3. Testar refresh token
    console.log('\n3. Testando refresh token...');
    const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: loginData.refreshToken
      })
    });
    
    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      console.log('✅ Refresh token bem-sucedido');
      console.log('📋 Novos tokens recebidos:', {
        hasNewAccessToken: !!refreshData.accessToken,
        hasNewRefreshToken: !!refreshData.refreshToken
      });
    } else {
      const errorText = await refreshResponse.text();
      console.error('❌ Refresh token falhou:', refreshResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  }
}

testFrontendAuth();