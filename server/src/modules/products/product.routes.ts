import { Router } from 'express';
import { ProductController } from './product.controller';
import { CategoryController } from './category.controller';
import { moduleGuard } from '../../middleware/module-guard';
import { requireAuth, requireRole } from '../auth/auth.middleware';
import { requireHybridAuth, requireJWTRole } from '../auth/jwt.middleware';

const router = Router();

// Middleware de autenticação híbrida será aplicado individualmente às rotas que precisam

// Rotas de categorias (montadas em /api/products) - DEVEM VIR ANTES DAS ROTAS COM PARÂMETROS
// IMPORTANTE: Rotas específicas devem vir antes das rotas parametrizadas
router.get('/categories/search', CategoryController.searchCategories); // Rota de pesquisa pública
router.get('/categories', requireHybridAuth, CategoryController.getCategories);
router.get('/categories/:id', requireHybridAuth, CategoryController.getCategoryById);
router.post('/categories', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.createCategory);
router.put('/categories/:id', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.updateCategory);
router.patch('/categories/:id/toggle-status', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.toggleCategoryStatus);
router.delete('/categories/:id', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.deleteCategory);
router.get('/categories/:id/products', requireHybridAuth, CategoryController.getCategoryProducts);

// Rotas de produtos (montadas em /api/products)
router.get('/', requireHybridAuth, ProductController.getProducts);
router.get('/search', ProductController.searchProducts); // Rota de pesquisa pública
router.get('/:id', requireHybridAuth, ProductController.getProductById);
router.post('/', requireHybridAuth, requireJWTRole(['admin', 'manager']), ProductController.createProduct);
router.put('/:id', requireHybridAuth, requireJWTRole(['admin', 'manager']), ProductController.updateProduct);
router.patch('/:id/deactivate', requireHybridAuth, requireJWTRole(['admin', 'manager']), ProductController.deactivateProduct);
router.patch('/:id/activate', requireHybridAuth, requireJWTRole(['admin', 'manager']), ProductController.activateProduct);
router.delete('/:id', requireHybridAuth, requireJWTRole(['admin', 'manager']), ProductController.deleteProduct);

export default router;