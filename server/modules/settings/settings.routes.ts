import { Router } from 'express';
import { SettingsController } from './settings.controller';

const router = Router();

// Rotas sempre ativas (não protegidas por moduleGuard)
router.get('/settings', SettingsController.getSettings);
router.get('/modules', SettingsController.getModules);
router.get('/modules/:id', SettingsController.getModuleById);
router.post('/modules/:id/enable', SettingsController.enableModule);
router.post('/modules/:id/disable', SettingsController.disableModule);

export default router;