import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('orders'));

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Rotas dos pedidos
router.get('/', OrdersController.getOrders);
router.get('/recent', OrdersController.getRecentOrders);
router.get('/pending', OrdersController.getPendingOrders);
router.get('/:id', OrdersController.getOrder);
router.post('/', requireRole(['admin', 'manager', 'operator']), OrdersController.createOrder);
router.put('/:id', requireRole(['admin', 'manager']), OrdersController.updateOrder);
router.delete('/:id', requireRole(['admin', 'manager']), OrdersController.deleteOrder);

// Rotas dos itens dos pedidos
router.get('/:id/items', OrdersController.getOrderItems);
router.post('/:id/items', requireRole(['admin', 'manager', 'operator']), OrdersController.createOrderItem);

export default router;