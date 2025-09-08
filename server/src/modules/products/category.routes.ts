import { Router } from 'express';
import { CategoryController } from './category.controller';

const router = Router();

// Rotas de categorias
router.get('/search', CategoryController.searchCategories);
router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.patch('/:id/toggle-status', CategoryController.toggleCategoryStatus);
router.delete('/:id', CategoryController.deleteCategory);
router.get('/:id/products', CategoryController.getCategoryProducts);

export default router;