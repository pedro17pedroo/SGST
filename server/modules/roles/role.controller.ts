import { Request, Response } from 'express';
import { RoleModel } from './role.model';
import { z } from 'zod';

export class RoleController {
  static async getRoles(req: Request, res: Response) {
    try {
      const roles = await RoleModel.getAll();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
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
      console.error('Error fetching role:', error);
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
      console.error('Error creating role:', error);
      
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
      console.error('Error updating role:', error);
      
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
      console.error('Error deleting role:', error);
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
      console.error('Error fetching role permissions:', error);
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
      console.error('Error setting role permissions:', error);
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
      console.error('Error adding permission to role:', error);
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
      console.error('Error removing permission from role:', error);
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
      console.error('Error fetching users with role:', error);
      res.status(500).json({ 
        message: "Erro ao buscar utilizadores com perfil", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}