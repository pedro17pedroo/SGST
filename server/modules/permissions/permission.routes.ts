import { Router } from 'express';
import { PermissionController } from './permission.controller';

const router = Router();

// GET /api/permissions - Listar todas as permissões (ou filtrar por módulo)
router.get('/', PermissionController.getPermissions);

// GET /api/permissions/modules - Listar módulos disponíveis
router.get('/modules', PermissionController.getModules);

// POST /api/permissions/seed - Criar permissões padrão
router.post('/seed', PermissionController.seedPermissions);

// GET /api/permissions/:id - Buscar permissão por ID
router.get('/:id', PermissionController.getPermissionById);

// POST /api/permissions - Criar nova permissão
router.post('/', PermissionController.createPermission);

// PUT /api/permissions/:id - Atualizar permissão
router.put('/:id', PermissionController.updatePermission);

// DELETE /api/permissions/:id - Eliminar permissão
router.delete('/:id', PermissionController.deletePermission);

export default router;