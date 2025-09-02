import { Express } from 'express';
import { IModule } from '../base/module.interface';
import roleRoutes from './role.routes';

export const rolesModule: IModule = {
  config: {
    id: 'roles',
    name: 'Gestão de Perfis',
    description: 'Gestão de perfis de acesso e controle de permissões',
    enabled: true
  },
  register: async (app: Express) => {
    app.use('/api/roles', roleRoutes);
    console.log('✓ Módulo Gestão de Perfis registrado');
  }
};