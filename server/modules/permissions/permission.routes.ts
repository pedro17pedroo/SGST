import { Router } from 'express';
import { PermissionController } from './permission.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole, requireAdmin } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('permissions'));

// Todas as rotas de permissões requerem autenticação
router.use(requireAuth);

// GET /api/permissions - Listar todas as permissões (admin e manager)
router.get('/', requireRole(['admin', 'manager']), PermissionController.getPermissions);

// GET /api/permissions/modules - Listar módulos disponíveis (admin e manager)
router.get('/modules', requireRole(['admin', 'manager']), PermissionController.getModules);

// POST /api/permissions/seed - Criar permissões padrão (apenas admin)
router.post('/seed', requireAdmin, PermissionController.seedPermissions);

// GET /api/permissions/:id - Buscar permissão por ID (admin e manager)
router.get('/:id', requireRole(['admin', 'manager']), PermissionController.getPermissionById);

// POST /api/permissions - Criar nova permissão (apenas admin)
router.post('/', requireAdmin, PermissionController.createPermission);

// PUT /api/permissions/:id - Atualizar permissão (apenas admin)
router.put('/:id', requireAdmin, PermissionController.updatePermission);

// DELETE /api/permissions/:id - Eliminar permissão (apenas admin)
router.delete('/:id', requireAdmin, PermissionController.deletePermission);

export default router;