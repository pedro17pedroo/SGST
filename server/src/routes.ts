import type { Express } from 'express';
import { moduleRegistry } from './modules/module-registry';

/**
 * Registra todas as rotas dos módulos na aplicação
 * @param app - Instância do Express
 * @returns Promise<Express> - Aplicação configurada
 */
export async function registerRoutes(app: Express): Promise<Express> {
  try {
    // Inicializar o gerenciador de módulos
    await moduleRegistry.registerEnabledModules(app);
    
    console.log('✅ Todas as rotas foram registadas com sucesso');
    return app;
  } catch (error) {
    console.error('❌ Erro ao registar rotas:', error);
    throw error;
  }
}