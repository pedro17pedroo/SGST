import { Request, Response } from 'express';
import { UserModel } from './user.model';
import { z } from 'zod';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      console.log('🔍 UserController.getUsers() chamado');
      const users = await UserModel.getAll();
      console.log(`📊 Controller recebeu: ${users.length} usuários`);
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
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
      console.error('Error fetching user:', error);
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
      console.error('Error creating user:', error);
      
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
      console.error('Error updating user:', error);
      
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
      console.error('Error deleting user:', error);
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
      console.error('Error fetching user roles:', error);
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
      console.error('Error setting user roles:', error);
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
      console.error('Error adding role to user:', error);
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
      console.error('Error removing role from user:', error);
      res.status(500).json({ 
        message: "Erro ao remover perfil do utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getUserPermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log('🔍 REQUISIÇÃO DE PERMISSÕES:', {
        userId: id,
        timestamp: new Date().toISOString()
      });
      const permissions = await UserModel.getUserPermissions(id);
      console.log('🔍 PERMISSÕES ENCONTRADAS:', {
        userId: id,
        permissionsCount: permissions.length,
        permissions: permissions.map(p => p.name)
      });
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
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
      console.error('Error checking user permission:', error);
      res.status(500).json({ 
        message: "Erro ao verificar permissão do utilizador", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}