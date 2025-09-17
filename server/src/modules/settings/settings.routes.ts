import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(requireAuth);

// Rotas de configurações e módulos
router.get('/settings', requireRole(['admin']), SettingsController.getSettings);
router.get('/modules', requireRole(['admin', 'manager']), SettingsController.getModules);
router.get('/modules/:id', requireRole(['admin', 'manager']), SettingsController.getModuleById);
router.post('/modules/:id/enable', requireRole(['admin']), SettingsController.enableModule);
router.post('/modules/:id/disable', requireRole(['admin']), SettingsController.disableModule);

export default router;