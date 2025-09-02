import { Express } from 'express';
import { backupRestoreRoutes } from './backup-restore.routes.js';

export class BackupRestoreModule {
  static id = 'backup_restore';
  static moduleName = 'Sistema de Backup e Restore';

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo
    app.use('/api', backupRestoreRoutes);
  }
}

export async function initializeBackupRestoreModule(app: Express): Promise<void> {
  const module = new BackupRestoreModule();
  await module.register(app);
}