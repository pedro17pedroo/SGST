import { Express } from 'express';
import { BaseModule } from '../base/module.interface';
import { MODULE_CONFIG } from '../../config/modules';
import productRoutes from './product.routes';

export class ProductsModule extends BaseModule {
  config = MODULE_CONFIG.products;

  async register(app: Express): Promise<void> {
    // Registrar rotas do módulo (as rotas já incluem /products e /categories)
    app.use('/api', productRoutes);
    
    console.log(`✓ Módulo ${this.config.name} registrado`);
  }

  async unregister(app: Express): Promise<void> {
    console.log(`✗ Módulo ${this.config.name} desregistrado`);
  }
}

export default new ProductsModule();