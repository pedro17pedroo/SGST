// Teste direto da URL da API
export const API_URL = import.meta.env.VITE_API_URL || 'FALLBACK_URL';
export const MODE = import.meta.env.MODE;

console.log('API_URL from env:', API_URL);
console.log('MODE:', MODE);

// Forçar que esta string apareça no build
if (API_URL.includes('gstock-api.tatusolutions.com')) {
  console.log('✅ Produção: URL da API está correta');
} else {
  console.log('❌ Erro: URL da API não está correta:', API_URL);
}