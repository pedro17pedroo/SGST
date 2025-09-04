import { db } from '../../../database/db';
import { permissions, insertPermissionSchema } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export type PermissionCreateData = z.infer<typeof insertPermissionSchema>;
export type PermissionUpdateData = Partial<PermissionCreateData>;

export class PermissionModel {
  static async getAll() {
    try {
      const result = await db.select().from(permissions);
      return result;
    } catch (error) {
      console.error('Erro ao buscar todas as permissões:', error);
      return [];
    }
  }

  static async getById(id: string) {
    try {
      const result = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar permissão por ID:', error);
      return null;
    }
  }

  static async create(permissionData: PermissionCreateData) {
    try {
      const validatedData = insertPermissionSchema.parse(permissionData);
      const result = await db.insert(permissions).values(validatedData).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao criar permissão:', error);
      throw new Error('Erro ao criar permissão');
    }
  }

  static async update(id: string, updateData: PermissionUpdateData) {
    try {
      const validatedData = insertPermissionSchema.partial().parse(updateData);
      const result = await db.update(permissions).set(validatedData).where(eq(permissions.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      throw new Error('Erro ao atualizar permissão');
    }
  }

  static async delete(id: string) {
    try {
      await db.delete(permissions).where(eq(permissions.id, id));
      return true;
    } catch (error) {
      console.error('Erro ao eliminar permissão:', error);
      return false;
    }
  }

  static async getByModule(module: string) {
    try {
      const result = await db.select().from(permissions).where(eq(permissions.module, module));
      return result;
    } catch (error) {
      console.error('Erro ao buscar permissões por módulo:', error);
      return [];
    }
  }

  static async seedDefaultPermissions() {
    try {
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

      // Verificar permissões existentes
      const existingPermissions = await this.getAll();
      const existingNames = existingPermissions.map(p => p.name);
      
      let createdCount = 0;
      for (const permission of defaultPermissions) {
        if (!existingNames.includes(permission.name)) {
          await this.create(permission);
          createdCount++;
        }
      }

      return createdCount;
    } catch (error) {
      console.error('Erro ao criar permissões padrão:', error);
      throw new Error('Erro ao criar permissões padrão');
    }
  }
}