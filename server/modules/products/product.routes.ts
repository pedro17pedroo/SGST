import { Router } from 'express';
import { ProductController, CategoryController } from './product.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('products'));

// Todas as rotas requerem autenticação
router.use(requireAuth);

// Rotas de produtos
router.get('/products', ProductController.getProducts);
router.get('/products/search', ProductController.searchProducts);
router.get('/products/:id', ProductController.getProductById);
router.post('/products', requireRole(['admin', 'manager']), ProductController.createProduct);
router.put('/products/:id', requireRole(['admin', 'manager']), ProductController.updateProduct);
router.delete('/products/:id', requireRole(['admin', 'manager']), ProductController.deleteProduct);

// Rotas de categorias
router.get('/categories', CategoryController.getCategories);
router.post('/categories', requireRole(['admin', 'manager']), CategoryController.createCategory);
router.put('/categories/:id', requireRole(['admin', 'manager']), CategoryController.updateCategory);
router.delete('/categories/:id', requireRole(['admin', 'manager']), CategoryController.deleteCategory);

export default router;