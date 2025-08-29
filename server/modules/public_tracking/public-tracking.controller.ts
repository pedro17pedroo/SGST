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
}