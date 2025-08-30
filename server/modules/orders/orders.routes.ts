import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('orders'));

// Rotas dos pedidos
router.get('/', OrdersController.getOrders);
router.get('/recent', OrdersController.getRecentOrders);
router.get('/pending', OrdersController.getPendingOrders);
router.get('/:id', OrdersController.getOrder);
router.post('/', OrdersController.createOrder);
router.put('/:id', OrdersController.updateOrder);
router.delete('/:id', OrdersController.deleteOrder);

// Rotas dos itens dos pedidos
router.get('/:id/items', OrdersController.getOrderItems);
router.post('/:id/items', OrdersController.createOrderItem);

export default router;