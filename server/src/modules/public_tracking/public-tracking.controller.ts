import { Request, Response } from 'express';
import { PublicTrackingModel } from './public-tracking.model';

export class PublicTrackingController {
  static async trackShipment(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      
      if (!trackingNumber) {
        return res.status(400).json({ message: "Número de rastreamento é obrigatório" });
      }

      const shipment = await PublicTrackingModel.trackShipment(trackingNumber);
      
      if (!shipment) {
        return res.status(404).json({ 
          message: "Número de rastreamento não encontrado",
          trackingNumber 
        });
      }

      // Remove sensitive information for public tracking
      const publicData = {
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        status: shipment.status,
        estimatedDelivery: shipment.estimatedDelivery,
        actualDelivery: shipment.actualDelivery,
        createdAt: shipment.createdAt,
        orderItems: shipment.orderItems?.map(item => ({
          product: {
            name: item.product.name,
            sku: item.product.sku
          },
          quantity: item.quantity
        }))
      };
      
      res.json(publicData);
    } catch (error) {
      console.error('Error tracking shipment:', error);
      res.status(500).json({ 
        message: "Erro ao rastrear envio", 
        error: "Erro interno do servidor"
      });
    }
  }

  static async getShipmentHistory(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      
      if (!trackingNumber) {
        return res.status(400).json({ message: "Número de rastreamento é obrigatório" });
      }

      const history = await PublicTrackingModel.getShipmentHistory(trackingNumber);
      
      if (history.length === 0) {
        return res.status(404).json({ 
          message: "Número de rastreamento não encontrado",
          trackingNumber 
        });
      }
      
      res.json(history);
    } catch (error) {
      console.error('Error fetching shipment history:', error);
      res.status(500).json({ 
        message: "Erro ao buscar histórico do envio", 
        error: "Erro interno do servidor"
      });
    }
  }

  static async getShipmentStatus(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const status = await PublicTrackingModel.getShipmentStatus(trackingNumber);
      
      res.json({ trackingNumber, status });
    } catch (error) {
      console.error('Error getting shipment status:', error);
      res.status(500).json({
        message: "Erro ao buscar estado da encomenda",
        error: "Erro interno do servidor"
      });
    }
  }

  static async subscribeToNotifications(req: Request, res: Response) {
    try {
      const { trackingNumber, email, phone } = req.body;
      
      if (!trackingNumber || (!email && !phone)) {
        return res.status(400).json({
          message: "Número de rastreamento e pelo menos um contacto são obrigatórios"
        });
      }

      const subscription = await PublicTrackingModel.subscribeToNotifications({
        trackingNumber,
        email,
        phone,
        notificationTypes: ['status_update', 'delivery_notification']
      });
      
      res.status(201).json({
        message: "Subscrição de notificações criada com sucesso",
        subscription
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      res.status(500).json({
        message: "Erro ao criar subscrição de notificações",
        error: "Erro interno do servidor"
      });
    }
  }

  static async getEstimatedDelivery(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const delivery = await PublicTrackingModel.getEstimatedDelivery(trackingNumber);
      
      res.json({ trackingNumber, estimatedDelivery: delivery });
    } catch (error) {
      console.error('Error getting estimated delivery:', error);
      res.status(500).json({
        message: "Erro ao buscar previsão de entrega",
        error: "Erro interno do servidor"
      });
    }
  }

  static async getProductLocation(req: Request, res: Response) {
    try {
      const { barcode } = req.params;
      const location = await PublicTrackingModel.getProductLocation(barcode);
      
      if (!location) {
        return res.status(404).json({
          message: "Produto não encontrado"
        });
      }

      res.json({ barcode, location });
    } catch (error) {
      console.error('Error getting product location:', error);
      res.status(500).json({
        message: "Erro ao buscar localização do produto",
        error: "Erro interno do servidor"
      });
    }
  }

  static async getProductJourney(req: Request, res: Response) {
    try {
      const { barcode } = req.params;
      const journey = await PublicTrackingModel.getProductJourney(barcode);
      
      res.json({ barcode, journey });
    } catch (error) {
      console.error('Error getting product journey:', error);
      res.status(500).json({
        message: "Erro ao buscar jornada do produto",
        error: "Erro interno do servidor"
      });
    }
  }

  static async getBatchProducts(req: Request, res: Response) {
    try {
      const { batchNumber } = req.params;
      const products = await PublicTrackingModel.getBatchProducts(batchNumber);
      
      res.json({ batchNumber, products });
    } catch (error) {
      console.error('Error getting batch products:', error);
      res.status(500).json({
        message: "Erro ao buscar produtos do lote",
        error: "Erro interno do servidor"
      });
    }
  }

  static async getBatchStatus(req: Request, res: Response) {
    try {
      const { batchNumber } = req.params;
      const status = await PublicTrackingModel.getBatchStatus(batchNumber);
      
      res.json({ batchNumber, status });
    } catch (error) {
      console.error('Error getting batch status:', error);
      res.status(500).json({
        message: "Erro ao buscar estado do lote",
        error: "Erro interno do servidor"
      });
    }
  }
}