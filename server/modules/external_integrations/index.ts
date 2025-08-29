import { IModule } from '../base/module.interface';
import routes from './external-integrations.routes';

export const ExternalIntegrationsModule: IModule = {
  name: 'Integrações Externas',
  route: '/api/integrations',
  router: routes,
  description: 'Gestão de integrações ERP/CRM/E-commerce'
};