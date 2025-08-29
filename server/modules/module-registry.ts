import { Express } from 'express';
import { IModule } from './base/module.interface';
import { ModuleManager } from '../config/modules';

// Importar todos os módulos
import usersModule from './users';
import productsModule from './products';
import settingsModule from './settings';
import dashboardModule from './dashboard';
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