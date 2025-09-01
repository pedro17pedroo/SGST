import { Express } from 'express';
import { fleetRoutes } from './fleet.routes.js';
import { IModule, ModuleConfig } from '../types.js';

const config: ModuleConfig = {
  id: 'fleet_management',
  name: 'Gestão de Veículos',
  description: 'Gestão completa de frota, GPS tracking e associação veículo-envio',
  enabled: true,
  dependencies: ['auth', 'users', 'orders', 'shipping']
};

export const fleetManagementModule: IModule = {
  config,
  register: async (app: Express) => {
    app.use('/api/fleet', fleetRoutes);
    console.log('✓ Módulo Gestão de Veículos registrado');
  }
};

export function initializeFleetManagementModule(app: Express) {
  app.use('/api/fleet', fleetRoutes);
}