import { Express } from 'express';
import { IModule } from '../base/module.interface';
import reportsRoutes from './reports.routes';

export { ReportsModel } from './reports.model';
export { ReportsController } from './reports.controller';
export { default as reportsRoutes } from './reports.routes';

const reportsModule: IModule = {
  config: {
    id: 'reports',
    name: 'Relatórios',
    description: 'Módulo de relatórios e análises',
    enabled: true
  },
  register: async (app: Express) => {
    app.use('/api/reports', reportsRoutes);
    console.log('✓ Módulo Relatórios registrado');
  }
};

export default reportsModule;