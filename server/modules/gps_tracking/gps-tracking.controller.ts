import { Request, Response } from 'express';
import { GPSTrackingModel } from './gps-tracking.model.js';
import { z } from 'zod';

const locationUpdateSchema = z.object({
  deviceId: z.string().min(1, "ID do dispositivo é obrigatório"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  accuracy: z.number().min(0).optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  timestamp: z.string().optional()
});

const deviceSchema = z.object({
  name: z.string().min(1, "Nome do dispositivo é obrigatório"),
  type: z.enum(["smartphone", "tablet", "gps_tracker", "vehicle_tracker"]),
  imei: z.string().optional(),
  phoneNumber: z.string().optional(),
  userId: z.string().optional(),
  vehicleId: z.string().optional(),
  active: z.boolean().default(true)
});

const geofenceSchema = z.object({
  name: z.string().min(1, "Nome da geofence é obrigatório"),
  type: z.enum(["circular", "polygon"]),
  coordinates: z.array(z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  })),
  radius: z.number().min(0).optional(),
  alertOnEnter: z.boolean().default(true),
  alertOnExit: z.boolean().default(true),
  warehouseId: z.string().optional()
});

const routeOptimizationSchema = z.object({
  startLocation: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }),
  destinations: z.array(z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string(),
    priority: z.number().min(1).default(1)
  })),
  vehicleType: z.enum(["car", "truck", "van", "motorcycle"]).default("car"),
  optimize: z.enum(["time", "distance", "fuel"]).default("time")
});

