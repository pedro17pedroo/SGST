import { Express } from 'express';
import { IModule } from '../base/module.interface';
import fuelTypesRoutes from './fuel-types.routes';

/**
 * Módulo de Tipos de Combustível
 * Gestão de tipos de combustível para controlo de consumo da frota
 */
export class FuelTypesModule implements IModule {
  config = {
    id: 'fuel_types',
    name: 'Tipos de Combustível',
    description: 'Gestão de tipos de combustível para controlo de consumo da frota',
    enabled: true
  };

  async register(app: Express): Promise<void> {
    try {
      // Registrar rotas do módulo
      app.use('/api/fuel-types', fuelTypesRoutes);
      
      console.log('✓ Módulo Tipos de Combustível registrado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao registrar módulo Tipos de Combustível:', error);
      throw error;
    }
  }

  async unregister(app: Express): Promise<void> {
    // Implementar lógica de desregistro se necessário
    console.log('✓ Módulo Tipos de Combustível desregistrado');
  }
}

export const fuelTypesModule = new FuelTypesModule();
export default fuelTypesModule;