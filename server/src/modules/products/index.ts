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
    categoryRoutes.use(moduleGuard('products'));
    categoryRoutes.use(requireHybridAuth);
    
    // Importar controladores
    const { CategoryController } = require('./category.controller');
    const { requireJWTRole } = require('../auth/jwt.middleware');
    
    // Rotas de categorias em /api/categories
    categoryRoutes.get('/', CategoryController.getCategories);
    categoryRoutes.get('/:id', CategoryController.getCategoryById);
    categoryRoutes.post('/', requireJWTRole(['admin', 'manager']), CategoryController.createCategory);
    categoryRoutes.put('/:id', requireJWTRole(['admin', 'manager']), CategoryController.updateCategory);
    categoryRoutes.delete('/:id', requireJWTRole(['admin', 'manager']), CategoryController.deleteCategory);
    categoryRoutes.get('/:id/products', CategoryController.getCategoryProducts);
    
    app.use('/api/categories', categoryRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new ProductsModule();