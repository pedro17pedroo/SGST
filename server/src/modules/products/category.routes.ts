import { Router } from 'express';
import { CategoryController } from './category.controller';

const router = Router();

// Rotas de categorias
router.get('/categories', CategoryController.getCategories);
router.get('/categories/:id', CategoryController.getCategoryById);
router.post('/categories', CategoryController.createCategory);
router.put('/categories/:id', CategoryController.updateCategory);
router.patch('/categories/:id/toggle-status', CategoryController.toggleCategoryStatus);
router.delete('/categories/:id', CategoryController.deleteCategory);
router.get('/categories/:id/products', CategoryController.getCategoryProducts);

export default router;