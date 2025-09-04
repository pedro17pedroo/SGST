import dotenv from "dotenv";
dotenv.config();

async function testSession() {
  console.log("🧪 Testando sessão e autenticação...");
  
  try {
    // Teste 1: Fazer login
    console.log("\n1. Fazendo login com admin...");
    const loginResponse = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log(`Login Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log("✅ Login bem-sucedido!");
      console.log("User:", loginData.user);
      
      // Extrair cookies da resposta
      const cookies = loginResponse.headers.get('set-cookie');
      console.log("Cookies:", cookies);
      
      // Teste 2: Tentar acessar /api/users com a sessão
      console.log("\n2. Testando acesso a /api/users com sessão...");
      const usersResponse = await fetch('http://localhost:4001/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        credentials: 'include'
      });
      
      console.log(`Users API Status: ${usersResponse.status}`);
      
      if (usersResponse.status === 200) {
        const users = await usersResponse.json();
        console.log("✅ API de usuários funcionando!");
        console.log(`Usuários encontrados: ${users.length}`);
        users.forEach((user: any, index: number) => {
          console.log(`${index + 1}. ${user.username} (${user.role})`);
        });
      } else {
        const errorText = await usersResponse.text();
        console.log("❌ Erro ao acessar API de usuários:", errorText);
      }
      
    } else {
      const errorText = await loginResponse.text();
      console.log("❌ Erro no login:", errorText);
    }
    
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

testSession();