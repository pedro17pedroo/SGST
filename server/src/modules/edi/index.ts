import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { ModuleConfig } from '../../config/modules';
import ediRoutes from './edi.routes';
import { EDIModel } from './edi.model';

export class EDIModule extends BaseModule {
  public config: ModuleConfig = {
    id: 'edi',
    name: 'EDI (Electronic Data Interchange)',
    description: 'Sistema completo de EDI para troca de dados eletrônicos com parceiros comerciais',
    enabled: true,
    dependencies: ['auth', 'users', 'suppliers'],
    routes: ['/api/edi'],
    tables: [
      'edi_connections',
      'edi_message_types', 
      'edi_mapping_rules',
      'edi_validation_rules',
      'edi_documents',
      'edi_transactions',
      'edi_audit_logs'
    ],
    permissions: [
      'edi:read',
      'edi:create', 
      'edi:update',
      'edi:delete',
      'edi:process',
      'edi:send',
      'edi:test',
      'edi:monitor',
      'edi:audit'
    ]
  };

  async register(app: Express): Promise<void> {
    try {
      // Registrar rotas do módulo EDI
      app.use('/api/edi', ediRoutes);
      
      // Inicializar tipos de mensagem padrão
      await EDIModel.initializeDefaultMessageTypes();
      
      console.log('✅ Módulo EDI registrado com sucesso');
      console.log('📋 Rotas EDI disponíveis:');
      console.log('   - POST   /api/edi/connections');
      console.log('   - GET    /api/edi/connections');
      console.log('   - GET    /api/edi/connections/:id');
      console.log('   - PUT    /api/edi/connections/:id');
      console.log('   - DELETE /api/edi/connections/:id');
      console.log('   - POST   /api/edi/connections/:id/test');
      console.log('   - POST   /api/edi/documents/inbound');
      console.log('   - POST   /api/edi/documents/outbound');
      console.log('   - GET    /api/edi/documents');
      console.log('   - GET    /api/edi/documents/:id');
      console.log('   - GET    /api/edi/message-types');
      console.log('   - GET    /api/edi/message-types/:id');
      console.log('   - GET    /api/edi/transactions');
      console.log('   - GET    /api/edi/transactions/:id');
      console.log('   - GET    /api/edi/statistics');
      console.log('   - GET    /api/edi/audit-logs');
      console.log('   - GET    /api/edi/health');
      
    } catch (error) {
      console.error('❌ Erro ao registrar módulo EDI:', error);
      throw error;
    }
  }

  async unregister(): Promise<void> {
    console.log('🔄 Módulo EDI desregistrado');
  }
}

// Exportar instância do módulo
export const ediModule = new EDIModule();