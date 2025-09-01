import { Request, Response } from 'express';
import { PermissionModel } from './permission.model';
import { z } from 'zod';

export class PermissionController {
  static async getPermissions(req: Request, res: Response) {
    try {
      const { module } = req.query;
      
      let permissions;
      if (module && typeof module === 'string') {
        permissions = await PermissionModel.getByModule(module);
      } else {
        permissions = await PermissionModel.getAll();
      }
      
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ 
        message: "Erro ao buscar permissões", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPermissionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const permission = await PermissionModel.getById(id);
      
      if (!permission) {
        return res.status(404).json({ message: "Permissão não encontrada" });
      }
      
      res.json(permission);
    } catch (error) {
      console.error('Error fetching permission:', error);
      res.status(500).json({ 
        message: "Erro ao buscar permissão", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createPermission(req: Request, res: Response) {
    try {
      const permission = await PermissionModel.create(req.body);
      res.status(201).json(permission);
    } catch (error) {
      console.error('Error creating permission:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados da permissão inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao criar permissão", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updatePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const permission = await PermissionModel.update(id, req.body);
      
      if (!permission) {
        return res.status(404).json({ message: "Permissão não encontrada" });
      }
      
      res.json(permission);
    } catch (error) {
      console.error('Error updating permission:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados da permissão inválidos", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Erro ao atualizar permissão", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deletePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PermissionModel.delete(id);
      res.json({ message: "Permissão eliminada com sucesso" });
    } catch (error) {
      console.error('Error deleting permission:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar permissão", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async seedPermissions(req: Request, res: Response) {
    try {
      const count = await PermissionModel.seedDefaultPermissions();
      res.json({ 
        message: "Permissões padrão criadas com sucesso", 
        permissionsCreated: count 
      });
    } catch (error) {
      console.error('Error seeding permissions:', error);
      res.status(500).json({ 
        message: "Erro ao criar permissões padrão", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getModules(req: Request, res: Response) {
    try {
      const permissions = await PermissionModel.getAll();
      const modules = [...new Set(permissions.map(p => p.module))].sort();
      res.json(modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ 
        message: "Erro ao buscar módulos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}