import { Request, Response } from 'express';
import { UserModel } from './user.model';
import { z } from 'zod';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.getAll();
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
}