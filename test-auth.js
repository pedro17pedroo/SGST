const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testando autenticação...');
    
    // Primeiro, tentar fazer login
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
    
    console.log('Status do login:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login bem-sucedido:', loginData);
      
      // Extrair cookies da resposta
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('Cookies recebidos:', cookies);
      
      if (cookies) {
        // Testar pesquisa de clientes com os cookies
        const searchResponse = await fetch('http://localhost:4001/api/customers/search?q=test', {
          method: 'GET',
          headers: {
            'Cookie': cookies
          }
        });
        
        console.log('Status da pesquisa:', searchResponse.status);
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('Pesquisa bem-sucedida:', searchData);
        } else {
          const errorText = await searchResponse.text();
          console.log('Erro na pesquisa:', errorText);
        }
      }
    } else {
      const errorText = await loginResponse.text();
      console.log('Erro no login:', errorText);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

testAuth();