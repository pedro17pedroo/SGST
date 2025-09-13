import { Request, Response } from 'express';
import { db } from '../../database/db';
import { vehicles, vehicleMaintenance, gpsTracking, geofences, vehicleAssignments } from '../../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const createVehicleSchema = z.object({
  licensePlate: z.string().min(1, 'License plate is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().optional(),
  vehicleTypeId: z.string().min(1, 'Vehicle type ID is required'),
  capacity: z.string().optional(),
  fuelTypeId: z.string().min(1, 'Fuel type ID is required'),
  driverId: z.string().optional(),
  carrierId: z.string().min(1, 'Carrier ID is required'),
});

const updateVehicleSchema = createVehicleSchema.partial();

const createMaintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  type: z.enum(['routine', 'repair', 'inspection']),
  description: z.string().min(1, 'Description is required'),
  cost: z.string().optional(),
  scheduledDate: z.date().optional(),
  notes: z.string().optional(),
});

const gpsTrackingSchema = z.object({
  vehicleId: z.string().uuid(),
  latitude: z.string(),
  longitude: z.string(),
  speed: z.string().optional(),
  heading: z.string().optional(),
  altitude: z.string().optional(),
  accuracy: z.string().optional(),
});

const createGeofenceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  type: z.enum(['circle', 'polygon']),
  coordinates: z.object({}), // Will be validated based on type
  warehouseId: z.string().uuid().optional(),
});

