import { Express } from 'express';
import { IModule } from '../base/module.interface';
import vehicleTypesRoutes from './vehicle-types.routes';

/**
 * Módulo de Tipos de Veículo
 * Gestão de tipos de veículo para categorização da frota
 */
export class VehicleTypesModule implements IModule {
  config = {
    id: 'vehicle_types',
    name: 'Tipos de Veículo',
    description: 'Gestão de tipos de veículo para categorização da frota',
    enabled: true
  };

  async register(app: Express): Promise<void> {
    try {
      // Registrar rotas do módulo
      app.use('/api/vehicle-types', vehicleTypesRoutes);
      
      // Módulo Tipos de Veículo registrado com sucesso
    } catch (error) {
      // Erro ao registrar módulo Tipos de Veículo
      throw error;
    }
  }

  async unregister(app: Express): Promise<void> {
    // Implementar lógica de desregistro se necessário
    // Módulo Tipos de Veículo desregistrado
  }
}

export const vehicleTypesModule = new VehicleTypesModule();
export default vehicleTypesModule;