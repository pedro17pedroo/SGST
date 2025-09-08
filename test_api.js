const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4001,
  path: '/api/suppliers?page=1&limit=10',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== RESPOSTA DA API ===');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Resposta não é JSON válido:');
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Erro na requisição: ${e.message}`);
});

req.end();