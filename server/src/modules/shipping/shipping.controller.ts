import { Request, Response } from 'express';
import { ShippingModel } from './shipping.model';
import { FleetStorage } from '../../storage/modules/fleet';

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
      // Converter estimatedDelivery de string para Date se fornecido
      const shipmentData = { ...req.body };
      if (shipmentData.estimatedDelivery && typeof shipmentData.estimatedDelivery === 'string') {
        shipmentData.estimatedDelivery = new Date(shipmentData.estimatedDelivery);
      }
      
      // Remove o shipmentNumber dos dados se fornecido, pois será gerado automaticamente
      delete shipmentData.shipmentNumber;
      
      const shipment = await ShippingModel.createShipment(shipmentData);
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
      // Converter estimatedDelivery de string para Date se fornecido
      const shipmentData = { ...req.body };
      if (shipmentData.estimatedDelivery && typeof shipmentData.estimatedDelivery === 'string') {
        shipmentData.estimatedDelivery = new Date(shipmentData.estimatedDelivery);
      }
      
      const shipment = await ShippingModel.updateShipment(id, shipmentData);
      res.json(shipment);
    } catch (error) {
      console.error('Error updating shipment:', error);
      res.status(500).json({ 
        message: "Erro ao atualizar envio", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getAvailableVehicles(req: Request, res: Response) {
    try {
      const fleetStorage = new FleetStorage();
      const vehicles = await fleetStorage.getAvailableVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      res.status(500).json({ 
        message: "Erro ao buscar veículos disponíveis", 
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

  static async getActiveShipments(req: Request, res: Response) {
    try {
      const allShipments = await ShippingModel.getShipments();
      // TODO: Filtrar por status quando o campo for adicionado ao modelo
      const activeShipments = allShipments.filter((shipment: any) => 
        shipment.status === 'active' || shipment.status === 'in_transit' || !shipment.status
      );
      res.json(activeShipments);
    } catch (error) {
      console.error('Error fetching active shipments:', error);
      res.status(500).json({ 
        message: "Erro ao buscar envios ativos", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getCarriers(req: Request, res: Response) {
    try {
      // TODO: Implementar quando a tabela de carriers for criada
      const carriers = [
        { id: '1', name: 'DHL Angola', code: 'DHL', active: true },
        { id: '2', name: 'Fedex Angola', code: 'FEDEX', active: true },
        { id: '3', name: 'Correios de Angola', code: 'CDA', active: true },
        { id: '4', name: 'Transportadora Local', code: 'TL', active: true }
      ];
      res.json(carriers);
    } catch (error) {
      console.error('Error fetching carriers:', error);
      res.status(500).json({ 
        message: "Erro ao buscar transportadoras", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createCarrier(req: Request, res: Response) {
    try {
      // TODO: Implementar quando a tabela de carriers for criada
      const carrier = { id: Date.now().toString(), ...req.body, active: true };
      res.status(201).json(carrier);
    } catch (error) {
      console.error('Error creating carrier:', error);
      res.status(500).json({ 
        message: "Erro ao criar transportadora", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}