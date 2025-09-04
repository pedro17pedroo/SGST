#!/usr/bin/env node

/**
 * Script de Teste de Autenticação para Produção
 * 
 * Este script testa se as correções de autenticação funcionam corretamente
 * simulando o comportamento de produção com HTTPS e cross-origin requests.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configurações de teste
const TEST_CONFIG = {
  // URLs de teste (ajustar conforme necessário)
  API_URL: process.env.TEST_API_URL || 'https://gstock-api.tatusolutions.com',
  FRONTEND_URL: process.env.TEST_FRONTEND_URL || 'https://gstock.tatusolutions.com',
  
  // Credenciais de teste
  USERNAME: 'admin',
  PASSWORD: '123456',
  
  // Timeout para requests
  TIMEOUT: 10000
};

let sessionCookies = '';

// Função para fazer requests HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': TEST_CONFIG.FRONTEND_URL,
        'User-Agent': 'SGST-Test-Client/1.0',
        ...options.headers
      },
      timeout: TEST_CONFIG.TIMEOUT
    };
    
    // Adicionar cookies de sessão se disponíveis
    if (sessionCookies) {
      requestOptions.headers['Cookie'] = sessionCookies;
    }
    
    // Para HTTPS, ignorar certificados auto-assinados em teste
    if (isHttps) {
      requestOptions.rejectUnauthorized = false;
    }
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Capturar cookies de sessão
        const setCookieHeader = res.headers['set-cookie'];
        if (setCookieHeader) {
          sessionCookies = setCookieHeader.join('; ');
        }
        
        let parsedData;
        try {
          parsedData = JSON.parse(data);
        } catch {
          parsedData = data;
        }
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsedData,
          cookies: sessionCookies
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    // Enviar dados se fornecidos
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Função para log colorido
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  
  const timestamp = new Date().toISOString();
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

// Teste 1: Verificar se o servidor está acessível
async function testServerHealth() {
  log('🏥 Testando saúde do servidor...', 'info');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.API_URL}/health`);
    
    if (response.status === 200) {
      log('✅ Servidor está acessível', 'success');
      return true;
    } else {
      log(`❌ Servidor retornou status ${response.status}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao conectar ao servidor: ${error.message}`, 'error');
    return false;
  }
}

// Teste 2: Testar login
async function testLogin() {
  log('🔐 Testando login...', 'info');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.API_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        username: TEST_CONFIG.USERNAME,
        password: TEST_CONFIG.PASSWORD
      }
    });
    
    if (response.status === 200) {
      log('✅ Login realizado com sucesso', 'success');
      log(`🍪 Cookies recebidos: ${response.cookies ? 'Sim' : 'Não'}`, 'info');
      return true;
    } else {
      log(`❌ Login falhou com status ${response.status}`, 'error');
      log(`📄 Resposta: ${JSON.stringify(response.data)}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Erro durante login: ${error.message}`, 'error');
    return false;
  }
}

// Teste 3: Testar acesso a endpoint protegido
async function testProtectedEndpoint() {
  log('🔒 Testando acesso a endpoint protegido...', 'info');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.API_URL}/api/inventory/summary`);
    
    if (response.status === 200) {
      log('✅ Acesso a endpoint protegido bem-sucedido', 'success');
      return true;
    } else if (response.status === 401) {
      log('❌ Acesso negado - sessão não persistiu', 'error');
      log(`📄 Resposta: ${JSON.stringify(response.data)}`, 'error');
      return false;
    } else {
      log(`⚠️ Endpoint retornou status inesperado: ${response.status}`, 'warning');
      return false;
    }
  } catch (error) {
    log(`❌ Erro ao acessar endpoint protegido: ${error.message}`, 'error');
    return false;
  }
}

// Teste 4: Testar múltiplos endpoints
async function testMultipleEndpoints() {
  log('🔄 Testando múltiplos endpoints...', 'info');
  
  const endpoints = [
    '/api/products?limit=5',
    '/api/orders/recent',
    '/api/warehouses',
    '/api/categories'
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${TEST_CONFIG.API_URL}${endpoint}`);
      
      if (response.status === 200) {
        log(`✅ ${endpoint} - OK`, 'success');
        successCount++;
      } else {
        log(`❌ ${endpoint} - Status ${response.status}`, 'error');
      }
    } catch (error) {
      log(`❌ ${endpoint} - Erro: ${error.message}`, 'error');
    }
    
    // Pequena pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const successRate = (successCount / endpoints.length) * 100;
  log(`📊 Taxa de sucesso: ${successRate.toFixed(1)}% (${successCount}/${endpoints.length})`, 
      successRate >= 80 ? 'success' : 'warning');
  
  return successRate >= 80;
}

// Função principal
async function runTests() {
  log('🚀 Iniciando testes de autenticação de produção...', 'info');
  log(`🌐 API URL: ${TEST_CONFIG.API_URL}`, 'info');
  log(`🖥️ Frontend URL: ${TEST_CONFIG.FRONTEND_URL}`, 'info');
  log('=' .repeat(60), 'info');
  
  const results = {
    serverHealth: false,
    login: false,
    protectedEndpoint: false,
    multipleEndpoints: false
  };
  
  // Executar testes em sequência
  results.serverHealth = await testServerHealth();
  
  if (results.serverHealth) {
    results.login = await testLogin();
    
    if (results.login) {
      results.protectedEndpoint = await testProtectedEndpoint();
      results.multipleEndpoints = await testMultipleEndpoints();
    }
  }
  
  // Relatório final
  log('=' .repeat(60), 'info');
  log('📋 RELATÓRIO FINAL:', 'info');
  log(`🏥 Saúde do servidor: ${results.serverHealth ? '✅ OK' : '❌ FALHOU'}`, 
      results.serverHealth ? 'success' : 'error');
  log(`🔐 Login: ${results.login ? '✅ OK' : '❌ FALHOU'}`, 
      results.login ? 'success' : 'error');
  log(`🔒 Endpoint protegido: ${results.protectedEndpoint ? '✅ OK' : '❌ FALHOU'}`, 
      results.protectedEndpoint ? 'success' : 'error');
  log(`🔄 Múltiplos endpoints: ${results.multipleEndpoints ? '✅ OK' : '❌ FALHOU'}`, 
      results.multipleEndpoints ? 'success' : 'error');
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('🎉 TODOS OS TESTES PASSARAM! Autenticação funcionando corretamente.', 'success');
    process.exit(0);
  } else {
    log('💥 ALGUNS TESTES FALHARAM! Verificar configuração de produção.', 'error');
    process.exit(1);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  runTests().catch((error) => {
    log(`💥 Erro fatal: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runTests, makeRequest, TEST_CONFIG };