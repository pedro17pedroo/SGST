import { Router } from 'express';
import { UserController } from './user.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole, requireAdmin } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('users'));

// Todas as rotas de utilizadores requerem autenticação
router.use(requireAuth);

// Rotas do módulo de utilizadores - requerem perfil admin ou manager
router.get('/', requireRole(['admin', 'manager']), UserController.getUsers);
router.get('/:id', requireRole(['admin', 'manager']), UserController.getUserById);
router.post('/', requireAdmin, UserController.createUser);
router.put('/:id', requireAdmin, UserController.updateUser);
router.delete('/:id', requireAdmin, UserController.deleteUser);

// RBAC Routes for User Role Management - requerem permissões administrativas
// GET /api/users/:id/roles - Buscar perfis do utilizador
router.get('/:id/roles', requireRole(['admin', 'manager']), UserController.getUserRoles);

// PUT /api/users/:id/roles - Definir perfis do utilizador
router.put('/:id/roles', requireAdmin, UserController.setUserRoles);

// POST /api/users/:id/roles - Adicionar perfil ao utilizador
router.post('/:id/roles', requireAdmin, UserController.addRoleToUser);

// DELETE /api/users/:id/roles - Remover perfil do utilizador
router.delete('/:id/roles', requireAdmin, UserController.removeRoleFromUser);

// GET /api/users/:id/permissions - Buscar permissões do utilizador
router.get('/:id/permissions', requireRole(['admin', 'manager']), UserController.getUserPermissions);

// GET /api/users/:id/check-permission - Verificar se utilizador tem permissão específica
router.get('/:id/check-permission', requireRole(['admin', 'manager']), UserController.checkPermission);

export default router;