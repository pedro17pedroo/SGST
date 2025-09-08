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

// Rotas de categorias (montadas em /api/products) - DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS
router.get('/categories', CategoryController.getCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.post('/categories', requireJWTRole(['admin', 'manager']), CategoryController.createCategory);
router.put('/categories/:id', requireJWTRole(['admin', 'manager']), CategoryController.updateCategory);
router.patch('/categories/:id/toggle-status', requireJWTRole(['admin', 'manager']), CategoryController.toggleCategoryStatus);
router.delete('/categories/:id', requireJWTRole(['admin', 'manager']), CategoryController.deleteCategory);
router.get('/categories/:id/products', CategoryController.getCategoryProducts);

// Rotas de produtos (montadas em /api/products)
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', requireJWTRole(['admin', 'manager']), ProductController.createProduct);
router.put('/:id', requireJWTRole(['admin', 'manager']), ProductController.updateProduct);
router.patch('/:id/deactivate', requireJWTRole(['admin', 'manager']), ProductController.deactivateProduct);
router.patch('/:id/activate', requireJWTRole(['admin', 'manager']), ProductController.activateProduct);
router.delete('/:id', requireJWTRole(['admin', 'manager']), ProductController.deleteProduct);

export default router;