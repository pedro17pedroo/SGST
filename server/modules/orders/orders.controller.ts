import { Request, Response } from 'express';
import { OrdersModel } from './orders.model';

export class OrdersController {
  static async getOrders(req: Request, res: Response) {
    try {
      const orders = await OrdersModel.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ 
        message: "Erro ao buscar pedidos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrdersModel.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ 
        message: "Erro ao buscar pedido", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createOrder(req: Request, res: Response) {
    try {
      const order = await OrdersModel.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        message: "Erro ao criar pedido", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await OrdersModel.updateOrder(id, req.body);
      res.json(order);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar pedido", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
}