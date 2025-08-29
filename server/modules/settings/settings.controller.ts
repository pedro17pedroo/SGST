import { Request, Response } from 'express';
import { ModuleManager, MODULE_CONFIG } from '../../config/modules';

export class SettingsController {
  // Listar todos os módulos e seu estado
  static async getModules(req: Request, res: Response) {
    try {
      const modules = Object.values(MODULE_CONFIG).map(module => ({
        id: module.id,
        name: module.name,
        description: module.description,
        enabled: module.enabled,
        dependencies: module.dependencies || [],
        canDisable: module.id !== 'users' && module.id !== 'settings' && ModuleManager.canDisableModule(module.id)
      }));
      
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ 
        message: "Erro ao buscar módulos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obter detalhes de um módulo específico
  static async getModuleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const module = ModuleManager.getModuleById(id);
      
      if (!module) {
        return res.status(404).json({ message: "Módulo não encontrado" });
      }
      
      const moduleDetails = {
        ...module,
        canDisable: id !== 'users' && id !== 'settings' && ModuleManager.canDisableModule(id),
        dependentModules: ModuleManager.getModulesWithDependency(id)
      };
      
      res.json(moduleDetails);
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({ 
        message: "Erro ao buscar módulo", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Ativar um módulo
  static async enableModule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = ModuleManager.enableModule(id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      // Em produção, aqui seria necessário reiniciar as rotas
      res.json({ 
        success: true, 
        message: result.message,
        note: "Reinicie o servidor para aplicar as alterações"
      });
    } catch (error) {
      console.error('Error enabling module:', error);
      res.status(500).json({ 
        message: "Erro ao ativar módulo", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Desativar um módulo
  static async disableModule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Não permitir desativar módulos core
      if (id === 'users' || id === 'settings') {
        return res.status(400).json({ 
          message: "Não é possível desativar módulos core (utilizadores, configurações)" 
        });
      }
      
      const result = ModuleManager.disableModule(id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      
      res.json({ 
        success: true, 
        message: result.message,
        note: "Reinicie o servidor para aplicar as alterações"
      });
    } catch (error) {
      console.error('Error disabling module:', error);
      res.status(500).json({ 
        message: "Erro ao desativar módulo", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Obter configurações gerais do sistema
  static async getSettings(req: Request, res: Response) {
    try {
      const settings = {
        system: {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        },
        modules: {
          total: Object.keys(MODULE_CONFIG).length,
          enabled: ModuleManager.getEnabledModules().length,
          disabled: Object.keys(MODULE_CONFIG).length - ModuleManager.getEnabledModules().length
        },
        features: {
          modularArchitecture: true,
          hotReload: process.env.NODE_ENV === 'development',
          clustering: false
        }
      };
      
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ 
        message: "Erro ao buscar configurações", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}