import { Router } from 'express';
import { RoleController } from './role.controller';

const router = Router();

// GET /api/roles - Listar todos os perfis
router.get('/', RoleController.getRoles);

// GET /api/roles/:id - Buscar perfil por ID
router.get('/:id', RoleController.getRoleById);

// POST /api/roles - Criar novo perfil
router.post('/', RoleController.createRole);

// PUT /api/roles/:id - Atualizar perfil
router.put('/:id', RoleController.updateRole);

// DELETE /api/roles/:id - Eliminar perfil
router.delete('/:id', RoleController.deleteRole);

// GET /api/roles/:id/permissions - Buscar permissões do perfil
router.get('/:id/permissions', RoleController.getRolePermissions);

// PUT /api/roles/:id/permissions - Definir permissões do perfil
router.put('/:id/permissions', RoleController.setRolePermissions);

// POST /api/roles/:id/permissions - Adicionar permissão ao perfil
router.post('/:id/permissions', RoleController.addPermissionToRole);

// DELETE /api/roles/:id/permissions - Remover permissão do perfil
router.delete('/:id/permissions', RoleController.removePermissionFromRole);

// GET /api/roles/:id/users - Buscar utilizadores com este perfil
router.get('/:id/users', RoleController.getUsersWithRole);

export default router;