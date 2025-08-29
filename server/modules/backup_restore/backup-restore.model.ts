import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface Backup {
  id: string;
  name: string;
  description?: string;
  filename: string;
  filePath: string;
  fileSize: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  includeFiles: boolean;
  includeDatabase: boolean;
  compression: 'none' | 'gzip' | 'bzip2';
  createdAt: Date;
  completedAt?: Date;
  createdByUserId: string;
  error?: string;
}

interface BackupSchedule {
  id: string;
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  retention: number;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
  updatedByUserId: string;
}

interface RestoreOperation {
  id: string;
  backupId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  restoredByUserId: string;
  error?: string;
}

export class BackupRestoreModel {
  private static backupDir = path.join(process.cwd(), 'backups');
  private static backups: Map<string, Backup> = new Map();
  private static schedule: BackupSchedule | null = null;
  private static restoreOperations: Map<string, RestoreOperation> = new Map();

  static async createBackup(data: Omit<Backup, 'id' | 'filename' | 'filePath' | 'fileSize' | 'completedAt' | 'error'>): Promise<Backup> {
    const id = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sgst_backup_${timestamp}.tar.gz`;
    const filePath = path.join(this.backupDir, filename);

    // Ensure backup directory exists
    await fs.mkdir(this.backupDir, { recursive: true });

    const backup: Backup = {
      id,
      filename,
      filePath,
      fileSize: 0,
      ...data
    };

    this.backups.set(id, backup);

    // Start backup process asynchronously
    this.performBackup(backup).catch(error => {
      console.error('Backup failed:', error);
      backup.status = 'failed';
      backup.error = error.message;
    });

    return backup;
  }

  private static async performBackup(backup: Backup): Promise<void> {
    try {
      backup.status = 'in_progress';

      const tempDir = path.join(this.backupDir, `temp_${backup.id}`);
      await fs.mkdir(tempDir, { recursive: true });

      // Backup database
      if (backup.includeDatabase) {
        const dbBackupPath = path.join(tempDir, 'database.sql');
        await this.backupDatabase(dbBackupPath);
      }

      // Backup files
      if (backup.includeFiles) {
        const filesBackupPath = path.join(tempDir, 'files');
        await this.backupFiles(filesBackupPath);
      }

      // Create compressed archive
      const compressionFlag = backup.compression === 'gzip' ? 'z' : backup.compression === 'bzip2' ? 'j' : '';
      await execAsync(`tar -c${compressionFlag}f "${backup.filePath}" -C "${tempDir}" .`);

      // Get file size
      const stats = await fs.stat(backup.filePath);
      backup.fileSize = stats.size;

      // Cleanup temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      backup.status = 'completed';
      backup.completedAt = new Date();
    } catch (error) {
      backup.status = 'failed';
      backup.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private static async backupDatabase(outputPath: string): Promise<void> {
    // For development, create a mock database backup
    const mockData = {
      timestamp: new Date().toISOString(),
      tables: ['users', 'products', 'inventory', 'orders', 'shipments'],
      note: 'This is a mock database backup for development'
    };
    await fs.writeFile(outputPath, JSON.stringify(mockData, null, 2));
  }

  private static async backupFiles(outputPath: string): Promise<void> {
    await fs.mkdir(outputPath, { recursive: true });
    
    // Copy important application files
    const filesToBackup = [
      'package.json',
      'server',
      'client/src',
      'shared',
      'attached_assets'
    ];

    for (const file of filesToBackup) {
      const sourcePath = path.join(process.cwd(), file);
      const targetPath = path.join(outputPath, file);

      try {
        await fs.access(sourcePath);
        await execAsync(`cp -r "${sourcePath}" "${targetPath}"`);
      } catch (error) {
        // File doesn't exist, skip it
        console.log(`Skipping ${file} - not found`);
      }
    }
  }

  static async listBackups(options: { page: number; limit: number; status?: string }): Promise<{ backups: Backup[]; total: number; page: number; totalPages: number }> {
    const allBackups = Array.from(this.backups.values());
    
    let filteredBackups = allBackups;
    if (options.status) {
      filteredBackups = allBackups.filter(backup => backup.status === options.status);
    }

    // Sort by creation date (newest first)
    filteredBackups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filteredBackups.length;
    const totalPages = Math.ceil(total / options.limit);
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const backups = filteredBackups.slice(startIndex, endIndex);

    return {
      backups,
      total,
      page: options.page,
      totalPages
    };
  }

  static async getBackupById(id: string): Promise<Backup | undefined> {
    return this.backups.get(id);
  }

  static async getBackupFilePath(id: string): Promise<string> {
    const backup = this.backups.get(id);
    if (!backup) {
      throw new Error('Backup não encontrado');
    }
    if (backup.status !== 'completed') {
      throw new Error('Backup ainda não está concluído');
    }
    return backup.filePath;
  }

  static async deleteBackup(id: string): Promise<{ success: boolean }> {
    const backup = this.backups.get(id);
    if (!backup) {
      return { success: false };
    }

    try {
      // Delete backup file
      await fs.unlink(backup.filePath);
    } catch (error) {
      // File might not exist, continue with deletion from memory
      console.warn('Could not delete backup file:', error);
    }

    // Remove from memory
    this.backups.delete(id);
    return { success: true };
  }

  static async restoreBackup(backupId: string, options: { restoredByUserId: string; startedAt: Date }): Promise<RestoreOperation> {
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error('Backup não encontrado');
    }
    if (backup.status !== 'completed') {
      throw new Error('Backup não está completo');
    }

    const restoreId = `restore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const restore: RestoreOperation = {
      id: restoreId,
      backupId,
      status: 'pending',
      ...options
    };

    this.restoreOperations.set(restoreId, restore);

    // Start restore process asynchronously
    this.performRestore(restore, backup).catch(error => {
      console.error('Restore failed:', error);
      restore.status = 'failed';
      restore.error = error.message;
    });

    return restore;
  }

