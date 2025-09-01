import { Express } from 'express';
import { IModule } from './base/module.interface';
import { ModuleManager } from '../config/modules';

// Importar todos os módulos
import usersModule from './users';
import { authModule } from './auth';
import customersModule from './customers';
import productsModule from './products';
import settingsModule from './settings';
import dashboardModule from './dashboard';
import suppliersModule from './suppliers';
import warehousesModule from './warehouses';
import inventoryModule from './inventory';
import ordersModule from './orders';
import shippingModule from './shipping';
import publicTrackingModule from './public_tracking';
import { initializeBarcodeScanningModule } from './barcode_scanning';
import { initializeInventoryCountsModule } from './inventory_counts';
import { initializeProductLocationsModule } from './product_locations';
import { initializePickingPackingModule } from './picking_packing';
import { initializeBatchManagementModule } from './batch_management';
import { initializeInventoryAlertsModule } from './inventory_alerts';
import { initializeOfflineSyncModule } from './offline_sync';
import { initializeComputerVisionModule } from './computer_vision';
import { initializeRTLSModule } from './rtls_hybrid';
import computerVisionModule from './computer-vision';
import smartReceivingModule from './smart-receiving';
import putawayManagementModule from './putaway-management';
import intelligentReplenishmentModule from './intelligent-replenishment';
import { digitalTwinModule } from './digital-twin';
import { greenETAModule } from './green-eta';
import tripleLedgerModule from './triple-ledger';
import autoSlottingModule from './auto-slotting';
import { initializeAngolaOperationsModule } from './angola_operations';
import { fleetManagementModule } from './fleet_management/fleet.module';
import { rolesModule } from './roles/role.module';
import { permissionsModule } from './permissions/permission.module';
import { gpsModule } from './gps/gps.module';
// Outros módulos serão adicionados aqui conforme forem criados

export class ModuleRegistry {
  private modules: Map<string, IModule> = new Map();
  private registeredModules: Set<string> = new Set();

