import { Express } from 'express';
import { ModuleConfig } from '../../config/modules';

// Interface base para todos os módulos
export interface IModule {
  config: ModuleConfig;
  register(app: Express): Promise<void>;
  unregister?(app: Express): Promise<void>;
}

// Classe base abstrata para módulos
export abstract class BaseModule implements IModule {
  abstract config: ModuleConfig;

  abstract register(app: Express): Promise<void>;

  async unregister(app: Express): Promise<void> {
    // Implementação padrão - pode ser sobrescrita pelos módulos filhos
    console.log(`Módulo ${this.config.name} desregistrado`);
  }

  protected validateDependencies(): boolean {
    // Verificar se as dependências estão ativas
    // Esta validação será feita pelo ModuleManager
    return true;
  }
}