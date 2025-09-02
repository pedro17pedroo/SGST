import { Router } from 'express';
import { BackupRestoreController } from './backup-restore.controller.js';

const router = Router();

// Backup routes
router.post('/backup/create', BackupRestoreController.createBackup);
router.get('/backup/list', BackupRestoreController.listBackups);
router.get('/backup/:id/download', BackupRestoreController.downloadBackup);
router.delete('/backup/:id', BackupRestoreController.deleteBackup);

// Restore routes
router.post('/restore/:id', BackupRestoreController.restoreBackup);
router.get('/restore/status', BackupRestoreController.getRestoreStatus);

// Scheduled backup management
router.get('/backup/schedule', BackupRestoreController.getBackupSchedule);
router.post('/backup/schedule', BackupRestoreController.updateBackupSchedule);

export { router as backupRestoreRoutes };