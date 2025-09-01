import { Router } from 'express';
import { CustomerController } from './customers.controller';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(requireAuth);

// Rotas de consulta - disponível para todos os utilizadores autenticados
router.get('/', CustomerController.getCustomers);
router.get('/search', CustomerController.searchCustomers);
router.get('/active', CustomerController.getActiveCustomers);
router.get('/stats', requireRole(['admin', 'manager']), CustomerController.getCustomerStats);
router.get('/top', requireRole(['admin', 'manager']), CustomerController.getTopCustomers);
router.get('/:id', CustomerController.getCustomer);

// Rotas de criação e edição - requerem permissões específicas
router.post('/', requireRole(['admin', 'manager', 'operator']), CustomerController.createCustomer);
router.put('/:id', requireRole(['admin', 'manager']), CustomerController.updateCustomer);

// Rotas de ativação/desativação - só administradores e gestores
router.put('/:id/deactivate', requireRole(['admin', 'manager']), CustomerController.deactivateCustomer);
router.put('/:id/activate', requireRole(['admin', 'manager']), CustomerController.activateCustomer);

// Rota de exclusão - só administradores
router.delete('/:id', requireRole(['admin']), CustomerController.deleteCustomer);

export default router;