export class GPSTrackingController {
  static async updateLocation(req: Request, res: Response) {
    try {
      const validated = locationUpdateSchema.parse(req.body);
      
      const location = await GPSTrackingModel.updateLocation({
        ...validated,
        timestamp: validated.timestamp ? new Date(validated.timestamp) : new Date(),
        receivedAt: new Date()
      });
      
      // Check for geofence violations
      const alerts = await GPSTrackingModel.checkGeofenceViolations(
        validated.deviceId,
        validated.latitude,
        validated.longitude
      );
      
      res.status(201).json({
        message: "Localização atualizada com sucesso",
        location,
        alerts: alerts.length > 0 ? alerts : undefined
      });
    } catch (error) {
      console.error('Error updating location:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar localização",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getLocation(req: Request, res: Response) {
    try {
      const { trackingId } = req.params;
      
      const location = await GPSTrackingModel.getCurrentLocation(trackingId);
      
      if (!location) {
        return res.status(404).json({ message: "Localização não encontrada" });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error getting location:', error);
      res.status(500).json({
        message: "Erro ao buscar localização",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getLocationHistory(req: Request, res: Response) {
    try {
      const { trackingId } = req.params;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const history = await GPSTrackingModel.getLocationHistory(trackingId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit
      });
      
      res.json(history);
    } catch (error) {
      console.error('Error getting location history:', error);
      res.status(500).json({
        message: "Erro ao buscar histórico de localização",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async registerDevice(req: Request, res: Response) {
    try {
      const validated = deviceSchema.parse(req.body);
      
      const device = await GPSTrackingModel.registerDevice({
        ...validated,
        registeredAt: new Date(),
        registeredByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      res.status(201).json({
        message: "Dispositivo registrado com sucesso",
        device
      });
    } catch (error) {
      console.error('Error registering device:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao registrar dispositivo",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async listDevices(req: Request, res: Response) {
    try {
      const active = req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined;
      const type = req.query.type as string;
      
      const devices = await GPSTrackingModel.listDevices({ active, type });
      
      res.json(devices);
    } catch (error) {
      console.error('Error listing devices:', error);
      res.status(500).json({
        message: "Erro ao listar dispositivos",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const validated = deviceSchema.partial().parse(req.body);
      
      const device = await GPSTrackingModel.updateDevice(deviceId, {
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      if (!device) {
        return res.status(404).json({ message: "Dispositivo não encontrado" });
      }
      
      res.json({
        message: "Dispositivo atualizado com sucesso",
        device
      });
    } catch (error) {
      console.error('Error updating device:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar dispositivo",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteDevice(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      
      const result = await GPSTrackingModel.deleteDevice(deviceId);
      
      if (!result.success) {
        return res.status(404).json({ message: "Dispositivo não encontrado" });
      }
      
      res.json({ message: "Dispositivo eliminado com sucesso" });
    } catch (error) {
      console.error('Error deleting device:', error);
      res.status(500).json({
        message: "Erro ao eliminar dispositivo",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async createGeofence(req: Request, res: Response) {
    try {
      const validated = geofenceSchema.parse(req.body);
      
      const geofence = await GPSTrackingModel.createGeofence({
        ...validated,
        createdAt: new Date(),
        createdByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      res.status(201).json({
        message: "Geofence criada com sucesso",
        geofence
      });
    } catch (error) {
      console.error('Error creating geofence:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao criar geofence",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async listGeofences(req: Request, res: Response) {
    try {
      const warehouseId = req.query.warehouseId as string;
      
      const geofences = await GPSTrackingModel.listGeofences({ warehouseId });
      
      res.json(geofences);
    } catch (error) {
      console.error('Error listing geofences:', error);
      res.status(500).json({
        message: "Erro ao listar geofences",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateGeofence(req: Request, res: Response) {
    try {
      const { geofenceId } = req.params;
      const validated = geofenceSchema.partial().parse(req.body);
      
      const geofence = await GPSTrackingModel.updateGeofence(geofenceId, {
        ...validated,
        updatedAt: new Date(),
        updatedByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      if (!geofence) {
        return res.status(404).json({ message: "Geofence não encontrada" });
      }
      
      res.json({
        message: "Geofence atualizada com sucesso",
        geofence
      });
    } catch (error) {
      console.error('Error updating geofence:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao atualizar geofence",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async deleteGeofence(req: Request, res: Response) {
    try {
      const { geofenceId } = req.params;
      
      const result = await GPSTrackingModel.deleteGeofence(geofenceId);
      
      if (!result.success) {
        return res.status(404).json({ message: "Geofence não encontrada" });
      }
      
      res.json({ message: "Geofence eliminada com sucesso" });
    } catch (error) {
      console.error('Error deleting geofence:', error);
      res.status(500).json({
        message: "Erro ao eliminar geofence",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async getGPSAlerts(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const deviceId = req.query.deviceId as string;
      
      const alerts = await GPSTrackingModel.getGPSAlerts({ status, deviceId });
      
      res.json(alerts);
    } catch (error) {
      console.error('Error getting GPS alerts:', error);
      res.status(500).json({
        message: "Erro ao buscar alertas GPS",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async acknowledgeAlert(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      
      const alert = await GPSTrackingModel.acknowledgeAlert(alertId, {
        acknowledgedAt: new Date(),
        acknowledgedByUserId: 'current-user-id' // TODO: Get from auth context
      });
      
      if (!alert) {
        return res.status(404).json({ message: "Alerta não encontrado" });
      }
      
      res.json({
        message: "Alerta reconhecido com sucesso",
        alert
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({
        message: "Erro ao reconhecer alerta",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async optimizeRoute(req: Request, res: Response) {
    try {
      const validated = routeOptimizationSchema.parse(req.body);
      
      const optimizedRoute = await GPSTrackingModel.optimizeRoute(validated);
      
      res.json({
        message: "Rota otimizada com sucesso",
        route: optimizedRoute
      });
    } catch (error) {
      console.error('Error optimizing route:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors
        });
      } else {
        res.status(500).json({
          message: "Erro ao otimizar rota",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  static async getRoute(req: Request, res: Response) {
    try {
      const { routeId } = req.params;
      
      const route = await GPSTrackingModel.getRoute(routeId);
      
      if (!route) {
        return res.status(404).json({ message: "Rota não encontrada" });
      }
      
      res.json(route);
    } catch (error) {
      console.error('Error getting route:', error);
      res.status(500).json({
        message: "Erro ao buscar rota",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}