import { storage } from '../../storage';
import { insertPermissionSchema } from '@shared/schema';
import { z } from 'zod';

export type PermissionCreateData = z.infer<typeof insertPermissionSchema>;
export type PermissionUpdateData = Partial<PermissionCreateData>;

export class PermissionModel {
  static async getAll() {
    return await storage.getPermissions();
  }

  static async getById(id: string) {
    return await storage.getPermission(id);
  }

  static async create(permissionData: PermissionCreateData) {
    const validatedData = insertPermissionSchema.parse(permissionData);
    return await storage.createPermission(validatedData);
  }

  static async update(id: string, updateData: PermissionUpdateData) {
    const validatedData = insertPermissionSchema.partial().parse(updateData);
    return await storage.updatePermission(id, validatedData);
  }

  static async delete(id: string) {
    return await storage.deletePermission(id);
  }

  static async getByModule(module: string) {
    return await storage.getPermissionsByModule(module);
  }

  static async seedDefaultPermissions() {
    const modules = [
      'dashboard', 'products', 'inventory', 'orders', 'shipments', 'suppliers', 
      'warehouses', 'users', 'roles', 'vehicles', 'gps_tracking', 'reports'
    ];
    
    const actions = ['read', 'create', 'update', 'delete'];
    const defaultPermissions = [];

    for (const module of modules) {
      for (const action of actions) {
        defaultPermissions.push({
          name: `${module}.${action}`,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
          module: module,
          action: action
        });
      }
    }

    // Adicionar permissões especiais
    defaultPermissions.push(
      {
        name: 'system.admin',
        description: 'Administrador do sistema',
        module: 'system',
        action: 'admin'
      },
      {
        name: 'reports.advanced',
        description: 'Acesso a relatórios avançados',
        module: 'reports',
        action: 'advanced'
      }
    );

    // Criar permissões que não existem
    const existingPermissions = await this.getAll();
    const existingNames = existingPermissions.map(p => p.name);
    
    for (const permission of defaultPermissions) {
      if (!existingNames.includes(permission.name)) {
        await storage.createPermission(permission);
      }
    }

    return defaultPermissions.length;
  }
}