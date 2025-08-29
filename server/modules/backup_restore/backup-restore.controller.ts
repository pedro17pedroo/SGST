import { Request, Response } from 'express';
import { BackupRestoreModel } from './backup-restore.model.js';
import { z } from 'zod';

const backupSchema = z.object({
  name: z.string().min(1, "Nome do backup é obrigatório"),
  description: z.string().optional(),
  includeFiles: z.boolean().default(true),
  includeDatabase: z.boolean().default(true),
  compression: z.enum(["none", "gzip", "bzip2"]).default("gzip")
});

const scheduleSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["hourly", "daily", "weekly", "monthly"]),
  time: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  retention: z.number().int().min(1).default(30)
});

export class BackupRestoreController {
  static async createBackup(req: Request, res: Response) {
    try {
      const validated = backupSchema.parse(req.body);
      
      const backup = await BackupRestoreModel.createBackup({
        ...validated,
        createdByUserId: (req as any).user?.id || 'anonymous-user',
        status: 'pending',
        createdAt: new Date()
      });
      
      res.status(201).json({
        message: "Backup iniciado com sucesso",
        backup
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar backup",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async listBackups(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      
      const backups = await BackupRestoreModel.listBackups({
        page,
        limit,
        status
      });
      
      res.json(backups);
    } catch (error) {
      console.error('Error listing backups:', error);
      res.status(500).json({
        message: "Erro ao listar backups",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async downloadBackup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const backup = await BackupRestoreModel.getBackupById(id);
      if (!backup) {
        return res.status(404).json({ message: "Backup não encontrado" });
      }

      const filePath = await BackupRestoreModel.getBackupFilePath(id);
      
      res.download(filePath, backup.filename, (err) => {
        if (err) {
          console.error('Error downloading backup:', err);
          res.status(500).json({
            message: "Erro ao fazer download do backup"
          });
        }
      });
    } catch (error) {
      console.error('Error downloading backup:', error);
      res.status(500).json({
        message: "Erro ao fazer download do backup",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteBackup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await BackupRestoreModel.deleteBackup(id);
      
      if (!result.success) {
        return res.status(404).json({ message: "Backup não encontrado" });
      }
      
      res.json({ message: "Backup eliminado com sucesso" });
    } catch (error) {
      console.error('Error deleting backup:', error);
      res.status(500).json({
        message: "Erro ao eliminar backup",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async restoreBackup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const restore = await BackupRestoreModel.restoreBackup(id, {
        restoredByUserId: (req as any).user?.id || 'anonymous-user',
        startedAt: new Date()
      });
      
      res.json({
        message: "Restore iniciado com sucesso",
        restore
      });
    } catch (error) {
      console.error('Error restoring backup:', error);
      res.status(500).json({
        message: "Erro ao restaurar backup",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRestoreStatus(req: Request, res: Response) {
    try {
      const status = await BackupRestoreModel.getRestoreStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting restore status:', error);
      res.status(500).json({
        message: "Erro ao buscar estado do restore",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getBackupSchedule(req: Request, res: Response) {
    try {
      const schedule = await BackupRestoreModel.getBackupSchedule();
      res.json(schedule);
    } catch (error) {
      console.error('Error getting backup schedule:', error);
      res.status(500).json({
        message: "Erro ao buscar agendamento de backup",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateBackupSchedule(req: Request, res: Response) {
    try {
      const validated = scheduleSchema.parse(req.body);
      
      const schedule = await BackupRestoreModel.updateBackupSchedule({
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: (req as any).user?.id || 'anonymous-user'
      });
      
      res.json({
        message: "Agendamento de backup atualizado com sucesso",
        schedule
      });
    } catch (error) {
      console.error('Error updating backup schedule:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar agendamento de backup",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
}