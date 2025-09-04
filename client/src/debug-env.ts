// Script de debug para verificar variáveis de ambiente
console.log('=== DEBUG ENV VARS ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
console.log('PROD:', import.meta.env.PROD);
console.log('======================');

// Exportar para poder importar em outros arquivos
export const debugEnv = () => {
  return {
    apiUrl: import.meta.env.VITE_API_URL,
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
  };
};