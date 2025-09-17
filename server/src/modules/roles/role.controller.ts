import { Request, Response } from 'express';
import { RoleModel } from './role.model';
import { z } from 'zod';

export class RoleController {
  static async getRoles(req: Request, res: Response) {
    try {
      const roles = await RoleModel.getAll();
      res.json(roles);
    } catch (error) {
      // Error fetching roles
      res.status(500).json({ 
        message: "Erro ao buscar perfis", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await RoleModel.getById(id);
      
      if (!role) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }
      
      res.json(role);
    } catch (error) {
      // Error fetching role
      res.status(500).json({ 
        message: "Erro ao buscar perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createRole(req: Request, res: Response) {
    try {
      const role = await RoleModel.create(req.body);
      res.status(201).json(role);
    } catch (error) {
      // Error creating role
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados do perfil inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await RoleModel.update(id, req.body);
      
      if (!role) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }
      
      res.json(role);
    } catch (error) {
      // Error updating role
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados do perfil inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await RoleModel.delete(id);
      
      if (!success) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }
      
      res.json({ message: "Perfil eliminado com sucesso" });
    } catch (error) {
      // Error deleting role
      res.status(500).json({ 
        message: "Erro ao eliminar perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRolePermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const permissions = await RoleModel.getRolePermissions(id);
      res.json(permissions);
    } catch (error) {
      // Error fetching role permissions
      res.status(500).json({ 
        message: "Erro ao buscar permissões do perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async setRolePermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;
      
      const result = await RoleModel.setRolePermissions(id, permissionIds);
      res.json({ message: "Permissões do perfil atualizadas com sucesso", result });
    } catch (error) {
      // Error setting role permissions
      res.status(500).json({ 
        message: "Erro ao definir permissões do perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async addPermissionToRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permissionId } = req.body;
      
      const result = await RoleModel.addPermissionToRole(id, permissionId);
      res.json({ message: "Permissão adicionada ao perfil com sucesso", result });
    } catch (error) {
      // Error adding permission to role
      res.status(500).json({ 
        message: "Erro ao adicionar permissão ao perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async removePermissionFromRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permissionId } = req.body;
      
      const success = await RoleModel.removePermissionFromRole(id, permissionId);
      
      if (!success) {
        return res.status(404).json({ message: "Permissão não encontrada no perfil" });
      }
      
      res.json({ message: "Permissão removida do perfil com sucesso" });
    } catch (error) {
      // Error removing permission from role
      res.status(500).json({ 
        message: "Erro ao remover permissão do perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getUsersWithRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const users = await RoleModel.getUsersWithRole(id);
      res.json(users);
    } catch (error) {
      // Error fetching users with role
      res.status(500).json({ 
        message: "Erro ao buscar utilizadores com perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}