const vehicleAssignmentSchema = z.object({
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  assignedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export class FleetController {
  // Vehicle Management
  static async getVehicles(req: Request, res: Response) {
    try {
      console.log('🚗 Iniciando busca de veículos...');
      const { status, type, driverId } = req.query;
      console.log('📋 Parâmetros de consulta:', { status, type, driverId });
      
      const conditions = [];
      
      if (status) {
        conditions.push(eq(vehicles.status, status as string));
      }
      
      if (type) {
        conditions.push(eq(vehicles.vehicleTypeId, type as string));
      }
      
      if (driverId) {
        conditions.push(eq(vehicles.driverId, driverId as string));
      }
      
      console.log('🔍 Executando consulta no banco de dados...');
      const result = conditions.length > 0 
        ? await db.select().from(vehicles).where(and(...conditions)).orderBy(desc(vehicles.createdAt))
        : await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
      
      console.log('✅ Consulta executada com sucesso. Resultados:', result.length);
      
      res.json({
        success: true,
        data: result,
        message: 'Veículos obtidos com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro detalhado ao buscar veículos:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace');
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar veículos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async createVehicle(req: Request, res: Response) {
    try {
      const validatedData = createVehicleSchema.parse(req.body);
      
      const [newVehicle] = await db.insert(vehicles).values({
        ...validatedData,
        status: 'available',
        isActive: true,
        currentLocation: 'Depot',
      }).$returningId();
      
      res.status(201).json({
        success: true,
        data: newVehicle,
        message: 'Veículo criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar veículo:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Falha ao criar veículo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async getVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Veículo não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: vehicle,
        message: 'Veículo obtido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar veículo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async updateVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateVehicleSchema.parse(req.body);
      
      await db.update(vehicles)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(vehicles.id, id));
      
      const [updatedVehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
      
      if (!updatedVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Veículo não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: updatedVehicle,
        message: 'Veículo atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Falha ao atualizar veículo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async deleteVehicle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await db.update(vehicles)
        .set({ isActive: false })
        .where(eq(vehicles.id, id));
      
      const [deletedVehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
      
      if (!deletedVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Veículo não encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Veículo removido com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover veículo:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao remover veículo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Vehicle Maintenance
  static async getVehicleMaintenance(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { status, type } = req.query;
      
      const conditions = [];
      
      if (vehicleId) {
        conditions.push(eq(vehicleMaintenance.vehicleId, vehicleId));
      }
      
      if (status) {
        conditions.push(eq(vehicleMaintenance.status, status as string));
      }
      
      if (type) {
        conditions.push(eq(vehicleMaintenance.type, type as string));
      }
      
      const result = conditions.length > 0
        ? await db.select().from(vehicleMaintenance).where(and(...conditions)).orderBy(desc(vehicleMaintenance.createdAt))
        : await db.select().from(vehicleMaintenance).orderBy(desc(vehicleMaintenance.createdAt));
      
      res.json({
        success: true,
        data: result,
        message: 'Registros de manutenção obtidos com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar manutenção de veículos:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar registros de manutenção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async createVehicleMaintenance(req: Request, res: Response) {
    try {
      const validatedData = createMaintenanceSchema.parse(req.body);
      
      const [newMaintenance] = await db.insert(vehicleMaintenance).values({
        ...validatedData,
      }).$returningId();
      
      res.status(201).json({
        success: true,
        data: newMaintenance,
        message: 'Registro de manutenção criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar manutenção de veículo:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Falha ao criar registro de manutenção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GPS Tracking
  static async getGpsTracking(req: Request, res: Response) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate, limit = '100' } = req.query;
      
      const conditions = [];
      
      if (vehicleId) {
        conditions.push(eq(gpsTracking.vehicleId, vehicleId));
      }
      
      // Add date filtering if provided
      if (startDate && endDate) {
        conditions.push(
          sql`${gpsTracking.timestamp} >= ${startDate}`,
          sql`${gpsTracking.timestamp} <= ${endDate}`
        );
      }
      
      const result = conditions.length > 0
        ? await db.select().from(gpsTracking).where(and(...conditions)).orderBy(desc(gpsTracking.timestamp)).limit(parseInt(limit as string))
        : await db.select().from(gpsTracking).orderBy(desc(gpsTracking.timestamp)).limit(parseInt(limit as string));
      
      res.json({
        success: true,
        data: result,
        message: 'Dados de rastreamento GPS obtidos com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar rastreamento GPS:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar dados de rastreamento GPS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async createGpsTracking(req: Request, res: Response) {
    try {
      const validatedData = gpsTrackingSchema.parse(req.body);
      
      const [newTracking] = await db.insert(gpsTracking).values({
        ...validatedData,
      }).$returningId();
      
      // Update vehicle's current location
      await db.update(vehicles)
        .set({
          currentLocation: {
            lat: validatedData.latitude,
            lng: validatedData.longitude,
            address: 'Localização GPS' // This could be enhanced with reverse geocoding
          },
          lastGpsUpdate: new Date()
        })
        .where(eq(vehicles.id, validatedData.vehicleId));
      
      res.status(201).json({
        success: true,
        data: newTracking,
        message: 'Dados de rastreamento GPS registrados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar rastreamento GPS:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Falha ao registrar dados de rastreamento GPS',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Vehicle Assignments
  static async getVehicleAssignments(req: Request, res: Response) {
    try {
      const { vehicleId, driverId, status } = req.query;
      
      const conditions = [];
      
      if (vehicleId) {
        conditions.push(eq(vehicleAssignments.vehicleId, vehicleId as string));
      }
      
      if (driverId) {
        conditions.push(eq(vehicleAssignments.driverId, driverId as string));
      }
      
      if (status) {
        conditions.push(eq(vehicleAssignments.status, status as string));
      }
      
      const result = conditions.length > 0
        ? await db.select().from(vehicleAssignments).where(and(...conditions)).orderBy(desc(vehicleAssignments.createdAt))
        : await db.select().from(vehicleAssignments).orderBy(desc(vehicleAssignments.createdAt));
      
      res.json({
        success: true,
        data: result,
        message: 'Atribuições de veículos obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar atribuições de veículos:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar atribuições de veículos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async createVehicleAssignment(req: Request, res: Response) {
    try {
      const validatedData = vehicleAssignmentSchema.parse(req.body);
      
      // Deactivate any existing assignments for this vehicle
      await db.update(vehicleAssignments)
        .set({ status: 'cancelled' })
        .where(and(
          eq(vehicleAssignments.vehicleId, validatedData.vehicleId),
          eq(vehicleAssignments.status, 'assigned')
        ));
      
      const [newAssignment] = await db.insert(vehicleAssignments).values({
        ...validatedData,
      }).$returningId();
      
      // Update vehicle's driver
      await db.update(vehicles)
        .set({ driverId: validatedData.driverId })
        .where(eq(vehicles.id, validatedData.vehicleId));
      
      res.status(201).json({
        success: true,
        data: newAssignment,
        message: 'Atribuição de veículo criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar atribuição de veículo:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Falha ao criar atribuição de veículo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Geofences
  static async getGeofences(req: Request, res: Response) {
    try {
      const { warehouseId, isActive } = req.query;
      
      const conditions = [];
      
      if (warehouseId) {
        conditions.push(eq(geofences.warehouseId, warehouseId as string));
      }
      
      if (isActive !== undefined) {
        conditions.push(eq(geofences.isActive, isActive === 'true'));
      }
      
      const result = conditions.length > 0
        ? await db.select().from(geofences).where(and(...conditions)).orderBy(desc(geofences.createdAt))
        : await db.select().from(geofences).orderBy(desc(geofences.createdAt));
      
      res.json({
        success: true,
        data: result,
        message: 'Geocercas obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar geocercas:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar geocercas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  static async createGeofence(req: Request, res: Response) {
    try {
      const validatedData = createGeofenceSchema.parse(req.body);
      
      const [newGeofence] = await db.insert(geofences).values({
        ...validatedData,
      }).$returningId();
      
      res.status(201).json({
        success: true,
        data: newGeofence,
        message: 'Geocerca criada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar geocerca:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Erro de validação',
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: 'Falha ao criar geocerca',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // Fleet Statistics
  static async getFleetStatistics(req: Request, res: Response) {
    try {
      // Total vehicles by status
      const vehiclesByStatus = await db.select({
        status: vehicles.status,
        count: sql<number>`count(*)`
      })
      .from(vehicles)
      .where(eq(vehicles.isActive, true))
      .groupBy(vehicles.status);

      // Total vehicles by type
      const vehiclesByType = await db.select({
        vehicleTypeId: vehicles.vehicleTypeId,
        count: sql<number>`count(*)`
      })
      .from(vehicles)
      .where(eq(vehicles.isActive, true))
      .groupBy(vehicles.vehicleTypeId);

      // Maintenance statistics
      const maintenanceStats = await db.select({
        status: vehicleMaintenance.status,
        count: sql<number>`count(*)`
      })
      .from(vehicleMaintenance)
      .groupBy(vehicleMaintenance.status);

      res.json({
        success: true,
        data: {
          vehiclesByStatus,
          vehiclesByType,
          maintenanceStats
        },
        message: 'Estatísticas da frota obtidas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas da frota:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao buscar estatísticas da frota',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}