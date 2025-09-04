import { Request, Response } from 'express';
import { storage } from '../../storage/index';
import { 
  insertVehicleSchema, 
  insertVehicleMaintenanceSchema, 
  insertGpsTrackingSchema,
  insertVehicleAssignmentSchema, 
  insertGeofenceSchema,
  type GeofenceAlert,
  type GpsSession
} from '@shared/schema';
import { z } from 'zod';

export class FleetController {
  // ===== VEHICLE MANAGEMENT =====
  
  static async getVehicles(req: Request, res: Response) {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createVehicle(req: Request, res: Response) {
    try {
      console.log('=== DEBUG: Dados recebidos do frontend ===');
      console.log('req.body:', JSON.stringify(req.body, null, 2));
      
      const validatedData = insertVehicleSchema.parse(req.body);
      console.log('=== DEBUG: Dados após validação ===');
      console.log('validatedData.licensePlate:', JSON.stringify(validatedData.licensePlate));
      
      // Check if license plate already exists
      const existingVehicle = await storage.getVehicleByLicensePlate(validatedData.licensePlate);
      
      if (existingVehicle) {
        console.log('=== DEBUG: Matrícula já existe ===');
        console.log('Existing vehicle licensePlate:', JSON.stringify(existingVehicle.licensePlate));
        return res.status(400).json({ error: 'Matrícula já registrada' });
      }
      
      console.log('=== DEBUG: Criando novo veículo ===');
      const vehicle = await storage.createVehicle(validatedData);
      console.log('=== DEBUG: Veículo criado com sucesso ===');
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('=== DEBUG: Erro de validação Zod ===');
        console.log('Zod errors:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      
      const vehicle = await storage.updateVehicle(id, validatedData);
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await storage.deleteVehicle(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehiclesByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const vehicles = await storage.getVehiclesByStatus(status);
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles by status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getAvailableVehicles(req: Request, res: Response) {
    try {
      const vehicles = await storage.getAvailableVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== VEHICLE MAINTENANCE =====
  
  static async getVehicleMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const maintenance = await storage.getVehicleMaintenance(id);
      res.json(maintenance);
    } catch (error) {
      console.error('Error fetching vehicle maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createVehicleMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleMaintenanceSchema.parse({
        ...req.body,
        vehicleId: id
      });
      
      const maintenance = await storage.createVehicleMaintenance(validatedData);
      res.status(201).json(maintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating vehicle maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleMaintenanceSchema.partial().parse(req.body);
      
      const maintenance = await storage.updateMaintenance(id, validatedData);
      res.json(maintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getUpcomingMaintenance(req: Request, res: Response) {
    try {
      const maintenance = await storage.getUpcomingMaintenance();
      res.json(maintenance);
    } catch (error) {
      console.error('Error fetching upcoming maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GPS TRACKING =====
  
  static async trackGPS(req: Request, res: Response) {
    try {
      const validatedData = insertGpsTrackingSchema.parse(req.body);
      
      const tracking = await storage.trackGPS(validatedData);
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating GPS tracking:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicleLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const location = await storage.getVehicleCurrentLocation(id);
      
      if (!location) {
        return res.status(404).json({ error: 'Localização não encontrada' });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error fetching vehicle location:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicleLocationHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const history = await storage.getVehicleLocationHistory(id, {
        startDate: startDate as string,
        endDate: endDate as string
      });
      
      res.json(history);
    } catch (error) {
      console.error('Error fetching vehicle location history:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getAllVehicleLocations(req: Request, res: Response) {
    try {
      const locations = await storage.getAllVehicleLocations();
      res.json(locations);
    } catch (error) {
      console.error('Error fetching all vehicle locations:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateGPSStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const vehicle = await storage.updateGPSStatus(id, status);
      res.json(vehicle);
    } catch (error) {
      console.error('Error updating GPS status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== VEHICLE ASSIGNMENTS =====
  
  static async getAssignments(req: Request, res: Response) {
    try {
      const assignments = await storage.getVehicleAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignment = await storage.getAssignment(id);
      
      if (!assignment) {
        return res.status(404).json({ error: 'Atribuição não encontrada' });
      }
      
      res.json(assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createAssignment(req: Request, res: Response) {
    try {
      const validatedData = insertVehicleAssignmentSchema.parse(req.body);
      
      const assignment = await storage.createAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleAssignmentSchema.partial().parse(req.body);
      
      const assignment = await storage.updateAssignment(id, validatedData);
      res.json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating assignment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicleActiveAssignments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignments = await storage.getVehicleActiveAssignments(id);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching vehicle active assignments:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getDriverActiveAssignments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignments = await storage.getDriverActiveAssignments(id);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching driver active assignments:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GEOFENCING =====
  
  static async getGeofences(req: Request, res: Response) {
    try {
      const geofences = await storage.getGeofences();
      res.json(geofences);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getGeofence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const geofence = await storage.getGeofence(id);
      
      if (!geofence) {
        return res.status(404).json({ error: 'Geocerca não encontrada' });
      }
      
      res.json(geofence);
    } catch (error) {
      console.error('Error fetching geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createGeofence(req: Request, res: Response) {
    try {
      const validatedData = insertGeofenceSchema.parse(req.body);
      
      const geofence = await storage.createGeofence(validatedData);
      res.status(201).json(geofence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateGeofence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertGeofenceSchema.partial().parse(req.body);
      
      const geofence = await storage.updateGeofence(id, validatedData);
      res.json(geofence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async deleteGeofence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await storage.deleteGeofence(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveGeofences(req: Request, res: Response) {
    try {
      const geofences = await storage.getActiveGeofences();
      res.json(geofences);
    } catch (error) {
      console.error('Error fetching active geofences:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== FLEET STATISTICS =====
  
  static async getFleetStats(req: Request, res: Response) {
    try {
      const stats = {
        totalVehicles: 0,
        activeVehicles: 0,
        maintenanceVehicles: 0,
        availableVehicles: 0,
        totalAssignments: 0,
        activeGeofences: 0
      };
      res.json(stats);
    } catch (error) {
      console.error('Error fetching fleet statistics:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GEOFENCE ALERTS =====
  
  static async getGeofenceAlerts(req: Request, res: Response) {
    try {
      const alerts: GeofenceAlert[] = [];
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching geofence alerts:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createGeofenceAlert(req: Request, res: Response) {
    try {
      const alert = { id: Date.now().toString(), ...req.body };
      res.status(201).json(alert);
    } catch (error) {
      console.error('Error creating geofence alert:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async acknowledgeGeofenceAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const alert = { id, acknowledged: true, acknowledgedAt: new Date() };
      res.json(alert);
    } catch (error) {
      console.error('Error acknowledging geofence alert:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveGeofenceAlerts(req: Request, res: Response) {
    try {
      const alerts: GeofenceAlert[] = [];
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching active geofence alerts:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GPS SESSIONS =====
  
  static async createGPSSession(req: Request, res: Response) {
    try {
      const session = { id: Date.now().toString(), ...req.body, startTime: new Date() };
      res.status(201).json(session);
    } catch (error) {
      console.error('Error creating GPS session:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateGPSSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = { id, ...req.body, updatedAt: new Date() };
      res.json(session);
    } catch (error) {
      console.error('Error updating GPS session:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveGPSSessions(req: Request, res: Response) {
    try {
      const sessions: GpsSession[] = [];
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching active GPS sessions:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async endGPSSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = { id, endTime: new Date(), status: 'ended' };
      res.json(session);
    } catch (error) {
      console.error('Error ending GPS session:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

/* TODO: Descomentar quando as tabelas de fleet forem criadas
export class FleetController {
  // ===== VEHICLE MANAGEMENT =====
  
  static async getVehicles(req: Request, res: Response) {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createVehicle(req: Request, res: Response) {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      
      // Check if license plate already exists
      const existingVehicle = await storage.getVehicleByLicensePlate(validatedData.licensePlate);
      if (existingVehicle) {
        return res.status(400).json({ error: 'Matrícula já registrada' });
      }
      
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      
      const vehicle = await storage.updateVehicle(id, validatedData);
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await storage.deleteVehicle(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehiclesByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const vehicles = await storage.getVehiclesByStatus(status);
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles by status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getAvailableVehicles(req: Request, res: Response) {
    try {
      const vehicles = await storage.getAvailableVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== VEHICLE MAINTENANCE =====
  
  static async getVehicleMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const maintenance = await storage.getVehicleMaintenance(id);
      res.json(maintenance);
    } catch (error) {
      console.error('Error fetching vehicle maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createVehicleMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleMaintenanceSchema.parse({
        ...req.body,
        vehicleId: id
      });
      
      const maintenance = await storage.createVehicleMaintenance(validatedData);
      res.status(201).json(maintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating vehicle maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateVehicleMaintenance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleMaintenanceSchema.partial().parse(req.body);
      
      const maintenance = await storage.updateMaintenance(id, validatedData);
      res.json(maintenance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating vehicle maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getUpcomingMaintenance(req: Request, res: Response) {
    try {
      const maintenance = await storage.getUpcomingMaintenance();
      res.json(maintenance);
    } catch (error) {
      console.error('Error fetching upcoming maintenance:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GPS TRACKING =====
  
  static async createGpsTracking(req: Request, res: Response) {
    try {
      const validatedData = insertGpsTrackingSchema.parse(req.body);
      const tracking = await storage.createGpsTracking(validatedData);
      res.status(201).json(tracking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating GPS tracking:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicleCurrentLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const location = await storage.getVehicleCurrentLocation(id);
      
      if (!location) {
        return res.status(404).json({ error: 'Localização não encontrada' });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error fetching vehicle current location:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicleGpsHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { hours } = req.query;
      
      const history = await storage.getVehicleGpsHistory(id, hours ? parseInt(hours as string) : undefined);
      res.json(history);
    } catch (error) {
      console.error('Error fetching vehicle GPS history:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getAllVehicleLocations(req: Request, res: Response) {
    try {
      const locations = await storage.getAllVehicleLocations();
      res.json(locations);
    } catch (error) {
      console.error('Error fetching all vehicle locations:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateVehicleGpsStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      await storage.updateVehicleGpsStatus(id, isActive);
      res.status(204).send();
    } catch (error) {
      console.error('Error updating vehicle GPS status:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== VEHICLE ASSIGNMENTS =====
  
  static async getVehicleAssignments(req: Request, res: Response) {
    try {
      const assignments = await storage.getVehicleAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching vehicle assignments:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getVehicleAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignment = await storage.getVehicleAssignment(id);
      
      if (!assignment) {
        return res.status(404).json({ error: 'Atribuição não encontrada' });
      }
      
      res.json(assignment);
    } catch (error) {
      console.error('Error fetching vehicle assignment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createVehicleAssignment(req: Request, res: Response) {
    try {
      const validatedData = insertVehicleAssignmentSchema.parse(req.body);
      const assignment = await storage.createVehicleAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating vehicle assignment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateVehicleAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertVehicleAssignmentSchema.partial().parse(req.body);
      
      const assignment = await storage.updateVehicleAssignment(id, validatedData);
      res.json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating vehicle assignment:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveAssignmentsByVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignments = await storage.getActiveAssignmentsByVehicle(id);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching active assignments by vehicle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveAssignmentsByDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignments = await storage.getActiveAssignmentsByDriver(id);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching active assignments by driver:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GEOFENCING =====
  
  static async getGeofences(req: Request, res: Response) {
    try {
      const geofences = await storage.getGeofences();
      res.json(geofences);
    } catch (error) {
      console.error('Error fetching geofences:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getGeofence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const geofence = await storage.getGeofence(id);
      
      if (!geofence) {
        return res.status(404).json({ error: 'Geofence não encontrada' });
      }
      
      res.json(geofence);
    } catch (error) {
      console.error('Error fetching geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createGeofence(req: Request, res: Response) {
    try {
      const validatedData = insertGeofenceSchema.parse(req.body);
      const geofence = await storage.createGeofence(validatedData);
      res.status(201).json(geofence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateGeofence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertGeofenceSchema.partial().parse(req.body);
      
      const geofence = await storage.updateGeofence(id, validatedData);
      res.json(geofence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async deleteGeofence(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await storage.deleteGeofence(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting geofence:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveGeofences(req: Request, res: Response) {
    try {
      const geofences = await storage.getActiveGeofences();
      res.json(geofences);
    } catch (error) {
      console.error('Error fetching active geofences:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GEOFENCE ALERTS =====
  
  static async getGeofenceAlerts(req: Request, res: Response) {
    try {
      const alerts = await storage.getGeofenceAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching geofence alerts:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async createGeofenceAlert(req: Request, res: Response) {
    try {
      const validatedData = insertGeofenceAlertSchema.parse(req.body);
      const alert = await storage.createGeofenceAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating geofence alert:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async acknowledgeGeofenceAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { acknowledgedBy } = req.body;
      
      const alert = await storage.acknowledgeGeofenceAlert(id, acknowledgedBy);
      res.json(alert);
    } catch (error) {
      console.error('Error acknowledging geofence alert:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveGeofenceAlerts(req: Request, res: Response) {
    try {
      const alerts = await storage.getActiveGeofenceAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching active geofence alerts:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // ===== GPS SESSIONS =====
  
  static async createGpsSession(req: Request, res: Response) {
    try {
      const validatedData = insertGpsSessionSchema.parse(req.body);
      const session = await storage.createGpsSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error creating GPS session:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async updateGpsSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = insertGpsSessionSchema.partial().parse(req.body);
      
      const session = await storage.updateGpsSession(id, validatedData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      console.error('Error updating GPS session:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getActiveGpsSessions(req: Request, res: Response) {
    try {
      const sessions = await storage.getActiveGpsSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching active GPS sessions:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async endGpsSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await storage.endGpsSession(id);
      res.json(session);
    } catch (error) {
      console.error('Error ending GPS session:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
*/