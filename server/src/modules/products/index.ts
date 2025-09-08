import { Express, Router } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import productRoutes from './product.routes';
import { moduleGuard } from '../../middleware/module-guard';
import { requireHybridAuth } from '../auth/jwt.middleware';

export class ProductsModule extends BaseModule {
  config = MODULE_CONFIG.products;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo em /api/products para evitar conflitos globais
    app.use('/api/products', productRoutes);
    
    // Registrar rotas de categorias também em /api/categories para compatibilidade com frontend
    const categoryRoutes = Router();
    
    // Importar controladores
    const { CategoryController } = require('./category.controller');
    const { requireJWTRole } = require('../auth/jwt.middleware');
    
    // Rotas de categorias em /api/categories
    // Rota de pesquisa pública
    categoryRoutes.get('/search', CategoryController.searchCategories);
    
    // Rotas que precisam de autenticação
    categoryRoutes.get('/', requireHybridAuth, CategoryController.getCategories);
    categoryRoutes.get('/:id', requireHybridAuth, CategoryController.getCategoryById);
    categoryRoutes.post('/', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.createCategory);
    categoryRoutes.put('/:id', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.updateCategory);
    categoryRoutes.patch('/:id/toggle-status', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.toggleCategoryStatus);
    categoryRoutes.delete('/:id', requireHybridAuth, requireJWTRole(['admin', 'manager']), CategoryController.deleteCategory);
    categoryRoutes.get('/:id/products', requireHybridAuth, CategoryController.getCategoryProducts);
    
    app.use('/api/categories', categoryRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new ProductsModule();