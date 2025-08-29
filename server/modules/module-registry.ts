import { Express } from 'express';
import { IModule } from './base/module.interface';
import { ModuleManager } from '../config/modules';

// Importar todos os módulos
import usersModule from './users';
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
// Outros módulos serão adicionados aqui conforme forem criados

export class ModuleRegistry {
  private modules: Map<string, IModule> = new Map();
  private registeredModules: Set<string> = new Set();

  constructor() {
    // Registrar módulos disponíveis
    this.modules.set('users', usersModule);
    this.modules.set('products', productsModule);
    this.modules.set('settings', settingsModule);
    this.modules.set('dashboard', dashboardModule);
    this.modules.set('suppliers', suppliersModule);
    this.modules.set('warehouses', warehousesModule);
    this.modules.set('inventory', inventoryModule);
    this.modules.set('orders', ordersModule);
    this.modules.set('shipping', shippingModule);
    this.modules.set('public_tracking', publicTrackingModule);
    
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