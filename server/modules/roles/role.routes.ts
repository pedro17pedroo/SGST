import { Router } from 'express';
import { RoleController } from './role.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole, requireAdmin } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('roles'));

// Todas as rotas de perfis requerem autenticação
router.use(requireAuth);

// GET /api/roles - Listar todos os perfis (admin e manager)
router.get('/', requireRole(['admin', 'manager']), RoleController.getRoles);

// GET /api/roles/:id - Buscar perfil por ID (admin e manager)
router.get('/:id', requireRole(['admin', 'manager']), RoleController.getRoleById);

// POST /api/roles - Criar novo perfil (apenas admin)
router.post('/', requireAdmin, RoleController.createRole);

// PUT /api/roles/:id - Atualizar perfil (apenas admin)
router.put('/:id', requireAdmin, RoleController.updateRole);

// DELETE /api/roles/:id - Eliminar perfil (apenas admin)
router.delete('/:id', requireAdmin, RoleController.deleteRole);

// GET /api/roles/:id/permissions - Buscar permissões do perfil (admin e manager)
router.get('/:id/permissions', requireRole(['admin', 'manager']), RoleController.getRolePermissions);

// PUT /api/roles/:id/permissions - Definir permissões do perfil (apenas admin)
router.put('/:id/permissions', requireAdmin, RoleController.setRolePermissions);

// POST /api/roles/:id/permissions - Adicionar permissão ao perfil (apenas admin)
router.post('/:id/permissions', requireAdmin, RoleController.addPermissionToRole);

// DELETE /api/roles/:id/permissions - Remover permissão do perfil (apenas admin)
router.delete('/:id/permissions', requireAdmin, RoleController.removePermissionFromRole);

// GET /api/roles/:id/users - Buscar utilizadores com este perfil (admin e manager)
router.get('/:id/users', requireRole(['admin', 'manager']), RoleController.getUsersWithRole);

export default router;