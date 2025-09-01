import { IModule } from '../base/module.interface';
import customersRoutes from './customers.routes';

export const customersModule: IModule = {
  config: {
    id: 'customers',
    name: 'Gestão de Clientes',
    description: 'Gestão completa de clientes, incluindo dados pessoais, histórico e preferências',
    enabled: true
  },
  
  async register(app) {
    app.use('/api/customers', customersRoutes);
    console.log('✓ Módulo Gestão de Clientes registrado');
  }
};