  private static async performRestore(restore: RestoreOperation, backup: Backup): Promise<void> {
    try {
      restore.status = 'in_progress';

      const tempDir = path.join(this.backupDir, `restore_${restore.id}`);
      await fs.mkdir(tempDir, { recursive: true });

      // Extract backup
      const compressionFlag = backup.compression === 'gzip' ? 'z' : backup.compression === 'bzip2' ? 'j' : '';
      await execAsync(`tar -x${compressionFlag}f "${backup.filePath}" -C "${tempDir}"`);

      // Restore database
      if (backup.includeDatabase) {
        const dbBackupPath = path.join(tempDir, 'database.sql');
        await this.restoreDatabase(dbBackupPath);
      }

      // Restore files
      if (backup.includeFiles) {
        const filesBackupPath = path.join(tempDir, 'files');
        await this.restoreFiles(filesBackupPath);
      }

      // Cleanup temp directory
      await fs.rm(tempDir, { recursive: true, force: true });

      restore.status = 'completed';
      restore.completedAt = new Date();
    } catch (error) {
      restore.status = 'failed';
      restore.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  private static async restoreDatabase(backupPath: string): Promise<void> {
    // For development, just log that we would restore the database
    console.log('Mock database restore from:', backupPath);
    // In production, this would execute the SQL backup file
  }

  private static async restoreFiles(backupPath: string): Promise<void> {
    // For development, just log that we would restore files
    console.log('Mock files restore from:', backupPath);
    // In production, this would copy files back to their original locations
  }

  static async getRestoreStatus(): Promise<RestoreOperation[]> {
    return Array.from(this.restoreOperations.values());
  }

  static async getBackupSchedule(): Promise<BackupSchedule | null> {
    return this.schedule;
  }

  static async updateBackupSchedule(data: Omit<BackupSchedule, 'id' | 'createdAt' | 'lastRun' | 'nextRun'>): Promise<BackupSchedule> {
    const now = new Date();
    
    if (this.schedule) {
      this.schedule = {
        ...this.schedule,
        ...data,
        updatedAt: now
      };
    } else {
      this.schedule = {
        id: `schedule_${Date.now()}`,
        createdAt: now,
        lastRun: undefined,
        nextRun: this.calculateNextRun(data),
        ...data
      };
    }

    return this.schedule;
  }

  private static calculateNextRun(schedule: Pick<BackupSchedule, 'frequency' | 'time' | 'dayOfWeek' | 'dayOfMonth'>): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (schedule.frequency) {
      case 'hourly':
        nextRun.setHours(nextRun.getHours() + 1);
        break;
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        break;
      case 'weekly':
        const daysUntilTarget = ((schedule.dayOfWeek || 0) + 7 - nextRun.getDay()) % 7 || 7;
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        if (schedule.dayOfMonth) {
          nextRun.setDate(schedule.dayOfMonth);
        }
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          nextRun.setHours(hours, minutes, 0, 0);
        }
        break;
    }

    return nextRun;
  }
}