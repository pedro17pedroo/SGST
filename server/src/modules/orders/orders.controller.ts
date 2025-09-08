import { Request, Response } from 'express';
import { OrdersModel } from './orders.model';
import { BaseController } from '../base/base.controller';
import { z } from 'zod';

// Schema de validação para criação de pedido
const createOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Número do pedido é obrigatório'),
  type: z.enum(['purchase', 'sale'], { required_error: 'Tipo do pedido é obrigatório' }),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).default('pending'),
  customerId: z.string().optional(),
  customerName: z.string().min(1, 'Nome do cliente é obrigatório'),
  customerEmail: z.string().email('Email inválido').optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  supplierId: z.string().optional(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor total deve ser um número válido'),
  notes: z.string().optional(),
  userId: z.string().min(1, 'ID do usuário é obrigatório')
});

// Schema de validação para atualização de pedido
const updateOrderSchema = createOrderSchema.partial();

export class OrdersController extends BaseController {
  static async getOrders(req: Request, res: Response) {
    const controller = new OrdersController();
    try {
      const { page, limit } = controller.validatePagination(req);
      const { search, status, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      // Para manter compatibilidade, vamos buscar todos e implementar paginação simples
      const allOrders = await OrdersModel.getOrders();
      
      // Filtrar por busca se fornecida
       let filteredOrders = allOrders;
       if (search && typeof search === 'string') {
         const searchLower = search.toLowerCase();
         filteredOrders = allOrders.filter(order => 
           order.orderNumber.toLowerCase().includes(searchLower) ||
           (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
           (order.customerEmail && order.customerEmail.toLowerCase().includes(searchLower))
         );
       }
      
      // Filtrar por status
      if (status && typeof status === 'string') {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }
      
      // Filtrar por tipo
      if (type && typeof type === 'string') {
        filteredOrders = filteredOrders.filter(order => order.type === type);
      }
      
      // Ordenar
      filteredOrders.sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a] || '';
        const bValue = b[sortBy as keyof typeof b] || '';
        const comparison = aValue.toString().localeCompare(bValue.toString());
        return sortOrder === 'desc' ? -comparison : comparison;
      });
      
      // Paginação
      const total = filteredOrders.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);
      
      return controller.sendSuccessWithPagination(
        res,
        paginatedOrders,
        { page, limit, total, totalPages },
        'Pedidos carregados com sucesso'
      );
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar pedidos');
    }
  }

  static async getOrder(req: Request, res: Response) {
    const controller = new OrdersController();
    try {
      const id = controller.validateId(req);
      const order = await OrdersModel.getOrder(id);
      
      controller.ensureResourceExists(order, 'Pedido');
      
      return controller.sendSuccess(res, order, 'Pedido encontrado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao buscar pedido');
    }
  }

  static async createOrder(req: Request, res: Response) {
    const controller = new OrdersController();
    try {
      const validatedData = controller.validateBody(req, createOrderSchema);
      const order = await OrdersModel.createOrder(validatedData);
      
      return controller.sendSuccess(res, order, 'Pedido criado com sucesso', 201);
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao criar pedido');
    }
  }

  static async updateOrder(req: Request, res: Response) {
    const controller = new OrdersController();
    try {
      const id = controller.validateId(req);
      const validatedData = controller.validateBody(req, updateOrderSchema);
      
      // Verificar se o pedido existe antes de atualizar
      const existingOrder = await OrdersModel.getOrder(id);
      controller.ensureResourceExists(existingOrder, 'Pedido');
      
      const order = await OrdersModel.updateOrder(id, validatedData);
      
      return controller.sendSuccess(res, order, 'Pedido atualizado com sucesso');
    } catch (error) {
      return controller.handleError(res, error, 'Erro ao atualizar pedido');
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await OrdersModel.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar pedido", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrderItems(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const items = await OrdersModel.getOrderItems(id);
      res.json(items);
    } catch (error) {
      console.error('Error fetching order items:', error);
      res.status(500).json({ 
        message: "Erro ao buscar itens do pedido", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createOrderItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const itemData = { ...req.body, orderId: id };
      const item = await OrdersModel.createOrderItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error('Error creating order item:', error);
      res.status(500).json({ 
        message: "Erro ao criar item do pedido", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getRecentOrders(req: Request, res: Response) {
    try {
      const orders = await OrdersModel.getRecentOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      res.status(500).json({ 
        message: "Erro ao buscar pedidos recentes", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getPendingOrders(req: Request, res: Response) {
    try {
      const orders = await OrdersModel.getPendingOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      res.status(500).json({ 
        message: "Erro ao buscar pedidos pendentes", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}