  constructor() {
    // Registrar módulos disponíveis
    this.modules.set('auth', authModule);
    this.modules.set('users', usersModule);
    this.modules.set('customers', customersModule);
    this.modules.set('products', productsModule);
    this.modules.set('settings', settingsModule);
    this.modules.set('dashboard', dashboardModule);
    this.modules.set('suppliers', suppliersModule);
    this.modules.set('warehouses', warehousesModule);
    this.modules.set('inventory', inventoryModule);
    this.modules.set('orders', ordersModule);
    this.modules.set('shipping', shippingModule);
    this.modules.set('public_tracking', publicTrackingModule);
    this.modules.set('computer_vision', computerVisionModule);
    this.modules.set('smart_receiving', smartReceivingModule);
    this.modules.set('putaway_management', putawayManagementModule);
    this.modules.set('intelligent_replenishment', intelligentReplenishmentModule);
    this.modules.set('digital_twin', digitalTwinModule);
    this.modules.set('green_eta', greenETAModule);
    this.modules.set('triple_ledger', tripleLedgerModule);
    this.modules.set('auto_slotting', autoSlottingModule);
    this.modules.set('fleet_management', fleetManagementModule);
    this.modules.set('roles', rolesModule);
    this.modules.set('permissions', permissionsModule);
    this.modules.set('gps_tracking', gpsModule);
    
    // Temporary direct registration for barcode scanning
    this.modules.set('barcode_scanning', {
      config: { 
        id: 'barcode_scanning', 
        name: 'Leitura de Códigos',
        description: 'Leitura de códigos de barras e QR',
        enabled: true
      },
      register: async (app: Express) => {
        initializeBarcodeScanningModule(app);
        console.log('✓ Módulo Leitura de Códigos registrado');
      }
    });

    // Temporary direct registration for inventory counts
    this.modules.set('inventory_counts', {
      config: { 
        id: 'inventory_counts', 
        name: 'Contagens de Inventário',
        description: 'Contagens cíclicas e reconciliação de stock',
        enabled: true
      },
      register: async (app: Express) => {
        initializeInventoryCountsModule(app);
        console.log('✓ Módulo Contagens de Inventário registrado');
      }
    });

    // Temporary direct registration for product locations
    this.modules.set('product_locations', {
      config: { 
        id: 'product_locations', 
        name: 'Localizações de Produtos',
        description: 'Organização e localização de produtos nos armazéns',
        enabled: true
      },
      register: async (app: Express) => {
        initializeProductLocationsModule(app);
        console.log('✓ Módulo Localizações de Produtos registrado');
      }
    });

    // Temporary direct registration for picking packing
    this.modules.set('picking_packing', {
      config: { 
        id: 'picking_packing', 
        name: 'Picking & Packing',
        description: 'Listas de picking e preparação de encomendas',
        enabled: true
      },
      register: async (app: Express) => {
        initializePickingPackingModule(app);
        console.log('✓ Módulo Picking & Packing registrado');
      }
    });

    // Temporary direct registration for batch management
    this.modules.set('batch_management', {
      config: { 
        id: 'batch_management', 
        name: 'Gestão de Lotes',
        description: 'Rastreamento de lotes e datas de validade',
        enabled: true
      },
      register: async (app: Express) => {
        initializeBatchManagementModule(app);
        console.log('✓ Módulo Gestão de Lotes registrado');
      }
    });

    // Temporary direct registration for inventory alerts
    this.modules.set('inventory_alerts', {
      config: { 
        id: 'inventory_alerts', 
        name: 'Alertas de Inventário',
        description: 'Sistema avançado de alertas para gestão de inventário',
        enabled: true
      },
      register: async (app: Express) => {
        initializeInventoryAlertsModule(app);
        console.log('✓ Módulo Alertas de Inventário registrado');
      }
    });

    // Temporary direct registration for reports
    this.modules.set('reports', {
      config: { 
        id: 'reports', 
        name: 'Relatórios Avançados',
        description: 'Relatórios e análises avançadas de inventário',
        enabled: true
      },
      register: async (app: Express) => {
        const { default: reportsRoutes } = await import('./reports/reports.routes.js');
        app.use('/api/reports', reportsRoutes);
        console.log('✓ Módulo Relatórios Avançados registrado');
      }
    });

    // Offline-First Sync Module
    this.modules.set('offline_sync', {
      config: { 
        id: 'offline_sync', 
        name: 'Sincronização Offline',
        description: 'Sistema offline-first com CRDTs e sincronização automática',
        enabled: true
      },
      register: async (app: Express) => {
        initializeOfflineSyncModule(app);
        console.log('✓ Módulo Sincronização Offline registrado');
      }
    });

    // Computer Vision Edge Module
    this.modules.set('computer_vision', {
      config: { 
        id: 'computer_vision', 
        name: 'Computer Vision Edge',
        description: 'Contagem automática, detecção de danos e leitura de etiquetas',
        enabled: true
      },
      register: async (app: Express) => {
        initializeComputerVisionModule(app);
        console.log('✓ Módulo Computer Vision Edge registrado');
      }
    });

    // RTLS Hybrid Module  
    this.modules.set('rtls_hybrid', {
      config: { 
        id: 'rtls_hybrid', 
        name: 'RTLS Híbrido',
        description: 'Sistema de localização em tempo real com RFID + UWB + BLE',
        enabled: true
      },
      register: async (app: Express) => {
        initializeRTLSModule(app);
        console.log('✓ Módulo RTLS Híbrido registrado');
      }
    });

    // Advanced enterprise modules
    this.modules.set('backup_restore', {
      config: { 
        id: 'backup_restore', 
        name: 'Backup e Restore',
        description: 'Sistema de backup e restore de dados',
        enabled: true
      },
      register: async (app: Express) => {
        const { initializeBackupRestoreModule } = await import('./backup_restore/index.js');
        await initializeBackupRestoreModule(app);
        console.log('✓ Módulo Backup e Restore registrado');
      }
    });

    this.modules.set('gps_tracking', {
      config: { 
        id: 'gps_tracking', 
        name: 'GPS Tracking',
        description: 'Sistema de rastreamento GPS em tempo real',
        enabled: true
      },
      register: async (app: Express) => {
        const { initializeGPSTrackingModule } = await import('./gps_tracking/index.js');
        await initializeGPSTrackingModule(app);
        console.log('✓ Módulo GPS Tracking registrado');
      }
    });

    this.modules.set('purchase_approvals', {
      config: { 
        id: 'purchase_approvals', 
        name: 'Aprovações de Compras',
        description: 'Sistema de aprovações para ordens de compra',
        enabled: true
      },
      register: async (app: Express) => {
        const { initializePurchaseApprovalsModule } = await import('./purchase_approvals/index.js');
        await initializePurchaseApprovalsModule(app);
        console.log('✓ Módulo Aprovações de Compras registrado');
      }
    });

    this.modules.set('rma_returns', {
      config: { 
        id: 'rma_returns', 
        name: 'Gestão de Devoluções (RMA)',
        description: 'Sistema completo de gestão de devoluções e RMA',
        enabled: true
      },
      register: async (app: Express) => {
        const { initializeRMAReturnsModule } = await import('./rma_returns/index.js');
        await initializeRMAReturnsModule(app);
        console.log('✓ Módulo Gestão de Devoluções (RMA) registrado');
      }
    });

    this.modules.set('erp_integrations', {
      config: { 
        id: 'erp_integrations', 
        name: 'Integrações ERP/CRM',
        description: 'Integrações com SAP, Salesforce e e-commerce',
        enabled: true
      },
      register: async (app: Express) => {
        const { initializeERPIntegrationsModule } = await import('./erp_integrations/index.js');
        await initializeERPIntegrationsModule(app);
        console.log('✓ Módulo Integrações ERP/CRM registrado');
      }
    });

    this.modules.set('compliance', {
      config: { 
        id: 'compliance', 
        name: 'Conformidade Regulamentar',
        description: 'Conformidade com IVA Angola e GDPR',
        enabled: true
      },
      register: async (app: Express) => {
        const { initializeComplianceModule } = await import('./compliance/index.js');
        await initializeComplianceModule(app);
        console.log('✓ Módulo Conformidade Regulamentar registrado');
      }
    });

    this.modules.set('ai_analytics', {
      config: { 
        id: 'ai_analytics', 
        name: 'Análises Preditivas com IA',
        description: 'Análises preditivas e otimização com inteligência artificial',
        enabled: true
      },
      register: async (app: Express) => {
        const { initializeAIAnalyticsModule } = await import('./ai_analytics/index.js');
        await initializeAIAnalyticsModule(app);
        console.log('✓ Módulo Análises Preditivas com IA registrado');
      }
    });

    // External Integrations Module
    this.modules.set('external_integrations', {
      config: { 
        id: 'external_integrations', 
        name: 'Integrações Externas Enterprise',
        description: 'Integrações avançadas com ERP/CRM/E-commerce (SAP, Salesforce, Shopify)',
        enabled: true
      },
      register: async (app: Express) => {
        const { default: externalIntegrationsRoutes } = await import('./external_integrations/external-integrations.routes.js');
        app.use('/api/integrations', externalIntegrationsRoutes);
        console.log('✓ Módulo Integrações Externas Enterprise registrado');
      }
    });

    // Custom Dashboards Module
    this.modules.set('custom_dashboards', {
      config: { 
        id: 'custom_dashboards', 
        name: 'Dashboards Personalizáveis',
        description: 'Criação e gestão de dashboards personalizados com 15+ tipos de widgets',
        enabled: true
      },
      register: async (app: Express) => {
        const { default: customDashboardsRoutes } = await import('./custom_dashboards/custom-dashboards.routes.js');
        app.use('/api/dashboards', customDashboardsRoutes);
        console.log('✓ Módulo Dashboards Personalizáveis registrado');
      }
    });

    // Quality Control Module
    this.modules.set('quality_control', {
      config: { 
        id: 'quality_control', 
        name: 'Controlo de Qualidade',
        description: 'Gestão de qualidade, inspeções e auditorias',
        enabled: true
      },
      register: async (app: Express) => {
        // Use existing compliance module which includes quality controls
        const { complianceRoutes } = await import('./compliance/compliance.routes.js');
        app.use('/api/quality-control', complianceRoutes);
        console.log('✓ Módulo Controlo de Qualidade registrado');
      }
    });

    // AI Analytics Advanced Module
    this.modules.set('ai_analytics_advanced', {
      config: { 
        id: 'ai_analytics_advanced', 
        name: 'IA Analytics Avançada',
        description: 'Previsão demanda, otimização preços, detecção anomalias e segmentação clientes',
        enabled: true
      },
      register: async (app: Express) => {
        const { aiAnalyticsRoutes } = await import('./ai_analytics/ai-analytics.routes.js');
        app.use('/api/ai-analytics', aiAnalyticsRoutes);
        console.log('✓ Módulo IA Analytics Avançada registrado');
      }
    });

    // Angola Operations Module - Seção 4.10
    this.modules.set('angola_operations', {
      config: { 
        id: 'angola_operations', 
        name: 'Operação em Angola',
        description: 'Tolerância a falhas, mapas offline, SMS/USSD fallback e buffer local',
        enabled: true
      },
      register: async (app: Express) => {
        initializeAngolaOperationsModule(app);
        console.log('✓ Módulo Operação em Angola registrado');
      }
    });
  }

