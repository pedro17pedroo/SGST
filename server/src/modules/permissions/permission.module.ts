import { Express } from 'express';
import { IModule } from '../base/module.interface';
import permissionRoutes from './permission.routes';

export const permissionsModule: IModule = {
  config: {
    id: 'permissions',
    name: 'Gestão de Permissões',
    description: 'Gestão de permissões do sistema e controle de acesso',
    enabled: true
  },
  register: async (app: Express) => {
    app.use('/api/permissions', permissionRoutes);
    console.log('✓ Módulo Gestão de Permissões registrado');
  }
};