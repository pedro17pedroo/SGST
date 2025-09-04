import { Router } from 'express';
import { ProductController } from './product.controller';
import { CategoryController } from './category.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { requireHybridAuth, requireJWTRole } from '../auth/jwt.middleware';

const router = Router();

// Aplicar middleware de proteção do módulo
router.use(moduleGuard('products'));

// Middleware de autenticação híbrida para todas as rotas (sessão ou JWT)
router.use(requireHybridAuth);

// Rotas de produtos
router.get('/products', ProductController.getProducts);
router.get('/products/search', ProductController.searchProducts);
router.get('/products/:id', ProductController.getProductById);
router.post('/products', requireJWTRole(['admin', 'manager']), ProductController.createProduct);
router.put('/products/:id', requireJWTRole(['admin', 'manager']), ProductController.updateProduct);
router.patch('/products/:id/deactivate', requireJWTRole(['admin', 'manager']), ProductController.deactivateProduct);
router.patch('/products/:id/activate', requireJWTRole(['admin', 'manager']), ProductController.activateProduct);
router.delete('/products/:id', requireJWTRole(['admin', 'manager']), ProductController.deleteProduct);

// Rotas de categorias
router.get('/categories', CategoryController.getCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.post('/categories', requireJWTRole(['admin', 'manager']), CategoryController.createCategory);
router.put('/categories/:id', requireJWTRole(['admin', 'manager']), CategoryController.updateCategory);
router.delete('/categories/:id', requireJWTRole(['admin', 'manager']), CategoryController.deleteCategory);
router.get('/categories/:id/products', CategoryController.getCategoryProducts);

export default router;