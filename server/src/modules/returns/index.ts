import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import { moduleGuard } from '../../middleware/module-guard';
import returnsRoutes from './returns.routes';

export class ReturnsModule extends BaseModule {
  config = MODULE_CONFIG.returns;

  async register(app: Express): Promise<void> {
    console.log('🔍 DEBUG: Iniciando registro do módulo returns...');
    console.log('🔍 DEBUG: returnsRoutes:', typeof returnsRoutes);
    
    // Registrar rotas do módulo com middleware de proteção
    app.use('/api/returns', moduleGuard('returns'), returnsRoutes);
    console.log('✓ Módulo Gestão de Devoluções registrado');
    console.log('🔍 DEBUG: Rotas /api/returns registradas com sucesso');
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new ReturnsModule();
export * from './returns.controller';
export * from './returns.model';