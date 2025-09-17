import { Request, Response } from 'express';
import { UserModel } from './user.model';
import { z } from 'zod';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      // UserController.getUsers() chamado
      const users = await UserModel.getAll();
      // Controller recebeu usuários
      res.json(users);
    } catch (error) {
    // Error fetching users
      res.status(500).json({ 
        message: "Erro ao buscar utilizadores", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.getById(id);
      
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }
      
      res.json(user);
    } catch (error) {
    // Error fetching user
      res.status(500).json({ 
        message: "Erro ao buscar utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const user = await UserModel.create(req.body);
      res.status(201).json(user);
    } catch (error) {
    // Error creating user
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de utilizador inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.update(id, req.body);
      res.json(user);
    } catch (error) {
    // Error updating user
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados de utilizador inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await UserModel.delete(id);
      res.json({ success: true, message: "Utilizador eliminado com sucesso" });
    } catch (error) {
    // Error deleting user
      res.status(500).json({ 
        message: "Erro ao eliminar utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // RBAC - User Roles Management
  static async getUserRoles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const roles = await UserModel.getUserRoles(id);
      res.json(roles);
    } catch (error) {
    // Error fetching user roles
      res.status(500).json({ 
        message: "Erro ao buscar perfis do utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async setUserRoles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { roleIds } = req.body;
      
      await UserModel.setUserRoles(id, roleIds);
      res.json({ message: "Perfis do utilizador atualizados com sucesso" });
    } catch (error) {
    // Error setting user roles
      res.status(500).json({ 
        message: "Erro ao definir perfis do utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async addRoleToUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { roleId, assignedBy } = req.body;
      
      const result = await UserModel.addRoleToUser(id, roleId, assignedBy);
      res.json({ message: "Perfil adicionado ao utilizador com sucesso", result });
    } catch (error) {
    // Error adding role to user
      res.status(500).json({ 
        message: "Erro ao adicionar perfil ao utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async removeRoleFromUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { roleId } = req.body;
      
      await UserModel.removeRoleFromUser(id, roleId);
      res.json({ message: "Perfil removido do utilizador com sucesso" });
    } catch (error) {
    // Error removing role from user
      res.status(500).json({ 
        message: "Erro ao remover perfil do utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getUserPermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // REQUISIÇÃO DE PERMISSÕES
      const permissions = await UserModel.getUserPermissions(id);
      // PERMISSÕES ENCONTRADAS
      res.json(permissions);
    } catch (error) {
    // Error fetching user permissions
      res.status(500).json({ 
        message: "Erro ao buscar permissões do utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async checkPermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permission } = req.query;
      
      if (!permission || typeof permission !== 'string') {
        return res.status(400).json({ message: "Permissão não especificada" });
      }
      
      const hasPermission = await UserModel.hasPermission(id, permission);
      res.json({ hasPermission });
    } catch (error) {
    // Error checking user permission
      res.status(500).json({ 
        message: "Erro ao verificar permissão do utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}