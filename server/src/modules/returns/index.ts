import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import { moduleGuard } from '../../middleware/module-guard';
import returnsRoutes from './returns.routes';

export class ReturnsModule extends BaseModule {
  config = MODULE_CONFIG.returns;

  async register(app: Express): Promise<void> {
    try {
      console.log('🔍 DEBUG Returns: Iniciando registo do módulo returns...');
      console.log('🔍 DEBUG Returns: Tipo do app:', typeof app);
      console.log('🔍 DEBUG Returns: Tipo das rotas:', typeof returnsRoutes);
      
      // Registrar rotas do módulo com middleware de proteção
      app.use('/api/returns', moduleGuard('returns'), returnsRoutes);
      
      console.log('✅ Rotas de returns registradas com sucesso');
      console.log('✅ Rotas registradas no caminho: /api/returns');
    } catch (error) {
      console.error('❌ Erro ao registrar rotas de returns:', error);
      throw error;
    }
  }

  async unregister(app: Express): Promise<void> {
    // Módulo desregistrado
  }
}

export default new ReturnsModule();
export * from './returns.controller';
export * from './returns.model';