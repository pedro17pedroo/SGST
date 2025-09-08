import { Request, Response } from 'express';
import { SuppliersController } from './src/modules/suppliers/suppliers.controller';

// Mock do objeto Request
const mockRequest = {
  query: { q: 're' },
  params: {},
  body: {}
} as unknown as Request;

// Mock do objeto Response
const mockResponse = {
  status: (code: number) => {
    console.log(`Status: ${code}`);
    return mockResponse;
  },
  json: (data: any) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    return mockResponse;
  }
} as Response;

async function testSuppliersAPI() {
  try {
    console.log('🔍 Testando API de pesquisa de fornecedores...');
    console.log('Query:', mockRequest.query);
    
    await SuppliersController.searchSuppliers(mockRequest, mockResponse);
    
    console.log('\n✅ Teste da API concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste da API:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Stack trace não disponível');
  } finally {
    process.exit(0);
  }
}

testSuppliersAPI();