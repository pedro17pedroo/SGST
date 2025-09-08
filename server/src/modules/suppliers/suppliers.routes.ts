import { Router } from 'express';
import { SuppliersController } from './suppliers.controller';
import { moduleGuard } from '../../middleware/module-guard';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('suppliers'));

// Rotas dos fornecedores
router.get('/search', SuppliersController.searchSuppliers); // Rota de pesquisa deve vir antes da rota com parâmetro
router.get('/', SuppliersController.getSuppliers);
router.get('/:id', SuppliersController.getSupplier);
router.post('/', SuppliersController.createSupplier);
router.put('/:id', SuppliersController.updateSupplier);
router.delete('/:id', SuppliersController.deleteSupplier);

export default router;