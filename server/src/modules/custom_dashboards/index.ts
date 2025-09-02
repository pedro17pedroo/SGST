import { IModule } from '../base/module.interface';
import routes from './custom-dashboards.routes';

export const CustomDashboardsModule: IModule = {
  name: 'Dashboards Personalizáveis',
  route: '/api/dashboards',
  router: routes,
  description: 'Criação e gestão de dashboards personalizados'
};