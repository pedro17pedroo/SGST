import { Request, Response } from 'express';
import { InventoryModel } from './inventory.model';
import { db } from '../../../database/db';
import { stockMovements } from '@shared/schema';
import { count, desc, asc } from 'drizzle-orm';
import storage from '../../storage';

export class InventoryController {
  static async getLowStockProducts(req: Request, res: Response) {
    try {
      const products = await InventoryModel.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({ 
        message: "Erro ao buscar produtos com baixo stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getInventoryByWarehouse(req: Request, res: Response) {
    try {
      const { warehouseId } = req.params;
      const inventory = await InventoryModel.getInventoryByWarehouse(warehouseId);
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching warehouse inventory:', error);
      res.status(500).json({ 
        message: "Erro ao buscar inventário do armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getProductInventory(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const inventory = await InventoryModel.getProductInventory(productId);
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching product inventory:', error);
      res.status(500).json({ 
        message: "Erro ao buscar inventário do produto", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateInventory(req: Request, res: Response) {
    try {
      const { productId, warehouseId } = req.params;
      const { quantity } = req.body;
      
      const inventory = await InventoryModel.updateInventory(productId, warehouseId, quantity);
      res.json(inventory);
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar inventário", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAllInventory(req: Request, res: Response) {
    try {
      const inventory = await InventoryModel.getAllInventory();
      res.json(inventory);
    } catch (error) {
      console.error('Error fetching all inventory:', error);
      res.status(500).json({ 
        message: "Erro ao buscar inventário", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getInventorySummary(req: Request, res: Response) {
    try {
      const summary = await InventoryModel.getInventorySummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      res.status(500).json({ 
        message: "Erro ao buscar resumo do inventário", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getStockMovements(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;
      
      // Buscar movimentos com paginação e relações incluídas
      const movements = await storage.getStockMovements(limitNum, offset);
      
      // Buscar total de registros para paginação
      const totalMovements = await storage.getTotalStockMovements();
      const totalPages = Math.ceil(totalMovements / limitNum);
      
      res.json({
        success: true,
        message: "Movimentos de stock carregados com sucesso",
        data: movements,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalMovements,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPreviousPage: pageNum > 1
        }
      });
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      res.status(500).json({ 
        success: false,
        message: "Erro ao buscar movimentações de stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createStockMovement(req: Request, res: Response) {
    try {
      const { productId, warehouseId, type, quantity, reason, reference } = req.body;
      
      // Validação básica dos campos obrigatórios
      if (!productId || !warehouseId || !type || !quantity || !reason) {
        return res.status(400).json({ 
          success: false,
          message: "Campos obrigatórios em falta: productId, warehouseId, type, quantity, reason" 
        });
      }
      
      // Validar que a quantidade é positiva
      if (quantity <= 0) {
        return res.status(400).json({ 
          success: false,
          message: "A quantidade deve ser maior que zero" 
        });
      }
      
      // Preparar dados para inserção usando apenas os campos necessários
      const insertData: any = {
        productId,
        warehouseId,
        type: type.toLowerCase(),
        quantity,
        reason,
        userId: (req as any).user?.id || null
      };
      
      // Adicionar reference apenas se fornecido
      if (reference) {
        insertData.reference = reference;
      }

      console.log('Dados para inserção:', insertData);

      // Inserir o movimento no banco de dados
      const [insertResult] = await db.insert(stockMovements).values(insertData);
      console.log('Resultado da inserção:', insertResult);
      
      // Atualizar o inventário baseado no tipo de movimento
      await InventoryController.updateInventoryFromMovement(productId, warehouseId, type.toLowerCase(), quantity);
      
      res.status(201).json({ success: true, message: 'Movimentação criada com sucesso' });
    } catch (error) {
      console.error('Error creating stock movement:', error);
      res.status(500).json({ 
        message: "Erro ao criar movimentação de stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getWarehouseZones(req: Request, res: Response) {
    try {
      // TODO: Implementar quando as zonas de armazém forem definidas no schema
      const zones = [
        { id: '1', name: 'Zona A', description: 'Produtos de alta rotatividade', warehouseId: '1' },
        { id: '2', name: 'Zona B', description: 'Produtos de média rotatividade', warehouseId: '1' },
        { id: '3', name: 'Zona C', description: 'Produtos de baixa rotatividade', warehouseId: '1' }
      ];
      res.json(zones);
    } catch (error) {
      console.error('Error fetching warehouse zones:', error);
      res.status(500).json({ 
        message: "Erro ao buscar zonas do armazém", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getStockAlerts(req: Request, res: Response) {
    try {
      // Obter produtos com baixo stock para gerar alertas
      const lowStockProducts = await InventoryModel.getLowStockProducts();
      
      // Transformar em formato de alertas
      const alerts = lowStockProducts.map((product: any) => ({
        id: `alert-${product.id}`,
        type: 'low_stock',
        priority: product.stock <= 0 ? 'critical' : product.stock <= product.minStockLevel * 0.5 ? 'high' : 'medium',
        title: `Stock baixo: ${product.name}`,
        message: `Produto ${product.name} (${product.sku}) tem apenas ${product.stock} unidades em stock. Nível mínimo: ${product.minStockLevel}`,
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        minStockLevel: product.minStockLevel,
        createdAt: new Date().toISOString()
      }));
      
      res.json({
        success: true,
        data: alerts,
        total: alerts.length
      });
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      res.status(500).json({ 
        message: "Erro ao buscar alertas de stock", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Atualiza o inventário baseado no tipo de movimento
   */
  private static async updateInventoryFromMovement(
    productId: string, 
    warehouseId: string, 
    type: string, 
    quantity: number
  ): Promise<void> {
    try {
      // Obter o inventário atual
      const currentInventory = await InventoryModel.getProductInventory(productId);
      const warehouseInventory = currentInventory.find(inv => inv.warehouseId === warehouseId);
      
      let newQuantity = 0;
      
      if (warehouseInventory) {
        // Calcular nova quantidade baseada no tipo de movimento
        switch (type) {
          case 'in':
          case 'entrada':
            newQuantity = warehouseInventory.quantity + quantity;
            break;
          case 'out':
          case 'saida':
            newQuantity = Math.max(0, warehouseInventory.quantity - quantity);
            break;
          case 'adjustment':
          case 'ajuste':
            newQuantity = quantity; // Para ajustes, a quantidade é absoluta
            break;
          default:
            throw new Error(`Tipo de movimento inválido: ${type}`);
        }
      } else {
        // Se não existe inventário para este produto/armazém
        if (type === 'in' || type === 'entrada') {
          newQuantity = quantity;
        } else if (type === 'adjustment' || type === 'ajuste') {
          newQuantity = quantity;
        } else {
          // Para saídas, não podemos ter estoque negativo
          newQuantity = 0;
        }
      }
      
      // Atualizar o inventário
      await InventoryModel.updateInventory(productId, warehouseId, newQuantity);
      
      console.log(`Inventário atualizado: Produto ${productId}, Armazém ${warehouseId}, Nova quantidade: ${newQuantity}`);
    } catch (error) {
      console.error('Erro ao atualizar inventário:', error);
      throw error;
    }
  }
}