  async registerEnabledModules(app: Express): Promise<void> {
    const enabledModules = ModuleManager.getEnabledModules();
    
    console.log('📦 Iniciando registro de módulos...');
    
    for (const moduleConfig of enabledModules) {
      const module = this.modules.get(moduleConfig.id);
      
      if (module) {
        try {
          // Verificar dependências antes de registrar
          if (ModuleManager.validateDependencies(moduleConfig.id)) {
            await module.register(app);
            this.registeredModules.add(moduleConfig.id);
          } else {
            console.warn(`⚠️  Módulo ${moduleConfig.name} ignorado - dependências não atendidas`);
          }
        } catch (error) {
          console.error(`❌ Erro ao registrar módulo ${moduleConfig.name}:`, error);
        }
      } else {
        console.warn(`⚠️  Implementação do módulo ${moduleConfig.name} não encontrada`);
      }
    }
    
    console.log(`✅ ${this.registeredModules.size} módulos registrados com sucesso`);
  }

  async unregisterModule(app: Express, moduleId: string): Promise<boolean> {
    const module = this.modules.get(moduleId);
    
    if (module && this.registeredModules.has(moduleId)) {
      try {
        await module.unregister?.(app);
        this.registeredModules.delete(moduleId);
        console.log(`✗ Módulo ${module.config.name} desregistrado`);
        return true;
      } catch (error) {
        console.error(`❌ Erro ao desregistrar módulo ${module.config.name}:`, error);
        return false;
      }
    }
    
    return false;
  }

  getRegisteredModules(): string[] {
    return Array.from(this.registeredModules);
  }

  isModuleRegistered(moduleId: string): boolean {
    return this.registeredModules.has(moduleId);
  }

  addModule(moduleId: string, module: IModule): void {
    this.modules.set(moduleId, module);
  }

  getModule(moduleId: string): IModule | undefined {
    return this.modules.get(moduleId);
  }
}

// Instância singleton do registry
export const moduleRegistry = new ModuleRegistry();