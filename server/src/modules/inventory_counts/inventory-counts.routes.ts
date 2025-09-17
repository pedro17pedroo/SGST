import { Router } from 'express';
import { InventoryCountsController } from './inventory-counts.controller';
import { requireAuth } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(requireAuth);

// Rota de teste simples
router.get('/test', (req, res) => {
  console.log('🧪 === ROTA DE TESTE INVENTORY COUNTS CHAMADA ===');
  res.json({ message: 'Inventory counts test route working!', timestamp: new Date().toISOString() });
});

// Inventory counts endpoints
router.get('/', InventoryCountsController.getInventoryCounts);
router.get('/:id', InventoryCountsController.getInventoryCount);
router.post('/', InventoryCountsController.createInventoryCount);
router.patch('/:id', InventoryCountsController.updateInventoryCount);
router.delete('/:id', InventoryCountsController.deleteInventoryCount);

// Inventory count items
router.get('/:countId/items', InventoryCountsController.getInventoryCountItems);
router.post('/:countId/items', InventoryCountsController.createInventoryCountItem);
router.patch('/items/:id', InventoryCountsController.updateInventoryCountItem);

// Reconciliation
router.post('/:id/reconcile', InventoryCountsController.reconcileInventoryCount);
router.post('/:id/complete', InventoryCountsController.completeInventoryCount);

// Generate count lists
router.post('/:id/generate-list', InventoryCountsController.generateCountList);

export { router as inventoryCountsRoutes };