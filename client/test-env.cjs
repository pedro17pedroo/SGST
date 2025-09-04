// Script para testar variáveis de ambiente
require('dotenv').config({ path: '.env.production' });

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_API_URL:', process.env.VITE_API_URL);

// Simular import.meta.env como o Vite faz
const importMetaEnv = {
  MODE: process.env.NODE_ENV || 'development',
  VITE_API_URL: process.env.VITE_API_URL
};

console.log('import.meta.env.VITE_API_URL:', importMetaEnv.VITE_API_URL);
console.log('Fallback URL seria:', importMetaEnv.VITE_API_URL || 'http://localhost:5000');