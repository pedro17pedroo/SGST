import { Router } from 'express';
import { UserController } from './user.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('users'));

// Rotas do módulo de utilizadores
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// RBAC Routes for User Role Management
// GET /api/users/:id/roles - Buscar perfis do utilizador
router.get('/:id/roles', UserController.getUserRoles);

// PUT /api/users/:id/roles - Definir perfis do utilizador
router.put('/:id/roles', UserController.setUserRoles);

// POST /api/users/:id/roles - Adicionar perfil ao utilizador
router.post('/:id/roles', UserController.addRoleToUser);

// DELETE /api/users/:id/roles - Remover perfil do utilizador
router.delete('/:id/roles', UserController.removeRoleFromUser);

// GET /api/users/:id/permissions - Buscar permissões do utilizador
router.get('/:id/permissions', UserController.getUserPermissions);

// GET /api/users/:id/check-permission - Verificar se utilizador tem permissão específica
router.get('/:id/check-permission', UserController.checkPermission);

export default router;