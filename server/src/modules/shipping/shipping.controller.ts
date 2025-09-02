import { Request, Response } from 'express';
import { ShippingModel } from './shipping.model';

export class ShippingController {
  static async getShipments(req: Request, res: Response) {
    try {
      const shipments = await ShippingModel.getShipments();
      res.json(shipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      res.status(500).json({ 
        message: "Erro ao buscar envios", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shipment = await ShippingModel.getShipment(id);
      
      if (!shipment) {
        return res.status(404).json({ message: "Envio não encontrado" });
      }
      
      res.json(shipment);
    } catch (error) {
      console.error('Error fetching shipment:', error);
      res.status(500).json({ 
        message: "Erro ao buscar envio", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async trackShipment(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const shipment = await ShippingModel.getShipmentByTrackingNumber(trackingNumber);
      
      if (!shipment) {
        return res.status(404).json({ message: "Número de rastreamento não encontrado" });
      }
      
      res.json(shipment);
    } catch (error) {
      console.error('Error tracking shipment:', error);
      res.status(500).json({ 
        message: "Erro ao rastrear envio", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createShipment(req: Request, res: Response) {
    try {
      const shipment = await ShippingModel.createShipment(req.body);
      res.status(201).json(shipment);
    } catch (error) {
      console.error('Error creating shipment:', error);
      res.status(500).json({ 
        message: "Erro ao criar envio", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shipment = await ShippingModel.updateShipment(id, req.body);
      res.json(shipment);
    } catch (error) {
      console.error('Error updating shipment:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar envio", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async deleteShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ShippingModel.deleteShipment(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting shipment:', error);
      res.status(500).json({ 
        message: "Erro ao eliminar envio", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}